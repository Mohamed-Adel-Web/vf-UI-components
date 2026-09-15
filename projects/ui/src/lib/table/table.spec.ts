import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  TableCellComponent,
  TableComponent,
  TableHeadComponent,
  TableRowComponent,
  TableSelectAllComponent,
  TableSelectRowComponent,
  type TableSelectionMode,
  type TableSort,
} from './table';

interface Invoice {
  id: string;
  amount: number;
}

@Component({
  imports: [
    TableComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    TableSelectAllComponent,
    TableSelectRowComponent,
  ],
  template: `
    <table vfTable [(sort)]="sort" [(selection)]="selection" [selectionMode]="selectionMode()">
      <thead>
        <tr vfTableRow>
          <th vfTableHead><input vfTableSelectAll /></th>
          <th vfTableHead sortKey="id">Invoice</th>
          <th vfTableHead sortKey="amount" numeric>Amount</th>
          <th vfTableHead>Actions</th>
        </tr>
      </thead>
      <tbody>
        @for (invoice of invoices(); track invoice.id) {
          <tr vfTableRow [value]="invoice.id" [disabled]="invoice.id === blocked()">
            <td vfTableCell><input vfTableSelectRow /></td>
            <td vfTableCell>{{ invoice.id }}</td>
            <td vfTableCell numeric>{{ invoice.amount }}</td>
            <td vfTableCell>-</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
class HostComponent {
  readonly invoices = signal<Invoice[]>([
    { id: 'INV-1', amount: 30 },
    { id: 'INV-2', amount: 10 },
    { id: 'INV-3', amount: 20 },
  ]);
  readonly sort = signal<TableSort | null>(null);
  readonly selection = signal<readonly unknown[]>([]);
  readonly selectionMode = signal<TableSelectionMode>('multiple');
  readonly blocked = signal('');
}

function render() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const headers = Array.from(fixture.nativeElement.querySelectorAll<HTMLElement>('th'));
  const checkboxes = Array.from(
    fixture.nativeElement.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
  );
  return { fixture, headers, selectAll: checkboxes[0], rowBoxes: checkboxes.slice(1) };
}

describe('TableComponent', () => {
  it('cycles a sortable column ascending, descending, then unsorted', () => {
    const { fixture, headers } = render();
    const trigger = headers[1].querySelector<HTMLElement>('[role="button"]')!;

    expect(headers[1].getAttribute('aria-sort')).toBe('none');

    trigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.sort()).toEqual({ key: 'id', direction: 'asc' });
    expect(headers[1].getAttribute('aria-sort')).toBe('ascending');

    trigger.click();
    fixture.detectChanges();
    expect(headers[1].getAttribute('aria-sort')).toBe('descending');

    trigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.sort()).toBeNull();
    expect(headers[1].getAttribute('aria-sort')).toBe('none');
  });

  it('switching columns starts the new column ascending', () => {
    const { fixture, headers } = render();
    headers[1].querySelector<HTMLElement>('[role="button"]')!.click();
    fixture.detectChanges();
    headers[2].querySelector<HTMLElement>('[role="button"]')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.sort()).toEqual({ key: 'amount', direction: 'asc' });
    expect(headers[1].getAttribute('aria-sort')).toBe('none');
  });

  it('leaves non-sortable columns without a sort affordance', () => {
    const { headers } = render();
    expect(headers[3].hasAttribute('aria-sort')).toBe(false);
    expect(headers[3].querySelector('[role="button"]')).toBeNull();
  });

  it('selects and deselects a row through its checkbox', () => {
    const { fixture, rowBoxes } = render();
    rowBoxes[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection()).toEqual(['INV-1']);

    rowBoxes[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection()).toEqual([]);
  });

  it('keeps only one row selected in single mode', () => {
    const { fixture, rowBoxes } = render();
    fixture.componentInstance.selectionMode.set('single');
    fixture.detectChanges();

    rowBoxes[0].click();
    fixture.detectChanges();
    rowBoxes[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selection()).toEqual(['INV-2']);
  });

  it('select-all toggles every row and reports an indeterminate state', () => {
    const { fixture, selectAll, rowBoxes } = render();
    rowBoxes[0].click();
    fixture.detectChanges();
    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll.checked).toBe(false);

    selectAll.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection()).toEqual(['INV-1', 'INV-2', 'INV-3']);
    expect(selectAll.indeterminate).toBe(false);
    expect(selectAll.checked).toBe(true);

    selectAll.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection()).toEqual([]);
  });

  it('excludes disabled rows from select-all', () => {
    const { fixture, selectAll } = render();
    fixture.componentInstance.blocked.set('INV-2');
    fixture.detectChanges();

    selectAll.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.selection()).toEqual(['INV-1', 'INV-3']);
  });

  it('marks selected rows for assistive tech and styling', () => {
    const { fixture, rowBoxes } = render();
    const row = fixture.nativeElement.querySelector<HTMLElement>('tbody tr')!;
    expect(row.getAttribute('aria-selected')).toBe('false');

    rowBoxes[0].click();
    fixture.detectChanges();
    expect(row.getAttribute('aria-selected')).toBe('true');
    expect(row.getAttribute('data-selected')).toBe('true');
  });

  it('omits aria-selected when selection is off', () => {
    const { fixture } = render();
    fixture.componentInstance.selectionMode.set('none');
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector<HTMLElement>('tbody tr')!;
    expect(row.hasAttribute('aria-selected')).toBe(false);
  });
});
