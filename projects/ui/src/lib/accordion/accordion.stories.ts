import { Component, input, linkedSignal } from '@angular/core';
import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { AccordionComponent, AccordionItemComponent } from './accordion';

// A generic chevron for the demo only — projected via `[vfAccordionIcon]`, no dependency
// on this component. Matches the Figma `icons / Arrow / outline / arrow-down4` glyph.
@Component({
  selector: 'vf-accordion-demo-chevron',
  changeDetection: 0 as const,
  template: `
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-full w-full">
      <path
        d="M8 11.2c-.47 0-.93-.18-1.29-.53L2.37 6.32a.5.5 0 0 1 .7-.71l4.35 4.35a.83.83 0 0 0 1.16 0l4.35-4.35a.5.5 0 0 1 .7.71l-4.35 4.35c-.35.35-.81.53-1.28.53Z"
        fill="currentColor"
      />
    </svg>
  `,
  host: { class: 'block h-full w-full' },
})
class DemoChevron {}

// Stand-in for the Figma `avatarGroup` slot: three icon avatars on gradient chips plus
// an overflow-count chip. Purely decorative demo markup, projected via `[vfAccordionBadge]`.
@Component({
  selector: 'vf-accordion-demo-avatar-group',
  changeDetection: 0 as const,
  template: `
    <span class="flex items-center -space-x-2">
      <span
        class="ring-ink-950 flex h-6 w-6 items-center justify-center rounded-lg text-white ring-2"
        style="background: linear-gradient(0deg, rgba(0,0,0,.48), rgba(0,0,0,.48)), conic-gradient(from 180deg at 50% 50%, #0b4026 119deg, #4fd38b 360deg)"
      >
        <svg viewBox="0 0 12 12" class="h-3 w-3" fill="currentColor">
          <circle cx="6" cy="6" r="4" />
        </svg>
      </span>
      <span
        class="ring-ink-950 flex h-6 w-6 items-center justify-center rounded-lg text-white ring-2"
        style="background: linear-gradient(0deg, rgba(0,0,0,.48), rgba(0,0,0,.48)), conic-gradient(from 180deg at 50% 50%, #5a4200 119deg, #ffd24d 360deg)"
      >
        <svg viewBox="0 0 12 12" class="h-3 w-3" fill="currentColor">
          <rect x="3" y="3" width="6" height="6" />
        </svg>
      </span>
      <span
        class="ring-ink-950 flex h-6 w-6 items-center justify-center rounded-lg text-white ring-2"
        style="background: linear-gradient(0deg, rgba(0,0,0,.48), rgba(0,0,0,.48)), conic-gradient(from 180deg at 50% 50%, #002e4d 119deg, #4a9ae0 360deg)"
      >
        <svg viewBox="0 0 12 12" class="h-3 w-3" fill="currentColor">
          <path d="M6 2 2 10h8z" />
        </svg>
      </span>
      <span
        class="ring-ink-950 bg-ink-800 text-ink-50 flex h-6 w-6 items-center justify-center rounded-lg text-xs font-medium ring-2"
      >
        +2
      </span>
    </span>
  `,
  host: { class: 'inline-flex' },
})
class DemoAvatarGroup {}

@Component({
  selector: 'vf-accordion-story',
  imports: [AccordionComponent, AccordionItemComponent, DemoChevron, DemoAvatarGroup],
  template: `
    <div class="bg-ink-50 dark:bg-ink-950 p-4">
      <vf-accordion [(value)]="expanded" [multiple]="multiple()" [class]="accordionClass()">
        <vf-accordion-item value="other-accounts" [divider]="divider()" [class]="itemClass()">
          <span vfAccordionTitle>Other accounts</span>
          <vf-accordion-demo-avatar-group vfAccordionBadge />
          <span vfAccordionIcon><vf-accordion-demo-chevron /></span>
          <p class="text-ink-600 dark:text-ink-400 text-sm">
            Green Power, Gold Partner, Blue Fibre and 2 more accounts linked to this profile.
          </p>
        </vf-accordion-item>

        <vf-accordion-item value="notifications" [divider]="divider()" [class]="itemClass()">
          <span vfAccordionTitle>Notifications</span>
          <span vfAccordionDescription>Email, SMS and push preferences</span>
          <span vfAccordionIcon><vf-accordion-demo-chevron /></span>
          <p class="text-ink-600 dark:text-ink-400 text-sm">
            Choose how we contact you about billing, offers and account activity.
          </p>
        </vf-accordion-item>

        <vf-accordion-item
          value="payment-methods"
          [divider]="divider()"
          [disabled]="disablePayments()"
          [class]="itemClass()"
        >
          <span vfAccordionTitle>Payment methods</span>
          <span vfAccordionIcon><vf-accordion-demo-chevron /></span>
          <p class="text-ink-600 dark:text-ink-400 text-sm">Manage cards and direct debits.</p>
        </vf-accordion-item>
      </vf-accordion>
    </div>
  `,
})
class AccordionStoryHost {
  readonly multiple = input(false);
  readonly divider = input(true);
  readonly disablePayments = input(false);
  readonly accordionClass = input('');
  readonly itemClass = input('');
  readonly initialExpanded = input<string[]>(['other-accounts']);

  // linkedSignal so the Controls panel can reset the selection while clicks still win.
  protected readonly expanded = linkedSignal(() => this.initialExpanded());
}

