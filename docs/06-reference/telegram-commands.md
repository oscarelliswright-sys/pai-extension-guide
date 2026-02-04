# Telegram Bot Commands Reference

**Bot Username:** @oscar_KAY_bot
**URL:** https://t.me/oscar_KAY_bot
**Model:** Claude Sonnet 4 (via OpenRouter)
**Last Updated:** February 4, 2026

---

## Quick Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `/help` | Show available commands | `/help` |
| `/clear` | Clear conversation history | `/clear` |
| `/tasks` | View pending task confirmations | `/tasks` |
| `/changes` | View system upgrades & fixes | `/changes` |
| `/costs` | AI spend breakdown | `/costs` |
| `/feedback <text>` | Report system issue | `/feedback Bot not responding` |
| `/analyze` | Analyze bot logs | `/analyze` |
| `/logs` | Show activity statistics | `/logs` |

---

## Core Commands

### /help

**Purpose:** Show bot capabilities and command list

**Usage:**
```
/help
```

**Response:**
```
I can help you with:

*Tasks*
• "What tasks do I have today?"
• "Add task: call mum tomorrow"
• "Mark task 1 as done"

*Calendar*
• "What's on my calendar?"
• "Schedule meeting with Sarah Friday 1pm"

*Files*
• Send me any file to save to Inbox
• "Find documents about cost effectiveness"

*Notes & Goals*
• "Create note: Meeting summary..."
• "Update goal progress to 75%"

*Commands*
• /clear - Clear conversation history
• /tasks - View pending email task confirmations
• /changes - View system upgrades & fixes
• /costs - AI spend breakdown
• /feedback - Report system issues
```

---

### /clear

**Purpose:** Clear conversation history (fresh start)

**Usage:**
```
/clear
```

**Response:**
```
✅ Conversation history cleared.

You can start a fresh conversation now.
```

**When to Use:**
- Starting new topic unrelated to previous conversation
- Bot seems confused by past context
- Context getting too long (>10 messages)

**Note:** Clears chat history only, not system state (tasks, files, etc.)

---

### /tasks

**Purpose:** View pending email task confirmations

**Usage:**
```
/tasks
```

**Response:**
```
Pending task confirmations (2):

1. [Email from Ben Wilding - Feb 4]
   "Review denovoSkin deliverable by Friday"

   Action items:
   • Review deliverable draft
   • Send feedback to Ben

   Deadline: Friday, Feb 7

   [✅ Approve] [❌ Skip]

2. [Email from Sarah Johnson - Feb 3]
   "Finalize data analysis section"

   Deadline: Wednesday, Feb 5

   [✅ Approve] [❌ Skip]

Reply with numbers to approve (e.g., "1" or "approve 1")
```

**Actions:**
- Reply "1" or "approve 1" to create task
- Reply "skip 2" to dismiss
- Reply "approve all" to create all tasks

---

### /changes

**Purpose:** View active system upgrades and fixes

**Usage:**
```
/changes
```

**Response:**
```
*System Upgrades (3 active)*

🔴 *LLM models auto-update*
   Status: Planned
   Priority: High
   Category: Database

🟡 *Word document table support*
   Status: In Progress
   Priority: Medium
   Category: Document Generation

🟢 *Meeting recording improvements*
   Status: Planned
   Priority: Low
   Category: Automation

*System Fixes (2 active)*

🔴 *Sync failure alerting*
   Status: Open
   Priority: High
   Category: Sync System

🟡 *File classification accuracy*
   Status: In Progress
   Priority: Medium
   Category: File Processing

Use /feedback to report new issues.
```

---

### /costs

**Purpose:** View AI API usage and costs

**Usage:**
```
/costs
```

**Response:**
```
*AI Spend Breakdown*

**Summary**
• Today: $0.45 (23 calls)
• Last 7 days: $3.21 (156 calls)
• This month: $12.87 (678 calls)
• Last month: $18.43

**By Automation (This Month)**
• telegram-bot: $6.54 (51%)
• file-classification: $2.38 (19%)
• email-processing: $1.95 (15%)
• meeting-transcription: $1.22 (9%)
• other: $0.78 (6%)

**By Model (This Month)**
• claude-sonnet-4: $10.23 (79%)
• gpt-4o-mini: $1.87 (15%)
• claude-3.5-haiku: $0.77 (6%)

**Trend:** Costs trending up 12% vs last month
```

