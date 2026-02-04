# Telegram Bot Capabilities

**Interface:** Mobile-first AI assistant via Telegram
**Model:** Claude Sonnet 4 (via OpenRouter)
**Bot Username:** @oscar_KAY_bot
**Status:** Production, actively used

---

## Table of Contents

1. [Overview](#overview)
2. [Commands](#commands)
3. [Natural Language Capabilities](#natural-language-capabilities)
4. [Media Processing](#media-processing)
5. [Scheduled Notifications](#scheduled-notifications)
6. [File Management](#file-management)
7. [Media & Entertainment](#media--entertainment)
8. [Configuration](#configuration)

---

## Overview

The Telegram bot is Kay's **primary mobile interface**. Unlike web UIs that require you to check them, the bot can:
- **Respond** when you ask questions
- **Notify** proactively (meetings, overdue tasks, morning summary)
- **Process** files you send (voice, images, documents)
- **Remember** context across conversations

### Key Features
- **Context-aware:** Knows your tasks, projects, calendar, files
- **Proactive:** Sends scheduled notifications without prompting
- **Multi-modal:** Text, voice, images, documents
- **Real-time:** File inbox watching, immediate responses
- **Persistent:** Conversation history stored, context maintained

### Architecture
- **Deployment:** VPS (Hostinger), direct process (PID 116532)
- **Code:** `/home/ubuntu/.claude/tools/telegram/`
- **Entry:** `bun run telegram/index.ts --vps`
- **Database:** PostgreSQL (conversation logs, notifications, pending items)
- **Components:**
  - `agent.ts` - Message processing, Claude integration
  - `scheduler.ts` - Proactive notifications
  - `inbox-watcher.ts` - Real-time file monitoring
  - `processors/` - Voice, image, file handlers
  - `tools.ts` - Database query functions

---

## Commands

### /help
**Shows available commands and capabilities**

```
I can help you with:

*Tasks*
• "What tasks do I have today?"
• "Add task: call mum tomorrow"
• "What's overdue?"

*Calendar*
• "What's on my calendar?"
• "Schedule lunch with Sarah Friday 1pm"

*People*
• "Who is John Smith?"
• "Add contact: Jane Doe, friend"

*Files*
• "Find documents about cost effectiveness"
• "Search for SOBI presentations"
• Send me any file to save to Inbox

*Notes & Goals*
• "What are my goals?"
• "Create note: Meeting summary..."

*Commands*
• /clear - Clear conversation history
• /help - Show this help
• /tasks - View pending email task confirmations
• /changes - View system upgrades & fixes
• /costs - AI spend breakdown
• /feedback <text> - Report a system fix/issue
• /analyze - Run AI analysis on bot logs
• /logs - Show activity statistics

I also understand voice messages and can analyze images!
```

### /clear
**Clears conversation history**

Use when:
- Starting a fresh topic
- Context is getting too long
- Bot seems confused by previous context

**Note:** System context (tasks, projects, files) is NOT cleared, only conversational history.

### /tasks
**Shows pending email task confirmations**

When emails are classified as "actionable", Kay asks via Telegram if you want to create tasks. This command shows all pending confirmations.

**Example output:**
```
Pending task confirmations (3):

1. [Email from Client X]
   "Review Q1 proposal"
   Options: ✅ Create task | ❌ Skip

2. [Email from Manager Y]
   "Update project timeline"
   Options: ✅ Create task | ❌ Skip
```

**Usage:**
- Reply with number to approve: "1" or "yes to 1"
- Reply with "skip 2" to reject

### /changes
**Shows active system upgrades and fixes**

Displays:
- Active feature requests (system_upgrades table)
- Open bug reports (system_fixes table)
- Priority and status for each

**Example output:**
```
*System Upgrades (3)*

🔴 *LLM models auto-update*
   Database | Planned

🟡 *Word document table support*
   Document Generation | In Progress

🟢 *Meeting recording improvements*
   Automation | Planned

*System Fixes (2)*

🔴 *Sync failure alerting*
   Sync System | Open

🟡 *File classification accuracy*
   File Processing | In Progress
```

**Related:** Use `/feedback <text>` to add new fixes

### /costs
**AI spend breakdown**

Shows LLM API usage and costs:
- Today, last 7 days, this month, last month
- Per-automation breakdown (which systems use most AI)
- Per-model breakdown (which models cost most)

**Example output:**
```
*AI Spend Breakdown*

Today: $0.45 (23 calls)
Last 7 days: $3.21 (156 calls)
This month: $12.87 (678 calls)
Last month: $18.43

*By Automation (This Month)*
• telegram-bot: $6.54 (51%)
• file-classification: $2.38 (19%)
• email-processing: $1.95 (15%)
• meeting-transcription: $1.22 (9%)

*By Model (This Month)*
• claude-sonnet-4-5: $10.23 (79%)
• gpt-4o: $1.87 (15%)
• claude-3.5-haiku: $0.77 (6%)
```

**Requirements:**
- `ai_call_log` table exists (migration 013)
- OpenRouter Broadcast configured

### /feedback <text>
**Report system issues or feature requests**

Creates entry in `system_fixes` table, syncs to Notion.

**Usage:**
```
/feedback Telegram bot sometimes drops messages

/feedback Add ability to search emails by sender

/feedback File classification thinks work PDFs are personal
```

**What happens:**
1. Entry created in PostgreSQL `system_fixes`
2. Next sync (within 10 min) creates Notion page
3. Kay tracks and can reference in future conversations

**Alternatives:**
- Natural language: "I have a system issue - [description]"
- Notion: Manually create page in System Fixes database

### /analyze
**Runs AI analysis on bot logs**

Uses Claude to analyze recent errors, performance issues, and usage patterns.

**Example output:**
```
*Analysis Results (Last 24h)*

*Patterns Detected:*
• Voice transcription failures spike during evening hours (possible network issues)
• File classification accuracy drops for scanned PDFs (text extraction quality)
• Meeting reminders occasionally send 2x (timing race condition)

*Recommendations:*
1. Add retry logic for voice transcription
2. Improve OCR preprocessing for scanned docs
3. Add duplicate notification detection

*Health: 94/100*
```

**Use when:**
- Bot behaving strangely
- Want to understand usage patterns
- Investigating errors

### /logs
**Shows activity statistics**

Quick stats on errors and performance (last 24 hours).

**Example output:**
```
*Bot Activity (Last 24h)*

❌ Errors: 3
   • network_timeout: 2
   • llm_rate_limit: 1

⏱️ Avg response: 1,234ms

*Slowest Operations:*
   • file_classification: 4,521ms (12x)
   • rag_search: 2,187ms (8x)
   • voice_transcription: 3,905ms (5x)

_Use /analyze to run AI analysis._
```

---

## Natural Language Capabilities

The bot understands natural language for common operations. No specific commands required.

### Task Management

**Querying tasks:**
```
"What tasks do I have today?"
"Show me high priority tasks"
"What's overdue?"
"Which tasks are assigned to Project X?"
```

**Creating tasks:**
```
"Add task: call mum tomorrow"
"Create high priority task for Friday: review proposal"
"New task in Revenue Growth project: update forecast"
```

**Updating tasks:**
```
"Mark task 1 done"
"Move task 2 to next week"
"Change priority of task 3 to high"
"Assign task 4 to BIM project"
```

**How it works:**
1. Bot queries PostgreSQL `tasks` table
2. Returns results with numbered list
3. User can reference by number ("mark 2 done")
4. Updates PostgreSQL with flag `sql_local_last_edited_at`
5. Next sync (within 10 min) updates Notion

### Calendar Management

**Querying calendar:**
```
"What's on my calendar today?"
"Do I have meetings tomorrow?"
"When is my next meeting?"
"Show calendar for Friday"
```

**Creating events:**
```
"Schedule lunch with Sarah Friday 1pm"
"Add meeting tomorrow 10am: project review"
"Block 2-3pm Thursday for focus time"
```

**How it works:**
1. Bot queries PostgreSQL `calendar_events` table
2. For creation: inserts into database with flag
3. Next sync (within 10 min) creates Google Calendar event
4. Event ID updated in database

### People Management

**Querying people:**
```
"Who is John Smith?"
"Show me people in the Clients category"
"What's Sarah's email?"
```

**Adding contacts:**
```
"Add contact: Jane Doe, friend, jane@example.com"
"New person: Dr. Smith, doctor, specialty: cardiology"
```

**How it works:**
1. Bot queries PostgreSQL `people` table
2. Returns person details, recent interactions
3. Can create new entries, syncs to Notion

### File Search (RAG)

**Semantic search across all indexed files:**
```
"Find documents about cost effectiveness"
"Search for SOBI presentations"
"What did we say about pricing in the BIM proposal?"
"Show me recent files about revenue"
```

**How it works:**
1. Query converted to embedding (OpenAI text-embedding-3-small)
2. Vector similarity search in `file_chunks` table
3. Returns top matches with context
4. Can retrieve full file if needed

**Indexed files:**
- All files in Nextcloud (scanned, processed, chunked)
- PDFs, DOCX, XLSX, PPTX, TXT, MD, code files
- 73 files, 2,908 chunks, 97.5% embedded (as of Feb 2026)

### Notes & Goals

**Notes:**
```
"Create note: Meeting summary - Client X wants proposal by Friday"
"Show notes about Project Y"
"What notes do I have from last week?"
```

**Goals:**
```
"What are my goals?"
"Add goal: Launch new product by Q2"
"Show progress on Revenue Growth goal"
```

### Projects

**Querying:**
```
"What's the status of the BIM project?"
"Show all active projects"
"Which projects have overdue tasks?"
```

**Project includes:**
- Linked tasks
- Associated files
- Related notes
- Recent activity

---

## Media Processing

### Voice Messages

**Send voice message → receive text transcription**

**Process:**
1. User sends voice message via Telegram
2. Bot downloads audio file
3. Transcription via Groq Whisper
4. Text returned to user
5. Original audio saved to Nextcloud Inbox (optional)

**Usage:**
- Quick note-taking while driving
- Meeting thoughts to transcribe later
- Dictate tasks without typing

**Example:**
```
[User sends 30-second voice memo]

Kay: "Here's the transcription:

'Need to call mum tomorrow to discuss Christmas plans.
Also remind John about the proposal deadline on Friday.
Check if Sarah can join the meeting next Tuesday at 3pm.'

Would you like me to create tasks from this?"

User: "Yes"

Kay: "Created 3 tasks:
1. Call mum - Due tomorrow
2. Remind John about proposal - Due Friday
3. Check Sarah's availability - Due Tuesday"
```

**Limitations:**
- Max audio length: 10 minutes (API limit)
- Accuracy depends on audio quality and accent
- Background noise reduces accuracy

### Image Analysis

**Send image → receive analysis/extraction**

**Supported:**
- Screenshots (Teams meetings, documents, dashboards)
- Whiteboard photos (notes, diagrams)
- Documents (invoices, receipts, forms)
- Charts/graphs (extract data)
- UI mockups (describe elements)

**Process:**
1. User sends image
2. Bot downloads and passes to Claude (vision)
3. Analysis returned (depends on context)
4. Image saved to Nextcloud Inbox

**Example use cases:**

**Screenshot analysis:**
```
[User sends screenshot of Excel chart]

User: "What's the trend here?"

Kay: "This shows revenue growth over Q3-Q4:
- Q3: $1.2M (flat compared to Q2)
- Q4: $1.8M (50% increase)
- December spike driven by holiday sales
- Trend suggests strong Q1 if momentum continues"
```

**Whiteboard capture:**
```
[User sends photo of meeting whiteboard]

User: "Extract action items"

Kay: "From the whiteboard:

Action Items:
1. John - Draft proposal (by Friday)
2. Sarah - Review budget (by Wednesday)
3. Team - Client presentation (next Monday 10am)

Would you like me to create tasks for these?"
```

**Receipt/invoice:**
```
[User sends photo of receipt]

User: "Save this"

Kay: "Receipt saved to Inbox/Receipts/

Details extracted:
- Vendor: Office Supplies Ltd
- Amount: £47.82
- Date: 2026-02-03
- Items: Paper, pens, folders

Create expense record?"
```

**Limitations:**
- Image resolution affects accuracy
- Handwriting recognition varies
- Complex layouts may need clarification

### Document Processing

**Send document → automatic classification and storage**

**Supported formats:**
- PDF, DOCX, XLSX, PPTX
- TXT, MD, CSV
- Images (JPG, PNG)
- Audio (voice messages)

**Process:**
1. User sends file to Telegram
2. Bot asks for hint (project assignment, optional)
3. File saved to Nextcloud Inbox
4. Processing pipeline triggered:
   - Text extraction (Dockling for PDFs/DOCX)
   - Classification (work vs personal, project matching)
   - Move to appropriate PARA folder
   - Chunking and embedding
5. File indexed and searchable

**Example:**
```
[User sends "Q1-Report.pdf"]

Kay: "New file detected: Q1-Report.pdf

Which project is this for? (or 'skip' for no project)"

User: "Revenue Growth"

Kay: "Got it. Processing...

✓ Moved to Projects/Revenue Growth/
✓ Text extracted (47 pages)
✓ Chunked and indexed
✓ Now searchable

You can ask: 'What were our Q1 revenue numbers?'"
```

**File hints:**
- Project name: "Revenue Growth project"
- PARA category: "Work/Reports"
- Subfolder: "Revenue Growth/Reports/Q1"
- Skip classification: "skip" or "inbox" (stays in Inbox)

**What happens without hint:**
- LLM classifies based on content
- High confidence: Automatic placement
- Low confidence: Ask for confirmation later

---

## Scheduled Notifications

Kay sends proactive notifications based on your schedule and tasks. All configurable.

### Morning Summary (8:00 AM)

**Sent:** Every weekday at 8 AM
**Contains:**
- Overdue tasks (if any)
- Calendar events for today
- Tasks due today
- Priority indicators

**Example:**
```
*Good morning! Here's your day:*

*⚠️ Overdue* (2 tasks)
1. 🔴Call mum (due Feb 2)
2. 🟡Review proposal (due Feb 3)

*Calendar* (3 events)
• 09:00 - Team standup
• 11:30 - Client presentation
• 14:00 - Project review

*Tasks* (4 due today)
3. 🔴Finish BIM slides
4. Send invoice to Client X
5. 🟡Update project timeline
6. Call supplier

Shall we review tasks?
```

**Task context included:**
- Can reply "mark 1 done" to complete overdue task
- "Move 2 to tomorrow" to reschedule
- Context preserved for follow-up actions

**Configuration:**
- Enable/disable: Notification settings (database)
- Time: Hardcoded 8 AM (configurable in code)
- Content: Automatically adapts based on what you have

### Overdue Tasks Alert (9:00 AM)

**Sent:** Daily at 9 AM (if you have overdue tasks)
**Skipped:** If no overdue tasks

**Example:**
```
*You have 3 overdue tasks*

1. 🔴Call mum (due Feb 2)
2. 🟡Review proposal (due Feb 3)
3. Send contract (due Jan 30)

Reply to update (e.g. "mark 1 done", "move 2 to tomorrow")
```

**De-duplication:**
- Won't send if already sent today
- Separate from morning summary (different time, different focus)

### Afternoon High Priority Reminder (2:00 PM)

**Sent:** Weekdays at 2 PM (only if you have high priority overdue tasks)
**Purpose:** Midday nudge for urgent items

**Example:**
```
*🔴 2 high priority tasks still overdue*

1. Finish BIM slides (due yesterday)
2. Client presentation prep (due Feb 2)

Reply to update (e.g. "mark 1 done", "move 2 to Friday")
```

**Why separate from morning alert:**
- Morning alert shows ALL overdue
- Afternoon focuses on HIGH PRIORITY only
- Gives you chance to clear them during morning

### Meeting Reminders (15 min & 5 min before)

**Sent:** 15 minutes and 5 minutes before each calendar event
**Skipped:** If event doesn't have start time (all-day events)

**Example (15 min):**
```
*15 minutes until your meeting*

*Client Presentation*
Time: 11:30
Location: Conference Room B

[Join Meeting](https://teams.microsoft.com/l/...)
```

**Example (5 min):**
```
*5 minutes until your meeting*

*Client Presentation*
Time: 11:30

[Join Meeting](https://teams.microsoft.com/l/...)
```

**Meeting link extraction:**
- Google Meet: `hangoutLink` field
- Teams/Zoom: Extracts from description
- No link: Shows location only

**Configuration:**
- Calendar event exclusion filtering available
- Can disable meeting reminders entirely

### Email Task Confirmations (Real-time)

**Sent:** When actionable email is classified
**Purpose:** Confirm task creation from email

**Example:**
```
*New actionable email*

From: client@example.com
Subject: "Q1 proposal review needed"

Suggested task:
"Review Q1 proposal for Client X"
Due: This Friday

Create task? (yes/no)
```

**User replies:**
- "yes" → Task created in database, syncs to Notion
- "no" → Email classified but no task
- Ignore → Pending in `/tasks` command

**Confirmation required because:**
- Avoids task spam from every email
- Lets you decide priority and wording
- Can batch-process multiple emails

### File Expiry Warnings (Daily check)

**Sent:** When pending files haven't been processed in 7+ days
**Purpose:** Remind about unprocessed Inbox files

**Example:**
```
*3 files in Inbox for 7+ days*

1. Q4-Budget.xlsx (added Feb 1)
2. Meeting-Notes.pdf (added Jan 28)
3. Contract-Draft.docx (added Jan 25)

Process these files?
```

**Why expiry warnings:**
- Inbox meant to be temporary
- Files should be classified and moved to Projects/Areas/Resources
- 7-day threshold prevents notification spam

---

## File Management

### Real-time Inbox Watching

**Process monitoring Nextcloud Inbox for new files**

**How it works:**
1. `inbox-watcher.ts` uses chokidar to watch `/opt/nextcloud/files/oscar/files/Inbox/`
2. New file detected → notification sent immediately
3. User provides hint (optional)
4. File queued for processing in `pending_files` table
5. Processing pipeline runs:
   - Text extraction
   - Classification
   - Move to destination
   - Chunking & embedding

**Why real-time:**
- Faster than waiting for scheduled scan
- User can provide hint while file is fresh in mind
- Immediate feedback ("file received and queued")

**Deduplication:**
- Checks for existing file before notification
- Won't ask about files you've already processed
- Handles file renames gracefully

### File Hints

**User-provided context to improve classification**

**Types of hints:**

**Project assignment:**
```
"Revenue Growth project"
"denovoSkin BIM"
```
→ File moved to `Projects/Revenue Growth/` or `Projects/denovoSkin BIM/`

**PARA category:**
```
"Work/Reports"
"Personal/Health"
"Resources/Templates"
```
→ File moved to specified PARA category

**Subfolder override:**
```
"Revenue Growth/Q1 Reports"
"Work/Clients/SOBI"
```
→ File moved to specific subfolder

**Skip classification:**
```
"skip"
"inbox"
"leave it"
```
→ File stays in Inbox (for manual processing later)

**Hint application:**
- Bypasses LLM classification (faster, more accurate)
- Direct file move to specified location
- Still chunked and embedded for search

### File Processing Pipeline

**Multi-stage processing for all files**

**Stage 1: Text Extraction**
- **PDFs/DOCX:** Dockling (Modal serverless)
- **Images:** OCR (if needed)
- **Text files:** Direct read
- **Excel/CSV:** Table extraction
- **PowerPoint:** Slide text extraction

**Stage 2: Classification**
- **Work vs Personal:** Content analysis
- **Project matching:** Keyword/context matching against active projects
- **PARA category:** Projects, Areas, Resources, or Archive
- **Confidence scoring:** High confidence → auto-move, Low confidence → ask

**Stage 3: File Movement**
- Move from Inbox to destination folder
- Nextcloud files:scan to make visible
- Update `files` table with new path

**Stage 4: Chunking**
- **Hierarchical chunking:**
  - Document level (full file)
  - Section level (headings, pages)
  - Paragraph level (semantic chunks)
- Overlap between chunks for context

**Stage 5: Embedding**
- Generate embeddings (OpenAI text-embedding-3-small)
- Store in `file_chunks` table with pgvector
- Ready for semantic search

**Timeline:**
- Text extraction: 10-60 seconds (depends on file size)
- Classification: 5-15 seconds
- Chunking & embedding: 15-30 seconds
- **Total:** 30-90 seconds per file

### File Reorganization

**Move files after initial classification**

**Usage:**
```
"Move Q1-Report.pdf to Revenue Growth project"
"Reorganize Invoice.pdf to Archive"
"Change BIM-Notes.docx to Work/Projects/BIM"
```

**How it works:**
1. Bot queries `files` table for matching file
2. Confirms file to move
3. Updates database path
4. Moves file in Nextcloud
5. Runs files:scan
6. Updates embeddings if needed

**Why reorganize:**
- Initial classification wasn't perfect
- Project assignment changed
- File belongs to different category
- Clean up Inbox periodically

---

## Media & Entertainment

### Movies & TV Shows Watchlist

**Track what you want to watch**

**Adding:**
```
"Add movie: Inception"
"Add TV show: Breaking Bad"
"Save anime: Attack on Titan"
```

**Querying:**
```
"What movies do I want to watch?"
"Show my TV watchlist"
"What anime am I tracking?"
```

**Rating:**
```
"Rate Inception 9/10"
"I watched Breaking Bad - 10/10"
```

**How it works:**
- Searches TMDB API for movie/TV metadata
- Stores in `media_watchlist` table
- Syncs to Notion (Media Watchlist database)
- Tracks: title, type, status (want to watch, watching, watched), rating, notes

**Example:**
```
User: "Add movie: The Matrix"

Kay: "Added to watchlist:

*The Matrix* (1999)
Sci-Fi, Action
Rating: 8.7/10 (TMDB)

Would you like to mark it as 'want to watch' or 'watching'?"

User: "want to watch"

Kay: "Done. You have 12 movies in your 'want to watch' list."
```

### Games Backlog

**Track games you want to play**

**RAWG API integration** for game metadata

**Adding:**
```
"Add game: Elden Ring"
"Save to backlog: Baldur's Gate 3"
```

**Querying:**
```
"What games do I want to play?"
"Show my gaming backlog"
"Which games am I currently playing?"
```

**Updating:**
```
"Mark Elden Ring as playing"
"I finished Baldur's Gate 3"
"Rate Elden Ring 10/10"
```

**How it works:**
- Searches RAWG API for game data
- Stores in `games_backlog` table
- Syncs to Notion (Games Backlog database)
- Tracks: title, platform, status (backlog, playing, completed), rating, hours played

**Example:**
```
User: "Add game: Baldur's Gate 3"

Kay: "Added to backlog:

*Baldur's Gate 3*
Platform: PC
Genre: RPG
RAWG Rating: 4.8/5

Status: Backlog
You have 23 games in backlog, 3 currently playing."
```

---

## Configuration

### Notification Settings

**Per-user configuration in database**

**Available settings:**
- `morningSummary` - Morning roundup at 8 AM
- `overdueTasks` - Overdue task alerts
- `meetingReminders` - 15min & 5min meeting reminders
- `fileExpiryWarnings` - Inbox file expiry alerts

**Changing settings:**
```
"Disable morning summary"
"Turn off meeting reminders"
"Enable overdue task alerts"
```

**Database table:** `notification_settings`
**Per-user:** Each user (chat ID) has own settings

### Conversation History

**Stored in `conversations` table**

**Includes:**
- User messages
- Bot responses
- Tool context (for numbered task references)
- Session metadata

**Clearing:** `/clear` command

**Why stored:**
- Context across conversations
- Remember previous interactions
- Task reference by number ("mark 2 done")
- Session transcripts for learning extraction

**Privacy:**
- Stored in your PostgreSQL database (Neon)
- Not shared with external services
- Can delete anytime

### Bot Logging

**Performance and error tracking**

**Logged to `bot_logs` table:**
- Message received/sent
- Tool calls (database queries)
- LLM API calls (OpenRouter)
- Performance metrics (response time)
- Errors and stack traces

**Why logged:**
- Debugging
- Performance monitoring
- Cost tracking (LLM usage)
- Usage analysis

**Commands:**
- `/logs` - Recent activity summary
- `/analyze` - AI analysis of patterns
- `/costs` - Spending breakdown

---

## Technical Details

### Deployment

**Platform:** VPS (Hostinger)
**Process:** Direct (not systemd - user services unavailable)
**PID:** 116532 (as of Feb 2026)
**Management:** Manual start/stop
**Auto-restart:** None (requires manual intervention if crash)

**Starting:**
```bash
cd /home/ubuntu/.claude/tools
bun run telegram/index.ts --vps
```

**Stopping:**
```bash
# Find PID
ps aux | grep "telegram/index.ts"

# Kill process
kill <PID>
```

**Logs:**
- Application logs: `/tmp/telegram.log` (or stdout)
- Error logs: Same location
- Bot logs: Database `bot_logs` table

### Rate Limits

**Telegram API:**
- 30 messages per second per bot
- 20 messages per minute to same user
- Bot handles rate limiting automatically

**LLM API (OpenRouter):**
- Varies by model
- Bot handles rate limit errors with retry

**Database:**
- Neon free tier: 3 GB storage, 0.25 GB egress/month
- No query rate limits in practice

### Security

**Authentication:**
- Telegram bot token (in .env, not version controlled)
- Allowed users whitelist (Telegram chat IDs)
- Unauthorized users rejected

**Data privacy:**
- All data in your PostgreSQL database
- LLM API calls include message content (necessary for processing)
- No data sold or shared

**File handling:**
- Files downloaded temporarily
- Moved to Nextcloud immediately
- Temp files cleaned up

### Performance

**Response time:**
- Simple queries (task list): 200-500ms
- LLM responses: 1-3 seconds
- File processing: 30-90 seconds
- Voice transcription: 5-15 seconds

**Concurrency:**
- Single process handles all users
- Async/await for I/O operations
- Long operations (file processing) queued

**Reliability:**
- No auto-restart (systemd unavailable)
- Manual restart required if crash
- Crash frequency: Rare (stable in production)

---

## Troubleshooting

### Bot not responding

**Check if process running:**
```bash
ps aux | grep "telegram/index.ts"
```

**If not running:**
```bash
cd /home/ubuntu/.claude/tools
bun run telegram/index.ts --vps
```

**If running but not responding:**
- Check logs for errors
- Test Telegram API connectivity
- Check database connection
- Restart bot as last resort

### Voice transcription fails

**Common causes:**
- Audio too long (>10 min)
- Poor audio quality
- Groq API rate limit

**Solutions:**
- Split long audio
- Re-record in quieter environment
- Wait and retry (if rate limited)

### File processing stuck

**Check pending files:**
Query `pending_files` table for status

**Common issues:**
- Dockling API timeout
- Large file size
- Network issues

**Solutions:**
- Manual processing: `bun run sync/files-process.ts`
- Check Modal logs for Dockling errors
- Retry processing

### Task not syncing to Notion

**Check sync status:**
- Railway sync logs
- `sync_run_history` table

**Common causes:**
- Railway sync not running
- Notion API token expired
- Network issues

**Solutions:**
- Redeploy Railway sync service
- Check Notion integration token
- Manual sync: `bun run sync/tasks-sql-to-notion.ts`

---

## Related Documentation

- [System Overview](../00-overview/system-overview.md) - How Telegram bot fits into PAI
- [Notion Sync](notion-sync.md) - How tasks/projects sync
- [File Processing](file-processing.md) - File pipeline details
- [Telegram Bot Setup](../01-setup/telegram-bot-setup.md) - Installation guide
- [Troubleshooting](../05-operations/troubleshooting.md) - General troubleshooting

---

**Last Updated:** February 4, 2026
**Bot Version:** 1.0 (production)
**Status:** Stable, actively used
