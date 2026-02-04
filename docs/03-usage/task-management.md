# Task Management

**Purpose:** Complete guide to managing tasks in PAI
**Interfaces:** Telegram, LibreChat, Notion, Claude Code
**Sync:** Bidirectional (edit anywhere, updates everywhere)
**Last Updated:** February 4, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Creating Tasks](#creating-tasks)
3. [Viewing Tasks](#viewing-tasks)
4. [Updating Tasks](#updating-tasks)
5. [Task Properties](#task-properties)
6. [Task Sources](#task-sources)
7. [Best Practices](#best-practices)
8. [Advanced Workflows](#advanced-workflows)

---

## Overview

PAI treats tasks as the **primary unit of work**. Every action item, whether from email, meeting, or manual creation, becomes a task.

### Task Lifecycle

```
Created → Todo → In Progress → Done/Cancelled
```

### Key Features

- **Bidirectional Sync:** Edit in Notion, Telegram, LibreChat - changes sync everywhere
- **Source Tracking:** Know where task came from (email, meeting, manual)
- **Project Linking:** Tasks automatically link to projects
- **Deadline Management:** Calendar events created for tasks with due dates
- **Priority Levels:** Low, Medium, High, Critical
- **Status Tracking:** Todo, In Progress, Done, Cancelled

---

## Creating Tasks

### Via Telegram (Fastest - Mobile)

**Natural Language:**

```
You: Add task review deliverable by Friday

Kay: ✅ Created task: Review deliverable
Due: Friday, Feb 7
Status: Todo
Priority: Medium

Added to your task list.
```

**With Details:**

```
You: Add high priority task: finalize budget analysis for CTS010, due next Wednesday, notes include Q4 data and sensitivity analysis

Kay: ✅ Created task: Finalize budget analysis

Project: CTS010 denovoSkin
Due: Wednesday, Feb 12
Priority: High
Notes: Include Q4 data and sensitivity analysis
Status: Todo

Would you like me to add any tags or links?
```

**Quick Format:**

```
You: Task: call dentist tomorrow

Kay: ✅ Created task: Call dentist
Due: Tomorrow (Feb 5)
Priority: Medium
Status: Todo
```

---

### Via LibreChat (Desktop)

**Using create_task Tool:**

```
You: Create a task to review Sarah's analysis by Friday, high priority, for CTS010 project

Kay: [Calls create_task tool]

✅ Task created successfully

**Details:**
- Title: Review Sarah's analysis
- Project: CTS010 denovoSkin
- Due: Friday, Feb 7
- Priority: High
- Status: Todo
- Source: manual

Task is now visible in all interfaces and will sync to Notion within 10 minutes.
```

---

### Via Notion (Direct)

1. Open Notion "Tasks" database
2. Click "New"
3. Fill in properties:
   - Title: Task name
   - Status: Todo
   - Priority: High/Medium/Low
   - Due Date: Select date
   - Project: Link to project page
4. Save

Task syncs to PAI within 10 minutes (next sync cycle).

---

### From Email (Automatic)

When Kay classifies email as "actionable":

**Telegram Notification:**

```
📧 New actionable email

From: Ben Wilding
Subject: DenovoSkin deliverable review

Extracted task:
"Review deliverable draft and send feedback by Friday"

Action items:
• Review deliverable draft
• Send feedback to Ben

Deadline: Friday, Feb 7

Create task?
[✅ Yes] [❌ No]
```

**Reply "yes" to create:**

```
You: yes

Kay: ✅ Created task: Review deliverable draft

From: Ben Wilding <ben@cogentia.co.uk>
Project: CTS010 denovoSkin (detected)
Due: Friday, Feb 7
Priority: High
Status: Todo
Source: email

Action items:
• Review deliverable draft
• Send feedback to Ben

Task synced to Notion.
```

---

### From Meetings (Automatic)

After meeting transcription and extraction:

**Telegram Notification:**

```
📹 Meeting processed: DenovoSkin Q4 Review

3 action items extracted:

1. Review deliverable draft
   Assignee: Oscar Wright
   Deadline: Friday
   Context: Must review before sending to client

2. Finalize data analysis section
   Assignee: Sarah Johnson
   Deadline: Wednesday

3. Schedule follow-up meeting
   Assignee: Ben Wilding
   Deadline: Next week

Reply with numbers to create tasks:
• "1 3" to create items 1 and 3
• "all" to create all
• "skip" to dismiss
```

**Reply to confirm:**

```
You: 1

Kay: ✅ Created 1 task:
• Review deliverable draft (due Friday)

Task linked to meeting: DenovoSkin Q4 Review (Feb 4, 2026)
```

---

## Viewing Tasks

### Quick Queries (Telegram)

**Today's tasks:**

```
You: What tasks do I have today?

Kay: You have 3 tasks due today:

1. Review denovoSkin deliverable (High)
   Project: CTS010
   Due: Today 5:00 PM

2. Call dentist (Medium)
   Due: Today

3. Update project timeline (High)
   Project: SOBI036
   Due: Today
```

**By Status:**

```
You: Show in progress tasks

Kay: Tasks in progress (2):

1. Draft Q4 report
   Project: CTS010
   Started: Feb 3
   Due: Friday

2. Budget analysis
   Project: SOBI036
   Started: Feb 1
   Due: Next week
```

**By Priority:**

```
You: Show high priority tasks

Kay: High priority tasks (5):

1. Review deliverable (due today)
2. Client presentation (due Thursday)
3. Budget finalization (due Friday)
4. Data validation (due Monday)
5. Stakeholder meeting prep (due next week)
```

**By Project:**

```
You: Show CTS010 tasks

Kay: CTS010 denovoSkin tasks (7):

**Due today:**
1. Review deliverable (High)

**This week:**
2. Finalize data tables (High - Wed)
3. Update budget section (Medium - Thu)

**Upcoming:**
4. Client presentation prep (High - next week)
5. Archive project files (Low - Feb 28)

**Overdue:**
6. None

**In Progress:**
7. Draft Q4 report (started Feb 3)
```

---

### Advanced Queries (LibreChat)

**Filtered Search:**

```
You: Show high-priority work tasks due this week

Kay: [Calls query_tasks with filters]

High-priority work tasks due this week (4):

1. **Review denovoSkin deliverable**
   Project: CTS010
   Due: Friday, Feb 7 at 5:00 PM
   Status: Todo
   Notes: Must review before client submission

2. **SOBI036 stakeholder presentation**
   Project: SOBI036
   Due: Thursday, Feb 6
   Status: In Progress
   Started: Feb 3

3. **Finalize Q4 budget**
   Project: CTS010
   Due: Friday, Feb 7
   Status: Todo

4. **Client feedback integration**
   Project: MDC014
   Due: Saturday, Feb 8
   Status: Todo
   Priority: High

Total: 4 tasks
Estimated time: ~8 hours
```

---

### In Notion

1. Open "Tasks" database
2. Use filters:
   - Status = Todo
   - Due Date = This Week
   - Priority = High
3. Sort by Due Date
4. Group by Project

**Views:**
- **My Tasks:** Your assigned tasks
- **By Project:** Grouped by project
- **By Priority:** High → Low
- **This Week:** Due in next 7 days
- **Overdue:** Past due date

---

## Updating Tasks

### Mark as Done (Telegram)

**By Number:**

```
You: Mark task 1 as done

Kay: ✅ Marked "Review denovoSkin deliverable" as done.
Completed at 3:47 PM.

Great work! 🎉
```

**By Name:**

```
You: Mark call dentist as done

Kay: [Finds "Call dentist" task]
✅ Marked as done.
Completed at 11:30 AM.
```

**Context Reference:**

After creating/viewing a task:

```
You: What tasks do I have?

Kay: You have 3 tasks:
1. Review deliverable
2. Call dentist
3. Update timeline

You: Mark 2 as done

Kay: ✅ Marked "Call dentist" as done.
```

---

### Change Due Date (Telegram)

```
You: Move deliverable review to Monday

Kay: [Finds "Review deliverable" task]
✅ Updated due date to Monday, Feb 10.

Updated task calendar event as well.
```

---

### Change Priority (Telegram)

```
You: Make budget task high priority

Kay: [Finds "Finalize budget" task]
✅ Changed priority to High.
```

---

### Update Status (Any Interface)

**Telegram:**

```
You: Start working on deliverable review

Kay: ✅ Updated "Review deliverable" status to In Progress.
Started at 2:15 PM.
```

**LibreChat:**

```
You: Update task "Draft report" to in progress

Kay: [Calls update_task]
✅ Task updated successfully

Status: Todo → In Progress
Started: Feb 4, 2026 at 2:15 PM
```

**Notion:**

1. Open task page
2. Change Status property: Todo → In Progress
3. Save (auto-syncs to PAI)

---

### Add Notes (LibreChat or Notion)

**LibreChat:**

```
You: Add note to deliverable task: Client wants sensitivity analysis included

Kay: ✅ Added note to "Review deliverable"

Notes now read:
"Must review before client submission.
Client wants sensitivity analysis included."
```

**Notion:**

1. Open task page
2. Click in "Notes" field
3. Type additional information
4. Save (auto-syncs)

---

### Cancel Task (Any Interface)

**Telegram:**

```
You: Cancel dentist task, already rescheduled

Kay: ✅ Cancelled "Call dentist"
Reason: Already rescheduled
Cancelled at 11:35 AM
```

**LibreChat/Notion:**

Change Status to "Cancelled"

---

## Task Properties

### Title

**Requirements:**
- Clear, actionable description
- Should start with verb (Review, Finalize, Call, etc.)
- Specific enough to remember later

**Good Examples:**
- ✅ "Review denovoSkin Q4 deliverable draft"
- ✅ "Call dentist to reschedule appointment"
- ✅ "Finalize budget analysis with sensitivity scenarios"

**Bad Examples:**
- ❌ "Deliverable" (not actionable)
- ❌ "Thing to do" (too vague)
- ❌ "Work stuff" (not specific)

---

### Status

**Options:**
- **Todo:** Not started
- **In Progress:** Currently working on
- **Done:** Completed
- **Cancelled:** No longer needed

**Transitions:**

```
Todo → In Progress → Done
  ↓         ↓
Cancelled ←──────────
```

**When to Use Each:**
- **Todo:** Default for new tasks
- **In Progress:** When you start working (helps track WIP)
- **Done:** When finished (required for completion tracking)
- **Cancelled:** When no longer relevant (not deleted, preserved in history)

---

### Priority

**Levels:**
- **Critical:** Blocking others, time-sensitive, high-stakes
- **High:** Important, deadline approaching
- **Medium:** Normal tasks (default)
- **Low:** Nice-to-have, no urgency

**Guidelines:**

**Critical:**
- Client deliverables due today
- System outages
- Blocking team members

**High:**
- Tasks due this week
- Important meetings
- Key stakeholder requests

**Medium:**
- Regular work tasks
- Routine maintenance
- General improvements

**Low:**
- Future planning
- Nice-to-have improvements
- Non-urgent research

**Avoid over-using Critical/High** (makes prioritization meaningless)

---

### Due Date

**Format:** Date only (no time by default)

**Special Values:**
- Today
- Tomorrow
- Next [day of week]
- [Date] (Feb 7, 2026-02-07, etc.)

**Calendar Integration:**

If task has due date:
- Calendar event created automatically
- Title: "[Task] Task Name"
- Time: All-day event
- Calendar: Personal

**Example:**

Task: "Review deliverable" (due Friday Feb 7)
→ Creates calendar event: "[Task] Review deliverable" (Feb 7, all-day)

**With Specific Time:**

```
You: Add task review deliverable by Friday 5pm

Kay: ✅ Created task: Review deliverable
Due: Friday, Feb 7 at 5:00 PM

Calendar event created:
"[Task] Review deliverable"
Feb 7, 5:00 PM - 6:00 PM (1 hour)
```

---

### Project

**Format:** Link to project page (Notion) or UUID (database)

**Auto-Detection:**

Kay attempts to detect project from:
- Task title (mentions CTS010, SOBI036, etc.)
- Context (if you're discussing a project)
- Source (email/meeting linked to project)

**Example:**

```
You: Add task update CTS010 timeline

Kay: ✅ Created task: Update CTS010 timeline

Project: CTS010 denovoSkin (auto-detected)
Due: Not set
Priority: Medium
```

**Manual Assignment:**

```
You: Add task review budget for SOBI036

Kay: ✅ Created task: Review budget

Project: SOBI036 Anakinra (auto-detected from title)
```

---

### Tags

**Format:** Multiple tags from tags database

**Common Tags:**
- Work areas: Work, Personal
- Activity types: Analysis, Writing, Meeting, Admin
- Urgency: Urgent, Routine

**Usage:**

Tasks inherit tags from linked project, or set manually in Notion.

---

### Notes

**Format:** Free-form text (markdown supported in Notion)

**What to Include:**
- Context: Why this task exists
- Details: Specific requirements
- Links: Related documents/emails
- Constraints: Dependencies, blockers

**Example:**

```
Notes:
Must review before client submission on Friday.

Key areas to check:
- Cost-effectiveness analysis methodology
- Budget impact calculations
- Sensitivity analysis scenarios

Client specifically asked for comparison with standard care.

Related documents:
- CTS010_Deliverable_Draft.pdf
- Client_Feedback_Feb1.docx
```

---

## Task Sources

### Manual

**Created by:** User directly (Telegram, LibreChat, Notion)
**Characteristics:**
- No linked email or meeting
- User-initiated
- Full control over all properties

---

### Email

**Created by:** Email action item extraction
**Characteristics:**
- `source = 'email'`
- Linked to email record (can view original email)
- Often includes sender context in notes

**Example Notes:**

```
From email: Ben Wilding <ben@cogentia.co.uk>
Subject: DenovoSkin deliverable review
Date: Feb 4, 2026 10:30 AM

Action items:
• Review deliverable draft
• Send feedback to Ben by Friday
```

---

### Meeting

**Created by:** Meeting transcript extraction
**Characteristics:**
- `source = 'meeting'`
- Linked to meeting record (can view transcript)
- Includes meeting context and assignee

**Example Notes:**

```
From meeting: DenovoSkin Q4 Review
Date: Feb 4, 2026 10:00 AM
Attendees: Ben Wilding, Sarah Johnson, Oscar Wright

Context:
Ben asked Oscar to review deliverable draft before client submission.
Deadline: Friday (Feb 7)
Dependencies: Sarah to finalize data tables by Wednesday
```

---

### Telegram

**Created by:** Via Telegram interface
**Characteristics:**
- `source = 'telegram'`
- Often quick captures
- May lack detailed notes

---

## Best Practices

### Creating Tasks

**DO:**
- ✅ Use clear, actionable titles
- ✅ Set realistic due dates
- ✅ Link to projects when possible
- ✅ Add context in notes
- ✅ Set appropriate priority

**DON'T:**
- ❌ Create vague tasks ("Do stuff")
- ❌ Set due dates you won't meet (trains brain to ignore)
- ❌ Over-use High/Critical priority
- ❌ Create duplicates (check first)

---

### Managing Tasks

**DO:**
- ✅ Review tasks daily (morning routine)
- ✅ Update status as you work (Todo → In Progress → Done)
- ✅ Mark done immediately upon completion
- ✅ Cancel tasks that become irrelevant
- ✅ Use notes to track progress

**DON'T:**
- ❌ Let tasks pile up in Todo
- ❌ Ignore overdue tasks
- ❌ Create subtasks in different systems (keep in one place)
- ❌ Delete tasks (cancel instead, preserves history)

---

### Prioritization

**Eisenhower Matrix:**

| Urgent | Not Urgent |
|--------|------------|
| **Important:** Do First (High/Critical) | **Important:** Schedule (High/Medium) |
| **Not Important:** Delegate or Quick Wins (Medium) | **Not Important:** Drop or Later (Low) |

**Daily Priority:**

1. Critical tasks (blocking others)
2. High priority tasks due today
3. High priority tasks due this week
4. In Progress tasks (finish what you started)
5. Medium priority tasks
6. Low priority tasks (if time allows)

---

## Advanced Workflows

### Recurring Tasks

**Current:** Not supported natively

**Workaround:**

1. Create template task in Notion
2. Duplicate each week/month
3. Update due dates

**Future Enhancement:** Recurrence rules (tracked in system_upgrades)

---

### Task Dependencies

**Current:** Not supported natively

**Workaround:**

1. Use notes to document dependencies
   ```
   Notes:
   Depends on: Sarah finishes data analysis (Task #234)
   Blocks: Client presentation prep (Task #567)
   ```

2. Check dependencies before starting
3. Use status "Blocked" (set in notes)

---

### Bulk Operations

**LibreChat:**

```
You: Mark all CTS010 tasks as high priority

Kay: [Queries CTS010 tasks, updates each]

✅ Updated 7 CTS010 tasks to High priority:
1. Review deliverable
2. Finalize data tables
3. Update budget section
4. Client presentation prep
5. Archive project files
6. Budget reconciliation
7. Final submission

All tasks updated in database and will sync to Notion.
```

---

### Task Templates

**Notion:**

Create template tasks for common workflows:

**Example: "New Work Project" Template**

Tasks automatically created:
1. Project kickoff meeting
2. Review client requirements
3. Create project plan
4. Set up folder structure
5. Schedule regular check-ins
6. Deliver first draft
7. Incorporate feedback
8. Final submission
9. Archive project

**Usage:**

1. Create tasks from template
2. Update due dates
3. Link to new project

---

## Related Documentation

- [Daily Workflow](./daily-workflow.md) - How tasks fit into daily routine
- [Notion Sync](../02-capabilities/notion-sync.md) - How task sync works
- [Telegram Bot](../02-capabilities/telegram-bot.md) - Mobile task management
- [LibreChat](../02-capabilities/librechat.md) - Desktop task management
- [Database Schema](../04-development/database-schema.md) - Tasks table structure
