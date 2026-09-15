import { CurrencyPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import {
  TableCellComponent,
  TableComponent,
  TableContainerComponent,
  TableHeadComponent,
  TableRowComponent,
  TableSelectAllComponent,
  TableSelectRowComponent,
  type TableSelectionMode,
  type TableSort,
} from './table';
import type { TableDensity } from './table.variants';

interface Invoice {
  id: string;
  account: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  amount: number;
}

const INVOICES: readonly Invoice[] = [
  { id: 'INV-1042', account: 'Vodafone Business DE', status: 'Paid', amount: 12480.5 },
  { id: 'INV-1043', account: 'Vodafone Retail UK', status: 'Pending', amount: 3190.0 },
  { id: 'INV-1044', account: 'Vodafone Enterprise ES', status: 'Overdue', amount: 27845.75 },
  { id: 'INV-1045', account: 'Vodafone IoT NL', status: 'Paid', amount: 890.25 },
  { id: 'INV-1046', account: 'Vodafone Cloud IT', status: 'Pending', amount: 15620.0 },
];

@Component({
  selector: 'vf-table-story',
  imports: [
    CurrencyPipe,
    TableContainerComponent,
    TableComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    TableSelectAllComponent,
    TableSelectRowComponent,
  ],
  template: `
    <div class="flex flex-col gap-3">
      <div vfTableContainer [class]="containerClass()">
        <table
          vfTable
          [density]="density()"
          [striped]="striped()"
          [stickyHeader]="stickyHeader()"
          [selectionMode]="selectionMode()"
          [(sort)]="sort"
          [(selection)]="selection"
          [class]="tableClass()"
        >
          <thead>
            <tr vfTableRow>
              @if (selectionMode() === 'multiple') {
                <th vfTableHead class="w-12"><input vfTableSelectAll /></th>
              } @else if (selectionMode() === 'single') {
                <th vfTableHead class="w-12"><span class="sr-only">Select</span></th>
              }
              <th vfTableHead sortKey="id">Invoice</th>
              <th vfTableHead sortKey="account">Account</th>
              <th vfTableHead sortKey="status">Status</th>
              <th vfTableHead sortKey="amount" numeric>Amount</th>
            </tr>
          </thead>
          <tbody>
            @for (invoice of sorted(); track invoice.id) {
              <tr vfTableRow [value]="invoice.id">
                @if (selectionMode() !== 'none') {
                  <td vfTableCell>
                    <input vfTableSelectRow [ariaLabel]="'Select ' + invoice.id" />
                  </td>
                }
                <td vfTableCell class="font-medium">{{ invoice.id }}</td>
                <td vfTableCell>{{ invoice.account }}</td>
                <td vfTableCell>
                  <span [class]="statusClass(invoice.status)">{{ invoice.status }}</span>
                </td>
                <td vfTableCell numeric>{{ invoice.amount | currency: 'EUR' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <p class="text-ink-600 dark:text-ink-400 text-xs">
        Sort: {{ sort() ? sort()!.key + ' / ' + sort()!.direction : 'none' }} — Selected:
        {{ selection().length }}
      </p>
    </div>
  `,
})
class TableStoryHost {
  readonly density = input<TableDensity>('comfortable');
  readonly striped = input(false);
  readonly stickyHeader = input(false);
  readonly selectionMode = input<TableSelectionMode>('multiple');
  readonly containerClass = input('');
  readonly tableClass = input('');

  protected readonly sort = signal<TableSort | null>(null);
  protected readonly selection = signal<readonly unknown[]>([]);

  // Sorting the data is the consumer's job; the table only reports the requested order.
  protected readonly sorted = computed(() => {
    const sort = this.sort();
    if (!sort) {
      return INVOICES;
    }
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...INVOICES].sort((a, b) => {
      const left = a[sort.key as keyof Invoice];
      const right = b[sort.key as keyof Invoice];
      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * factor;
      }
      return String(left).localeCompare(String(right)) * factor;
    });
  });

  protected statusClass(status: Invoice['status']): string {
    const tone = {
      Paid: 'bg-success/15 text-success',
      Pending: 'bg-warning/15 text-warning',
      Overdue: 'bg-danger/15 text-danger',
    }[status];
    return `${tone} rounded-control px-2 py-0.5 text-xs font-medium`;
  }
}

const usageExample = `import { Component, computed, signal } from '@angular/core';
import {
  TableCellComponent,
  TableComponent,
  TableContainerComponent,
  TableHeadComponent,
  TableRowComponent,
  TableSelectAllComponent,
  TableSelectRowComponent,
  type TableSort,
} from '@vodafone/ui-components';

@Component({
  selector: 'app-invoices',
  imports: [
    TableContainerComponent,
    TableComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    TableSelectAllComponent,
    TableSelectRowComponent,
  ],
  template: \`
    <div vfTableContainer class="max-h-96">
      <table vfTable stickyHeader striped selectionMode="multiple" [(sort)]="sort" [(selection)]="selection">
        <thead>
          <tr vfTableRow>
            <th vfTableHead class="w-12"><input vfTableSelectAll /></th>
            <th vfTableHead sortKey="id">Invoice</th>
            <th vfTableHead sortKey="amount" numeric>Amount</th>
          </tr>
        </thead>
        <tbody>
          @for (invoice of sorted(); track invoice.id) {
            <tr vfTableRow [value]="invoice.id">
              <td vfTableCell><input vfTableSelectRow [ariaLabel]="'Select ' + invoice.id" /></td>
              <td vfTableCell>{{ invoice.id }}</td>
              <td vfTableCell numeric>{{ invoice.amount | currency: 'EUR' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  \`,
})
export class InvoicesComponent {
  readonly sort = signal<TableSort | null>(null);
  readonly selection = signal<readonly unknown[]>([]);

  // The table reports the requested order; sorting the data stays with you,
  // so server-side sorting works exactly the same way.
  readonly sorted = computed(() => { /* ...sort this.rows() by this.sort()... */ });
}`;

