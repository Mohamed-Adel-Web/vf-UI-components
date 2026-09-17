import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  createGlobalPositionStrategy,
  createOverlayRef,
  type OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  PLATFORM_ID,
  type Provider,
  signal,
} from '@angular/core';
import {
  toastActionVariants,
  toastDismissVariants,
  toastIconVariants,
  toastVariants,
  toastViewportVariants,
  type ToastTone,
} from './toast.variants';

export type { ToastTone };

export type ToastPosition =
  'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

export interface VfToastConfig {
  position: ToastPosition;
  /** Milliseconds a toast stays up. Errors and toasts with an action stay until dismissed. */
  duration: number;
  /** Older toasts wait off-screen, with their timers paused, until there is room. */
  maxVisible: number;
  /** Landmark name. Translate it on Arabic pages. */
  regionLabel: string;
  dismissLabel: string;
}

const DEFAULT_TOAST_CONFIG: VfToastConfig = {
  position: 'bottom-end',
  duration: 5000,
  maxVisible: 3,
  regionLabel: 'Notifications',
  dismissLabel: 'Dismiss notification',
};

export const VF_TOAST_CONFIG = new InjectionToken<VfToastConfig>('VfToastConfig', {
  providedIn: 'root',
  factory: () => DEFAULT_TOAST_CONFIG,
});

/**
 * ```ts
 * provideVfToast({ position: 'top-center' })
 * // Or with a factory, which runs in an injection context:
 * provideVfToast(() => inject(LOCALE_ID).startsWith('ar') ? { regionLabel: 'الإشعارات', dismissLabel: 'إغلاق الإشعار' } : {})
 * ```
 */
export function provideVfToast(
  config: Partial<VfToastConfig> | (() => Partial<VfToastConfig>),
): Provider {
  return {
    provide: VF_TOAST_CONFIG,
    useFactory: () => ({
      ...DEFAULT_TOAST_CONFIG,
      ...(typeof config === 'function' ? config() : config),
    }),
  };
}

export interface ToastAction {
  /** Name the result, not the mechanism: "Undo", "View invoice". */
  label: string;
  run: () => void;
}

export interface ToastOptions {
  title?: string;
  tone?: ToastTone;
  /** Milliseconds; `Infinity` keeps it until dismissed. */
  duration?: number;
  action?: ToastAction;
  dismissible?: boolean;
}

export interface ToastItem {
  readonly id: number;
  readonly message: string;
  readonly title?: string;
  readonly tone: ToastTone;
  readonly duration: number;
  readonly action?: ToastAction;
  readonly dismissible: boolean;
}

export interface ToastHandle {
  readonly id: number;
  dismiss(): void;
}

type PauseReason = 'hover' | 'focus' | 'hidden' | 'manual';

interface ToastTimer {
  remaining: number;
  startedAt: number;
  handle: ReturnType<typeof setTimeout> | undefined;
}

