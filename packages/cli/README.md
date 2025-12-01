# @brixkit/cli

CLI tool for scaffolding SvelteKit projects with Brixkit components.

## Installation

```bash
npm install -g @brixkit/cli
# or
pnpm add -g @brixkit/cli
```

## Usage

### Initialize a new project

```bash
brixkit init my-app
```

Options:
- `-t, --template <template>` - Choose a template (basic, full)
- `--skip-install` - Skip installing dependencies

### Add components to existing project

```bash
brixkit add auth board
```

Options:
- `-y, --yes` - Skip confirmation prompts
- `--overwrite` - Overwrite existing files

## Available Components

- `auth` - Authentication (users, sessions, permissions)
- `board` - Board feature (posts, comments)
- `github-oauth` - GitHub OAuth authentication
- `db-sqlite` - SQLite database adapter
- `db-postgresql` - PostgreSQL database adapter

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build
pnpm build
```

## How it works

Brixkit CLI follows the shadcn/ui approach:

1. **Templates** - Pre-built components are stored in the `templates/` directory
2. **Copy, not install** - Components are copied to your project, not installed as packages
3. **Full control** - You own the code and can modify it as needed
4. **Composable** - Mix and match components to build your application

## Template Structure

Each template has:
- `config.json` - Metadata and dependencies
- Source files - Copied to your project
- Schema files - Merged with your existing schema

Example:
```
templates/auth/
├── config.json
├── src/
│   └── lib/
│       └── server/
│           ├── schema/
│           │   └── auth.ts
│           └── services/
│               └── auth.ts
└── package.json (dependencies to merge)
```
