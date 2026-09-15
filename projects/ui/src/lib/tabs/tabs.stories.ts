import { Component, input, linkedSignal } from '@angular/core';
import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { TabComponent, TabPanelComponent, TabsComponent } from './tabs';
import type { TabsOrientation } from './tabs.variants';

@Component({
  selector: 'vf-tabs-story',
  imports: [TabsComponent, TabComponent, TabPanelComponent],
  template: `
    <div class="bg-ink-50 dark:bg-ink-950 p-4">
      <vf-tabs
        #tabs
        [(value)]="active"
        [orientation]="orientation()"
        [ariaLabel]="ariaLabel()"
        [class]="tabsClass()"
      >
        <button vfTab value="overview" [class]="tabClass()">Overview</button>
        <button vfTab value="solutions" [class]="tabClass()">Solutions</button>
        <button vfTab value="mobility" [class]="tabClass()" [disabled]="disableMobility()">
          Mobility
        </button>
        <button vfTab value="spend" [class]="tabClass()">Spend details</button>
        <button vfTab value="dashboard" [class]="tabClass()">Add dashboard view</button>
      </vf-tabs>

      <vf-tab-panel [tabs]="tabs" value="overview" [class]="panelClass()"
        >Overview content.</vf-tab-panel
      >
      <vf-tab-panel [tabs]="tabs" value="solutions" [class]="panelClass()"
        >Solutions content.</vf-tab-panel
      >
      <vf-tab-panel [tabs]="tabs" value="mobility" [class]="panelClass()"
        >Mobility content.</vf-tab-panel
      >
      <vf-tab-panel [tabs]="tabs" value="spend" [class]="panelClass()"
        >Spend details content.</vf-tab-panel
      >
      <vf-tab-panel [tabs]="tabs" value="dashboard" [class]="panelClass()">
        Add dashboard view content.
      </vf-tab-panel>
    </div>
  `,
})
class TabsStoryHost {
  readonly orientation = input<TabsOrientation>('horizontal');
  readonly ariaLabel = input('Account sections');
  readonly disableMobility = input(false);
  readonly tabsClass = input('');
  readonly tabClass = input('');
  readonly panelClass = input('text-ink-950 dark:text-ink-50 p-4 text-sm');
  readonly selected = input('spend');

  // linkedSignal so the Controls panel can reset the selection while clicks still win.
  protected readonly active = linkedSignal(() => this.selected());
}

const usageExample = `import { Component, signal } from '@angular/core';
import { TabComponent, TabPanelComponent, TabsComponent } from '@vodafone/ui-components';

@Component({
  selector: 'app-account',
  imports: [TabsComponent, TabComponent, TabPanelComponent],
  template: \`
    <vf-tabs #tabs [(value)]="active" ariaLabel="Account sections">
      <button vfTab value="overview">Overview</button>
      <button vfTab value="solutions">Solutions</button>
      <button vfTab value="mobility">Mobility</button>
      <button vfTab value="spend">Spend details</button>
      <button vfTab value="dashboard">Add dashboard view</button>
    </vf-tabs>

    <vf-tab-panel [tabs]="tabs" value="overview">Overview content.</vf-tab-panel>
    <vf-tab-panel [tabs]="tabs" value="solutions">Solutions content.</vf-tab-panel>
    <vf-tab-panel [tabs]="tabs" value="mobility">Mobility content.</vf-tab-panel>
    <vf-tab-panel [tabs]="tabs" value="spend">Spend details content.</vf-tab-panel>
    <vf-tab-panel [tabs]="tabs" value="dashboard">Add dashboard view content.</vf-tab-panel>
  \`,
})
export class AccountComponent {
  // Two-way bound; omit it and the first enabled tab is selected automatically.
  readonly active = signal('spend');
}`;

const disabledExample = `<vf-tabs #tabs value="overview" ariaLabel="Account sections">
  <button vfTab value="overview">Overview</button>
  <button vfTab value="solutions" disabled>Solutions</button>
  <button vfTab value="mobility">Mobility</button>
</vf-tabs>

<vf-tab-panel [tabs]="tabs" value="overview">Overview content.</vf-tab-panel>
<vf-tab-panel [tabs]="tabs" value="solutions">Solutions content.</vf-tab-panel>
<vf-tab-panel [tabs]="tabs" value="mobility">Mobility content.</vf-tab-panel>`;

const classExample = `<!-- class is merged last via tailwind-merge, so these win over the defaults -->
<vf-tabs #tabs value="spend" ariaLabel="Account sections" class="border-brand-600 gap-2">
  <button vfTab value="overview" class="rounded-none px-6 uppercase tracking-wide">Overview</button>
  <button vfTab value="spend" class="rounded-none px-6 uppercase tracking-wide">Spend details</button>
</vf-tabs>

<vf-tab-panel
  [tabs]="tabs"
  value="overview"
  class="rounded-surface bg-ink-100 dark:bg-ink-900 p-4 text-sm"
>
  Overview content.
</vf-tab-panel>`;

