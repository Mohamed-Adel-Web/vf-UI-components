import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';
import { cn } from '../utils/cn';
import {
  tableCellVariants,
  tableCheckboxVariants,
  tableContainerVariants,
  tableHeadVariants,
  tableRowVariants,
  tableVariants,
  type TableAlign,
  type TableDensity,
} from './table.variants';

export type TableSortDirection = 'asc' | 'desc';
export type TableSelectionMode = 'none' | 'single' | 'multiple';

export interface TableSort {
  key: string;
  direction: TableSortDirection;
}

/**
 * Scroll container for `<table vfTable>`. Sticky headers need a scrolling
 * ancestor, so wrap the table in this whenever `stickyHeader` is on.
 */
@Component({
  selector: 'div[vfTableContainer]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { '[class]': 'hostClass()' },
})
export class TableContainerComponent {
  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly hostClass = computed(() => cn(tableContainerVariants(), this.userClass()));
}

// Declared before TableComponent: contentChildren(TableRowComponent) is evaluated
// eagerly as part of the component definition, so a forward reference would throw.
@Component({
  selector: 'tr[vfTableRow]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: {
    '[class]': 'hostClass()',
    '[attr.data-selected]': 'selected() || null',
    '[attr.aria-selected]': 'ariaSelected()',
  },
})
export class TableRowComponent {
  private readonly table = inject(TableComponent);

  /** Identifies the row for selection. Rows without a value are treated as layout rows. */
  readonly value = input<unknown>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Opts a row into hover feedback when it is not selectable. */
  readonly interactive = input(false, { transform: booleanAttribute });

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  readonly isDataRow = computed(() => this.value() !== undefined);
  readonly selected = computed(() => this.isDataRow() && this.table.isSelected(this.value()));

  protected readonly ariaSelected = computed(() =>
    this.table.selectionMode() !== 'none' && this.isDataRow() ? this.selected() : null,
  );

  protected readonly hostClass = computed(() =>
    cn(
      tableRowVariants({
        striped: this.table.striped() && this.isDataRow(),
        hoverable: this.interactive() || this.isDataRow(),
        selected: this.selected(),
        disabled: this.disabled(),
      }),
      this.userClass(),
    ),
  );

  toggle(): void {
    if (this.isDataRow() && !this.disabled()) {
      this.table.toggle(this.value());
    }
  }
}

@Component({
  selector: 'table[vfTable]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { '[class]': 'hostClass()' },
})
export class TableComponent {
  readonly density = input<TableDensity>('comfortable');
  readonly striped = input(false, { transform: booleanAttribute });
  /** Requires a scrolling ancestor — wrap the table in `<div vfTableContainer>`. */
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly selectionMode = input<TableSelectionMode>('none');

  /** Two-way bindable. `null` means unsorted; sorting the data stays the consumer's job. */
  readonly sort = model<TableSort | null>(null);
  /** Two-way bindable list of selected row values. */
  readonly selection = model<readonly unknown[]>([]);

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  private readonly rows = contentChildren(TableRowComponent, { descendants: true });
  private readonly selectableRows = computed(() =>
    this.rows().filter((row) => row.isDataRow() && !row.disabled()),
  );

  readonly allSelected = computed(() => {
    const rows = this.selectableRows();
    return rows.length > 0 && rows.every((row) => this.isSelected(row.value()));
  });

  readonly someSelected = computed(
    () => !this.allSelected() && this.selectableRows().some((row) => this.isSelected(row.value())),
  );

  protected readonly hostClass = computed(() => cn(tableVariants(), this.userClass()));

  isSelected(value: unknown): boolean {
    return this.selection().includes(value);
  }

  toggle(value: unknown): void {
    const mode = this.selectionMode();
    if (mode === 'none') {
      return;
    }
    if (mode === 'single') {
      this.selection.set(this.isSelected(value) ? [] : [value]);
      return;
    }
    const without = this.selection().filter((selected) => selected !== value);
    this.selection.set(
      without.length === this.selection().length ? [...this.selection(), value] : without,
    );
  }

  toggleAll(checked: boolean): void {
    this.selection.set(checked ? this.selectableRows().map((row) => row.value()) : []);
  }

  directionFor(key: string): TableSortDirection | null {
    const sort = this.sort();
    return sort?.key === key ? sort.direction : null;
  }

  /** Cycles ascending -> descending -> unsorted. */
  toggleSort(key: string): void {
    const direction = this.directionFor(key);
    if (direction === null) {
      this.sort.set({ key, direction: 'asc' });
    } else if (direction === 'asc') {
      this.sort.set({ key, direction: 'desc' });
    } else {
      this.sort.set(null);
    }
  }
}

