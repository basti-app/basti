// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Basti',
  tagline: 'Secure access to AWS resources in private networks at almost no cost',
  favicon: 'img/favicon.ico',

  url: 'https://www.basti.app',
  baseUrl: '/',
  deploymentBranch: 'main',

  organizationName: 'basti-app',
  projectName: 'basti-app.github.io',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl:
            'https://github.com/basti-app/basti/tree/main/packages/docs/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Basti',
        logo: {
          alt: 'Basti Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            type: 'doc',
            docId: 'basic-usage/getting-started',
            position: 'left',
            label: 'Getting Started',
          },
          {
            href: 'https://github.com/basti-app/basti',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/basic-usage/getting-started',
              },
              {
                label: 'Basic Usage',
                to: '/basic-usage/initialize-target',
              },
              {
                label: 'Advanced Features',
                to: '/advanced-features/initialization-options',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/basti-app/basti/discussions',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/basti-app/basti',
              },
            ],
          },
        ],
        copyright: `Copyright ${new Date().getFullYear()} Basti. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
