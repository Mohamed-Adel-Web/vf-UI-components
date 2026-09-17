import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import {
  SidebarNavComponent,
  SidebarNavItemComponent,
  SidebarNavSectionComponent,
  SidebarNavToggleComponent,
  SidebarNavUserComponent,
} from './sidebar-nav';

@Component({
  imports: [
    SidebarNavComponent,
    SidebarNavSectionComponent,
    SidebarNavItemComponent,
    SidebarNavToggleComponent,
    SidebarNavUserComponent,
  ],
  template: `
    <vf-sidebar-nav [(collapsed)]="collapsed" ariaLabel="Primary">
      <button vfSidebarNavToggle>»</button>
      <vf-sidebar-nav-section label="Resources">
        <a vfSidebarNavItem [active]="activeItem() === 'home'" [badge]="badge()">Home</a>
        <button vfSidebarNavItem [disabled]="true">Disabled</button>
      </vf-sidebar-nav-section>
      <vf-sidebar-nav-user>
        <span vfSidebarNavUserName>Khaled M</span>
      </vf-sidebar-nav-user>
    </vf-sidebar-nav>
  `,
})
class HostComponent {
  readonly collapsed = signal(false);
  readonly activeItem = signal('home');
  readonly badge = signal<number | undefined>(2);
}

function render() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return { fixture };
}

describe('SidebarNavComponent', () => {
  it('exposes a navigation landmark with the given aria-label', () => {
    const { fixture } = render();
    const nav = fixture.nativeElement.querySelector('vf-sidebar-nav');
    expect(nav.getAttribute('role')).toBe('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Primary');
  });

  it('marks the active item with aria-current="page"', () => {
    const { fixture } = render();
    const item = fixture.nativeElement.querySelector('[vfSidebarNavItem]');
    expect(item.getAttribute('aria-current')).toBe('page');
  });

  it('disables a nav item via the disabled attribute', () => {
    const { fixture } = render();
    const disabledItem = fixture.nativeElement.querySelectorAll('[vfSidebarNavItem]')[1];
    expect(disabledItem.hasAttribute('disabled')).toBe(true);
  });

  it('hides section labels and item text once collapsed', () => {
    const { fixture } = render();
    fixture.componentInstance.collapsed.set(true);
    fixture.detectChanges();

    const section = fixture.nativeElement.querySelector('vf-sidebar-nav-section');
    expect(section.textContent?.trim()).toBe('');
  });

  it('renders the badge value on an active item', () => {
    const { fixture } = render();
    const item = fixture.nativeElement.querySelector('[vfSidebarNavItem]');
    expect(item.textContent).toContain('2');
  });

  it('toggles the parent collapsed state on click and updates its own aria attributes', () => {
    const { fixture } = render();
    const toggle = fixture.nativeElement.querySelector('[vfSidebarNavToggle]');

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Collapse sidebar');

    toggle.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.collapsed()).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-label')).toBe('Expand sidebar');
  });
});
