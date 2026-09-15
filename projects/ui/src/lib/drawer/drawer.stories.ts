import { Component, input, signal } from '@angular/core';
import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { DrawerComponent } from './drawer';
import type { DrawerSide, DrawerSize } from './drawer.variants';

@Component({
  selector: 'vf-drawer-story',
  imports: [DrawerComponent],
  template: `
    <button
      type="button"
      class="focus-ring rounded-control bg-brand-600 hover:bg-brand-700 h-10 px-4 text-sm font-medium text-white"
      (click)="open.set(true)"
    >
      Open drawer
    </button>

    <vf-drawer
      [open]="open()"
      [side]="side()"
      [size]="size()"
      [class]="panelClass()"
      [closeOnBackdrop]="closeOnBackdrop()"
      [closeOnEscape]="closeOnEscape()"
      [ariaLabel]="ariaLabel()"
      (closed)="open.set(false)"
    >
      <header
        vfDrawerHeader
        class="border-ink-200 dark:border-ink-800 flex items-start gap-4 border-b p-4"
      >
        <div class="flex flex-1 flex-col gap-1">
          <h2 class="text-lg font-semibold">Customise dashboard</h2>
          <p class="text-ink-600 dark:text-ink-400 text-sm">
            Set up your dashboard by reordering widgets.
          </p>
        </div>
        <button
          type="button"
          class="focus-ring rounded-control hover:bg-ink-100 dark:hover:bg-ink-800 flex h-8 w-8 shrink-0 items-center justify-center"
          (click)="open.set(false)"
          aria-label="Close"
        >
          &#x2715;
        </button>
      </header>

      <div class="flex flex-col gap-4 p-4 text-sm">
        <p class="text-ink-700 dark:text-ink-300">
          Drawer body content is projected here via the default slot.
        </p>
      </div>

      <footer
        vfDrawerFooter
        class="border-ink-200 dark:border-ink-800 flex justify-end gap-2 border-t p-4"
      >
        <button
          type="button"
          class="focus-ring rounded-control hover:bg-ink-100 dark:hover:bg-ink-800 h-10 px-4 text-sm font-medium"
          (click)="open.set(false)"
        >
          Cancel
        </button>
        <button
          type="button"
          class="focus-ring rounded-control bg-brand-600 hover:bg-brand-700 h-10 px-4 text-sm font-medium text-white"
          (click)="open.set(false)"
        >
          Apply
        </button>
      </footer>
    </vf-drawer>
  `,
})
class DrawerStoryHost {
  readonly side = input<DrawerSide>('end');
  readonly size = input<DrawerSize>('md');
  readonly closeOnBackdrop = input(true);
  readonly closeOnEscape = input(true);
  readonly ariaLabel = input('Example drawer');
  // Bound to the Storybook "panelClass" control so edits reflect on the panel live.
  readonly panelClass = input('');
  protected readonly open = signal(false);
}

