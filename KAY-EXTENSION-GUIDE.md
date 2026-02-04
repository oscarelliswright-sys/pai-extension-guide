# KAY Extension Guide: Building on Base PAI

**Purpose:** Transform Daniel Miessler's base PAI into KAY's full-featured system
**Prerequisite:** Base PAI installed from https://github.com/danielmiessler/Personal_AI_Infrastructure
**Time:** 4-8 hours (depending on features selected)

---

## 🎯 What is KAY?

KAY is **Oscar Wright's Personal AI Infrastructure**, built on top of Daniel Miessler's base PAI system. It extends the base with:

- **Advanced Notion integration** (bidirectional sync, 11 databases)
- **Telegram bot interface** (natural language, file handling, notifications)
- **Email system** (classification, auto-labeling, task extraction)
- **File processing pipeline** (automatic classification, RAG search)
- **Meeting recording system** (transcription, speaker detection, task extraction)
- **LibreChat web UI** (43 MCP tools for database operations)
- **Automated sync and monitoring** (cron jobs, health checks)

**This guide helps you replicate KAY's features while making your own choices.**

---

## 🔑 YOU HAVE DIRECT ACCESS TO OSCAR'S LIVE KAY SYSTEM

**CRITICAL: Your Claude Code has MCP tools that connect directly to Oscar's actual database.**

Before implementing ANYTHING, you can:

### Query Oscar's Live System

**Available Tools:**
- **`search_kay_docs`** - RAG search through Oscar's documentation (in his database)
- **`query_kay_system`** - Get live data (10+ entities):
  - recent-syncs, sync-health, sample-task, tasks-summary
  - files-summary, telegram-stats, database-schema
  - notion-databases, calendar-summary, llm-models
- **`get_kay_config`** - Get Oscar's actual configuration (5 components):
  - cron-schedule, sync-configuration, telegram-bot
  - file-processing, integrations
- **`search_kay_memory`** - Search Oscar's MEMORY learnings

### When to Query KAY (Use This Liberally!)

**BEFORE implementing any feature:**
```
Use kay-query tools to:
- Search for "[feature name]" in KAY's documentation
- Get a sample [entity] from KAY's database to see actual structure
- Show me KAY's configuration for [component]
```

**Examples:**
- "Search KAY's docs for 'Notion conflict resolution last-write-wins'"
- "Show me a real task from KAY's database with all sync timestamps"
- "Get KAY's cron schedule to see how often syncs run"
- "What's KAY's file processing pipeline configuration?"
- "Show me KAY's sync health for the last 7 days"

**Why This Matters:**
- Documentation might be unclear → Query for real examples
- Need to see actual field names → Get sample from database
- Unsure about timing/frequency → Check actual cron config
- Want to verify approach → See how Oscar actually does it

**Setup:** Your user should have already configured this (see `KAY-QUERY-SETUP.md`). If tools aren't available, ask them to set it up first.

---

## 🚨 CRITICAL IMPLEMENTATION PRINCIPLES

**Your Claude Code MUST follow these principles when building from KAY's documentation:**

### Principle 1: Decision-First Approach

**Before implementing ANY feature or component:**

1. **Understand WHY Oscar did it this way**
   - Read the relevant documentation section
   - Identify the problem Oscar was solving
   - Understand the trade-offs he considered

2. **Extract decision points**
   - What choices did Oscar make?
   - What were the alternatives?
   - What are the pros/cons of each approach?

3. **Present options to your user**
   - "Oscar did X because Y. Alternatives are A, B, C."
   - "Pros of Oscar's approach: ..."
   - "Cons of Oscar's approach: ..."
   - "Do you want to: (1) Use Oscar's approach, (2) Use alternative A, (3) Customize?"

4. **Wait for decision, then implement**
   - Only after user decides, proceed with implementation
   - Document the decision made (for future reference)

**Example:**

