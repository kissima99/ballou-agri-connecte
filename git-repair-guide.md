# Git Repository Corruption Repair Guide

## 1. **First, check the repository status**

Run these commands in your terminal:

```bash
git fsck --full
```

This will check for corrupted objects and missing references.

## 2. **Common fixes based on what you find:**

### **If you see "dangling" or "missing" objects:**
```bash
git gc --prune=now
git repack -a -d
```

### **If refs are corrupted:**
```bash
# Backup first!
cp -r .git .git.backup

# Try to recover from reflog
git reflog
# Find a good commit and reset to it
git reset --hard <good-commit-hash>
```

### **If pack files are corrupted:**
```bash
# Remove corrupted pack files (be careful!)
rm -rf .git/objects/pack/
git fetch --all
```

## 3. **If nothing works, try a more aggressive recovery:**

```bash
# Remove index and reset
rm -f .git/index
git reset

# Or clone a fresh copy and copy your working files
```

## 4. **If you have uncommitted changes you want to save:**
```bash
# Stash everything first
git stash --all
# Then try the recovery steps
```

## 5. **Step-by-step recovery process:**

### **Step 1: Backup your repository**
```bash
# Create a backup of your current state
cp -r .git .git.backup
cp -r src src.backup
cp -r public public.backup
```

### **Step 2: Check for corruption**
```bash
git fsck --full
```

### **Step 3: Basic cleanup**
```bash
git gc --prune=now
git repack -a -d
```

### **Step 4: Check reflog for recovery points**
```bash
git reflog
```

### **Step 5: If corruption persists, try removing and recreating index**
```bash
rm -f .git/index
git reset --hard HEAD
```

### **Step 6: If still corrupted, consider fresh clone**
```bash
# If you have remote repository
git clone <your-repo-url> fresh-copy
# Copy your working files back
cp -r fresh-copy/.git .
```

## 6. **Prevention tips:**
- Always commit frequently
- Use `git gc` regularly
- Avoid force pushing without understanding the consequences
- Keep backups of important branches