const meta: Meta<DrawerStoryHost> = {
  title: 'Components/Drawer',
  component: DrawerStoryHost,
  argTypes: {
    side: { control: 'inline-radio', options: ['start', 'end'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'full'] },
    closeOnBackdrop: { control: 'boolean' },
    closeOnEscape: { control: 'boolean' },
    ariaLabel: { control: 'text' },
    panelClass: {
      name: 'class',
      control: 'text',
      description:
        'Merged onto the panel via `tailwind-merge` — try `bg-brand-950 dark:bg-brand-950`.',
    },
  },
  args: {
    side: 'end',
    size: 'md',
    closeOnBackdrop: true,
    closeOnEscape: true,
    ariaLabel: 'Example drawer',
    panelClass: '',
  },
  render: (args) => ({
    props: args,
    template: `<vf-drawer-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        component: `
\`vf-drawer\` is a headless overlay shell: backdrop, focus trap, Escape-to-close,
scroll lock and slide transition. It has three content slots, picked by attribute
selector on whatever element you project — no directive import required:

~~~html
<vf-drawer [open]="open()" (closed)="open.set(false)">
  <!-- vfDrawerHeader: pinned to the top, above the scroll area -->
  <header vfDrawerHeader>...</header>

  <!-- default slot (no attribute): the scrollable body -->
  <p>Any content goes here.</p>

  <!-- vfDrawerFooter: pinned to the bottom, below the scroll area -->
  <footer vfDrawerFooter>...</footer>
</vf-drawer>
~~~

Both \`vfDrawerHeader\` and \`vfDrawerFooter\` are optional and can be any element
(\`<header>\`, \`<div>\`, ...) — only content that is *not* marked with either
attribute lands in the scrollable body.

The panel itself accepts a plain \`class\` attribute, same as any native element.
It is merged last via \`tailwind-merge\`, so it overrides the default width/background
instead of fighting on specificity — see the "Custom class" story below:

~~~html
<vf-drawer [open]="open()" class="bg-brand-950 dark:bg-brand-950" (closed)="open.set(false)">
  ...
</vf-drawer>
~~~

\`open\` and \`ariaLabelledBy\` are deliberately left out of Controls: \`open\` is
driven by application state, not a static prop — every story uses a real "Open
drawer" button instead, since toggling it from the Controls panel would replay
a re-mount rather than the actual slide transition. \`ariaLabelledBy\` is a
mutually-exclusive alternative to \`ariaLabel\` that only makes sense pointed at
a real element id, so exposing both invites setting both at once.
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<DrawerStoryHost>;

export const Playground: Story = {
  args: {
    side: 'end',
    panelClass: 'bg-green-200',
    size: 'full',
  },
};

export const StartSide: Story = {
  name: 'Opens from the start (left)',
  args: { side: 'start' },
};

export const Sized: Story = {
  args: { size: 'full' },
};

@Component({
  selector: 'vf-drawer-class-story',
  imports: [DrawerComponent],
  template: `
    <button
      type="button"
      class="focus-ring rounded-control bg-brand-600 hover:bg-brand-700 h-10 px-4 text-sm font-medium text-white"
      (click)="open.set(true)"
    >
      Open drawer
    </button>

    <vf-drawer
      [open]="open()"
      ariaLabel="Custom class example"
      class="bg-brand-950 dark:bg-brand-950"
      (closed)="open.set(false)"
    >
      <header vfDrawerHeader class="border-brand-800 border-b p-4">
        <h2 class="text-lg font-semibold text-white">Branded panel</h2>
      </header>
      <div class="p-4 text-sm text-white/80">
        The \`class\` input replaced the default background; borders and text still come from the
        design tokens above.
      </div>
    </vf-drawer>
  `,
})
class DrawerClassStoryHost {
  protected readonly open = signal(false);
}

export const ClassOverride: StoryObj<DrawerClassStoryHost> = {
  name: 'Custom class',
  render: () => ({
    moduleMetadata: { imports: [DrawerClassStoryHost] },
    template: `<vf-drawer-class-story />`,
  }),
  parameters: {
    docs: {
      description: {
        story: `
Pass \`class\` on \`<vf-drawer>\` like any native attribute — no special API:

~~~html
<vf-drawer [open]="open()" class="bg-brand-950 dark:bg-brand-950" (closed)="open.set(false)">
  <header vfDrawerHeader class="border-brand-800 border-b p-4">
    <h2 class="text-lg font-semibold text-white">Branded panel</h2>
  </header>
  <div class="p-4 text-sm text-white/80">Body content.</div>
</vf-drawer>
~~~

\`tailwind-merge\` resolves the conflict with the panel's default background so
the consumer value wins instead of both classes applying.
`,
      },
    },
  },
};

@Component({
  selector: 'vf-drawer-dashboard-story',
  imports: [DrawerComponent],
  template: `
    <button
      type="button"
      class="focus-ring rounded-control bg-brand-600 hover:bg-brand-700 h-10 px-4 text-sm font-medium text-white"
      (click)="open.set(true)"
    >
      Customise dashboard
    </button>

    <vf-drawer [open]="open()" ariaLabel="Customise dashboard" (closed)="open.set(false)">
      <header
        vfDrawerHeader
        class="border-ink-200 dark:border-ink-800 flex items-start gap-4 border-b p-4"
      >
        <div class="flex flex-1 flex-col gap-1">
          <h2 class="text-lg font-semibold">Customise Dashboard</h2>
          <p class="text-ink-600 dark:text-ink-400 text-sm">
            Setup your dashboard by reordering widgets!
          </p>
        </div>
        <button
          type="button"
          class="focus-ring rounded-control hover:bg-ink-100 dark:hover:bg-ink-800 flex h-8 w-8 shrink-0 items-center justify-center"
          (click)="open.set(false)"
          aria-label="Close"
        >
          &#x2715;
        </button>
      </header>

      <div class="flex flex-col gap-4 p-4">
        <input
          type="search"
          placeholder="Search here..."
          class="border-ink-300 dark:border-ink-700 placeholder:text-ink-500 dark:placeholder:text-ink-400 focus-ring rounded-control h-12 border bg-transparent px-3 text-sm"
        />

        <div class="flex flex-wrap gap-2">
          <span
            class="bg-ink-950 text-ink-50 dark:bg-white dark:text-ink-950 rounded-full px-4 py-2 text-sm font-medium"
            >Overview</span
          >
          <span class="bg-ink-100 dark:bg-ink-800 rounded-full px-4 py-2 text-sm font-medium"
            >Business solutions</span
          >
          <span class="bg-ink-100 dark:bg-ink-800 rounded-full px-4 py-2 text-sm font-medium"
            >Mobility</span
          >
          <span class="bg-ink-100 dark:bg-ink-800 rounded-full px-4 py-2 text-sm font-medium"
            >Budget widgets</span
          >
        </div>

        <section class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h3 class="text-ink-600 dark:text-ink-400 text-sm font-medium">Overview</h3>
            <button
              type="button"
              class="focus-ring text-brand-600 dark:text-brand-400 text-sm font-medium"
            >
              + Add all
            </button>
          </div>
          <ul
            class="border-ink-200 dark:border-ink-800 divide-ink-200 dark:divide-ink-800 divide-y rounded-lg border"
          >
            @for (widget of overviewWidgets; track widget.title) {
              <li class="flex items-center gap-3 p-3">
                <span class="text-ink-400 dark:text-ink-500" aria-hidden="true"
                  >&#8942;&#8942;</span
                >
                <div class="flex flex-1 flex-col">
                  <span class="text-sm font-medium">{{ widget.title }}</span>
                  <span class="text-ink-600 dark:text-ink-400 text-sm">{{
                    widget.description
                  }}</span>
                </div>
                <button
                  type="button"
                  class="focus-ring text-brand-600 dark:text-brand-400 text-sm font-medium"
                >
                  + Add
                </button>
              </li>
            }
          </ul>
        </section>
      </div>

      <footer
        vfDrawerFooter
        class="border-ink-200 dark:border-ink-800 flex justify-end gap-2 border-t p-4"
      >
        <button
          type="button"
          class="focus-ring rounded-control hover:bg-ink-100 dark:hover:bg-ink-800 h-10 px-4 text-sm font-medium"
          (click)="open.set(false)"
        >
          Cancel
        </button>
        <button
          type="button"
          class="focus-ring rounded-control bg-brand-600 hover:bg-brand-700 h-10 px-4 text-sm font-medium text-white"
          (click)="open.set(false)"
        >
          Save changes
        </button>
      </footer>
    </vf-drawer>
  `,
})
class DrawerDashboardStoryHost {
  protected readonly open = signal(false);
  protected readonly overviewWidgets = [
    { title: 'Budget tracker', description: 'Billing details in a glance' },
    { title: 'Upcoming payments', description: 'Plan for all upcoming payments' },
    { title: 'Unbilled charges', description: 'Billing details in a glance' },
  ];
}

export const DashboardCustomisation: StoryObj<DrawerDashboardStoryHost> = {
  name: 'Composition: dashboard customisation',
  render: () => ({
    moduleMetadata: { imports: [DrawerDashboardStoryHost] },
    template: `<vf-drawer-dashboard-story />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Realistic composition built entirely from `vf-drawer` + content projection. Search, ' +
          'chips, badges and list rows here are plain markup, not yet published components.',
      },
    },
  },
};
