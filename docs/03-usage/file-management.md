# File Management

**Purpose:** How to organize, find, and manage files in PAI
**Storage:** Nextcloud (PARA organized)
**Search:** RAG semantic search + folder navigation
**Last Updated:** February 4, 2026

---

## Quick Reference

| Action | Method | Interface |
|--------|--------|-----------|
| Save file from phone | Forward to Telegram | Telegram |
| Save file from desktop | Drop in Inbox folder | Nextcloud |
| Find document by topic | Semantic search | LibreChat |
| Browse project files | Navigate folders | Nextcloud Web/Desktop |
| Get full file content | get_file_content tool | LibreChat |

---

## PARA File Structure

```
/opt/nextcloud/files/oscar/files/
├── Inbox/                    # Drop files here for auto-classification
├── Areas/                    # Ongoing responsibilities
│   ├── Work/
│   │   ├── CTS010 denovoSkin/
│   │   │   ├── Deliverables/
│   │   │   ├── Contracts/
│   │   │   ├── Presentations/
│   │   │   ├── Data/
│   │   │   ├── Meeting Notes/
│   │   │   └── General/
│   │   ├── SOBI036 Anakinra/
│   │   └── General Work/
│   └── Life/
│       ├── Health/
│       ├── Finance/
│       ├── Travel/
│       └── Family/
├── Projects/                 # Active time-bound projects
├── Resources/                # Reference materials
└── Archive/                  # Completed items
```

## Saving Files

### From Mobile (Telegram)

**Process:**

1. **Receive file** (email attachment, Teams message, screenshot)
2. **Forward to Kay** via Telegram
3. **Kay processes** and asks: "Where should I save this?"
4. **Reply with hint:**
   - Project code: "CTS010"
   - Folder name: "deliverables"
   - Category: "work" or "personal"
5. **Confirmation:**
   ```
   Kay: ✅ Saved to:
   Areas/Work/CTS010 denovoSkin/Deliverables/proposal_draft.pdf

   File is now indexed and searchable.
   ```

**Example:**

```
[You forward proposal_draft.pdf to Kay]

Kay: 📄 New file received: proposal_draft.pdf

Reply with a hint to help me classify it:
• Project code (e.g., "CTS010")
• Category (e.g., "Health", "Travel")
• Or just hit enter to let me decide

You: CTS010 deliverables

Kay: ✅ Saved to:
Areas/Work/CTS010 denovoSkin/Deliverables/proposal_draft.pdf

File processed:
- Text extracted: 15 pages
- Summary generated
- Indexed for search
```

---

### From Desktop (Nextcloud Inbox)

**Process:**

1. **Save to Inbox:** `C:\Users\oscar\Nextcloud\Inbox\` (Windows) or `/home/ubuntu/Nextcloud/Inbox/` (Linux)
2. **Kay detects within 10 minutes** (every sync cycle)
3. **AI classification:**
   - High confidence (>0.7): Moved automatically
   - Low confidence (<0.7): Telegram confirmation
4. **Processing:**
   - Text extraction via Dockling
   - AI determines work vs personal
   - Project assignment
   - Move to destination folder
5. **Notification:**
   ```
   Kay (via Telegram): 📄 File processed: report.pdf
   Moved to: Areas/Work/CTS010 denovoSkin/Deliverables/
   Confidence: 95%
   ```

**Example:**

```
[You save "cost_analysis.xlsx" to Inbox]

[10 minutes later]

Kay (Telegram): 📄 File processed: cost_analysis.xlsx

Classification:
- Type: Work document
- Project: CTS010 denovoSkin (detected from content)
- Subfolder: Data (contains analysis tables)
- Confidence: 92%

Moved to:
Areas/Work/CTS010 denovoSkin/Data/cost_analysis.xlsx

File is now searchable via RAG.
```

---

### Low Confidence Classification

When AI isn't sure (<0.7 confidence):

```
Kay (Telegram): 📄 New file needs your input: meeting_notes.pdf