const usageExample = `import { Component, signal } from '@angular/core';
import { AccordionComponent, AccordionItemComponent } from '@vodafone/ui-components';

@Component({
  selector: 'app-account-settings',
  imports: [AccordionComponent, AccordionItemComponent],
  template: \`
    <vf-accordion [(value)]="expanded">
      <vf-accordion-item value="other-accounts">
        <span vfAccordionTitle>Other accounts</span>
        <my-avatar-group vfAccordionBadge />
        <my-chevron-icon vfAccordionIcon />
        Green Power, Gold Partner and 2 more accounts linked to this profile.
      </vf-accordion-item>

      <vf-accordion-item value="notifications">
        <span vfAccordionTitle>Notifications</span>
        <span vfAccordionDescription>Email, SMS and push preferences</span>
        <my-chevron-icon vfAccordionIcon />
        Choose how we contact you about billing, offers and account activity.
      </vf-accordion-item>
    </vf-accordion>
  \`,
})
export class AccountSettingsComponent {
  // Two-way bound; single-open by default — add [multiple] to allow several open at once.
  readonly expanded = signal(['other-accounts']);
}`;

const standaloneExample = `<!-- No parent \`vf-accordion\` needed for a single collapsible card -->
<vf-accordion-item value="details" [(expanded)]="open">
  <span vfAccordionTitle>Shipping details</span>
  <my-chevron-icon vfAccordionIcon />
  123 Newbury Street, London
</vf-accordion-item>`;

const meta: Meta<AccordionStoryHost> = {
  title: 'Components/Accordion',
  component: AccordionStoryHost,
  argTypes: {
    multiple: {
      control: 'boolean',
      description: 'Allow more than one item expanded at once.',
      table: { category: 'vf-accordion', defaultValue: { summary: 'false' } },
    },
    divider: {
      control: 'boolean',
      name: 'divider (all items)',
      description: 'Shows the divider between the trigger and body once an item expands.',
      table: { category: 'vf-accordion-item', defaultValue: { summary: 'true' } },
    },
    disablePayments: {
      control: 'boolean',
      name: 'disabled (Payment methods)',
      description: 'Disables a single item so you can see the muted, non-interactive state.',
      table: { category: 'vf-accordion-item' },
    },
    accordionClass: {
      control: 'text',
      name: 'class (group)',
      description: 'Merged onto `<vf-accordion>` via `tailwind-merge` — try `gap-4`.',
      table: { category: 'Styling' },
    },
    itemClass: {
      control: 'text',
      name: 'class (item)',
      description: 'Merged onto every `<vf-accordion-item>`.',
      table: { category: 'Styling' },
    },
  },
  args: {
    multiple: false,
    divider: true,
    disablePayments: false,
    accordionClass: '',
    itemClass: '',
  },
  render: (args) => ({
    props: args,
    template: `<vf-accordion-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          '`vf-accordion` groups collapsible `vf-accordion-item` cards and tracks which ' +
          'ones are expanded via a two-way bound `[(value)]` array of item values — single-open ' +
          'by default, or `[multiple]` to allow several open at once. Every slot (title, ' +
          'description, leading content, badge/avatar cluster and the chevron icon) is ' +
          'content-projected, so nothing is baked in beyond layout, focus and `aria-expanded`/' +
          '`aria-controls` wiring. A `vf-accordion-item` also works standalone (outside any ' +
          '`vf-accordion`) driven by its own `[(expanded)]`. Dark mode follows the shared ' +
          '`dark:` token convention, matching the Figma `accordionItemWithSlot` source.',
      },
      source: { code: usageExample, language: 'ts' },
    },
  },
};

export default meta;
type Story = StoryObj<AccordionStoryHost>;

export const Default: Story = {};

export const MultipleOpen: Story = {
  name: 'Multiple open at once',
  args: { multiple: true },
  parameters: {
    docs: {
      description: {
        story: 'With `[multiple]`, expanding one item no longer collapses the others.',
      },
    },
  },
};

export const DisabledItem: Story = {
  name: 'With a disabled item',
  args: { disablePayments: true },
  parameters: {
    docs: {
      description: {
        story:
          'A disabled item cannot be toggled by click or keyboard and is rendered at reduced ' +
          'opacity, matching the disabled treatment used across the rest of the library.',
      },
    },
  },
};

export const NoDivider: Story = {
  name: 'Without the divider',
  args: { divider: false },
  parameters: {
    docs: {
      description: {
        story: 'Set `[divider]="false"` on an item to drop the line between trigger and body.',
      },
    },
  },
};

export const Standalone: StoryObj = {
  name: 'Standalone item (no group)',
  render: () => ({
    moduleMetadata: { imports: [AccordionItemComponent, DemoChevron] },
    template: `
      <div class="bg-ink-50 dark:bg-ink-950 p-4">
        <vf-accordion-item value="details" [expanded]="true" class="w-96">
          <span vfAccordionTitle>Shipping details</span>
          <span vfAccordionIcon><vf-accordion-demo-chevron /></span>
          <p class="text-ink-600 dark:text-ink-400 text-sm">123 Newbury Street, London</p>
        </vf-accordion-item>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A single `vf-accordion-item` works without a parent `vf-accordion` — drive it with ' +
          'its own `[(expanded)]` instead.\n\n~~~html\n' +
          standaloneExample +
          '\n~~~',
      },
      source: { code: standaloneExample, language: 'html' },
    },
  },
};
