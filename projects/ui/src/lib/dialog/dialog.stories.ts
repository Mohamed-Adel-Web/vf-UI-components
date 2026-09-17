import { Component, inject, input, signal } from '@angular/core';
import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { demo } from './demo';
import { DIALOG_DATA, DIALOG_PARTS, VfDialog } from './dialog';
import type { DialogSize } from './dialog.variants';

interface LineDetails {
  number: string;
  nickname: string;
  limit: number;
}

@Component({
  selector: 'vf-edit-line-dialog',
  imports: [...DIALOG_PARTS],
  template: `
    <vf-dialog-header>
      <h2 vfDialogTitle>Edit line details</h2>
      <button vfDialogCloseIcon>close</button>
    </vf-dialog-header>
    <vf-dialog-body class="flex flex-col gap-4">
      <p vfDialogDescription>Changes to {{ data.number }} apply from the next billing cycle.</p>
      <label class="flex flex-col gap-1 text-sm font-medium">
        Line nickname
        <input [class]="demo.field" [value]="data.nickname" />
      </label>
      <label class="flex flex-col gap-1 text-sm font-medium">
        Monthly spend limit (EGP)
        <input type="number" inputmode="numeric" [class]="demo.field" [value]="data.limit" />
      </label>
    </vf-dialog-body>
    <vf-dialog-footer>
      <button vfDialogClose [class]="demo.secondary">Cancel</button>
      <button vfDialogClose="saved" [class]="demo.primary">Save changes</button>
    </vf-dialog-footer>
  `,
})
class EditLineDialog {
  protected readonly data = inject<LineDetails>(DIALOG_DATA);
  protected readonly demo = demo;
}

@Component({
  selector: 'vf-dialog-story',
  imports: [...DIALOG_PARTS],
  template: `
    <div [class]="demo.surface">
      <div class="flex flex-wrap items-center gap-3">
        <button [class]="demo.danger" (click)="confirmOpen.set(true)">Suspend line</button>
        <button [class]="demo.secondary" (click)="openEdit()">Edit line details</button>
      </div>
      <p class="mt-4 text-sm" aria-live="polite">Last result: {{ lastResult() }}</p>
    </div>

    <ng-template
      vfDialog
      [(open)]="confirmOpen"
      [size]="size()"
      [role]="role()"
      [dismissible]="dismissible()"
      autoFocus="dialog"
      (closed)="lastResult.set($event ? 'suspended' : 'kept active')"
    >
      <vf-dialog-header>
        <h2 vfDialogTitle>Suspend 010 1234 5678?</h2>
        @if (dismissible()) {
          <button vfDialogCloseIcon>close</button>
        }
      </vf-dialog-header>
      <vf-dialog-body>
        <p vfDialogDescription>
          Calls, SMS and data stop right away. You can resume the line from this page within 90
          days.
        </p>
      </vf-dialog-body>
      <vf-dialog-footer>
        <button vfDialogClose [class]="demo.secondary">Keep line active</button>
        <button [vfDialogClose]="true" [class]="demo.danger">Suspend line</button>
      </vf-dialog-footer>
    </ng-template>
  `,
})
class DialogStoryHost {
  private readonly dialog = inject(VfDialog);

  readonly size = input<DialogSize>('sm');
  readonly role = input<'dialog' | 'alertdialog'>('alertdialog');
  readonly dismissible = input(true);

  protected readonly demo = demo;
  protected readonly confirmOpen = signal(false);
  protected readonly lastResult = signal('none yet');

  protected openEdit(): void {
    this.dialog
      .open<string, LineDetails>(EditLineDialog, {
        data: { number: '010 1234 5678', nickname: 'Sales team', limit: 1500 },
        size: 'md',
        dismissible: this.dismissible(),
      })
      .closed.subscribe((result) => this.lastResult.set(result ?? 'cancelled'));
  }
}