```
📋 Feature: Email Classification

Oscar's Approach:
- Uses Gmail API with OAuth
- Fetches emails every 10 minutes via Railway cron
- LLM classification (4 categories: actionable/informational/promotional/junk)
- Auto-labels in Gmail
- Forwards work email to personal Gmail for unified inbox

Why Oscar chose this:
- Needed IT clearance to access work email API (didn't have it)
- Wanted single inbox for personal + work
- Gmail API is free and reliable

Your Decision Point:
You mentioned you own your company, so you can access work email API directly.

Options:
1. Use Oscar's approach (Gmail + forwarding)
   ✅ Proven to work, documented thoroughly
   ❌ Extra step of forwarding, 10-min delay

2. Use work email API directly (e.g., Microsoft Graph API)
   ✅ No forwarding needed, real-time access
   ✅ Professional email stays in professional system
   ❌ Need to adapt Oscar's code for different API
   ❌ Less documentation available

3. Skip email system entirely
   ✅ Simplest, saves time
   ❌ Lose email automation features

Which approach do you prefer? (1/2/3 or describe custom approach)
```

### Principle 2: Automation-First (Minimize Manual Work)

**Your user is busy. Automate everything possible.**

**Rule: The ONLY time your user does manual work is when:**
- Initial account creation (Railway, Neon, Notion, etc.) that requires human verification
- Copying API keys/tokens (one-time authentication)
- Making strategic decisions (which features to include)

**After ANY manual step, immediately automate the rest:**

**Example Flow - Railway Setup:**

❌ **WRONG Approach:**
```
1. User: Manually create Railway account
2. User: Manually create new project
3. User: Manually add environment variables (one by one)
4. User: Manually deploy service
5. User: Manually configure domains
6. User: Manually set up cron triggers
```

✅ **CORRECT Approach:**
```
1. 👤 User: Create Railway account (MUST be manual - requires email verification)
2. 👤 User: Copy Railway API token (one-time)
3. 🤖 Claude Code: "I'll now set up Railway MCP for automation"
4. 🤖 Claude Code: Install Railway MCP tool
5. 🤖 Claude Code: Authenticate with token
6. 🤖 Claude Code: Create project via MCP
7. 🤖 Claude Code: Deploy all services via MCP
8. 🤖 Claude Code: Configure environment variables via MCP (batch operation)
9. 🤖 Claude Code: Set up domains via MCP
10. 🤖 Claude Code: Configure cron triggers via MCP
11. 🤖 Claude Code: Verify deployment via MCP
12. 🤖 Claude Code: "✅ Railway fully configured. Services deployed: [list]"
```

**Another Example - Database Setup:**

❌ **WRONG:**
```
1. User: Create Neon account
2. User: Copy connection string
3. User: Manually run 47 CREATE TABLE statements
4. User: Manually create indexes
5. User: Manually seed data
```

✅ **CORRECT:**
```
1. 👤 User: Create Neon account (requires email verification)
2. 👤 User: Copy database connection string
3. 🤖 Claude Code: "I'll now set up the complete database schema"
4. 🤖 Claude Code: Test connection
5. 🤖 Claude Code: Execute full schema creation script (all 47 tables at once)
6. 🤖 Claude Code: Create all indexes (batch operation)
7. 🤖 Claude Code: Seed initial data (LLM models, tags)
8. 🤖 Claude Code: Verify all tables exist
9. 🤖 Claude Code: "✅ Database ready. 47 tables created, 59 LLM models seeded."
```

**Implementation Strategy:**

1. **Identify what MUST be manual**
   - Account creation with email verification
   - Payment information entry
   - OAuth consent screens (clicking "Allow")
   - Copying secret tokens/keys

2. **Everything else: Automate via:**
   - MCP tools (preferred - use Railway MCP, GitHub MCP, etc.)
   - API calls (if MCP not available)
   - Shell scripts (for VPS operations)
   - Batch operations (never do things one-by-one if you can batch)

3. **After manual step, immediately:**
   - Install relevant MCP tool or configure API access
   - Verify automation is working
   - Use automation for ALL remaining steps

4. **Provide status updates:**
   - "✅ Account setup complete (manual)"
   - "🤖 Installing automation tools..."
   - "🤖 Configuring [component] via [MCP/API]..."
   - "✅ [Component] fully configured"

**Forbidden Patterns:**

