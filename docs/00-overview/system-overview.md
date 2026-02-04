# PAI System Overview

**Purpose:** High-level understanding of how PAI works
**Audience:** New users, developers considering building their own PAI
**Last Updated:** February 4, 2026

---

## Table of Contents

1. [What is PAI?](#what-is-pai)
2. [Core Architecture](#core-architecture)
3. [Data Flow](#data-flow)
4. [Key Systems](#key-systems)
5. [How It All Works Together](#how-it-all-works-together)

---

## What is PAI?

PAI (Personal AI Infrastructure) is a **self-hosted, context-aware AI assistant** that integrates deeply with your digital life.

###Unlike Commercial AI Assistants:
- **ChatGPT/Claude/Gemini:** Isolated apps, no access to your data, stateless conversations
- **PAI:** Connected to your tasks, calendar, files, email, projects - persistent context across all interfaces

### Core Value Proposition:
**PAI knows YOU.** It understands your:
- Current projects and their status
- Upcoming tasks and deadlines
- File organization and content
- Communication patterns
- Goals and priorities

This context enables **proactive assistance**:
- "Your presentation is due tomorrow and you haven't updated it"
- "This email mentions Project X - want me to create a task?"
- "You have 3 meetings today, here's what you need to know"

---

## Core Architecture

PAI consists of **4 layers**:

### Layer 1: Data Storage
**PostgreSQL Database (Neon)**
- 47 tables storing tasks, projects, files, emails, etc.
- Bidirectional sync with external services
- Vector embeddings (pgvector) for semantic search

**File Storage (Nextcloud)**
- PARA-organized: Projects, Areas, Resources, Archive
- Desktop/mobile sync
- Automatic classification and chunking

### Layer 2: External Integrations
**Notion** - Primary UI for tasks, projects, notes
- 11 databases: tasks, projects, goals, notes, people, tags, media, games, system upgrades/fixes
- Bidirectional sync (edit anywhere, updates everywhere)

**Google Calendar** - Calendar events and task triggers
**Gmail** - Email classification and task extraction
**OpenRouter** - LLM API routing (Claude models)
**Telegram** - Mobile messaging interface
**RAWG** - Games database
**TMDB** - Movies/TV database
**Modal** - Document parsing (Dockling)

### Layer 3: Processing & Sync
**Railway Sync Service**
- Runs every 10 minutes
- Notion ↔ PostgreSQL bidirectional sync
- Email fetch and classification
- File processing pipeline

**VPS Automations (Cron)**
- Git auto-sync (every 15 min)
- Health checks (daily)
- RAG reindexing (daily)
- Learning extraction (daily)
- Meeting processing (every 15 min during business hours)

### Layer 4: Interfaces
**Telegram Bot** - Mobile-first interface
- Message processing with Claude Sonnet
- Voice transcription, image analysis
- File handling, task management
- Scheduled notifications

**LibreChat** - Web UI
- Claude conversations
- 43 MCP tools (tasks, calendar, files, search)

**Claude Code** - Development environment
- Native VPS installation
- MCP servers for document generation, RAG search, LLM advisor

---

## Data Flow

### Inbound: External → PAI

```
1. User creates task in Notion
   ↓
2. Railway sync (every 10 min) fetches from Notion API
   ↓
3. Upsert into PostgreSQL `tasks` table
   ↓
4. Available in all PAI interfaces (Telegram, LibreChat, Claude Code)
```

### Outbound: PAI → External

```
1. User creates task via Telegram bot
   ↓
2. Bot inserts into PostgreSQL `tasks` table with flag
   ↓
3. Railway sync (every 10 min) detects new task
   ↓
4. Creates page in Notion via API
   ↓
5. Updates PostgreSQL with Notion page ID
```

### File Processing

```
1. User drops file in Nextcloud Inbox
   ↓
2. Inbox watcher detects new file (real-time)
   ↓
3. Telegram bot asks for hint (optional)
   ↓
4. File processing pipeline:
   - Extract text (Dockling for PDFs/DOCX)
   - Classify (work vs personal, project assignment)
   - Move to appropriate PARA folder
   - Create chunks (hierarchical: doc → section → paragraph)
   - Generate embeddings (OpenAI text-embedding-3-small)
   ↓
5. File indexed and searchable via RAG
```

### Email Processing

```
1. Gmail receives email
   ↓
2. Railway sync fetches via Gmail API
   ↓
3. Classification (LLM):
   - actionable / informational / promotional / junk
   - work vs personal
   - sender tracking
   - project matching
   ↓
4. Auto-labelling in Gmail
   ↓
5. If actionable: Telegram confirmation for task creation
   ↓
6. Task created in PostgreSQL → synced to Notion
```

### Meeting Recording

```
1. User starts recording in Nextcloud Recordings folder
   ↓
2. Cron checks for new recordings (every 15 min during business hours)
   ↓
3. Processing pipeline:
   - Extract audio (ffmpeg)
   - Transcribe (Groq Whisper)
   - Clean transcript (LLM)
   - Speaker detection (vision model on Teams UI screenshots)
   - Extract tasks/decisions/topics (Claude Sonnet)
   - Chunk and embed
   ↓
4. Telegram notification with summary
   ↓
5. Tasks added to database, searchable via RAG
```

---

## Key Systems

### UOCS (Universal Output Capture System)
**The Memory System**

- Captures all session transcripts
- Extracts learnings automatically
- Loads relevant learnings into future sessions
- Topic-organized: Infrastructure, TypeScript, PAI, Security, etc.

**Files:**
- `MEMORY/sessions/` - Session transcripts
- `MEMORY/learnings/` - Extracted insights
- `MEMORY/Research/` - Investigation artifacts
- `MEMORY/decisions/` - Architecture Decision Records (ADRs)

**Feedback Loop:** Past sessions inform future behavior

### UFC (Universal File-based Context)
**The Context System**

- Nested directories with CLAUDE.md files
- File system IS the context (no monolithic config)
- Loaded automatically based on working directory

**Structure:**
```
context/
├── pai/           # PAI infrastructure context
├── tools/         # Available tools and commands
├── projects/      # Work project context
└── areas/         # Personal area context
```

**Design:** Context follows project structure naturally

### Skills System
**Modular Capabilities**

- Invoked with `/skillname` in Claude Code
- Each skill has SKILL.md defining behavior
- Examples: SessionCloser, OPAISync, Agents, Browser, Prompting

**Location:** `~/.claude/skills/`

### Hooks System
**Event-Driven Automation**

17 hooks fire on events:
- SessionStart - Load context, check system health
- SessionStop - Save session, extract learnings
- UserPromptSubmit - Intercept commands, add reminders
- And more...

**Location:** `~/.claude/hooks/`

### MCP Servers
**Model Context Protocol Tools**

**pai-rag-search:**
- `search_files` - Semantic search over documents
- `search_emails` - Semantic search over emails
- `get_file_content` - Retrieve specific files

**pai-doc-gen:**
- `create_document` - Generate Word/PowerPoint/Excel/Markdown
- `list_temp_documents` - Show pending documents
- `finalize_document` - Save to Nextcloud
- `delete_temp_document` - Cancel draft

**pai-llm-advisor:**
- `recommend_models` - Suggest LLM for task
- `list_models` - Show all 59 models (11 providers)

---

## How It All Works Together

### Morning Workflow Example

**7:00 AM - Scheduled Notification**
```
Telegram bot sends morning roundup:
- Tasks due today (from Notion)
- Calendar events (from Google)
- Overdue tasks
- Files expiring soon
```

**7:15 AM - User Checks Telegram**
```
User: "What meetings do I have today?"
Bot: Queries PostgreSQL calendar_events
     Returns: 3 meetings with times and links
```

**9:00 AM - Email Arrives**
```
1. Gmail receives email from client
2. Railway sync fetches and classifies: "actionable, work"
3. Auto-labels in Gmail: "Work/Clients"
4. Telegram: "New email from Client X about Project Y - create task?"
5. User: "yes"
6. Task created in PostgreSQL
7. Next sync (within 10 min) creates Notion page
```

**10:00 AM - File Processing**
```
1. User drops "Q1-Report.pdf" in Nextcloud Inbox
2. Telegram: "New file detected - which project?"
3. User: "Revenue Growth project"
4. File moved to Projects/Revenue Growth/
5. Text extracted, chunked, embedded
6. Now searchable: "what were our Q1 numbers?"
```

**2:00 PM - Meeting Recording**
```
1. User records Teams meeting in Nextcloud Recordings
2. Cron detects new recording (2:15 PM check)
3. Processing:
   - Audio extracted (ffmpeg)
   - Transcribed (Groq Whisper)
   - Speakers identified
   - 3 action items extracted
4. Telegram notification: "Meeting processed: 3 tasks"
5. User confirms tasks
6. Tasks added to Notion
```

**5:00 PM - Proactive Reminder**
```
Telegram bot: "Your presentation for tomorrow isn't in the Drive folder yet"
(Detected by: file search + calendar event matching + deadline awareness)
```

### Context Awareness In Action

**User asks via LibreChat:** "What's the status of the BIM project?"

**PAI's thought process:**
1. Check `projects` table for "BIM" → finds "denovoSkin BIM" project
2. Check `tasks` table for tasks linked to this project
3. Check `notes` table for recent notes
4. Check `files` table for recent documents
5. RAG search for "BIM" mentions across all documents
6. Check `calendar_events` for upcoming meetings

**Response:**
```
The denovoSkin BIM project has:
- 8 active tasks (2 due this week)
- Last updated: Feb 2 (BIM Outline v2.pptx)
- Meeting scheduled: Tomorrow 10 AM
- Recent activity: Cost analysis spreadsheet uploaded Feb 2
- Status from notes: "Waiting on client feedback on slide changes"
```

**Without PAI:** User would need to check Notion, Nextcloud, Calendar, Email separately

---

## Design Principles

### 1. System Over Intelligence
**Good scaffolding beats smart model**

Rather than relying on LLM intelligence alone, PAI provides:
- Structured data (PostgreSQL tables)
- Consistent sync (bidirectional, conflict-free)
- Reliable automation (cron jobs, scheduled notifications)
- Clear interfaces (Telegram commands, MCP tools)

**Example:** File classification uses LLM + rules + user hints + PARA structure

### 2. Text as Thought Primitives
**Markdown for everything**

- Tasks, projects, notes: Markdown in Notion
- Files: Extracted to Markdown, chunked as Markdown
- Context: CLAUDE.md files
- Learnings: Markdown files in MEMORY/
- Documentation: This file you're reading

**Why:** Universal format, human-readable, AI-parseable, version-controllable

### 3. Solve Once, Reuse Forever
**Unix philosophy**

- Each component does one thing well
- Composable: MCP tools, skills, hooks
- Reusable: Same RAG search for files AND emails
- Extensible: Add new sync entities by copying existing patterns

### 4. File System IS Context
**No monolithic config files**

Context organized in nested directories:
```
context/
├── projects/
│   └── ProjectX/
│       └── CLAUDE.md   # Context loaded when working on ProjectX
└── pai/
    └── CLAUDE.md       # Context loaded when working on PAI
```

**Benefit:** Context automatically relevant to current work

---

## System Completeness

**Current Status:** 85-90% complete (as of Feb 2026)

### ✅ Complete & Working
- Database infrastructure (Neon PostgreSQL, 47 tables)
- File storage (Nextcloud, PARA organized)
- Notion sync (11 databases, bidirectional)
- Google Calendar sync (bidirectional)
- Telegram bot (message processing, file handling, notifications)
- LibreChat + MCP (web UI, 43 tools)
- File processing pipeline (scan, classify, move, chunk, embed)
- Email classification (fetch, classify, label)
- RAG search (files and emails)
- Meeting recording pipeline
- Scheduled automations (7 cron jobs)
- Git auto-sync (every 15 minutes)

### ⚠️ Partially Complete
- Email task extraction (works but needs confirmation system refinement)
- Meeting speaker detection (works but accuracy varies)
- File classification (high accuracy but low-confidence cases need manual review)

### ❌ Not Yet Implemented
- Proactive calendar conflict detection
- Automatic task prioritization based on deadlines + importance
- Cross-project dependency tracking
- Advanced analytics dashboard
- Multi-user support (currently single-user only)

### 🔧 Known Limitations
- Systemd user services not available on VPS (Telegram bot runs as direct process)
- No automated database backups yet (manual backups recommended)
- Email system not fully verified (infrastructure exists, needs deeper audit)
- Some workflows still require Telegram confirmation (by design for safety)

---

## Performance Characteristics

### Sync Latency
- **Notion ↔ PostgreSQL:** Max 10 minutes (typically 30 seconds to 2 minutes)
- **Telegram → PostgreSQL:** Instant
- **File processing:** 10-60 seconds depending on file size
- **Email classification:** 30-90 seconds per email

### Costs (Monthly Estimate)
- **VPS (Hostinger):** $5-15
- **LLM API (OpenRouter):** $10-30 (varies by usage)
- **Railway:** $0-5 (free tier usually sufficient)
- **Neon PostgreSQL:** $0 (free tier)
- **Total:** ~$15-50/month

### Resource Usage
- **Database size:** ~500 MB (with embeddings)
- **Nextcloud storage:** Depends on your files (Oscar uses ~20 GB)
- **VPS memory:** 2-4 GB recommended
- **VPS CPU:** 1-2 cores sufficient

---

## Security & Privacy

### Data Ownership
- **You own all data:** PostgreSQL, Nextcloud, Notion all under your control
- **No vendor lock-in:** Can export and migrate anytime
- **Self-hosted processing:** Telegram bot runs on your VPS

### API Keys & OAuth
- **Stored in .env files** (not version controlled)
- **OAuth tokens in database** (encrypted at rest by Neon)
- **GitHub authentication** for sync-to-github
- **Telegram bot token** for messaging

### External API Calls
- **OpenRouter:** LLM inference (Claude models)
- **Notion API:** Sync only (read/write your data)
- **Google APIs:** Calendar, Gmail (OAuth, user consent)
- **RAWG/TMDB:** Public APIs for media metadata

**No data sold or shared.** External APIs only receive data necessary for their specific function.

---

## Next Steps

Now that you understand how PAI works:

1. **[Check Prerequisites](../01-setup/prerequisites.md)** - Make sure you have what you need
2. **[Start Setup](../01-setup/vps-setup.md)** - Begin with VPS configuration
3. **[Explore Capabilities](../02-capabilities/)** - Deep dive into specific systems

Questions? Check the [troubleshooting guide](../05-operations/troubleshooting.md) or [reference documentation](../06-reference/).
