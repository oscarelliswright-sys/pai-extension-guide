# PAI Quick Reference Guide

**Purpose:** Fast lookup for common commands, patterns, and workflows
**Audience:** Daily PAI users
**Format:** Cheat sheet style

---

## Telegram Bot Commands

### Essential Commands
```
/help              Show all capabilities
/clear             Clear conversation history
/tasks             View pending email confirmations
/changes           View system upgrades & fixes
/costs             AI spend breakdown
/feedback <text>   Report system issue
/analyze           Run AI analysis on logs
/logs              Show activity statistics
```

### Task Management (Natural Language)
```
"What tasks do I have today?"
"Add task: [description]"
"Add task: [description] due [date]"
"Add high priority task: [description]"
"Mark task [number] done"
"Move task [number] to [date]"
"Change priority of task [number] to [high/medium/low]"
"Assign task [number] to [project]"
"What's overdue?"
"Show high priority tasks"
```

### Calendar (Natural Language)
```
"What's on my calendar?"
"What's on my calendar [date]?"
"When is my next meeting?"
"Schedule [event] [date/time]"
"Add meeting [date] [time]: [description]"
"Block [time range] [date] for [purpose]"
```

### File Search (RAG)
```
"Find documents about [topic]"
"Search for [keyword] in files"
"What did we say about [topic] in [document]?"
"Show recent files about [topic]"
```

### People
```
"Who is [name]?"
"Add contact: [name], [category], [email]"
"Show people in [category]"
```

### Media & Games
```
"Add movie: [title]"
"Add TV show: [title]"
"Add game: [title]"
"Rate [title] [rating]/10"
"What movies do I want to watch?"
"Show my games backlog"
```

---

## LibreChat MCP Tools

### Available Tools (43 total)

**Tasks:**
- `query_tasks` - Search/filter tasks
- `create_task` - New task
- `update_task` - Modify task
- `delete_task` - Remove task

**Projects:**
- `query_projects` - Search projects
- `create_project` - New project
- `update_project` - Modify project

**Calendar:**
- `query_calendar` - Get events
- `create_event` - New event
- `update_event` - Modify event

**Files:**
- `search_files` - RAG search over files
- `get_file_content` - Retrieve specific file
- `list_files` - Browse files

**People:**
- `query_people` - Search contacts
- `create_person` - New contact
- `update_person` - Modify contact

**Notes & Goals:**
- `query_notes`
- `create_note`
- `query_goals`
- `create_goal`

**System:**
- `query_system_upgrades`
- `create_system_upgrade`
- `query_system_fixes`
- `create_system_fix`

---

## Command Line Tools (VPS)

### Sync Commands
```bash
# Full sync cycle
bun run sync/cron-sync.ts

# Individual sync (outbound to Notion)
bun run sync/tasks-sql-to-notion.ts
bun run sync/projects-sql-to-notion.ts
bun run sync/notes-sql-to-notion.ts

# Individual sync (inbound from Notion)
bun run sync/tasks-notion-to-sql.ts
bun run sync/projects-notion-to-sql.ts

# Calendar sync
bun run sync/calendar-google-to-sql.ts
bun run sync/calendar-sql-to-google.ts
```

### Email Commands
```bash
# Fetch and classify emails
bun run email/index.ts fetch

# Search emails (RAG)
bun run email/index.ts search "query"

# Generate embeddings
bun run email/index.ts generate-embeddings

# Update context from emails
bun run email/index.ts context-update
```

### File Processing Commands
```bash
# Scan inbox for new files
bun run sync/files-scan.ts

# Process pending files
bun run sync/files-process.ts

# Interactive review (low confidence files)
bun run sync/files-review.ts

# Generate chunks
bun run scripts/generate-chunks.ts

# Generate embeddings
bun run scripts/generate-embeddings.ts

# RAG search (CLI)
bun run rag-search.ts "query"
```