❌ "Now manually add these 47 environment variables to Railway..."
❌ "Copy this SQL and paste it into the database console..."
❌ "Run these 10 commands one by one..."
❌ "Configure each database in Notion by hand..."

✅ "I'll configure all environment variables via Railway MCP..."
✅ "Executing complete schema setup script..."
✅ "Running batch configuration..."
✅ "Creating all 11 Notion databases via API..."

---

## 📋 Prompt for Your Claude Code

**Copy this prompt and give it to your Claude Code installation along with this document:**

```
I have successfully installed Daniel Miessler's base Personal AI Infrastructure.

I now want to extend it to match KAY's system (built by Oscar Wright). KAY is built on top of the same base PAI foundation but adds extensive features.

I'm giving you:
1. This guide (KAY-EXTENSION-GUIDE.md)
2. Link to full KAY documentation: https://github.com/oscarelliswright-sys/pai-extension-guide
3. MCP tools for direct access to Oscar's live KAY system

🔑 CRITICAL CAPABILITY: You have MCP tools to query Oscar's actual running system:
- search_kay_docs: RAG search through Oscar's documentation
- query_kay_system: Get live data (syncs, tasks, files, stats, etc.)
- get_kay_config: Get Oscar's actual configuration
- search_kay_memory: Search Oscar's learnings

USE THESE TOOLS LIBERALLY! Before implementing anything:
- Search KAY's docs for details on that feature
- Get real examples from KAY's database to see actual structure
- Check KAY's configuration to see how Oscar does it
- Query KAY's system state to verify understanding

Your purpose is to help me:
1. Understand what KAY adds on top of base PAI
2. Systematically implement each component
3. Replicate KAY's system as closely as possible
4. Guide me when I want to deviate from KAY's design
5. Help me make decisions about which features to include/exclude

🚨 CRITICAL: You MUST follow these implementation principles:

PRINCIPLE 1 - Decision-First Approach:
- Before implementing ANY feature, read KAY's documentation for that feature
- Understand WHY Oscar made the choices he made
- Extract decision points and alternatives
- Present me with options: "Oscar did X because Y. You could also do A or B. Which do you prefer?"
- Wait for my decision, then implement accordingly
- Document my decision for future reference

PRINCIPLE 2 - Automation-First (I'm Busy):
- I only do manual work when ABSOLUTELY required (account creation, email verification, copying API keys)
- After ANY manual step, you immediately set up automation (MCP tools, API access, scripts)
- Then you use that automation for ALL remaining steps
- NEVER ask me to manually do repetitive tasks (like adding 47 environment variables one-by-one)
- Use batch operations, MCP tools, and API calls to automate everything possible
- Example: I create Railway account → You immediately set up Railway MCP → You do all config via MCP

Features I want to include:
- [ ] Notion bidirectional sync
- [ ] Telegram bot interface
- [ ] Email classification system
- [ ] File processing & RAG search
- [ ] Meeting recording system
- [ ] LibreChat web UI
- [ ] Automated monitoring

Features I may skip:
- [ ] [List any features you want to skip]

Customizations I'm considering:
- [ ] [List any customizations, e.g., "Use work email API instead of Gmail"]

Please read the full KAY documentation from the GitHub link, then:
1. Give me a summary of what you'll build
2. For EACH component, follow the Decision-First approach (present options before implementing)
3. Minimize my manual work by setting up automation immediately
4. Guide me through systematic implementation

IMPORTANT: If you need clarification on any aspect of KAY's design that isn't clear from the documentation, you can query KAY directly using the query system documented in this guide.

Let's begin!
```

---

## 🏗️ What KAY Adds to Base PAI

### Base PAI Provides

✅ Universal File Context (UFC) system
✅ Skills framework
✅ Memory system (UOCS)
✅ Basic tools and context management
✅ Claude Code integration
✅ Git-based knowledge management

### KAY Extends With

**1. Database Layer (PostgreSQL + pgvector)**
- 47 tables covering tasks, projects, notes, files, emails, calendar, people, media, games
- pgvector for RAG search
- Bidirectional sync with Notion
- Full schema documented

**2. Telegram Bot Interface**
- Natural language task/note/calendar management
- File upload and processing
- Voice transcription, image analysis
- Scheduled notifications (morning summary, task reminders, meeting alerts)
- Real-time inbox watching