I think it's:
- Project: CTS010 denovoSkin
- Folder: Meeting Notes
- Confidence: 65%

Is this correct?
[✅ Yes] [❌ No, it's ___]

You: No, it's SOBI036

Kay: ✅ Corrected and saved to:
Areas/Work/SOBI036 Anakinra/Meeting Notes/meeting_notes.pdf

I've learned: Files mentioning "Anakinra mechanism" belong to SOBI036.
```

---

## Finding Files

### Semantic Search (Best for: topic-based lookup)

**LibreChat (Recommended):**

```
You: Find documents about patient outcomes in CTS010

Kay: [Calls search_files with query="patient outcomes", folder="CTS010"]

Found 4 relevant documents:

1. **CTS010_Deliverable_Q4.pdf** (Similarity: 94%)
   Section: Clinical Outcomes Analysis
   "Patient-reported outcomes showed significant improvement..."
   Path: Areas/Work/CTS010 denovoSkin/Deliverables/

2. **Clinical_Evidence_Review.docx** (87%)
   Section: Efficacy Data
   "The pivotal trial demonstrated superiority in patient outcomes..."
   Path: Areas/Work/CTS010 denovoSkin/General/

3. **Cost_Effectiveness_Analysis.xlsx** (81%)
   Section: QALY Calculations
   "Quality-adjusted life years were calculated based on patient outcome data..."
   Path: Areas/Work/CTS010 denovoSkin/Data/

Would you like me to retrieve full content from any of these?

You: Yes, get full content of document 1

Kay: [Calls get_file_content with filename="CTS010_Deliverable_Q4.pdf"]

Retrieved: CTS010_Deliverable_Q4.pdf (45,230 characters)

[Full extracted content displayed...]
```

**Telegram (Quick lookup):**

```
You: Find CTS010 deliverable

Kay: Found 1 matching file:
📄 CTS010_Deliverable_Q4.pdf
Location: Areas/Work/CTS010 denovoSkin/Deliverables/
Modified: Feb 4, 2026

OneDrive link: [link]
```

---

### Folder Navigation (Best for: browsing project files)

**Nextcloud Web:**

1. Open https://nextcloud.yourdomain.com
2. Navigate: Files → Areas → Work → CTS010 denovoSkin
3. Browse subfolders (Deliverables, Contracts, etc.)
4. Click file to open/download

**Nextcloud Desktop Client:**

1. Open Windows Explorer / Finder
2. Navigate: `C:\Users\oscar\Nextcloud\Areas\Work\CTS010 denovoSkin\`
3. Browse like normal folders
4. Open files with default applications

---

## File Processing Pipeline

**What Happens After You Save:**

```
1. DETECT
   └─ Inbox watcher finds new file

2. EXTRACT TEXT
   └─ Dockling API extracts full text
   └─ Supports: PDF, DOCX, PPTX, XLSX, images (OCR)

3. CLASSIFY
   └─ AI determines:
      - Work vs Personal
      - Project assignment
      - Subfolder (Deliverables, Contracts, etc.)

4. MOVE
   └─ Physical file moved to destination
   └─ Nextcloud syncs across devices

5. CHUNK
   └─ Document split into hierarchical chunks
   └─ Preserves heading structure

6. EMBED
   └─ Generate vector embeddings (OpenAI)
   └─ Enables semantic search

7. INDEX
   └─ File now searchable via RAG
   └─ Appears in all interfaces
```

**Time:** 2-5 minutes for typical document

---

## Supported File Types

| Type | Extensions | Text Extraction | Searchable |
|------|-----------|-----------------|------------|
| PDF | .pdf | Yes (Dockling) | Yes |
| Word | .docx, .doc | Yes (Dockling) | Yes |
| PowerPoint | .pptx, .ppt | Yes (Dockling) | Yes |
| Excel | .xlsx, .xls | Yes (Dockling) | Yes |
| Text | .txt, .md | Direct read | Yes |
| Images | .png, .jpg, .jpeg | OCR (Dockling) | Yes |
| Video | .mp4, .mov, .avi | Audio transcription (meetings only) | Yes |
| Audio | .mp3, .wav, .m4a | Transcription (Groq Whisper) | Yes |

**Not supported:**
- Compressed archives (.zip, .rar) - extract first
- Executables (.exe, .sh) - security risk
- Proprietary formats without converters

---

## Work Project Subfolders

**Automatically detected subfolders for client projects:**

| Subfolder | Contents | Examples |
|-----------|----------|----------|
| Deliverables | Final reports, submissions | CTS010_Deliverable_Q4.pdf |
| Contracts | Agreements, SOWs | CTS010_Contract_2025.pdf |
| Presentations | Slides, decks | Client_Presentation_Feb.pptx |
| Data | Datasets, analysis files | cost_analysis.xlsx |
| Correspondence | Email threads, letters | Client_Feedback.docx |
| Meeting Notes | Minutes, agendas | 2026-02-04_Team_Meeting.md |
| Reference | Background materials | Literature_Review.pdf |
| General | Misc files | project_notes.txt |

**How AI Determines Subfolder:**

- **Deliverable:** Keywords like "deliverable", "final", "submission", "report"
- **Contract:** Keywords like "contract", "agreement", "SOW", "terms"
- **Presentation:** File extension .pptx or keywords "presentation", "slides"
- **Data:** File extension .xlsx, .csv or keywords "data", "analysis", "dataset"
- **Meeting Notes:** Keywords "meeting", "minutes", "agenda"
- **General:** Default if no clear category

---

## File Naming Conventions

### Recommended Format

```
[PROJECT]_[TYPE]_[DATE]_[DESCRIPTION].[ext]

Examples:
- CTS010_Deliverable_2026-02-04_Q4_Report.pdf
- SOBI036_Presentation_2026-02-07_Stakeholder_Update.pptx
- CTS010_Data_2026-02-01_Cost_Analysis.xlsx
- Meeting_Notes_2026-02-04_Team_Review.md
```

### Benefits

- **Sortable:** Dates in YYYY-MM-DD format sort chronologically
- **Searchable:** Keywords in filename help RAG search
- **Identifiable:** Clear purpose without opening file
- **Consistent:** Easy to find related files

### Poor Naming Examples

```
❌ doc1.pdf (not descriptive)
❌ final_final_v3.docx (versioning confusion)
❌ NEW_REPORT.pdf (all caps, vague)
❌ temp_file_to_delete_later.xlsx (intended temp, becomes permanent)
```

---

## File Organization Best Practices

### DO

**✅ Use Inbox for all new files**
- Drop everything in Inbox
- Let Kay classify automatically
- Faster than manual organization

**✅ Provide classification hints when asked**
- Speeds up processing
- Improves accuracy
- System learns from your corrections

**✅ Use descriptive filenames**
- Include project code
- Include file type
- Include date
- Include description

**✅ Archive old files regularly**
- Move completed project files to Archive/
- Keeps active folders clean
- Preserves files for future reference

**✅ Trust the search, not memory**
- Don't spend time organizing into deep folder hierarchies
- Use semantic search to find files
- Let PARA handle top-level organization

---

### DON'T

**❌ Save to random folders**
- Bypasses classification pipeline
- Files won't be indexed for search
- Hard to find later

**❌ Use cryptic filenames**
- "doc1.pdf", "file.xlsx" tell you nothing
- Future you won't remember what it is
- Search won't help (no keywords)

**❌ Keep duplicates**
- Multiple "final" versions create confusion
- Wastes storage
- Hard to know which is current
- Archive old versions instead

**❌ Mix work and personal files**
- Keep work in Areas/Work/
- Keep personal in Areas/Life/
- Never mix in same project folder

**❌ Over-organize**
- Don't create deep folder hierarchies
- 2-3 levels max (Area → Project → Subfolder)
- Use search, not folder structure

---

## File Permissions & Sharing

### Nextcloud Sharing

**Internal Sharing (Family):**
1. Right-click file in Nextcloud
2. "Share"
3. Add user (Ella, Dad, etc.)
4. Set permissions (view only, can edit)

**External Sharing (Clients):**
1. Right-click file
2. "Share link"
3. Set expiration date
4. Optional: Require password
5. Copy link and send

**Telegram Sharing:**
```
You: Send me link for CTS010 deliverable

Kay: [Finds file]
📄 CTS010_Deliverable_Q4.pdf

OneDrive link: https://[share-link]

Link valid for: 7 days
Password: [if protected]
```

---

## Troubleshooting

### File Not Processing

**Symptoms:**
- File in Inbox but no notification
- File not searchable

**Solutions:**

1. **Check file type:** Must be supported format
2. **Check file size:** Very large files (>500MB) may time out
3. **Wait longer:** Processing takes 2-5 minutes
4. **Check logs:** `bun run sync/files-process.ts`

---

### File Classified Wrong

**Symptoms:**
- Work file in personal folder
- Wrong project assignment

**Solutions:**

1. **Telegram:** Reply to classification notification with correction
   ```
   Kay: 📄 File processed: report.pdf
   Moved to: Areas/Life/Health/

   You: No, it's CTS010 work

   Kay: ✅ Corrected and moved to:
   Areas/Work/CTS010 denovoSkin/General/

   I've learned this pattern for future files.
   ```

2. **Manual:** Move file in Nextcloud, then tell Kay:
   ```
   You: I moved report.pdf to CTS010 deliverables, update the database

   Kay: ✅ Updated file location in database.
   ```

---

### Can't Find File

**Symptoms:**
- File exists but search doesn't find it
- File not in expected folder

**Solutions:**

1. **Check embeddings:**
   ```
   You: Is report.pdf indexed?

   Kay: [Checks database]
   File: report.pdf
   Status: Processed
   Embedded: No (embedding pending)

   I'll generate embeddings now...
   ✅ Done. File is now searchable.
   ```

2. **Search by filename:**
   ```
   You: Find file named report.pdf

   Kay: Found: report.pdf
   Location: Areas/Work/CTS010 denovoSkin/Deliverables/
   Last modified: Feb 4, 2026
   ```

3. **Browse Nextcloud:** Sometimes faster to navigate folders

---

## Advanced Features

### Bulk File Upload

**Process:**

1. Drop multiple files in Inbox
2. Kay processes in batch (every 10 min)
3. Telegram notification with summary:
   ```
   Kay: 📄 Processed 15 files:

   CTS010 (8 files):
   - 5 → Deliverables
   - 2 → Data
   - 1 → Meeting Notes

   SOBI036 (4 files):
   - 3 → General
   - 1 → Presentations

   Personal (3 files):
   - 2 → Health
   - 1 → Finance
   ```

---

### File Versioning

**Nextcloud Auto-Versioning:**

- Automatically keeps old versions
- Access via: Right-click → Versions
- Restore previous version if needed

**Manual Versioning:**

Use filename suffixes:
```
report_v1.pdf (initial draft)
report_v2.pdf (client feedback incorporated)
report_v3_final.pdf (approved version)
```

---

### File Templates

**Common templates in Resources/Templates/:**

- Project_Report_Template.docx
- Client_Presentation_Template.pptx
- Budget_Analysis_Template.xlsx
- Meeting_Notes_Template.md

**Usage:**

1. Copy template to project folder
2. Rename with project code
3. Fill in content
4. Save (auto-indexed)

---

## Related Documentation

- [File Processing Pipeline](../02-capabilities/file-processing.md) - Technical details
- [RAG Search](../02-capabilities/rag-search.md) - How search works
- [Daily Workflow](./daily-workflow.md) - File handling in daily routine
- [Telegram Bot](../02-capabilities/telegram-bot.md) - Mobile file uploads
- [LibreChat](../02-capabilities/librechat.md) - Desktop file search