### Meeting Processing
```bash
# Process specific recording
bun run meetings/process-recording.ts /path/to/recording.mp4

# Check for and process new recordings
bun run meetings/process-recording.ts --check
```

### Nextcloud
```bash
# Force file sync (after direct writes)
sudo docker exec nextcloud php occ files:scan oscar

# Specific path
sudo docker exec nextcloud php occ files:scan --path="/oscar/files/Inbox"
```

### Telegram Bot
```bash
# Start bot (VPS)
cd /home/ubuntu/.claude/tools
bun run telegram/index.ts --vps

# Check if running
ps aux | grep "telegram/index.ts"

# View PID file
cat /home/ubuntu/.claude/tools/telegram/.bot.pid
```

### Railway
```bash
# Check status
npx @railway/cli status

# View logs
npx @railway/cli logs

# Redeploy
npx @railway/cli redeploy
```

---

## Database Queries

### Quick Stats
```sql
-- Task counts by status
SELECT status, COUNT(*) FROM tasks GROUP BY status;

-- Projects with task counts
SELECT p.title, COUNT(t.id) as tasks
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id
GROUP BY p.id, p.title;

-- Files by PARA category
SELECT suggested_para_type, COUNT(*)
FROM files
GROUP BY suggested_para_type;

-- Recent sync runs
SELECT script_name, started_at, status, duration_ms
FROM sync_run_history
ORDER BY started_at DESC
LIMIT 10;
```

### Check Sync Status
```sql
-- Tasks pending outbound sync
SELECT id, title, sql_local_last_edited_at
FROM tasks
WHERE sql_local_last_edited_at IS NOT NULL;

-- Last sync time per entity
SELECT script_name, MAX(started_at) as last_run
FROM sync_run_history
GROUP BY script_name
ORDER BY last_run DESC;
```

### RAG Search Debug
```sql
-- Files with embeddings
SELECT COUNT(*) FROM files WHERE embedding IS NOT NULL;

-- Chunks with embeddings
SELECT COUNT(*) FROM file_chunks WHERE embedding IS NOT NULL;

-- Embedding coverage
SELECT
  COUNT(*) as total_chunks,
  COUNT(embedding) as with_embeddings,
  ROUND(100.0 * COUNT(embedding) / COUNT(*), 1) as coverage_pct
FROM file_chunks;
```

---

## Cron Schedule

### VPS Cron Jobs
```
*/15 * * * *           sync-to-github.sh          (Every 15 min)
0 2 * * 1-6            health-check.sh            (Mon-Sat 2 AM)
0 2 * * 0              security-audit.sh          (Sunday 2 AM)
0 3 * * *              rag-reindex.sh             (Daily 3 AM)
0 4 * * *              extract-missed-learnings.sh (Daily 4 AM)
0 5 * * 0              memory-maintenance.sh      (Sunday 5 AM)
*/15 8-19 * * 1-5      meeting-check.sh           (Weekdays 8 AM-7 PM, every 15 min)
```

### Railway Cron
```
*/10 * * * *           cron-sync.ts               (Every 10 min)
```

### Telegram Scheduler (Real-time)
```
8:00 AM daily          Morning summary
9:00 AM daily          Overdue tasks alert
2:00 PM daily          High priority reminder
Every minute           Meeting reminders (15 min, 5 min before)
Every 5 minutes        Task sync (tasks-sql-to-notion)
```

---

## File Organization (PARA)

### Structure
```
Nextcloud/
├── Projects/          (Active projects with deadlines)
│   ├── ProjectA/
│   └── ProjectB/
├── Areas/             (Ongoing responsibilities)
│   ├── Work/
│   ├── Family/
│   └── Health/
├── Resources/         (Topics of interest)
│   ├── Research/
│   └── Templates/
├── Archive/           (Completed/inactive)
├── Inbox/             (Unprocessed files)
└── Recordings/        (Meeting recordings)
```

