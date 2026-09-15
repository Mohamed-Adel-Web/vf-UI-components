# vf-UI-components

Monorepo for `@vodafone/ui-components` — the shared Angular + Tailwind component library.

## Layout

```
projects/
  ui/                     publishable library (@vodafone/ui-components)
    src/lib/<component>/  component + variants + stories + spec, colocated
    src/lib/utils/        cn() class merge helper
    styles/theme.css      design tokens (Tailwind @theme) — shipped to consumers
    src/public-api.ts     the only public surface
  playground/             local sandbox app for integration checks
.storybook/               documentation surface
```

Rules that keep the library healthy:

- Anything not exported from `public-api.ts` is private and may change freely.
- Components are attribute-based on native elements (`<button vfButton>`), so
  accessibility comes from the host element rather than being re-implemented.
- Styling is Tailwind utilities driven by `class-variance-authority`; consumer
  classes always win via `tailwind-merge`.
- No design values are hard-coded — they live in `styles/theme.css` as tokens.

## Requirements

Node version is pinned in `.nvmrc`:

```bash
nvm use
```

## Commands

| Command                   | Purpose                                 |
| ------------------------- | --------------------------------------- |
| `npm run storybook`       | Component docs at http://localhost:6006 |
| `npm start`               | Playground app                          |
| `npm test`                | Unit tests (Vitest)                     |
| `npm run lint`            | ESLint incl. template a11y rules        |
| `npm run build`           | Build the library to `dist/ui`          |
| `npm run build:storybook` | Static Storybook to `dist/storybook`    |
| `npm run release`         | Build then publish `dist/ui`            |

## Adding a component

```bash
npx ng g component <name> --project ui --export
```

Then colocate `<name>.variants.ts`, `<name>.stories.ts` and `<name>.spec.ts`
next to it, and export it from `src/public-api.ts`.
