# Contributing to Tyro

Thank you for your interest in contributing to Tyro! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Title Convention](#pull-request-title-convention)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Automated Git Hooks](#automated-git-hooks)
- [Pull Request Process](#pull-request-process)

---

## Branch Naming Convention

All branch names must follow a standardized naming convention to maintain consistency and clarity in the repository.

### Branch Name Format

```
<type>/<description-in-kebab-case>
```

#### Types

Must be one of the following:

- **feature/** - New features
- **fix/** - Bug fixes
- **chore/** - Maintenance tasks
- **docs/** - Documentation changes
- **refactor/** - Code refactoring
- **perf/** - Performance improvements
- **test/** - Adding/updating tests
- **build/** - Build system changes
- **ci/** - CI/CD changes
- **revert/** - Reverting changes

#### Description

- Use **kebab-case** (lowercase with hyphens)
- Be descriptive but concise
- No special characters except hyphens
- Use only lowercase letters, numbers, and hyphens

### Examples

✅ **Good branch names:**

```bash
feature/user-authentication
fix/login-redirect-issue
docs/setup-instructions
refactor/api-calls
perf/optimize-images
chore/update-dependencies
test/add-user-tests
```

❌ **Bad branch names:**

```bash
new-feature              # Missing type prefix
Feature/UserAuth         # Wrong case (should be lowercase)
fix-login_bug            # Mixed separators (don't use underscores)
feature/User Auth        # Contains spaces
myBranch                 # Not descriptive, wrong format
```

### Protected Branches

The following branches are protected and do not require this naming convention:

- `main`
- `master`
- `development`
- `staging`

### Validation

Branch names are automatically validated when you create or checkout a branch. If your branch name doesn't follow the convention, you'll see an error message with examples of valid names.

**To rename a branch:**

```bash
# If you haven't pushed yet
git branch -m <old-name> <new-name>

# If you already pushed
git branch -m <old-name> <new-name>
git push origin --delete <old-name>
git push origin <new-name>
git push origin -u <new-name>
```

---

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for our commit messages. This leads to **more readable messages** that are easy to follow when looking through the **project history** and enables **automated changelog generation**.

### Commit Message Format

Each commit message consists of a **header**, a **body** (optional), and a **footer** (optional):

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Header

The header is **mandatory** and must conform to the following format:

```
<type>(<scope>): <subject>
```

- **type**: Describes the kind of change (see types below)
- **scope**: (optional) The area of the codebase affected (e.g., `auth`, `ui`, `api`)
- **subject**: Short description of the change (max 100 characters)
  - Use imperative, present tense: "change" not "changed" nor "changes"
  - Don't capitalize first letter
  - No period (.) at the end

#### Type

Must be one of the following:

- **feat**: A new feature for the user
- **fix**: A bug fix for the user
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc.; no functional code change)
- **refactor**: Code refactoring (neither fixes a bug nor adds a feature)
- **perf**: Performance improvements
- **test**: Adding or refactoring tests
- **build**: Changes to the build system or external dependencies (e.g., npm, vite)
- **ci**: Changes to CI configuration files and scripts (e.g., GitHub Actions)
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

#### Scope

The scope should be the name of the module/area affected:

- `auth`: Authentication/authorization
- `sessions`: Sessions management
- `calendar`: Calendar and scheduling
- `ui`: UI components
- `api`: API integration
- `i18n`: Internationalization
- `sentry`: Error tracking
- `analytics`: Analytics integration
- `hooks`: Custom React hooks
- `redux`: Redux state management
- `types`: TypeScript types

#### Subject

The subject contains a succinct description of the change:

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No dot (.) at the end
- Maximum 100 characters

#### Body (Optional)

The body should include the motivation for the change and contrast this with previous behavior.

- Use the imperative, present tense
- Wrap at 200 characters per line
- Separate from the subject with a blank line

#### Footer (Optional)

The footer should contain:

- **Breaking Changes**: Start with `BREAKING CHANGE:` followed by a description
- **Issue References**: Reference GitHub issues (e.g., `Closes #123`, `Fixes #456`)

### Examples

#### Simple commit (no scope):

```bash
git commit -m "feat: add Google Analytics integration"
```

#### With scope:

```bash
git commit -m "fix(auth): resolve token expiration bug"
```

#### With body:

```bash
git commit -m "refactor(sessions): optimize session list rendering

Implemented React.memo and virtual scrolling to improve performance
when displaying large numbers of sessions."
```

#### With breaking change:

```bash
git commit -m "feat(api): update API base URL structure

BREAKING CHANGE: API base URL changed from /v1 to /v2.
All API calls need to be updated."
```

#### With issue reference:

```bash
git commit -m "fix(calendar): prevent double-booking

Fixes #234"
```

#### Full example:

```bash
git commit -m "feat(analytics): add event tracking for user actions

Implemented GA4 event tracking for:
- Session bookings
- Profile updates
- Payment completions

This will help us understand user behavior and improve UX.

Closes #567"
```

### Validation

Commit messages are automatically validated using `commitlint`. If your commit message doesn't follow the convention, the commit will be rejected with an error message explaining what needs to be fixed.

---

## Pull Request Title Convention

Pull Request titles must follow the same format as commit messages (Conventional Commits specification).

### PR Title Format

```
<type>(<scope>): <subject>
```

#### Examples

✅ **Good PR titles:**

```
feat: add Google Analytics integration
fix(auth): resolve token expiration bug
docs: update setup instructions
refactor(sessions): optimize session list rendering
perf(ui): add lazy loading for images
chore: update dependencies
```

❌ **Bad PR titles:**

```
New Feature              # No type prefix
Add user auth            # No type prefix
Fix: Login Bug           # Wrong case (should be lowercase)
FEAT: add feature        # Wrong case
feat add feature         # Missing colon
feat: Add feature.       # Capitalized subject, ends with period
```

### PR Title Rules

1. **Type**: Must be one of the allowed types (same as commits)
2. **Scope**: Optional, in parentheses
3. **Subject**:
   - Start with lowercase letter
   - No period at the end
   - Imperative mood ("add" not "adds" or "added")
   - Clear and descriptive

### Validation

PR titles are automatically validated using GitHub Actions when you:

- Open a new PR
- Edit an existing PR title
- Push new commits to a PR

If your PR title doesn't follow the convention, the PR check will fail with a clear error message explaining what needs to be fixed.

### Tips

- **Use your branch name**: If your branch is named `feature/user-authentication`, your PR title could be `feat: add user authentication`
- **Be descriptive**: The title should explain what the PR does at a glance
- **Match commit type**: The PR type should generally match your commit types
- **Update if needed**: You can edit the PR title at any time if requirements change

---

## Development Workflow

### Prerequisites

- **Node.js**: v18.20.0+ or v20.0.0+ (recommended: v20.18.0)
- **npm**: v9.0.0+

> ⚠️ **Important**: Node v18.14.0 and below will cause errors due to missing regex flag support in dependencies. Please upgrade to Node v18.20.0+ or use Node v20+.

**Check your versions:**

```bash
node --version  # Should show v18.20.0+ or v20.0.0+
npm --version   # Should show v9.0.0+
```

### Setup

1. **Clone the repository:**

```bash
git clone https://github.com/your-org/tyro-by-nafham-app.git
cd tyro-by-nafham-app
```

2. **Use correct Node version (if using nvm):**

```bash
# Install nvm if you don't have it: https://github.com/nvm-sh/nvm

# Use the version specified in .nvmrc
nvm use

# Or install and use in one command
nvm install
```

3. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start development server:**

```bash
npm run dev
```

5. **Open browser:**

Navigate to `http://localhost:4200`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run TypeScript and Prettier checks
- `npm run format` - Format code with Prettier
- `npm test` - Run tests (when implemented)

---

## Code Style

We enforce code style using **ESLint** and **Prettier**. All code must pass linting checks before being merged.

### Key Guidelines

1. **TypeScript**: Use strict mode, avoid `any` types
2. **Components**: Use functional components with hooks
3. **File Naming**: Use kebab-case for component files (e.g., `user-profile.component.tsx`)
4. **Imports**: Follow the import order defined in `.cursorrules`
5. **i18n**: Always use translation keys, never hardcode strings
6. **State Management**:
   - Use TanStack Query for server state
   - Use Redux only for authentication
   - Use local state for UI-only state

### Running Linters

```bash
# Check for errors
npm run lint

# Auto-fix formatting
npm run format
```

---

## Automated Git Hooks

This project uses **Husky** to automatically enforce code quality and naming conventions via Git hooks.

### 1. Pre-commit Hook ✅ **Runs on Every Commit**

**Purpose**: Ensures code is properly formatted before commit.

**What it does**:

- Automatically formats staged files with Prettier
- Only processes staged files (fast!)

**When it runs**: Before every `git commit`

**If it fails**: The commit is blocked until formatting is fixed

**Note**: ESLint is NOT run in the pre-commit hook to keep commits fast. Run `npm run lint` manually before pushing to catch any linting issues.

### 2. Commit Message Hook ✅ **Validates Commit Messages**

**Purpose**: Enforces Conventional Commits format.

**What it does**:

- Validates commit message structure
- Checks type, scope, and subject format
- Provides helpful error messages if invalid

**When it runs**: After you write a commit message

**If it fails**: The commit is rejected with specific error details

### 3. Pre-push Hook ⚠️ **Blocks Invalid Pushes**

**Purpose**: Validates branch name before pushing to remote.

**What it does**:

- Checks if branch name follows `type/description-in-kebab-case` format
- Prevents pushing branches with invalid names
- Protects remote repository from bad branch names

**When it runs**: Before `git push`

**If it fails**: The push is blocked with instructions to rename the branch

**How to fix**: Rename your branch:

```bash
git branch -m old-branch-name new-correct-branch-name
```

### 4. Post-checkout Hook ℹ️ **Warning Only**

**Purpose**: Warns about invalid branch names after creation.

**What it does**:

- Checks branch name after checkout/creation
- Shows a warning if name doesn't follow convention
- Does NOT block branch creation (informational only)

**When it runs**: After `git checkout -b new-branch`

**Note**: This is just a warning. The pre-push hook will prevent pushing invalid branch names.

### Skipping Hooks (Not Recommended)

If you absolutely need to skip hooks (e.g., emergency hotfix):

```bash
# Skip pre-commit and commit-msg hooks
git commit --no-verify -m "your message"

# Skip pre-push hook
git push --no-verify
```

⚠️ **Warning**: Only use `--no-verify` in exceptional circumstances. All code should pass quality checks before being merged.

---

## Pull Request Process

### Before Submitting

1. **Create a feature branch** following the [branch naming convention](#branch-naming-convention):

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

2. **Make your changes** following the code style guidelines

3. **Test your changes:**

```bash
npm run dev  # Manual testing
```

4. **Commit your changes** following the commit message convention

```bash
git add .
git commit -m "feat: your feature description"
# Pre-commit hook will automatically format your code with Prettier
```

5. **Run lint before pushing** (IMPORTANT - ESLint not in pre-commit hook):

```bash
npm run lint  # Check for TypeScript and linting errors
```

6. **Push to your fork:**

```bash
git push origin feature/your-feature-name
# Pre-push hook will validate branch name
```

### Submitting a PR

1. **Create Pull Request** on GitHub with:
   - Clear title following [PR title convention](#pull-request-title-convention)
   - Detailed description of changes
   - Screenshots/videos for UI changes
   - Reference to related issues

2. **PR Requirements:**
   - ✅ All checks must pass (linting, build)
   - ✅ Code review approval required
   - ✅ No merge conflicts
   - ✅ Branch is up to date with `development`

3. **PR Template:**

```markdown
## Description

[Describe what this PR does]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

[Describe how you tested your changes]

## Screenshots/Videos

[Add if applicable]

## Related Issues

Closes #[issue number]
```

---

## Questions?

If you have any questions, feel free to:

- Open an issue on GitHub
- Contact the maintainers
- Check our documentation in the `/docs` folder

Thank you for contributing! 🎉
