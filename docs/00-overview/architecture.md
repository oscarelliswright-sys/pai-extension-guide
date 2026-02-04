# PAI Architecture Deep Dive

**Purpose:** Detailed technical architecture documentation
**Audience:** Developers, system architects, advanced users
**Last Updated:** February 4, 2026

---

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [Data Flow Patterns](#data-flow-patterns)
3. [Integration Architecture](#integration-architecture)
4. [Storage Architecture](#storage-architecture)
5. [Network Architecture](#network-architecture)
6. [Security Architecture](#security-architecture)

---

## Component Architecture

### Layer 1: Data Storage Layer

#### PostgreSQL Database (Neon)
**Role:** Central data store
**Technology:** PostgreSQL 15+ with pgvector extension
**Hosting:** Neon serverless PostgreSQL (eu-west-2)

**Schema Overview:**
- **47 tables** organized into functional groups
- **3 main patterns:** Entity tables, sync tables, metadata tables

**Table Groups:**

**Core Entities (12 tables):**
```
tasks                 - Synced with Notion Tasks DB
projects              - Synced with Notion Projects DB
notes                 - Synced with Notion Notes DB
goals                 - Synced with Notion Goals DB
people                - Synced with Notion People DB
tags                  - Synced with Notion Tags DB
calendar_events       - Synced with Google Calendar
media                 - Movies/TV watchlist (TMDB)
games                 - Games backlog (RAWG)
system_upgrades       - Feature tracking (Notion)
system_fixes          - Bug tracking (Notion)
work_projects         - Work project metadata
```

**File System (5 tables):**
```
files                 - File metadata, classification
file_chunks           - Hierarchical chunks for RAG
file_hints            - User hints for classification
file_queue            - Inbox processing queue
pending_files         - Telegram file confirmations
```

**Email System (4 tables):**
```
emails                - Email metadata
email_embeddings      - Vector embeddings for search
email_senders         - Sender tracking/classification
email_classification_rules - ML model rules
```

**Sync Infrastructure (6 tables):**
```
sync_run_history      - Sync execution logs
notion_sync_state     - Last sync timestamps
oauth_tokens          - OAuth credentials
llm_models            - Model database (59 models)
llm_tier1_providers   - Provider rankings
ai_spend_log          - Cost tracking
```

**Telegram Bot (3 tables):**
```
bot_logs              - Conversation history
pending_notes         - Note creation queue
scheduled_notifications - Notification scheduler
```

**Key Design Patterns:**

**1. Bidirectional Sync Pattern:**
```sql
-- All synced entities have these fields:
notion_page_id         TEXT    -- Notion page identifier
sql_local_last_edited_at TIMESTAMP -- PostgreSQL edit time
notion_last_edited_time TIMESTAMP -- Notion edit time
```

**Conflict Resolution:** Last-write-wins based on timestamps

**2. Soft Delete Pattern:**
```sql
-- Entities use soft delete for sync safety:
deleted_at            TIMESTAMP -- NULL = active
is_active             BOOLEAN   -- TRUE = active
```

**3. Vector Search Pattern:**
```sql
-- pgvector embeddings for semantic search:
embedding             vector(1536) -- OpenAI text-embedding-3-small
```

#### Nextcloud File Storage
**Role:** File hosting with desktop/mobile sync
**Technology:** Nextcloud 27+ Docker deployment
**Location:** `/opt/nextcloud/files/oscar/files/`

**PARA Structure:**
```
Nextcloud Root/
├── Inbox/              # Unprocessed files (watched by automation)
├── Projects/           # Active project files
│   ├── Revenue Growth/
│   ├── denovoSkin BIM/
│   └── [ProjectName]/
├── Areas/              # Life areas (ongoing responsibilities)
│   ├── Work/
│   ├── Family/
│   ├── Health/
│   └── [AreaName]/
├── Resources/          # Reference materials
│   ├── Templates/
│   ├── Documentation/
│   └── [TopicName]/
├── Archive/            # Completed items
└── Recordings/         # Meeting recordings
    └── Meetings/
```

**File Processing States:**
```
1. UNPROCESSED - In Inbox, detected by watcher
2. HINT_REQUESTED - Telegram asks user for classification hint
3. PROCESSING - Text extraction, classification running
4. CLASSIFIED - Moved to target folder, chunks created
5. INDEXED - Embeddings generated, searchable via RAG
```

---

### Layer 2: External Integration Layer

#### Notion Integration
**Connection:** REST API with integration token
**Sync Pattern:** Bidirectional pull/push every 10 minutes
**Databases:** 11 Notion databases mapped to PostgreSQL tables

**Database Mappings:**

| Notion Database | PostgreSQL Table | Sync Direction |
|-----------------|------------------|----------------|
| Tasks DB | `tasks` | Bidirectional |
| Projects DB | `projects` | Bidirectional |
| Goals DB | `goals` | Bidirectional |
| Notes DB | `notes` | Bidirectional |
| People DB | `people` | Bidirectional |
| Tags DB | `tags` | Bidirectional |
| Media Watchlist | `media` | Bidirectional |
| Games Backlog | `games` | Bidirectional |
| System Upgrades | `system_upgrades` | Bidirectional |
| System Fixes | `system_fixes` | Bidirectional |
| Work Projects | `work_projects` | Read-only |

**Sync Flow:**
```typescript
// Inbound: Notion → PostgreSQL
async function notionToSQL(entity: string) {
  const lastSync = await getLastSyncTime(entity);
  const pages = await notion.databases.query({
    database_id: DB_IDS[entity],
    filter: { last_edited_time: { after: lastSync } }
  });

  for (const page of pages) {
    await upsertToPostgres(entity, transformNotionPage(page));
  }
}

// Outbound: PostgreSQL → Notion
async function sqlToNotion(entity: string) {
  const records = await postgres.query(`
    SELECT * FROM ${entity}
    WHERE sql_local_last_edited_at > notion_last_edited_time
       OR notion_page_id LIKE 'sql:%'  -- New records
  `);

  for (const record of records) {
    if (record.notion_page_id.startsWith('sql:')) {
      // Create new Notion page
      const page = await notion.pages.create({
        parent: { database_id: DB_IDS[entity] },
        properties: transformToNotionProperties(record)
      });
      await updateNotionPageId(record.id, page.id);
    } else {
      // Update existing page
      await notion.pages.update({
        page_id: record.notion_page_id,
        properties: transformToNotionProperties(record)
      });
    }
  }
}
```

#### Google Calendar Integration
**Connection:** OAuth 2.0 with Calendar API v3
**Sync Pattern:** Bidirectional (personal), read-only (work)
**Events:** 307 events in database (as of Feb 2026)

**Calendar Mappings:**
- `primary` - Personal calendar (read/write)
- Work calendar IDs - Read-only (detect conflicts, include in morning roundup)

**Event Sync:**
```typescript
// Fetch events from Google → PostgreSQL
async function syncGoogleCalendar() {
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime',
  });

  for (const event of events.items) {
    await upsertCalendarEvent({
      google_event_id: event.id,
      summary: event.summary,
      start_time: event.start.dateTime || event.start.date,
      end_time: event.end.dateTime || event.end.date,
      location: event.location,
      attendees: event.attendees?.map(a => a.email),
      source: 'google',
    });
  }
}

// Push events from PostgreSQL → Google
async function pushToGoogleCalendar() {
  const events = await postgres.query(`
    SELECT * FROM calendar_events
    WHERE source = 'pai'
      AND (google_event_id IS NULL OR updated_at > synced_at)
  `);

  for (const event of events) {
    if (!event.google_event_id) {
      // Create new event
      const gcalEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.summary,
          start: { dateTime: event.start_time },
          end: { dateTime: event.end_time },
          location: event.location,
        }
      });
      await updateGoogleEventId(event.id, gcalEvent.data.id);
    } else {
      // Update existing event
      await calendar.events.update({
        calendarId: 'primary',
        eventId: event.google_event_id,
        requestBody: { /* ... */ }
      });
    }
  }
}
```

#### OpenRouter Integration
**Connection:** REST API with API key
**Purpose:** LLM routing for all AI operations
**Models Used:** Primarily Claude Sonnet 4.5

**Usage Patterns:**
```typescript
// Telegram bot conversations
const response = await openrouter.chat({
  model: 'anthropic/claude-sonnet-4.5',
  messages: conversationHistory,
  tools: telegramTools,
});

// File classification
const classification = await openrouter.chat({
  model: 'anthropic/claude-haiku-4',
  messages: [{
    role: 'user',
    content: `Classify this file:\n${fileContext}`
  }],
});

// Email classification
const emailClass = await openrouter.chat({
  model: 'anthropic/claude-haiku-4',
  messages: [{
    role: 'user',
    content: `Classify email: ${emailContent}`
  }],
});
```

**Cost Tracking:**
```sql
-- All OpenRouter calls logged to ai_spend_log
INSERT INTO ai_spend_log (
  model_used,
  tokens_input,
  tokens_output,
  cost_usd,
  operation_type,
  metadata
) VALUES (
  'anthropic/claude-sonnet-4.5',
  1250,
  450,
  0.0042,
  'telegram_message',
  '{"user_id": "oscar", "message_type": "text"}'
);
```

#### Modal (Dockling) Integration
**Connection:** Modal serverless functions
**Purpose:** Document parsing (PDF, DOCX, PPTX, XLSX)
**Technology:** Dockling library for text extraction

**Parsing Pipeline:**
```python
# Modal function (deployed serverless)
@stub.function(image=image, timeout=300)
def parse_document(file_path: str) -> dict:
    result = parse_file(file_path)
    return {
        "text": result.text,
        "metadata": result.metadata,
        "structure": result.structure  # Headings, sections
    }
```

**Invocation:**
```typescript
// From file processing pipeline
const parsed = await modal.functions.call({
  function: 'parse_document',
  args: { file_path: localFilePath }
});

const extractedText = parsed.text;
const structure = parsed.structure; // For hierarchical chunking
```

---

### Layer 3: Processing & Sync Layer

#### Railway Sync Service
**Hosting:** Railway cloud platform
**Schedule:** Every 10 minutes via cron
**Script:** `scripts/startup.ts` → `sync/cron-sync.ts`

**Sync Orchestration:**
```typescript
// Main sync orchestrator
export async function runFullSync() {
  const startTime = Date.now();
  const results = {
    inbound: {},
    outbound: {},
    taskTrigger: null,
  };

  try {
    // Phase 1: Inbound (External → PostgreSQL)
    results.inbound.tags = await syncTagsFromNotion();
    results.inbound.tasks = await syncTasksFromNotion();
    results.inbound.projects = await syncProjectsFromNotion();
    results.inbound.goals = await syncGoalsFromNotion();
    results.inbound.notes = await syncNotesFromNotion();
    results.inbound.people = await syncPeopleFromNotion();
    results.inbound.calendar = await syncCalendarFromGoogle();
    results.inbound.media = await syncMediaFromNotion();
    results.inbound.games = await syncGamesFromNotion();
    results.inbound.systemUpgrades = await syncSystemUpgradesFromNotion();
    results.inbound.systemFixes = await syncSystemFixesFromNotion();

    // Phase 2: Outbound (PostgreSQL → External)
    results.outbound.tags = await syncTagsToNotion();
    results.outbound.tasks = await syncTasksToNotion();
    results.outbound.projects = await syncProjectsToNotion();
    // ... all entities

    // Phase 3: Task Trigger (Tasks with due dates → Calendar)
    results.taskTrigger = await createCalendarEventsFromTasks();

    // Phase 4: Email Fetch & Classification
    results.emailFetch = await fetchAndClassifyEmails();

    // Phase 5: File Processing
    results.fileProcessing = await processInboxFiles();

    // Log sync run
    await logSyncRun({
      duration_ms: Date.now() - startTime,
      results,
      status: 'completed'
    });

  } catch (error) {
    await logSyncRun({
      duration_ms: Date.now() - startTime,
      results,
      status: 'failed',
      error: error.message
    });
  }
}
```

**Sync History Tracking:**
```sql
CREATE TABLE sync_run_history (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  status TEXT, -- 'running', 'completed', 'failed'
  entity TEXT, -- 'tasks', 'projects', etc.
  direction TEXT, -- 'inbound', 'outbound', 'task-trigger'
  records_processed INTEGER,
  errors TEXT,
  duration_ms INTEGER
);
```

#### VPS Cron Automations
**Schedule:** 6 cron jobs on VPS
**Execution:** Ubuntu user crontab
**Location:** `/home/ubuntu/automations/`

**Cron Schedule:**
```cron
# Git auto-sync (every 15 minutes)
*/15 * * * * /home/ubuntu/.claude/sync-to-github.sh

# Health check (daily at 2 AM, Mon-Sat)
0 2 * * 1-6 /home/ubuntu/automations/health-check.sh

# Security audit (weekly, Sunday 2 AM)
0 2 * * 0 /home/ubuntu/automations/security-audit.sh

# RAG reindex (daily at 3 AM)
0 3 * * * /home/ubuntu/automations/rag-reindex.sh

# Extract learnings (daily at 4 AM)
0 4 * * * /home/ubuntu/automations/extract-missed-learnings.sh

# Memory maintenance (weekly, Sunday 5 AM)
0 5 * * 0 /home/ubuntu/automations/memory-maintenance.sh

# Meeting processing (every 15 min, business hours)
*/15 8-19 * * 1-5 /home/ubuntu/automations/meeting-check.sh
```

**Automation Details:**

**1. Git Auto-Sync:**
```bash
#!/bin/bash
# Sync ~/.claude/ to GitHub every 15 minutes
cd "$HOME/.claude"
git add -A
git diff --cached --quiet || git commit -m "Auto-sync"
git push origin main 2>/dev/null
```

**2. Health Check:**
```bash
#!/bin/bash
# Check system health, send Telegram alert if issues
/home/ubuntu/.bun/bin/bun run ~/.claude/tools/health-check.ts
```

**3. RAG Reindex:**
```bash
#!/bin/bash
# Check for missing embeddings, regenerate if needed
/home/ubuntu/.bun/bin/bun run ~/.claude/tools/scripts/generate-embeddings.ts --check
```

**4. Extract Learnings:**
```bash
#!/bin/bash
# Extract learnings from recent sessions
/home/ubuntu/.bun/bin/bun run ~/.claude/hooks/extract-learnings-hook.ts --batch
```

**5. Meeting Processing:**
```bash
#!/bin/bash
# Check for new meeting recordings
/home/ubuntu/.bun/bin/bun run ~/.claude/tools/meetings/process-recording.ts --check
```

---

### Layer 4: Interface Layer

#### Telegram Bot
**Technology:** Node.js with Telegraf library
**Model:** Claude Sonnet 4.5 via OpenRouter
**Deployment:** Direct process on VPS (PID 116532)
**Management:** Manual start/stop (systemd user service unavailable)

**Architecture:**
```
telegram/
├── index.ts           # Bot entry point, message router
├── agent.ts           # AI conversation agent
├── scheduler.ts       # Scheduled notifications
├── inbox-watcher.ts   # Real-time file monitoring
├── tools/             # Tool implementations
│   ├── tasks.ts
│   ├── calendar.ts
│   ├── files.ts
│   ├── notes.ts
│   └── media.ts
└── lib/               # Utilities
    ├── system-changes.ts
    └── database.ts
```

**Message Flow:**
```typescript
// Main message handler
bot.on('message', async (ctx) => {
  const userId = ctx.from.id;
  const messageText = ctx.message.text;

  // Log conversation
  await logBotMessage({
    user_id: userId,
    message: messageText,
    timestamp: new Date(),
  });

  // Check for commands
  if (messageText.startsWith('/')) {
    return handleCommand(ctx, messageText);
  }

  // Load conversation history
  const history = await getConversationHistory(userId, limit: 20);

  // Call LLM agent
  const response = await agent.process({
    message: messageText,
    history,
    tools: availableTools,
    context: await getUserContext(userId),
  });

  // Send response
  await ctx.reply(response.text);

  // Execute tool calls if any
  if (response.toolCalls) {
    await executeTools(response.toolCalls, ctx);
  }
});
```

**Scheduled Notifications:**
```typescript
// Morning roundup (7 AM daily)
cron.schedule('0 7 * * *', async () => {
  const tasks = await getTasksDueToday();
  const events = await getCalendarEventsToday();
  const overdue = await getOverdueTasks();

  const message = formatMorningRoundup({
    tasks,
    events,
    overdue,
  });

  await bot.telegram.sendMessage(OSCAR_TELEGRAM_ID, message);
});

// Overdue alerts (9 AM daily)
cron.schedule('0 9 * * *', async () => {
  const overdue = await getOverdueTasks();
  if (overdue.length > 0) {
    await bot.telegram.sendMessage(
      OSCAR_TELEGRAM_ID,
      `⚠️ You have ${overdue.length} overdue tasks`
    );
  }
});
```

**File Inbox Watcher:**
```typescript
// Real-time file monitoring with chokidar
const watcher = chokidar.watch('/opt/nextcloud/files/oscar/files/Inbox', {
  persistent: true,
  ignoreInitial: true,
});

watcher.on('add', async (filePath) => {
  const filename = path.basename(filePath);

  // Ask user for classification hint
  await bot.telegram.sendMessage(
    OSCAR_TELEGRAM_ID,
    `📄 New file detected: ${filename}\n\nWhich project or folder?`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Work', callback_data: `hint:work:${filePath}` }],
          [{ text: 'Personal', callback_data: `hint:personal:${filePath}` }],
          [{ text: 'Auto-classify', callback_data: `hint:auto:${filePath}` }],
        ]
      }
    }
  );

  // Queue for processing
  await queueFile(filePath);
});
```

#### LibreChat Web UI
**Technology:** LibreChat + PAI API MCP Server
**Deployment:** Railway (Docker)
**URL:** https://pai-api-production.up.railway.app
**Tools:** 43 MCP tools

**MCP Server Architecture:**
```typescript
// MCP server exposes tools via streamable-http transport
const server = new Server({
  name: 'pai-api',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  }
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // Data tools
    { name: 'get_tasks', description: '...' },
    { name: 'get_calendar', description: '...' },
    { name: 'search_files', description: '...' },
    // Action tools
    { name: 'create_task', description: '...' },
    { name: 'update_task', description: '...' },
    // Document tools
    { name: 'create_document', description: '...' },
    // ... 43 tools total
  ]
}));

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_tasks':
      return await getTasks(args);
    case 'create_task':
      return await createTask(args);
    // ... handle all tools
  }
});
```

**Context Mirror:**
LibreChat receives the same context as Claude Code via `tools/context-mirror/` on Railway, auto-synced by `context-sync-hook.ts` on session stop.

#### Claude Code Integration
**Technology:** Native Claude Code installation
**Location:** `~/.local/bin/claude`
**MCP Servers:** 3 local servers

**Startup Architecture:**
```bash
# SSH login → ~/.bashrc → Startup Menu
# Option 1: Claude Code (no tmux)
claude --dangerously-skip-permissions

# Option 2: New tmux session
tmux new-session -s pai ~/.claude/scripts/claude-persistent.sh

# Option 3: Resume tmux session
tmux attach-session -t pai
```

**MCP Servers (Local):**

**1. pai-rag-search:**
```json
{
  "command": "/home/ubuntu/.bun/bin/bun",
  "args": ["run", "/home/ubuntu/.claude/tools/mcp/rag-server.ts"],
  "tools": ["search_files", "search_emails", "get_file_content"]
}
```

**2. pai-doc-gen:**
```json
{
  "command": "/home/ubuntu/.bun/bin/bun",
  "args": ["run", "/home/ubuntu/.claude/tools/mcp/document-server.ts"],
  "tools": ["create_document", "finalize_document"]
}
```

**3. pai-llm-advisor:**
```json
{
  "command": "/home/ubuntu/.bun/bin/bun",
  "args": ["run", "/home/ubuntu/.claude/tools/mcp/llm-advisor-server.ts"],
  "tools": ["recommend_models", "list_models"]
}
```

---

## Data Flow Patterns

### Pattern 1: Bidirectional Sync (Notion ↔ PostgreSQL)

**Inbound Flow (Notion → PostgreSQL):**
```
1. Railway cron triggers (every 10 min)
   ↓
2. Query Notion API for changes since last sync
   GET /databases/{db_id}/query
   filter: { last_edited_time: { after: lastSyncTime } }
   ↓
3. Transform Notion properties → PostgreSQL columns
   - Notion multi-select → PostgreSQL array
   - Notion relation → foreign key
   - Notion date → PostgreSQL timestamp
   ↓
4. Upsert into PostgreSQL
   ON CONFLICT (notion_page_id) DO UPDATE
   SET ... WHERE notion_last_edited_time > EXCLUDED.notion_last_edited_time
   ↓
5. Update last sync timestamp
```

**Outbound Flow (PostgreSQL → Notion):**
```
1. Railway cron triggers (every 10 min)
   ↓
2. Query PostgreSQL for changes
   SELECT * FROM tasks
   WHERE sql_local_last_edited_at > notion_last_edited_time
      OR notion_page_id LIKE 'sql:%'  -- New records
   ↓
3. For each record:
   IF notion_page_id starts with 'sql:':
     - POST /pages (create new Notion page)
     - Update PostgreSQL with real notion_page_id
   ELSE:
     - PATCH /pages/{page_id} (update existing page)
   ↓
4. Update PostgreSQL timestamps:
   notion_last_edited_time = NOW()
```

**Conflict Resolution:**
- **Last-write-wins** based on timestamps
- **No conflicts expected** in single-user system
- **Manual override:** Edit in Notion or PostgreSQL, next sync propagates

### Pattern 2: File Processing Pipeline

**Stage 1: Detection (Real-time)**
```
Nextcloud Inbox change
   ↓
Chokidar file watcher detects
   ↓
INSERT INTO file_queue (file_path, status='pending')
   ↓
Telegram notification sent
```

**Stage 2: Hint Collection (Async)**
```
User provides hint via Telegram
   ↓
UPDATE file_queue SET hint='project:BIM', status='ready'
   ↓
Trigger processing
```

**Stage 3: Text Extraction**
```
File detected
   ↓
Determine file type (PDF, DOCX, TXT, etc.)
   ↓
IF PDF or DOCX:
  Call Modal Dockling parser
ELSE IF TXT or MD:
  Read directly
ELSE IF XLSX:
  Extract sheets as text
   ↓
Store in files.content_extracted
```

**Stage 4: Classification**
```
LLM classification with:
  - File content (first 2000 chars)
  - Filename
  - User hint (if provided)
  - Existing project/area names
   ↓
Returns:
  - category: 'work' | 'personal'
  - subcategory: specific project/area
  - confidence: 0-1
   ↓
IF confidence < 0.7:
  Queue for manual review
ELSE:
  Auto-classify
```

**Stage 5: Organization**
```
Move file to target folder
/opt/nextcloud/files/oscar/files/Projects/BIM/document.pdf
   ↓
Update files table:
  - folder = 'Projects/BIM'
  - classified_at = NOW()
  - classification_confidence = 0.85
   ↓
Run: occ files:scan --path=/oscar/files/Projects/BIM
(Makes Nextcloud aware of file move)
```

**Stage 6: Chunking**
```
Generate hierarchical chunks:
  - Level 1: Full document
  - Level 2: Sections (by heading)
  - Level 3: Paragraphs
   ↓
INSERT INTO file_chunks:
  - file_id
  - chunk_text
  - chunk_index
  - heading_path (e.g., "Methods > Cost Analysis")
  - token_count
```

**Stage 7: Embedding**
```
FOR EACH chunk:
  Generate embedding via OpenAI API
  model: text-embedding-3-small (1536 dimensions)
   ↓
  UPDATE file_chunks SET embedding = vector, embedded_at = NOW()
   ↓
File now searchable via RAG
```

### Pattern 3: Email Classification & Task Extraction

**Stage 1: Fetch (Railway Sync)**
```
Gmail API: messages.list
  - filter: is:unread OR newer_than:1d
  - maxResults: 50
   ↓
FOR EACH message:
  Fetch full content via messages.get
   ↓
  Skip if already in emails table
```

**Stage 2: Classification**
```
LLM classification with:
  - Subject
  - Sender
  - Body (first 1000 chars)
  - Previous emails from sender
   ↓
Returns:
  - classification: actionable/informational/promotional/junk
  - category: work/personal
  - subcategory: client/team/vendor/family/etc.
  - project: matched project name (if applicable)
  - sentiment: positive/neutral/negative
  - confidence: 0-1
```

**Stage 3: Labelling**
```
Apply Gmail labels via API:
  - Work/Clients
  - Personal/Family
  - Actionable
  - Informational
   ↓
Archive promotional/junk emails
```

**Stage 4: Task Extraction (if actionable)**
```
LLM extracts:
  - Task description
  - Due date (if mentioned)
  - Priority (inferred)
  - Related project
   ↓
Telegram confirmation:
  "Email from X about Y - create task:
   '[ extracted task description ]'
   Due: [ date if found ]

   Confirm? Yes/No"
   ↓
IF user confirms:
  INSERT INTO tasks (...) VALUES (...)
  (Next sync creates Notion page)
```

### Pattern 4: Meeting Recording Processing

**Stage 1: Detection (Cron)**
```
Every 15 minutes (business hours):
  Scan /opt/nextcloud/files/oscar/files/Recordings/Meetings/
   ↓
Find files modified in last 15 minutes
   ↓
Check if already processed (recordings table)
   ↓
Queue unprocessed recordings
```

**Stage 2: Audio Extraction**
```
ffmpeg -i recording.mp4 -vn -acodec pcm_s16le -ar 16000 audio.wav
(Extract audio track, 16kHz mono)
```

**Stage 3: Transcription**
```
Upload to Groq Whisper API
model: whisper-large-v3
   ↓
Returns: Raw transcript with timestamps
```

**Stage 4: Cleanup**
```
LLM cleanup:
  - Fix grammar/punctuation
  - Remove filler words (um, uh)
  - Preserve technical terms
   ↓
Returns: Cleaned transcript
```

**Stage 5: Speaker Detection**
```
IF Teams recording:
  Extract frames every 10 seconds
   ↓
  Vision model analyzes Teams UI
  (Identifies highlighted speaker name)
   ↓
  Map transcript segments to speakers
```

**Stage 6: Extraction**
```
LLM extraction with cleaned transcript:
  - Action items → tasks
  - Decisions made
  - Key topics discussed
  - Follow-up needed
   ↓
Returns: Structured data
```

**Stage 7: Telegram Notification**
```
Send summary to user:
  "Meeting processed: [Title]
   Duration: [X] minutes

   Action Items (3):
   1. [ task 1 ]
   2. [ task 2 ]
   3. [ task 3 ]

   Decisions (2):
   - [ decision 1 ]
   - [ decision 2 ]

   Confirm tasks? Yes/No"
```

**Stage 8: Indexing**
```
Chunk transcript (by topic/speaker turns)
   ↓
Generate embeddings
   ↓
Store in file_chunks
   ↓
Meeting searchable via RAG
```

---

## Integration Architecture

### Authentication Patterns

**OAuth 2.0 (Google Calendar, Gmail):**
```typescript
// Initial authentication
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Redirect user to consent screen
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.modify',
  ]
});

// Exchange code for tokens
const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);

// Store in database
await storeOAuthToken({
  service: 'google',
  access_token: tokens.access_token,
  refresh_token: tokens.refresh_token,
  expires_at: Date.now() + tokens.expires_in * 1000,
});

// Auto-refresh on expiry
oauth2Client.on('tokens', async (newTokens) => {
  await updateOAuthToken('google', newTokens);
});
```

**API Key (Notion, OpenRouter, RAWG, TMDB):**
```typescript
// Stored in .env file (not version controlled)
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const openrouter = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
});
```

**Bot Token (Telegram):**
```typescript
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
```

### Rate Limiting & Retry

**Notion API:**
```typescript
// Notion rate limit: 3 requests/second
const rateLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 350, // ~3 req/sec
});

const notionWithRetry = rateLimiter.wrap(async (method, params) => {
  return await retryWithBackoff(async () => {
    return await notion[method](params);
  }, {
    maxRetries: 3,
    initialDelay: 1000,
    factor: 2, // Exponential backoff
  });
});
```

**OpenRouter API:**
```typescript
// OpenRouter rate limits vary by model
// Retry on 429 (rate limit) or 5xx (server error)
async function callOpenRouter(params) {
  let retries = 0;
  while (retries < 5) {
    try {
      const response = await openrouter.post('/chat/completions', params);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limited
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        await sleep(delay);
        retries++;
      } else if (error.response?.status >= 500) {
        // Server error
        await sleep(5000);
        retries++;
      } else {
        throw error; // Other errors
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Webhook vs Polling

**Polling (Used by PAI):**
- Notion API: Every 10 minutes (no webhook support)
- Gmail API: Every 10 minutes (push notifications complex to set up)
- File system: Real-time via chokidar (inotify)

**Why Polling:**
- Simpler to implement and maintain
- No webhook endpoint setup/security needed
- Railway's cron schedule makes it reliable
- 10-minute latency acceptable for most operations

**Where Real-time Matters:**
- File inbox: Uses chokidar (inotify) for instant detection
- Telegram messages: Telegram's long-polling API (instant)

---

## Storage Architecture

### PostgreSQL Schema Design

**Indexing Strategy:**

**B-tree indexes (exact matches, sorting):**
```sql
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_calendar_events_start ON calendar_events(start_time);
CREATE INDEX idx_files_folder ON files(folder);
```

**GIN indexes (array/JSONB columns):**
```sql
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);
CREATE INDEX idx_files_tags ON files USING GIN(tags);
```

**Vector indexes (semantic search):**
```sql
CREATE INDEX idx_file_chunks_embedding ON file_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

**Composite indexes (multi-column queries):**
```sql
CREATE INDEX idx_tasks_status_due ON tasks(status, due_date);
CREATE INDEX idx_files_folder_classified ON files(folder, classified_at);
```

**Partitioning Strategy:**

**Time-based partitioning (bot_logs):**
```sql
CREATE TABLE bot_logs (
  id SERIAL,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id TEXT,
  message TEXT,
  ...
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE bot_logs_2026_01 PARTITION OF bot_logs
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE bot_logs_2026_02 PARTITION OF bot_logs
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

**Vector Storage Optimization:**

**pgvector configuration:**
```sql
-- Use IVFFlat index for fast approximate nearest neighbor search
CREATE INDEX idx_file_chunks_embedding ON file_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);  -- 100 lists for ~3000 chunks

-- Analyze for query planner
ANALYZE file_chunks;
```

**Hybrid search (BM25 + Vector):**
```sql
-- Full-text search index
CREATE INDEX idx_file_chunks_fts ON file_chunks
  USING GIN(to_tsvector('english', chunk_text));

-- Hybrid query with RRF fusion
WITH keyword_results AS (
  SELECT id, ts_rank(to_tsvector('english', chunk_text), query) as score
  FROM file_chunks, plainto_tsquery('english', $1) query
  WHERE to_tsvector('english', chunk_text) @@ query
  ORDER BY score DESC
  LIMIT 20
),
vector_results AS (
  SELECT id, 1 - (embedding <=> $2) as score
  FROM file_chunks
  ORDER BY embedding <=> $2  -- Cosine distance
  LIMIT 20
)
-- Reciprocal Rank Fusion
SELECT
  COALESCE(k.id, v.id) as id,
  (1.0 / (60 + COALESCE(k.rank, 1000)) +
   1.0 / (60 + COALESCE(v.rank, 1000))) as combined_score
FROM
  (SELECT id, row_number() OVER () as rank FROM keyword_results) k
FULL OUTER JOIN
  (SELECT id, row_number() OVER () as rank FROM vector_results) v
  ON k.id = v.id
ORDER BY combined_score DESC
LIMIT 10;
```

### Nextcloud Storage Architecture

**Docker Volume Mapping:**
```yaml
# docker-compose.yml
volumes:
  - /opt/nextcloud/data:/var/www/html/data
  - /opt/nextcloud/config:/var/www/html/config
```

**File Metadata:**
```
PostgreSQL (files table)
  - file_id
  - filename
  - folder
  - content_extracted
  - content_summary
  - classified_at
  - embeddings in file_chunks

Nextcloud (filesystem + database)
  - Actual file storage
  - Version history
  - Sync state
  - Sharing permissions
```

**Sync Coordination:**
```bash
# After direct file writes, notify Nextcloud
occ files:scan --path=/oscar/files/Projects/BIM/
```

**Backup Strategy:**
```bash
# Nextcloud data backed up separately
# PostgreSQL handles metadata backups
rsync -av /opt/nextcloud/data/ backup-server:/nextcloud-backups/
```

---

## Network Architecture

### VPS Network Configuration

**Hostinger VPS:**
- Public IP: [assigned by Hostinger]
- SSH: Port 22 (key-based auth only)
- Nextcloud: Port 443 (HTTPS via Docker)
- No other ports exposed

**Docker Networks:**
```yaml
# Nextcloud uses bridge network
networks:
  nextcloud:
    driver: bridge
```

### External Service Endpoints

**Neon PostgreSQL:**
```
Endpoint: ep-dry-forest-abv53mtg-pooler.eu-west-2.aws.neon.tech
Port: 5432
Protocol: PostgreSQL native (encrypted)
Connection pooling: Yes (via Neon pooler)
```

**Railway:**
```
pai-api: https://pai-api-production.up.railway.app
Internal communication: Railway private network
```

**API Endpoints:**
```
Notion: https://api.notion.com/v1/
Google Calendar: https://www.googleapis.com/calendar/v3/
Gmail: https://www.googleapis.com/gmail/v1/
OpenRouter: https://openrouter.ai/api/v1/
Modal: [Modal serverless endpoint]
RAWG: https://api.rawg.io/api/
TMDB: https://api.themoviedb.org/3/
Telegram: https://api.telegram.org/bot{token}/
```

### Network Security

**VPS Firewall:**
```bash
# UFW (Uncomplicated Firewall)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 443/tcp   # HTTPS (Nextcloud)
ufw enable
```

**SSH Hardening:**
```bash
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

**SSL/TLS:**
- Nextcloud: Let's Encrypt certificate (auto-renewal)
- Railway: Automatic HTTPS
- All API calls over HTTPS

---

## Security Architecture

### Secrets Management

**Environment Variables (.env):**
```bash
# NEVER committed to git (.gitignore includes .env)
# Stored on VPS: ~/.claude/tools/.env

DATABASE_URL=postgresql://...
NOTION_TOKEN=secret_...
OPENROUTER_API_KEY=sk-...
TELEGRAM_BOT_TOKEN=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**OAuth Tokens (Database):**
```sql
CREATE TABLE oauth_tokens (
  id SERIAL PRIMARY KEY,
  service TEXT NOT NULL,  -- 'google', 'microsoft', etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Encrypted at rest by Neon
```

**SSH Keys:**
```bash
# GitHub deploy key: ~/.ssh/id_ed25519
# Permissions: 600 (owner read/write only)
chmod 600 ~/.ssh/id_ed25519
```

### Data Encryption

**At Rest:**
- PostgreSQL: Encrypted by Neon (AES-256)
- Nextcloud: Disk encryption optional (not enabled)
- Secrets: Environment variables on encrypted VPS disk

**In Transit:**
- All API calls: HTTPS (TLS 1.2+)
- PostgreSQL: SSL/TLS connection
- SSH: Key-based authentication

### Access Control

**User Permissions:**
```
root          - System administration
oscar         - File ownership (not used for PAI)
ubuntu        - PAI operations (Kay runs as this user)
www-data      - Nextcloud Docker process
```

**Database Permissions:**
```sql
-- Application user (limited permissions)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO pai_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO pai_app;

-- Read-only user (for analysis/reporting)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO pai_readonly;
```

**File Permissions:**
```bash
# Nextcloud data directory
chown -R www-data:www-data /opt/nextcloud/data/
chmod 750 /opt/nextcloud/data/

# PAI tools directory
chown -R ubuntu:ubuntu ~/.claude/
chmod 700 ~/.claude/
```

### Audit Logging

**Sync Operations:**
```sql
-- All sync runs logged
INSERT INTO sync_run_history (...) VALUES (...);
```

**AI Spend:**
```sql
-- All LLM API calls tracked
INSERT INTO ai_spend_log (model_used, cost_usd, ...) VALUES (...);
```

**Telegram Conversations:**
```sql
-- All messages logged
INSERT INTO bot_logs (user_id, message, ...) VALUES (...);
```

**System Changes:**
```sql
-- System modifications tracked
INSERT INTO system_upgrades / system_fixes (...) VALUES (...);
```

---

## Performance Considerations

### Database Query Optimization

**Explain Analyze (Use Before Deploying Queries):**
```sql
EXPLAIN ANALYZE
SELECT * FROM file_chunks
WHERE embedding <=> '[0.1, 0.2, ...]'::vector
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
LIMIT 10;

-- Look for:
-- - Index usage (should use ivfflat index)
-- - Execution time (<100ms for searches)
-- - Rows scanned (should be minimal with index)
```

**Connection Pooling:**
```typescript
// Use Neon's connection pooler
const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,  // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**Batch Operations:**
```typescript
// Don't insert one-by-one in loop
// Bad:
for (const task of tasks) {
  await db.query('INSERT INTO tasks (...) VALUES (...)', task);
}

// Good:
await db.query(`
  INSERT INTO tasks (...)
  VALUES ${tasks.map((_, i) => `($${i*3+1}, $${i*3+2}, $${i*3+3})`).join(', ')}
`, tasks.flatMap(t => [t.title, t.status, t.due_date]));
```

### Caching Strategy

**No Cache Yet (Future Improvement):**
- Consider Redis for frequently accessed data
- Cache search results for 5 minutes
- Cache user context for session duration

**Current Approach:**
- Query database directly (Neon is fast enough)
- Connection pooling reduces overhead
- Sync every 10 minutes provides implicit cache

### Scalability Considerations

**Current Scale (Single User):**
- 22 tasks, 8 projects, 73 files
- 2,908 chunks, 97.5% embedded
- 3,139 Telegram messages
- 307 calendar events

**Projected Growth:**
- Files: +50/month → 1,500 files/year
- Chunks: +50,000/year
- Embeddings: 1536 dims × 50,000 chunks = ~300 MB vectors

**Bottlenecks to Watch:**
- Vector search slows down after 100K chunks (consider HNSW index)
- Telegram bot logs grow unbounded (implement partitioning/archival)
- Sync latency increases with more Notion pages (already at 10 min interval)

---

## Next Steps

**For New Users:**
1. [Check Prerequisites](../01-setup/prerequisites.md)
2. [Set Up VPS](../01-setup/vps-setup.md)
3. [Configure Database](../01-setup/database-setup.md)

**For Developers:**
1. [Development Guide](../04-development/codebase-structure.md)
2. [Adding New Sync Entities](../04-development/extending-sync.md)
3. [Creating MCP Tools](../04-development/mcp-tools.md)

**For Operations:**
1. [Monitoring Guide](../05-operations/monitoring.md)
2. [Troubleshooting](../05-operations/troubleshooting.md)
3. [Backup & Recovery](../05-operations/backups.md)
