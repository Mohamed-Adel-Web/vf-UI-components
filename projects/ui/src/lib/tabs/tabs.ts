import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import { cn } from '../utils/cn';
import { tabsListVariants, tabVariants, type TabsOrientation } from './tabs.variants';

// Shared across instances so tab/panel ids never collide when several groups render at once.
let nextTabsGroupId = 0;

// Declared before TabsComponent: contentChildren(TabComponent) below is evaluated
// eagerly as part of the component's static definition, so a forward reference here
// throws "Cannot access 'TabComponent' before initialization".
@Component({
  selector: 'button[vfTab]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'tab',
    type: 'button',
    '[id]': 'id()',
    '[class]': 'hostClass()',
    '[attr.aria-selected]': 'selected()',
    '[attr.aria-controls]': 'ariaControls()',
    '[attr.disabled]': 'disabled() || null',
    '[attr.tabindex]': 'selected() ? 0 : -1',
    '(click)': 'onClick()',
    '(keydown.arrowright)': 'onArrow($event, 1)',
    '(keydown.arrowdown)': 'onArrow($event, 1)',
    '(keydown.arrowleft)': 'onArrow($event, -1)',
    '(keydown.arrowup)': 'onArrow($event, -1)',
    '(keydown.home)': 'onHome($event)',
    '(keydown.end)': 'onEnd($event)',
  },
})
export class TabComponent {
  private readonly tabs = inject(TabsComponent);
  private readonly elementRef = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  readonly value = input.required<string>();
  /** Accepts the bare `disabled` attribute as well as `[disabled]="expr"`. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly selected = computed(() => this.tabs.value() === this.value());
  protected readonly id = computed(() => `${this.tabs.groupId}-tab-${this.value()}`);
  protected readonly ariaControls = computed(() => `${this.tabs.groupId}-panel-${this.value()}`);

  protected readonly hostClass = computed(() =>
    cn(tabVariants({ selected: this.selected() }), this.userClass()),
  );

  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  protected onClick(): void {
    if (!this.disabled()) {
      this.tabs.select(this.value());
    }
  }

  protected onArrow(event: Event, delta: number): void {
    event.preventDefault();
    this.tabs.focusAdjacent(this, delta);
  }

  protected onHome(event: Event): void {
    event.preventDefault();
    this.tabs.focusEdge('first');
  }

  protected onEnd(event: Event): void {
    event.preventDefault();
    this.tabs.focusEdge('last');
  }
}

@Component({
  selector: 'vf-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'tablist',
    '[class]': 'hostClass()',
    '[attr.aria-orientation]': 'orientation()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
})
export class TabsComponent {
  /** Two-way bindable: `[(value)]="active"`. Auto-selects the first enabled tab when unset. */
  readonly value = model<string>('');
  readonly orientation = input<TabsOrientation>('horizontal');
  readonly ariaLabel = input<string>();

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  readonly groupId = `vf-tabs-${nextTabsGroupId++}`;

  private readonly tabs = contentChildren(TabComponent, { descendants: true });

  protected readonly hostClass = computed(() =>
    cn(tabsListVariants({ orientation: this.orientation() }), this.userClass()),
  );

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      if (this.value() || tabs.length === 0) {
        return;
      }
      const firstEnabled = tabs.find((tab) => !tab.disabled());
      if (firstEnabled) {
        this.value.set(firstEnabled.value());
      }
    });
  }

  select(value: string): void {
    this.value.set(value);
  }

  focusAdjacent(current: TabComponent, delta: number): void {
    const enabled = this.tabs().filter((tab) => !tab.disabled());
    if (enabled.length === 0) {
      return;
    }
    const index = enabled.indexOf(current);
    const next = enabled.at((index + delta) % enabled.length) ?? enabled[0];
    this.activate(next);
  }

  focusEdge(edge: 'first' | 'last'): void {
    const enabled = this.tabs().filter((tab) => !tab.disabled());
    if (enabled.length === 0) {
      return;
    }
    this.activate(edge === 'first' ? enabled[0] : enabled[enabled.length - 1]);
  }

  private activate(tab: TabComponent): void {
    this.value.set(tab.value());
    tab.focus();
  }
}

@Component({
  selector: 'vf-tab-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    role: 'tabpanel',
    tabindex: '0',
    '[id]': 'id()',
    '[class]': 'hostClass()',
    '[attr.aria-labelledby]': 'labelledBy()',
    '[hidden]': '!active()',
  },
})
export class TabPanelComponent {
  // Panels usually sit next to the tablist rather than inside it (nesting them would be
  // invalid ARIA), so they can't rely on ancestor DI alone.
  private readonly parent = inject(TabsComponent, { optional: true });

  readonly value = input.required<string>();

  /** Required unless the panel is nested inside `<vf-tabs>`: `<vf-tabs #tabs>` then `[tabs]="tabs"`. */
  readonly tabs = input<TabsComponent>();

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  private readonly group = computed(() => this.tabs() ?? this.parent);
  private readonly groupId = computed(() => this.group()?.groupId ?? '');

  protected readonly active = computed(() => this.group()?.value() === this.value());
  protected readonly id = computed(() => `${this.groupId()}-panel-${this.value()}`);
  protected readonly labelledBy = computed(() => `${this.groupId()}-tab-${this.value()}`);

  // Custom elements are inline by default, which makes padding bleed over the tablist.
  protected readonly hostClass = computed(() => cn('block', this.userClass()));
}
