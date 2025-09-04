# Auto Changelog Generator

Intelligent changelog generation with multi-source integration and smart categorization.

## Usage
- `/changelog-auto` - Auto-detect changes and append to changelog
- `/changelog-auto --dry-run` - Preview changes without writing
- `/changelog-auto --version=2.1.0` - Specify version number

## Smart Detection Algorithm

1. **Detect Last Entry Date**:
   ```bash
   # Extract most recent changelog date
   LAST_DATE=$(grep -E "^## \[.*\] - [0-9]{4}-[0-9]{2}-[0-9]{2}" CHANGELOG.md | head -1 | sed -E 's/.*([0-9]{4}-[0-9]{2}-[0-9]{2}).*/\1/')
   echo "Analyzing changes since: ${LAST_DATE:-'project start'}"
   ```

2. **Multi-Source Analysis**:
   
   **A. Git Commit Analysis**:
   ```bash
   # Smart git log with categorization patterns
   git log --since="${LAST_DATE:-2024-01-01}" --pretty=format:"%h|%s|%b|%ai" --no-merges | while IFS='|' read hash subject body date; do
     # Categorize by conventional commits and keywords
     case "$subject" in
       feat:*|feature:*) echo "ADDED|$subject|$hash|$date" ;;
       fix:*|bug:*) echo "FIXED|$subject|$hash|$date" ;;
       security:*|sec:*) echo "SECURITY|$subject|$hash|$date" ;;
       refactor:*|chore:*|docs:*) echo "CHANGED|$subject|$hash|$date" ;;
       *breaking*|*BREAKING*) echo "CHANGED|$subject|$hash|$date" ;;
       *deprecat*) echo "DEPRECATED|$subject|$hash|$date" ;;
       *remov*|*delet*) echo "REMOVED|$subject|$hash|$date" ;;
       *) echo "CHANGED|$subject|$hash|$date" ;;
     esac
   done
   ```

   **B. Task Master Integration**:
   ```bash
   # Extract completed Task Master tasks
   if [ -f .taskmaster/tasks/tasks.json ]; then
     # Parse JSON for completed tasks since last date
     cat .taskmaster/tasks/tasks.json | jq -r --arg since "$LAST_DATE" '
       .[] | select(.status == "done") | 
       select(.updatedAt > $since) |
       "\(.priority // "medium")|\(.title)|\(.id)|\(.updatedAt)"
     ' | while IFS='|' read priority title id updated; do
       # Map task types to changelog categories
       case "$title" in
         *implement*|*add*|*create*) echo "ADDED|$title|Task #$id|$updated" ;;
         *fix*|*bug*|*error*) echo "FIXED|$title|Task #$id|$updated" ;;
         *security*|*auth*|*permission*) echo "SECURITY|$title|Task #$id|$updated" ;;
         *refactor*|*improve*|*update*) echo "CHANGED|$title|Task #$id|$updated" ;;
         *deprecat*) echo "DEPRECATED|$title|Task #$id|$updated" ;;
         *remov*|*delet*) echo "REMOVED|$title|Task #$id|$updated" ;;
         *) echo "CHANGED|$title|Task #$id|$updated" ;;
       esac
     done
   fi
   ```

   **C. Conversation Context Mining**:
   Extract implementation details from recent conversation context:
   - Look for "I implemented...", "I added...", "I fixed..." patterns
   - Cross-reference with git commits for validation
   - Extract feature descriptions and technical details

3. **Smart Deduplication**:
   ```bash
   # Merge similar entries across sources using fuzzy matching
   # Remove duplicates while preserving best description + all citations
   ```

4. **Generate Formatted Entry**:
   
   **Template Structure**:
   ```markdown
   ## [VERSION] - $(date +%Y-%m-%d)
   
   ### Recent Development ($(date +%b %d) - $(date +%b %d, %Y))
   
   #### Added
   - **Feature Name** - Description with context ([commit](link)) (Task #ID)
   
   #### Changed  
   - **Component Update** - What changed and why ([commit](link))
   
   #### Fixed
   - **Bug Description** - Root cause and solution ([commit](link))
   
   #### Security
   - **Security Enhancement** - Impact and implementation details
   ```

5. **Intelligent Entry Enhancement**:
   
   **Context Enrichment**:
   - Extract technical details from commit messages
   - Add impact descriptions from task completion notes
   - Include performance metrics when available
   - Cross-reference related changes for comprehensive context

   **Smart Grouping**:
   - Group related commits into single logical entries
   - Combine incremental improvements into feature descriptions
   - Merge bug fixes with their follow-up improvements

6. **Quality Assurance**:
   
   **Validation Checks**:
   ```bash
   # Verify markdown syntax
   # Check for broken links
   # Ensure proper categorization
   # Validate date formatting
   # Confirm no duplicate entries
   ```

   **Review Mode**:
   - Show preview with `--dry-run` flag
   - Highlight uncertain categorizations for manual review
   - Suggest version number based on change types (semver)
   - Allow manual editing before final commit

## Advanced Features

### Semantic Version Detection
```bash
# Auto-detect version bump based on changes
HAS_BREAKING=$(grep -c "BREAKING\|breaking" changes.tmp)
HAS_FEATURES=$(grep -c "ADDED\|feat:" changes.tmp) 
HAS_FIXES=$(grep -c "FIXED\|fix:" changes.tmp)

if [ $HAS_BREAKING -gt 0 ]; then
  BUMP="major"
elif [ $HAS_FEATURES -gt 0 ]; then
  BUMP="minor"  
elif [ $HAS_FIXES -gt 0 ]; then
  BUMP="patch"
fi

echo "Suggested version bump: $BUMP"
```

### Integration Hooks
- **Pre-commit**: Generate changelog draft for review
- **Post-deploy**: Auto-append deployment information
- **Release**: Tag with changelog content and version info

### Output Customization
- Support different changelog formats (Keep a Changelog, Angular, etc.)
- Custom categorization rules per project
- Template customization for organization branding
- Multi-language support for international teams

## Error Recovery
- Backup original changelog before modifications
- Atomic writes to prevent corruption
- Rollback capability on validation failures
- Conflict resolution for concurrent edits

## Performance Optimizations
- Cache git log results for large repositories
- Incremental processing for efficiency
- Parallel analysis of different data sources
- Smart date range optimization

This automation transforms changelog maintenance from manual drudgery into an intelligent, context-aware documentation system.