**3. Notion Integration**
- 11 databases synced bidirectionally (every 10 minutes)
- Conflict resolution (last-write-wins)
- Full property mapping (titles, selects, multi-selects, dates, relations)

**4. File Processing Pipeline**
- Automatic file classification using LLM
- PARA organization (Projects, Areas, Resources, Archive)
- Document parsing (PDF, DOCX, PPTX, XLSX) via Dockling (Modal)
- Chunking and embedding for RAG
- Semantic search across all files

**5. Email System**
- Gmail integration via OAuth
- Automatic classification (actionable/informational/promotional/junk)
- Auto-labeling in Gmail
- Task extraction from actionable emails
- Sender tracking

**6. Meeting Recording**
- Automatic detection of new recordings
- Transcription via Groq Whisper
- Speaker detection using vision model on Teams UI
- Task/decision extraction
- Searchable via RAG

**7. LibreChat Deployment**
- Web-based chat interface
- 43 MCP tools for database operations
- Model selection (59 LLM models tracked)
- Cost tracking

**8. Automation & Monitoring**
- Git auto-sync (every 15 min)
- Health checks (daily)
- Security audits (weekly)
- RAG reindexing (daily)
- Memory maintenance (weekly)
- Meeting detection cron (every 15 min during business hours)

---

## 📖 Full KAY Documentation Structure

The complete documentation is available at: **https://github.com/oscarelliswright-sys/pai-extension-guide**

```
pai-documentation/
├── README.md                          # Introduction
├── CHANGELOG.md                       # Version history
├── START-HERE-FOR-NEW-BUILDERS.md    # You've already read this
├── KAY-EXTENSION-GUIDE.md            # This document
└── docs/
    ├── 00-overview/
    │   ├── system-overview.md         # Architecture overview
    │   └── data-flow.md               # Data flow diagrams
    ├── 01-setup/
    │   ├── architecture.md            # Deep dive: architecture
    │   ├── prerequisites.md           # What you need
    │   ├── vps-setup.md              # Infrastructure setup
    │   ├── database-setup.md         # PostgreSQL + pgvector
    │   ├── notion-integration.md     # Notion sync setup
    │   └── deployment-checklist.md   # Verification checklist
    ├── 02-capabilities/
    │   ├── telegram-bot.md           # Complete bot documentation
    │   ├── notion-sync.md            # Bidirectional sync internals
    │   ├── file-processing.md        # 6-stage pipeline
    │   ├── email-system.md           # Email classification
    │   ├── meeting-recording.md      # Recording pipeline
    │   ├── librechat.md              # Web UI + MCP tools
    │   └── rag-search.md             # Hybrid search system
    ├── 03-usage/
    │   ├── daily-workflow.md         # Morning/day/evening workflows
    │   ├── task-management.md        # Task lifecycle
    │   └── file-management.md        # PARA structure usage
    ├── 04-development/
    │   └── database-schema.md        # All 47 tables documented
    ├── 05-operations/
    │   ├── troubleshooting.md        # Common issues & solutions
    │   └── monitoring.md             # Health checks & metrics
    └── 06-reference/
        ├── quick-reference.md        # Cheat sheet
        ├── telegram-commands.md      # All bot commands
        ├── mcp-tools.md              # 43 tool reference
        └── cron-schedule.md          # Automation schedules
```

---

## 🛠️ Implementation Approach

### Systematic Build Process

Your Claude Code will:

1. **Read full documentation** from GitHub
2. **Understand each component** (database, Telegram, Notion, etc.)
3. **For each component:**
   - Explain what it does and why
   - Show you the implementation
   - Give you decision points where you might customize
   - Install and configure
   - Verify it's working
4. **Integration testing** after each component
5. **Full system verification** at the end

### Recommended Build Order

**Phase 1: Database Foundation (2-3 hours)**
1. Read `docs/01-setup/database-setup.md`
2. Set up Neon PostgreSQL (or local PostgreSQL)
3. Create 47-table schema
4. Enable pgvector extension
5. Seed initial data (LLM models, tags)
6. Verify: Can query database, pgvector working

