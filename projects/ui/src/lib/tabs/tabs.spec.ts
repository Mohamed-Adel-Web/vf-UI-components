import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TabComponent, TabPanelComponent, TabsComponent } from './tabs';

@Component({
  imports: [TabsComponent, TabComponent, TabPanelComponent],
  template: `
    <vf-tabs #tabs [(value)]="active" ariaLabel="Sections">
      <button vfTab value="a">A</button>
      <button vfTab value="b" [disabled]="bDisabled()">B</button>
      <button vfTab value="c">C</button>
    </vf-tabs>
    <vf-tab-panel [tabs]="tabs" value="a">Panel A</vf-tab-panel>
    <vf-tab-panel [tabs]="tabs" value="b">Panel B</vf-tab-panel>
    <vf-tab-panel [tabs]="tabs" value="c">Panel C</vf-tab-panel>
  `,
})
class HostComponent {
  readonly active = signal('');
  readonly bDisabled = signal(false);
}

function render() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const tabs = Array.from(
    fixture.nativeElement.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
  );
  const panels = Array.from(
    fixture.nativeElement.querySelectorAll<HTMLElement>('[role="tabpanel"]'),
  );
  return { fixture, tabs, panels };
}

describe('TabsComponent', () => {
  it('auto-selects the first enabled tab when no value is set', () => {
    const { fixture, tabs } = render();
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(fixture.componentInstance.active()).toBe('a');
  });

  it('selects a tab on click and shows the matching panel', () => {
    const { fixture, tabs, panels } = render();
    tabs[2].click();
    fixture.detectChanges();
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].hidden).toBe(true);
    expect(panels[2].hidden).toBe(false);
  });

  it('moves focus and selection with ArrowRight, skipping disabled tabs', () => {
    const { fixture, tabs } = render();
    fixture.componentInstance.bDisabled.set(true);
    fixture.detectChanges();
    tabs[0].focus();
    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs[2]);
    expect(fixture.componentInstance.active()).toBe('c');
  });

  it('wraps to the first tab with ArrowLeft from the first tab', () => {
    const { fixture, tabs } = render();
    tabs[0].focus();
    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs[2]);
    expect(fixture.componentInstance.active()).toBe('c');
  });

  it('jumps to the last tab on End and the first on Home', () => {
    const { fixture, tabs } = render();
    tabs[0].focus();
    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('c');

    tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.active()).toBe('a');
  });

  it('gives only the selected tab a tabindex of 0', () => {
    const { fixture, tabs } = render();
    fixture.componentInstance.active.set('c');
    fixture.detectChanges();
    expect(tabs[0].getAttribute('tabindex')).toBe('-1');
    expect(tabs[2].getAttribute('tabindex')).toBe('0');
  });
});
