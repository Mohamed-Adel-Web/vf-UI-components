import type { Meta, StoryObj } from '@storybook/angular-vite';

const meta: Meta = {
  title: 'Foundations/Design Tokens',
  parameters: {
    docs: {
      description: {
        component:
          'Tokens are Tailwind v4 `@theme` variables in `projects/ui/styles/theme.css`. ' +
          'Changing one there updates every component and every consuming app.',
      },
    },
  },
};

export default meta;

const swatch = (name: string, varName: string) => `
  <div class="flex items-center gap-3">
    <span class="rounded-control ring-ink-200 h-10 w-10 ring-1" style="background: var(${varName})"></span>
    <code class="text-ink-700 text-xs">${name}</code>
  </div>
`;

const scale = (prefix: string) =>
  [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
    .map((step) => swatch(`${prefix}-${step}`, `--color-${prefix}-${step}`))
    .join('');

export const Colors: StoryObj = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-8">
        <section class="flex flex-col gap-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide">Brand</h3>
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">${scale('brand')}</div>
        </section>
        <section class="flex flex-col gap-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide">Ink</h3>
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">${scale('ink')}</div>
        </section>
        <section class="flex flex-col gap-3">
          <h3 class="text-sm font-semibold uppercase tracking-wide">Semantic</h3>
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            ${['success', 'warning', 'danger', 'info']
              .map((n) => swatch(n, `--color-${n}`))
              .join('')}
          </div>
        </section>
      </div>
    `,
  }),
};

export const RadiiAndElevation: StoryObj = {
  name: 'Radii & elevation',
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-6">
        <div class="rounded-control shadow-control flex h-24 w-40 items-center justify-center bg-white">
          <code class="text-xs">rounded-control</code>
        </div>
        <div class="rounded-surface shadow-overlay flex h-24 w-40 items-center justify-center bg-white">
          <code class="text-xs">rounded-surface</code>
        </div>
      </div>
    `,
  }),
};
