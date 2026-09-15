import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '../utils/cn';
import { buttonVariants, type ButtonSize, type ButtonVariant } from './button.variants';

@Component({
  selector: 'button[vfButton], a[vfButton]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': 'hostClass()',
    '[attr.disabled]': 'disabled() || null',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.aria-busy]': 'loading() || null',
  },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly fullWidth = input(false);
  readonly disabled = input(false);
  readonly loading = input(false);

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly hostClass = computed(() =>
    cn(
      buttonVariants({
        variant: this.variant(),
        size: this.size(),
        fullWidth: this.fullWidth(),
      }),
      this.userClass(),
    ),
  );
}
