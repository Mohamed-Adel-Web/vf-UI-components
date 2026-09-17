import { Dialog, type DialogConfig, type DialogRef } from '@angular/cdk/dialog';
import { createGlobalPositionStrategy, type PositionStrategy } from '@angular/cdk/overlay';
import type { ComponentType } from '@angular/cdk/portal';
import {
  afterNextRender,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  type StaticProvider,
  type TemplateRef,
  type ViewContainerRef,
} from '@angular/core';
import { cn } from '../utils/cn';
import { backdropVariants, modalSurfaceVariants, type ModalPlacement } from './overlay.variants';

export type { ModalPlacement };

export interface ModalSurfaceOptions<D = unknown> {
  data?: D;
  /** `center` for dialogs, `start`/`end` for drawers, `bottom` for sheets. */
  placement?: ModalPlacement;
  /** Use `alertdialog` for confirmations that interrupt the user (destructive actions). */
  role?: 'dialog' | 'alertdialog';
  /** Escape and backdrop clicks close the surface. Turn off for flows that must be completed. */
  dismissible?: boolean;
  /** Only when there is no visible title. Otherwise render a `vfDialogTitle`. */
  ariaLabel?: string;
  /** Where focus lands on open. `dialog` suits confirmations; forms want `first-tabbable`. */
  autoFocus?: 'first-tabbable' | 'first-heading' | 'dialog';
  /** CSS max inline size for `center`/`start`/`end`, e.g. `32rem`. */
  maxWidth?: string;
  /** Merged onto the overlay pane via tailwind-merge. */
  panelClass?: string;
  backdropClass?: string;
  /** Pass the caller's so injected services and template DI resolve from there. */
  viewContainerRef?: ViewContainerRef;
  injector?: Injector;
  providers?: StaticProvider[];
}

/** Ids the title/description parts use, so the dialog is labelled without manual wiring. */
export interface ModalSurfaceContext {
  readonly titleId: string;
  readonly descriptionId: string;
  readonly labelledByTitle: boolean;
}

export const MODAL_SURFACE_CONTEXT = new InjectionToken<ModalSurfaceContext>('ModalSurfaceContext');

let nextSurfaceId = 0;

/**
 * The one place modal behaviour is configured: focus trap and restore, scroll lock,
 * Escape/backdrop dismissal, `aria-modal`, labelling and placement. Dialog, Drawer and
 * any future sheet are thin wrappers over this, so a11y fixes land everywhere at once.
 */
@Injectable({ providedIn: 'root' })
export class ModalSurface {
  private readonly dialog = inject(Dialog);
  private readonly injector = inject(Injector);

  open<R = unknown, D = unknown, C = unknown>(
    content: ComponentType<C> | TemplateRef<C>,
    options: ModalSurfaceOptions<D> = {},
  ): DialogRef<R, C> {
    const placement = options.placement ?? 'center';
    const id = `vf-modal-${nextSurfaceId++}`;
    const context: ModalSurfaceContext = {
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      labelledByTitle: !options.ariaLabel,
    };

    const config: DialogConfig<D, DialogRef<R, C>> = {
      id,
      data: options.data,
      role: options.role ?? 'dialog',
      ariaModal: true,
      ariaLabel: options.ariaLabel ?? null,
      ariaLabelledBy: options.ariaLabel ? null : context.titleId,
      disableClose: options.dismissible === false,
      autoFocus: options.autoFocus ?? 'first-tabbable',
      restoreFocus: true,
      closeOnNavigation: true,
      viewContainerRef: options.viewContainerRef,
      injector: options.injector,
      providers: [
        { provide: MODAL_SURFACE_CONTEXT, useValue: context },
        ...(options.providers ?? []),
      ],
      panelClass: toClassList(cn(modalSurfaceVariants({ placement }), options.panelClass)),
      backdropClass: toClassList(cn(backdropVariants(), options.backdropClass)),
      ...sizeFor(placement, options.maxWidth),
      positionStrategy: this.positionFor(placement),
    };

    const ref = this.dialog.open<R, D, C>(content, config);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      this.warnIfUnlabelled(ref.id, context);
    }

    return ref;
  }

  private positionFor(placement: ModalPlacement): PositionStrategy | undefined {
    const strategy = createGlobalPositionStrategy(this.injector);
    switch (placement) {
      case 'center':
        return undefined; // CDK's default: centred in the viewport.
      case 'start':
        return strategy.top('0').start('0');
      case 'end':
        return strategy.top('0').end('0');
      case 'bottom':
        return strategy.bottom('0').centerHorizontally();
    }
  }

  private warnIfUnlabelled(dialogId: string, context: ModalSurfaceContext): void {
    if (!context.labelledByTitle) {
      return;
    }
    afterNextRender(
      () => {
        if (!document.getElementById(context.titleId)) {
          console.warn(
            `[vf] Modal "${dialogId}" has no accessible name. Add an element with ` +
              '`vfDialogTitle`, or pass `ariaLabel` when there is no visible title.',
          );
        }
      },
      { injector: this.injector },
    );
  }
}

// Sizes go through the overlay config because CDK writes them as inline styles,
// which would beat any max-width utility class on the pane.
function sizeFor(
  placement: ModalPlacement,
  maxWidth = '32rem',
): Pick<DialogConfig, 'width' | 'height' | 'maxWidth' | 'maxHeight'> {
  switch (placement) {
    case 'center':
      return {
        width: '100%',
        maxWidth: `min(${maxWidth}, calc(100vw - 2rem))`,
        maxHeight: 'calc(100dvh - 2rem)',
      };
    case 'start':
    case 'end':
      return { width: '100%', height: '100dvh', maxWidth: `min(${maxWidth}, 100vw)` };
    case 'bottom':
      return { width: '100%', maxWidth: '100vw', maxHeight: '90dvh' };
  }
}

function toClassList(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}
