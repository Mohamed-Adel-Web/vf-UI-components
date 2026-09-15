# @vodafone/ui-components

Angular component library styled with Tailwind CSS v4.

## Install

```bash
npm i @vodafone/ui-components
```

Peer dependencies: `@angular/common`, `@angular/core`, `@angular/forms`, `tailwindcss`.

## Set up styles

In your app's global stylesheet:

```css
@import 'tailwindcss';
@import '@vodafone/ui-components/styles/theme.css';

/* Required: let Tailwind scan the library so its classes are generated. */
@source '../node_modules/@vodafone/ui-components';
```

Without the `@source` line Tailwind's JIT compiler never sees the library's class
names and every component renders unstyled.

## Use

```ts
import { ButtonComponent } from '@vodafone/ui-components';

@Component({
  imports: [ButtonComponent],
  template: `<button vfButton variant="primary" size="lg">Continue</button>`,
})
export class CheckoutComponent {}
```

Components attach to native elements, so `<button vfButton>` keeps real button
semantics, focus handling and form participation.

## Overriding styles

Every component accepts `class`. Conflicts are resolved by `tailwind-merge`, so
a consumer class replaces the default rather than relying on specificity:

```html
<button vfButton class="bg-ink-900 hover:bg-ink-800">Custom</button>
```

## Theming

All design decisions live as Tailwind `@theme` variables in `styles/theme.css`
(`--color-brand-*`, `--radius-control`, `--shadow-overlay`, ...). Override any of
them after the import to re-skin the whole library:

```css
@theme {
  --color-brand-600: oklch(0.55 0.2 250);
}
```
