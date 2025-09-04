# Quick Status Update

Rapidly update the development status block with current progress and latest information.

## Usage
- `/status-quick` - Auto-update status with smart detection
- `/status-quick --progress=90` - Set specific progress percentage
- `/status-quick --add-achievement="Feature completed"` - Add new achievement

## Implementation

### Step 1: Detect Current Context
```bash
# Get current project state
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_DATE=$(date +"%B %d, %Y")
LAST_COMMIT_HASH=$(git log -1 --pretty=format:"%h")
LAST_COMMIT_MSG=$(git log -1 --pretty=format:"%s")

echo "🔍 Current Context:"
echo "  Branch: $CURRENT_BRANCH"
echo "  Date: $CURRENT_DATE"
echo "  Last commit: $LAST_COMMIT_HASH - $LAST_COMMIT_MSG"
```

### Step 2: Quick Progress Assessment
```bash
# Count completed items in current status
TOTAL_GOALS=$(grep -c "^- \[.\] \*\*" CHANGELOG.md | head -20 || echo 5)
COMPLETED_GOALS=$(grep -c "^- \[x\] \*\*" CHANGELOG.md | head -20 || echo 2)

if [ $TOTAL_GOALS -gt 0 ]; then
  PROGRESS_PERCENT=$(( COMPLETED_GOALS * 100 / TOTAL_GOALS ))
else
  PROGRESS_PERCENT=50  # Default if can't detect
fi

echo "📊 Quick Assessment: $COMPLETED_GOALS/$TOTAL_GOALS goals ($PROGRESS_PERCENT%)"
```

### Step 3: Update Status Block Header
Update just the essential information in the status block:

```bash
# Find and update the status block header line
sed -i.bak "s/> \*\*Last Updated\*\*: .* | \*\*Branch\*\*: \`.*\`/> **Last Updated**: $CURRENT_DATE | **Branch**: \`$CURRENT_BRANCH\`/" CHANGELOG.md

echo "✅ Updated status header with current date and branch"
```

### Step 4: Smart Achievement Detection
```bash
# If there were recent commits, add them as achievements
RECENT_COMMITS=$(git log --since="1 day ago" --pretty=format:"%s" --no-merges)

if [ -n "$RECENT_COMMITS" ]; then
  echo "🎉 Recent achievements detected:"
  echo "$RECENT_COMMITS" | while read commit_msg; do
    # Convert commit to achievement format
    case "$commit_msg" in
      feat:*|add:*)
        ACHIEVEMENT=$(echo "$commit_msg" | sed 's/feat://g;s/add://g' | sed 's/^ *//' | sed 's/^./\U&/')
        echo "- ✅ **$ACHIEVEMENT** - Implemented today"
        ;;
      fix:*|bug:*)
        ACHIEVEMENT=$(echo "$commit_msg" | sed 's/fix://g;s/bug://g' | sed 's/^ *//' | sed 's/^./\U&/')
        echo "- 🔧 **$ACHIEVEMENT** - Fixed today"
        ;;
      docs:*)
        ACHIEVEMENT=$(echo "$commit_msg" | sed 's/docs://g' | sed 's/^ *//' | sed 's/^./\U&/')
        echo "- 📝 **$ACHIEVEMENT** - Documented today"
        ;;
    esac
  done
fi
```

### Step 5: Update Progress Bars
```bash
# Generate progress bar
generate_progress_bar() {
  local percent=$1
  local filled=$(( percent / 10 ))
  local empty=$(( 10 - filled ))
  
  # Create visual progress bar
  local bar=""
  for i in $(seq 1 $filled); do bar="${bar}█"; done
  for i in $(seq 1 $empty); do bar="${bar}░"; done
  echo "$bar"
}

# Update main progress indicator
PROGRESS_BAR=$(generate_progress_bar $PROGRESS_PERCENT)
sed -i.bak "s/Sprint Progress:     [█░]* [0-9]*%/Sprint Progress:     $PROGRESS_BAR $PROGRESS_PERCENT%/" CHANGELOG.md

echo "📈 Updated progress bars to reflect $PROGRESS_PERCENT% completion"
```

### Step 6: Add New Achievements (Optional)
If the `--add-achievement` flag is used:

```bash
if [ "$1" = "--add-achievement" ] && [ -n "$2" ]; then
  NEW_ACHIEVEMENT="- ✅ **$2** - $(date +"%B %d")"
  
  # Find the Recent Achievements section and add the new achievement
  sed -i.bak "/#### Recent Achievements/a\\
$NEW_ACHIEVEMENT" CHANGELOG.md
  
  echo "🎉 Added achievement: $2"
fi
```

## Example Output
```bash
🔍 Current Context:
  Branch: fix/local-docker-setup  
  Date: August 27, 2025
  Last commit: 8984ff18 - feat(serena): add project memory files

📊 Quick Assessment: 4/5 goals (80%)
✅ Updated status header with current date and branch
📈 Updated progress bars to reflect 80% completion
🎉 Added recent commits as achievements

Status block updated successfully! 
```

## Advanced Quick Updates

### Smart Progress Detection
```bash
# Detect progress from multiple indicators
check_documentation_progress() {
  local doc_score=0
  [ -f README.md ] && doc_score=$((doc_score + 25))
  [ -f ENV_SETUP_GUIDE.md ] && doc_score=$((doc_score + 25))
  [ -f CHANGELOG.md ] && doc_score=$((doc_score + 25))
  [ -d .claude/commands ] && doc_score=$((doc_score + 25))
  echo $doc_score
}

check_automation_progress() {
  local auto_score=0
  [ -f .claude/commands/changelog-auto.md ] && auto_score=$((auto_score + 50))
  [ -f .claude/commands/status-update.md ] && auto_score=$((auto_score + 50))
  echo $auto_score
}

# Update individual progress bars
DOC_PROGRESS=$(check_documentation_progress)
AUTO_PROGRESS=$(check_automation_progress)

sed -i.bak "s/Documentation:       [█░]* [0-9]*%/Documentation:       $(generate_progress_bar $DOC_PROGRESS) $DOC_PROGRESS%/" CHANGELOG.md
sed -i.bak "s/Automation:          [█░]* [0-9]*%/Automation:          $(generate_progress_bar $AUTO_PROGRESS) $AUTO_PROGRESS%/" CHANGELOG.md
```

### Integration with Existing Commands
This command works alongside the changelog automation:

```bash
# Quick workflow: Update status, then append changelog
/status-quick --progress=85
/changelog-auto --dry-run  # Preview changes
/changelog-auto            # Apply changes
```

## Preservation Logic
The command preserves manual customizations while updating automated fields:

- ✅ Updates: Date, branch, progress bars, recent achievements
- 🔒 Preserves: Custom sprint goals, manual risk assessments, milestone dates
- 🤖 Smart: Detects manual vs automated content

This provides a lightweight way to keep the status current without losing important manual context or overwriting custom content.