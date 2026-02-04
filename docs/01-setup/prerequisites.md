# Prerequisites

**Purpose:** Everything you need before starting PAI setup
**Estimated Time:** 1-2 hours to gather all requirements
**Last Updated:** February 4, 2026

---

## Table of Contents

1. [Technical Skills Required](#technical-skills-required)
2. [Services & Accounts](#services--accounts)
3. [Software & Tools](#software--tools)
4. [Cost Estimate](#cost-estimate)
5. [Pre-Setup Checklist](#pre-setup-checklist)

---

## Technical Skills Required

### Minimum Skills

**Command Line Basics (Required):**
- Navigate directories (`cd`, `ls`, `pwd`)
- Edit files with a text editor (`nano`, `vim`, or `cat`)
- Run commands and interpret basic error messages
- Copy/paste commands from documentation

**If you can do this, you're ready:**
```bash
# Navigate to home directory
cd ~

# List files
ls -la

# Create a file
echo "Hello PAI" > test.txt

# Read a file
cat test.txt
```

**File Management (Required):**
- Understand file paths (absolute vs relative)
- Know the difference between files and directories
- Comfortable moving/copying files

**APIs & OAuth (Basic Understanding Helpful):**
- What an API key is (a secret password for services)
- What OAuth is (letting apps access your Google/Notion accounts)
- How to copy/paste credentials into configuration files

**NOT Required:**
- Programming knowledge (copy-paste provided code)
- Database administration (guided setup provided)
- DevOps experience (step-by-step instructions)
- Docker expertise (simple commands provided)

### Recommended Skills

**Helpful But Not Required:**
- Basic TypeScript/JavaScript (if you want to customize)
- Git basics (for troubleshooting, but auto-sync handles most)
- JSON syntax (for editing config files)
- Regular expressions (for advanced search patterns)

---

## Services & Accounts

### Required Services

#### 1. VPS (Virtual Private Server)

**Purpose:** Host Telegram bot, Nextcloud, cron jobs

**Recommended Provider: Hostinger VPS**
- Cost: $5-15/month
- Why: Good balance of price, performance, support
- Specs needed: 2 GB RAM, 1-2 CPU cores, 20 GB storage minimum

**Alternatives:**
- DigitalOcean Droplets ($6-12/month)
- Linode ($5-10/month)
- Vultr ($5-10/month)
- Hetzner Cloud (€4-8/month, Europe)

**VPS Requirements:**
- Ubuntu 22.04 LTS (or Ubuntu 24.04)
- Root or sudo access
- Public IP address
- SSH access (port 22)

**Sign up:**
1. Go to [Hostinger VPS](https://www.hostinger.com/vps-hosting)
2. Choose plan: **VPS 1** ($5.99/month) or **VPS 2** ($8.99/month)
3. Select Ubuntu 22.04 LTS as OS
4. Complete payment
5. Save login credentials (sent via email)

**What you'll receive:**
- IP address (e.g., 123.45.67.89)
- Root password
- SSH access instructions

---

#### 2. Neon PostgreSQL

**Purpose:** Main database for all PAI data

**Why Neon:**
- Free tier sufficient to start (0.5 GB storage, 1 compute unit)
- Serverless (auto-scales, auto-pauses when idle)
- Built-in connection pooling
- pgvector extension (for embeddings)

**Sign up:**
1. Go to [neon.tech](https://neon.tech/)
2. Sign up with GitHub or email
3. Create new project: "PAI"
4. Select region: **Europe (AWS eu-west-2)** (or closest to you)
5. Save connection string (starts with `postgresql://`)

**What you'll receive:**
```
postgresql://neondb_owner:[password]@[host].neon.tech/neondb
```

**Free Tier Limits:**
- Storage: 0.5 GB (sufficient for 50,000+ chunks)
- Compute: 1 compute unit (shared CPU)
- Auto-pause after 5 minutes idle
- Always-on compute (upgrade needed): $19/month

**When to Upgrade:**
- Storage exceeds 0.5 GB (after ~1 year for single user)
- Need always-on database (optional, auto-pause is fine)

---

#### 3. Railway

**Purpose:** Host LibreChat web UI and sync service

**Why Railway:**
- Free tier: $5 credit/month (usually sufficient)
- Easy deployment from GitHub
- Built-in cron scheduling
- Automatic HTTPS

**Sign up:**
1. Go to [railway.app](https://railway.app/)
2. Sign up with GitHub
3. Verify email
4. Explore dashboard (don't create projects yet)

**Free Tier Limits:**
- $5 usage credit/month
- Unlimited projects
- Sleep after inactivity (can disable for $0.01/hour)

**Estimated Monthly Cost:**
- Sync service: ~$2-3
- LibreChat: ~$1-2
- Total: ~$3-5/month (free tier usually covers it)

**When to Upgrade:**
- Exceed $5/month (upgrade to Hobby plan: $5/month + usage)

---

#### 4. Notion

**Purpose:** Primary UI for tasks, projects, notes, goals

**Why Notion:**
- Excellent mobile/desktop/web apps
- Databases with relations and properties
- Bidirectional sync with PAI
- Free tier sufficient

**Sign up:**
1. Go to [notion.so](https://www.notion.so/)
2. Sign up with email or Google
3. Create workspace (personal workspace is fine)

**What you'll need later:**
- Create 11 databases (guided in setup)
- Create integration for API access

**Free Tier Limits:**
- Unlimited pages and blocks
- 10 guest collaborators
- 7-day page history

**When to Upgrade:**
- Need longer page history
- Need more collaborators
- (PAI works fine on free tier)

---

#### 5. Google Account

**Purpose:** Google Calendar, Gmail integration

**Requirements:**
- Existing Google account (Gmail)
- Access to Google Calendar
- Ability to enable "Less secure app access" (or use OAuth)

**Setup Steps:**
1. Ensure you have Google Calendar enabled
2. Enable Gmail API (guided in setup)
3. Enable Google Calendar API (guided in setup)
4. Create OAuth credentials (guided in setup)

**Note:** If using Google Workspace (work account), you may need admin permissions to enable APIs.

---

#### 6. Telegram

**Purpose:** Mobile interface to PAI (primary mobile UI)

**Why Telegram:**
- Excellent bot API
- Voice message support (for transcription)
- File attachments (for Inbox processing)
- Inline keyboards (for confirmations)
- Free

**Sign up:**
1. Download Telegram app (iOS, Android, or Desktop)
2. Sign up with phone number
3. Verify phone number
4. Complete profile

**What you'll need later:**
- Create bot via @BotFather (guided in setup)
- Get bot token

---

#### 7. OpenRouter

**Purpose:** LLM API routing (access to Claude, GPT, etc.)

**Why OpenRouter:**
- Single API for multiple LLM providers
- Pay-as-you-go (no monthly subscription)
- Access to Claude Sonnet 4.5 (recommended)
- Cheaper than direct Anthropic API

**Sign up:**
1. Go to [openrouter.ai](https://openrouter.ai/)
2. Sign up with email or Google
3. Add payment method (credit card)
4. Add credits: $10-20 (lasts 1-2 months)
5. Generate API key

**Pricing (as of Feb 2026):**
- Claude Sonnet 4.5: $0.003/1K input, $0.015/1K output
- Claude Haiku 4: $0.00025/1K input, $0.00125/1K output

**Estimated Monthly Cost:**
- Telegram conversations: ~5,000 messages → $5-10
- File classification: ~100 files → $2-3
- Email classification: ~500 emails → $3-5
- Meeting processing: ~10 meetings → $2-3
- **Total: $10-30/month** (varies by usage)

---

### Optional Services

#### 8. Modal (Dockling)

**Purpose:** Document parsing (PDF, DOCX text extraction)

**Why Modal:**
- Serverless Python functions
- Dockling library for high-quality extraction
- Free tier: 30 free credits/month

**Sign up:**
1. Go to [modal.com](https://modal.com/)
2. Sign up with email or GitHub
3. Install Modal CLI (guided in setup)
4. Deploy Dockling function (guided in setup)

**Alternative:**
- Use local text extraction (lower quality)
- Skip document processing entirely (manual classification)

**Free Tier:**
- 30 credits/month
- ~100 document parses/month

---

#### 9. RAWG API (Games Backlog)

**Purpose:** Games database for backlog management

**Optional:** Skip if you don't track games

**Sign up:**
1. Go to [rawg.io/apidocs](https://rawg.io/apidocs)
2. Sign up
3. Generate API key
4. Save key

**Free Tier:**
- 20,000 requests/month
- Sufficient for personal use

---

#### 10. TMDB API (Movies/TV)

**Purpose:** Movies and TV show metadata for watchlist

**Optional:** Skip if you don't track media

**Sign up:**
1. Go to [themoviedb.org](https://www.themoviedb.org/)
2. Sign up
3. Go to Settings → API
4. Request API key
5. Save key

**Free Tier:**
- Unlimited requests
- Rate limit: 40 requests/10 seconds

---

## Software & Tools

### On Your Local Machine

#### 1. SSH Client

**Purpose:** Connect to VPS

**Mac/Linux:**
- Built-in (`ssh` command)
- No installation needed

**Windows:**
- Use built-in OpenSSH (Windows 10+)
- Or install [PuTTY](https://www.putty.org/)

**Test:**
```bash
ssh --version
# Should output: OpenSSH_8.x or higher
```

---

#### 2. Text Editor

**Purpose:** Edit configuration files

**Recommended:**
- **VS Code** (free, beginner-friendly) - [code.visualstudio.com](https://code.visualstudio.com/)
- **Sublime Text** (free trial) - [sublimetext.com](https://www.sublimetext.com/)
- **Notepad++** (Windows, free) - [notepad-plus-plus.org](https://notepad-plus-plus.org/)

**NOT Recommended:**
- Microsoft Word (adds formatting)
- TextEdit (Mac) in Rich Text mode (use Plain Text mode)

---

#### 3. Nextcloud Desktop Client (Optional)

**Purpose:** Sync Nextcloud files to local machine

**Download:**
- [nextcloud.com/install](https://nextcloud.com/install/#install-clients)
- Available for Windows, Mac, Linux

**Alternative:**
- Use Nextcloud web UI only
- Upload files via Telegram bot

---

### On VPS (Will Install During Setup)

The following will be installed during VPS setup:

1. **Docker** - For Nextcloud
2. **Bun** - TypeScript runtime
3. **Node.js** - For some dependencies
4. **Git** - Version control
5. **Claude Code** - Development environment (optional)
6. **PostgreSQL client tools** - Database CLI
7. **ffmpeg** - For meeting recording processing
8. **curl, wget, unzip** - Utilities

**Note:** Installation steps provided in [VPS Setup](vps-setup.md).

---

## Cost Estimate

### Monthly Recurring Costs

| Service | Estimated Cost | Required? |
|---------|---------------|-----------|
| VPS (Hostinger) | $5-15 | ✅ Yes |
| Neon PostgreSQL | $0 (free tier) | ✅ Yes |
| Railway | $0-5 (free tier + overage) | ✅ Yes |
| OpenRouter (LLM API) | $10-30 | ✅ Yes |
| Notion | $0 (free tier) | ✅ Yes |
| Telegram | $0 (free) | ✅ Yes |
| Google (Calendar/Gmail) | $0 (free) | ✅ Yes |
| Modal (Dockling) | $0 (free tier) | ❌ Optional |
| RAWG API | $0 (free) | ❌ Optional |
| TMDB API | $0 (free) | ❌ Optional |
| **Total** | **$15-50/month** | |

### One-Time Costs

| Item | Cost |
|------|------|
| Domain name (optional) | $10-15/year |
| SSH key setup | Free |
| Initial configuration time | 2-4 hours |

### Cost Optimization Tips

**Reduce VPS Costs:**
- Use Hetzner Cloud (€4/month, cheaper than Hostinger)
- Share VPS with other services (if you have existing one)

**Reduce LLM Costs:**
- Use Claude Haiku instead of Sonnet for simple tasks ($0.00025 vs $0.003 per 1K tokens)
- Limit Telegram conversation history (reduce context size)
- Skip meeting transcription (manual note-taking)

**Reduce Railway Costs:**
- Deploy sync service only (skip LibreChat web UI)
- Use Railway free tier only (sleep when inactive)

**Minimum Viable PAI:**
- VPS: $5/month (Hetzner or Hostinger VPS 1)
- PostgreSQL: $0 (Neon free tier)
- Railway: $0 (free tier, no LibreChat)
- LLM: $5-10/month (minimal usage)
- **Total: $10-15/month**

---

## Pre-Setup Checklist

### Before Starting Setup

Print or bookmark this checklist:

**Accounts Created:**
- [ ] VPS account (Hostinger or alternative)
  - [ ] IP address saved
  - [ ] Root password saved
- [ ] Neon PostgreSQL account
  - [ ] Connection string saved
- [ ] Railway account
  - [ ] Logged in with GitHub
- [ ] Notion account
  - [ ] Workspace created
- [ ] Google account
  - [ ] Gmail access confirmed
  - [ ] Google Calendar access confirmed
- [ ] Telegram account
  - [ ] App installed
  - [ ] Phone verified
- [ ] OpenRouter account
  - [ ] Payment method added
  - [ ] Credits purchased ($10-20)
  - [ ] API key generated and saved

**Optional Accounts:**
- [ ] Modal account (for document parsing)
- [ ] RAWG API key (for games tracking)
- [ ] TMDB API key (for media tracking)

**Local Tools Installed:**
- [ ] SSH client (test: `ssh --version`)
- [ ] Text editor (VS Code, Sublime, etc.)
- [ ] Nextcloud desktop client (optional)

**Information Gathered:**
Have the following information ready (save in a password manager):

```
VPS:
  - IP address: _________________
  - Root password: _________________

Neon PostgreSQL:
  - Connection string: postgresql://_________________

OpenRouter:
  - API key: sk-or-_________________

Notion:
  - Workspace ID: _________________

Telegram:
  - Phone number: _________________

Google:
  - Email: _________________
```

**Time Allocated:**
- [ ] 2-4 hours for initial setup
- [ ] Additional 1-2 hours for customization
- [ ] Backup plan if setup takes longer than expected

**Backup Plan:**
- [ ] Know where to get help (GitHub Issues, Discord, etc.)
- [ ] Have alternative time slot if first attempt fails
- [ ] Understand you can pause and resume setup

---

## Knowledge Prerequisites

### Concepts to Understand

**PARA Method (Recommended Reading):**
- **P**rojects - Active projects with deadlines
- **A**reas - Ongoing responsibilities (work, health, family)
- **R**esources - Reference materials and interests
- **A**rchive - Completed items

**Why it matters:** PAI organizes files using PARA structure.

**Reading:**
- [PARA Method Overview](https://fortelabs.com/blog/para/)
- Takes 15 minutes to understand basics

---

**Bidirectional Sync:**
- Changes in Notion update PostgreSQL
- Changes in PostgreSQL update Notion
- Edit anywhere, updates everywhere

**Why it matters:** You need to understand that Notion is the UI, PostgreSQL is the storage.

---

**Semantic Search (RAG):**
- Search by meaning, not just keywords
- "What were our Q1 revenue numbers?" finds relevant documents
- Uses AI embeddings (vector representations of text)

**Why it matters:** Core PAI feature for file/email search.

---

**MCP (Model Context Protocol):**
- Standard protocol for AI tools
- Like browser extensions, but for AI models
- PAI exposes 43 tools via MCP

**Why it matters:** Enables LibreChat integration.

---

### Not Required But Helpful

**TypeScript Basics:**
- Only needed if customizing PAI
- Can use PAI without knowing TypeScript

**Docker Basics:**
- Only need to run provided commands
- Don't need to understand Docker internals

**Database Basics:**
- Setup script handles all database creation
- Can use PAI without SQL knowledge

---

## Next Steps

**Checklist Complete?**
✅ All accounts created
✅ API keys saved
✅ Local tools installed
✅ 2-4 hours allocated
✅ Understanding of key concepts

**Ready to proceed:**
1. **[VPS Setup](vps-setup.md)** - Set up your server
2. **[Database Setup](database-setup.md)** - Initialize PostgreSQL
3. **[Notion Integration](notion-integration.md)** - Connect Notion databases

**Not Ready Yet?**
- Missing accounts: Create them now (links above)
- Missing tools: Install SSH client and text editor
- Need more info: Read [System Overview](../00-overview/system-overview.md)
- Have questions: Check [FAQ](../06-reference/faq.md) or ask on GitHub Discussions

---

## Troubleshooting Prerequisites

### "I don't have a credit card for OpenRouter"

**Solution:**
- Use OpenRouter's crypto payment option
- Or use Anthropic API directly (more expensive)
- Or use local LLM (Ollama) - requires more setup

### "My VPS provider isn't Hostinger"

**That's fine!** Requirements:
- Ubuntu 22.04 or 24.04
- Root/sudo access
- 2 GB RAM minimum
- Public IP address

Any provider meeting these works (DigitalOcean, Linode, Vultr, etc.)

### "I already have some of these services"

**Great!** You can:
- Use existing VPS (if it meets requirements)
- Use existing PostgreSQL (if it has pgvector)
- Use existing Notion workspace
- Use existing Google account

### "The costs seem high for me"

**Minimum viable setup:**
- VPS: $5/month (Hetzner)
- LLM: $5-10/month (light usage, Haiku model)
- Everything else: Free tier
- **Total: $10-15/month**

**Further reduction:**
- Skip LibreChat (Railway free tier unused)
- Skip meeting processing (no ffmpeg/Groq costs)
- Limit Telegram usage (fewer LLM calls)

### "I'm not technical enough"

**You are if you can:**
- Copy/paste commands into a terminal
- Edit a text file and save it
- Follow step-by-step instructions

**Not required:**
- Programming knowledge
- Prior Linux experience
- Understanding how everything works under the hood

**Start with:** Follow setup guides exactly as written. Customize later once comfortable.

---

**Ready?** Proceed to [VPS Setup](vps-setup.md).
