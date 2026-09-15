import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { ButtonComponent } from './button';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'icon'] },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    props: args,
    template: `<button vfButton ${argsToTemplate(args)}>Button</button>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Attribute component applied to a native `<button>` or `<a>`, so semantics, ' +
          'keyboard behaviour and form participation come free from the host element.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {};

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <button vfButton variant="primary">Primary</button>
        <button vfButton variant="secondary">Secondary</button>
        <button vfButton variant="outline">Outline</button>
        <button vfButton variant="ghost">Ghost</button>
        <button vfButton variant="danger">Danger</button>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <button vfButton size="sm">Small</button>
        <button vfButton size="md">Medium</button>
        <button vfButton size="lg">Large</button>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const AsLink: Story = {
  name: 'Rendered as anchor',
  render: () => ({
    template: `<a vfButton variant="outline" href="https://angular.dev">Go to angular.dev</a>`,
  }),
};

export const ClassOverride: Story = {
  name: 'Consumer class wins',
  parameters: {
    docs: {
      description: {
        story:
          '`tailwind-merge` resolves conflicts, so a consumer `bg-*` replaces the ' +
          'variant background instead of fighting it on specificity.',
      },
    },
  },
  render: () => ({
    template: `<button vfButton class="bg-ink-900 hover:bg-ink-800">Custom background</button>`,
  }),
};