/**
 * ```ts
 * private readonly toast = inject(VfToast);
 * this.toast.success('Plan updated');
 * this.toast.error('Payment failed. Check the card details and try again.', { title: 'Card declined' });
 * this.toast.show('Line suspended', { action: { label: 'Undo', run: () => this.resume(line) } });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class VfToast {
  private readonly injector = inject(Injector);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly config = inject(VF_TOAST_CONFIG);

  private readonly queue = signal<readonly ToastItem[]>([]);
  /** The newest `maxVisible` toasts, oldest first. */
  readonly visible = computed(() => this.queue().slice(-this.config.maxVisible));

  private readonly timers = new Map<number, ToastTimer>();
  private readonly pauseReasons = new Set<PauseReason>();
  private viewport: OverlayRef | null = null;
  private nextId = 0;

  private readonly onVisibilityChange = (): void =>
    document.hidden ? this.pause('hidden') : this.resume('hidden');

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.dismissAll();
      this.viewport?.dispose();
      if (this.isBrowser) {
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
      }
    });
  }

  show(message: string, options: ToastOptions = {}): ToastHandle {
    const tone = options.tone ?? 'neutral';
    // Errors need reading and actions need time to reach (WCAG 2.2.1), so neither expires.
    const persistent = tone === 'error' || options.action !== undefined;
    const item: ToastItem = {
      id: this.nextId++,
      message,
      title: options.title,
      tone,
      action: options.action,
      dismissible: options.dismissible ?? true,
      duration: options.duration ?? (persistent ? Infinity : this.config.duration),
    };
    const handle: ToastHandle = { id: item.id, dismiss: () => this.dismiss(item.id) };

    if (!this.isBrowser) {
      return handle;
    }

    this.ensureViewport();
    this.queue.update((queue) => [...queue, item]);
    this.syncTimers();

    // The live region already exists in the page, so this is announced reliably;
    // freshly inserted aria-live nodes often aren't.
    const text = item.title ? `${item.title}. ${message}` : message;
    void this.announcer.announce(text, tone === 'error' ? 'assertive' : 'polite');

    return handle;
  }

  success(message: string, options?: Omit<ToastOptions, 'tone'>): ToastHandle {
    return this.show(message, { ...options, tone: 'success' });
  }

  error(message: string, options?: Omit<ToastOptions, 'tone'>): ToastHandle {
    return this.show(message, { ...options, tone: 'error' });
  }

  warning(message: string, options?: Omit<ToastOptions, 'tone'>): ToastHandle {
    return this.show(message, { ...options, tone: 'warning' });
  }

  info(message: string, options?: Omit<ToastOptions, 'tone'>): ToastHandle {
    return this.show(message, { ...options, tone: 'info' });
  }

  dismiss(id: number): void {
    this.stopTimer(id);
    this.timers.delete(id);
    this.queue.update((queue) => queue.filter((toast) => toast.id !== id));
    this.syncTimers();
  }

  dismissAll(): void {
    for (const id of this.timers.keys()) {
      this.stopTimer(id);
    }
    this.timers.clear();
    this.queue.set([]);
  }

  pause(reason: PauseReason = 'manual'): void {
    this.pauseReasons.add(reason);
    for (const id of this.timers.keys()) {
      this.stopTimer(id);
    }
  }

  resume(reason: PauseReason = 'manual'): void {
    this.pauseReasons.delete(reason);
    this.syncTimers();
  }

  private syncTimers(): void {
    const visible = this.visible();
    const visibleIds = new Set(visible.map((toast) => toast.id));

    // Toasts pushed off-screen keep their remaining time for when they come back.
    for (const id of this.timers.keys()) {
      if (!visibleIds.has(id)) {
        this.stopTimer(id);
      }
    }

    if (this.pauseReasons.size > 0) {
      return;
    }

    for (const toast of visible) {
      if (Number.isFinite(toast.duration) && toast.duration > 0) {
        this.startTimer(toast);
      }
    }
  }

  private startTimer(toast: ToastItem): void {
    const timer = this.timers.get(toast.id);
    if (timer?.handle !== undefined) {
      return;
    }
    const remaining = timer?.remaining ?? toast.duration;
    this.timers.set(toast.id, {
      remaining,
      startedAt: Date.now(),
      handle: setTimeout(() => this.dismiss(toast.id), remaining),
    });
  }

  private stopTimer(id: number): void {
    const timer = this.timers.get(id);
    if (timer?.handle === undefined) {
      return;
    }
    clearTimeout(timer.handle);
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
    timer.handle = undefined;
  }

  private ensureViewport(): void {
    if (this.viewport) {
      this.bringToFront(this.viewport);
      return;
    }

    const [edge, inline] = this.config.position.split('-') as ['top' | 'bottom', string];
    const strategy = createGlobalPositionStrategy(this.injector);
    if (edge === 'top') {
      strategy.top('1rem');
    } else {
      strategy.bottom('1rem');
    }
    if (inline === 'start') {
      strategy.start('1rem');
    } else if (inline === 'end') {
      strategy.end('1rem');
    } else {
      strategy.centerHorizontally();
    }

    this.viewport = createOverlayRef(this.injector, {
      positionStrategy: strategy,
      hasBackdrop: false,
    });
    this.viewport.attach(new ComponentPortal(ToastViewportComponent, null, this.injector));

    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  /**
   * CDK stacks overlays in creation order, so a dialog opened after the first toast
   * would cover every later one. Move the viewport back on top, unless it holds focus
   * (moving a focused node blurs it).
   */
  private bringToFront(overlayRef: OverlayRef): void {
    const host = overlayRef.hostElement;
    if (host.nextElementSibling && !host.contains(document.activeElement)) {
      host.parentElement?.appendChild(host);
    }
  }
}

@Component({
  selector: 'vf-toast-viewport',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol [class]="listClass">
      @for (toast of toasts.visible(); track toast.id) {
        <li [class]="styles.item({ tone: toast.tone })">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            [class]="styles.icon({ tone: toast.tone })"
          >
            @switch (toast.tone) {
              @case ('success') {
                <circle cx="8" cy="8" r="6.25" />
                <path d="M5.5 8.25l1.75 1.75 3.25-3.5" />
              }
              @case ('error') {
                <circle cx="8" cy="8" r="6.25" />
                <path d="M6 6l4 4M10 6l-4 4" />
              }
              @case ('warning') {
                <path d="M8 2.25l6 10.5H2z" />
                <path d="M8 6.5v2.75M8 11.25v.01" />
              }
              @case ('info') {
                <circle cx="8" cy="8" r="6.25" />
                <path d="M8 7.25v3.5M8 5.25v.01" />
              }
            }
          </svg>

          <div class="min-w-0 flex-1">
            @if (toast.title) {
              <p class="font-semibold">{{ toast.title }}</p>
            }
            <p class="text-pretty">{{ toast.message }}</p>
          </div>

          @if (toast.action; as action) {
            <button type="button" [class]="styles.action()" (click)="run(toast.id, action)">
              {{ action.label }}
            </button>
          }

          @if (toast.dismissible) {
            <button
              type="button"
              [class]="styles.dismiss()"
              [attr.aria-label]="toasts.config.dismissLabel"
              (click)="toasts.dismiss(toast.id)"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                class="size-4"
                aria-hidden="true"
              >
                <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
              </svg>
            </button>
          }
        </li>
      }
    </ol>
  `,
  host: {
    role: 'region',
    class: 'block',
    '[attr.aria-label]': 'toasts.config.regionLabel',
    '[hidden]': 'toasts.visible().length === 0',
    '(pointerenter)': 'toasts.pause("hover")',
    '(pointerleave)': 'toasts.resume("hover")',
    '(focusin)': 'toasts.pause("focus")',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class ToastViewportComponent {
  protected readonly toasts = inject(VfToast);

  protected readonly listClass = toastViewportVariants({
    edge: this.toasts.config.position.startsWith('top') ? 'top' : 'bottom',
  });

  protected readonly styles = {
    item: toastVariants,
    icon: toastIconVariants,
    action: toastActionVariants,
    dismiss: toastDismissVariants,
  };

  protected run(id: number, action: ToastAction): void {
    action.run();
    this.toasts.dismiss(id);
  }

  protected onFocusOut(event: FocusEvent): void {
    const host = event.currentTarget as HTMLElement;
    if (!host.contains(event.relatedTarget as Node | null)) {
      this.toasts.resume('focus');
    }
  }
}
