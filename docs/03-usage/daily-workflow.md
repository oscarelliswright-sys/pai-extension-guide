# Daily Workflow

**Purpose:** How to use PAI in daily work and life
**Audience:** End users (Oscar and family)
**Last Updated:** February 4, 2026

---

## Table of Contents

1. [Morning Routine](#morning-routine)
2. [During the Day](#during-the-day)
3. [End of Day](#end-of-day)
4. [Weekly Review](#weekly-review)
5. [Interface Selection Guide](#interface-selection-guide)
6. [Common Scenarios](#common-scenarios)

---

## Morning Routine

### 1. Check Morning Summary (Telegram - Automatic)

**Time:** 8:00 AM Mon-Fri (automatic notification)

Kay sends a morning summary via Telegram:

```
☀️ Good morning Oscar!

📅 Today: Tuesday, February 4, 2026

**Tasks due today (3):**
1. Review denovoSkin deliverable (High - 5:00 PM)
2. Call dentist (Medium)
3. Update project timeline (High - SOBI036)

**Meetings (2):**
• 10:00 AM - DenovoSkin Review (1 hour)
• 2:00 PM - Client Call (30 min)

**Upcoming deadlines:**
• Friday: Submit deliverable to client
• Next week: Project planning meeting
```

**Actions:**
- Review tasks and priorities
- Check calendar for conflicts
- Mentally prepare for meetings

---

### 2. Quick Task Review (Telegram or LibreChat)

**Interface:** Telegram (mobile) or LibreChat (desktop)

**Telegram:**
```
You: What tasks do I have today?

Kay: You have 3 tasks due today:

1. Review denovoSkin deliverable (High priority)
   Project: CTS010
   Due: Today 5:00 PM

2. Call dentist (Medium priority)
   Due: Today

3. Update project timeline (High priority)
   Project: SOBI036
   Due: Today
```

**LibreChat:**
- Open https://pai-api-production.up.railway.app
- Ask: "Show my tasks for today"
- Use "Task Manager" preset for quick queries

---

### 3. Prioritize Morning Work

**Best Practice:** Start with high-priority, time-sensitive tasks

**Telegram quick commands:**
```
You: Show high priority tasks

Kay: High priority tasks (5):
1. Review denovoSkin deliverable (due today 5pm)
2. Update SOBI036 timeline (due today)
3. Finalize Q4 budget (due Friday)
4. Client presentation prep (due next week)
5. Archive project files (due Feb 28)

Would you like to focus on any of these?
```

---

## During the Day

### Task Management

**Creating Tasks (Telegram - fastest):**

```
You: Add task review Sarah's analysis by Friday

Kay: ✅ Created task: Review Sarah's analysis
Due: Friday, Feb 7
Status: Todo
Priority: Medium

Added to your task list.
```

**Updating Tasks:**

```
You: Mark task 1 as done

Kay: ✅ Marked "Review denovoSkin deliverable" as done.
Completed at 3:47 PM.
```

**Rescheduling:**

```
You: Move dentist call to tomorrow

Kay: [Finds "Call dentist" task]
✅ Updated due date to Wednesday, Feb 5.
```

---

### File Management

**Saving Files (Telegram - mobile capture):**

When you receive a file (email attachment, Teams message):

1. Forward to Kay via Telegram
2. Kay asks: "Where should I save this?"
3. Reply with hint:
   ```
   You: CTS010 deliverables

   Kay: ✅ Saved to:
   Areas/Work/CTS010 denovoSkin/Deliverables/

   File is now indexed and searchable.
   ```

**Desktop Files (Nextcloud):**

1. Save to `C:\Users\oscar\Nextcloud\Inbox\`
2. Kay processes within 10 minutes
3. Telegram notification:
   ```
   📄 File processed: proposal_draft.pdf
   Moved to: Areas/Work/CTS010 denovoSkin/Deliverables/
   Confidence: 95%
   ```

---

### Email Handling

**Automatic Processing (every 10 min):**

Kay monitors inbox and:
- Classifies emails (actionable vs informational)
- Labels to projects (Work/CTS010, Personal/Family, etc.)
- Archives after labeling

**Action Item Extraction (Telegram):**

When actionable email arrives:

```
📧 New actionable email

From: Ben Wilding
Subject: DenovoSkin catch up

Extracted task:
"Review deliverable draft and send feedback by Friday"

Action items:
• Review deliverable draft
• Send feedback to Ben

Deadline: Friday, Feb 7

Create task?
[✅ Yes] [❌ No]
```

Reply "yes" to create task automatically.

---

### Information Lookup

**Finding Documents (LibreChat - best for long results):**

```
You: Find cost-effectiveness documents in CTS010

Kay: [Calls search_files]

Found 4 relevant documents:

1. **CTS010_Deliverable_Q4.pdf** (94% match)
   Section: Economic Evaluation > Cost-Effectiveness
   "The cost-effectiveness analysis was conducted..."

2. **Budget_Impact_Model.xlsx** (87% match)
   Section: Assumptions
   "Cost inputs were derived from NHS reference costs..."

3. **Literature_Review.pdf** (81% match)
   Section: Cost Studies
   "Systematic review identified 15 cost-effectiveness studies..."

Would you like me to retrieve full content from any of these?
```

**Finding Emails (Telegram or LibreChat):**

```
You: Find emails from Ben about deliverables

Kay: [Calls search_emails]

Found 3 emails:

1. "DenovoSkin Q4 Review" (Feb 4)
   Ben asked to discuss deliverable timeline

2. "Client feedback on draft" (Feb 1)
   Ben shared client comments on first draft

3. "Deliverable structure" (Jan 28)
   Ben suggested outline for Q4 report
```

---

### Meeting Handling

**Before Meeting:**

```
You: What do I need to know for my 10am meeting?

Kay: Your 10:00 AM meeting: "DenovoSkin Review"

**Project Context (CTS010):**
- Status: Deliverable finalization phase
- Due: Friday (Feb 7)
- Last activity: Draft reviewed, client feedback incorporated

**Recent Activity:**
- Feb 4: Team meeting discussed timeline
- Feb 1: Data analysis completed by Sarah
- Jan 28: Client feedback received

**Active Tasks:**
- Review deliverable draft (due today 5pm)
- Finalize data tables - Sarah (due Wednesday)

**Key Contacts:**
- Ben Wilding (PM) - last contact today
- Sarah Johnson (Analyst) - last contact today

Need anything else for the meeting?
```

---

**Recording Meeting (Microsoft Teams):**

1. Start Teams recording during meeting
2. After meeting, recording saves to OneDrive
3. Move to: `C:\Users\oscar\Nextcloud\Recordings\Meetings\`
4. Within 15 min, Kay processes:
   - Transcribes audio
   - Detects speakers from Teams UI
   - Extracts action items and decisions
5. Telegram notification with summary
6. Action items sent for confirmation

---

### Quick Questions

**Telegram (always available):**

```
You: When is my next meeting?

Kay: Your next meeting is at 2:00 PM today:
"Client Call" (30 minutes)
```

```
You: What's the status of SOBI036?

Kay: [Loads project context]

SOBI036 Anakinra project:
- Status: Active - Data collection phase
- Timeline: Q1 2026
- Next milestone: Analysis start (Feb 15)
- Active tasks: 2 (both on track)
```

---

## End of Day

### 1. Review Completed Tasks

**Telegram:**

```
You: What did I complete today?

Kay: Today you completed 4 tasks:

✓ Review denovoSkin deliverable (3:47 PM)
✓ Update SOBI036 timeline (2:15 PM)
✓ Call dentist (11:30 AM)
✓ Email client feedback (4:20 PM)

Great work! 🎉
```

---

### 2. Check Tomorrow

**Telegram:**

```
You: What's tomorrow look like?

Kay: Tomorrow (Wednesday, Feb 5):

**Tasks due (2):**
1. Finalize data tables - Sarah (High)
2. Review budget spreadsheet (Medium)

**Meetings (1):**
• 9:00 AM - Team Standup (15 min)

**Suggested prep:**
- Review Sarah's data tables before standup
- Check budget spreadsheet for errors
```

---

### 3. Log Any Learnings (Optional)

If you learned something valuable during the day:

**Via Claude Code:**

```bash
# Create learning file
cd ~/.claude/MEMORY/learnings/WorkProjects
touch "2026-02-04-cost-effectiveness-methodology.md"

# Content:
# Learning: CTS010 uses NHS reference costs for base case
# Context: Client specified this in Feb 4 meeting
# Application: Use for future HTA projects with UK NHS clients
```

Kay's memory system picks this up for future context.

---

## Weekly Review

### Sunday Evening or Monday Morning

**1. Review Week's Accomplishments:**

**LibreChat (better for detailed review):**

```
You: Show me what I accomplished last week

Kay: Last week (Jan 28 - Feb 3) you completed 15 tasks:

**By Project:**
- CTS010 (7 tasks): Deliverable draft, data analysis, client feedback review
- SOBI036 (3 tasks): Timeline update, stakeholder meeting, budget review
- Personal (5 tasks): Dentist, car service, tax documents, gym schedule

**By Priority:**
- High: 8 tasks
- Medium: 5 tasks
- Low: 2 tasks

**Meetings attended:** 6
**Documents created:** 3
**Emails processed:** 127 (24 actionable)
```

---

**2. Plan Next Week:**

**Telegram:**

```
You: What's coming up this week?

Kay: This week (Feb 4-10):

**Major Deadlines:**
• Friday: Submit denovoSkin deliverable to client
• Thursday: SOBI036 stakeholder presentation
• Wednesday: Budget review meeting

**Tasks due (18):**
- High priority: 7
- Medium priority: 9
- Low priority: 2

**Meetings (8):**
- Monday: 2
- Tuesday: 2
- Wednesday: 1
- Thursday: 2
- Friday: 1

**Suggested priorities:**
1. Focus on denovoSkin deliverable (due Friday)
2. Prepare SOBI036 presentation (due Thursday)
3. Review budget before Wednesday meeting
```

---

**3. Update Goals (if applicable):**

**Telegram:**

```
You: Update goal fitness progress to 60%

Kay: ✅ Updated "Regular fitness routine" progress to 60%

Previous: 50%
Current: 60%
Target: 100% by March 31

You're making great progress! 10% increase this week.
```

---

## Interface Selection Guide

### When to Use Telegram

**Best for:**
- ✅ Quick queries ("what's my next meeting?")
- ✅ Task creation on the go
- ✅ File uploads from phone
- ✅ Voice messages (transcribed automatically)
- ✅ Proactive notifications (morning summary, overdue tasks)
- ✅ Mobile-first scenarios

**Example scenarios:**
- Out of office, need to create task
- Receive email on phone, want to extract action items
- Waiting for meeting, check calendar
- On commute, review today's priorities

---

### When to Use LibreChat

**Best for:**
- ✅ Long-form answers (document searches)
- ✅ Complex queries (multi-step analysis)
- ✅ Document generation (reports, presentations)
- ✅ Research (finding information across many files)
- ✅ Desktop work (larger screen, better formatting)

**Example scenarios:**
- Writing project report, need to reference past documents
- Analyzing trends across multiple files
- Creating presentation with data from various sources
- Deep dive into project status

---

### When to Use Claude Code (for Oscar only)

**Best for:**
- ✅ System administration
- ✅ Creating learnings/ADRs
- ✅ Debugging PAI issues
- ✅ Code changes
- ✅ Advanced queries requiring file system access

**Example scenarios:**
- PAI system not working correctly
- Want to document new learning
- Need to check logs
- Modify automation scripts

---

## Common Scenarios

### Scenario 1: Handling Incoming Work Request

**Situation:** Manager sends Teams message: "Can you review the cost model by tomorrow?"

**Workflow:**

1. **Forward to Telegram** (if on mobile) or **copy to LibreChat** (if on desktop)

2. **Kay extracts action:**
   ```
   Kay: I see a request to review the cost model by tomorrow.

   Create task?

   Proposed task:
   - Title: Review cost model
   - Due: Tomorrow (Feb 5)
   - Priority: High
   - Project: [Which project?]
   ```

3. **Confirm and specify:**
   ```
   You: Yes, CTS010

   Kay: ✅ Created task:
   "Review cost model"
   Due: Feb 5
   Priority: High
   Project: CTS010 denovoSkin
   ```

4. **Kay syncs to Notion** (within 10 minutes)

5. **Task appears in all interfaces** (Telegram, LibreChat, Notion)

---

### Scenario 2: Preparing for Client Meeting

**Situation:** Client meeting in 30 minutes, need context

**Workflow:**

1. **Ask Kay (LibreChat preferred for detailed response):**
   ```
   You: Prepare me for my client meeting about CTS010
   ```

2. **Kay loads context and provides briefing:**
   ```
   Kay: CTS010 denovoSkin Client Meeting Briefing:

   **Project Status:**
   - Phase: Deliverable finalization
   - Timeline: On track for Friday submission
   - Last client contact: Feb 1 (positive feedback)

   **Recent Progress:**
   - Draft deliverable completed
   - Client feedback incorporated
   - Data analysis finalized by Sarah

   **Open Items:**
   - Awaiting your final review (due today 5pm)
   - Minor formatting adjustments needed
   - Budget section needs updating

   **Discussion Topics to Prepare:**
   - Timeline for final submission (Friday)
   - Any additional client feedback needed
   - Next steps after deliverable submission

   **Key Contacts:**
   - Ben Wilding (PM) - most recent touch today
   - Sarah Johnson (Analyst) - lead on data analysis

   **Recent Documents:**
   1. CTS010_Deliverable_Q4.pdf (draft, reviewed Feb 4)
   2. Cost_Effectiveness_Analysis.xlsx (finalized Feb 1)
   3. Client_Feedback_Summary.docx (received Feb 1)

   Would you like me to pull up any specific documents?
   ```

3. **Ask follow-ups as needed:**
   ```
   You: Show me the latest client feedback

   Kay: [Retrieves Client_Feedback_Summary.docx]

   **Client Feedback (Feb 1):**

   Positive:
   - Methodology is sound
   - Data quality is excellent
   - Presentation is clear

   Requested Changes:
   - Add sensitivity analysis for key parameters
   - Update budget impact section with Q4 data
   - Include comparison with standard care

   All changes have been incorporated in current draft.
   ```

---

### Scenario 3: Finding Old Information

**Situation:** Need to remember what was decided in meeting 2 weeks ago

**Workflow:**

1. **Search meetings (LibreChat):**
   ```
   You: Find decisions from CTS010 meetings in January
   ```

2. **Kay searches meeting transcripts:**
   ```
   Kay: Found 3 CTS010 meetings in January:

   1. Jan 28 - Project Planning Meeting
      Decisions:
      - Approved quarterly reporting format
      - Agreed to extend deadline by one week if needed
      - Sarah to lead data analysis section

   2. Jan 21 - Client Kickoff
      Decisions:
      - CTS010 will use NHS reference costs
      - Timeline: Q4 deliverable by Feb 7
      - Ben as primary client contact

   3. Jan 15 - Internal Review
      Decisions:
      - Use template from SOBI036
      - Focus on cost-effectiveness as primary outcome
      - Include budget impact analysis

   Which meeting would you like to explore in detail?
   ```

3. **Drill down if needed:**
   ```
   You: Show me full transcript of Jan 21 meeting

   Kay: [Retrieves full transcript with timestamps and speakers]
   ```

---

### Scenario 4: End-of-Week Project Update

**Situation:** Friday afternoon, need to send project status to manager

**Workflow:**

1. **Ask Kay to generate report (LibreChat):**
   ```
   You: Create a project status report for CTS010 as a Word document
   ```

2. **Kay generates document using project context + recent activity:**
   ```
   Kay: ✅ Created: CTS010_Status_Report.docx

   📄 Document Preview:

   # CTS010 denovoSkin - Project Status Report
   Date: February 4, 2026

   ## Executive Summary
   The denovoSkin project is on track for Q4 deliverable submission on Friday, February 7...

   ## Progress This Week
   - Deliverable draft completed and reviewed
   - Client feedback incorporated
   - Data analysis finalized
   - Timeline confirmed with client

   ## Upcoming Milestones
   - Feb 7: Submit deliverable to client
   - Feb 14: Client review complete
   - Feb 21: Final revisions submitted

   ## Risks & Issues
   None identified. Project on schedule.

   Document saved to: Temp/CTS010_Status_Report.docx

   Reply "finalize" to move to final location.
   ```

3. **Review and finalize:**
   ```
   You: Finalize

   Kay: ✅ Moved to:
   Areas/Work/CTS010 denovoSkin/Deliverables/CTS010_Status_Report_2026-02-04.docx

   File is synced to Nextcloud and available on all devices.
   ```

---

## Best Practices

### Task Management

**DO:**
- ✅ Create tasks immediately when requested
- ✅ Set due dates realistically
- ✅ Use priority levels (high for urgent, medium for normal)
- ✅ Link tasks to projects when possible
- ✅ Mark tasks done as soon as completed

**DON'T:**
- ❌ Let tasks pile up without due dates
- ❌ Create duplicate tasks (check first)
- ❌ Use vague titles ("Do the thing" → "Review CTS010 deliverable")
- ❌ Forget to update status (keep it current)

---

### File Management

**DO:**
- ✅ Save to Inbox for automatic classification
- ✅ Provide hints when Kay asks (faster processing)
- ✅ Use descriptive filenames
- ✅ Keep file structure tidy (archive old files)

**DON'T:**
- ❌ Save to random folders (Kay can't find them)
- ❌ Use cryptic filenames ("doc1.pdf" → "CTS010_Deliverable_Q4.pdf")
- ❌ Keep duplicates (delete old versions)

---

### Communication with Kay

**DO:**
- ✅ Be specific ("Show CTS010 tasks" vs "Show tasks")
- ✅ Use natural language (Kay understands context)
- ✅ Ask follow-up questions (Kay remembers conversation)
- ✅ Correct Kay when wrong (system learns from corrections)

**DON'T:**
- ❌ Use keywords only ("task deadline friday" → "Show tasks due Friday")
- ❌ Assume Kay knows unstated context (be explicit about project)
- ❌ Get frustrated (Kay improves with feedback)

---

## Related Documentation

- [Task Management](./task-management.md) - Detailed task workflows
- [File Management](./file-management.md) - File organization guide
- [Telegram Bot](../02-capabilities/telegram-bot.md) - Mobile interface details
- [LibreChat](../02-capabilities/librechat.md) - Web interface guide
- [Troubleshooting](../05-operations/troubleshooting.md) - When things go wrong
