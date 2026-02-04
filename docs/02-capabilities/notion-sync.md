# Notion Sync System

**Purpose:** Bidirectional synchronization between Notion and PostgreSQL
**Sync Frequency:** Every 10 minutes (Railway cron)
**Databases:** 11 Notion databases ↔ PostgreSQL tables
**Status:** Production, actively used

---

## Table of Contents

1. [Overview](#overview)
2. [Synced Databases](#synced-databases)
3. [Sync Architecture](#sync-architecture)
4. [Conflict Resolution](#conflict-resolution)
5. [Bidirectional Flow](#bidirectional-flow)
6. [Implementation Details](#implementation-details)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Notion sync system enables **edit-anywhere, updates-everywhere** functionality. Changes made in Notion, Telegram, LibreChat, or direct database updates all propagate through the system.

### Key Principles

**1. Timestamp-Based Conflict Resolution**
- Last edit wins
- Compares `notion_last_edited_at` vs `sql_local_last_edited_at`
- Respects user edits regardless of source

**2. Two-Phase Sync**
- **Phase 1 (Inbound):** Notion → PostgreSQL (catches manual edits)
- **Phase 2 (Outbound):** PostgreSQL → Notion (pushes AI/system changes)

**3. SQL-First Creation**
- New items created locally get temporary ID: `sql:telegram_123`
- Outbound sync creates Notion page, replaces with real Notion ID

**4. Notion-First Creation**
- New items in Notion detected during inbound sync
- Inserted into PostgreSQL with Notion page ID

---

## Synced Databases

### 1. Tasks
**Notion Database ID:** `2f865bc2-3a65-80d9-b631-eef92b30c5ce`
**PostgreSQL Table:** `tasks`

**Fields:**
- `title` - Task name (text)
- `status` - Todo, In Progress, Done, Cancelled (select)
- `priority` - Low, Medium, High, Critical (select)
- `due_date` - Deadline (date)
- `project` - Linked project (relation)
- `tags` - Multiple tags (relation)
- `notes` - Task description (rich text)
- `created_at`, `completed_at` - Timestamps

**Sync Features:**
- Task status changes sync bidirectionally
- Due dates automatically create calendar events (via `calendar-task-trigger.ts`)
- Completed tasks archived but not deleted
- Priority changes reflected across all interfaces

---

### 2. Projects
**Notion Database ID:** `2f865bc2-3a65-80f1-9ad9-c67e30f1ee93`
**PostgreSQL Table:** `projects`

**Fields:**
- `name` - Project name (text)
- `status` - Active, On Hold, Completed (select)
- `type` - Work, Personal, Learning (select)
- `description` - Project overview (rich text)
- `start_date`, `target_date` - Timeline (dates)
- `tags` - Categorization (relation)
- `tasks` - Linked tasks (relation)

**Sync Features:**
- Project status changes propagate to task assignments
- Context files (`context/projects/`) updated with activity
- Work projects automatically sync labels with Gmail

---

### 3. Goals
**Notion Database ID:** `2f865bc2-3a65-8055-8b36-ea0f30871fe3`
**PostgreSQL Table:** `goals`

**Fields:**
- `name` - Goal description (text)
- `category` - Health, Career, Learning, etc. (select)
- `progress` - 0-100% (number)
- `target_date` - When to achieve by (date)
- `status` - Active, Achieved, Abandoned (select)
- `notes` - Progress notes (rich text)
- `related_projects` - Linked projects (relation)

**Sync Features:**
- Progress updates via Telegram: "Update goal X progress to 75%"
- Achieved goals automatically archived
- Related projects linked bidirectionally

---

### 4. Notes
**Notion Database ID:** `2f865bc2-3a65-8059-85f4-cbfb10e32654`
**PostgreSQL Table:** `notes`

**Fields:**
- `title` - Note title (text)
- `content` - Note body (rich text)
- `type` - Meeting, Idea, Learning, Reference (select)
- `project` - Linked project (relation)
- `tags` - Categorization (relation)
- `created_at` - Timestamp

**Sync Features:**
- Created via Telegram: "Create note: Meeting with client..."
- Distributed to project folders (Wed/Sun via `notes-distribute.ts`)
- Rich text formatting preserved during sync

---

### 5. People
**Notion Database ID:** `2f865bc2-3a65-8066-a0d9-f4a1ed51ba9d`
**PostgreSQL Table:** `people`

**Fields:**
- `name` - Full name (text)
- `relationship` - Family, Friend, Colleague, Client (select)
- `email` - Primary email (email)
- `phone` - Phone number (phone)
- `notes` - Additional info (rich text)
- `projects` - Associated projects (relation)
- `tags` - Categorization (relation)

**Sync Features:**
- Automatically enriched from email contacts
- Work project assignments tracked
- Context files (`context/areas/Family.md`) updated with activity

---

### 6. Tags
**Notion Database ID:** `2f865bc2-3a65-801c-99ee-c4a4f04e02b4`
**PostgreSQL Table:** `tags`

**Fields:**
- `name` - Tag name (text)
- `type` - Area, Resource (select)
- `description` - Tag purpose (text)

**Sync Features:**
- Created from PARA folders (Areas/Resources → Tags)
- Used across tasks, projects, notes, people
- Hierarchical organization (Areas have Resources)

**Special Sync:**
- `areas-sql-to-notion.ts` - Creates Area tags from filesystem
- `resources-sql-to-notion.ts` - Creates Resource tags from filesystem

---

### 7. Media Watchlist
**Notion Database ID:** `2f865bc2-3a65-8024-9d56-cb3e48dd92a5`
**PostgreSQL Table:** `media`

**Fields:**
- `title` - Movie/TV show name (text)
- `type` - Movie, TV Show, Anime (select)
- `status` - Watching, Completed, Plan to Watch (select)
- `rating` - 1-10 (number)
- `notes` - Thoughts/review (rich text)
- `tmdb_id` - TMDB API ID (number)
- `poster_url` - Cover image (URL)

**Sync Features:**
- Added via Telegram: "Add movie The Matrix"
- TMDB API enrichment (title, year, poster)
- Status updates: "Mark Inception as watched"

---

### 8. Games Backlog
**Notion Database ID:** `2f865bc2-3a65-800a-bb2f-c2b662c5dad2`
**PostgreSQL Table:** `games`

**Fields:**
- `name` - Game title (text)
- `platform` - PC, PS5, Switch, etc. (select)
- `status` - Playing, Completed, Backlog (select)
- `rating` - 1-10 (number)
- `hours_played` - Playtime (number)
- `notes` - Review/thoughts (rich text)
- `rawg_id` - RAWG API ID (number)
- `cover_url` - Game cover (URL)

**Sync Features:**
- Added via Telegram: "Add game Cyberpunk 2077 for PC"
- RAWG API enrichment (title, platform, cover)
- Completion tracking: "Mark Elden Ring as done"

---

### 9. System Upgrades
**Notion Database ID:** `2f865bc2-3a65-80ee-98c4-fb6e5a22128e`
**PostgreSQL Table:** `system_upgrades`

**Purpose:** Track PAI feature ideas and planned improvements

**Fields:**
- `title` - Feature description (text)
- `status` - Idea, Planned, In Progress, Done (select)
- `priority` - Low, Medium, High, Critical (select)
- `category` - Database, Automation, UI, etc. (select)
- `description` - Detailed plan (rich text)
- `source` - Telegram, AI Analysis, Manual (select)
- `project_plan_url` - Link to implementation plan (URL)
- `associated_links` - Related docs (text)

**Sync Features:**
- Created via AI analysis of sessions
- Visible in Telegram: `/changes`
- Linked to implementation plans in MEMORY/Research/

---

### 10. System Fixes
**Notion Database ID:** `2f865bc2-3a65-80de-afea-c77a7eff05a0`
**PostgreSQL Table:** `system_fixes`

**Purpose:** Track PAI bugs and issues

**Fields:**
- `title` - Bug description (text)
- `status` - Reported, Investigating, In Progress, Fixed (select)
- `priority` - Low, Medium, High, Critical (select)
- `category` - Sync, Email, File Processing, etc. (select)
- `description` - Bug details (rich text)
- `steps_to_reproduce` - How to trigger (text)
- `affected_component` - Which system (text)
- `source` - Telegram, User Report, Auto-Detection (select)
- `resolution_notes` - How fixed (text)

**Sync Features:**
- Created via Telegram: `/feedback The bot dropped my message`
- Visible in Telegram: `/changes`
- Auto-detected by health checks

---

### 11. Calendar Events
**External Service:** Google Calendar (not Notion)
**PostgreSQL Table:** `calendar_events`

**Note:** Calendar syncs with Google Calendar API, not Notion. Included here for completeness.

**Fields:**
- `summary` - Event title
- `start_time`, `end_time` - Event times
- `description` - Event details
- `location` - Where
- `calendar_type` - personal, work_readonly
- `google_event_id` - Calendar API ID

**Sync Features:**
- Bidirectional for personal calendar
- Read-only for work calendar
- Task due dates automatically create events

---

## Sync Architecture

### Railway Cron Job

**Schedule:** Every 10 minutes
**Entry:** `scripts/startup.ts` → `sync/cron-sync.ts`
**Railway Config:** `railway.toml` → `cronSchedule = "*/10 * * * *"`

**Execution Order:**

```typescript
// Phase 1: Inbound (External → SQL)
tags-notion-to-sql.ts
tasks-notion-to-sql.ts
projects-notion-to-sql.ts
goals-notion-to-sql.ts
notes-notion-to-sql.ts
people-notion-to-sql.ts
media-notion-to-sql.ts
games-notion-to-sql.ts
system-upgrades-notion-to-sql.ts
system-fixes-notion-to-sql.ts
calendar-google-to-sql.ts

// Phase 2: Outbound (SQL → External)
tags-sql-to-notion.ts
tasks-sql-to-notion.ts
projects-sql-to-notion.ts
goals-sql-to-notion.ts
notes-sql-to-notion.ts
people-sql-to-notion.ts
media-sql-to-notion.ts
games-sql-to-notion.ts
system-upgrades-sql-to-notion.ts
system-fixes-sql-to-notion.ts
areas-sql-to-notion.ts      // Creates Area tags from filesystem
resources-sql-to-notion.ts  // Creates Resource tags from filesystem
calendar-sql-to-google.ts

// Phase 3: Task Trigger
calendar-task-trigger.ts  // Task due dates → Calendar events
```

**Total Sync Time:** ~30-60 seconds per cycle

---

## Conflict Resolution

### Timestamp Comparison

Every synced item has two timestamps:
- `notion_last_edited_at` - Last edit time in Notion
- `sql_local_last_edited_at` - Last edit time in PostgreSQL

**Rule:** **Most recent timestamp wins**

### Inbound Sync (Notion → SQL)

```typescript
// Example from tasks-notion-to-sql.ts
const notionTime = new Date(notionTask.last_edited_time);
const sqlTime = existingTask?.sql_local_last_edited_at;

if (!sqlTime || notionTime > sqlTime) {
  // Notion is newer → update SQL
  await sql`
    UPDATE tasks SET
      title = ${notionTask.title},
      status = ${notionTask.status},
      notion_last_edited_at = ${notionTime},
      updated_at = NOW()
    WHERE notion_page_id = ${notionTask.id}
  `;
}
```

### Outbound Sync (SQL → Notion)

```typescript
// Example from tasks-sql-to-notion.ts
const sqlTime = sqlTask.sql_local_last_edited_at;
const notionTime = sqlTask.notion_last_edited_at;

if (sqlTime > notionTime) {
  // SQL is newer → update Notion
  await notion.pages.update({
    page_id: sqlTask.notion_page_id,
    properties: {
      Title: { title: [{ text: { content: sqlTask.title } }] },
      Status: { select: { name: sqlTask.status } },
    },
  });

  // Update SQL with new Notion timestamp
  await sql`
    UPDATE tasks SET
      notion_last_edited_at = NOW()
    WHERE id = ${sqlTask.id}
  `;
}
```

### Edge Cases

**1. Simultaneous Edits (Same Second)**
- Rare due to 10-minute sync interval
- Notion wins (inbound runs before outbound)

**2. SQL-Created Items (No Notion ID)**
- Flagged with temporary ID: `sql:telegram_123`
- Outbound sync creates Notion page
- SQL updated with real Notion page ID

**3. Notion-Created Items (No SQL Record)**
- Detected during inbound sync
- Inserted into SQL with Notion page ID
- Future edits use normal conflict resolution

**4. Deleted Items**
- Soft delete (status = "Cancelled" or "Archived")
- Never hard deleted to preserve history
- Filtered out of active queries

---

## Bidirectional Flow

### Example: Task Created in Telegram

```
1. User: "Add task: Call dentist tomorrow"
   ↓
2. Telegram bot calls create_task tool
   ↓
3. INSERT INTO tasks (
     title = "Call dentist",
     due_date = "2026-02-05",
     notion_page_id = "sql:telegram_20260204_001",
     sql_local_last_edited_at = NOW()
   )
   ↓
4. [Wait up to 10 minutes for sync]
   ↓
5. tasks-sql-to-notion.ts detects sql:* prefix
   ↓
6. Create page in Notion:
   POST /v1/pages
   {
     "parent": { "database_id": "2f865bc2..." },
     "properties": {
       "Title": { "title": [{ "text": { "content": "Call dentist" } }] },
       "Due Date": { "date": { "start": "2026-02-05" } },
       "Status": { "select": { "name": "Todo" } }
     }
   }
   ↓
7. Notion returns page ID: "a1b2c3d4..."
   ↓
8. UPDATE tasks SET
     notion_page_id = "a1b2c3d4...",
     notion_last_edited_at = NOW()
   WHERE notion_page_id = "sql:telegram_20260204_001"
   ↓
9. Task now syncs bidirectionally using real Notion ID
```

### Example: Task Edited in Notion

```
1. User edits task in Notion: "Call dentist" → "Call dentist about crown"
   ↓
2. Notion updates last_edited_time: 2026-02-04T10:30:00Z
   ↓
3. [Wait up to 10 minutes for sync]
   ↓
4. tasks-notion-to-sql.ts queries Notion database
   ↓
5. Compare timestamps:
   notion_last_edited_at: 2026-02-04T10:30:00Z
   sql_local_last_edited_at: 2026-02-04T10:20:00Z
   ↓
6. Notion is newer (10:30 > 10:20)
   ↓
7. UPDATE tasks SET
     title = "Call dentist about crown",
     notion_last_edited_at = "2026-02-04T10:30:00Z",
     updated_at = NOW()
   WHERE notion_page_id = "a1b2c3d4..."
   ↓
8. Change now visible in Telegram, LibreChat, Claude Code
```

---

## Implementation Details

### Notion API Integration

**Library:** `@notionhq/client`
**Authentication:** Integration token (not OAuth)
**Rate Limits:** 3 requests/second (handled by client library)

**Key Operations:**

```typescript
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// Query database
const response = await notion.databases.query({
  database_id: TASKS_DB_ID,
  filter: {
    property: 'Status',
    select: { does_not_equal: 'Done' },
  },
  sorts: [
    { property: 'Due Date', direction: 'ascending' },
  ],
});

// Create page
await notion.pages.create({
  parent: { database_id: TASKS_DB_ID },
  properties: {
    Title: { title: [{ text: { content: 'New task' } }] },
    Status: { select: { name: 'Todo' } },
    Priority: { select: { name: 'Medium' } },
  },
});

// Update page
await notion.pages.update({
  page_id: pageId,
  properties: {
    Status: { select: { name: 'Done' } },
  },
});
```

### PostgreSQL Schema

**Key Columns (Common to All Tables):**
- `id` - UUID primary key
- `notion_page_id` - Notion page ID (or `sql:*` temp ID)
- `notion_last_edited_at` - Notion last edit timestamp
- `sql_local_last_edited_at` - PostgreSQL last edit timestamp
- `created_at` - When created in PostgreSQL
- `updated_at` - When last updated in PostgreSQL

**Indexes:**
- `notion_page_id` (unique) - Fast lookup by Notion ID
- `sql_local_last_edited_at` - Detect local changes
- `notion_last_edited_at` - Detect Notion changes

### Sync Runner Pattern

All sync scripts use shared runner from `lib/sync-runner.ts`:

```typescript
import { runSync } from '../lib/sync-runner';

await runSync({
  name: 'tasks-notion-to-sql',
  direction: 'inbound',
  entity: 'tasks',
  async run() {
    // Fetch from Notion
    const notionTasks = await fetchNotionTasks();

    // Upsert into SQL
    for (const task of notionTasks) {
      await upsertTask(task);
    }

    return { processed: notionTasks.length };
  },
});
```

**Features:**
- Automatic logging to `sync_run_history` table
- Error handling and retry logic
- Performance tracking (duration)
- Last sync timestamp tracking

---

## Troubleshooting

### Task Not Syncing

**Symptoms:**
- Created task in Telegram not showing in Notion
- Edited task in Notion not updating in PostgreSQL

**Diagnosis:**

1. **Check sync logs:**
   ```sql
   SELECT * FROM sync_run_history
   WHERE entity = 'tasks'
   ORDER BY started_at DESC
   LIMIT 10;
   ```

2. **Check item timestamps:**
   ```sql
   SELECT
     title,
     notion_page_id,
     notion_last_edited_at,
     sql_local_last_edited_at,
     created_at
   FROM tasks
   WHERE title LIKE '%problematic task%';
   ```

3. **Check for sql:* prefix:**
   ```sql
   SELECT * FROM tasks
   WHERE notion_page_id LIKE 'sql:%'
   ORDER BY created_at DESC;
   ```

**Common Causes:**

**1. Outbound Sync Failed**
- Item has `sql:*` ID (never got real Notion ID)
- **Fix:** Check Railway logs for Notion API errors
- **Manual Fix:** Delete and recreate task

**2. Timestamp Conflict**
- SQL timestamp newer than Notion (item not updating from Notion)
- **Fix:** Force SQL timestamp back:
  ```sql
  UPDATE tasks SET
    sql_local_last_edited_at = '2020-01-01'::timestamp
  WHERE id = 'problematic-id';
  ```

**3. Notion API Rate Limit**
- Sync script hit 3 req/sec limit
- **Fix:** Wait 10 minutes for next sync cycle

---

### Duplicate Items

**Symptoms:**
- Same task appears twice in Notion or PostgreSQL

**Diagnosis:**

```sql
SELECT title, COUNT(*) as count
FROM tasks
GROUP BY title
HAVING COUNT(*) > 1;
```

**Common Causes:**

**1. SQL-First Creation Race Condition**
- Two sources created task simultaneously
- Both got `sql:*` IDs
- Outbound created two Notion pages

**Fix:**
1. Identify duplicates in SQL:
   ```sql
   SELECT * FROM tasks
   WHERE title = 'Duplicate task name'
   ORDER BY created_at;
   ```

2. Keep oldest, delete newer:
   ```sql
   DELETE FROM tasks
   WHERE id = 'newer-id';
   ```

3. Delete duplicate Notion page manually

**2. Notion ID Collision**
- Item deleted and recreated with same title
- Old SQL record matched to new Notion page

**Fix:**
1. Hard delete old SQL record:
   ```sql
   DELETE FROM tasks
   WHERE notion_page_id = 'old-notion-id';
   ```

2. Let inbound sync recreate from Notion

---

### Relation Field Not Syncing

**Symptoms:**
- Task linked to project in Notion not reflected in SQL
- Task created via Telegram doesn't show project link in Notion

**Explanation:**
Relations are **one-way** in current implementation. Only the foreign key is synced, not the relation metadata.

**Example:**
- Task has `project_id` in SQL → Syncs to Notion as relation
- Notion relation updated → Inbound sync updates `project_id` in SQL
- **But:** Notion's "Tasks" relation property on Project page is NOT synced

**Workaround:**
Use `related_tasks` computed property in SQL:

```sql
-- Get all tasks for a project
SELECT * FROM tasks
WHERE project_id = 'project-uuid';
```

---

### Calendar Event Not Created from Task

**Symptoms:**
- Task has due date but no calendar event created

**Diagnosis:**

1. **Check calendar-task-trigger.ts logs:**
   ```bash
   cd ~/.claude/tools
   bun run sync/calendar-task-trigger.ts
   ```

2. **Check task due date format:**
   ```sql
   SELECT title, due_date
   FROM tasks
   WHERE due_date IS NOT NULL;
   ```

**Common Causes:**

**1. Due Date in Past**
- Trigger only creates events for future dates
- **Fix:** Update task due date to future

**2. Calendar Event Already Exists**
- Check `calendar_events.source_task_id`:
  ```sql
  SELECT * FROM calendar_events
  WHERE source_task_id = 'task-uuid';
  ```

**3. Google Calendar API Failure**
- Railway logs show API error
- **Fix:** Check OAuth token in `oauth_tokens` table

---

### Sync Taking Too Long

**Symptoms:**
- Sync cycle takes >5 minutes
- Railway cron job times out

**Diagnosis:**

```sql
SELECT
  entity,
  direction,
  duration_ms,
  records_processed,
  started_at
FROM sync_run_history
ORDER BY duration_ms DESC
LIMIT 20;
```

**Common Causes:**

**1. Large Database Query**
- Querying all 1000+ Notion tasks every sync
- **Fix:** Implement incremental sync (only changed items)

**2. Notion API Slow**
- Notion experiencing outage/slowdown
- **Fix:** Wait for Notion to recover, sync will catch up

**3. PostgreSQL Connection Pool Exhausted**
- All 20 connections in use
- **Fix:** Increase pool size in `lib/db.ts`

---

### Manual Sync Trigger

To force sync outside of 10-minute schedule:

```bash
cd ~/.claude/tools

# Full sync cycle
bun run sync/cron-sync.ts

# Specific entity inbound
bun run sync/tasks-notion-to-sql.ts

# Specific entity outbound
bun run sync/tasks-sql-to-notion.ts

# Trigger outbound for all entities
bun run sync/trigger-outbound.ts all
```

---

## Performance Optimization

### Current Performance

- **Inbound Sync (11 scripts):** ~15-20 seconds
- **Outbound Sync (13 scripts):** ~20-30 seconds
- **Task Trigger:** ~2-5 seconds
- **Total Cycle:** ~40-60 seconds

### Bottlenecks

1. **Sequential Execution** - Scripts run one at a time
2. **Full Database Queries** - Fetch all items, compare timestamps
3. **Notion API Latency** - 200-500ms per request

### Future Improvements

**1. Parallel Execution**
- Run inbound scripts concurrently
- Requires Railway timeout increase (currently 5 min)

**2. Incremental Sync**
- Only query items edited since last sync
- Notion filter: `last_edited_time > last_sync_time`

**3. Batch Operations**
- Bulk upsert in PostgreSQL (currently one-by-one)
- Notion batch API (when available)

**4. Change Detection**
- Notion webhooks (when available)
- PostgreSQL triggers for SQL-first changes

---

## Related Documentation

- [System Overview](../00-overview/system-overview.md) - High-level architecture
- [Telegram Bot](./telegram-bot.md) - Mobile interface that triggers syncs
- [Database Schema](../04-development/database-schema.md) - Table definitions
- [Troubleshooting](../05-operations/troubleshooting.md) - General debugging