**Phase 2: Notion Integration (1-2 hours)** *(Skip if not using Notion)*
1. Read `docs/01-setup/notion-integration.md`
2. Create 11 Notion databases
3. Set up integration and tokens
4. Configure bidirectional sync scripts
5. Test: Create task in Notion → appears in database
6. Test: Create task in database → appears in Notion

**Phase 3: Telegram Bot (2-3 hours)**
1. Read `docs/02-capabilities/telegram-bot.md`
2. Create Telegram bot via @BotFather
3. Configure bot with database access
4. Set up tool context (tasks, calendar, files, people)
5. Deploy to VPS or Railway
6. Test: Send message, create task, query calendar

**Phase 4: File Processing (2-4 hours)** *(Optional)*
1. Read `docs/02-capabilities/file-processing.md`
2. Set up Nextcloud or file storage
3. Configure Dockling (Modal) for parsing
4. Implement classification pipeline
5. Set up chunking and embedding
6. Test: Drop file → classified → searchable

**Phase 5: Email System (1-2 hours)** *(Optional, or customize for work email)*
1. Read `docs/02-capabilities/email-system.md`
2. Set up Gmail OAuth OR work email API
3. Configure classification
4. Set up auto-labeling
5. Test: Email arrives → classified → labeled

**Phase 6: Meeting Recording (1-2 hours)** *(Optional)*
1. Read `docs/02-capabilities/meeting-recording.md`
2. Configure Groq Whisper API
3. Set up recording detection cron
4. Test: Drop recording → transcribed → tasks extracted

**Phase 7: LibreChat Web UI (1-2 hours)** *(Optional)*
1. Read `docs/02-capabilities/librechat.md`
2. Deploy LibreChat to Railway
3. Configure 43 MCP tools
4. Test: Open web UI → query tasks → create note

**Phase 8: Automation (1 hour)**
1. Read `docs/06-reference/cron-schedule.md`
2. Set up cron jobs (git sync, health check, RAG reindex, etc.)
3. Verify: Cron running, logs being created

**Phase 9: Verification & Testing (1 hour)**
1. Read `docs/01-setup/deployment-checklist.md`
2. Run through complete checklist
3. Test end-to-end workflows (task creation, file drop, email)
4. Verify all sync working

---

## 🔀 Decision Points: Where You Might Deviate

### Common Customizations

**1. Email Integration**
- **KAY uses:** Gmail API with OAuth, email forwarding for work email
- **You might:** Use work email API directly (if you own company), skip personal email
- **Impact:** Skip Gmail OAuth setup, use work API instead
- **Docs to modify:** `email-system.md` - replace Gmail sections

**2. File Storage**
- **KAY uses:** Nextcloud on VPS Docker
- **You might:** Use company cloud storage, OneDrive, Google Drive, local filesystem
- **Impact:** Different sync mechanism, adjust file watcher
- **Docs to modify:** `file-processing.md` - storage sections

**3. Notion Usage**
- **KAY uses:** 11 Notion databases for everything
- **You might:** Skip Notion entirely, use database + Telegram only
- **Impact:** Skip all Notion setup, no bidirectional sync
- **Docs to skip:** `notion-integration.md`, `notion-sync.md`

**4. Meeting Recording**
- **KAY uses:** Groq Whisper, speaker detection via vision model
- **You might:** Skip if don't record meetings, or use different transcription service
- **Impact:** Skip meeting pipeline setup
- **Docs to skip:** `meeting-recording.md`

**5. LibreChat**
- **KAY uses:** Deployed on Railway, 43 MCP tools
- **You might:** Skip web UI, use Telegram only
- **Impact:** Simpler deployment, no web interface
- **Docs to skip:** `librechat.md`

**6. Hosting**
- **KAY uses:** Hostinger VPS (cloud), Railway (sync), Neon (database)
- **You might:** All local, or all company cloud, or hybrid
- **Impact:** Different deployment steps, networking config
- **Docs to adapt:** `vps-setup.md` - follow spirit, adjust specifics

---

## 🔍 When to Query KAY for Help

If the documentation isn't clear on something, your Claude Code can **query KAY directly** for clarification.

