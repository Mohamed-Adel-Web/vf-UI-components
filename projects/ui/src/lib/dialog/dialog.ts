import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import type { ComponentType } from '@angular/cdk/portal';
import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Directive,
  effect,
  inject,
  Injectable,
  input,
  model,
  output,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { MODAL_SURFACE_CONTEXT, ModalSurface, type ModalSurfaceOptions } from './modal-surface';
import { cn } from '../utils/cn';
import {
  DIALOG_WIDTHS,
  dialogBodyVariants,
  dialogCloseIconVariants,
  dialogDescriptionVariants,
  dialogFooterVariants,
  dialogHeaderVariants,
  dialogTitleVariants,
  type DialogSize,
} from './dialog.variants';

export { DIALOG_DATA, DialogRef };

export interface VfDialogOptions<D = unknown> extends Omit<
  ModalSurfaceOptions<D>,
  'placement' | 'maxWidth'
> {
  size?: DialogSize;
}

/**
 * Imperative API for dialogs whose content is its own component:
 *
 * ```ts
 * const ref = inject(VfDialog).open<boolean>(SuspendLineDialog, { data: line, role: 'alertdialog' });
 * ref.closed.subscribe((confirmed) => ...);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class VfDialog {
  private readonly surface = inject(ModalSurface);

  open<R = unknown, D = unknown, C = unknown>(
    content: ComponentType<C> | TemplateRef<C>,
    { size = 'md', ...options }: VfDialogOptions<D> = {},
  ): DialogRef<R, C> {
    return this.surface.open<R, D, C>(content, {
      ...options,
      placement: 'center',
      maxWidth: DIALOG_WIDTHS[size],
    });
  }
}

/** What the template receives: `<ng-template vfDialog let-ref="dialogRef">`. */
export interface DialogTemplateContext<D = unknown> {
  $implicit: D;
  dialogRef: DialogRef<unknown, unknown>;
}

/**
 * Declarative API for inline dialogs, usually confirmations:
 *
 * ```html
 * <ng-template vfDialog [(open)]="confirmOpen" role="alertdialog" (closed)="onClosed($event)">
 *   ...
 * </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[vfDialog]',
  exportAs: 'vfDialog',
})
export class DialogTemplateDirective<R = unknown> {
  private readonly dialog = inject(VfDialog);
  private readonly templateRef = inject<TemplateRef<DialogTemplateContext>>(TemplateRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly open = model(false);
  readonly size = input<DialogSize>('md');
  readonly role = input<'dialog' | 'alertdialog'>('dialog');
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input<string>();
  readonly autoFocus = input<VfDialogOptions['autoFocus']>();
  readonly panelClass = input<string>('');

  /** Emits the value the dialog was closed with (`undefined` for Escape/backdrop). */
  readonly closed = output<R | undefined>();

  private ref: DialogRef<R, unknown> | null = null;

  static ngTemplateContextGuard(
    _dir: DialogTemplateDirective<unknown>,
    _ctx: unknown,
  ): _ctx is DialogTemplateContext {
    return true;
  }

  constructor() {
    effect(() => {
      const open = this.open();
      untracked(() => (open ? this.show() : this.ref?.close()));
    });

    inject(DestroyRef).onDestroy(() => this.ref?.close());
  }

  private show(): void {
    if (this.ref) {
      return;
    }
    const ref = this.dialog.open<R, unknown, unknown>(this.templateRef, {
      size: this.size(),
      role: this.role(),
      dismissible: this.dismissible(),
      ariaLabel: this.ariaLabel(),
      autoFocus: this.autoFocus(),
      panelClass: this.panelClass(),
      viewContainerRef: this.viewContainerRef,
    });
    this.ref = ref;

    ref.closed.subscribe((result) => {
      this.ref = null;
      this.open.set(false);
      this.closed.emit(result);
    });
  }
}

