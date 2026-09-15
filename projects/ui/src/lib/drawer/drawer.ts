import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { cn } from '../utils/cn';
import { drawerPanelVariants, type DrawerSide, type DrawerSize } from './drawer.variants';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// Shared across instances so nested/sibling drawers don't fight over body scroll lock.
let openDrawerCount = 0;

@Component({
  selector: 'vf-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="backdropClass()" aria-hidden="true" (click)="onBackdropClick()"></div>
    <div
      #panel
      [class]="panelClass()"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="ariaLabel() ?? null"
      [attr.aria-labelledby]="ariaLabelledBy() ?? null"
      tabindex="-1"
      (keydown)="onPanelKeydown($event)"
    >
      <ng-content select="[vfDrawerHeader]" />
      <div class="min-h-0 flex-1 overflow-y-auto">
        <ng-content />
      </div>
      <ng-content select="[vfDrawerFooter]" />
    </div>
  `,
  host: {
    '[attr.inert]': '!open() ? "" : null',
  },
})
export class DrawerComponent {
  readonly open = input(false);
  readonly side = input<DrawerSide>('end');
  readonly size = input<DrawerSize>('md');
  readonly closeOnBackdropClick = input(true, { alias: 'closeOnBackdrop' });
  readonly closeOnEscape = input(true);
  readonly ariaLabel = input<string>();
  readonly ariaLabelledBy = input<string>();

  /** Escape hatch: consumer classes are merged last so they override the panel defaults. */
  readonly panelClassInput = input<string>('', { alias: 'class' });

  readonly closed = output<void>();

  private readonly document = inject(DOCUMENT);
  private readonly panelRef = viewChild.required<ElementRef<HTMLElement>>('panel');
  private previouslyFocused: HTMLElement | null = null;

  protected readonly backdropClass = computed(() =>
    cn(
      'drawer-backdrop-transition bg-ink-950/60 fixed inset-0 z-40',
      this.open() ? 'opacity-100' : 'pointer-events-none opacity-0',
    ),
  );

  protected readonly panelClass = computed(() =>
    cn(
      drawerPanelVariants({ side: this.side(), size: this.size() }),
      // The panel floats `end-4`/`start-4` off the edge, so translating by exactly
      // 100% only brings it flush with the edge, not past it — add that gap back.
      this.open()
        ? 'translate-x-0'
        : this.side() === 'end'
          ? 'translate-x-[calc(100%+1rem)]'
          : '-translate-x-[calc(100%+1rem)]',
      this.panelClassInput(),
    ),
  );

  constructor() {
    effect(() => {
      if (this.open()) {
        openDrawerCount += 1;
        this.document.body.style.overflow = 'hidden';
        this.previouslyFocused = this.document.activeElement as HTMLElement | null;
        queueMicrotask(() => this.focusPanel());
      } else if (this.previouslyFocused) {
        this.releaseScrollLock();
        this.previouslyFocused.focus();
        this.previouslyFocused = null;
      }
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.open()) {
        this.releaseScrollLock();
      }
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscapeKeydown(): void {
    if (this.open() && this.closeOnEscape()) {
      this.closed.emit();
    }
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdropClick()) {
      this.closed.emit();
    }
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const focusables = Array.from(
      this.panelRef().nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = this.document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusPanel(): void {
    const panel = this.panelRef().nativeElement;
    const target = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? panel;
    target.focus();
  }

  private releaseScrollLock(): void {
    openDrawerCount = Math.max(0, openDrawerCount - 1);
    if (openDrawerCount === 0) {
      this.document.body.style.overflow = '';
    }
  }
}