const declarativeExample = `<button (click)="confirmOpen.set(true)">Suspend line</button>

<ng-template vfDialog [(open)]="confirmOpen" role="alertdialog" size="sm" autoFocus="dialog"
  (closed)="$event && suspend()">
  <vf-dialog-header>
    <h2 vfDialogTitle>Suspend 010 1234 5678?</h2>
    <button vfDialogCloseIcon label="إغلاق"></button> <!-- translate on Arabic pages -->
  </vf-dialog-header>
  <vf-dialog-body>
    <p vfDialogDescription>Calls, SMS and data stop right away.</p>
  </vf-dialog-body>
  <vf-dialog-footer>
    <button vfDialogClose vfButton variant="secondary">Keep line active</button>
    <button [vfDialogClose]="true" vfButton variant="danger">Suspend line</button>
  </vf-dialog-footer>
</ng-template>`;

const serviceExample = `import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DIALOG_PARTS, VfDialog } from '@vodafone/ui-components';

@Component({
  selector: 'app-edit-line-dialog',
  imports: [...DIALOG_PARTS],
  template: \`
    <vf-dialog-header>
      <h2 vfDialogTitle>Edit line details</h2>
      <button vfDialogCloseIcon></button>
    </vf-dialog-header>
    <vf-dialog-body>...</vf-dialog-body>
    <vf-dialog-footer>
      <button vfDialogClose>Cancel</button>
      <button [vfDialogClose]="form.value">Save changes</button>
    </vf-dialog-footer>
  \`,
})
export class EditLineDialog {
  readonly line = inject<Line>(DIALOG_DATA);
}

// In the caller:
private readonly dialog = inject(VfDialog);

edit(line: Line) {
  this.dialog
    .open<LineForm, Line>(EditLineDialog, { data: line, size: 'md' })
    .closed.subscribe((value) => value && this.save(value));
}`;

const meta: Meta<DialogStoryHost> = {
  title: 'Components/Dialog',
  component: DialogStoryHost,
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Maximum width. Always capped to the viewport minus 1rem on each side.',
      table: { category: 'vfDialog', defaultValue: { summary: 'md' } },
    },
    role: {
      control: 'inline-radio',
      options: ['dialog', 'alertdialog'],
      description:
        '`alertdialog` for confirmations that interrupt the user, such as destructive actions.',
      table: { category: 'vfDialog', defaultValue: { summary: 'dialog' } },
    },
    dismissible: {
      control: 'boolean',
      description: 'Escape and backdrop clicks close the dialog with an `undefined` result.',
      table: { category: 'vfDialog', defaultValue: { summary: 'true' } },
    },
  },
  args: {
    size: 'sm',
    role: 'alertdialog',
    dismissible: true,
  },
  render: (args) => ({
    props: args,
    template: `<vf-dialog-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Modal dialogs built on `@angular/cdk/dialog` through the shared `ModalSurface`, so ' +
          'focus trapping, focus return, scroll lock, `aria-modal` and Escape handling match ' +
          'the drawer. Put `vfDialogTitle` on the heading and `vfDialogDescription` on the ' +
          'supporting text: the dialog is labelled and described automatically. Open it ' +
          'declaratively with `<ng-template vfDialog [(open)]>`, or from code with `VfDialog`.',
      },
      source: { code: declarativeExample, language: 'html' },
    },
  },
};

export default meta;
type Story = StoryObj<DialogStoryHost>;

export const Default: Story = {};

export const ServiceApi: Story = {
  name: 'Opened from code',
  args: { role: 'dialog' },
  parameters: {
    docs: {
      description: {
        story:
          'Use `VfDialog.open()` when the content is its own component, such as a form. Data ' +
          'arrives through `DIALOG_DATA`; the value passed to `vfDialogClose` comes back ' +
          'through `closed`. Click **Edit line details** above.',
      },
      source: { code: serviceExample, language: 'ts' },
    },
  },
};

export const Blocking: Story = {
  name: 'Not dismissible',
  args: { dismissible: false },
  parameters: {
    docs: {
      description: {
        story:
          'With `dismissible` off, Escape and the backdrop do nothing, so the user has to pick ' +
          'an action. Keep this for decisions that genuinely cannot be skipped.',
      },
      source: {
        code: '<ng-template vfDialog [(open)]="open" [dismissible]="false">...</ng-template>',
        language: 'html',
      },
    },
  },
};
