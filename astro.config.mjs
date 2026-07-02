import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  outDir: './dist-docs',
  srcDir: './docs',
  site: 'https://reuters-graphics.github.io',
  base: 'bluprint',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: '',
      description: 'Dead-easy application scaffolding and CLI',
      customCss: ['./docs/styles/custom.css'],
      logo: {
        dark: './docs/assets/dark/logo-small.svg',
        light: './docs/assets/light/logo-small.svg',
      },
      editLink: {
        baseUrl: 'https://github.com/reuters-graphics/bluprint/edit/main/',
      },
      favicon:
        'https://graphics.thomsonreuters.com/style-assets/images/logos/favicon/favicon.ico',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/reuters-graphics/bluprint/',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', link: '/' },
            { label: 'Quickstart', slug: 'quickstart' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Creating a Bluprint', slug: 'guides/creating' },
            { label: 'Using Bluprints', slug: 'guides/using' },
            { label: 'Actions', slug: 'guides/actions' },
            { label: 'Parts', slug: 'guides/parts' },
            { label: 'Previewing', slug: 'guides/previewing' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'CLI Commands', slug: 'reference/cli' },
            { label: 'Action Reference', slug: 'reference/actions' },
          ],
        },
      ],
    }),
  ],
});
