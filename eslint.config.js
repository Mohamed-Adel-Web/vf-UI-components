// @ts-check
/** @import { Linter } from 'eslint' */
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import storybook from 'eslint-plugin-storybook';
import tseslint from 'typescript-eslint';

/**
 * eslint-plugin-storybook's flat config types predate ESLint's stricter
 * `defineConfig` types (rule severities are widened to `string`), so they don't
 * structurally match `Linter.Config`. The shape is correct at runtime, so we
 * narrow it through `unknown` instead of falling back to `any`.
 * Remove this once the plugin ships matching types.
 */
const storybookRecommended = /** @type {Linter.Config[]} */ (
  /** @type {unknown} */ (storybook.configs['flat/recommended'])
);

export default defineConfig(
  globalIgnores(['dist/', 'coverage/', 'storybook-static/', '.angular/'], 'app/global-ignores'),

  {
    name: 'app/linter-options',
    linterOptions: {
      // Stale `eslint-disable` comments should fail the build, not linger.
      reportUnusedDisableDirectives: 'error',
    },
  },

  // ---------------------------------------------------------------------------
  // TypeScript (all projects)
  // ---------------------------------------------------------------------------
  {
    name: 'app/typescript',
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Safe for Angular as long as DI uses `inject()`. Constructor-parameter
      // injection with a type-only import breaks DI, so avoid mixing the two.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Library: `vf` public prefix and a clean, self-contained source tree
  // ---------------------------------------------------------------------------
  {
    name: 'app/ui-library',
    files: ['projects/ui/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'vf', style: 'camelCase' },
      ],
      // Element components are kebab-case (`<vf-card>`), attribute components are
      // camelCase (`<button vfButton>`); both must carry the `vf` prefix.
      '@angular-eslint/component-selector': [
        'error',
        [
          { type: 'element', prefix: 'vf', style: 'kebab-case' },
          { type: 'attribute', prefix: 'vf', style: 'camelCase' },
        ],
      ],
      // Intentional aliases:
      // - `class`: every component exposes a `class` escape hatch.
      // - `closeOnBackdrop`: public input name kept stable for consumers.
      '@angular-eslint/no-input-rename': ['error', { allowedNames: ['class', 'closeOnBackdrop'] }],
      // The library must never import itself by package name; that resolves to
      // the built output (or fails) instead of the source file next to it.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@vodafone/ui-components', '@vodafone/ui-components/*'],
              message: 'Inside the library, use relative imports instead of the package name.',
            },
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Playground app: `app` prefix
  // ---------------------------------------------------------------------------
  {
    name: 'app/playground',
    files: ['projects/playground/**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Storybook: stories are documentation, not shipped code
  // ---------------------------------------------------------------------------
  storybookRecommended,
  {
    name: 'app/storybook-stories',
    files: ['**/*.stories.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // ---------------------------------------------------------------------------
  // Angular templates (external .html and inline templates via the processor)
  // ---------------------------------------------------------------------------
  {
    name: 'app/templates',
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },
);
