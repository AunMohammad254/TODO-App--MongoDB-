# Strategic Git Reset Recovery Plan

## Pre-Reset Safety Checklist

### 1. Create Complete Backup
```bash
# Create a backup branch from current state
git branch backup-before-reset

# Alternatively, create a complete repository backup
cp -r /path/to/your/repo /path/to/backup/location
```

### 2. Verify Target Commit
```bash
# Review recent commit history
git log --oneline -10

# Verify the specific stable commit details
git show 2f0158f12037397b09cd42bf340a7fbb62180e51

# Check what files were changed in commits after the stable one
git diff 2f0158f12037397b09cd42bf340a7fbb62180e51..HEAD --name-only
```

### 3. Document Current State
```bash
# Save list of current uncommitted changes
git status > pre-reset-status.txt

# Save current branch name
git branch --show-current > current-branch.txt
```

## Reset Strategy Selection

### Option A: Soft Reset (Recommended for Recovery)
**Use when:** You want to preserve recent changes as uncommitted modifications for review
```bash
# Reset to stable commit while keeping changes staged
git reset --soft 2f0158f12037397b09cd42bf340a7fbb62180e51
```

**Advantages:**
- Preserves all changes since stable commit
- Allows selective recommitting of useful changes
- Safer for collaborative environments

### Option B: Mixed Reset (Default)
**Use when:** You want to preserve changes but unstage them
```bash
# Reset to stable commit, keeping changes as unstaged
git reset 2f0158f12037397b09cd42bf340a7fbb62180e51
```

### Option C: Hard Reset (Use with Extreme Caution)
**Use when:** You're certain you want to completely discard all changes
```bash
# DANGER: This permanently removes all changes
git reset --hard 2f0158f12037397b09cd42bf340a7fbb62180e51
```

## Recommended Execution Steps

### Step 1: Navigate and Prepare
```bash
cd /path/to/your/repository
git status
git log --oneline -5
```

### Step 2: Create Safety Branch
```bash
# Create and switch to a recovery branch
git checkout -b recovery-reset-$(date +%Y%m%d-%H%M%S)
git checkout main  # or your working branch
```

### Step 3: Execute Soft Reset (Recommended)
```bash
# Perform the soft reset to stable commit
git reset --soft 2f0158f12037397b09cd42bf340a7fbb62180e51

# Verify the reset worked
git log --oneline -3
git status
```

### Step 4: Review and Clean Up
```bash
# Review what changes are now staged
git diff --cached

# If you want to keep some changes, create selective commits
git commit -m "Restore: [specific functionality]"

# If you want to discard the staged changes
git reset HEAD .
```

## Post-Reset Verification

### 1. Functional Testing
```bash
# Test core application functionality
# Run your test suite
npm test  # or your testing command
python -m pytest  # for Python projects
./gradlew test  # for Java projects
```

### 2. Dependency Check
```bash
# Ensure dependencies are correctly installed
npm install  # Node.js
pip install -r requirements.txt  # Python
bundle install  # Ruby
```

### 3. Build Verification
```bash
# Verify the project builds successfully
npm run build  # or your build command
```

## GitHub Synchronization

### Safe Force Push (After Verification)
```bash
# Only after thorough testing and verification
git push --force-with-lease origin main

# Alternative: Create new branch and PR
git checkout -b hotfix-rollback-to-stable
git push origin hotfix-rollback-to-stable
# Then create PR to main branch
```

## Troubleshooting Common Issues

### If Reset Goes Wrong
```bash
# Find the original commit before reset
git reflog

# Reset back to original state using reflog
git reset --hard HEAD@{1}  # or appropriate reflog entry
```

### If Force Push Fails
```bash
# Check if others have pushed changes
git fetch origin
git status

# If behind, consider merging or rebasing first
git pull --rebase origin main
```

## Recovery Best Practices

### Future Prevention
1. **Feature Branches**: Always develop new features in separate branches
2. **Testing**: Implement comprehensive testing before merging
3. **Staged Deployment**: Use staging environments for feature validation
4. **Code Reviews**: Require peer review before merging to main

### Emergency Contacts
- Document team contacts for Git emergencies
- Keep repository administrator contact information accessible
- Establish clear protocols for production rollbacks

## Final Verification Checklist

- [ ] Target commit (2f0158f) functionality confirmed working
- [ ] All critical features tested and operational
- [ ] Dependencies properly installed and functioning
- [ ] Build process completes successfully
- [ ] Backup branches created and verified
- [ ] Team notified of rollback operation
- [ ] GitHub repository updated with stable version

## Warning Signs to Watch For
- Unexpected build failures after reset
- Missing dependencies or configuration files
- Database migration conflicts
- Integration test failures
- Broken CI/CD pipeline