**Requires:** `ai_call_log` table populated (migration 013)

---

### /feedback

**Purpose:** Report system issues or bugs

**Usage:**
```
/feedback <description>
```

**Example:**
```
/feedback Telegram bot sometimes drops messages during high usage
```

**Response:**
```
✅ Feedback submitted

Created system fix entry:
• Title: "Telegram bot sometimes drops messages during high usage"
• Status: Reported
• Priority: Medium (auto-assigned)
• Source: Telegram

This will sync to Notion within 10 minutes and Oscar will review.

Thank you for helping improve the system!
```

**Details:**
- Creates entry in `system_fixes` table
- Syncs to Notion "System Fixes" database
- Auto-assigned Medium priority (Oscar can adjust)
- Source tracked as "Telegram"

---

### /analyze

**Purpose:** Run AI analysis on bot conversation logs

**Usage:**
```
/analyze
```

**Response:**
```
🔍 Analyzing bot conversation logs...

This will take ~2-3 minutes. I'll notify you when complete.
```

**Follow-up Notification:**
```
✅ Analysis complete

**Key Findings:**
• 45 conversations analyzed (last 7 days)
• Most common topics: Tasks (32%), Files (21%), Calendar (18%)
• Average satisfaction: 4.2/5 (based on feedback)
• Identified 3 potential improvements

**Suggested System Upgrades:**
1. Add recurring task support (mentioned 8 times)
2. Improve file classification for screenshots (5 errors)
3. Add voice message search capability

Would you like me to create system upgrade entries for these?
```

**Requirements:**
- `bot_logs` table with conversation data
- `bot_analysis_runs` table for tracking runs
- Claude Sonnet 4 for analysis (via OpenRouter)

---

### /logs

**Purpose:** Show bot activity statistics

**Usage:**
```
/logs
```

**Response:**
```
*Bot Activity Statistics*

**Today**
• Messages received: 23
• Tool calls: 47
• API calls: 38
• Errors: 0

**Last 7 Days**
• Messages received: 156
• Tool calls: 312
• API calls: 287
• Errors: 2

**Most Used Tools (Last 7 Days)**
1. query_tasks (89 calls)
2. create_task (34 calls)
3. search_files (28 calls)
4. get_calendar (24 calls)
5. update_task (18 calls)

**Recent Errors**
• Feb 3, 10:30 AM: OpenRouter API timeout
• Feb 1, 3:15 PM: Database connection lost (auto-recovered)
```

---

## Natural Language Commands

### Task Management

**Create Tasks:**
```
You: Add task review deliverable by Friday

Kay: ✅ Created task: Review deliverable
Due: Friday, Feb 7
Priority: Medium
Status: Todo
```

**View Tasks:**
```
You: What tasks do I have today?

Kay: You have 3 tasks due today:
1. Review deliverable (High - 5:00 PM)
2. Call dentist (Medium)
3. Update timeline (High - SOBI036)
```

**Update Tasks:**
```
You: Mark task 1 as done

Kay: ✅ Marked "Review deliverable" as done.
Completed at 3:47 PM.
```

---

### Calendar

**View Calendar:**
```
You: What's on my calendar tomorrow?

Kay: Tomorrow (Wednesday, Feb 5):

9:00 AM - Team Standup (15 min)
2:00 PM - Client Call (30 min)
4:00 PM - Project Review (1 hour)
```

**Create Events:**
```
You: Schedule meeting with Sarah Friday 1pm

Kay: ✅ Created calendar event:
Meeting with Sarah
Friday, Feb 7 at 1:00 PM
Duration: 1 hour
Calendar: Personal
```

---

### File Management

