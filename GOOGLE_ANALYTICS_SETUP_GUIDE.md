# 📊 Google Analytics 4 (GA4) Setup Guide for Tyro Application

**Last Updated**: November 2, 2025  
**Estimated Setup Time**: 10 minutes  
**Skill Level**: Beginner-friendly

---

## 📋 Table of Contents

1. [What is Google Analytics?](#what-is-google-analytics)
2. [Why Do We Need It?](#why-do-we-need-it)
3. [GA4 vs Universal Analytics](#ga4-vs-universal-analytics)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Configuration](#configuration)
6. [Testing](#testing)
7. [Understanding Your Dashboard](#understanding-your-dashboard)
8. [Custom Events](#custom-events)
9. [Privacy & GDPR](#privacy--gdpr)
10. [Troubleshooting](#troubleshooting)

---

## 🔍 What is Google Analytics?

**Google Analytics 4 (GA4)** is a free web analytics service from Google that helps you understand:

### Core Features:

- 📊 **User Behavior**: How many people visit your site, where they come from
- 📈 **Page Views**: Which pages are most popular
- ⏱️ **Engagement**: How long users stay, what they click
- 🎯 **Conversions**: Track sign-ups, bookings, purchases
- 👥 **Demographics**: Age, location, interests of your users
- 📱 **Device Info**: Desktop vs Mobile, browsers used
- 🔍 **Traffic Sources**: Google, Facebook, direct, etc.

### Real-World Example:

**Without Analytics:**

```
You: "I wonder if anyone uses the sessions page?"
Developer: "Not sure... maybe?"
```

**With Analytics:**

```
GA4 Dashboard shows:
- 1,234 users visited /sessions this week ✅
- Average session duration: 3m 42s
- 67% came from Google search
- 45% booked a trial session
- Peak traffic: Sundays at 8 PM

You: "Let's optimize the booking flow and add more Sunday instructors!" 💡
```

---

## 💡 Why Do We Need It?

### 1. **Data-Driven Decisions**

- Know what's working and what's not
- Prioritize features based on actual usage
- Optimize user experience with real data

### 2. **Marketing ROI**

- Which marketing channels bring users?
- Which campaigns convert best?
- Where to invest your marketing budget?

### 3. **User Behavior Insights**

- What do users do after landing on your site?
- Where do they drop off?
- What causes them to leave?

### 4. **Business Metrics**

- How many trial sessions are booked?
- Conversion rate from visitor to student?
- Which instructors are most viewed?

### 5. **Growth Tracking**

- Are you growing week over week?
- Which features drive engagement?
- What's your user retention rate?

---

## 🆕 GA4 vs Universal Analytics

**Important**: Universal Analytics (old GA) stopped collecting data in July 2023. You must use **GA4** (the new version).

### Key Differences:

| Feature          | Universal Analytics (OLD)         | GA4 (NEW)                             |
| ---------------- | --------------------------------- | ------------------------------------- |
| **Status**       | ❌ Deprecated (stopped July 2023) | ✅ Current version                    |
| **Tracking**     | Page views only                   | Events-based (everything is an event) |
| **Privacy**      | Limited privacy controls          | Better privacy, GDPR compliant        |
| **Mobile & Web** | Separate properties               | Unified tracking                      |
| **AI Insights**  | Basic reports                     | Predictive metrics, AI-powered        |
| **Setup**        | Easy but outdated                 | Slightly more complex but powerful    |

**Bottom Line**: Always use GA4 for new projects (which is what we're using).

---

## 🚀 Step-by-Step Setup

### Step 1: Create Google Account (If Needed)

If you don't have a Google account:

1. Go to https://accounts.google.com/signup
2. Follow the signup process
3. Use your business email if possible

**Skip this step if you already have Gmail/Google account.**

---

### Step 2: Create Google Analytics Account (5 minutes)

1. **Go to Google Analytics:**

   ```
   https://analytics.google.com
   ```

2. **Click "Start Measuring"** (or "Admin" if you've used GA before)

3. **Create an Account:**

   ```
   Account Name: Tyro Learning Platform

   (Or use your company/project name)
   ```

4. **Account Settings:**
   - ✅ Check all data sharing settings (recommended)
   - These help Google improve the service

5. **Click "Next"**

---

### Step 3: Create Property (3 minutes)

A "Property" represents your website/app.

1. **Property Setup:**

   ```
   Property name: Tyro Website

   Reporting time zone: Egypt (GMT+2)
   (Or your timezone)

   Currency: Egyptian Pound (EGP)
   (Or your currency)
   ```

2. **Click "Next"**

3. **Business Information:**

   ```
   Industry: Education / Online Learning
   Business size: Small (1-10 employees)
   (Choose what fits your situation)
   ```

4. **How you plan to use Google Analytics:**
   - ✅ Measure customer engagement
   - ✅ Get insights into customer behavior
   - ✅ Analyze user behavior

5. **Click "Create"**

6. **Accept Terms of Service:**
   - ✅ Check "I accept..."
   - Click "Accept"

---

### Step 4: Set Up Data Stream (2 minutes)

Data streams collect data from your website/app.

1. **Choose Platform:**
   - Click **"Web"** (for website)

2. **Web Stream Setup:**

   ```
   Website URL: https://your-domain.com
   (Or https://tyro-app.vercel.app if using Vercel)

   Stream name: Tyro Web App
   ```

3. **Enhanced Measurement (IMPORTANT):**
   - ✅ Keep ALL options checked:
     - Page views ✅
     - Scrolls ✅
     - Outbound clicks ✅
     - Site search ✅
     - Video engagement ✅
     - File downloads ✅

4. **Click "Create Stream"**

---

### Step 5: Get Your Measurement ID (1 minute)

After creating the stream, you'll see:

```
Measurement ID: G-XXXXXXXXXX

Example: G-2K9N7BQX4P
```

**This is what you need for `VITE_GA_MEASUREMENT_ID`!**

**To find it later:**

1. Go to Admin (⚙️ icon bottom left)
2. Under "Property" → Click "Data Streams"
3. Click your stream name
4. Copy the "Measurement ID"

---

## 🔧 Configuration

### Step 6: Add to Your Project

#### For Local Development:

Add to `.env.local`:

```env
# =============================================================================
# Google Analytics Configuration
# =============================================================================

# Get this from: GA4 Admin → Data Streams → Your Stream → Measurement ID
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Enable analytics (set to false to disable)
VITE_ENABLE_ANALYTICS=true
```

#### Complete Example:

```env
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-2K9N7BQX4P
VITE_ENABLE_ANALYTICS=true

# App Config
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Tyro
```

---

### Step 7: Verify Setup

1. **Restart your dev server:**

   ```bash
   npm run dev
   ```

2. **Check console:**
   - You should see: `Google Analytics initialized`
   - If not, check your `.env.local` file

3. **Open your app in browser**

---

## 🧪 Testing

### Test 1: Real-Time Tracking

1. **Go to Google Analytics Dashboard:**

   ```
   https://analytics.google.com
   ```

2. **Navigate to Reports → Real-time:**
   - Left sidebar → Click "Reports"
   - Click "Realtime" (first option)

3. **Open your app in a browser:**

   ```
   http://localhost:4200
   ```

4. **Watch the Real-time Dashboard:**
   - Should show: **1 user** (you!)
   - Page you're viewing
   - Your location
   - Device type

5. **Navigate between pages:**
   - Click around your app
   - Watch real-time updates in GA4

**If you see yourself in real-time: ✅ Analytics is working!**

---

### Test 2: Test Custom Events

The app is already configured to track:

#### Automatic Events:

- ✅ Page views (every route change)
- ✅ Scrolling
- ✅ Clicks on external links
- ✅ Form interactions

#### Custom Events (already implemented):

- ✅ Session bookings
- ✅ Profile updates
- ✅ Search queries
- ✅ Instructor profile views
- ✅ Purchases

**To test custom events:**

1. **Book a trial session** (or any action)

2. **Check GA4 Real-time:**
   - Go to Reports → Realtime
   - Scroll down to "Event count by Event name"
   - You should see your custom event!

---

## 📊 Understanding Your Dashboard

### Main Reports (After 24-48 Hours)

GA4 takes 24-48 hours to populate full reports. Here's what you'll see:

#### 1. **Home Dashboard**

- Overview of users, events, revenue
- Key metrics at a glance

#### 2. **Real-time Report**

- Current users on your site
- What they're doing right now
- Great for testing and monitoring campaigns

#### 3. **Life Cycle Reports**

**Acquisition:**

- Where users come from
- Traffic sources (Google, Facebook, Direct)
- Campaign performance

**Engagement:**

- Which pages are popular
- How long users stay
- What they interact with

**Monetization:**

- Revenue tracking
- Purchase events
- E-commerce data

**Retention:**

- How often users come back
- User loyalty
- Churn rate

#### 4. **User Reports**

**Demographics:**

- Age and gender (if available)
- Interests

**Tech:**

- Devices (mobile vs desktop)
- Browsers (Chrome, Safari, etc.)
- Operating systems

**Location:**

- Countries and cities
- Languages

---

## 🎯 Custom Events

### Events Already Implemented

The app tracks these custom events automatically:

#### 1. **Session Bookings**

```typescript
// When user books a session
trackSessionBooking('trial', instructorId, instructorName, price);
```

**Data tracked:**

- Session type (trial/private/group)
- Instructor ID and name
- Price (if applicable)

#### 2. **Profile Updates**

```typescript
// When user updates profile
trackProfileUpdate('contact_details');
```

**Data tracked:**

- Type of update (contact, password, avatar)

#### 3. **Searches**

```typescript
// When user searches for instructors
trackSearch('english teacher', 'instructors', filters);
```

**Data tracked:**

- Search query
- Category (instructors/courses)
- Applied filters

#### 4. **Purchases**

```typescript
// When user buys a package
trackPurchase(transactionId, amount, currency, items);
```

**Data tracked:**

- Transaction ID
- Total amount
- Currency
- Items purchased

#### 5. **Instructor Views**

```typescript
// When user views instructor profile
trackInstructorView(instructorId, instructorName);
```

**Data tracked:**

- Instructor ID
- Instructor name

---

### How to Add More Events

Want to track something specific? Easy!

```typescript
import { trackEvent } from '../lib/analytics';

// Example: Track when user clicks "Contact Us"
const handleContactClick = () => {
  trackEvent(
    'Contact', // Category
    'click_contact', // Action
    'header_button', // Label (optional)
    undefined, // Value (optional number)
    { source: 'header' }, // Extra params (optional)
  );

  // ... rest of your logic
};
```

**Common Event Ideas:**

- Video plays
- PDF downloads
- Newsletter signups
- Filter usage
- Error occurrences
- Feature usage

---

## 🔒 Privacy & GDPR

### What We're Already Doing

The app is configured with privacy in mind:

```typescript
// In src/lib/analytics.ts
ReactGA.initialize(measurementId, {
  gtagOptions: {
    anonymize_ip: true, // ✅ Anonymize IP addresses
    send_page_view: false, // We control page views manually
  },
});
```

### GDPR Compliance Checklist

- ✅ IP Anonymization enabled
- ✅ No personally identifiable info (PII) tracked without consent
- ⚠️ **TODO**: Add cookie consent banner (if EU users)
- ⚠️ **TODO**: Add "Do Not Track" respect (optional)

### Cookie Consent Banner (If Needed)

If you have EU users, add a cookie consent banner:

**Popular Solutions:**

- [CookieBot](https://www.cookiebot.com/) - Easy, paid
- [OneTrust](https://www.onetrust.com/) - Enterprise
- [Cookie Consent](https://www.osano.com/cookieconsent) - Free, open-source

**Basic Implementation:**

```typescript
// Only initialize GA after user consent
if (userConsentedToCookies) {
  initAnalytics();
}
```

### What Data We Collect

**Automatically Collected:**

- Page URLs
- Device type (mobile/desktop)
- Browser
- Location (city-level, not exact address)
- Session duration

**User Properties (when logged in):**

- User ID (hashed)
- User type (Student/Tutor)
- Email (hashed)

**NOT Collected:**

- Passwords
- Payment details
- Personal messages
- Sensitive personal data

---

## 🚀 Vercel Deployment

### Adding GA4 to Vercel

1. **Go to Vercel Dashboard:**

   ```
   https://vercel.com/[your-username]/[your-project]
   ```

2. **Navigate to Settings → Environment Variables**

3. **Add these variables:**

   | Variable Name            | Value          | Environment                            |
   | ------------------------ | -------------- | -------------------------------------- |
   | `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | All (Production, Preview, Development) |
   | `VITE_ENABLE_ANALYTICS`  | `true`         | All                                    |

4. **Save and Redeploy**

---

## 🎓 Learning Your Dashboard

### Week 1: Basic Metrics

Focus on understanding these:

1. **Users**: Unique visitors
2. **Sessions**: Total visits (one user can have multiple sessions)
3. **Page Views**: Total pages viewed
4. **Engagement Rate**: % of sessions lasting >10 seconds
5. **Bounce Rate**: % leaving after viewing only one page

### Week 2: Traffic Sources

Understand where users come from:

1. **Direct**: Typed URL or bookmarks
2. **Organic Search**: Google, Bing searches
3. **Social**: Facebook, Twitter, Instagram
4. **Referral**: Links from other websites
5. **Paid**: Google Ads, Facebook Ads

### Week 3: User Behavior

See what users do:

1. **Most Popular Pages**
2. **Average Session Duration**
3. **Events per Session**
4. **Conversion Funnels** (e.g., Visit → Sign up → Book session)

### Week 4: Conversions

Track business goals:

1. **Trial Session Bookings**
2. **Package Purchases**
3. **User Registrations**
4. **Contact Form Submissions**

---

## 🔧 Troubleshooting

### Problem: "Google Analytics initialized" Not Showing

**Possible Causes:**

1. **Environment variable not set:**

   ```bash
   # Check your .env.local
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # ✅ Correct
   GA_MEASUREMENT_ID=G-XXXXXXXXXX       # ❌ Wrong (missing VITE_)
   ```

2. **Analytics disabled:**

   ```env
   VITE_ENABLE_ANALYTICS=false  # ❌ Set to true
   ```

3. **Server not restarted:**
   ```bash
   # Kill and restart
   Ctrl+C
   npm run dev
   ```

---

### Problem: Not Seeing Data in GA4

**Possible Causes:**

1. **Data delay:**
   - Real-time: Instant
   - Reports: 24-48 hours
   - **Solution**: Check "Realtime" report first

2. **Ad blockers:**
   - Many ad blockers block GA4
   - **Solution**: Test in incognito or disable ad blocker

3. **Wrong Measurement ID:**
   - Double-check it matches GA4 dashboard
   - Format should be: `G-XXXXXXXXXX` (not `UA-XXXXXX`)

4. **Development filtering:**
   - GA4 might filter localhost traffic
   - **Solution**: Deploy to production and test

---

### Problem: Duplicate Page Views

**Cause**: Analytics initialized multiple times

**Solution**: Already handled! We only initialize once in `src/index.tsx`

---

### Problem: Events Not Tracking

**Debug Steps:**

1. **Check browser console:**

   ```javascript
   // In DevTools console, check:
   window.gtag;
   // Should show a function
   ```

2. **Verify function calls:**

   ```typescript
   // Add console.log in your event
   trackEvent('Test', 'test_event', 'test_label');
   console.log('Event tracked!');
   ```

3. **Check GA4 DebugView:**
   - Enable debug mode:

   ```typescript
   // Add to URL: ?gtm_debug=true
   http://localhost:4200?gtm_debug=true
   ```

   - Go to GA4 → Configure → DebugView
   - See events in real-time with full details

---

## 📚 Additional Resources

### Official Documentation

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Events Guide](https://support.google.com/analytics/answer/9322688)
- [GA4 vs Universal Analytics](https://support.google.com/analytics/answer/11583528)

### Useful Tools

- **Google Tag Assistant**: Chrome extension for debugging
- **GA Debugger**: Chrome extension for GA tracking
- **Google Analytics Demo Account**: Practice with real data

### Learning Resources

- [Google Analytics Academy](https://analytics.google.com/analytics/academy/) - Free courses
- [GA4 YouTube Channel](https://www.youtube.com/c/googleanalytics) - Official tutorials
- [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4) - For advanced usage

---

## ✅ Setup Checklist

- [ ] Created Google Analytics account
- [ ] Created GA4 property
- [ ] Set up web data stream
- [ ] Copied Measurement ID (G-XXXXXXXXXX)
- [ ] Added `VITE_GA_MEASUREMENT_ID` to `.env.local`
- [ ] Set `VITE_ENABLE_ANALYTICS=true`
- [ ] Restarted dev server
- [ ] Tested real-time tracking
- [ ] Saw myself in Real-time report
- [ ] Tested custom events (e.g., session booking)
- [ ] Added environment variables to Vercel
- [ ] Redeployed to production
- [ ] Verified production tracking works
- [ ] (Optional) Added cookie consent banner

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Sign up
https://analytics.google.com → Start Measuring

# 2. Create property
Property Name: Tyro
Platform: Web
Get Measurement ID: G-XXXXXXXXXX

# 3. Add to .env.local
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ENABLE_ANALYTICS=true

# 4. Restart & Test
npm run dev
# Open app, then check GA4 Real-time report ✅
```

---

## 🎉 You're Tracking!

Once configured, Google Analytics will automatically track:

- ✅ Every page view
- ✅ User sessions and engagement
- ✅ Custom events (bookings, searches, etc.)
- ✅ Traffic sources and campaigns
- ✅ Device and location data

**Pro Tips:**

1. Check your dashboard weekly to understand trends
2. Set up custom reports for your key metrics
3. Use data to make informed product decisions
4. Be patient - takes 24-48 hours for full data

**Remember**: Analytics is free and there's no limit on data!

---

**Last Updated**: November 2, 2025  
**Questions?** Check the [Troubleshooting](#troubleshooting) section or Google Analytics Help Center

Happy Analyzing! 📊
