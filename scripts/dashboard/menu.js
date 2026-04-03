export const MENU_SECTIONS = [
  {
    title: 'Core',
    description: 'Dev server and builds',
    items: [
      {
        label: 'Dev Server',
        key: 'dev',
        description: 'Start dev server with watch mode',
      },
      {
        label: 'Build',
        key: 'build',
        description: 'Production build (lint + format + bundle)',
      },
    ],
  },
  {
    title: 'Create',
    description: 'Scaffold components and pages',
    items: [
      {
        label: 'Component',
        key: 'create-component',
        description: 'Scaffold a new component',
      },
      {
        label: 'Page',
        key: 'create-page',
        description: 'Scaffold a new page bundle',
      },
    ],
  },
  {
    title: 'Packages',
    description: 'Install, uninstall, and update',
    items: [
      {
        label: 'Install',
        key: 'install-package',
        description: 'Install npm package(s)',
      },
      {
        label: 'Uninstall',
        key: 'uninstall-package',
        description: 'Uninstall npm package(s)',
      },
      {
        label: 'Update',
        key: 'update',
        description: 'npm update packages',
      },
    ],
  },
  {
    title: 'Workflow',
    description: 'Git and versioning',
    items: [
      {
        label: 'Git Status',
        key: 'git-status',
        description: 'Show working tree status',
      },
      {
        label: 'Git Log',
        key: 'git-log',
        description: 'Recent commit history',
      },
      {
        label: 'Git Pull',
        key: 'git-pull',
        description: 'Pull latest from remote',
      },
      {
        label: 'Tag Version',
        key: 'tag-version',
        description: 'Bump version + create tag',
      },
      {
        label: 'Push',
        key: 'git-push',
        description: 'Push commits to remote',
      },
      {
        label: 'Push + Tags',
        key: 'git-push-tags',
        description: 'Push commits and tags',
      },
    ],
  },
  {
    title: 'Utilities',
    description: 'Lint, format, and tunnel',
    items: [
      { label: 'Lint', key: 'lint', description: 'Run ESLint on src/' },
      {
        label: 'Format',
        key: 'format',
        description: 'Run Prettier on all files',
      },
      {
        label: 'Tunnel',
        key: 'tunnel',
        description: 'Open Cloudflare tunnel',
      },
    ],
  },
]
