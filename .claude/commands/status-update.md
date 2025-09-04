# Status Block Update Command

Update the development status block in CHANGELOG.md with current project state and progress.

## Usage
- `/status-update` - Interactive update of current status
- `/status-update --progress=85` - Set overall sprint progress percentage
- `/status-update --milestone="Feature Complete"` - Update current milestone
- `/status-update --quick` - Auto-detect and update basic info only

## Smart Update Algorithm

### 1. Auto-Detection Phase
```bash
# Detect current context
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_DATE=$(date +"%B %d, %Y")
LAST_COMMIT=$(git log -1 --pretty=format:"%s")
UNCOMMITTED_CHANGES=$(git status --porcelain | wc -l)

# Extract current sprint from CHANGELOG.md
CURRENT_SPRINT=$(grep -A1 "### 📊 Current Sprint:" CHANGELOG.md | tail -1 | sed 's/^### 📊 Current Sprint: //')

echo "Detected Context:"
echo "Branch: $CURRENT_BRANCH"
echo "Sprint: $CURRENT_SPRINT"
echo "Uncommitted changes: $UNCOMMITTED_CHANGES files"
```

### 2. Progress Calculation
```bash
# Task Master Integration
if [ -f .taskmaster/tasks/tasks.json ]; then
  TOTAL_TASKS=$(cat .taskmaster/tasks/tasks.json | jq length)
  DONE_TASKS=$(cat .taskmaster/tasks/tasks.json | jq '[.[] | select(.status == "done")] | length')
  IN_PROGRESS=$(cat .taskmaster/tasks/tasks.json | jq '[.[] | select(.status == "in-progress")] | length')
  
  PROGRESS_PERCENT=$((DONE_TASKS * 100 / TOTAL_TASKS))
  
  echo "Task Progress: $DONE_TASKS/$TOTAL_TASKS ($PROGRESS_PERCENT%)"
fi

# Git Activity Analysis
COMMITS_TODAY=$(git log --since="today" --oneline | wc -l)
COMMITS_WEEK=$(git log --since="1 week ago" --oneline | wc -l)

echo "Recent Activity: $COMMITS_TODAY commits today, $COMMITS_WEEK this week"
```

### 3. Sprint Goal Analysis
```bash
# Parse current sprint goals from CHANGELOG.md
grep -A10 "#### Sprint Goals" CHANGELOG.md | grep -E "^- \[.\]" | while read line; do
  if [[ $line == *"[x]"* ]]; then
    COMPLETED=$((COMPLETED + 1))
  fi
  TOTAL=$((TOTAL + 1))
done

SPRINT_PROGRESS=$((COMPLETED * 100 / TOTAL))
echo "Sprint Goals: $COMPLETED/$TOTAL completed ($SPRINT_PROGRESS%)"
```

### 4. Recent Achievements Detection
```bash
# Smart achievement detection from git log
git log --since="3 days ago" --pretty=format:"%h|%s|%ai" --no-merges | while IFS='|' read hash subject date; do
  # Convert git commits to achievement format
  case "$subject" in
    feat:*|add:*) 
      ACHIEVEMENT="✅ **$(echo $subject | sed 's/feat://;s/add://' | sed 's/^\s*//' | sed 's/^./\U&/')** - $date"
      echo "$ACHIEVEMENT"
      ;;
    fix:*|bug:*)
      ACHIEVEMENT="🔧 **$(echo $subject | sed 's/fix://;s/bug://' | sed 's/^\s*//' | sed 's/^./\U&/')** - $date"
      echo "$ACHIEVEMENT"
      ;;
    docs:*)
      ACHIEVEMENT="📝 **$(echo $subject | sed 's/docs://' | sed 's/^\s*//' | sed 's/^./\U&/')** - $date"
      echo "$ACHIEVEMENT"
      ;;
  esac
done
```

### 5. Active Work Items Detection
```bash
# Detect in-progress work from multiple sources

# A. Task Master in-progress tasks
if [ -f .taskmaster/tasks/tasks.json ]; then
  cat .taskmaster/tasks/tasks.json | jq -r '.[] | select(.status == "in-progress") | "🔄 **\(.title)** - \(.description // "In active development")"'
fi

# B. Git branch analysis
FEATURE_BRANCHES=$(git branch -r | grep -E "(feature/|fix/|chore/)" | head -3)
if [ -n "$FEATURE_BRANCHES" ]; then
  echo "$FEATURE_BRANCHES" | while read branch; do
    BRANCH_NAME=$(echo $branch | sed 's/origin\///' | sed 's/^\s*//')
    echo "🔄 **Branch Work** - $BRANCH_NAME active development"
  done
fi

# C. Uncommitted changes analysis
if [ $UNCOMMITTED_CHANGES -gt 0 ]; then
  MODIFIED_FILES=$(git status --porcelain | head -3 | cut -c4-)
  echo "🔄 **Local Changes** - $UNCOMMITTED_CHANGES files being modified"
fi
```