### Classification Logic
1. Has project deadline? → **Projects**
2. Ongoing responsibility? → **Areas**
3. Reference material? → **Resources**
4. Completed/old? → **Archive**
5. Not sure yet? → **Inbox**

---

## Notification Settings

### Enable/Disable (via Telegram)
```
"Enable morning summary"
"Disable overdue task alerts"
"Turn on meeting reminders"
"Turn off file expiry warnings"
```

### Database (Direct)
```sql
-- View current settings
SELECT * FROM notification_settings WHERE user_id = 'oscar';

-- Disable morning summary
UPDATE notification_settings
SET morning_summary = false
WHERE user_id = 'oscar';

-- Enable meeting reminders
UPDATE notification_settings
SET meeting_reminders = true
WHERE user_id = 'oscar';
```

---

## Common Workflows

### Morning Routine
1. **8:00 AM** - Receive morning summary
2. Review tasks via Telegram
3. Reply to mark tasks done: "mark 2 done"
4. Reschedule if needed: "move 3 to tomorrow"

### File Drop
1. Drop file in Nextcloud Inbox
2. Receive Telegram notification immediately
3. Reply with project: "Revenue Growth project"
4. File moved, indexed, searchable within 60 seconds

### Email to Task
1. Email arrives in Gmail
2. Railway sync classifies (within 10 min)
3. Telegram: "Create task from this email?"
4. Reply "yes"
5. Task created in Notion (within 10 min)

### Meeting Recording
1. Save recording to Nextcloud Recordings/
2. Cron detects (within 15 min)
3. Processing: audio → transcript → tasks
4. Telegram notification with summary
5. Confirm tasks if extracted

---

## Troubleshooting Quick Fixes

### Bot not responding
```bash
# Check if running
ps aux | grep "telegram/index.ts"

# Restart
cd /home/ubuntu/.claude/tools
bun run telegram/index.ts --vps
```

### Sync not working
```bash
# Check Railway status
npx @railway/cli status

# Check last sync
# Query: SELECT * FROM sync_run_history ORDER BY started_at DESC LIMIT 5;

# Manual sync
bun run sync/cron-sync.ts
```

### Files not showing in Nextcloud
```bash
# Force Nextcloud scan
sudo docker exec nextcloud php occ files:scan oscar
```

### Task not syncing to Notion
```sql
-- Check if flag set
SELECT id, title, sql_local_last_edited_at FROM tasks WHERE id = [task_id];

# Manual outbound sync
bun run sync/tasks-sql-to-notion.ts
```

---

## Environment Variables

### Required (.env)
```bash
# Database
DATABASE_URL=postgresql://...

# Notion
NOTION_TOKEN=secret_...

# Google
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ALLOWED_USERS=chat_id1,chat_id2

# OpenRouter
OPENROUTER_API_KEY=...

# Modal
MODAL_TOKEN_ID=...
MODAL_TOKEN_SECRET=...

# Optional
RAWG_API_KEY=...
TMDB_API_KEY=...
```

---

## API Rate Limits

### Notion API
- 3 requests per second
- Bot handles automatically with exponential backoff

### Google Calendar
- 1 million requests/day (quota)
- Unlikely to hit in personal use

### OpenRouter
- Varies by model
- Monitor with `/costs` command

### Telegram
- 30 messages/second per bot
- 20 messages/minute to same user
- Bot handles automatically

---

## Keyboard Shortcuts (Hypothetical - for future mobile app)

*Currently N/A - Telegram uses standard mobile keyboard*

Future plans:
- Quick task creation
- Fast task completion
- Swipe gestures for file processing

---

## Related Documentation

- [Full Documentation](../README.md)
- [Telegram Bot](../docs/02-capabilities/telegram-bot.md)
- [Setup Guides](../docs/01-setup/)
- [Troubleshooting](../docs/05-operations/troubleshooting.md)

---

**Last Updated:** February 4, 2026
**Print:** Single-page quick reference
**Bookmark:** Keep this page handy for daily use
