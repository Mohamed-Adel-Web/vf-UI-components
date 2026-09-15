import { provideZonelessChangeDetection } from '@angular/core';
import { applicationConfig, type Decorator, type Preview } from '@storybook/angular-vite';

import './styles.css';

// Tokens are theme-aware via the `dark:` variant, toggled by a `.dark` ancestor class.
const withThemeClass: Decorator = (storyFn, context) => {
  document.documentElement.classList.toggle('dark', context.globals['theme'] !== 'light');
  return storyFn();
};

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [provideZonelessChangeDetection()],
    }),
    withThemeClass,
  ],
  globalTypes: {
    theme: {
      description: 'Light / dark theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Foundations', ['Introduction', 'Design Tokens'], 'Components', '*'],
      },
    },
    a11y: {
      // Surface violations in CI rather than silently passing.
      test: 'error',
    },
  },
  tags: ['autodocs'],
};

export default preview;
