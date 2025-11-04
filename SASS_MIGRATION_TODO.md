# Sass @import to @use/@forward Migration

**Status**: 🟡 Not Urgent (Warnings Suppressed)  
**Priority**: Low  
**Estimated Effort**: 1-2 days  
**Target**: Before Dart Sass 3.0 release

---

## 📋 Overview

Sass is deprecating two major features before Dart Sass 3.0:

1. The `@import` rule in favor of `@use` and `@forward`
2. Global built-in functions (e.g., `map-get`, `adjust-color`) in favor of namespaced modules

This migration is necessary before Dart Sass 3.0 is released.

**Current Status**: All warnings suppressed in `vite.config.ts`

---

## 📊 Scope

- **Files affected**: 73 SCSS files
- **Total @import statements**: 156
- **Main files importing utilities**:
  - `src/assets/styles/mixins.scss` (most commonly imported)
  - `src/assets/styles/variables.scss`
  - `src/assets/styles/main.scss`

---

## 🎯 Migration Strategy

### Phase 1: Convert Core Files (1-2 hours)

**Files to convert first**:

1. `src/assets/styles/main.scss` - Master import file
2. `src/assets/styles/variables.scss` - Variables
3. `src/assets/styles/mixins.scss` - Mixins
4. `src/assets/styles/utilities.scss` - Utility classes

**Changes needed**:

```scss
// OLD (@import)
@import 'variables';
@import 'mixins';

// NEW (@use/@forward)
@use 'variables' as *; // * makes variables available without namespace
@use 'mixins' as *;
```

### Phase 2: Update Component Files (3-4 hours)

**Pattern to follow**:

```scss
// OLD
@import '../../../../../assets/styles/mixins.scss';

// NEW
@use '@/assets/styles/mixins' as *;
// OR with namespace
@use '@/assets/styles/mixins';
// Then use: mixins.responsive(...)
```

### Phase 3: Test & Verify (1-2 hours)

- Visual regression testing
- Check all components render correctly
- Verify responsive design still works
- Test in both LTR and RTL modes

---

## 🛠️ How to Migrate

### Step 1: Setup Path Alias (if not already done)

Add to `vite.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

### Step 2: Convert Main Files

**Example: `src/assets/styles/main.scss`**

```scss
// Before
@import 'reset';
@import 'base';
@import 'variables';
@import 'mixins';
@import 'utilities';
@import 'typography';
@import 'grid';
@import 'carousel';
@import 'spinner';

// After
@forward 'reset';
@forward 'base';
@forward 'variables';
@forward 'mixins';
@forward 'utilities';
@forward 'typography';
@forward 'grid';
@forward 'carousel';
@forward 'spinner';
```

### Step 3: Update Component Imports

**Pattern for components**:

```scss
// Before
@import '../../../../../assets/styles/mixins.scss';

.my-component {
  @include responsive(mobile) {
    // ...
  }
}

// After
@use '@/assets/styles/mixins' as *;

.my-component {
  @include responsive(mobile) {
    // ...
  }
}
```

### Step 4: Remove Deprecation Suppression

After migration, remove from `vite.config.ts`:

```typescript
css: {
  preprocessorOptions: {
    scss: {
      silenceDeprecations: ['import'], // Remove this line
    },
  },
},
```

---

## 📝 Files to Migrate (Grouped by Priority)

### High Priority (Core Files)

- `src/assets/styles/main.scss`
- `src/assets/styles/variables.scss`
- `src/assets/styles/mixins.scss`
- `src/assets/styles/base.scss`

### Medium Priority (Component Folders)

- All files in `src/modules/`
- All files in `src/modals/`
- All files in `src/component/`

### Complete List

Run this command to see all files:

```bash
grep -r "@import" src --include="*.scss" | wc -l
```

---

## ⚠️ Potential Issues

### Issue 1: Variable Conflicts

**Problem**: Variables from different files might conflict

**Solution**: Use namespaces

```scss
@use 'variables' as vars;
@use 'mixins' as mix;

.component {
  color: vars.$primary-color;
  @include mix.responsive(mobile) {
    // ...
  }
}
```

### Issue 2: Global Built-in Functions ⚠️ **Currently Affected**

**Problem**: Global functions like `map-get`, `adjust-color` are deprecated

**Example from your code** (`src/assets/styles/variables.scss:138`):

```scss
// Before (deprecated)
$value: map-get(map-get($directions, $direction), '#{$key}');
```

**Solution**: Import and use the appropriate Sass module

```scss
@use 'sass:map';

// After
$value: map.get(map.get($directions, $direction), '#{$key}');
```

**Common Sass Modules**:

- `sass:map` - `map-get`, `map-has-key`, `map-merge`, etc.
- `sass:color` - `adjust-color`, `lighten`, `darken`, `rgba`, etc.
- `sass:math` - `round`, `ceil`, `floor`, `abs`, `min`, `max`, etc.
- `sass:string` - `str-index`, `str-slice`, `to-upper-case`, etc.
- `sass:list` - `length`, `nth`, `append`, etc.

### Issue 3: Math Division

**Problem**: `/` operator deprecated for division

**Solution**: Use `math.div()`

```scss
@use 'sass:math';

.component {
  // Before
  width: 100% / 3;

  // After
  width: math.div(100%, 3);
}
```

### Issue 4: Color Functions

**Problem**: Color functions require module import

**Solution**: Import `sass:color`

```scss
@use 'sass:color';

.component {
  // Before
  background: adjust-color($primary, $lightness: 10%);

  // After
  background: color.adjust($primary, $lightness: 10%);
}
```

---

## 🧪 Testing Checklist

After migration:

- [ ] Run `npm run dev` - No Sass errors
- [ ] Check all pages render correctly
- [ ] Verify responsive breakpoints work
- [ ] Test RTL (Arabic) mode
- [ ] Test LTR (English) mode
- [ ] Check dark mode (if applicable)
- [ ] Verify all component styles are correct
- [ ] Check modal styles
- [ ] Test form styles
- [ ] Verify calendar styles
- [ ] Check hover/active states
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport

---

## 🔗 Resources

- [Sass @use Documentation](https://sass-lang.com/documentation/at-rules/use)
- [Sass @forward Documentation](https://sass-lang.com/documentation/at-rules/forward)
- [Sass Module System](https://sass-lang.com/blog/the-module-system-is-launched)
- [Migration Guide](https://sass-lang.com/documentation/breaking-changes/import)
- [Automated Migrator](https://sass-lang.com/documentation/cli/migrator)

---

## 🤖 Automated Migration Tool

Sass provides an automated migration tool:

```bash
# Install globally
npm install -g sass-migrator

# Run migration
sass-migrator module --migrate-deps src/**/*.scss

# Or without installing
npx sass-migrator module --migrate-deps src/**/*.scss
```

⚠️ **Warning**: Always review automated changes and test thoroughly!

---

## 📅 Timeline

**When to do this**:

- ✅ **Now**: Warnings suppressed, not blocking development
- 🟡 **Next quarter**: Plan migration during a sprint with lower feature work
- 🔴 **Before Dart Sass 3.0**: Must complete before the breaking change release

**Dart Sass 3.0 Release**: TBD (not yet announced)

---

## 💡 Recommendation

**Don't rush this migration**. The warnings are suppressed and Dart Sass 3.0 isn't released yet. Schedule this for:

1. A dedicated refactoring sprint
2. When there are fewer feature changes
3. When you have time for thorough testing

---

**Created**: November 4, 2025  
**Last Updated**: November 4, 2025  
**Status**: 🟡 Tracked for future work
