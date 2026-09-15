import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ButtonComponent } from './button';
import type { ButtonVariant } from './button.variants';

@Component({
  imports: [ButtonComponent],
  template: `
    <button vfButton [variant]="variant()" [disabled]="disabled()" [class]="extra()">Go</button>
  `,
})
class HostComponent {
  readonly variant = signal<ButtonVariant>('primary');
  readonly disabled = signal(false);
  readonly extra = signal('');
}

function render() {
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  return { fixture, el };
}

describe('ButtonComponent', () => {
  it('applies the default variant classes', () => {
    const { el } = render();
    expect(el.className).toContain('bg-brand-600');
  });

  it('reacts to variant changes', () => {
    const { fixture, el } = render();
    fixture.componentInstance.variant.set('danger');
    fixture.detectChanges();
    expect(el.className).toContain('bg-danger');
    expect(el.className).not.toContain('bg-brand-600');
  });

  it('lets a consumer class override the variant background', () => {
    const { fixture, el } = render();
    fixture.componentInstance.extra.set('bg-ink-900');
    fixture.detectChanges();
    expect(el.className).toContain('bg-ink-900');
    expect(el.className).not.toContain('bg-brand-600');
  });

  it('exposes disabled state to assistive tech', () => {
    const { fixture, el } = render();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.hasAttribute('disabled')).toBe(true);
  });
});