### 6. Success Criteria Validation
```bash
# Auto-validate success criteria against actual progress
grep -A20 "#### Success Criteria" CHANGELOG.md | grep -E "^- \[.\]" | while read criterion; do
  # Extract criterion text
  CRITERION_TEXT=$(echo "$criterion" | sed 's/^- \[.\] //')
  
  # Smart validation based on project state
  case "$CRITERION_TEXT" in
    *"documentation"*|*"Documentation"*)
      # Check if key documentation files exist
      if [ -f README.md ] && [ -f ENV_SETUP_GUIDE.md ]; then
        echo "- [x] $CRITERION_TEXT"
      else
        echo "- [ ] $CRITERION_TEXT"
      fi
      ;;
    *"changelog"*|*"Changelog"*)
      # Check if changelog automation exists
      if [ -f .claude/commands/changelog-auto.md ]; then
        echo "- [x] $CRITERION_TEXT"
      else
        echo "- [ ] $CRITERION_TEXT"
      fi
      ;;
    *"Claude"*|*"claude"*)
      # Check Claude optimization status
      CLAUDE_FILES=$(find .claude -name "*.md" | wc -l)
      if [ $CLAUDE_FILES -gt 10 ]; then
        echo "- [x] $CRITERION_TEXT"
      else
        echo "- [ ] $CRITERION_TEXT"
      fi
      ;;
    *)
      # Keep existing status for unrecognized criteria
      echo "$criterion"
      ;;
  esac
done
```

### 7. Generate Updated Status Block
```bash
# Template with smart substitutions
cat << EOF
## 🚀 Development Status Block
> **Last Updated**: $CURRENT_DATE | **Branch**: \`$CURRENT_BRANCH\`

### 📊 Current Sprint: $CURRENT_SPRINT

#### Sprint Goals
$(generate_sprint_goals)

#### Progress Indicators
\`\`\`
Sprint Progress:     $(generate_progress_bar $SPRINT_PROGRESS) $SPRINT_PROGRESS% ($COMPLETED/$TOTAL major objectives)
Documentation:       $(generate_progress_bar $DOC_PROGRESS) $DOC_PROGRESS% (Status auto-detected)
Automation:          $(generate_progress_bar $AUTO_PROGRESS) $AUTO_PROGRESS% (Changelog commands implemented)
AI Optimization:     $(generate_progress_bar $AI_PROGRESS) $AI_PROGRESS% (Context restructure in progress)
Environment Setup:   $(generate_progress_bar $ENV_PROGRESS) $ENV_PROGRESS% (Docker fixes done, testing pending)
\`\`\`

#### Recent Achievements ($(date -d '3 days ago' +%b %d)-$(date +%b %d, %Y))
$(generate_recent_achievements)

#### Active Work Items
$(generate_active_items)

#### Success Criteria
$(generate_success_criteria)

#### Risk Factors
$(generate_risk_assessment)

#### Next Milestones
$(generate_milestones)

EOF
```

## Advanced Features

### Progress Bar Generation
```bash
generate_progress_bar() {
  local percent=$1
  local filled=$((percent / 10))
  local empty=$((10 - filled))
  
  printf "█%.0s" $(seq 1 $filled)
  printf "░%.0s" $(seq 1 $empty)
}
```

### Risk Assessment
```bash
generate_risk_assessment() {
  # Analyze risk factors based on project state
  local risks=""
  
  # Check for high-risk patterns
  if [ $UNCOMMITTED_CHANGES -gt 20 ]; then
    risks="$risks\n- **High Risk**: Large uncommitted changes ($UNCOMMITTED_CHANGES files)"
  fi
  
  if [ $COMMITS_TODAY -eq 0 ] && [ $COMMITS_WEEK -lt 3 ]; then
    risks="$risks\n- **Medium Risk**: Low development activity this week"
  fi
  
  # Default to standard risks if none detected
  if [ -z "$risks" ]; then
    cat << EOF
- **Low Risk**: Documentation changes (isolated, non-breaking)
- **Medium Risk**: AI workflow changes (may require iteration)
- **Low Risk**: Environment setup (Docker containerization provides isolation)
EOF
  else
    echo -e "$risks"
  fi
}
```

### Integration with Changelog Commands
The status-update command preserves the status block when changelog automation runs:

```bash
# Before changelog update
TEMP_STATUS=$(sed -n '/^## 🚀 Development Status Block/,/^---$/p' CHANGELOG.md)

# Run changelog automation
/changelog-auto

# Restore status block at top
sed -i "/^The format is based on/a\\n---\\n\\n$TEMP_STATUS\\n" CHANGELOG.md
```

## Error Handling
- Backup status block before modifications
- Validate markdown syntax after updates
- Preserve manual customizations when possible
- Graceful degradation if git/Task Master unavailable

## Output Modes
- `--quiet`: Update only essential fields (date, branch, progress)
- `--verbose`: Include detailed analysis and suggestions
- `--dry-run`: Show proposed changes without writing
- `--reset`: Regenerate entire status block from scratch

This command transforms status tracking from manual updates into an intelligent, context-aware system that reflects the real state of development progress.