# Branch & PR Naming Conventions

**Status**: ✅ Active  
**Last Updated**: November 2, 2025  
**Automation Level**: Full

---

## 📋 Overview

This document describes the automated validation systems for branch names and pull request titles in the Tyro project.

---

## 🌿 Branch Naming Convention

### Format

```
<type>/<description-in-kebab-case>
```

### Valid Types

| Type        | Description              |
| ----------- | ------------------------ |
| `feature/`  | New features             |
| `fix/`      | Bug fixes                |
| `chore/`    | Maintenance tasks        |
| `docs/`     | Documentation changes    |
| `refactor/` | Code refactoring         |
| `perf/`     | Performance improvements |
| `test/`     | Adding/updating tests    |
| `build/`    | Build system changes     |
| `ci/`       | CI/CD changes            |
| `revert/`   | Reverting changes        |

### Examples

✅ **Good:**

- `feature/user-authentication`
- `fix/login-redirect-issue`
- `docs/setup-instructions`
- `refactor/api-calls`
- `perf/optimize-images`

❌ **Bad:**

- `new-feature` (missing type)
- `Feature/UserAuth` (wrong case)
- `fix-login_bug` (mixed separators)
- `feature/User Auth` (contains spaces)

### Validation

**When**: Automatically validated on `git checkout`  
**Hook**: `.husky/post-checkout`  
**Script**: `.husky/validate-branch-name.sh`

**Protected branches** (skip validation):

- `main`
- `master`
- `development`
- `staging`

---

## 🔀 Pull Request Title Convention

### Format

```
<type>(<scope>): <subject>
```

### Valid Types

Same as branch types:

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

### Rules

1. **Type**: Must be lowercase
2. **Scope**: Optional, in parentheses
3. **Subject**:
   - Start with lowercase letter
   - No period at the end
   - Imperative mood ("add" not "adds")
   - Maximum 100 characters

### Examples

✅ **Good:**

- `feat: add Google Analytics integration`
- `fix(auth): resolve token expiration bug`
- `docs: update setup instructions`
- `refactor(sessions): optimize session list rendering`
- `perf(ui): add lazy loading for images`

❌ **Bad:**

- `New Feature` (no type)
- `Fix: Login Bug` (wrong case)
- `feat add feature` (missing colon)
- `feat: Add feature.` (capitalized, ends with period)

### Validation

**When**: Automatically validated on PR events  
**Workflow**: `.github/workflows/pr-title-lint.yml`  
**Action**: `amannn/action-semantic-pull-request@v5`

**Triggers**:

- PR opened
- PR title edited
- PR synchronized
- PR reopened

---

## 🛠️ Setup & Installation

### Prerequisites

All required packages are already installed:

- `husky` - Git hooks manager
- GitHub Actions (built-in)

### Files Created

```
.husky/
├── post-checkout                    # Branch name validation hook
├── validate-branch-name.sh          # Branch validation script
.github/
└── workflows/
    └── pr-title-lint.yml            # PR title validation workflow
CONTRIBUTING.md                      # Updated with conventions
```

---

## 🧪 Testing

### Test Branch Validation Locally

```bash
# Test with invalid branch name (should fail)
git checkout -b MyNewFeature

# Expected output:
# ❌ Invalid branch name: 'MyNewFeature'
# Branch names must follow the pattern: <type>/<description-in-kebab-case>

# Test with valid branch name (should succeed)
git checkout -b feature/test-validation
```

### Test PR Title Validation

1. Create a PR on GitHub
2. Try different titles:
   - ❌ `Add new feature` → Will fail
   - ✅ `feat: add new feature` → Will pass

---

## 🔍 How It Works

### Branch Name Validation (Local)

1. Developer runs `git checkout -b <branch-name>`
2. Husky's `post-checkout` hook triggers
3. `validate-branch-name.sh` script runs
4. Branch name checked against regex pattern
5. If invalid: Error message + exit code 1
6. If valid: Silent success

**Regex Pattern:**

```bash
^(feature|fix|chore|docs|refactor|perf|test|build|ci|revert)\/[a-z0-9-]+$
```

### PR Title Validation (Remote)

1. Developer creates/edits PR on GitHub
2. GitHub Actions workflow triggers
3. `action-semantic-pull-request` validates title
4. If invalid: PR check fails with error message
5. If valid: PR check passes ✅

---

## 📚 Benefits

### For Developers

- ✅ **Consistency**: Uniform naming across all branches and PRs
- ✅ **Clarity**: Easy to understand what changes are about
- ✅ **Automation**: No manual review needed for naming
- ✅ **Fast Feedback**: Errors caught immediately

### For Project

- ✅ **Better History**: Clean git log with searchable patterns
- ✅ **Easy Filtering**: Find all features/fixes quickly
- ✅ **Changelog Generation**: Automated release notes possible
- ✅ **Professional**: Industry-standard conventions

---

## 🔧 Troubleshooting

### Branch Name Rejected

**Problem**: Branch name doesn't follow convention

**Solution**:

```bash
# Delete the invalid branch
git branch -D invalid-branch-name

# Create with valid name
git checkout -b feature/valid-name
```

**Or rename existing branch**:

```bash
# If you haven't pushed yet
git branch -m old-name feature/new-name

# If you already pushed
git branch -m old-name feature/new-name
git push origin --delete old-name
git push origin feature/new-name
```

### PR Title Check Failing

**Problem**: PR title doesn't follow Conventional Commits

**Solution**:

1. Click "Edit" on your PR title
2. Update to follow format: `<type>(<scope>): <subject>`
3. Save changes
4. Check will automatically re-run

---

## 📖 Related Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Full contribution guide
- [.commitlintrc.json](./.commitlintrc.json) - Commit message rules
- [Conventional Commits](https://www.conventionalcommits.org/) - Specification

---

## 🎯 Quick Reference

### Branch Name Pattern

```
type/description-in-kebab-case
```

### PR Title Pattern

```
type(scope): subject in lowercase
```

### Need to Bypass?

**Branch validation**: Not recommended, but you can temporarily disable:

```bash
git checkout -b any-name --no-verify  # Not recommended!
```

**PR validation**: Edit the PR title to follow conventions (always required)

---

## 📞 Support

If you encounter issues:

1. Check this documentation
2. Review [CONTRIBUTING.md](./CONTRIBUTING.md)
3. Open an issue on GitHub
4. Contact the maintainers

---

**Remember**: These conventions are enforced automatically to maintain code quality and consistency. Following them ensures smooth collaboration! 🚀
