// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const { defineConfig } = require('eslint/config');

module.exports = (async () => {
  const storybook = (await import('eslint-plugin-storybook')).default;

  // eslint-plugin-storybook types its rules with @typescript-eslint/utils, whose
  // RuleContext doesn't match ESLint core's. Types-only mismatch; runtime is fine.
  const storybookRecommended = /** @type {import('eslint').Linter.Config[]} */ (
    /** @type {unknown} */ (storybook.configs['flat/recommended'])
  );

  return defineConfig(
    {
      ignores: ['dist/**', 'coverage/**', 'storybook-static/**', '.angular/**'],
    },
    {
      files: ['**/*.ts'],
      extends: [
        eslint.configs.recommended,
        tseslint.configs.recommended,
        tseslint.configs.stylistic,
        angular.configs.tsRecommended,
      ],
      processor: angular.processInlineTemplates,
      rules: {
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
    },

    // Library: enforce the `vf` public prefix and a clean, tree-shakeable surface.
    {
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
        // Every component exposes a `class` escape hatch; that alias is by design.
        '@angular-eslint/no-input-rename': [
          'error',
          { allowedNames: ['class', 'closeOnBackdrop'] },
        ],
        // Consumers must not depend on anything outside the published entry point.
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

    // Stories are documentation, not shipped code.
    storybookRecommended,
    {
      files: ['**/*.stories.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },

    {
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

    {
      files: ['**/*.html'],
      extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    },
  );
})();
