# /smart-commit

Intelligently analyze and commit git changes in logical groups.

## Usage

```bash
/smart-commit [options]
```

## Options

- `--dry-run` - Preview the commit plan without making any commits
- `--interactive` - Confirm each commit individually before creating it
- `--push` - Automatically push commits to remote after creating them
- `--verbose` - Show detailed file change statistics and analysis

## Description

This command analyzes all git changes in your repository and intelligently groups them into logical, atomic commits based on file patterns and functionality:

- **Database & Seeds** - Schema changes, migrations, seed data
- **Authentication & Security** - Auth flows, JWT, permissions, roles
- **API Routes** - Endpoint handlers and route logic
- **Middleware** - Request/response processing
- **UI Components** - React/Vue/Angular components
- **Types & Interfaces** - TypeScript definitions
- **Configuration** - Config files, environment settings
- **Documentation** - Markdown files, READMEs
- **Tests** - Test suites and specs
- **Scripts & Tools** - Utility scripts and build tools
- **Styles** - CSS, SCSS, styling files

## Examples

### Basic usage - analyze and commit all changes
```bash
/smart-commit
```

### Preview mode - see the plan without committing
```bash
/smart-commit --dry-run
```

### Interactive mode - confirm each commit
```bash
/smart-commit --interactive
```

### Verbose preview - detailed analysis
```bash
/smart-commit --verbose --dry-run
```

### Commit and push to remote
```bash
/smart-commit --push
```

## Features

- **Smart Categorization**: Automatically groups related files based on patterns
- **Atomic Commits**: Creates focused, single-purpose commits
- **Skip Protection**: Automatically skips cache and local files
- **Change Statistics**: Shows insertions/deletions per file (verbose mode)
- **Interactive Confirmation**: Optionally confirm each commit
- **Push Support**: Can push to remote after committing

## Requirements

- Must be run in a git repository
- Requires Node.js for execution
- Uses git CLI commands under the hood