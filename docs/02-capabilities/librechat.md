# LibreChat Web Interface

**Purpose:** Web-based AI chat interface with full PAI tool integration
**URL:** https://pai-api-production.up.railway.app
**Deployment:** Railway (Docker container)
**Models:** Claude Opus 4.5, Claude Sonnet 4, GPT-4, Gemini, and 50+ others via OpenRouter
**Tools:** 43 MCP tools for tasks, calendar, files, documents, search
**Status:** Production, actively used

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Available Tools](#available-tools)
4. [Model Selection](#model-selection)
5. [Preset Configurations](#preset-configurations)
6. [MCP Server](#mcp-server)
7. [Context System](#context-system)
8. [Authentication](#authentication)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

LibreChat is the **web interface** for Kay, providing a ChatGPT-like experience with deep PAI integration.

### Why LibreChat?

**vs Claude.ai / ChatGPT:**
- ✅ Integrated with your tasks, calendar, files
- ✅ Can create tasks, schedule events, search documents
- ✅ Persistent context about your projects
- ✅ Multiple model options (Claude, GPT, Gemini)
- ✅ Self-hosted, your data stays private

**vs Telegram Bot:**
- ✅ Better for long-form conversations
- ✅ Code formatting, markdown rendering
- ✅ Image generation (DALL-E, Stable Diffusion)
- ✅ Desktop experience (larger screen)
- ❌ Not mobile-optimized
- ❌ No proactive notifications

**vs Claude Code:**
- ✅ Simpler interface for non-technical queries
- ✅ No CLI knowledge required
- ❌ Can't edit code files directly
- ❌ No system administration access

### Core Features

**1. Tool Calling (43 tools)**
- Query tasks: "What tasks are due this week?"
- Search files: "Find documents about cost-effectiveness"
- Create events: "Schedule meeting with Sarah tomorrow 2pm"
- Generate documents: "Create a project status report"

**2. Multi-Model Support**
- Claude Opus 4.5 (most capable)
- Claude Sonnet 4 (fast, high quality)
- GPT-4o (OpenAI's latest)
- Gemini 2.0 Flash (Google, experimental)
- 50+ models via OpenRouter

**3. Conversation Branching**
- Fork conversations at any point
- Try different approaches
- Compare model responses

**4. Presets**
- Quick-start configurations
- "Task Manager" (default: Sonnet 4 + task tools)
- "Document Writer" (Opus 4.5 + doc tools)
- "Research Assistant" (Sonnet 4 + search tools)

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     User Browser                          │
│  https://pai-api-production.up.railway.app              │
└──────────────────────────────────────────────────────────┘
                          ↕ HTTPS
┌──────────────────────────────────────────────────────────┐
│              LibreChat Frontend (React)                   │
│  - Chat interface                                         │
│  - Model selection                                        │
│  - Tool call visualization                                │
│  - Conversation history                                   │
└──────────────────────────────────────────────────────────┘
                          ↕ REST API
┌──────────────────────────────────────────────────────────┐
│            LibreChat Backend (Node.js)                    │
│  - User authentication (OAuth)                            │
│  - Conversation storage (MongoDB)                         │
│  - Model routing (OpenRouter)                             │
│  - MCP client (connects to PAI MCP server)               │
└──────────────────────────────────────────────────────────┘
                          ↕ MCP Protocol
┌──────────────────────────────────────────────────────────┐
│              PAI API MCP Server (Railway)                 │
│  /mcp endpoint - WebStandardStreamableHTTPTransport      │
│                                                           │
│  43 Tools:                                                │
│  ├─ Task management (create, query, update)             │
│  ├─ Calendar operations (events, scheduling)            │
│  ├─ File search (RAG semantic search)                   │
│  ├─ Email search (semantic search)                      │
│  ├─ Document generation (Word, PowerPoint, Excel)       │
│  ├─ Context queries (projects, areas, learnings)        │
│  ├─ People management                                     │
│  ├─ Notes and goals                                      │
│  ├─ Media and games tracking                             │
│  └─ Work projects                                         │
└──────────────────────────────────────────────────────────┘
                          ↕ PostgreSQL
┌──────────────────────────────────────────────────────────┐
│           Neon PostgreSQL (eu-west-2)                     │
│  - tasks, projects, notes, people, tags, goals           │
│  - files, file_chunks (with embeddings)                  │
│  - email_logs (with embeddings)                          │
│  - calendar_events                                        │
│  - work_projects                                          │
│  - media, games                                           │
│  - context_mirror (UFC context files)                    │
└──────────────────────────────────────────────────────────┘
```

**Key Components:**

1. **LibreChat** - Open-source ChatGPT alternative (MIT license)
2. **PAI MCP Server** - Custom MCP server exposing PAI functionality
3. **OpenRouter** - LLM API aggregator (access to 100+ models)
4. **Railway** - Hosting platform (auto-deployment from GitHub)

---

## Available Tools

LibreChat connects to the PAI MCP server, which provides 43 tools grouped by function:

### Task Management (8 tools)

| Tool | Purpose | Example |
|------|---------|---------|
| `get_tasks` | Query tasks with filters | "Show tasks due this week" |
| `query_tasks` | Advanced task search | "Find high-priority work tasks" |
| `query_pending_tasks` | List pending confirmations | "Show pending task confirmations" |
| `create_task` | Create new task | "Create task: Review deliverable" |
| `update_task` | Update existing task | "Mark task X as done" |
| `delete_task` | Delete task | "Delete that task" |
| `archive_task` | Archive completed task | "Archive all done tasks" |
| `get_project_tasks` | Tasks for specific project | "Show CTS010 tasks" |

**Example Conversation:**

```
User: What tasks do I have today?

Kay: [Calls get_tasks with due_date=today]

You have 3 tasks today:

1. Review denovoSkin deliverable (High priority)
   Project: CTS010
   Due: Today 5:00 PM

2. Call dentist (Medium priority)
   Due: Today

3. Update project timeline (High priority)
   Project: SOBI036
   Due: Today

---

User: Mark task 1 as done

Kay: [Calls update_task with id=task-1-uuid, status=done]

✓ Marked "Review denovoSkin deliverable" as done.
```

---

### Calendar (3 tools)

| Tool | Purpose | Example |
|------|---------|---------|
| `get_calendar` | Query calendar events | "What's on my calendar tomorrow?" |
| `create_calendar_event` | Schedule new event | "Schedule meeting with Sarah 2pm" |
| `update_calendar_event` | Modify event | "Move that meeting to 3pm" |

**Example:**

```
User: What meetings do I have this week?

Kay: [Calls get_calendar with start=2026-02-03, end=2026-02-09]

This week you have 5 meetings:

**Tuesday, Feb 4:**
• 10:00 AM - DenovoSkin Review (1 hour)
• 2:00 PM - Client Call (30 min)

**Wednesday, Feb 5:**
• 9:00 AM - Team Standup (15 min)

**Thursday, Feb 6:**
• 3:00 PM - Project Planning (1 hour)

**Friday, Feb 7:**
• 11:00 AM - Weekly Review (30 min)
```

---

### File & Email Search (3 tools)

| Tool | Purpose | Example |
|------|---------|---------|
| `search_files` | Semantic file search | "Find cost-effectiveness documents" |
| `search_emails` | Semantic email search | "Find emails from Ben about deliverables" |
| `get_file_content` | Retrieve full file content | "Get content of proposal.pdf" |

**RAG-Powered Search:**

```
User: Find documents discussing patient outcomes in the denovoSkin project

Kay: [Calls search_files with query="patient outcomes denovoSkin", folder="CTS010"]

Found 4 relevant documents:

1. **CTS010_Deliverable_Q4.pdf** (Similarity: 94%)
   Section: "Clinical Outcomes Analysis"
   "Patient-reported outcomes showed significant improvement in wound healing rates..."

2. **Clinical_Evidence_Review.docx** (Similarity: 87%)
   Section: "Efficacy Data"
   "The pivotal trial demonstrated superiority in patient outcomes compared to standard care..."

3. **Cost_Effectiveness_Analysis.xlsx** (Similarity: 81%)
   Section: "QALY Calculations"
   "Quality-adjusted life years were calculated based on patient outcome data..."

4. **Literature_Review.pdf** (Similarity: 76%)
   Section: "Systematic Review Results"
   "Meta-analysis of patient outcomes across 15 studies..."

Would you like me to retrieve the full content of any of these?
```

---

### Document Generation (4 tools)

| Tool | Purpose | Example |
|------|---------|---------|
| `create_document` | Generate Word/PowerPoint/Excel/Markdown | "Create project status report" |
| `list_temp_documents` | Show pending documents | "Show documents awaiting review" |
| `finalize_document` | Move to final location | "Finalize that report" |
| `delete_temp_document` | Delete draft | "Delete temp document" |

**Example:**

```
User: Create a project status report for CTS010 as a Word document

Kay: [Calls create_document with type=docx, content=generated report]

✓ Created: CTS010_Status_Report.docx

📄 **Document Preview:**

# CTS010 denovoSkin - Project Status Report

## Executive Summary
The denovoSkin project is on track for Q4 deliverable completion...

## Current Status
- Phase: Deliverable finalization
- Timeline: On schedule (due Friday, Feb 7)
- Budget: Within allocation

## Key Milestones
✓ Data analysis complete (Feb 1)
✓ Draft deliverable reviewed (Feb 4)
⏳ Client review pending (Feb 7)
⏳ Final submission (Feb 14)

## Recent Activity
- Feb 4: Team meeting - deliverable review
- Feb 1: Data analysis completed by Sarah
- Jan 28: Client feedback incorporated

## Next Steps
1. Oscar to finalize review by Friday
2. Submit to client for feedback
3. Address client comments by Feb 14

---

Document saved to: Temp/CTS010_Status_Report.docx

Reply "finalize" to move to final location or "open" to view.
```

---

### Context Queries (4 tools)

| Tool | Purpose | Example |
|------|---------|---------|
| `get_system_context` | Load UFC context | "What's in the PAI context?" |
| `get_project_context` | Load project context | "Show CTS010 project context" |
| `get_area_context` | Load area context | "Show Health area context" |
| `search_learnings` | Search MEMORY/learnings | "Find learnings about TypeScript" |

**Example:**

```
User: What's the current status of CTS010?

Kay: [Calls get_project_context with project="CTS010"]

# CTS010 denovoSkin Project

## Overview
Health technology assessment for denovoSkin advanced wound care product.

**Status:** Active - Deliverable finalization phase
**Client:** Cogentia Healthcare Consulting
**Timeline:** Q4 2025 - Q1 2026
**Team:** Oscar Wright (lead), Sarah Johnson (analyst), Ben Wilding (PM)

## Recent Activity

**Feb 4, 2026** - Team Meeting
- Deliverable draft reviewed
- Timeline confirmed for Friday submission
- Client feedback from last round incorporated

**Feb 1, 2026** - Data Analysis Complete
- Cost-effectiveness analysis finalized
- Budget impact model updated
- QALY calculations validated

## Key Contacts

**Ben Wilding** (Project Manager)
- Email: ben@cogentia.co.uk
- Last contact: Feb 4, 2026
- Topics: deliverables, timelines, client relationships

**Sarah Johnson** (Senior Analyst)
- Email: sarah@cogentia.co.uk
- Last contact: Feb 4, 2026
- Topics: data analysis, methodology, cost-effectiveness

## Current Tasks (5 active)

1. Review deliverable draft - Oscar (due Friday)
2. Finalize data tables - Sarah (due Wednesday)
3. Client presentation prep - Ben (due next week)
4. Budget reconciliation - Sarah (due Feb 15)
5. Archive project files - Oscar (due Feb 28)
```

---

### Data Management (21 tools)

**People:**
- `query_people` - Search contacts
- `create_person` - Add new contact
- `update_person` - Modify contact details

**Projects:**
- `query_projects` - List projects
- `create_project` - Start new project
- `update_project` - Modify project

**Goals:**
- `query_goals` - List goals
- `create_goal` - Set new goal
- `update_goal_progress` - Update progress

**Notes:**
- `query_notes` - Search notes
- `create_note` - Create note

**Work Projects:**
- `query_work_projects` - List work projects
- `create_work_project` - Add work project
- `update_work_project` - Modify work project
- `archive_work_project` - Archive project

**Media & Games:**
- `query_media` - Search watchlist
- `add_media` - Add movie/show
- `update_media_watched` - Mark as watched
- `query_games` - Search backlog
- `add_game` - Add game
- `update_game_status` - Update status

**Notifications:**
- `send_notification` - Send Telegram message

---

## Model Selection

LibreChat offers 50+ models via OpenRouter. Key recommendations:

### Recommended Models

| Model | Use Case | Cost | Speed | Quality |
|-------|----------|------|-------|---------|
| **Claude Opus 4.5** | Complex analysis, document writing | $15/$75 per M | Slow | Highest |
| **Claude Sonnet 4** | General purpose, balanced | $3/$15 per M | Fast | Very High |
| **Claude 3.5 Haiku** | Simple queries, quick tasks | $0.80/$4 per M | Very Fast | High |
| **GPT-4o** | Alternative to Claude, coding | $2.50/$10 per M | Fast | Very High |
| **Gemini 2.0 Flash** | Free option, experimental | Free | Very Fast | Medium |

### When to Use Each Model

**Claude Opus 4.5** (Best for quality)
- ✅ Writing important documents (proposals, reports)
- ✅ Complex analysis (data interpretation, strategy)
- ✅ Critical decisions (high stakes)
- ❌ Simple queries (expensive)
- ❌ Quick tasks (slow)

**Claude Sonnet 4** (Default for most tasks)
- ✅ Task management ("show my tasks")
- ✅ File searches ("find documents about X")
- ✅ Quick questions ("when is my next meeting?")
- ✅ Document generation (status reports)
- ✅ Email summarization

**Claude 3.5 Haiku** (Speed matters)
- ✅ Very simple queries ("what's the time?")
- ✅ Quick confirmations ("mark task done")
- ✅ High-frequency usage (cost savings)
- ❌ Complex reasoning
- ❌ Long-form writing

**GPT-4o** (Alternative perspective)
- ✅ When Claude unavailable
- ✅ Coding assistance (Python, TypeScript)
- ✅ Math and calculations
- ✅ Different reasoning style

**Gemini 2.0 Flash** (Free tier)
- ✅ Testing new features
- ✅ Cost-sensitive queries
- ❌ Critical tasks (lower quality)
- ❌ Tool calling (less reliable)

### Model Selection in UI

**Change model mid-conversation:**

1. Click model dropdown (top of chat)
2. Select new model
3. Continue conversation

**Model automatically switches context:**
- Previous messages stay with original model
- New messages use selected model
- Both visible in conversation history

---

## Preset Configurations

Presets are **quick-start configurations** that combine:
- Recommended model
- System prompt
- Available tools
- Temperature settings

### Available Presets

**1. Task Manager (Default)**
```yaml
name: Task Manager
model: Claude Sonnet 4
tools:
  - get_tasks
  - create_task
  - update_task
  - query_pending_tasks
  - get_calendar
  - create_calendar_event
system_prompt: |
  You are Kay, Oscar's task management assistant.
  Help him organize tasks, schedule events, and stay on top of deadlines.
  Be concise and action-oriented.
temperature: 0.7
```

**Use for:**
- Daily task reviews
- Scheduling meetings
- Creating tasks from ideas
- Checking deadlines

---

**2. Research Assistant**
```yaml
name: Research Assistant
model: Claude Sonnet 4
tools:
  - search_files
  - search_emails
  - get_file_content
  - web_search
  - web_fetch
  - get_project_context
system_prompt: |
  You are Kay, Oscar's research assistant.
  Help him find information across files, emails, and the web.
  Cite sources and provide comprehensive answers.
temperature: 0.8
```

**Use for:**
- Finding documents
- Researching topics
- Email archaeology
- Literature reviews

---

**3. Document Writer**
```yaml
name: Document Writer
model: Claude Opus 4.5
tools:
  - create_document
  - search_files
  - get_project_context
  - get_file_content
system_prompt: |
  You are Kay, Oscar's document writing assistant.
  Create professional, well-structured documents.
  Use project context and existing materials to inform writing.
temperature: 0.9
```

**Use for:**
- Project reports
- Client presentations
- Proposals
- Status updates

---

**4. Data Analyst**
```yaml
name: Data Analyst
model: Claude Opus 4.5
tools:
  - search_files
  - get_file_content
  - create_document
system_prompt: |
  You are Kay, Oscar's data analyst.
  Analyze data, create visualizations, interpret results.
  Explain technical concepts clearly.
temperature: 0.7
```

**Use for:**
- Analyzing spreadsheets
- Interpreting results
- Creating charts
- Statistical analysis

---

### Creating Custom Presets

**Via UI:**

1. Click "Presets" in sidebar
2. Click "New Preset"
3. Configure:
   - Name and description
   - Model selection
   - Tools to enable
   - System prompt
   - Temperature (0-2)
4. Save

**Preset saves to your account** - available across devices

---

## MCP Server

The PAI MCP server runs on Railway and exposes tools via **MCP (Model Context Protocol)**.

### Server Details

**Endpoint:** `https://pai-api-production.up.railway.app/mcp`
**Transport:** `streamable-http` (WebStandardStreamableHTTPServerTransport)
**Protocol:** MCP 1.0
**Status:** Production

### Server Code

Location: `~/.claude/tools/api/mcp-server.ts`

**Key Components:**

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamable-http.js';

// Create MCP server
const server = new Server(
  {
    name: 'pai-api-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_tasks',
        description: 'Query tasks with filters (due date, status, priority, project)',
        inputSchema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            due_date: { type: 'string' },
            project_id: { type: 'string' },
          },
        },
      },
      // ... 42 more tools
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_tasks':
      return await handleGetTasks(args);
    case 'create_task':
      return await handleCreateTask(args);
    // ... handle all tools
  }
});

// HTTP transport for LibreChat
app.post('/mcp', async (req, res) => {
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionId: req.body.sessionId || `session-${Date.now()}`,
  });

  await server.connect(transport);
  // Handle MCP protocol messages
});
```

### Context Mirror

The MCP server has access to a **context mirror** - a copy of key context files synced from `~/.claude/`:

```
tools/context-mirror/
├── context/
│   ├── pai/CLAUDE.md
│   ├── tools/CLAUDE.md
│   ├── projects/CTS010 denovoSkin.md
│   └── areas/Health.md
├── skills/
│   └── CORE/
│       ├── SYSTEM/PAISYSTEMARCHITECTURE.md
│       └── WORKFLOWS/TASKFLOW.md
└── MEMORY/
    └── learnings/
        ├── TypeScript/
        └── Infrastructure/
```

**Sync Process:**

1. SessionCloser hook runs on Claude Code session stop
2. `context-sync-hook.ts` copies updated files to `tools/context-mirror/`
3. Git commits and pushes to GitHub
4. Railway auto-deploys with updated context
5. LibreChat has access to latest context within ~2 minutes

**Why Mirror?**

- LibreChat runs on Railway (no VPS access)
- Context files live on VPS
- Mirror enables same context in both environments
- Git provides version control and sync mechanism

---

## Context System

LibreChat uses the same **UFC (Universal File-based Context)** system as Claude Code.

### How Context Works

**1. Context Tools Load Files:**

```
User: Show me CTS010 project context

Kay: [Calls get_project_context with project="CTS010"]
     → Reads tools/context-mirror/context/projects/CTS010 denovoSkin.md
     → Returns file content

[Displays context file in conversation]
```

**2. Context Informs Responses:**

```
User: What's the status of my denovoSkin deliverable?

Kay: [Calls get_project_context silently]
     [Reads: Recent Activity section shows "Due Friday, in review phase"]
     [Calls get_tasks to confirm current tasks]

Based on your project context, the denovoSkin deliverable is:
- Status: In review phase
- Due: Friday, Feb 7
- Current task: "Review deliverable draft" (assigned to you)
- Last activity: Team meeting on Feb 4 confirmed timeline

Would you like me to show you the latest version or check if there are any blockers?
```

**3. Learnings Inform Answers:**

```
User: How do I fix the database connection error?

Kay: [Calls search_learnings with query="database connection error"]
     → Finds: MEMORY/learnings/Infrastructure/2026-01-30-postgres-connection-fix.md

Based on previous learnings, this is likely the connection pool exhaustion issue.

The fix:
1. Increase max connections in lib/db.ts from 10 to 20
2. Add retry logic with exponential backoff
3. Close unused connections

This was solved on Jan 30 and documented in the learnings.
```

### Context Files Available

**System:**
- PAI architecture overview
- Tool documentation
- Skill definitions

**Projects:**
- Active work projects (CTS010, SOBI036, etc.)
- Personal projects

**Areas:**
- Work, Health, Finance, Family, etc.

**Learnings:**
- Infrastructure lessons
- TypeScript patterns
- Security practices
- PAI improvements

**Skills:**
- CORE system skills
- Workflow templates
- Memory system docs

---

## Authentication

LibreChat uses **email/password authentication** with optional OAuth.

### User Accounts

**Admin Account:**
- Email: oscar.wright@example.com
- Access: Full admin privileges
- Can: Manage users, view logs, configure system

**Additional Users:**
- Create via invite links
- Limited to PAI data scope (can't see Oscar's private tasks)
- Useful for: Oscar's family members, AI assistant testing

### OAuth Integration (Optional)

LibreChat supports:
- Google OAuth
- GitHub OAuth
- Microsoft OAuth

Currently **not enabled** (email/password only).

---

## Deployment

### Railway Configuration

**Service:** pai-api
**Region:** us-west1
**Build:** Docker (Dockerfile.api)
**Auto-Deploy:** Yes (on GitHub push to main)

**Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://...

# OpenRouter
OPENROUTER_API_KEY=sk-or-xxxxx

# OpenAI (for embeddings)
OPENAI_API_KEY=sk-xxxxx

# Telegram (for notifications)
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# LibreChat
DOMAIN_SERVER=https://pai-api-production.up.railway.app
MONGO_URI=mongodb://...
JWT_SECRET=xxxxx
CREDS_KEY=xxxxx
CREDS_IV=xxxxx

# MCP
MCP_CONTEXT_MIRROR_PATH=/app/tools/context-mirror
```

**Dockerfile:**

```dockerfile
# Dockerfile.api
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./
COPY tools/ ./tools/

# Install dependencies
RUN npm install -g bun
RUN bun install

# Copy LibreChat
COPY librechat/ ./librechat/
RUN cd librechat && npm install && npm run build

# Copy context mirror (synced from VPS)
COPY tools/context-mirror ./tools/context-mirror

EXPOSE 3080

# Start LibreChat + MCP server
CMD ["bun", "run", "tools/api/start.ts"]
```

**Start Script:**

```typescript
// tools/api/start.ts
import { spawn } from 'child_process';

// Start LibreChat backend
const librechat = spawn('npm', ['run', 'start'], {
  cwd: './librechat',
  env: { ...process.env, PORT: '3080' },
});

// Start MCP server (embedded in LibreChat)
// MCP endpoint available at /mcp

librechat.stdout.on('data', (data) => console.log(data.toString()));
librechat.stderr.on('data', (data) => console.error(data.toString()));
```

### Deployment Process

**1. Code Changes:**
```bash
# On VPS
cd ~/.claude/tools
git add -A
git commit -m "Add new MCP tool"
git push origin main
```

**2. Railway Auto-Deploy:**
- Detects GitHub push
- Builds Docker image
- Runs tests
- Deploys to production
- ~3-5 minutes total

**3. Context Sync (if needed):**
```bash
# On VPS (via SessionCloser hook)
cd ~/.claude
./hooks/context-sync-hook.ts
# Copies context-mirror to tools/
# Commits and pushes to GitHub
# Railway auto-deploys with updated context
```

### Manual Deployment

```bash
# Using Railway CLI
npx @railway/cli up
```

### Health Check

```bash
# Check service status
curl https://pai-api-production.up.railway.app/health

# Response:
# {
#   "status": "ok",
#   "database": "connected",
#   "mcp_server": "running",
#   "tools_available": 43
# }
```

---

## Troubleshooting

### Cannot Connect to LibreChat

**Symptoms:**
- URL doesn't load
- "Service unavailable" error

**Diagnosis:**

1. **Check Railway status:**
   ```bash
   npx @railway/cli status pai-api
   ```

2. **Check logs:**
   ```bash
   npx @railway/cli logs pai-api --tail 100
   ```

3. **Test endpoint:**
   ```bash
   curl https://pai-api-production.up.railway.app/health
   ```

**Common Causes:**

1. **Railway service crashed:** Out of memory or startup error
   - **Fix:** Check logs, redeploy: `npx @railway/cli up`

2. **Database connection failed:** DATABASE_URL incorrect
   - **Fix:** Verify environment variable in Railway dashboard

3. **Deployment in progress:** Auto-deploy after GitHub push
   - **Wait:** Usually completes in 3-5 minutes

---

### Tool Call Failed

**Symptoms:**
- Kay says "Tool call failed" or "Error executing tool"
- No results returned from search/query

**Diagnosis:**

1. **Check tool name:**
   - Verify tool exists: look at available tools list
   - Common typo: `get_task` vs `get_tasks`

2. **Check parameters:**
   - Review tool schema in MCP server code
   - Verify required parameters provided

3. **Check database:**
   ```bash
   # Test query manually
   psql "$DATABASE_URL" -c "SELECT * FROM tasks LIMIT 5"
   ```

4. **Check MCP logs:**
   ```bash
   npx @railway/cli logs pai-api --tail 100 | grep "MCP"
   ```

**Common Causes:**

1. **Database connection lost:** Network blip or connection pool exhausted
   - **Fix:** Automatic retry (connection pool has retry logic)

2. **Invalid parameters:** Tool called with wrong argument types
   - **Fix:** Model hallucinated parameters, try rephrasing query

3. **Rate limit:** Too many API calls in short time
   - **Fix:** Wait 1 minute, try again

---

### Search Returns No Results

**Symptoms:**
- `search_files` or `search_emails` returns empty
- Files/emails exist but not found

**Diagnosis:**

1. **Check embeddings:**
   ```sql
   SELECT
     COUNT(*) as total,
     COUNT(*) FILTER (WHERE embedding IS NOT NULL) as embedded
   FROM files;
   ```

2. **Check query:**
   - Try broader search terms
   - Check spelling

3. **Check filters:**
   - Remove folder/type filters
   - Increase `minSimilarity` threshold

4. **Test similarity:**
   ```sql
   SELECT
     filename,
     1 - (embedding <=> '[query-embedding]'::vector) as similarity
   FROM files
   ORDER BY similarity DESC
   LIMIT 10;
   ```

**Common Causes:**

1. **Embeddings not generated:** File processed but not embedded
   - **Fix:** Run `bun run scripts/generate-embeddings.ts`

2. **Query too specific:** No semantic match found
   - **Fix:** Use broader terms ("budget" instead of "FY26 Q4 budget allocation")

3. **Similarity threshold too high:** Default 0.7 may be strict
   - **Fix:** Lower to 0.5: `search_files("query", minSimilarity=0.5)`

---

### Document Generation Failed

**Symptoms:**
- `create_document` returns error
- Document created but corrupted

**Diagnosis:**

1. **Check temp directory:**
   ```bash
   ls -la /tmp/pai-documents/
   ```

2. **Check document server logs:**
   ```bash
   cd ~/.claude/tools
   bun run mcp/document-server.ts test
   ```

3. **Test manual creation:**
   ```bash
   bun run mcp/document-server.ts create \
     --type docx \
     --title "Test" \
     --content "Test content"
   ```

**Common Causes:**

1. **Invalid content format:** Markdown not parsable
   - **Fix:** Simplify content, remove special characters

2. **File permissions:** Can't write to temp directory
   - **Fix:** `chmod 777 /tmp/pai-documents`

3. **Library error:** docx/pptxgen library issue
   - **Fix:** Check logs for stack trace, may need library update

---

### Context Not Loading

**Symptoms:**
- `get_project_context` returns empty or outdated
- LibreChat doesn't have latest context files

**Diagnosis:**

1. **Check context mirror:**
   ```bash
   # On Railway (via logs)
   npx @railway/cli run "ls -la tools/context-mirror/context/projects"
   ```

2. **Check last sync:**
   ```bash
   # On VPS
   cd ~/.claude
   git log tools/context-mirror/ --oneline -n 5
   ```

3. **Check Railway deployment:**
   ```bash
   npx @railway/cli status pai-api
   # Look for last deployment time
   ```

**Common Causes:**

1. **Context not synced:** SessionCloser hook didn't run
   - **Fix:** Manually run: `cd ~/.claude && ./hooks/context-sync-hook.ts`

2. **Railway not deployed:** Context synced but deployment not triggered
   - **Fix:** Manual deploy: `npx @railway/cli up`

3. **File path wrong:** Context file moved or renamed
   - **Fix:** Verify paths in context-mirror match actual files

---

## Best Practices

### When to Use LibreChat

**Good for:**
- ✅ Complex questions requiring multiple tool calls
- ✅ Document writing (proposals, reports)
- ✅ Research (searching files, emails, web)
- ✅ Task planning (reviewing tasks, scheduling)
- ✅ Desktop work (larger screen, better UI)

**Not ideal for:**
- ❌ Quick task creation (use Telegram instead)
- ❌ Mobile usage (not optimized)
- ❌ Proactive notifications (can't push to you)
- ❌ Voice input (Telegram better)

### Model Selection Strategy

**Start with Sonnet 4** (default):
- Fast enough for interactive chat
- High quality responses
- Good tool calling accuracy
- Reasonable cost

**Upgrade to Opus 4.5 when:**
- Writing important documents
- Complex analysis required
- Sonnet struggles with nuance

**Downgrade to Haiku when:**
- Very simple queries
- High-frequency usage
- Cost is primary concern

### Tool Usage Tips

**Be specific with filters:**
```
❌ "Show my tasks"
✅ "Show high-priority work tasks due this week"
```

**Chain tool calls:**
```
✅ "Find cost-effectiveness documents in CTS010, then summarize the key findings"
(Kay will: 1. search_files, 2. get_file_content, 3. summarize)
```

**Use context for better answers:**
```
✅ "Load CTS010 context, then tell me what's blocking the deliverable"
(Kay will: 1. get_project_context, 2. analyze recent activity, 3. get_tasks)
```

---

## Related Documentation

- [Telegram Bot](./telegram-bot.md) - Mobile interface alternative
- [MCP Tools Reference](../06-reference/mcp-tools.md) - Complete tool list
- [RAG Search](./rag-search.md) - How semantic search works
- [Database Schema](../04-development/database-schema.md) - Data structure
- [Daily Workflow](../03-usage/daily-workflow.md) - When to use LibreChat vs Telegram
