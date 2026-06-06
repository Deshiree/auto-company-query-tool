# 🚀 Deployment Guide

> Step-by-step guide to deploy the Auto Company Data Query Tool on GitHub with **free hosting**, **automatic daily updates**, and **online dashboard**.

---

## Prerequisites

- A [GitHub](https://github.com) account (free tier is sufficient)
- No server needed — everything runs on GitHub infrastructure at zero cost

---

## Step 1: Create the Repository

### Option A: Fork (Recommended)

1. Go to the source repository page
2. Click the **Fork** button in the top-right corner
3. Select your GitHub account as the fork destination
4. Wait for the fork to complete

### Option B: Create from Scratch

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `auto-company-query-tool`
3. Description: `中国车企数据自动采集与在线查询平台`
4. Set to **Public** (required for free GitHub Pages)
5. ✅ Check "Add a README file"
6. Click **Create repository**
7. Upload all project files to the repository (via web upload or `git push`)

---

## Step 2: Enable GitHub Actions

GitHub Actions may be disabled by default for newly created or forked repositories. You need to enable it manually:

1. Go to your repository on GitHub
2. Click the **Actions** tab in the top navigation bar

   ```
   Repository → Actions
   ```

3. You will see a banner saying workflows are disabled:

   ```
   "Workflows aren't being run on this forked repository"
   ```

4. Click the **"I understand my workflows, go ahead and enable them"** button

   ![Enable Actions](https://docs.github.com/assets/cb-32578/mw-1440/images/help/repository-actions-enable.webp)

5. You should now see the workflow listed: **"Auto Update Auto Company Data"**

> ⚠️ If you don't see this button, go to:
> `Settings` → `Actions` → `General` → Select **"Allow all actions and reusable workflows"** → `Save`

---

## Step 3: Enable GitHub Pages

GitHub Pages provides free web hosting for your dashboard:

1. Go to your repository on GitHub
2. Click **Settings** (⚙️ gear icon) in the top navigation bar

   ```
   Repository → Settings
   ```

3. In the left sidebar, click **Pages**

   ```
   Settings → Pages
   ```

4. Under **"Build and deployment"** → **"Source"**, select:

   ```
   Source: GitHub Actions
   ```

   (Not "Deploy from a branch" — we use GitHub Actions to build and deploy)

5. Click **Save**

> 📝 After the first workflow run completes, your site will be available at:
> `https://<your-username>.github.io/auto-company-query-tool/`

---

## Step 4: (Optional) Configure Tushare Token

Tushare provides enhanced financial data. Without it, AKShare (free, no registration) will be used as the primary data source.

1. Register at [tushare.pro](https://tushare.pro) (free)
2. Copy your API token from the dashboard
3. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
4. Click **"New repository secret"**
5. Fill in:
   - **Name**: `TUSHARE_TOKEN`
   - **Value**: *(paste your token)*
6. Click **Add secret**

> 🔐 Secrets are encrypted and only accessible to GitHub Actions — they are never exposed in logs.

---

## Step 5: Run the First Collection

### Method 1: Manual Trigger (Recommended for first run)

1. Go to your repository → **Actions** tab
2. Click **"Auto Update Auto Company Data"** in the left sidebar
3. Click the **"Run workflow"** button (top right, drop-down)
4. Configure parameters:
   - **Year**: `2025` (or the year you want)
   - **Collect financial data**: ✅
   - **Collect recruitment data**: ✅
5. Click **"Run workflow"** (green button)
6. Wait for the workflow to complete (typically 5-15 minutes)
7. Check the workflow logs for any errors

### Method 2: Wait for Automatic Schedule

The workflow runs automatically at **2:00 AM Beijing Time** (UTC 18:00) every day.

> ⚠️ GitHub may delay scheduled workflows by 5-30 minutes during peak hours.

---

## Step 6: Verify Your Deployment

After the first successful workflow run:

### Check the Data
1. Go to your repository
2. Browse the `data/` directory — you should see CSV/Excel files
3. Check the latest commit message: `📊 Auto update data - YYYY-MM-DD`

### Check the Website
1. Visit: `https://<your-username>.github.io/auto-company-query-tool/`
2. You should see the dashboard with:
   - Company list table
   - Financial data cards
   - Recruitment data table
   - Update timestamps

> ⏳ GitHub Pages deployment may take 1-3 minutes after the workflow completes.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   scripts/    │  │    docs/     │  │    data/      │  │
│  │  (Python)     │  │  (Website)   │  │  (Collected)  │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                  │                  │          │
│  ┌──────▼──────────────────▼──────────────────▼───────┐  │
│  │              GitHub Actions Workflow                │  │
│  │  ┌─────────────┐    ┌──────────────┐              │  │
│  │  │ 1. Collect   │───▶│ 2. Build &   │              │  │
│  │  │    Data      │    │    Deploy    │              │  │
│  │  │  (Python)    │    │    Pages     │              │  │
│  │  └─────────────┘    └──────┬───────┘              │  │
│  └────────────────────────────┼──────────────────────┘  │
│                               │                         │
└───────────────────────────────┼─────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   GitHub Pages CDN    │
                    │   (Free Hosting)      │
                    │                        │
                    │  your-username.github  │
                    │  .io/auto-company-     │
                    │  query-tool/           │
                    └────────────────────────┘
```

---

## Daily Operations

| Action | How |
|--------|-----|
| **Auto update** | Runs daily at 2:00 AM (Beijing Time) — no action needed |
| **Manual update** | Actions → "Auto Update Auto Company Data" → "Run workflow" |
| **Change year** | Manual trigger → set the `year` input |
| **Disable recruitment** | Manual trigger → uncheck "Collect recruitment data" |
| **View logs** | Actions tab → click any workflow run → view job logs |
| **View website** | `https://<your-username>.github.io/auto-company-query-tool/` |

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| **Actions tab says "No workflow runs"** | Enable Actions (Step 2) |
| **Pages returns 404** | Enable Pages with "GitHub Actions" source (Step 3) |
| **Workflow fails** | Check Actions → click the failed run → view error logs |
| **Data not appearing on website** | Check that `data/` directory has files; re-run workflow |
| **Tushare errors** | Token may be expired; check/update `TUSHARE_TOKEN` secret |
| **Scheduled run didn't trigger** | GitHub delays cron jobs; check again in 30 minutes |

---

## Cost Summary

| Item | Cost |
|------|------|
| GitHub repository (public) | **Free** |
| GitHub Actions (2000 min/month free) | **Free** (each run ~10-15 min) |
| GitHub Pages | **Free** |
| AKShare data source | **Free** |
| Tushare (optional) | Free tier available |
| **Total** | **$0/month** |

---

## Security Notes

- ✅ API tokens are stored as GitHub Secrets (encrypted)
- ✅ Only public company data is collected
- ✅ No personal data (PII) is collected
- ✅ `User-Agent` identifies the collector
- ✅ Request rate limiting is enforced (≥3s intervals)