@Component({
  selector: 'vf-dialog-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { '[class]': 'hostClass()' },
})
export class DialogHeaderComponent {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly hostClass = computed(() => cn(dialogHeaderVariants(), this.userClass()));
}

/** Put on the heading. It becomes the dialog's accessible name automatically. */
@Directive({
  selector: '[vfDialogTitle]',
  host: {
    '[id]': 'id',
    '[class]': 'hostClass()',
  },
})
export class DialogTitleDirective {
  protected readonly id = inject(MODAL_SURFACE_CONTEXT, { optional: true })?.titleId ?? null;

  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly hostClass = computed(() => cn(dialogTitleVariants(), this.userClass()));
}

/** Put on supporting text. It becomes the dialog's accessible description. */
@Directive({
  selector: '[vfDialogDescription]',
  host: {
    '[id]': 'id',
    '[class]': 'hostClass()',
  },
})
export class DialogDescriptionDirective {
  private readonly context = inject(MODAL_SURFACE_CONTEXT, { optional: true });
  private readonly dialogRef = inject(DialogRef, { optional: true });

  protected readonly id = this.context?.descriptionId ?? null;

  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly hostClass = computed(() => cn(dialogDescriptionVariants(), this.userClass()));

  constructor() {
    const id = this.id;
    const container = (): Element | null =>
      this.dialogRef?.overlayRef.overlayElement.querySelector('.cdk-dialog-container') ?? null;

    if (!id) {
      return;
    }

    // CDK only binds aria-describedby from config, which is fixed before content exists.
    // Its binding stays null, so Angular never rewrites what is set here.
    afterNextRender(() => container()?.setAttribute('aria-describedby', id));
    inject(DestroyRef).onDestroy(() => {
      const el = container();
      if (el?.getAttribute('aria-describedby') === id) {
        el.removeAttribute('aria-describedby');
      }
    });
  }
}

@Component({
  selector: 'vf-dialog-body',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { '[class]': 'hostClass()' },
})
export class DialogBodyComponent {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly hostClass = computed(() => cn(dialogBodyVariants(), this.userClass()));
}

@Component({
  selector: 'vf-dialog-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { '[class]': 'hostClass()' },
})
export class DialogFooterComponent {
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly hostClass = computed(() => cn(dialogFooterVariants(), this.userClass()));
}

/**
 * Closes the enclosing dialog with an optional result:
 * `<button vfDialogClose>Cancel</button>`, `<button [vfDialogClose]="true">Suspend line</button>`.
 * Styling is left to your button component.
 */
@Directive({
  selector: 'button[vfDialogClose]',
  host: {
    type: 'button',
    '(click)': 'close()',
  },
})
export class DialogCloseDirective {
  private readonly dialogRef = inject(DialogRef);

  readonly result = input<unknown>(undefined, { alias: 'vfDialogClose' });

  protected close(): void {
    // The bare attribute binds an empty string; treat it as "no result".
    const result = this.result();
    this.dialogRef.close(result === '' ? undefined : result);
  }
}

/** Ready-made "×" for the header. Pass a translated `label` on Arabic pages. */
@Component({
  selector: 'button[vfDialogCloseIcon]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [DialogCloseDirective],
  template: `
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      class="size-5"
      aria-hidden="true"
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  `,
  host: {
    '[attr.aria-label]': 'label()',
    '[class]': 'hostClass()',
  },
})
export class DialogCloseIconComponent {
  readonly label = input('Close');
  readonly userClass = input<string>('', { alias: 'class' });
  protected readonly hostClass = computed(() => cn(dialogCloseIconVariants(), this.userClass()));
}

export const DIALOG_PARTS = [
  DialogTemplateDirective,
  DialogHeaderComponent,
  DialogTitleDirective,
  DialogDescriptionDirective,
  DialogBodyComponent,
  DialogFooterComponent,
  DialogCloseDirective,
  DialogCloseIconComponent,
] as const;