### Query System Setup

**Your Claude Code will have direct access to Oscar's live KAY system via MCP tool.**

This provides:
- RAG search through Oscar's documentation in his database
- Live queries of Oscar's running system (sync status, tasks, files, etc.)
- Oscar's actual configuration (cron schedules, integrations)
- Access to Oscar's MEMORY learnings

**📋 Setup Instructions:** See `KAY-QUERY-SETUP.md` for complete setup guide.

**Quick Overview:**

1. **Oscar creates read-only database user** (one-time setup)
2. **Oscar shares connection string with you**
3. **You configure your Claude Code** with the MCP tool:

```json
// ~/.config/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "kay-query": {
      "command": "bun",
      "args": ["run", "/home/YOUR_USERNAME/.claude/tools/mcp/kay-query-direct.ts"],
      "env": {
        "DATABASE_URL": "postgresql://readonly_user:PASSWORD@...neon.tech/neondb",
        "OPENAI_API_KEY": "sk-proj-..."
      }
    }
  }
}
```

4. **Copy the MCP tool file** from the pai-extension-guide repo:
```bash
cp ~/reference/pai-blueprints/pai-extension-guide/mcp/kay-query-direct.ts \
   ~/.claude/tools/mcp/
```

5. **Restart Claude Code** to load the tool

**Available Tools:**

- **`search_kay_docs`** - Search Oscar's documentation using RAG
- **`query_kay_system`** - Get live data from Oscar's system (10+ entities)
- **`get_kay_config`** - Get Oscar's actual configuration (5 components)
- **`search_kay_memory`** - Search Oscar's accumulated learnings

**Example Usage:**

```
Use kay-query tools to:
- Search for "Notion conflict resolution" in KAY's docs
- Show me a sample task from KAY's database
- Get KAY's cron schedule
- What's KAY's sync health for the last 7 days?
```

### What to Query KAY About

**Good questions:**
- "The docs say to use IVFFlat index for pgvector, but why not HNSW?"
- "How do you handle large files (>100MB) in the file processing pipeline?"
- "What's the format of the tool context passed to the Telegram bot?"
- "Can you show me an example of a successful Notion page creation API call?"

**Questions the docs should answer (read first):**
- "What databases do I need?" → `database-setup.md`
- "How do I create Notion integration?" → `notion-integration.md`
- "What's the PARA method?" → `file-management.md`

---

## 📊 Feature Selection Matrix

**Use this to decide what to build:**

| Feature | Complexity | Value | Skip if... |
|---------|-----------|-------|------------|
| **PostgreSQL Database** | Medium | ⭐⭐⭐⭐⭐ | Never (required) |
| **Telegram Bot** | Medium | ⭐⭐⭐⭐⭐ | You prefer web UI only |
| **Notion Sync** | Medium | ⭐⭐⭐⭐ | Don't use Notion |
| **File Processing** | High | ⭐⭐⭐⭐ | Don't need document search |
| **RAG Search** | High | ⭐⭐⭐⭐ | Don't have many documents |
| **Email Classification** | Medium | ⭐⭐⭐ | Don't want email automation |
| **Meeting Recording** | High | ⭐⭐⭐ | Don't record meetings |
| **LibreChat Web UI** | Medium | ⭐⭐⭐ | Telegram is enough |
| **Cron Automation** | Low | ⭐⭐⭐⭐⭐ | Never (required for sync) |

**Minimum Viable KAY:**
- ✅ PostgreSQL Database
- ✅ Telegram Bot
- ✅ Cron Automation (git sync, health check)
- ❌ Skip everything else initially
- ✅ Add features later as needed

---

## ✅ Verification Checklist

After your Claude Code finishes implementation, verify:

**Core Infrastructure:**
- [ ] PostgreSQL accessible and has 47 tables
- [ ] pgvector extension working (test query runs)
- [ ] Environment variables configured (.env file)
- [ ] Git auto-sync running (commits every 15 min)

**Telegram Bot (if included):**
- [ ] Bot responds to /help
- [ ] Can create tasks via natural language
- [ ] Can query calendar
- [ ] Scheduled notifications working (test morning summary)