**Save Files:**
```
[You forward proposal_draft.pdf to Kay]

Kay: 📄 New file received: proposal_draft.pdf

Reply with a hint to help me classify it:
• Project code (e.g., "CTS010")
• Category (e.g., "Health", "Travel")

You: CTS010 deliverables

Kay: ✅ Saved to:
Areas/Work/CTS010 denovoSkin/Deliverables/proposal_draft.pdf

File is now indexed and searchable.
```

**Search Files:**
```
You: Find CTS010 deliverable

Kay: Found 1 matching file:
📄 CTS010_Deliverable_Q4.pdf
Location: Areas/Work/CTS010 denovoSkin/Deliverables/
Modified: Feb 4, 2026

OneDrive link: [link]
```

---

### Information Lookup

**Project Status:**
```
You: What's the status of CTS010?

Kay: CTS010 denovoSkin Project:
- Status: Active - Deliverable finalization
- Due: Friday (Feb 7)
- Active Tasks: 3
- Recent Activity: Team meeting today
```

**People Lookup:**
```
You: Who is Ben Wilding?

Kay: Ben Wilding
- Role: Project Manager at Cogentia
- Email: ben@cogentia.co.uk
- Projects: CTS010 (denovoSkin), SOBI036 (Anakinra)
- Last Contact: Today (email about deliverable)
```

---

## Advanced Features

### Voice Messages

**Send voice message → Kay transcribes and responds**

```
[You send voice message: "Add task to call dentist tomorrow"]

Kay: 🎤 Transcribed: "Add task to call dentist tomorrow"

✅ Created task: Call dentist
Due: Tomorrow (Feb 5)
Priority: Medium
```

**Uses:** Groq Whisper for transcription (~5 seconds)

---

### Image Analysis

**Send image → Kay analyzes and describes**

```
[You send screenshot of email]

Kay: 📸 I see an email from Sarah Johnson.

Subject: "Data analysis complete"
Content summary: Sarah has finished the Q4 data analysis and attached results. She's asking if you can review by Wednesday.

Would you like me to:
1. Create a task to review by Wednesday?
2. Extract the email content?
3. Save the screenshot to a project folder?
```

**Uses:** GPT-4 Vision for analysis

---

### Context Memory

**Kay remembers recent conversation:**

```
You: Show my tasks

Kay: You have 3 tasks:
1. Review deliverable
2. Call dentist
3. Update timeline

You: Mark 2 as done

Kay: ✅ Marked "Call dentist" as done.
(Kay remembered which task was #2 from previous response)
```

---

### Pronoun References

**Kay understands "it", "that", "this":**

```
You: Add task review deliverable

Kay: ✅ Created task: Review deliverable

You: Move it to Friday

Kay: ✅ Updated "Review deliverable" due date to Friday.
(Kay knew "it" referred to the just-created task)
```

---

## Conversation Best Practices

### DO

**✅ Be specific:**
```
Good: "Show CTS010 tasks due this week"
Bad: "Show tasks"
```

**✅ Use natural language:**
```
Good: "Schedule meeting with Sarah Friday at 1pm"
Bad: "create_calendar_event sarah friday 1pm"
```

**✅ Provide context:**
```
Good: "Add high priority task: finalize budget for CTS010, due Friday"
Bad: "Task budget Friday"
```

**✅ Correct mistakes:**
```
You: That's the wrong project, it's SOBI036 not CTS010

Kay: ✅ Corrected. Updated to SOBI036 Anakinra.
I've learned this pattern for future.
```

---

### DON'T

**❌ Use only keywords:**
```
Bad: "task deadline friday"
Good: "Show tasks due Friday"
```

**❌ Assume Kay knows unstated context:**
```
Bad: "Update the deadline"
Good: "Update deliverable task deadline to Friday"
```

**❌ Give up after one try:**
```
Kay: I'm not sure which task you mean.

You: The deliverable review task I created yesterday

Kay: ✅ Found it: "Review deliverable". What would you like to update?
```

---

## Related Documentation

- [Telegram Bot Capabilities](../02-capabilities/telegram-bot.md) - Full feature list
- [Daily Workflow](../03-usage/daily-workflow.md) - How to use in daily routine
- [Task Management](../03-usage/task-management.md) - Task workflows
- [MCP Tools](./mcp-tools.md) - Available tool functions
