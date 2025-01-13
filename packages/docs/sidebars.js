/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Basic Usage',
      items: [
        'basic-usage/getting-started',
        'basic-usage/initialize-target',
        'basic-usage/connect-to-resources',
        'basic-usage/using-resources',
        'basic-usage/cleanup',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Features',
      items: [
        'advanced-features/initialization-options',
        'advanced-features/automatic-mode',
        'advanced-features/configuration-file',
        'advanced-features/infrastructure-as-code',
      ],
    },
    {
      type: 'category',
      label: 'Security',
      items: [
        'security/network-security',
        'security/iam-permissions',
        'security/software-security',
      ],
    },
    {
      type: 'category',
      label: 'Team Usage',
      items: [
        'team-usage/shared-configuration',
        'team-usage/usage-audit',
        'team-usage/minimal-iam',
      ],
    },
  ],
};

module.exports = sidebars;
