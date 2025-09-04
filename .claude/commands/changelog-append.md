# Changelog Append Command

Automatically append new changelog entries using conversation history, git commits, and Task Master AI completed tasks.

## Usage
- `/changelog-append` - Generate changelog entry for recent changes
- `/changelog-append --version=1.0.0` - Generate specific version entry
- `/changelog-append --since="2025-08-20"` - Generate since specific date

## Steps

1. **Analyze Data Sources**:
   - Check git log for commits since last changelog entry (or specified date)
   - Look for Task Master AI completed tasks in `.taskmaster/tasks/tasks.json`
   - Parse conversation context for implementation details

2. **Extract Git History**:
   ```bash
   # Get commits since last changelog or specified date
   SINCE_DATE=$(grep -E "## \[.*\] - [0-9]{4}-[0-9]{2}-[0-9]{2}" CHANGELOG.md | head -1 | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}")
   git log --since="${SINCE_DATE:-1 week ago}" --pretty=format:"%h %ci %s" --no-merges
   ```

3. **Categorize Changes**:
   - **Added**: `feat:`, `feature`, new functionality
   - **Changed**: `refactor:`, `update`, modifications
   - **Fixed**: `fix:`, `bug`, error corrections
   - **Security**: `security`, `vulnerability`, `auth`
   - **Deprecated**: `deprecat`, removal notices
   - **Removed**: `remove`, `delete`, deletions

4. **Parse Task Master AI Tasks**:
   ```bash
   # Extract completed tasks since last changelog
   task-master list --status=done --since="${SINCE_DATE:-1 week ago}"
   ```

5. **Generate Changelog Section**:
   Format as Keep a Changelog standard:
   ```markdown
   ## [VERSION] - YYYY-MM-DD
   
   ### Added
   - Feature description ([commit](link))
   - Another feature (Task #ID)
   
   ### Changed  
   - Modification description ([commit](link))
   
   ### Fixed
   - Bug fix description ([commit](link))
   
   ### Security
   - Security improvement ([commit](link))
   ```

6. **Smart Deduplication**:
   - Compare similar descriptions across sources
   - Merge git commits with related Task Master tasks
   - Avoid duplicate entries from multiple sources

7. **Preserve Status Block & Append to CHANGELOG.md**:
   - **Critical**: Preserve the Development Status Block at the top of the file
   - Extract status block before modifications: `sed -n '/^## 🚀 Development Status Block/,/^---$/p' CHANGELOG.md`
   - Insert new section after existing `## [Unreleased]` section
   - Restore status block after changelog modifications
   - Preserve existing changelog structure and add commit reference links

## Implementation Notes

- Uses conventional commit parsing for automatic categorization
- Correlates Task Master AI tasks with git commits when possible
- Maintains citation links for traceability
- Handles edge cases: empty periods, malformed commits, large changesets
- Preserves existing changelog formatting and structure

## Expected Output Format

```markdown
## [1.2.0] - 2025-08-27

### Added
- Multi-layer admin security enforcement ([c171168e](https://github.com/repo/commit/c171168e))
- Serena MCP integration for semantic code analysis ([8984ff18](https://github.com/repo/commit/8984ff18)) (Task #2.1)
- Local subdomain development environment ([c5aba8bb](https://github.com/repo/commit/c5aba8bb))

### Changed
- Modernized workspace API routes with enhanced audit logging ([1d98634b](https://github.com/repo/commit/1d98634b))
- Enhanced middleware subdomain extraction ([8b799174](https://github.com/repo/commit/8b799174))

### Fixed
- Workspace redirect security validation ([9dc817ed](https://github.com/repo/commit/9dc817ed))
- Edge Runtime compatibility issues ([40afecd9](https://github.com/repo/commit/40afecd9))
- JWT size overflow for platform administrators ([a4d9227f](https://github.com/repo/commit/a4d9227f))

### Security
- Implemented multi-layer permission validation
- Enhanced workspace access controls with audit logging
```

## Error Handling

- Gracefully handle missing CHANGELOG.md (create new)
- Skip malformed git commits or task entries
- Validate markdown syntax before writing
- Backup existing changelog before modifications
- Rollback on write failures

## Integration Points

- **Git**: Primary source for commit history and references
- **Task Master AI**: Secondary source for structured task completion
- **Conversation Context**: Tertiary source for implementation details
- **Keep a Changelog**: Standard formatting for consistency