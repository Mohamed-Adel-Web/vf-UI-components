import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DrawerComponent } from './drawer';

@Component({
  imports: [DrawerComponent],
  template: `
    <button type="button" id="trigger">Open trigger</button>
    <vf-drawer
      [open]="open()"
      [closeOnBackdrop]="closeOnBackdrop()"
      ariaLabel="Test drawer"
      (closed)="closedCount.set(closedCount() + 1)"
    >
      <header vfDrawerHeader>
        <button type="button" id="first-focusable">First</button>
      </header>
      <p>Body content</p>
      <footer vfDrawerFooter>
        <button type="button" id="last-focusable">Last</button>
      </footer>
    </vf-drawer>
  `,
})
class HostComponent {
  readonly open = signal(false);
  readonly closeOnBackdrop = signal(true);
  readonly closedCount = signal(0);
}

function render() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const backdrop = fixture.nativeElement.querySelector('.fixed.inset-0') as HTMLElement;
  const panel = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
  return { fixture, backdrop, panel };
}

describe('DrawerComponent', () => {
  it('renders closed by default with the panel translated off-screen', () => {
    const { panel } = render();
    expect(panel.className).toContain('translate-x-[calc(100%+1rem)]');
  });

  it('slides the panel in when open', async () => {
    const { fixture, panel } = render();
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(panel.className).toContain('translate-x-0');
  });

  it('moves focus into the panel when opened', async () => {
    const { fixture, panel } = render();
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(panel.contains(document.activeElement)).toBe(true);
  });

  it('emits closed on backdrop click', () => {
    const { fixture, backdrop } = render();
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    backdrop.click();
    expect(fixture.componentInstance.closedCount()).toBe(1);
  });

  it('does not emit closed on backdrop click when disabled', () => {
    const { fixture, backdrop } = render();
    fixture.componentInstance.open.set(true);
    fixture.componentInstance.closeOnBackdrop.set(false);
    fixture.detectChanges();
    backdrop.click();
    expect(fixture.componentInstance.closedCount()).toBe(0);
  });

  it('emits closed on Escape', () => {
    const { fixture } = render();
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fixture.componentInstance.closedCount()).toBe(1);
  });

  it('traps Tab focus between the first and last focusable elements', async () => {
    const { fixture, panel } = render();
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const last = panel.querySelector<HTMLElement>('#last-focusable')!;
    last.focus();
    panel.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );

    const first = panel.querySelector<HTMLElement>('#first-focusable')!;
    expect(document.activeElement).toBe(first);
  });
});
