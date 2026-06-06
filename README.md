# 🚗 Auto Company Data Query Tool

> 中国全国车企财务数据、组织架构、招聘计划的自动化采集与在线查询平台

[![Auto Update](https://github.com/YOUR_USERNAME/auto-company-query-tool/actions/workflows/auto-update.yml/badge.svg)](https://github.com/YOUR_USERNAME/auto-company-query-tool/actions/workflows/auto-update.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-brightgreen)](https://YOUR_USERNAME.github.io/auto-company-query-tool/)
[![Data Update](https://img.shields.io/github/last-commit/YOUR_USERNAME/auto-company-query-tool?label=last%20data%20update)](https://github.com/YOUR_USERNAME/auto-company-query-tool/commits/main)

## 🌐 Live Demo

**Website**: https://YOUR_USERNAME.github.io/auto-company-query-tool/

Data auto-updates daily at 2:00 AM (Beijing Time).

## 📊 Features

| Module | Description | Data Source |
|--------|-------------|-------------|
| 💰 Financial Data | Revenue, profit, R&D, assets, cash flow | AKShare / Tushare (Public APIs) |
| 🏢 Organization | Equity structure, subsidiaries, branches, management | Public annual reports |
| 💼 Recruitment | Job postings, salary ranges, hiring trends | Official career sites |

## 🚀 Quick Start (Deploy to Your GitHub)

### Prerequisites
- A GitHub account
- No server, no cost — everything runs on GitHub for free

### Step-by-Step Deployment

1. **Fork this repository** to your GitHub account
2. **Enable GitHub Actions**:
   - Go to your repo → `Actions` tab
   - Click **"I understand my workflows, go ahead and enable them"**
3. **Enable GitHub Pages**:
   - Go to `Settings` → `Pages` → `Source` → select **"GitHub Actions"**
4. **Done!** 🎉
   - Website: `https://<your-username>.github.io/auto-company-query-tool/`
   - Data updates automatically every day at 2:00 AM (Beijing Time)

### Manual Update
- Go to `Actions` → **"Auto Update Auto Company Data"** → `Run workflow`

### Configure Tushare Token (Optional, for enhanced data)
1. Go to `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Name: `TUSHARE_TOKEN`, Value: your Tushare Pro token
4. Get a free token at: https://tushare.pro

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── auto-update.yml      # GitHub Actions: daily data collection
├── scripts/
│   ├── main.py                  # Main entry point
│   ├── financial_collector.py   # Financial data collector
│   ├── recruitment_collector.py # Recruitment data collector
│   └── requirements.txt         # Python dependencies
├── docs/                        # GitHub Pages source
│   ├── index.html               # Main dashboard
│   ├── css/style.css            # Styles
│   └── js/app.js                # Data rendering
├── data/                        # Collected data (auto-generated)
│   ├── financial/               # Financial data (CSV/Excel)
│   ├── recruitment/             # Recruitment data (CSV)
│   └── enterprise/             # Enterprise info (JSON)
├── 全国车企清单.csv              # Company master list
├── 车企数据采集方案.md           # Collection plan document
└── README.md                   # This file
```

## 📋 Company Coverage

| Category | Count | Listed |
|----------|-------|--------|
| Traditional OEM | 20 | 10 listed |
| New Energy / EV | 10 | 6 listed |
| Commercial Vehicle | 11 | 9 listed |
| Joint Venture | 16 | Data in parent reports |
| **Total** | **57+** | — |

## ⚖️ Compliance

- ✅ Only collects **publicly available** data (job postings, listed company filings, business registrations)
- ✅ Respects `robots.txt` and request rate limits (≥3s intervals)
- ✅ Identifies collector with proper `User-Agent`
- ❌ No personal data collection (no resumes, no PII)
- ❌ No anti-circumvention techniques
- ❌ No data resale or redistribution

## 📄 License

MIT License — Free to use, modify, and distribute.
