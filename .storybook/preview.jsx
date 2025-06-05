import '../src/index.css';
import { theme } from '../src/utils/theme';

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'scratch-pad-dark',
      values: [
        {
          name: 'scratch-pad-dark',
          value: theme.colors.dark[200], // Main background - deep midnight
        },
        {
          name: 'scratch-pad-card',
          value: theme.colors.dark[100], // Card background
        },
        {
          name: 'scratch-pad-accent',
          value: '#0f1729', // Slightly lighter dark
        },
      ],
    },
    docs: {
      theme: {
        base: 'dark',
        brandTitle: 'Scratch Pad UI',
        brandUrl: '/',
        brandImage: undefined,
        brandTarget: '_self',
        
        // Color palette
        colorPrimary: theme.colors.primary[500],
        colorSecondary: theme.colors.secondary[500],
        
        // UI
        appBg: theme.colors.dark[200],
        appContentBg: theme.colors.dark[100],
        appBorderColor: theme.colors.primary[900] + '30',
        appBorderRadius: 8,
        
        // Typography
        fontBase: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontCode: 'monospace',
        
        // Text colors
        textColor: theme.colors.text.primary,
        textInverseColor: theme.colors.dark[100],
        
        // Toolbar default and active colors
        barTextColor: theme.colors.text.secondary,
        barSelectedColor: theme.colors.primary[400],
        barBg: theme.colors.dark[100],
        
        // Form colors
        inputBg: theme.colors.dark[200],
        inputBorder: theme.colors.primary[900] + '30',
        inputTextColor: theme.colors.text.primary,
        inputBorderRadius: 4,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
        <Story />
      </div>
    ),
  ],
};

export default preview;