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
  sidebarNavBadgeClass,
  sidebarNavItemVariants,
  sidebarNavSectionLabelClass,
  sidebarNavToggleClass,
  sidebarNavUserVariants,
  sidebarNavVariants,
} from './sidebar-nav.variants';

// Declared before the children below: they `inject(SidebarNavComponent, { optional: true })`
// to read `collapsed()`, which requires the class to already exist at module-evaluation time.
@Component({
  selector: 'vf-sidebar-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content select="[vfSidebarHeader]" />
    <div class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden p-3">
      <ng-content />
    </div>
    <ng-content select="[vfSidebarFooter]" />
  `,
  host: {
    role: 'navigation',
    '[class]': 'hostClass()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
  },
})
export class SidebarNavComponent {
  /** Two-way bindable: `[(collapsed)]="collapsed"`. Drive it from your own toggle button. */
  readonly collapsed = model(false);
  readonly ariaLabel = input<string>();

  /** Escape hatch: consumer classes are merged last so they override the shell defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly hostClass = computed(() =>
    cn(sidebarNavVariants({ collapsed: this.collapsed() }), this.userClass()),
  );
}

/**
 * Wires up the collapse/expand click + a11y attributes so consumers only bring an icon.
 * Projects a single icon via the default slot — it rotates 180° between states rather
 * than requiring two separately-slotted icons for expanded vs. collapsed.
 */
@Component({
  selector: 'button[vfSidebarNavToggle]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    type: 'button',
    '[class]': 'hostClass()',
    '[attr.aria-expanded]': '!collapsed()',
    '[attr.aria-label]': 'ariaLabel() ?? (collapsed() ? "Expand sidebar" : "Collapse sidebar")',
    '(click)': 'toggle()',
  },
})
export class SidebarNavToggleComponent {
  private readonly root = inject(SidebarNavComponent);

  readonly ariaLabel = input<string>();

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly collapsed = computed(() => this.root.collapsed());

  protected readonly hostClass = computed(() =>
    cn(sidebarNavToggleClass, this.collapsed() ? '[&_svg]:rotate-180' : '', this.userClass()),
  );

  protected toggle(): void {
    this.root.collapsed.set(!this.root.collapsed());
  }
}

@Component({
  selector: 'vf-sidebar-nav-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (label() && !collapsed()) {
      <div [class]="sectionLabelClass">{{ label() }}</div>
    }
    <div class="flex flex-col gap-1">
      <ng-content />
    </div>
  `,
  host: { class: 'flex w-full flex-col gap-2' },
})
export class SidebarNavSectionComponent {
  private readonly root = inject(SidebarNavComponent, { optional: true });

  /** Section heading, e.g. "Resources". Hidden automatically while the sidebar is collapsed. */
  readonly label = input<string>();

  protected readonly sectionLabelClass = sidebarNavSectionLabelClass;
  protected readonly collapsed = computed(() => this.root?.collapsed() ?? false);
}

@Component({
  selector: 'a[vfSidebarNavItem], button[vfSidebarNavItem]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (active()) {
      <span
        class="bg-brand-600 absolute inset-y-2 inset-s-0 w-1 rounded-e-full"
        aria-hidden="true"
      ></span>
    }
    <span class="flex h-5 w-5 shrink-0 items-center justify-center">
      <ng-content select="[vfSidebarNavIcon]" />
    </span>
    @if (!collapsed()) {
      <span class="min-w-0 flex-1 truncate text-start">
        <ng-content />
      </span>
      @if (badge() !== undefined) {
        <span [class]="badgeClass">{{ badge() }}</span>
      }
    } @else if (badge() !== undefined) {
      <span
        class="bg-brand-600 absolute inset-e-1.5 top-1.5 h-2 w-2 rounded-full"
        aria-hidden="true"
      ></span>
    }
  `,
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-current]': 'active() ? "page" : null',
    '[attr.disabled]': 'disabled() || null',
    '[attr.aria-disabled]': 'disabled() || null',
  },
})
export class SidebarNavItemComponent {
  private readonly root = inject(SidebarNavComponent, { optional: true });

  readonly active = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Optional trailing count/label, e.g. `2`. Collapses to a plain dot when the sidebar is collapsed. */
  readonly badge = input<string | number>();

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly badgeClass = sidebarNavBadgeClass;
  protected readonly collapsed = computed(() => this.root?.collapsed() ?? false);

  protected readonly hostClass = computed(() =>
    cn(
      sidebarNavItemVariants({ active: this.active(), collapsed: this.collapsed() }),
      this.userClass(),
    ),
  );
}

@Component({
  selector: 'vf-sidebar-nav-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="flex h-8 w-8 shrink-0 items-center justify-center">
      <ng-content select="[vfSidebarNavAvatar]" />
    </span>
    @if (!collapsed()) {
      <span class="flex min-w-0 flex-1 flex-col gap-0.5">
        <ng-content select="[vfSidebarNavUserName]" />
        <ng-content select="[vfSidebarNavUserRole]" />
      </span>
      <ng-content select="[vfSidebarNavUserAction]" />
    }
  `,
  host: { '[class]': 'hostClass()' },
})
export class SidebarNavUserComponent {
  private readonly root = inject(SidebarNavComponent, { optional: true });

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly collapsed = computed(() => this.root?.collapsed() ?? false);

  protected readonly hostClass = computed(() =>
    cn(sidebarNavUserVariants({ collapsed: this.collapsed() }), this.userClass()),
  );
}
