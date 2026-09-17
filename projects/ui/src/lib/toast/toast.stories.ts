import { Component, inject, input } from '@angular/core';
import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { demo } from './demo';
import { VfToast, type ToastTone } from './toast';

@Component({
  selector: 'vf-toast-story',
  template: `
    <div [class]="demo.surface" class="flex flex-wrap gap-3">
      @for (tone of tones; track tone) {
        <button [class]="demo.secondary" (click)="show(tone)">Show {{ tone }}</button>
      }
      <button [class]="demo.danger" (click)="suspend()">Suspend line</button>
      <button [class]="demo.secondary" (click)="toast.dismissAll()">Dismiss all</button>
    </div>
  `,
})
class ToastStoryHost {
  protected readonly toast = inject(VfToast);

  readonly message = input('Plan changed to Red 500. The new allowance starts today.');
  readonly title = input('');
  readonly duration = input(5000);

  protected readonly demo = demo;
  protected readonly tones: ToastTone[] = ['neutral', 'success', 'info', 'warning', 'error'];

  protected show(tone: ToastTone): void {
    this.toast.show(this.message(), {
      tone,
      title: this.title() || undefined,
      // Errors ignore the control unless you set it, so they stay until dismissed.
      duration: tone === 'error' ? undefined : this.duration(),
    });
  }

  protected suspend(): void {
    this.toast.show('Line 010 1234 5678 suspended', {
      action: {
        label: 'Undo',
        run: () => this.toast.success('Line 010 1234 5678 resumed'),
      },
    });
  }
}

const usageExample = `// app.config.ts
providers: [
  provideVfToast(() =>
    inject(LOCALE_ID).startsWith('ar')
      ? { position: 'bottom-start', regionLabel: 'الإشعارات', dismissLabel: 'إغلاق الإشعار' }
      : { position: 'bottom-end' },
  ),
]

// any component or service
private readonly toast = inject(VfToast);

save() {
  this.api.updatePlan(plan).subscribe({
    next: () => this.toast.success('Plan updated'),
    error: () => this.toast.error('Check your connection and try again.', { title: 'Plan not updated' }),
  });
}

suspend(line: Line) {
  this.toast.show(\`Line \${line.number} suspended\`, {
    action: { label: 'Undo', run: () => this.resume(line) },
  });
}`;

const meta: Meta<ToastStoryHost> = {
  title: 'Components/Toast',
  component: ToastStoryHost,
  argTypes: {
    message: {
      control: 'text',
      description: 'Say what happened. For errors, also say what to do next.',
      table: { category: 'ToastOptions' },
    },
    title: {
      control: 'text',
      description: 'Optional. Worth it for errors; most confirmations read better without.',
      table: { category: 'ToastOptions' },
    },
    duration: {
      control: { type: 'number', min: 1000, step: 1000 },
      description:
        'Milliseconds. Errors and toasts with an action default to `Infinity` (WCAG 2.2.1). ' +
        'Timers pause on hover, on focus and while the tab is hidden.',
      table: { category: 'ToastOptions', defaultValue: { summary: '5000' } },
    },
  },
  args: {
    message: 'Plan changed to Red 500. The new allowance starts today.',
    title: '',
    duration: 5000,
  },
  render: (args) => ({
    props: args,
    template: `<vf-toast-story ${argsToTemplate(args)} />`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Brief, non-blocking feedback triggered from code with `VfToast`. Messages are ' +
          'announced through the CDK `LiveAnnouncer` (errors assertively), and at most three ' +
          'show at once; the rest wait with paused timers. Configure position and translated ' +
          'labels once with `provideVfToast()`.',
      },
      source: { code: usageExample, language: 'ts' },
    },
  },
};

export default meta;
type Story = StoryObj<ToastStoryHost>;

export const Default: Story = {};

export const WithTitle: Story = {
  name: 'With a title',
  args: {
    title: 'Payment received',
    message: 'EGP 1,250 was added to your account balance.',
  },
};
