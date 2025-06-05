
/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-docs"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  core: {
    builder: "@storybook/builder-vite"
  },
  viteFinal: async (config) => {
    // Ensure PostCSS processes our CSS
    return config;
  }
};

export default config;