**Notion Sync (if included):**
- [ ] Create task in Notion → appears in database (within 10 min)
- [ ] Create task in database → appears in Notion (within 10 min)
- [ ] All 11 databases connected and syncing

**File Processing (if included):**
- [ ] Drop file in Inbox → Telegram notification
- [ ] File classified and moved to correct folder
- [ ] File searchable via RAG

**Email (if included):**
- [ ] Emails fetched from Gmail/work email
- [ ] Emails classified correctly
- [ ] Auto-labeling working

**Automation:**
- [ ] Cron jobs running (check `crontab -l`)
- [ ] Logs being generated (check `/home/ubuntu/automations/logs/`)
- [ ] No errors in recent logs

---

## 🆘 Troubleshooting

### "Documentation is overwhelming"

**Solution:** Focus on one component at a time. Start with database + Telegram bot only. Add features weekly.

### "Feature X doesn't work"

**Process:**
1. Check `docs/05-operations/troubleshooting.md` for this specific issue
2. Read the component's documentation (e.g., `telegram-bot.md`) troubleshooting section
3. Query KAY for help if still stuck
4. Check logs (Railway, VPS, database)

### "I want to do something differently"

**That's fine!** The docs show **how KAY does it**, not **how you must do it**.

**Examples:**
- Use PostgreSQL locally instead of Neon → Totally fine
- Use Discord bot instead of Telegram → Great, similar architecture
- Skip Notion and use Obsidian → Adjust sync scripts
- Use Anthropic API directly instead of OpenRouter → Just change endpoint

**Ask your Claude Code:** "I want to do X differently. Here's KAY's approach [link to doc]. How should I adapt it?"

### "Can't reach KAY query system"

**Fallbacks:**
1. Search the full documentation GitHub repo
2. Check `troubleshooting.md` for similar issues
3. Use regular Claude (claude.ai) and upload relevant doc sections
4. Ask in PAI community forums (if available)

---

## 📈 Post-Implementation

### Once KAY is Built

**Week 1: Adjust & Fine-Tune**
- Monitor sync_run_history for failures
- Adjust notification timings to your preference
- Fine-tune file classification (add hints for your projects)
- Set up shortcuts/aliases for common operations

**Month 1: Optimize**
- Review LLM costs (`/costs` command in Telegram)
- Optimize sync frequency if needed
- Add custom workflows specific to your needs
- Extract learnings to MEMORY/ for your Claude Code

**Ongoing:**
- Follow Daniel Miessler's PAI updates
- Pull new features from KAY as they're added
- Share your customizations back with community

---

## 🔗 Resources

**Base PAI (Required Foundation):**
- GitHub: https://github.com/danielmiessler/Personal_AI_Infrastructure
- Official Bundles: https://github.com/danielmiessler/Personal_AI_Infrastructure/tree/main/Bundles/Official

**KAY Documentation (This System):**
- GitHub: [URL to be added after push]
- Start Guide: `START-HERE-FOR-NEW-BUILDERS.md`
- This Guide: `KAY-EXTENSION-GUIDE.md`

**Query KAY:**
- MCP Tool: Available after Railway API deployment
- API Endpoint: `https://kay-pai-api.railway.app/query` (if deployed)
- Shared Context: Setup instructions above

**Community:**
- Daniel Miessler's resources: [Links]
- PAI Builders: [Forum links if available]

---

## 🎉 You're Ready!

**Your path:**

1. ✅ Base PAI installed (Daniel Miessler's official bundles)
2. ✅ You've read this guide
3. ⬜ Give your Claude Code the prompt at the top of this document
4. ⬜ Link it to full KAY documentation: [GitHub URL]
5. ⬜ Let Claude Code systematically build each component
6. ⬜ Make decisions where you want to customize
7. ⬜ Query KAY when you need clarification
8. ⬜ Verify everything works
9. ⬜ Enjoy your personal AI infrastructure!

**Remember:** This is YOUR system. KAY's documentation shows one way to build PAI, but you should customize it to fit your life and work.

---

**Good luck extending to KAY!** 🚀

*Last updated: February 4, 2026*
*Based on KAY v1.0.0*
