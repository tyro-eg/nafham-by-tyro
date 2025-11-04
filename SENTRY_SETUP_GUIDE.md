# 🛡️ Sentry Setup Guide for Tyro Application

**Last Updated**: November 2, 2025  
**Estimated Setup Time**: 10-15 minutes  
**Skill Level**: Beginner-friendly

---

## 📋 Table of Contents

1. [What is Sentry?](#what-is-sentry)
2. [Why Do We Need It?](#why-do-we-need-it)
3. [Free Tier Benefits](#free-tier-benefits)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Vercel Deployment](#vercel-deployment)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🔍 What is Sentry?

**Sentry** is a **real-time error tracking and performance monitoring platform** that helps you:

### Core Features:

- 🐛 **Error Tracking**: Automatically captures JavaScript errors in production
- 👥 **User Context**: Know which users are affected by errors
- 📊 **Performance Monitoring**: Track slow pages and API calls
- 🔔 **Alerts**: Get notified via email/Slack when errors occur
- 📈 **Trends**: See error frequency and affected user counts
- 🔍 **Debug Info**: Full stack traces, breadcrumbs, and user actions

### Real-World Example:

**Without Sentry:**

```
User: "The booking button doesn't work!"
You: "What error did you see?"
User: "It just didn't work 🤷‍♂️"
You: *Spends 2 hours trying to reproduce*
```

**With Sentry:**

```
Sentry Alert: "TypeError: Cannot read property 'id' of undefined"
- User: Ahmed Mohamed (ahmed@example.com)
- Page: /sessions/book
- Browser: Chrome 118 on Windows 10
- Time: 2 minutes ago
- Stack trace: [Full error details]

You: *Fixes the bug in 10 minutes* ✅
```

---

## 💡 Why Do We Need It?

### 1. **You Can't Test Everything**

- Your local testing can't catch all edge cases
- Production has real users with real data
- Different browsers, devices, network conditions

### 2. **Silent Failures**

- Many JavaScript errors fail silently
- Users might not report issues
- You're losing customers without knowing why

### 3. **Faster Bug Resolution**

- Exact error messages and stack traces
- User context (what they were doing)
- Environment details (browser, device, etc.)

### 4. **Performance Insights**

- Which pages are slow?
- Which API calls are taking too long?
- Where should you optimize?

### 5. **User Experience**

- Proactively fix issues before users complain
- Track error resolution over time
- Improve app stability metrics

---

## 🆓 Free Tier Benefits

Sentry offers a **generous free tier** that's perfect for most applications:

### Free Plan Includes:

- ✅ **5,000 errors per month** (enough for small to medium apps)
- ✅ **10,000 performance transactions per month**
- ✅ **30 days of data retention**
- ✅ **Unlimited team members**
- ✅ **Unlimited projects**
- ✅ **Email alerts**
- ✅ **Slack/Discord integration**
- ✅ **Source maps support**

### When to Upgrade:

- If you exceed 5,000 errors/month (usually means you have bigger problems to fix first! 😄)
- If you need longer data retention (90+ days)
- If you need advanced features (custom metrics, etc.)

**For Tyro**: The free tier should be more than enough, especially during early stages.

---

## 🚀 Step-by-Step Setup

### Step 1: Create Sentry Account (5 minutes)

1. **Go to Sentry website:**

   ```
   https://sentry.io
   ```

2. **Click "Get Started" or "Sign Up"**

3. **Sign up with:**
   - Email and password, OR
   - GitHub account (recommended - faster)

4. **Verify your email** (check spam folder if needed)

---

### Step 2: Create Your First Project (3 minutes)

1. **After logging in, you'll see a "Create Project" page**

2. **Select Platform:**
   - Choose **"React"** from the list
   - This optimizes Sentry for React applications

3. **Set Alert Frequency:**
   - Choose **"Alert me on every new issue"** (recommended for start)
   - You can adjust this later in settings

4. **Name Your Project:**

   ```
   Project Name: tyro-app

   Or use:
   - tyro-production (for production)
   - tyro-staging (for staging)
   ```

5. **Click "Create Project"**

---

### Step 3: Get Your DSN (2 minutes)

After creating the project, you'll see a setup page with installation instructions.

1. **Find the DSN (Data Source Name):**
   - It looks like this:

   ```
   https://abc123def456@o123456.ingest.sentry.io/7891011
   ```

2. **Copy the DSN** - You'll need this for `VITE_SENTRY_DSN`

3. **Don't close this page yet!** You'll need it for the code setup.

---

### Step 4: Get Organization Slug (1 minute)

1. **Go to Settings:**
   - Click the gear icon (⚙️) in the sidebar
   - Or navigate to: `https://sentry.io/settings/`

2. **Find Organization Settings:**
   - Click on your organization name in the sidebar
   - Or go to: `https://sentry.io/settings/[your-org]/`

3. **Copy the Organization Slug:**
   - You'll see: **Organization Slug: `your-organization-name`**
   - Example: `tyro-team`, `my-company`, `ahmed-projects`
   - This is your `VITE_SENTRY_ORG`

---

### Step 5: Get Project Slug (1 minute)

1. **Go to Project Settings:**
   - In Sentry, click on "Projects" in the sidebar
   - Click on your project name (e.g., "tyro-app")
   - Click the gear icon next to your project name

2. **Find Project Slug:**
   - In the "General Settings" section
   - You'll see: **Project Slug: `tyro-app`**
   - This is your `VITE_SENTRY_PROJECT`

---

### Step 6: Generate Auth Token (3 minutes) - OPTIONAL

**⚠️ Note**: This is only needed if you want to upload source maps for better error debugging. You can skip this initially and add it later.

1. **Go to Auth Tokens:**

   ```
   https://sentry.io/settings/account/api/auth-tokens/
   ```

2. **Click "Create New Token"**

3. **Configure Token:**

   ```
   Name: Tyro App Source Maps

   Scopes (select these):
   ✅ project:read
   ✅ project:releases
   ✅ org:read
   ```

4. **Click "Create Token"**

5. **Copy the Token:**
   - ⚠️ **Important**: Copy it now! You won't see it again.
   - Save it in a password manager or secure note
   - This is your `SENTRY_AUTH_TOKEN`

---

## 🔧 Configuration

### Step 7: Add Environment Variables

Now that you have your credentials, add them to your project:

#### For Local Development:

Create/update `.env.local` file in your project root:

```env
# =============================================================================
# Sentry Configuration (Error Tracking)
# =============================================================================

# Get this from: Sentry → Project Settings → Client Keys (DSN)
VITE_SENTRY_DSN=https://your-key-here@o123456.ingest.sentry.io/7891011

# Get this from: Sentry → Organization Settings → Organization Slug
VITE_SENTRY_ORG=your-organization-slug

# Get this from: Sentry → Project Settings → Project Slug
VITE_SENTRY_PROJECT=tyro-app

# Environment name (for filtering in Sentry dashboard)
VITE_SENTRY_ENVIRONMENT=development

# Enable Sentry in development (optional, default: disabled in dev)
VITE_SENTRY_DEV_ENABLED=false

# Auth token for uploading source maps (OPTIONAL - for production builds only)
# Get this from: Sentry → Account Settings → Auth Tokens
# ONLY needed if you want readable stack traces in production
SENTRY_AUTH_TOKEN=your-auth-token-here
```

#### Environment Examples:

**Development (.env.local):**

```env
VITE_SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456
VITE_SENTRY_ORG=tyro-team
VITE_SENTRY_PROJECT=tyro-app
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_DEV_ENABLED=false  # Usually keep disabled in dev
```

**Staging (.env.staging):**

```env
VITE_SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456
VITE_SENTRY_ORG=tyro-team
VITE_SENTRY_PROJECT=tyro-app
VITE_SENTRY_ENVIRONMENT=staging
```

**Production (.env.production):**

```env
VITE_SENTRY_DSN=https://abc123@o123.ingest.sentry.io/456
VITE_SENTRY_ORG=tyro-team
VITE_SENTRY_PROJECT=tyro-app
VITE_SENTRY_ENVIRONMENT=production
SENTRY_AUTH_TOKEN=your-auth-token  # For source maps
```

---

## 🧪 Testing

### Test 1: Verify Configuration

1. **Start your development server:**

   ```bash
   npm run dev
   ```

2. **Check the console:**
   - If configured correctly, you should see:
     ```
     Google Analytics initialized
     ```
   - If DSN is missing, you'll see:
     ```
     Sentry DSN not provided. Error tracking is disabled.
     ```

### Test 2: Trigger a Test Error

**Method 1: Use Browser Console**

1. Open your app in browser
2. Open DevTools (F12)
3. In Console, type:
   ```javascript
   throw new Error('Testing Sentry integration!');
   ```
4. Press Enter

**Method 2: Add a Test Button (Temporary)**

Add this to any component temporarily:

```typescript
<Button
  onClick={() => {
    throw new Error("Test Sentry Error");
  }}
>
  Test Sentry
</Button>
```

### Test 3: Check Sentry Dashboard

1. **Go to Sentry Dashboard:**

   ```
   https://sentry.io/organizations/[your-org]/issues/
   ```

2. **Look for your test error:**
   - Should appear within 1-2 minutes
   - Click on it to see details:
     - Stack trace
     - User info (if logged in)
     - Browser/device info
     - Breadcrumbs (what user did before error)

3. **If you see your error: ✅ Sentry is working!**

---

## 🚀 Vercel Deployment

### Adding Sentry to Vercel (Production)

1. **Go to Vercel Dashboard:**

   ```
   https://vercel.com/[your-username]/[your-project]
   ```

2. **Navigate to Settings → Environment Variables**

3. **Add Sentry Variables:**

   | Variable Name             | Value                | Environment |
   | ------------------------- | -------------------- | ----------- |
   | `VITE_SENTRY_DSN`         | `https://abc123@...` | Production  |
   | `VITE_SENTRY_ORG`         | `your-org`           | Production  |
   | `VITE_SENTRY_PROJECT`     | `tyro-app`           | Production  |
   | `VITE_SENTRY_ENVIRONMENT` | `production`         | Production  |
   | `SENTRY_AUTH_TOKEN`       | `your-token`         | Production  |

4. **Click "Save"**

5. **Redeploy Your App:**
   - Either push a new commit, OR
   - Click "Deployments" → "..." → "Redeploy"

### Environment-Specific Setup

**Best Practice**: Use different Sentry projects for different environments:

1. **Create separate projects in Sentry:**
   - `tyro-production`
   - `tyro-staging`
   - `tyro-development`

2. **Use different DSNs:**
   - Vercel Production → `tyro-production` DSN
   - Vercel Preview → `tyro-staging` DSN
   - Local Dev → `tyro-development` DSN

3. **Benefits:**
   - Separate error dashboards
   - Better organization
   - Different alert rules per environment

---

## 🎯 Best Practices

### 1. **Use Different Environments**

```env
# Development
VITE_SENTRY_ENVIRONMENT=development

# Staging
VITE_SENTRY_ENVIRONMENT=staging

# Production
VITE_SENTRY_ENVIRONMENT=production
```

**Why?** You can filter errors by environment in Sentry dashboard.

---

### 2. **Set Up Alerts**

In Sentry:

1. Go to **Alerts** → **Create Alert**
2. Choose trigger: "First seen issue" (recommended for start)
3. Choose action: "Send email to me"
4. Can also add: Slack notifications, Discord webhooks

---

### 3. **Add User Context**

Already done in the app! When users log in, we send their info to Sentry:

```typescript
// In src/App.tsx - already implemented
useEffect(() => {
  setSentryUser(currentUser);
}, [currentUser]);
```

This means in Sentry, you'll see:

- User ID
- Email
- Name
- User type (Student/Tutor)

---

### 4. **Use Breadcrumbs**

Breadcrumbs show what the user did before the error:

```typescript
import { Sentry } from '../lib/sentry';

// Track important user actions
const handleBookSession = () => {
  Sentry.addBreadcrumb({
    category: 'session',
    message: 'User clicked book session',
    level: 'info',
  });

  // ... rest of booking logic
};
```

---

### 5. **Ignore Known Errors**

Some errors are not important (e.g., browser extensions):

Already configured in `src/lib/sentry.ts`:

```typescript
ignoreErrors: [
  'top.GLOBALS',           // Browser extensions
  'Network request failed', // Network issues
  'canceled',              // Cancelled requests
  'AbortError',
],
```

Add more as needed!

---

### 6. **Release Tracking**

Track which version of your app is deployed:

```typescript
// Already configured in src/lib/sentry.ts
release: `tyro-app@${version}`,
```

**To use:**

1. Update `VITE_APP_VERSION` in your `.env`:

   ```env
   VITE_APP_VERSION=1.0.0
   ```

2. Increment on each deployment:
   - `1.0.0` → Initial release
   - `1.0.1` → Bug fixes
   - `1.1.0` → New features
   - `2.0.0` → Major changes

3. In Sentry, you'll see which errors affect which versions

---

## 🔧 Troubleshooting

### Problem: "Sentry DSN not provided" Warning

**Cause**: Environment variable not set or not loaded

**Solution**:

1. Check `.env.local` exists and has `VITE_SENTRY_DSN`
2. Restart dev server: `npm run dev`
3. Variables must start with `VITE_` to work in Vite

---

### Problem: No Errors Showing in Sentry

**Possible Causes:**

1. **Sentry not initialized:**
   - Check browser console for Sentry init messages
   - Verify DSN is correct

2. **Development mode:**
   - By default, Sentry is disabled in dev
   - Set `VITE_SENTRY_DEV_ENABLED=true` to enable

3. **Error caught by try-catch:**
   - Errors caught by try-catch won't auto-report
   - Manually report: `captureSentryError(error)`

4. **Ad blockers:**
   - Some ad blockers block Sentry
   - Try in incognito mode or different browser

---

### Problem: Source Maps Not Working

**Symptoms**: Errors show minified code instead of readable code

**Solution**:

1. **Check you have `SENTRY_AUTH_TOKEN` in production env**

2. **Verify Sentry Vite plugin is enabled:**

   ```typescript
   // In vite.config.ts
   sentryVitePlugin({
     org: process.env.VITE_SENTRY_ORG,
     project: process.env.VITE_SENTRY_PROJECT,
     authToken: process.env.SENTRY_AUTH_TOKEN,
   }),
   ```

3. **Check source maps are generated:**

   ```typescript
   // In vite.config.ts
   build: {
     sourcemap: true, // ✅ Must be true
   },
   ```

4. **Verify upload after build:**
   ```bash
   npm run build
   # Should see: "Uploading source maps to Sentry..."
   ```

---

### Problem: Too Many Errors

**Cause**: You might have a bug causing repeated errors

**Quick Fixes:**

1. **Set a rate limit:**

   ```typescript
   // In src/lib/sentry.ts
   Sentry.init({
     // ... other config
     beforeSend(event) {
       // Limit to 10 events per session
       return event;
     },
   });
   ```

2. **Resolve or ignore in Sentry dashboard:**
   - Click the error
   - Click "Resolve" to mark as fixed
   - Or click "Ignore" to stop tracking

3. **Add to ignore list:**
   ```typescript
   ignoreErrors: [
     'Your specific error message',
   ],
   ```

---

## 📚 Additional Resources

### Official Documentation

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Vite Plugin](https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/vite/)
- [Error Monitoring Best Practices](https://docs.sentry.io/product/issues/)

### Sentry Dashboard Features

- **Issues**: All errors and their details
- **Performance**: Slow pages and transactions
- **Releases**: Track errors per version
- **Alerts**: Configure notifications
- **Stats**: Error trends over time

### Useful Sentry Queries

```
# In Sentry search bar:

# Errors from production only
is:unresolved environment:production

# Errors affecting specific user
user.email:john@example.com

# Errors in last 24 hours
age:-24h

# Errors from specific page
url:*/sessions/book*
```

---

## ✅ Setup Checklist

Use this checklist when setting up:

- [ ] Created Sentry account
- [ ] Created React project in Sentry
- [ ] Copied DSN from project settings
- [ ] Copied Organization Slug from settings
- [ ] Copied Project Slug from settings
- [ ] (Optional) Generated Auth Token for source maps
- [ ] Added variables to `.env.local`
- [ ] Restarted dev server
- [ ] Tested error tracking with test error
- [ ] Verified error appears in Sentry dashboard
- [ ] Added environment variables to Vercel
- [ ] Redeployed to Vercel
- [ ] Set up email alerts
- [ ] (Optional) Connected Slack/Discord

---

## 🎯 Quick Start (TL;DR)

For the impatient developer:

```bash
# 1. Sign up
https://sentry.io → Sign Up → Create React Project

# 2. Get credentials
DSN: [Copy from project setup page]
Org: [Settings → Organization Slug]
Project: [Settings → Project Slug]

# 3. Add to .env.local
VITE_SENTRY_DSN=your-dsn-here
VITE_SENTRY_ORG=your-org
VITE_SENTRY_PROJECT=your-project
VITE_SENTRY_ENVIRONMENT=development

# 4. Restart & Test
npm run dev
# Then throw an error in browser console

# 5. Check Dashboard
https://sentry.io → Issues → See your error ✅
```

---

## 💬 Need Help?

If you run into issues:

1. **Check Sentry Status**: https://status.sentry.io
2. **Community Forum**: https://forum.sentry.io
3. **Discord**: https://discord.gg/sentry
4. **Support**: [email protected] (for billing/account issues)

---

## 🚀 You're All Set!

Once configured, Sentry will:

- ✅ Automatically capture all JavaScript errors
- ✅ Track user context and actions
- ✅ Send you alerts when issues occur
- ✅ Help you debug and resolve issues faster

**Remember**: The free tier is generous. You'll likely never need to upgrade unless you have massive traffic.

**Pro Tip**: Check your Sentry dashboard once a week to catch and fix issues proactively!

---

**Last Updated**: November 2, 2025  
**Next Review**: When deploying to production

Good luck! 🎉