const meta: Meta<TableStoryHost> = {
  title: 'Components/Table',
  component: TableStoryHost,
  argTypes: {
    density: {
      control: 'inline-radio',
      options: ['compact', 'comfortable', 'spacious'],
      description: 'Row padding, inherited by every `th vfTableHead` and `td vfTableCell`.',
      table: { category: 'table[vfTable]', defaultValue: { summary: 'comfortable' } },
    },
    striped: {
      control: 'boolean',
      description: 'Zebra-stripes body rows. Header rows are excluded automatically.',
      table: { category: 'table[vfTable]' },
    },
    stickyHeader: {
      control: 'boolean',
      description: 'Pins the header while the body scrolls. Needs `<div vfTableContainer>`.',
      table: { category: 'table[vfTable]' },
    },
    selectionMode: {
      control: 'inline-radio',
      options: ['none', 'single', 'multiple'],
      description: 'Drives `[(selection)]`, the select-all checkbox and row `aria-selected`.',
      table: { category: 'table[vfTable]', defaultValue: { summary: 'none' } },
    },
    containerClass: {
      control: 'text',
      name: 'class (container)',
      description: 'Merged onto `<div vfTableContainer>` — e.g. `max-h-72` to force scrolling.',
      table: { category: 'Styling' },
    },
    tableClass: {
      control: 'text',
      name: 'class (table)',
      description: 'Merged onto `<table vfTable>`.',
      table: { category: 'Styling' },
    },
  },
  args: {
    density: 'comfortable',
    striped: false,
    stickyHeader: false,
    selectionMode: 'multiple',
    containerClass: '',
    tableClass: '',
  },
  render: (args) => ({
    props: args,
    template: `<vf-table-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        component: `
\`vfTable\` is a set of attribute components on a real \`<table>\`, so the semantics,
screen-reader behaviour and copy/paste support of a native table are kept intact.
It owns the *interaction* state — sort order and selection — and leaves data handling
to you, which is what makes server-side sorting and pagination straightforward:

- **Sorting**: \`<th vfTableHead sortKey="amount">\` renders an accessible sort trigger,
  maintains \`aria-sort\` and cycles ascending → descending → unsorted. The table writes
  the request to \`[(sort)]\`; sorting the rows stays with the consumer.
- **Selection**: \`<tr vfTableRow [value]="row.id">\` identifies a row, and
  \`<input vfTableSelectRow>\` / \`<input vfTableSelectAll>\` bind to it. Select-all skips
  disabled rows and reports a proper indeterminate state.
- **Sticky header**: wrap the table in \`<div vfTableContainer>\` and set \`stickyHeader\`.
- **Density** is set once on the table and inherited by every cell.

Every part takes a plain \`class\`, merged last via \`tailwind-merge\`.
`,
      },
      source: { code: usageExample, language: 'ts' },
    },
  },
};

export default meta;
type Story = StoryObj<TableStoryHost>;

export const Default: Story = {};

export const Striped: Story = {
  args: { striped: true },
  parameters: {
    docs: {
      description: {
        story: 'Striping targets body rows only, so the header keeps its own background.',
      },
      source: { code: '<table vfTable striped>...</table>', language: 'html' },
    },
  },
};

export const StickyHeader: Story = {
  name: 'Sticky header',
  args: { stickyHeader: true, containerClass: 'max-h-64', density: 'compact' },
  parameters: {
    docs: {
      description: {
        story:
          'The header pins to the top of the scroll container. `vfTableContainer` supplies the ' +
          'scrolling ancestor `position: sticky` needs — without it the header will not stick.',
      },
      source: {
        code: `<div vfTableContainer class="max-h-64">
  <table vfTable stickyHeader density="compact">...</table>
</div>`,
        language: 'html',
      },
    },
  },
};

export const SingleSelection: Story = {
  name: 'Single selection',
  args: { selectionMode: 'single' },
  parameters: {
    docs: {
      description: {
        story: 'Selecting a row clears the previous one, and the select-all checkbox is dropped.',
      },
      source: { code: '<table vfTable selectionMode="single">...</table>', language: 'html' },
    },
  },
};

export const ReadOnly: Story = {
  name: 'No selection',
  args: { selectionMode: 'none' },
  parameters: {
    docs: {
      description: {
        story:
          'With selection off, rows drop `aria-selected` entirely rather than reporting ' +
          '`false` to assistive tech.',
      },
    },
  },
};

export const Densities: Story = {
  args: { density: 'compact', striped: true },
  parameters: {
    docs: {
      description: {
        story: 'Set `density` once on the table; every header and body cell picks it up.',
      },
      source: { code: '<table vfTable density="compact">...</table>', language: 'html' },
    },
  },
};
