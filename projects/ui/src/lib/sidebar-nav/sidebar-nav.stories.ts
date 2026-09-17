import { Component, effect, input, signal } from '@angular/core';
import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  SidebarNavComponent,
  SidebarNavItemComponent,
  SidebarNavSectionComponent,
  SidebarNavToggleComponent,
  SidebarNavUserComponent,
} from './sidebar-nav';

// Generic placeholder outline icons for the demo only — swap in your own icon set
// (they're projected via `[vfSidebarNavIcon]`, no dependency on this component).
@Component({
  selector: 'vf-demo-icon',
  changeDetection: 0 as const,
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-full w-full"
    >
      @switch (name()) {
        @case ('home') {
          <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
        }
        @case ('mobile') {
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M11 18h2" />
        }
        @case ('router') {
          <rect x="3" y="10" width="18" height="6" rx="1.5" />
          <path d="M7 10V6a5 5 0 0 1 10 0v4" />
          <circle cx="7" cy="13" r=".6" fill="currentColor" />
        }
        @case ('shop') {
          <path d="M4 9V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
          <path d="M3 9h18l-1 10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        }
        @case ('card') {
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="m9.5 14.5 1.5 1.5 3-3" />
        }
        @case ('cloud') {
          <path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5a4 4 0 0 1 .5 7.98" />
        }
        @case ('wallet') {
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M16 12h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3a2 2 0 0 1 0-4Z" />
          <path d="M3 9h13" />
        }
        @case ('box') {
          <path d="m3.5 8 8.5-4 8.5 4-8.5 4z" />
          <path d="M3.5 8v9l8.5 4 8.5-4V8" />
          <path d="M12 12v9" />
        }
        @case ('layers') {
          <path d="m12 3 9 4.5-9 4.5-9-4.5z" />
          <path d="m3 12 9 4.5 9-4.5" />
          <path d="m3 16 9 4.5 9-4.5" />
        }
        @case ('life-buoy') {
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <path d="m6.3 6.3 3.1 3.1M14.6 14.6l3.1 3.1M17.7 6.3l-3.1 3.1M9.4 14.6l-3.1 3.1" />
        }
        @case ('cart') {
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
          <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 6l6 6-6 6" />
        }
        @case ('sidebar') {
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M9 4v16" />
        }
      }
    </svg>
  `,
  host: { class: 'block h-full w-full' },
})
class DemoVfIcon {
  readonly name = input.required<string>();
}

@Component({
  selector: 'vf-sidebar-nav-story',
  imports: [
    SidebarNavComponent,
    SidebarNavSectionComponent,
    SidebarNavItemComponent,
    SidebarNavToggleComponent,
    SidebarNavUserComponent,
    DemoVfIcon,
  ],
  template: `
    <div class="h-208">
      <vf-sidebar-nav [(collapsed)]="collapsedState" ariaLabel="Primary">
        <div vfSidebarHeader class="flex flex-col gap-0 p-3">
          <div class="flex items-center gap-2 rounded-control p-1">
            <span
              class="bg-brand-600 flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold text-white"
            >
              E
            </span>
            @if (!collapsedState()) {
              <span class="min-w-0 flex-1 truncate text-sm font-semibold">Enterprise Co.</span>
            }
            <button vfSidebarNavToggle>
              <span class="h-4 w-4"><vf-demo-icon name="sidebar" /></span>
            </button>
          </div>
          <div class="border-ink-200 dark:border-ink-800 mt-3 border-t"></div>
        </div>

        <vf-sidebar-nav-section>
          <a vfSidebarNavItem href="javascript:void(0)">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="home" /></span>
            Home
          </a>
          <a vfSidebarNavItem href="javascript:void(0)">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="mobile" /></span>
            Mobile Lines
          </a>
          <a vfSidebarNavItem href="javascript:void(0)">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="router" /></span>
            Fixed Lines
          </a>
          <a vfSidebarNavItem href="javascript:void(0)">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="shop" /></span>
            Digital Store
          </a>
          <a vfSidebarNavItem active href="javascript:void(0)" [badge]="2">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="card" /></span>
            Subscriptions
          </a>
          <a vfSidebarNavItem href="javascript:void(0)">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="cloud" /></span>
            Vodafone Solutions
          </a>
          <a vfSidebarNavItem href="javascript:void(0)">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="wallet" /></span>
            Billing & Payments
          </a>
          <a vfSidebarNavItem href="javascript:void(0)">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="box" /></span>
            Order & Summary
          </a>
        </vf-sidebar-nav-section>

        <vf-sidebar-nav-section label="Resources">
          <a vfSidebarNavItem href="javascript:void(0)">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="layers" /></span>
            My Requests
          </a>
          <a vfSidebarNavItem href="javascript:void(0)">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="life-buoy" /></span>
            Support
          </a>
        </vf-sidebar-nav-section>

        <div vfSidebarFooter class="flex flex-col gap-2 p-3 pt-0">
          <a vfSidebarNavItem href="javascript:void(0)" [badge]="2">
            <span vfSidebarNavIcon class="h-full w-full"><vf-demo-icon name="cart" /></span>
            Your cart
          </a>
          <div class="border-ink-200 dark:border-ink-800 border-t"></div>
          <vf-sidebar-nav-user>
            <span
              vfSidebarNavAvatar
              class="bg-ink-200 text-ink-950 dark:bg-ink-800 dark:text-white flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium"
            >
              KM
            </span>
            <span vfSidebarNavUserName class="truncate text-sm">Khaled M</span>
            <span vfSidebarNavUserRole class="text-ink-500 dark:text-ink-400 truncate text-xs"
              >Admin</span
            >
            <button
              vfSidebarNavUserAction
              type="button"
              class="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-control hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label="Account options"
            >
              <span class="h-4 w-4"><vf-demo-icon name="arrow-right" /></span>
            </button>
          </vf-sidebar-nav-user>
        </div>
      </vf-sidebar-nav>
    </div>
  `,
})
class SidebarNavStoryHost {
  // Bound to the Storybook "collapsed" control; mirrored into a local signal so the
  // in-story toggle buttons can also flip it via `[(collapsed)]` on `vf-sidebar-nav`.
  readonly collapsed = input(false);
  protected readonly collapsedState = signal(false);

  constructor() {
    effect(() => this.collapsedState.set(this.collapsed()));
  }
}

const meta: Meta<SidebarNavStoryHost> = {
  title: 'Components/Sidebar Navigation',
  component: SidebarNavStoryHost,
  argTypes: {
    collapsed: { control: 'boolean' },
  },
  args: {
    collapsed: false,
  },
  render: (args) => ({
    props: args,
    template: `<vf-sidebar-nav-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
\`vf-sidebar-nav\` is the primary side navigation shell for enterprise product surfaces:
a collapsible rail with a header slot, scrollable nav sections, and a pinned footer for
cart/profile actions. It ships unbranded — logo, product name, colours and icon set are
all consumer-supplied via content projection and the shared \`theme.css\` tokens, so any
enterprise/tenant can restyle it by overriding \`--color-brand-*\` and \`--color-ink-*\`
rather than forking the component.

~~~html
<vf-sidebar-nav [(collapsed)]="collapsed" ariaLabel="Primary">
  <div vfSidebarHeader>
    ...logo, product name...
    <button vfSidebarNavToggle><svg>...</svg></button>
  </div>

  <vf-sidebar-nav-section>
    <a vfSidebarNavItem [active]="true" [badge]="2" routerLink="/subscriptions">
      <svg vfSidebarNavIcon>...</svg>
      Subscriptions
    </a>
  </vf-sidebar-nav-section>

  <vf-sidebar-nav-section label="Resources">
    <a vfSidebarNavItem routerLink="/support">
      <svg vfSidebarNavIcon>...</svg>
      Support
    </a>
  </vf-sidebar-nav-section>

  <div vfSidebarFooter>
    <vf-sidebar-nav-user>
      <span vfSidebarNavAvatar>...</span>
      <span vfSidebarNavUserName>Khaled M</span>
      <span vfSidebarNavUserRole>Admin</span>
      <button vfSidebarNavUserAction>...</button>
    </vf-sidebar-nav-user>
  </div>
</vf-sidebar-nav>
~~~

- \`vfSidebarNavItem\` is an attribute component on a native \`<a>\` or \`<button>\`, so
  routing (\`routerLink\`), \`href\`s and click handlers work exactly as they would without it.
- Every nav item, section label and the user card automatically hide their text and
  collapse to icon-only / avatar-only when the parent \`vf-sidebar-nav\` is \`collapsed\`
  — there's no separate "Collapsed" input to keep in sync on each child.
- \`collapsed\` is model-bound (\`[(collapsed)]\`). \`vfSidebarNavToggle\` (an attribute
  component on a \`<button>\`) wires the click handler and \`aria-expanded\`/\`aria-label\`
  for you — it still projects a single icon via the default slot (rotated 180° between
  states) rather than baking in an icon, so any icon set works.
- Icons are never a component input anywhere in this library — always projected via an
  attribute-selected \`ng-content\` slot (e.g. \`[vfSidebarNavIcon]\`) so you aren't locked
  into a specific icon format.
- Dark mode follows the shared \`dark:\` token convention — toggle it from the toolbar
  above (Storybook defaults to dark, matching the Figma source).
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<SidebarNavStoryHost>;

export const Expanded: Story = {
  args: { collapsed: false },
};

export const Collapsed: Story = {
  args: { collapsed: true },
};
