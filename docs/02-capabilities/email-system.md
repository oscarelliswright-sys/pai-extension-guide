# Email Processing System

**Purpose:** Automated email classification, labeling, and task extraction
**Source:** Gmail (personal + forwarded work emails)
**Frequency:** Every 10 minutes (Railway cron)
**Models:** Gemma 2 9B (classification) + Claude 3.5 Haiku (extraction)
**Status:** Production, actively used

---

## Table of Contents

1. [Overview](#overview)
2. [Email Sources](#email-sources)
3. [Processing Pipeline](#processing-pipeline)
4. [Classification System](#classification-system)
5. [Labeling System](#labeling-system)
6. [Task Extraction](#task-extraction)
7. [Reclassification Workflow](#reclassification-workflow)
8. [Context Enrichment](#context-enrichment)
9. [RAG Search](#rag-search)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The email system transforms your inbox from a chaotic stream into an organized, actionable knowledge base.

### Core Value

**Problem:**
- 100+ emails/day mixing work, personal, promotional
- Important action items buried in noise
- No context about who sent what or why

**Solution:**
- AI classifies every email (actionable, informational, promotional, junk)
- Auto-labels to work projects or personal areas
- Extracts tasks with Telegram confirmation
- Builds sender relationship context
- Makes all emails semantically searchable

### Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│ 1. FETCH                                                    │
│    Gmail API → email/index.ts fetch                        │
│    ├─ Inbox only (not sent, drafts, etc.)                 │
│    ├─ Unprocessed emails (not in email_logs)              │
│    └─ Max 50 per sync cycle                                │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 2. CLASSIFY                                                 │
│    AI classification (Gemma 2 9B)                          │
│    ├─ Category: actionable, informational, promotional,   │
│    │   junk, subscription                                  │
│    ├─ Confidence score (0-1)                               │
│    └─ Reasoning for decision                               │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 3. LABEL                                                    │
│    Determine Gmail label (AI + rules)                      │
│    ├─ Work: Work/CTS010, Work/SOBI036, etc.              │
│    ├─ Personal: Personal/Family, Personal/Health          │
│    ├─ System: Promotional, Verifications, MISC            │
│    └─ Apply label via Gmail API                            │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 4. EXTRACT (if actionable)                                 │
│    AI extraction (Claude 3.5 Haiku)                        │
│    ├─ Deadlines and dates                                  │
│    ├─ Contacts mentioned                                    │
│    ├─ Action items (what needs doing)                      │
│    └─ Summary of request                                    │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 5. TASK CONFIRMATION (Telegram)                            │
│    Send task proposal via Telegram                          │
│    ├─ User reviews extracted action items                  │
│    ├─ Approve (✅) or Skip (❌)                            │
│    └─ Approved → creates task in database + Notion         │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 6. CONTEXT ENRICHMENT                                       │
│    Update project/area context files                        │
│    ├─ Track sender patterns (work colleagues)              │
│    ├─ Extract project-specific info                        │
│    └─ Update "Recent Activity" sections                    │
└────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────┐
│ 7. RAG INDEXING                                             │
│    Generate embeddings for semantic search                  │
│    ├─ Only actionable/informational emails                 │
│    ├─ OpenAI text-embedding-3-small                        │
│    └─ Stored in email_logs.embedding                       │
└────────────────────────────────────────────────────────────┘
                          ↓
                   ✅ Email Processed
```

---

## Email Sources

### 1. Personal Emails
**Direct:** oscarelliswright@gmail.com
**Examples:** Family, friends, services, subscriptions

### 2. Forwarded Work Emails
**Source:** Oscar's Outlook (work email)
**Forwarder:** kayworkforwarding@gmail.com
**Method:** Python script + Windows Task Scheduler

**Why Forward?**
- Work inbox stays separate (Outlook for daily use)
- PAI processes copy for classification and task extraction
- No mixing work/personal in main Gmail interface

**Forwarding Script:**

Location: `C:\Users\oscar\Nextcloud\Temp\outlook_forwarder.py`

```python
#!/usr/bin/env python3
# Outlook Email Forwarder
# Forwards new work emails to Gmail for PAI processing

import win32com.client
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

# Outlook automation via COM
outlook = win32com.client.Dispatch("Outlook.Application")
namespace = outlook.GetNamespace("MAPI")
inbox = namespace.GetDefaultFolder(6)  # 6 = inbox

# Gmail SMTP (app password)
GMAIL_USER = "kayworkforwarding@gmail.com"
GMAIL_APP_PASSWORD = "xxxx xxxx xxxx xxxx"
FORWARD_TO = "oscarelliswright@gmail.com"

# Only forward emails from last 30 minutes (avoid duplicates)
cutoff = datetime.now() - timedelta(minutes=30)
messages = inbox.Items
messages.Sort("[ReceivedTime]", True)

for msg in messages:
    if msg.ReceivedTime < cutoff:
        break  # Stop once we hit old emails

    if msg.Class == 43:  # MailItem
        # Format: "Original Sender - Original Subject"
        subject = f"{msg.SenderName} - {msg.Subject}"

        # Body with metadata
        body = f"""From: {msg.SenderName} <{msg.SenderEmailAddress}>
To: {msg.To}
Subject: {msg.Subject}
Date: {msg.ReceivedTime}

{msg.Body}
"""

        # Send via Gmail SMTP
        mime = MIMEMultipart()
        mime['From'] = GMAIL_USER
        mime['To'] = FORWARD_TO
        mime['Subject'] = subject
        mime.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            smtp.send_message(mime)

        print(f"Forwarded: {subject}")
```

**Scheduling:**

Windows Task Scheduler:
- **Trigger:** Every 15 minutes, Mon-Fri 8am-7pm
- **Action:** `python.exe C:\Users\oscar\Nextcloud\Temp\outlook_forwarder.py`
- **Conditions:** Only if on AC power

**Format Received by PAI:**

```
From: kayworkforwarding@gmail.com
Subject: Ben Wilding - DenovoSkin catch up

From: Ben Wilding <ben@cogentia.co.uk>
To: oscar.wright@cogentia.co.uk
Subject: DenovoSkin catch up
Date: 2026-02-04 10:30:00

Hi Oscar,

Can we catch up about the denovoSkin deliverable?
Let me know when you're free this week.

Ben
```

PAI extracts:
- **Original sender:** "Ben Wilding" (from subject line)
- **Original email:** ben@cogentia.co.uk (from body)
- **Content:** Full body text

---

## Processing Pipeline

### Fetch Stage

**Script:** `sync/email-fetch.ts`
**API:** Gmail API v1
**Query:** `in:inbox -in:sent -in:drafts`

**Process:**

```typescript
// 1. Authenticate via OAuth 2.0
const auth = await getOAuthClient();
const gmail = google.gmail({ version: 'v1', auth });

// 2. List unprocessed emails
const response = await gmail.users.messages.list({
  userId: 'me',
  q: 'in:inbox',
  maxResults: 50,
});

// 3. Fetch full message details
for (const msg of response.data.messages) {
  const full = await gmail.users.messages.get({
    userId: 'me',
    id: msg.id,
    format: 'full',
  });

  // 4. Check if already processed
  const exists = await sql`
    SELECT 1 FROM email_logs
    WHERE gmail_message_id = ${full.id}
  `;
  if (exists.length > 0) continue;

  // 5. Parse email
  const parsed = parseEmail(full);

  // 6. Process (classify, label, extract)
  await processEmail(parsed);
}
```

**Email Parsing:**

```typescript
interface ParsedEmail {
  id: string;              // Gmail message ID
  threadId: string;        // Gmail thread ID
  subject: string;         // Email subject
  from: string;            // Sender email
  fromName: string | null; // Sender name
  to: string[];            // Recipients
  date: Date;              // Received timestamp
  snippet: string;         // First 100 chars
  body: string | null;     // Full plain text body
  labels: string[];        // Current Gmail labels
}
```

**Deduplication:**

Uses `gmail_message_id` (unique) to prevent re-processing.

---

## Classification System

**Model:** Google Gemma 2 9B Instruct (via OpenRouter)
**Cost:** Free (OpenRouter community credits)
**Speed:** ~2-3 seconds per email

### Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **actionable** | Requires response or action | Meeting requests, task assignments, questions |
| **informational** | FYI only, no action needed | Announcements, reports, status updates |
| **promotional** | Marketing and sales | Newsletters, product offers, ads |
| **junk** | Spam or irrelevant | Phishing, scams, unsolicited ads |
| **subscription** | Expected regular emails | GitHub notifications, JIRA updates, newsletters |

### Classification Prompt

```typescript
const prompt = `You are an email classification assistant. Classify this email.

SENDER: ${email.from} (${email.fromName || 'Unknown'})
SUBJECT: ${email.subject}
BODY:
${email.body || email.snippet}

SENDER HISTORY:
${senderStats ? `
  - Total emails: ${senderStats.total_count}
  - Actionable: ${senderStats.actionable_count}
  - Informational: ${senderStats.informational_count}
  - Pattern: ${senderStats.suggested_action || 'Unknown'}
` : 'First email from this sender'}

WORK EMAIL CONTEXT:
${isWorkEmail ? `
  This is a forwarded work email (from kayworkforwarding@gmail.com).
  Original sender: ${extractOriginalSender(email)}

  CLASSIFICATION RULES FOR WORK EMAILS:
  - ONLY mark as "actionable" if Oscar is DIRECTLY asked to do something
  - Examples: "Can you review this?", "Please send the data by Friday"
  - NOT actionable: CC'd on email, announcements, CRM notifications
  - Default to "informational" unless clear action requested
` : 'Personal email (not work)'}

OUTPUT (JSON):
{
  "category": "actionable" | "informational" | "promotional" | "junk" | "subscription",
  "confidence": 0.85,
  "reasoning": "Ben is asking Oscar to review the deliverable by Friday",
  "needsExtraction": true
}`;
```

### Work Email Special Rules

**Problem:** Work emails often CC Oscar on updates that don't need his action.

**Solution:** Strict actionable criteria:
- **Actionable:** "Can you review this?", "Please send data"
- **Not Actionable:** "FYI", "Update on X", "Meeting minutes"

**Implementation:**

```typescript
const isWorkEmail = email.from === 'kayworkforwarding@gmail.com';

if (isWorkEmail) {
  // Extract original sender from forwarded format
  const originalSender = extractOriginalSenderFromSubject(email.subject);

  // Add strict rules to prompt
  systemPrompt += `
    CRITICAL: This is a work email. Be VERY conservative with "actionable".
    Only mark actionable if Oscar is explicitly asked to do something.
    When in doubt, choose "informational".
  `;
}
```

**Result:** Reduced false actionable rate from 40% to <5%

---

## Labeling System

**Purpose:** Route emails to appropriate Gmail labels for organization

**Model:** Google Gemma 2 9B Instruct (same as classification)
**Fallback:** Rule-based matching (learned from user corrections)

### Label Structure

```
Work/
├── CTS010 denovoSkin
├── SOBI036 Anakinra
├── MDC014 Something
├── General Work
├── Training
└── Professional Development

Personal/
├── Ella (partner)
├── Family
├── Health
├── Finance
├── Travel
├── Shopping
├── Services
└── Subscriptions

System/
├── Verifications (OTPs, login codes)
├── Promotional
└── MISC (uncertain classification)
```

### Label Determination

**Phase 1: Check Learned Rules**

```typescript
// Query email_label_rules table
const rule = await sql`
  SELECT label_name, confidence
  FROM email_label_rules
  WHERE sender_email = ${email.from}
  ORDER BY confidence DESC
  LIMIT 1
`;

if (rule && rule.confidence > 0.8) {
  // Use learned rule (high confidence)
  return rule.label_name;
}
```

**Phase 2: AI Labeling**

```typescript
const prompt = `Determine Gmail label for this email.

SENDER: ${email.from}
SUBJECT: ${email.subject}
BODY: ${email.body}
CATEGORY: ${classification.category}

WORK PROJECTS (from database):
${workProjects.map(p => `- ${p.project_code}: ${p.project_name}`).join('\n')}

LABEL OPTIONS:
${ALL_LABELS.join('\n')}

RULES:
- Work emails → Work/ProjectCode (if project mentioned) or Work/General
- Family emails → Personal/Family
- Health providers → Personal/Health
- OTPs/codes → Verifications
- Promotional → Promotional
- Uncertain → MISC

OUTPUT (JSON):
{
  "label": "Work/CTS010 denovoSkin",
  "confidence": 0.9,
  "reasoning": "Email discusses denovoSkin deliverable from Ben (work colleague)"
}`;
```

**Phase 3: Apply Label**

```typescript
// Apply label via Gmail API
await gmail.users.messages.modify({
  userId: 'me',
  id: email.id,
  requestBody: {
    addLabelIds: [labelId],
    removeLabelIds: ['INBOX'], // Archive after labeling
  },
});
```

### Dynamic Work Labels

Work project labels sync from database:

```typescript
// Sync work projects → Gmail labels
async function syncWorkLabelsWithGmail() {
  const projects = await sql`
    SELECT project_code, project_name
    FROM work_projects
    WHERE status = 'active'
  `;

  for (const project of projects) {
    const labelName = `Work/${project.project_code}`;

    // Create label if doesn't exist
    try {
      await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: labelName,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });
    } catch (err) {
      if (!err.message.includes('Label name exists')) {
        throw err;
      }
    }
  }
}
```

**Runs:** Every sync cycle (ensures new projects get labels)

---

## Task Extraction

**Trigger:** Emails classified as "actionable"
**Model:** Claude 3.5 Haiku (via OpenRouter)
**Cost:** ~$0.0002 per email
**Confirmation:** Via Telegram (user approves before task created)

### Extraction Process

**1. AI Extracts Information**

```typescript
const prompt = `Extract actionable information from this email.

EMAIL:
From: ${email.fromName} <${email.from}>
Subject: ${email.subject}
Body: ${email.body}

EXTRACT:
1. Deadlines (dates mentioned)
2. Contacts (people mentioned beyond sender)
3. Action items (what needs doing)
4. Summary (one sentence: what does Oscar need to do?)

OUTPUT (JSON):
{
  "deadlines": [
    { "text": "by Friday", "date": "2026-02-07", "type": "due_date" }
  ],
  "contacts": [
    { "name": "Sarah", "context": "mentioned as stakeholder" }
  ],
  "actionItems": [
    "Review denovoSkin deliverable draft",
    "Send feedback to Ben by Friday"
  ],
  "summary": "Review and provide feedback on denovoSkin deliverable by Friday"
}`;
```

**2. Store in Database**

```sql
INSERT INTO email_logs (
  gmail_message_id,
  subject,
  sender_email,
  category,
  extracted_deadlines,
  extracted_contacts,
  extracted_action_items,
  extraction_summary
) VALUES (
  'msg_12345',
  'DenovoSkin catch up',
  'ben@cogentia.co.uk',
  'actionable',
  '[{"text":"by Friday","date":"2026-02-07"}]',
  '[{"name":"Sarah","context":"stakeholder"}]',
  '["Review deliverable","Send feedback"]',
  'Review and provide feedback on deliverable by Friday'
)
```

**3. Send Telegram Confirmation**

```typescript
await sendTaskConfirmation({
  emailId: email.id,
  from: email.fromName,
  subject: email.subject,
  summary: extraction.summary,
  actionItems: extraction.actionItems,
  deadline: extraction.deadlines[0]?.date,
});
```

**Telegram Message:**

```
📧 New actionable email

From: Ben Wilding
Subject: DenovoSkin catch up

Extracted task:
"Review and provide feedback on denovoSkin deliverable by Friday"

Action items:
• Review deliverable draft
• Send feedback to Ben

Deadline: Friday, Feb 7

Create task?
[✅ Yes] [❌ No]
```

**4. User Confirmation**

User replies:
- "Yes" / "✅" / "1" → Create task
- "No" / "❌" / "Skip" → Dismiss

**5. Task Creation (if approved)**

```sql
INSERT INTO tasks (
  title,
  notes,
  due_date,
  project_id,
  source,
  notion_page_id
) VALUES (
  'Review denovoSkin deliverable',
  'From email: Ben Wilding\n\nAction items:\n• Review draft\n• Send feedback',
  '2026-02-07',
  'project-uuid-for-CTS010',
  'email',
  'sql:email_20260204_001'
)
```

Task syncs to Notion (outbound sync creates Notion page).

---

## Reclassification Workflow

**Purpose:** Learn from user corrections when AI mislabels emails

### Process

**1. User Corrects in Gmail**

```
1. Open mislabeled email
2. Remove wrong label (e.g., remove "Work/General")
3. Add correct label (e.g., add "Work/CTS010 denovoSkin")
4. Add system label "Reclassify"
```

**2. System Detects Reclassify Label**

```bash
cd ~/.claude/tools
bun run email/index.ts reclassify
```

**3. Extract Corrections**

```typescript
// Fetch emails with "Reclassify" label
const emails = await gmail.users.messages.list({
  userId: 'me',
  labelIds: ['Reclassify'],
});

for (const email of emails) {
  // Determine new label (user's correction)
  const currentLabels = email.labelIds;
  const newLabel = currentLabels.find(l =>
    l.startsWith('Work/') || l.startsWith('Personal/')
  );

  // Learn rule
  await saveLearnedRule({
    senderEmail: email.from,
    labelName: newLabel,
    confidence: 0.9,
    source: 'user_correction',
  });

  // Remove "Reclassify" label
  await gmail.users.messages.modify({
    userId: 'me',
    id: email.id,
    removeLabelIds: ['Reclassify'],
  });
}
```

**4. Store in Database**

```sql
INSERT INTO email_label_rules (
  sender_email,
  label_name,
  confidence,
  correction_count,
  source
) VALUES (
  'ben@cogentia.co.uk',
  'Work/CTS010 denovoSkin',
  0.9,
  1,
  'user_correction'
)
ON CONFLICT (sender_email, label_name) DO UPDATE SET
  confidence = LEAST(1.0, email_label_rules.confidence + 0.1),
  correction_count = email_label_rules.correction_count + 1,
  updated_at = NOW()
```

**5. Future Emails Use Rule**

Next email from ben@cogentia.co.uk:
1. Check `email_label_rules` table
2. Find: `ben@cogentia.co.uk` → `Work/CTS010 denovoSkin` (confidence: 0.9)
3. Apply label directly (skip AI)

**Result:** Accuracy improves over time without retraining AI model

---

## Context Enrichment

**Purpose:** Update project/area context files with email activity
**Script:** `sync/email-context-update.ts`
**Frequency:** After email processing (every 10 min)

### What Gets Updated

**1. Work Project Sender Tracking**

Location: `context/projects/CTS010 denovoSkin.md`

```markdown
## Email Patterns

**Top Senders (Last 30 Days):**
- Ben Wilding (ben@cogentia.co.uk) - 12 emails
  - Last: Feb 4, 2026 - "DenovoSkin deliverable review"
  - Topics: deliverables, meetings, data analysis

- Sarah Johnson (sarah@client.com) - 8 emails
  - Last: Feb 2, 2026 - "Timeline update"
  - Topics: timelines, stakeholder updates
```

**2. Personal Area Sender Tracking**

Location: `context/areas/Family.md`

```markdown
## Top Senders

- Mum (mum@example.com) - 5 emails (last: Feb 1)
- Dad (dad@example.com) - 3 emails (last: Jan 28)
```

**3. Project-Specific Information Extraction**

```typescript
// AI extracts project-relevant info from work emails
const extracted = await extractProjectInfo(email, projectCode);

// Add to context file
await addBusinessLearning(projectCode, {
  source: 'email',
  content: extracted.keyInfo,
  date: email.date,
});

// Example output in context file:
// ### Recent Learnings
// - **Feb 4:** Client prefers quarterly reports (from Sarah's email)
// - **Feb 1:** New data format required for submission (from Ben's email)
```

### Selective Tracking

**Tracked:**
- Work emails (sender = real person)
- Personal/Family emails
- Personal/Ella emails

**Not Tracked:**
- Promotional senders
- System notifications (GitHub, JIRA)
- Organizations (NHS, banks)

**Why?** Context files should show **people relationships**, not organizational noise.

**Implementation:**

```typescript
const SENDER_BLOCKLIST = new Set([
  'kayworkforwarding@gmail.com',  // Forwarder (use original sender instead)
  'noreply@',                     // Auto-generated emails
  'no-reply@',
  'notifications@',
]);

function shouldTrackSender(email: ParsedEmail, label: string): boolean {
  // Skip blocklisted senders
  if (SENDER_BLOCKLIST.has(email.from)) return false;

  // Track work projects (but extract original sender for forwarded)
  if (label.startsWith('Work/') && label !== 'Work/General') {
    const originalSender = extractOriginalSender(email);
    return !!originalSender;
  }

  // Track personal relationships
  if (['Personal/Family', 'Personal/Ella'].includes(label)) {
    return true;
  }

  // Don't track organizations
  return false;
}
```

---

## RAG Search

**Purpose:** Semantic search across emails
**Model:** OpenAI text-embedding-3-small
**Storage:** `email_logs.embedding` (pgvector)

### Indexing

**1. Only Relevant Emails**

```typescript
function shouldStoreInRag(email: ParsedEmail, classification: ClassificationResult): boolean {
  // Only actionable or informational
  if (!['actionable', 'informational'].includes(classification.category)) {
    return false;
  }

  // Skip promotions, junk, subscriptions
  return true;
}
```

**2. Generate Embedding**

```typescript
const response = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
  body: JSON.stringify({
    model: 'text-embedding-3-small',
    input: `Subject: ${email.subject}\n\n${email.body}`,
  }),
});

const embedding = response.data[0].embedding;
```

**3. Store in Database**

```sql
UPDATE email_logs SET
  embedding = ${sql.vector(embedding)},
  embedded_at = NOW()
WHERE gmail_message_id = ${email.id}
```

### Searching

**CLI:**

```bash
cd ~/.claude/tools
bun run email/index.ts search "cost effectiveness analysis" --limit 10
```

**MCP Tool (pai-rag-search):**

```typescript
// From LibreChat, Telegram, or Claude Code
const results = await mcp.search_emails({
  query: "cost effectiveness analysis",
  limit: 10,
  minSimilarity: 0.3,
});
```

**SQL Query:**

```sql
SELECT
  subject,
  sender_name,
  sender_email,
  received_at,
  extraction_summary,
  1 - (embedding <=> $1::vector) as similarity
FROM email_logs
WHERE category IN ('actionable', 'informational')
  AND 1 - (embedding <=> $1::vector) > 0.3
ORDER BY similarity DESC
LIMIT 10
```

**Example Results:**

```
1. "Q4 Cost-Effectiveness Report" (similarity: 0.89)
   From: Ben Wilding, Feb 3, 2026
   Summary: Final cost-effectiveness analysis for denovoSkin

2. "Economic Evaluation Meeting" (similarity: 0.82)
   From: Sarah Johnson, Jan 28, 2026
   Summary: Discussed methodology for cost analysis

3. "Budget Review" (similarity: 0.75)
   From: Finance Team, Jan 15, 2026
   Summary: Q4 budget review including cost metrics
```

---

## Troubleshooting

### Email Not Fetched

**Symptoms:**
- Email in Gmail inbox but not processed by PAI
- No classification or label applied

**Diagnosis:**

1. **Check sync logs:**
   ```bash
   cd ~/.claude/tools
   bun run sync/email-fetch.ts
   ```

2. **Check database:**
   ```sql
   SELECT * FROM email_logs
   WHERE subject LIKE '%problem subject%'
   ORDER BY received_at DESC;
   ```

3. **Check Gmail API:**
   ```bash
   # Test OAuth token
   bun run email/scripts/setup-oauth.ts test
   ```

**Common Causes:**

1. **OAuth token expired:** Refresh token invalid
   - **Fix:** Re-authenticate: `bun run email/scripts/setup-oauth.ts`

2. **Email already processed:** Check `gmail_message_id` in database
   - **Fix:** If incorrect, delete row and re-sync

3. **API quota exceeded:** Gmail API limit (10K requests/day for free tier)
   - **Fix:** Wait 24 hours or upgrade quota

---

### Wrong Classification

**Symptoms:**
- Actionable email classified as informational
- Personal email classified as promotional

**Diagnosis:**

1. **Check classification reasoning:**
   ```sql
   SELECT
     subject,
     category,
     classification_confidence,
     classification_reasoning
   FROM email_logs
   WHERE subject LIKE '%problem%';
   ```

2. **Review sender stats:**
   ```sql
   SELECT * FROM email_sender_stats
   WHERE sender_email = 'problematic-sender@example.com';
   ```

**Common Causes:**

1. **Ambiguous content:** Email could be either actionable or informational
   - **Fix:** Reclassify manually (see Reclassification Workflow)

2. **No sender history:** First email from sender, no pattern to learn from
   - **Fix:** Will improve after a few emails

3. **Work email over-classification:** CC'd email marked as actionable
   - **Fix:** Reclassify, system will learn stricter rule

---

### Wrong Label

**Symptoms:**
- Work email labeled as Personal/General
- Email about Project X labeled as Project Y

**Diagnosis:**

1. **Check label reasoning:**
   ```sql
   SELECT
     subject,
     gmail_labels,
     classification_reasoning
   FROM email_logs
   WHERE subject LIKE '%problem%';
   ```

2. **Check learned rules:**
   ```sql
   SELECT * FROM email_label_rules
   WHERE sender_email = 'problematic-sender@example.com';
   ```

**Fix via Reclassification:**

```bash
# 1. In Gmail:
#    - Remove wrong label
#    - Add correct label
#    - Add "Reclassify" label

# 2. Run reclassification:
cd ~/.claude/tools
bun run email/index.ts reclassify

# 3. Verify rule learned:
psql "$DATABASE_URL" -c "
  SELECT * FROM email_label_rules
  WHERE sender_email = 'sender@example.com'
"
```

---

### Task Not Created

**Symptoms:**
- Actionable email processed but no Telegram confirmation
- Confirmed task via Telegram but not in database/Notion

**Diagnosis:**

1. **Check extraction results:**
   ```sql
   SELECT
     subject,
     extraction_summary,
     extracted_action_items,
     tasks_created
   FROM email_logs
   WHERE category = 'actionable'
     AND subject LIKE '%problem%';
   ```

2. **Check pending confirmations:**
   ```bash
   cd ~/.claude/tools
   bun run telegram/index.ts
   # Then: /tasks
   ```

3. **Check task creation:**
   ```sql
   SELECT * FROM tasks
   WHERE source = 'email'
     AND title LIKE '%expected task%';
   ```

**Common Causes:**

1. **No action items extracted:** AI didn't find actionable content
   - **Check:** `extracted_action_items` column in `email_logs`
   - **Fix:** Manually create task

2. **Telegram bot not running:** Confirmation never sent
   - **Check:** `ps aux | grep telegram`
   - **Fix:** Start bot: `bun run ~/.claude/tools/telegram/index.ts --vps`

3. **User skipped confirmation:** Clicked ❌ instead of ✅
   - **Check:** Look for "Task confirmation rejected" in bot logs
   - **Fix:** Manually create task if needed

---

### Forwarded Email Original Sender Not Extracted

**Symptoms:**
- Work email from Ben shows sender as "kayworkforwarding@gmail.com"
- Context tracking not working for work colleagues

**Diagnosis:**

```sql
SELECT
  subject,
  sender_email,
  sender_name,
  classification_reasoning
FROM email_logs
WHERE sender_email = 'kayworkforwarding@gmail.com'
  AND subject LIKE '%Ben%';
```

**Expected Behavior:**

- Subject: "Ben Wilding - DenovoSkin catch up"
- Sender extracted: "Ben Wilding"
- Email extracted: ben@cogentia.co.uk (from body)

**If Not Working:**

1. **Check subject line format:**
   - Must be: `"Original Name - Original Subject"`
   - Forwarding script may have changed format

2. **Check body parsing:**
   - Must contain: `From: Name <email@domain>`
   - Check forwarding script output

**Fix:**

Update forwarding script to ensure consistent format.

---

## Performance Metrics

**Current State (February 2026):**

- Emails processed/day: ~30-50
- Classification accuracy: ~92%
- Labeling accuracy: ~88%
- Task extraction recall: ~85% (catches 85% of actionable emails)

**Processing Times:**

- Fetch (50 emails): ~10 seconds
- Classification (per email): ~2-3 seconds
- Labeling (per email): ~2-3 seconds
- Extraction (actionable only): ~5 seconds
- Total per email: ~7-13 seconds

**Costs (monthly estimate):**

- Classification: $0 (Gemma 2 9B free via OpenRouter)
- Extraction: ~$0.30 (150 actionable emails × $0.0002)
- Embeddings: ~$0.60 (900 emails × ~$0.0007)
- **Total: ~$0.90/month**

---

## Related Documentation

- [Notion Sync](./notion-sync.md) - How extracted tasks sync to Notion
- [Telegram Bot](./telegram-bot.md) - Task confirmation interface
- [RAG Search](./rag-search.md) - Semantic email search
- [Database Schema](../04-development/database-schema.md) - Email tables structure
- [Troubleshooting](../05-operations/troubleshooting.md) - General debugging