@Component({
  selector: 'th[vfTableHead]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      [class]="triggerClass()"
      [attr.role]="sortKey() ? 'button' : null"
      [attr.tabindex]="sortKey() ? 0 : null"
      (click)="toggle()"
      (keydown.enter)="onKeydown($event)"
      (keydown.space)="onKeydown($event)"
    >
      <ng-content />
      @if (sortKey()) {
        <svg [class]="arrowClass()" viewBox="0 0 10 6" aria-hidden="true">
          <path d="M5 0 10 6H0z" fill="currentColor" />
        </svg>
      }
    </span>
  `,
  host: {
    '[class]': 'hostClass()',
    '[attr.scope]': 'scope()',
    '[attr.aria-sort]': 'ariaSort()',
  },
})
export class TableHeadComponent {
  private readonly table = inject(TableComponent);

  /** Enables sorting for this column and identifies it in the table's `sort` model. */
  readonly sortKey = input<string>();
  readonly align = input<TableAlign>('start');
  readonly numeric = input(false, { transform: booleanAttribute });
  readonly scope = input<'col' | 'row'>('col');

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly direction = computed(() => {
    const key = this.sortKey();
    return key ? this.table.directionFor(key) : null;
  });

  protected readonly ariaSort = computed(() => {
    if (!this.sortKey()) {
      return null;
    }
    const direction = this.direction();
    return direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none';
  });

  protected readonly hostClass = computed(() =>
    cn(
      tableHeadVariants({
        density: this.table.density(),
        align: this.align(),
        numeric: this.numeric(),
        sticky: this.table.stickyHeader(),
      }),
      this.userClass(),
    ),
  );

  protected readonly triggerClass = computed(() =>
    cn(
      'group inline-flex items-center gap-1.5',
      this.sortKey() && 'focus-ring hover:text-ink-950 dark:hover:text-ink-50 cursor-pointer',
    ),
  );

  protected readonly arrowClass = computed(() =>
    cn(
      'size-2.5 shrink-0 transition-transform',
      this.direction() === 'desc' && 'rotate-180',
      !this.direction() && 'opacity-0 group-hover:opacity-40',
    ),
  );

  protected toggle(): void {
    const key = this.sortKey();
    if (key) {
      this.table.toggleSort(key);
    }
  }

  protected onKeydown(event: Event): void {
    // Space would scroll the page, and Enter would submit an enclosing form.
    event.preventDefault();
    this.toggle();
  }
}

@Component({
  selector: 'td[vfTableCell]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  host: { '[class]': 'hostClass()' },
})
export class TableCellComponent {
  private readonly table = inject(TableComponent);

  readonly align = input<TableAlign>('start');
  readonly numeric = input(false, { transform: booleanAttribute });

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly hostClass = computed(() =>
    cn(
      tableCellVariants({
        density: this.table.density(),
        align: this.align(),
        numeric: this.numeric(),
      }),
      this.userClass(),
    ),
  );
}

/** Header checkbox that selects or clears every selectable row. */
@Component({
  selector: 'input[vfTableSelectAll]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  host: {
    type: 'checkbox',
    '[class]': 'hostClass()',
    '[checked]': 'table.allSelected()',
    '[indeterminate]': 'table.someSelected()',
    '[attr.aria-label]': 'ariaLabel()',
    '(change)': 'onChange($event)',
  },
})
export class TableSelectAllComponent {
  protected readonly table = inject(TableComponent);

  readonly ariaLabel = input('Select all rows');

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly hostClass = computed(() => cn(tableCheckboxVariants(), this.userClass()));

  protected onChange(event: Event): void {
    this.table.toggleAll((event.target as HTMLInputElement).checked);
  }
}

/** Row checkbox, bound to the `value` of its enclosing `<tr vfTableRow>`. */
@Component({
  selector: 'input[vfTableSelectRow]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  host: {
    type: 'checkbox',
    '[class]': 'hostClass()',
    '[checked]': 'row.selected()',
    '[disabled]': 'row.disabled()',
    '[attr.aria-label]': 'ariaLabel()',
    '(change)': 'row.toggle()',
  },
})
export class TableSelectRowComponent {
  protected readonly row = inject(TableRowComponent);

  readonly ariaLabel = input('Select row');

  /** Escape hatch: consumer classes are merged last so they override defaults. */
  readonly userClass = input<string>('', { alias: 'class' });

  protected readonly hostClass = computed(() => cn(tableCheckboxVariants(), this.userClass()));
}
