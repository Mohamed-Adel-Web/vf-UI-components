import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { cn } from '../utils/cn';
import {
  accordionChevronVariants,
  accordionItemVariants,
  accordionRootClass,
  accordionTriggerClass,
} from './accordion.variants';

// Shared across instances so auto-generated trigger/panel ids never collide.
let nextAccordionItemId = 0;

// Declared before AccordionItemComponent: it `inject(AccordionComponent, { optional: true })`
// so a single item can also be used standalone (driven by its own `[(expanded)]`).
@Component({
  selector: 'vf-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': 'hostClass()',
  },
})
export class AccordionComponent {
  /** Two-way bindable list of expanded item values. Leave empty for none expanded. */
  readonly value = model<string[]>([]);
  /** Allow more than one item open at once. Defaults to single-open accordion behaviour. */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** Escape hatch: consumer classes are merged last so they override the shell defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly hostClass = computed(() => cn(accordionRootClass, this.userClass()));

  isExpanded(value: string): boolean {
    return this.value().includes(value);
  }

  toggle(value: string): void {
    const expanded = this.value();
    if (expanded.includes(value)) {
      this.value.set(expanded.filter((item) => item !== value));
      return;
    }
    this.value.set(this.multiple() ? [...expanded, value] : [value]);
  }
}

@Component({
  selector: 'vf-accordion-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [id]="triggerId"
      [class]="triggerClass"
      [attr.aria-expanded]="expanded()"
      [attr.aria-controls]="panelId"
      [attr.aria-disabled]="disabled() || null"
      [disabled]="disabled()"
      (click)="onTriggerClick()"
    >
      <ng-content select="[vfAccordionLeadingSlot]" />
      <span class="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-start">
        <span class="flex flex-wrap items-center gap-2">
          <span class="text-ink-950 dark:text-ink-50 text-base font-medium">
            <ng-content select="[vfAccordionTitle]" />
          </span>
          <ng-content select="[vfAccordionBadge]" />
        </span>
        <span class="text-ink-600 dark:text-ink-400 text-sm">
          <ng-content select="[vfAccordionDescription]" />
        </span>
      </span>
      <span [class]="chevronClass()">
        <ng-content select="[vfAccordionIcon]" />
      </span>
    </button>
    <div [class]="contentWrapperClass()">
      <div class="overflow-hidden">
        <div class="px-4">
          @if (divider()) {
            <div class="border-ink-200 dark:border-ink-800 mt-4 border-t"></div>
          }
          <div [id]="panelId" role="region" [attr.aria-labelledby]="triggerId" class="pt-4 pb-4">
            <ng-content />
          </div>
        </div>
      </div>
    </div>
  `,
  host: {
    '[class]': 'hostClass()',
  },
})
export class AccordionItemComponent {
  private readonly root = inject(AccordionComponent, { optional: true });
  private readonly uid = `vf-accordion-item-${nextAccordionItemId++}`;

  /** Required when nested in `vf-accordion` (identifies this item in its `value` array). */
  readonly value = input<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Shows a divider between the trigger and the body once expanded. */
  readonly divider = input(true, { transform: booleanAttribute });

  /** Only used standalone (outside a `vf-accordion` group): `<vf-accordion-item [(expanded)]="open">`. */
  readonly expandedModel = model(false, { alias: 'expanded' });

  /** Escape hatch: consumer classes are merged last so they override the card defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly triggerId = `${this.uid}-trigger`;
  protected readonly panelId = `${this.uid}-panel`;
  protected readonly triggerClass = accordionTriggerClass;

  private readonly resolvedValue = computed(() => this.value() ?? this.uid);

  protected readonly expanded = computed(() =>
    this.root ? this.root.isExpanded(this.resolvedValue()) : this.expandedModel(),
  );

  protected readonly hostClass = computed(() =>
    cn(accordionItemVariants({ disabled: this.disabled() }), this.userClass()),
  );

  protected readonly chevronClass = computed(() =>
    accordionChevronVariants({ expanded: this.expanded() }),
  );

  protected readonly contentWrapperClass = computed(() =>
    cn(
      'accordion-content-transition grid',
      this.expanded() ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
    ),
  );

  protected onTriggerClick(): void {
    if (this.disabled()) {
      return;
    }
    if (this.root) {
      this.root.toggle(this.resolvedValue());
    } else {
      this.expandedModel.set(!this.expandedModel());
    }
  }
}