const meta: Meta<TabsStoryHost> = {
  title: 'Components/Tabs',
  component: TabsStoryHost,
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
      description: 'Lays the tablist out in a row or a column and sets `aria-orientation`.',
      table: { category: 'vf-tabs', defaultValue: { summary: 'horizontal' } },
    },
    selected: {
      control: 'text',
      name: 'value',
      description:
        'Two-way bound `[(value)]`. Leave empty and the first enabled tab is selected for you.',
      table: { category: 'vf-tabs' },
    },
    ariaLabel: {
      control: 'text',
      description: 'Names the tablist for screen readers.',
      table: { category: 'vf-tabs' },
    },
    tabsClass: {
      control: 'text',
      name: 'class (group)',
      description:
        'Merged onto `<vf-tabs>` via `tailwind-merge` — try `border-brand-600 gap-4` or ' +
        '`border-b-0`.',
      table: { category: 'Styling' },
    },
    tabClass: {
      control: 'text',
      name: 'class (tab)',
      description:
        'Merged onto every `<button vfTab>` — try `px-6 text-sm uppercase` or ' + '`rounded-none`.',
      table: { category: 'Styling' },
    },
    panelClass: {
      control: 'text',
      name: 'class (panel)',
      description: 'Merged onto every `<vf-tab-panel>`.',
      table: { category: 'Styling' },
    },
    disableMobility: {
      control: 'boolean',
      name: 'disabled (Mobility tab)',
      description: 'Disables a single tab so you can see how navigation skips it.',
      table: { category: 'button[vfTab]' },
    },
  },
  args: {
    orientation: 'horizontal',
    selected: 'spend',
    ariaLabel: 'Account sections',
    tabsClass: '',
    tabClass: '',
    panelClass: 'text-ink-950 dark:text-ink-50 p-4 text-sm',
    disableMobility: false,
  },
  render: (args) => ({
    props: args,
    template: `<vf-tabs-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          '`vf-tabs` is a headless, accessible tab group shared across teams. Drop native ' +
          '`<button vfTab value="...">` triggers inside it, then place each ' +
          '`<vf-tab-panel [tabs]="tabs" value="...">` next to the group (tag it ' +
          '`<vf-tabs #tabs>`) so the markup stays valid ARIA. Selection, roving `tabindex` ' +
          'and arrow/Home/End keyboard navigation are handled for you.',
      },
      // The rendered story is a wrapper component, so show the real consumer code instead.
      source: { code: usageExample, language: 'ts' },
    },
  },
};

export default meta;
type Story = StoryObj<TabsStoryHost>;

export const Default: Story = {};

export const Disabled: Story = {
  name: 'With a disabled tab',
  parameters: {
    docs: {
      description: {
        story:
          'A disabled tab is skipped by arrow/Home/End navigation and cannot be selected by ' +
          'click. The bare `disabled` attribute works because the input uses Angular\u2019s ' +
          '`booleanAttribute` transform.',
      },
      source: { code: disabledExample, language: 'html' },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [TabsComponent, TabComponent, TabPanelComponent] },
    template: `
      <div class="bg-ink-50 dark:bg-ink-950 p-4">
        <vf-tabs #tabs value="overview" ariaLabel="Account sections">
          <button vfTab value="overview">Overview</button>
          <button vfTab value="solutions" disabled>Solutions</button>
          <button vfTab value="mobility">Mobility</button>
        </vf-tabs>

        <vf-tab-panel [tabs]="tabs" value="overview" class="text-ink-950 dark:text-ink-50 p-4 text-sm">
          Overview content.
        </vf-tab-panel>
        <vf-tab-panel [tabs]="tabs" value="solutions" class="text-ink-950 dark:text-ink-50 p-4 text-sm">
          Solutions content.
        </vf-tab-panel>
        <vf-tab-panel [tabs]="tabs" value="mobility" class="text-ink-950 dark:text-ink-50 p-4 text-sm">
          Mobility content.
        </vf-tab-panel>
      </div>
    `,
  }),
};

export const Vertical: Story = {
  name: 'Vertical orientation',
  args: { orientation: 'vertical' },
  parameters: {
    docs: {
      description: {
        story:
          'Set `orientation="vertical"` to stack the tabs; `aria-orientation` follows, so Up/Down ' +
          'arrows read naturally to assistive tech.',
      },
      source: {
        code: '<vf-tabs orientation="vertical" ariaLabel="Account sections">...</vf-tabs>',
        language: 'html',
      },
    },
  },
};

export const ClassOverride: Story = {
  name: 'Custom classes',
  args: {
    tabsClass: 'border-brand-600 gap-2',
    tabClass: 'rounded-none px-6 uppercase tracking-wide',
    panelClass:
      'text-ink-950 dark:text-ink-50 rounded-surface bg-ink-100 dark:bg-ink-900 p-4 text-sm',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Every part takes a plain `class` attribute, merged last through `tailwind-merge` so ' +
          'consumer values override the defaults instead of fighting on specificity. Edit the ' +
          '**Styling** controls to try your own.',
      },
      source: { code: classExample, language: 'html' },
    },
  },
};
