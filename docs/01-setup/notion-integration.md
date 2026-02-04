# Notion Integration Setup

**Purpose:** Complete Notion workspace setup and API integration
**Estimated Time:** 45-60 minutes
**Difficulty:** Intermediate
**Last Updated:** February 4, 2026

---

## Table of Contents

1. [Notion Workspace Setup](#notion-workspace-setup)
2. [Create PAI Databases](#create-pai-databases)
3. [Create Integration](#create-integration)
4. [Connect Databases to Integration](#connect-databases-to-integration)
5. [Get Database IDs](#get-database-ids)
6. [Configure PAI](#configure-pai)
7. [Test Sync](#test-sync)
8. [Verification](#verification)

---

## Notion Workspace Setup

### Step 1: Create Notion Account (If Needed)

**Go to:** [notion.so](https://www.notion.so)

**Sign up with:**
- Email
- Google account
- Apple ID

**Verify email** if using email signup

---

### Step 2: Create PAI Page

**In Notion:**
1. Click "+ New page" in sidebar
2. Page title: `PAI System`
3. Icon: 🤖 (optional)
4. Press Enter

**This will be the parent page for all PAI databases**

---

## Create PAI Databases

You'll create **11 databases** for PAI. Each has specific properties.

### Database 1: Tasks

**In PAI System page:**
1. Type `/database` → Select "Database - Inline"
2. Database name: `Tasks`
3. Click "New" to add a sample task (we'll configure properties next)

**Configure Properties (click "•••" → "Properties"):**

| Property Name | Type | Options |
|---------------|------|---------|
| Title | Title | (default) |
| Status | Select | todo, in_progress, done, cancelled |
| Priority | Select | low, medium, high, urgent |
| Due Date | Date | Include time |
| Project | Relation | → Projects database (create this next) |
| Tags | Multi-select | (will add tags later) |
| Description | Text | |
| Created | Created time | |
| Last edited | Last edited time | |

**Add Status options:**
1. Click Status property
2. Add: `todo` (gray), `in_progress` (blue), `done` (green), `cancelled` (red)

**Add Priority options:**
1. Click Priority property
2. Add: `low` (gray), `medium` (yellow), `high` (orange), `urgent` (red)

**Delete sample task** (click "•••" on row → Delete)

---

### Database 2: Projects

**In PAI System page (after Tasks database):**
1. Type `/database`
2. Database name: `Projects`

**Configure Properties:**

| Property Name | Type | Options |
|---------------|------|---------|
| Name | Title | (default) |
| Status | Select | active, on_hold, completed, archived |
| Description | Text | |
| Start Date | Date | |
| End Date | Date | |
| Created | Created time | |
| Last edited | Last edited time | |

**Add Status options:**
- `active` (green)
- `on_hold` (yellow)
- `completed` (blue)
- `archived` (gray)

**Delete sample project**

---

### Database 3: Notes

**Create database:**
1. Type `/database`
2. Database name: `Notes`

**Configure Properties:**

| Property Name | Type | Options |
|---------------|------|---------|
| Title | Title | (default) |
| Content | Text | |
| Project | Relation | → Projects database |
| Tags | Multi-select | |
| Created | Created time | |
| Last edited | Last edited time | |

**Delete sample note**

---

### Database 4: Goals

**Create database:**
1. Type `/database`
2. Database name: `Goals`

**Configure Properties:**

| Property Name | Type | Options |
|---------------|------|---------|
| Title | Title | (default) |
| Description | Text | |
| Target Date | Date | |
| Progress | Number | Format: Percent |
| Status | Select | active, achieved, abandoned |
| Created | Created time | |
| Last edited | Last edited time | |

**Add Status options:**
- `active` (blue)
- `achieved` (green)
- `abandoned` (gray)

**Delete sample goal**

---

### Database 5: People

**Create database:**
1. Type `/database`
2. Database name: `People`

**Configure Properties:**

| Property Name | Type | Options |
|---------------|------|---------|
| Name | Title | (default) |
| Email | Email | |
| Phone | Phone | |
| Relationship | Select | family, friend, colleague, client, other |
| Notes | Text | |
| Created | Created time | |
| Last edited | Last edited time | |

**Add Relationship options:**
- `family` (pink)
- `friend` (green)
- `colleague` (blue)
- `client` (orange)
- `other` (gray)

**Delete sample person**

---

### Database 6: Tags

**Create database:**
1. Type `/database`
2. Database name: `Tags`

**Configure Properties:**

| Property Name | Type | Options |
|---------------|------|---------|
| Name | Title | (default) |
| Color | Select | red, orange, yellow, green, blue, purple, pink, gray |
| Created | Created time | |
| Last edited | Last edited time | |

**Add some initial tags:**
1. Click "New" to add tags
2. Add: `urgent`, `important`, `work`, `personal`, `health`, `family`, `finance`

---

### Database 7: Media Watchlist

**Create database:**
1. Type `/database`
2. Database name: `Media Watchlist`

**Configure Properties:**

| Property Name | Type | Options |
|---------------|------|---------|
| Title | Title | (default) |
| Type | Select | movie, tv, anime |
| Status | Select | plan_to_watch, watching, watched |
| Rating | Number | Format: Number (0-10) |
| TMDB ID | Text | |
| Watched Date | Date | |
| Created | Created time | |
| Last edited | Last edited time | |

**Add Type options:**
- `movie` (red)
- `tv` (blue)
- `anime` (purple)

**Add Status options:**
- `plan_to_watch` (gray)
- `watching` (yellow)
- `watched` (green)

**Delete sample entry**

---

### Database 8: Games Backlog

**Create database:**
1. Type `/database`
2. Database name: `Games Backlog`

**Configure Properties:**

| Property Name | Type | Options |
|---------------|------|---------|
| Title | Title | (default) |
| Platform | Select | PC, PlayStation, Xbox, Nintendo, Mobile, Other |
| Status | Select | backlog, playing, completed, dropped |
| Rating | Number | Format: Number (0-10) |
| RAWG ID | Number | |
| Completed Date | Date | |
| Created | Created time | |
| Last edited | Last edited time | |

**Add Platform options:**
- `PC` (blue)
- `PlayStation` (blue)
- `Xbox` (green)
- `Nintendo` (red)
- `Mobile` (gray)
- `Other` (gray)

**Add Status options:**
- `backlog` (gray)
- `playing` (yellow)
- `completed` (green)
- `dropped` (red)

**Delete sample entry**

---

### Database 9: System Upgrades

**Create database:**
1. Type `/database`
2. Database name: `System Upgrades`

**Configure Properties:**

| Property Name | Type | Options |
|---------------|------|---------|
| Title | Title | (default) |
| Description | Text | |
| Status | Select | idea, planned, in_progress, done |
| Priority | Select | low, medium, high |
| Category | Select | feature, enhancement, integration, infrastructure |
| Source | Select | user_request, ai_analysis, system_observation |
| Project Plan URL | URL | |
| Associated Links | Text | |
| Created | Created time | |
| Last edited | Last edited time | |

**Add Status options:**
- `idea` (gray)
- `planned` (yellow)
- `in_progress` (blue)
- `done` (green)

**Add Priority options:**
- `low` (gray)
- `medium` (yellow)
- `high` (red)

**Add Category options:**
- `feature` (blue)
- `enhancement` (green)
- `integration` (purple)
- `infrastructure` (orange)

**Add Source options:**
- `user_request` (blue)
- `ai_analysis` (purple)
- `system_observation` (gray)

**Delete sample entry**

---

### Database 10: System Fixes

**Create database:**
1. Type `/database`
2. Database name: `System Fixes`

**Configure Properties:**

| Property Name | Type | Options |
|---------------|------|---------|
| Title | Title | (default) |
| Description | Text | |
| Status | Select | reported, investigating, in_progress, fixed |
| Priority | Select | low, medium, high, critical |
| Category | Select | bug, performance, security, ux |
| Affected Component | Text | |
| Steps to Reproduce | Text | |
| Resolution Notes | Text | |
| Source | Select | telegram, ai_analysis, user_report |
| Created | Created time | |
| Last edited | Last edited time | |
| Resolved Date | Date | |

**Add Status options:**
- `reported` (red)
- `investigating` (yellow)
- `in_progress` (blue)
- `fixed` (green)

**Add Priority options:**
- `low` (gray)
- `medium` (yellow)
- `high` (orange)
- `critical` (red)

**Add Category options:**
- `bug` (red)
- `performance` (yellow)
- `security` (orange)
- `ux` (blue)

**Add Source options:**
- `telegram` (blue)
- `ai_analysis` (purple)
- `user_report` (green)

**Delete sample entry**

---

### Database 11: Work Projects

**Create database:**
1. Type `/database`
2. Database name: `Work Projects`

**Configure Properties:**

| Property Name | Type | Options |
|---------------|------|---------|
| Name | Title | (default) |
| Client | Text | |
| Status | Select | active, completed, archived |
| Start Date | Date | |
| End Date | Date | |
| Budget | Number | Format: Currency (£ or $) |
| Created | Created time | |
| Last edited | Last edited time | |

**Add Status options:**
- `active` (green)
- `completed` (blue)
- `archived` (gray)

**Delete sample entry**

---

### Step 3: Set Up Relation Between Tasks and Projects

**In Tasks database:**
1. Click "•••" → "Properties"
2. Find "Project" property
3. Click "Edit property"
4. Under "Relation", select: `Projects` database
5. Enable "Show on Projects" (creates backlink)
6. Click "Done"

**Now in Projects database:**
- You should see a "Tasks" property (relation from Tasks)

---

## Create Integration

### Step 1: Create Notion Integration

**Go to:** [notion.so/my-integrations](https://www.notion.so/my-integrations)

**Create integration:**
1. Click "+ New integration"
2. Name: `PAI System`
3. Logo: (optional, upload 🤖 icon)
4. Associated workspace: Select your workspace
5. Click "Submit"

**On integration page:**
- Copy "Internal Integration Token" (starts with `secret_`)
- **Save this securely** (password manager)

---

### Step 2: Set Integration Capabilities

**On integration settings page:**

**Capabilities:**
- ✅ Read content
- ✅ Update content
- ✅ Insert content

**Content Capabilities:**
- ✅ Read user information (including email addresses)
- ✅ No user information

**User Capabilities:**
- Select: "No user information"

**Click "Save changes"**

---

## Connect Databases to Integration

**For EACH of the 11 databases:**

1. Open database in Notion
2. Click "•••" (top right of database)
3. Scroll to "Connections"
4. Click "+ Add connections"
5. Search for "PAI System"
6. Click to connect
7. Confirm "Allow access"

**Repeat for all 11 databases:**
- Tasks
- Projects
- Notes
- Goals
- People
- Tags
- Media Watchlist
- Games Backlog
- System Upgrades
- System Fixes
- Work Projects

**Verification:**
Each database should show "Connected to PAI System" in "•••" menu

---

## Get Database IDs

You need the ID for each database. Two methods:

### Method 1: Via URL (Easier)

**For each database:**
1. Open database in full page (click title to open)
2. Look at URL: `https://www.notion.so/[WORKSPACE]/[DATABASE_ID]?v=...`
3. Copy the 32-character ID (before `?v=`)

**Example URL:**
```
https://www.notion.so/oscar/2f865bc23a65806098c4fb6e5a22128e?v=xxx
                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                          This is the database ID
```

**Remove hyphens if present** (use raw 32 characters)

---

### Method 2: Via API (More Reliable)

**On VPS, test API connection:**

```bash
# SSH into VPS
ssh ubuntu@YOUR_VPS_IP

# Set your integration token
export NOTION_TOKEN="secret_YOUR_TOKEN_HERE"

# Search for databases
curl -X POST 'https://api.notion.com/v1/search' \
  -H 'Authorization: Bearer '"$NOTION_TOKEN"'' \
  -H 'Notion-Version: 2022-06-28' \
  -H 'Content-Type: application/json' \
  --data '{
    "filter": {
      "value": "database",
      "property": "object"
    },
    "sort": {
      "direction": "descending",
      "timestamp": "last_edited_time"
    }
  }' | jq '.results[] | {title: .title[0].plain_text, id: .id}'
```

**Output:**
```json
{
  "title": "Tasks",
  "id": "2f865bc2-3a65-8066-98c4-fb6e5a22128e"
}
{
  "title": "Projects",
  "id": "..."
}
...
```

**Copy each ID** (without hyphens: `2f865bc23a65806698c4fb6e5a22128e`)

---

### Step 3: Save Database IDs

**Create a mapping file:**

```bash
# On VPS
nano ~/notion-database-ids.txt
```

**Paste your IDs:**
```
TASKS_DB_ID=2f865bc23a65806698c4fb6e5a22128e
PROJECTS_DB_ID=...
NOTES_DB_ID=...
GOALS_DB_ID=...
PEOPLE_DB_ID=...
TAGS_DB_ID=...
MEDIA_DB_ID=...
GAMES_DB_ID=...
SYSTEM_UPGRADES_DB_ID=...
SYSTEM_FIXES_DB_ID=...
WORK_PROJECTS_DB_ID=...
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Keep this file** (will use in next step)

---

## Configure PAI

### Step 1: Add Notion Token to .env

**Edit .env file:**
```bash
nano ~/.claude/tools/.env
```

**Add Notion configuration:**
```bash
# Notion Integration
NOTION_TOKEN=secret_YOUR_INTEGRATION_TOKEN

# Notion Database IDs
NOTION_TASKS_DB_ID=2f865bc23a65806698c4fb6e5a22128e
NOTION_PROJECTS_DB_ID=...
NOTION_NOTES_DB_ID=...
NOTION_GOALS_DB_ID=...
NOTION_PEOPLE_DB_ID=...
NOTION_TAGS_DB_ID=...
NOTION_MEDIA_DB_ID=...
NOTION_GAMES_DB_ID=...
NOTION_SYSTEM_UPGRADES_DB_ID=...
NOTION_SYSTEM_FIXES_DB_ID=...
NOTION_WORK_PROJECTS_DB_ID=...
```

**Replace placeholders** with your actual IDs

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### Step 2: Install PAI Sync Scripts

**Clone PAI repository (if not already):**
```bash
cd ~/.claude/tools

# If not yet cloned, initialize:
git init
# (Full PAI repository setup in separate guide)
```

**For now, create minimal sync test script:**
```bash
nano ~/.claude/tools/test-notion-sync.ts
```

**Paste test script:**
```typescript
// Test Notion API connection
import { Client } from '@notionhq/client';

// Load .env
const envFile = await Bun.file('.env').text();
const env: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
}

const notion = new Client({ auth: env.NOTION_TOKEN });

async function testConnection() {
  console.log('Testing Notion API connection...\n');

  // Test: Get self
  try {
    const me = await notion.users.me({});
    console.log('✓ Connected as:', me.name || me.id);
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  }

  // Test: Query Tasks database
  const tasksDbId = env.NOTION_TASKS_DB_ID;
  if (!tasksDbId) {
    console.error('✗ NOTION_TASKS_DB_ID not set in .env');
    process.exit(1);
  }

  try {
    const response = await notion.databases.query({
      database_id: tasksDbId,
      page_size: 5,
    });
    console.log(`✓ Tasks database accessible (${response.results.length} tasks found)`);
  } catch (error) {
    console.error('✗ Tasks database query failed:', error.message);
    console.error('  Make sure database is connected to integration');
    process.exit(1);
  }

  // Test: Query all databases
  const dbIds = {
    'Projects': env.NOTION_PROJECTS_DB_ID,
    'Notes': env.NOTION_NOTES_DB_ID,
    'Goals': env.NOTION_GOALS_DB_ID,
    'People': env.NOTION_PEOPLE_DB_ID,
    'Tags': env.NOTION_TAGS_DB_ID,
    'Media': env.NOTION_MEDIA_DB_ID,
    'Games': env.NOTION_GAMES_DB_ID,
    'System Upgrades': env.NOTION_SYSTEM_UPGRADES_DB_ID,
    'System Fixes': env.NOTION_SYSTEM_FIXES_DB_ID,
    'Work Projects': env.NOTION_WORK_PROJECTS_DB_ID,
  };

  console.log('\nTesting all databases...');
  for (const [name, id] of Object.entries(dbIds)) {
    if (!id) {
      console.log(`✗ ${name}: ID not configured`);
      continue;
    }

    try {
      const response = await notion.databases.query({
        database_id: id,
        page_size: 1,
      });
      console.log(`✓ ${name}: Accessible`);
    } catch (error) {
      console.log(`✗ ${name}: ${error.message}`);
    }
  }

  console.log('\n✓ Notion integration test complete!');
}

testConnection();
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### Step 3: Install Notion SDK

```bash
cd ~/.claude/tools
bun add @notionhq/client
```

---

### Step 4: Run Test

```bash
cd ~/.claude/tools
bun run test-notion-sync.ts
```

**Expected output:**
```
Testing Notion API connection...

✓ Connected as: PAI System
✓ Tasks database accessible (0 tasks found)

Testing all databases...
✓ Projects: Accessible
✓ Notes: Accessible
✓ Goals: Accessible
✓ People: Accessible
✓ Tags: Accessible
✓ Media: Accessible
✓ Games: Accessible
✓ System Upgrades: Accessible
✓ System Fixes: Accessible
✓ Work Projects: Accessible

✓ Notion integration test complete!
```

**If any errors:** Check database IDs and ensure databases are connected to integration

---

## Test Sync

### Step 1: Create Test Task in Notion

**In Notion Tasks database:**
1. Click "New"
2. Title: `Test Task from Notion`
3. Status: `todo`
4. Priority: `medium`
5. Save (click outside or press Escape)

---

### Step 2: Create Simple Sync Script

**Create inbound sync test:**
```bash
nano ~/.claude/tools/test-sync-inbound.ts
```

**Paste script:**
```typescript
// Test inbound sync: Notion → PostgreSQL
import { Client } from '@notionhq/client';
import postgres from 'postgres';

// Load .env
const envFile = await Bun.file('.env').text();
const env: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
}

const notion = new Client({ auth: env.NOTION_TOKEN });
const sql = postgres(env.DATABASE_URL);

async function syncTasksFromNotion() {
  console.log('Syncing tasks from Notion to PostgreSQL...\n');

  const response = await notion.databases.query({
    database_id: env.NOTION_TASKS_DB_ID!,
  });

  console.log(`Found ${response.results.length} tasks in Notion\n`);

  for (const page of response.results) {
    if (!('properties' in page)) continue;

    const props = page.properties;

    // Extract properties
    const title = props.Title?.type === 'title'
      ? props.Title.title[0]?.plain_text || 'Untitled'
      : 'Untitled';

    const status = props.Status?.type === 'select'
      ? props.Status.select?.name || 'todo'
      : 'todo';

    const priority = props.Priority?.type === 'select'
      ? props.Priority.select?.name || null
      : null;

    const dueDate = props['Due Date']?.type === 'date'
      ? props['Due Date'].date?.start || null
      : null;

    const description = props.Description?.type === 'rich_text'
      ? props.Description.rich_text[0]?.plain_text || null
      : null;

    console.log(`Syncing: "${title}" (${status})`);

    // Upsert into PostgreSQL
    await sql`
      INSERT INTO tasks (
        notion_page_id,
        title,
        status,
        priority,
        due_date,
        description,
        notion_last_edited_time,
        sql_local_last_edited_at
      ) VALUES (
        ${page.id},
        ${title},
        ${status},
        ${priority},
        ${dueDate},
        ${description},
        ${page.last_edited_time},
        NOW()
      )
      ON CONFLICT (notion_page_id)
      DO UPDATE SET
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        priority = EXCLUDED.priority,
        due_date = EXCLUDED.due_date,
        description = EXCLUDED.description,
        notion_last_edited_time = EXCLUDED.notion_last_edited_time,
        sql_local_last_edited_at = NOW()
      WHERE tasks.notion_last_edited_time < EXCLUDED.notion_last_edited_time
    `;
  }

  console.log('\n✓ Sync complete!');

  // Show results
  const tasks = await sql`SELECT title, status, priority FROM tasks`;
  console.log('\nTasks in PostgreSQL:');
  for (const task of tasks) {
    console.log(`- ${task.title} (${task.status})`);
  }

  await sql.end();
}

syncTasksFromNotion();
```

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### Step 3: Install PostgreSQL Client

```bash
cd ~/.claude/tools
bun add postgres
```

---

### Step 4: Run Sync Test

```bash
bun run test-sync-inbound.ts
```

**Expected output:**
```
Syncing tasks from Notion to PostgreSQL...

Found 1 tasks in Notion

Syncing: "Test Task from Notion" (todo)

✓ Sync complete!

Tasks in PostgreSQL:
- Test Task from Notion (todo)
```

---

### Step 5: Verify in Database

```bash
psql "$DATABASE_URL" -c "SELECT title, status, priority, notion_page_id FROM tasks;"
```

**Should show:**
```
          title           | status | priority |         notion_page_id
--------------------------+--------+----------+--------------------------------
 Test Task from Notion    | todo   | medium   | 2f865bc2-3a65-8066-...
```

---

### Step 6: Test Outbound Sync

**Create outbound sync test:**
```bash
nano ~/.claude/tools/test-sync-outbound.ts
```

**Paste script:**
```typescript
// Test outbound sync: PostgreSQL → Notion
import { Client } from '@notionhq/client';
import postgres from 'postgres';

// Load .env
const envFile = await Bun.file('.env').text();
const env: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
}

const notion = new Client({ auth: env.NOTION_TOKEN });
const sql = postgres(env.DATABASE_URL);

async function syncTasksToNotion() {
  console.log('Creating test task in PostgreSQL...\n');

  // Create task in PostgreSQL
  const [newTask] = await sql`
    INSERT INTO tasks (
      title,
      status,
      priority,
      notion_page_id,
      sql_local_last_edited_at
    ) VALUES (
      'Test Task from PostgreSQL',
      'in_progress',
      'high',
      ${'sql:' + crypto.randomUUID()},
      NOW()
    )
    RETURNING id, title, status, priority, notion_page_id
  `;

  console.log(`Created task in PostgreSQL: "${newTask.title}"`);
  console.log(`Temporary ID: ${newTask.notion_page_id}\n`);

  console.log('Syncing to Notion...');

  // Create in Notion
  const page = await notion.pages.create({
    parent: { database_id: env.NOTION_TASKS_DB_ID! },
    properties: {
      'Title': {
        title: [{ text: { content: newTask.title } }]
      },
      'Status': {
        select: { name: newTask.status }
      },
      'Priority': {
        select: { name: newTask.priority }
      }
    }
  });

  console.log(`✓ Created in Notion: ${page.id}`);

  // Update PostgreSQL with real Notion ID
  await sql`
    UPDATE tasks
    SET notion_page_id = ${page.id},
        notion_last_edited_time = ${page.last_edited_time}
    WHERE id = ${newTask.id}
  `;

  console.log(`✓ Updated PostgreSQL with Notion ID\n`);

  console.log('✓ Outbound sync complete!');
  console.log(`\nCheck Notion Tasks database - you should see: "${newTask.title}"`);

  await sql.end();
}

syncTasksToNotion();
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Run test:**
```bash
bun run test-sync-outbound.ts
```

**Expected output:**
```
Creating test task in PostgreSQL...

Created task in PostgreSQL: "Test Task from PostgreSQL"
Temporary ID: sql:abc-123-...

Syncing to Notion...
✓ Created in Notion: 2f865bc2-...
✓ Updated PostgreSQL with Notion ID

✓ Outbound sync complete!

Check Notion Tasks database - you should see: "Test Task from PostgreSQL"
```

**Verify in Notion:** Open Tasks database, you should see the new task!

---

## Verification

### Complete Notion Integration Checklist

**Run this verification:**

```bash
# Test all database connections
bun run test-notion-sync.ts

# Test inbound sync
bun run test-sync-inbound.ts

# Test outbound sync
bun run test-sync-outbound.ts
```

**Manual verification:**

**In Notion:**
- [ ] 11 databases created
- [ ] All databases have correct properties
- [ ] PAI System integration connected to all databases
- [ ] "Test Task from Notion" exists in Tasks database
- [ ] "Test Task from PostgreSQL" exists in Tasks database

**In PostgreSQL:**
```bash
psql "$DATABASE_URL"
```

```sql
-- Check tasks synced
SELECT title, status, notion_page_id FROM tasks;
-- Should show 2 tasks

-- Check database IDs in .env are correct
\q
```

```bash
grep NOTION ~/.claude/tools/.env
# Should show all 12 variables (TOKEN + 11 DB IDs)
```

**All checks pass?** ✅ Notion integration complete!

---

## Troubleshooting

### Issue: "object not found" when querying database

**Symptom:**
```
Error: Could not find database with ID: 2f865bc2...
```

**Solutions:**

**1. Check database is connected to integration:**
- Open database in Notion
- Click "•••" → "Connections"
- Should show "PAI System"
- If not, click "+ Add connections" and add PAI System

**2. Check database ID is correct:**
- Open database in full page
- Check URL: `notion.so/[DATABASE_ID]?v=...`
- Copy ID (32 characters, no hyphens)
- Update .env with correct ID

**3. Check integration token is correct:**
- Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
- Copy token again
- Update .env

---

### Issue: "Invalid request URL" when creating page

**Symptom:**
```
Error: body failed validation: body.parent.database_id should be a valid uuid
```

**Solution:**

**Database ID has hyphens** - remove them

**Correct format:** `2f865bc23a65806698c4fb6e5a22128e` (32 chars, no hyphens)
**Wrong format:** `2f865bc2-3a65-8066-98c4-fb6e5a22128e` (with hyphens)

**Fix:**
```bash
nano ~/.claude/tools/.env

# Remove hyphens from all database IDs
# Before: 2f865bc2-3a65-8066-98c4-fb6e5a22128e
# After:  2f865bc23a65806698c4fb6e5a22128e
```

---

### Issue: Property type mismatch

**Symptom:**
```
Error: body failed validation: body.properties.Status.select should be defined
```

**Solution:**

**Property name doesn't match database schema**

**Check property names in Notion:**
- Open database
- Click "•••" → "Properties"
- Check exact spelling (case-sensitive!)
- Common mistakes: "status" vs "Status", "DueDate" vs "Due Date"

**Update script to match:**
```typescript
// Wrong:
'status': { select: { name: 'todo' } }

// Correct (if property name is "Status"):
'Status': { select: { name: 'todo' } }
```

---

### Issue: Relation to Projects not working

**Symptom:**
```
Error: body failed validation: body.properties.Project.relation should be an array
```

**Solution:**

**Relation format is different:**
```typescript
// Wrong:
'Project': {
  relation: { id: projectId }
}

// Correct:
'Project': {
  relation: [{ id: projectId }]  // Array of IDs
}
```

---

### Issue: Tag multi-select not working

**Symptom:**
Tasks with tags aren't syncing correctly

**Solution:**

**Multi-select format:**
```typescript
// Wrong:
'Tags': {
  multi_select: ['urgent', 'work']
}

// Correct:
'Tags': {
  multi_select: [
    { name: 'urgent' },
    { name: 'work' }
  ]
}
```

---

## Next Steps

**Notion integration complete!** ✅

**What's been configured:**
- ✅ 11 Notion databases created and configured
- ✅ PAI System integration created
- ✅ All databases connected to integration
- ✅ Database IDs saved to .env
- ✅ Inbound sync tested (Notion → PostgreSQL)
- ✅ Outbound sync tested (PostgreSQL → Notion)

**Next steps:**
1. **[Telegram Bot Setup](telegram-bot-setup.md)** - Configure mobile interface
2. **[Railway Deployment](railway-deployment.md)** - Deploy sync service
3. **[Testing & Usage](../03-usage/daily-workflows.md)** - Start using PAI!

**Clean up test data (optional):**
```sql
-- Remove test tasks
DELETE FROM tasks WHERE title LIKE 'Test Task%';
```

**In Notion:** Delete test tasks manually

---

## Appendix: Property Type Reference

**Common Notion property types and their formats:**

```typescript
// Title
'Title': {
  title: [{ text: { content: 'Task title' } }]
}

// Rich Text
'Description': {
  rich_text: [{ text: { content: 'Description text' } }]
}

// Select
'Status': {
  select: { name: 'todo' }
}

// Multi-select
'Tags': {
  multi_select: [
    { name: 'urgent' },
    { name: 'work' }
  ]
}

// Date
'Due Date': {
  date: { start: '2026-02-15' }  // or '2026-02-15T10:00:00'
}

// Number
'Progress': {
  number: 75
}

// Checkbox
'Completed': {
  checkbox: true
}

// URL
'Link': {
  url: 'https://example.com'
}

// Email
'Email': {
  email: 'user@example.com'
}

// Phone
'Phone': {
  phone_number: '+44 7700 900000'
}

// Relation (to other database)
'Project': {
  relation: [{ id: 'page-id-here' }]
}
```

---

**Notion Integration Ready!** Proceed to [Telegram Bot Setup](telegram-bot-setup.md).
