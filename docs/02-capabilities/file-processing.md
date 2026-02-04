# File Processing Pipeline

**Purpose:** Automatic classification, organization, and indexing of files
**Trigger:** Every 10 minutes + real-time inbox watcher (Telegram)
**Supported Formats:** PDF, DOCX, PPTX, XLSX, TXT, MD, images
**Status:** Production, actively used

---

## Table of Contents

1. [Overview](#overview)
2. [Pipeline Stages](#pipeline-stages)
3. [Scan & Detect](#scan--detect)
4. [Extract Text](#extract-text)
5. [Classify & Route](#classify--route)
6. [Move to PARA](#move-to-para)
7. [Chunk for RAG](#chunk-for-rag)
8. [Generate Embeddings](#generate-embeddings)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The file processing pipeline transforms unorganized files in the Inbox into searchable, well-organized knowledge in PARA folders.

### Core Value

**Problem:** Files scattered across downloads, email attachments, screenshots
**Solution:** Drop in Inbox → AI automatically:
- Extracts text content
- Determines work vs personal
- Assigns to correct project/area
- Makes searchable via semantic search

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. SCAN & DETECT                                             │
│    Nextcloud/Inbox/ → files_inbox_scan.ts                   │
│    ├─ New files detected (not in database)                  │
│    ├─ Stored in `files` table, status = 'pending'           │
│    └─ Real-time: Telegram bot notifies user                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. EXTRACT TEXT                                              │
│    files_process.ts → Dockling API (Modal)                  │
│    ├─ PDF/DOCX: Full text + structure (headings, tables)   │
│    ├─ Images: OCR text extraction                           │
│    ├─ TXT/MD: Read directly                                 │
│    └─ Stored in `content_extracted` column                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CLASSIFY & ROUTE                                          │
│    AI classification (Claude Haiku)                          │
│    ├─ Work vs Personal                                       │
│    ├─ Project assignment (CTS010, SOBI036, etc.)           │
│    ├─ Confidence score (0-1)                                │
│    └─ Low confidence (<0.7) → Telegram confirmation         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. MOVE TO PARA                                              │
│    Physical file move to destination folder                  │
│    ├─ Work: Areas/Work/ProjectCode/                         │
│    ├─ Personal: Areas/Life/Category/                        │
│    ├─ Update `file_path` in database                        │
│    └─ Nextcloud occ files:scan for sync                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. CHUNK FOR RAG                                             │
│    generate-chunks.ts → Hierarchical chunking                │
│    ├─ Document → Sections → Paragraphs                      │
│    ├─ Preserves heading hierarchy                           │
│    ├─ Max 1000 tokens per chunk                             │
│    └─ Stored in `file_chunks` table                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. GENERATE EMBEDDINGS                                       │
│    generate-embeddings.ts → OpenAI API                       │
│    ├─ Model: text-embedding-3-small (1536 dims)            │
│    ├─ Both file-level and chunk-level embeddings           │
│    ├─ Stored as pgvector in PostgreSQL                      │
│    └─ Enables semantic search via RAG                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
                   ✅ File Indexed
```

---

## Pipeline Stages

### Stage 1: Scan & Detect

**Script:** `sync/files-inbox-scan.ts`
**Frequency:** Every 10 minutes (Railway cron)
**Additional:** Real-time watcher via Telegram bot

**Process:**

1. **Scan Inbox directory:**
   ```typescript
   const inboxPath = '/opt/nextcloud/files/oscar/files/Inbox';
   const files = await fs.readdir(inboxPath, { recursive: true });
   ```

2. **Filter processable files:**
   ```typescript
   const processable = files.filter(f =>
     /\.(pdf|docx?|pptx?|xlsx?|txt|md|png|jpe?g)$/i.test(f) &&
     !f.startsWith('.') &&
     !f.includes('~$') // Exclude temp files
   );
   ```

3. **Check database for existing entries:**
   ```sql
   SELECT filename FROM files
   WHERE filename = ANY($1)
   ```

4. **Insert new files:**
   ```sql
   INSERT INTO files (
     filename,
     file_path,
     file_size,
     mime_type,
     processing_status,
     created_at
   ) VALUES (...)
   ON CONFLICT (file_path) DO NOTHING
   ```

**Output:**
- New files added to database with status = `'pending'`
- Count logged: "Scanned 15 files, 3 new"

---

### Stage 2: Extract Text

**Script:** `sync/files-process.ts`
**Library:** Modal serverless + Dockling
**Models:** Varies by file type

**Supported Formats:**

| Format | Extraction Method | Features |
|--------|------------------|----------|
| PDF | Dockling (Modal) | Text, tables, headings, images |
| DOCX | Dockling (Modal) | Text, structure, comments |
| PPTX | Dockling (Modal) | Slides, speaker notes, text |
| XLSX | Dockling (Modal) | Sheet names, cells, formulas |
| Images | Dockling OCR | Extracted text from images |
| TXT/MD | Direct read | Plain text, no processing |

**Process:**

1. **Query pending files:**
   ```sql
   SELECT * FROM files
   WHERE processing_status = 'pending'
   ORDER BY created_at ASC
   LIMIT 50
   ```

2. **Extract via Dockling API:**
   ```typescript
   const result = await extractTextViaDockling(filePath, {
     maxPages: 10, // For classification (full extraction later)
     extractTables: true,
     extractImages: false, // Save costs
   });
   ```

3. **Store extracted content:**
   ```sql
   UPDATE files SET
     content_extracted = ${extractedText},
     content_summary = ${summary},
     extraction_completed_at = NOW(),
     processing_status = 'extracted'
   WHERE id = ${fileId}
   ```

**Output:**
- `content_extracted` - Full text (up to 100KB)
- `content_summary` - AI-generated summary (200 words)
- Status updated to `'extracted'`

**Cost Optimization:**

- **First 10 pages only** for classification (most docs have title/intro there)
- **Full extraction** after successful classification
- **Image extraction** skipped unless specifically needed
- **Caching:** Dockling results cached in Modal for 24h

---

### Stage 3: Classify & Route

**Script:** `sync/files-process.ts` (classification phase)
**Model:** Claude 3.5 Haiku (via OpenRouter)
**Context:** Work projects from database + context files

**Classification Dimensions:**

1. **Work vs Personal**
   - Work: Contains work project codes (CTS010, SOBI036, etc.)
   - Personal: Family, health, finance, hobbies

2. **Project Assignment**
   - Work projects: From `work_projects` table
   - Personal areas: Health, Finance, Travel, etc.
   - Subfolder: Deliverables, Contracts, Presentations, etc.

3. **Confidence Score**
   - 0.0-0.7: Low (needs review)
   - 0.7-0.9: Medium (auto-classify)
   - 0.9-1.0: High (auto-classify)

**AI Prompt Structure:**

```typescript
const projectContext = await getContextForProject(workProjects);

const prompt = `You are a file organization assistant. Classify this file.

WORK PROJECTS (Active):
${workProjects.map(p => `- ${p.project_code}: ${p.project_name}`).join('\n')}

PERSONAL AREAS:
- Health
- Finance
- Travel
- Family
- Learning

FILE DETAILS:
Filename: ${filename}
Content (first 10 pages):
${extractedContent}

CONTEXT FROM USER:
${userHint || 'None'}

OUTPUT FORMAT (JSON):
{
  "category": "work" | "personal",
  "project": "CTS010" | "Health" | etc.,
  "subfolder": "Deliverables" | "Contracts" | "General",
  "confidence": 0.85,
  "reasoning": "File discusses cost-effectiveness analysis for denovoSkin project"
}`;
```

**Decision Logic:**

```typescript
const result = await classifyFile(filePath, extractedContent, userHint);

if (result.confidence >= 0.7) {
  // Auto-classify
  await moveFile(filePath, result.destination);
  logger.info(`Auto-classified: ${filename} → ${result.destination}`);
} else {
  // Queue for review
  await sql`
    UPDATE files SET
      classification_confidence = ${result.confidence},
      classification_reasoning = ${result.reasoning},
      processing_status = 'needs_review'
    WHERE id = ${fileId}
  `;

  // Notify via Telegram
  await sendReviewNotification(filename, result);
}
```

**User Hint Integration:**

When Telegram inbox watcher detects a file, it prompts:

```
📄 New file detected: proposal_draft.pdf

Reply with a hint to help me classify it:
• Project code (e.g., "CTS010")
• Category (e.g., "Health", "Travel")
• Or just hit enter to let me decide
```

User hint bypasses AI classification and directly routes the file.

---

### Stage 4: Move to PARA

**Script:** `sync/files-process.ts` (move phase)
**Destination:** PARA-organized folders in Nextcloud

**PARA Structure:**

```
/opt/nextcloud/files/oscar/files/
├── Areas/                     # Life responsibilities
│   ├── Work/
│   │   ├── CTS010 denovoSkin/
│   │   │   ├── Deliverables/
│   │   │   ├── Contracts/
│   │   │   ├── Presentations/
│   │   │   └── General/
│   │   ├── SOBI036 Anakinra/
│   │   └── General Work/
│   └── Life/
│       ├── Health/
│       ├── Finance/
│       ├── Travel/
│       └── Family/
├── Projects/                  # Active initiatives
├── Resources/                 # References and interests
└── Archive/                   # Completed items
```

**Work Project Subfolders:**

Detected from existing client projects:

```typescript
const CLIENT_PROJECT_SUBFOLDERS = [
  'Deliverables',    // Reports, submissions
  'Contracts',       // Agreements, SOWs
  'Presentations',   // Slides, decks
  'Data',           // Datasets, analysis files
  'Correspondence', // Email threads, letters
  'Meeting Notes',  // Minutes, agendas
  'Reference',      // Background materials
  'General',        // Misc files
];
```

**Subfolder Assignment Logic:**

```typescript
function determineSubfolder(filename: string, content: string): string {
  const lower = filename.toLowerCase();

  if (/\b(deliverable|report|submission|final)\b/i.test(content)) {
    return 'Deliverables';
  }
  if (/\b(contract|agreement|sow)\b/i.test(content)) {
    return 'Contracts';
  }
  if (/\b(presentation|slide|deck)\b/i.test(lower)) {
    return 'Presentations';
  }
  if (/\b(data|dataset|analysis|excel)\b/i.test(lower)) {
    return 'Data';
  }
  if (/\b(email|correspondence|letter)\b/i.test(content)) {
    return 'Correspondence';
  }
  if (/\b(meeting|minutes|agenda)\b/i.test(content)) {
    return 'Meeting Notes';
  }

  return 'General';
}
```

**File Move Process:**

```typescript
const sourcePath = '/opt/nextcloud/.../Inbox/proposal.pdf';
const destPath = '/opt/nextcloud/.../Areas/Work/CTS010 denovoSkin/Deliverables/proposal.pdf';

// Create destination directory if needed
await fs.mkdir(path.dirname(destPath), { recursive: true });

// Move file
await fs.rename(sourcePath, destPath);

// Update database
await sql`
  UPDATE files SET
    file_path = ${destPath},
    folder = ${extractFolderName(destPath)},
    subfolder = 'Deliverables',
    processing_status = 'processed',
    processed_at = NOW()
  WHERE id = ${fileId}
`;

// Trigger Nextcloud scan
await exec(`sudo -u www-data php /var/www/html/occ files:scan oscar --path="${destPath}"`);
```

**Nextcloud Sync:**

After file moves, run `occ files:scan` to update Nextcloud's file cache:

```bash
#!/bin/bash
# scripts/nc-sync.sh

FILE_PATH="$1"
if [ -z "$FILE_PATH" ]; then
  # Full scan if no path specified
  sudo -u www-data php /var/www/html/occ files:scan oscar
else
  # Scan specific path
  sudo -u www-data php /var/www/html/occ files:scan oscar --path="$FILE_PATH"
fi
```

This makes moved files immediately visible in Nextcloud web UI and desktop clients.

---

### Stage 5: Chunk for RAG

**Script:** `scripts/generate-chunks.ts`
**Frequency:** After file processing (every 10 min)
**Algorithm:** Hierarchical recursive chunking

**Why Chunking?**

Large documents (100+ pages) can't fit in LLM context. Chunking enables:
- **Precise retrieval:** Return only relevant sections
- **Better embeddings:** Smaller chunks = more focused semantics
- **Source attribution:** "Found in Section 3.2: Cost Analysis"

**Chunking Strategy:**

```
Document (Level 0)
├─ Section 1 (Level 1)
│  ├─ Paragraph 1 (Level 2)
│  ├─ Paragraph 2 (Level 2)
│  └─ Paragraph 3 (Level 2)
├─ Section 2 (Level 1)
│  ├─ Subsection 2.1 (Level 2)
│  │  ├─ Paragraph 1 (Level 3)
│  │  └─ Paragraph 2 (Level 3)
│  └─ Subsection 2.2 (Level 2)
└─ Section 3 (Level 1)
```

**Algorithm:**

```typescript
async function generateChunks(fileId: string) {
  // 1. Fetch extracted content
  const file = await sql`
    SELECT content_extracted, filename
    FROM files
    WHERE id = ${fileId}
  `;

  // 2. Parse markdown structure (from Dockling)
  const sections = parseMarkdownHeadings(file.content_extracted);

  // 3. Create hierarchical chunks
  const chunks: Chunk[] = [];

  for (const section of sections) {
    // Section-level chunk
    chunks.push({
      file_id: fileId,
      chunk_index: chunks.length,
      content: section.content,
      heading: section.heading,
      heading_path: section.path, // "1. Introduction > 1.1 Background"
      hierarchy_level: section.level,
      token_count: countTokens(section.content),
      char_start: section.start,
      char_end: section.end,
    });

    // Paragraph-level chunks (if section > 1000 tokens)
    if (countTokens(section.content) > 1000) {
      const paragraphs = section.content.split('\n\n');
      for (const para of paragraphs) {
        if (para.trim().length > 50) {
          chunks.push({
            file_id: fileId,
            chunk_index: chunks.length,
            content: para,
            heading: section.heading,
            heading_path: section.path,
            hierarchy_level: section.level + 1,
            token_count: countTokens(para),
          });
        }
      }
    }
  }

  // 4. Insert chunks
  await sql`
    INSERT INTO file_chunks ${sql(chunks)}
  `;

  return chunks.length;
}
```

**Chunk Metadata:**

Each chunk stores:
- `heading` - Section title (e.g., "Cost-Effectiveness Analysis")
- `heading_path` - Full path (e.g., "Methods > Analysis > Cost-Effectiveness")
- `hierarchy_level` - 0 (doc) → 1 (section) → 2 (subsection) → 3 (paragraph)
- `token_count` - For LLM context management
- `char_start`, `char_end` - Original position in document

**Output:**

```
✅ Generated 47 chunks for proposal.pdf
   - 8 section-level chunks
   - 39 paragraph-level chunks
   - Max tokens: 987
   - Avg tokens: 342
```

---

### Stage 6: Generate Embeddings

**Script:** `scripts/generate-embeddings.ts`
**Frequency:** After chunking (every 10 min)
**Model:** OpenAI text-embedding-3-small
**Dimensions:** 1536
**Cost:** $0.02 per 1M tokens (~$0.0001 per document)

**Why Embeddings?**

Traditional keyword search fails for:
- **Synonyms:** "cost-effective" vs "economical"
- **Concepts:** "machine learning" includes "neural networks", "deep learning"
- **Context:** "bank" (river) vs "bank" (financial)

Embeddings enable **semantic search**: find documents by meaning, not just keywords.

**Process:**

1. **Query files/chunks without embeddings:**
   ```sql
   SELECT id, content_extracted FROM files
   WHERE embedding IS NULL
   AND processing_status = 'processed'
   LIMIT 100;
   ```

2. **Generate file-level embeddings:**
   ```typescript
   const response = await fetch('https://api.openai.com/v1/embeddings', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       model: 'text-embedding-3-small',
       input: file.content_extracted.slice(0, 8000), // First ~8K chars
     }),
   });

   const embedding = response.data[0].embedding; // [1536 floats]
   ```

3. **Store in database (pgvector):**
   ```sql
   UPDATE files SET
     embedding = ${sql.vector(embedding)},
     embedding_model = 'text-embedding-3-small',
     embedded_at = NOW()
   WHERE id = ${fileId}
   ```

4. **Generate chunk-level embeddings:**
   ```sql
   SELECT id, content FROM file_chunks
   WHERE embedding IS NULL
   LIMIT 500
   ```

   Same process, but for individual chunks (enables precise retrieval).

**Batch Processing:**

```typescript
// Batch requests to reduce API calls
const BATCH_SIZE = 100;
const batches = chunk(chunksWithoutEmbeddings, BATCH_SIZE);

for (const batch of batches) {
  const inputs = batch.map(c => c.content);

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: inputs, // Array of strings
    }),
  });

  // Update all chunks in batch
  for (let i = 0; i < batch.length; i++) {
    await sql`
      UPDATE file_chunks SET
        embedding = ${sql.vector(response.data[i].embedding)},
        embedded_at = NOW()
      WHERE id = ${batch[i].id}
    `;
  }
}
```

**Output:**

```
✅ Generated embeddings for 23 files
✅ Generated embeddings for 487 chunks
📊 Coverage: 97.5% (2,836 / 2,908 chunks embedded)
💰 Cost: $0.04
```

**Semantic Search Example:**

Once embedded, files are searchable via RAG:

```typescript
// User query: "cost effectiveness analysis"
const queryEmbedding = await generateEmbedding("cost effectiveness analysis");

// Find similar chunks (cosine similarity)
const results = await sql`
  SELECT
    c.content,
    c.heading_path,
    f.filename,
    1 - (c.embedding <=> ${sql.vector(queryEmbedding)}) as similarity
  FROM file_chunks c
  JOIN files f ON c.file_id = f.id
  WHERE 1 - (c.embedding <=> ${sql.vector(queryEmbedding)}) > 0.7
  ORDER BY similarity DESC
  LIMIT 10
`;

// Returns:
// 1. "Methods > Cost-Effectiveness Analysis" (similarity: 0.92)
// 2. "Results > Economic Evaluation" (similarity: 0.87)
// 3. "Discussion > Value for Money" (similarity: 0.81)
```

---

## Configuration

### Environment Variables

```bash
# File Processing
NEXTCLOUD_BASE_PATH=/opt/nextcloud/files/oscar/files
DOCKLING_API_URL=https://modal.com/api/dockling
MODAL_TOKEN=tok-xxxxx

# AI Models
OPENROUTER_API_KEY=sk-or-xxxxx
FILE_CLASSIFICATION_MODEL=anthropic/claude-3.5-haiku
EMBEDDING_MODEL=text-embedding-3-small
OPENAI_API_KEY=sk-xxxxx

# Thresholds
CLASSIFICATION_CONFIDENCE_THRESHOLD=0.7  # Below this → needs review
MAX_PAGES_FOR_CLASSIFICATION=10          # First N pages for AI
CHUNK_MAX_TOKENS=1000                    # Max tokens per chunk
EMBEDDING_BATCH_SIZE=100                 # Embeddings per API call
```

### File Type Handlers

Add new file types in `lib/files.ts`:

```typescript
const FILE_HANDLERS = {
  '.pdf': extractPDF,
  '.docx': extractDOCX,
  '.pptx': extractPPTX,
  '.xlsx': extractXLSX,
  '.txt': extractPlainText,
  '.md': extractMarkdown,
  '.png': extractImageOCR,
  '.jpg': extractImageOCR,
};

export async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const handler = FILE_HANDLERS[ext];

  if (!handler) {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  return await handler(filePath);
}
```

### PARA Folder Mapping

Define in `lib/files.ts`:

```typescript
export const PARA_FOLDERS = {
  work: {
    base: 'Areas/Work',
    projects: [], // Loaded from database
    subfolders: [
      'Deliverables',
      'Contracts',
      'Presentations',
      'Data',
      'Correspondence',
      'Meeting Notes',
      'Reference',
      'General',
    ],
  },
  personal: {
    base: 'Areas/Life',
    areas: [
      'Health',
      'Finance',
      'Travel',
      'Family',
      'Learning',
      'Hobbies',
    ],
  },
};
```

---

## Troubleshooting

### File Not Detected

**Symptoms:**
- File in Inbox but not showing in database
- No Telegram notification

**Diagnosis:**

1. **Check file permissions:**
   ```bash
   ls -la /opt/nextcloud/files/oscar/files/Inbox/
   ```
   Should be owned by `ubuntu:ubuntu` or `www-data:www-data`

2. **Check file extension:**
   ```bash
   file /path/to/file
   ```
   Must be in supported list: pdf, docx, pptx, xlsx, txt, md, png, jpg

3. **Check inbox scan logs:**
   ```bash
   cd ~/.claude/tools
   bun run sync/files-inbox-scan.ts
   ```

4. **Check database:**
   ```sql
   SELECT * FROM files
   WHERE filename = 'problem-file.pdf';
   ```

**Common Causes:**

1. **Temp file prefix:** Files starting with `.` or `~$` are ignored
2. **Wrong location:** File in subfolder, not directly in Inbox
3. **Already processed:** File exists in database (check `processing_status`)

---

### Extraction Failed

**Symptoms:**
- File status stuck on `'pending'`
- No `content_extracted` in database

**Diagnosis:**

1. **Check Dockling API:**
   ```bash
   curl -X POST https://modal.com/api/dockling \
     -H "Authorization: Bearer $MODAL_TOKEN" \
     -F "file=@/path/to/file.pdf"
   ```

2. **Check file processing logs:**
   ```bash
   cd ~/.claude/tools
   bun run sync/files-process.ts
   ```

3. **Check database:**
   ```sql
   SELECT
     filename,
     processing_status,
     extraction_error,
     extraction_attempted_at
   FROM files
   WHERE content_extracted IS NULL;
   ```

**Common Causes:**

1. **Corrupted file:** PDF can't be parsed
   - **Fix:** Re-download file

2. **Dockling timeout:** Large file (>100 pages)
   - **Fix:** Increase Modal timeout or split file

3. **Modal API quota:** Free tier limit reached
   - **Fix:** Upgrade Modal plan or wait for quota reset

---

### Classification Wrong

**Symptoms:**
- Work file classified as personal (or vice versa)
- File routed to wrong project

**Diagnosis:**

1. **Check classification reasoning:**
   ```sql
   SELECT
     filename,
     classification_reasoning,
     classification_confidence,
     folder
   FROM files
   WHERE filename = 'misclassified.pdf';
   ```

2. **Review extracted content:**
   ```sql
   SELECT content_extracted FROM files
   WHERE id = 'file-id';
   ```

3. **Check work projects context:**
   ```sql
   SELECT project_code, project_name, status
   FROM work_projects
   WHERE status = 'active';
   ```

**Common Causes:**

1. **Ambiguous content:** File mentions multiple projects
   - **Fix:** Add user hint via Telegram

2. **Missing project code:** New project not in database
   - **Fix:** Add to `work_projects` table

3. **Low confidence:** Score < 0.7 but auto-classified anyway
   - **Fix:** Increase threshold in config

**Manual Reclassification:**

```bash
# 1. Move file manually
mv "/opt/.../Areas/Life/Health/report.pdf" \
   "/opt/.../Areas/Work/CTS010 denovoSkin/Deliverables/report.pdf"

# 2. Update database
psql "$DATABASE_URL" <<SQL
UPDATE files SET
  file_path = '/opt/.../Areas/Work/CTS010 denovoSkin/Deliverables/report.pdf',
  folder = 'Areas/Work/CTS010 denovoSkin',
  subfolder = 'Deliverables',
  classification_confidence = 1.0,
  classification_reasoning = 'Manually reclassified by user'
WHERE id = 'file-id';
SQL

# 3. Trigger Nextcloud scan
sudo -u www-data php /var/www/html/occ files:scan oscar
```

---

### Chunks Not Generated

**Symptoms:**
- File processed but no entries in `file_chunks`
- RAG search doesn't find file

**Diagnosis:**

1. **Check chunk generation:**
   ```bash
   cd ~/.claude/tools
   bun run scripts/generate-chunks.ts
   ```

2. **Check database:**
   ```sql
   SELECT
     f.filename,
     COUNT(c.id) as chunk_count
   FROM files f
   LEFT JOIN file_chunks c ON f.id = c.file_id
   WHERE f.processing_status = 'processed'
   GROUP BY f.filename
   HAVING COUNT(c.id) = 0;
   ```

**Common Causes:**

1. **Empty content:** `content_extracted` is NULL or empty
   - **Fix:** Re-run extraction

2. **Parsing error:** Markdown structure invalid
   - **Fix:** Check `content_extracted` format

3. **Script not run:** Chunking happens after processing
   - **Fix:** Wait for next sync cycle or run manually

---

### Embeddings Not Generated

**Symptoms:**
- Chunks exist but `embedding` column is NULL
- Semantic search returns no results

**Diagnosis:**

1. **Check embedding coverage:**
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE embedding IS NOT NULL) * 100.0 / COUNT(*) as coverage_pct,
     COUNT(*) FILTER (WHERE embedding IS NULL) as missing_count
   FROM file_chunks;
   ```

2. **Check OpenAI API:**
   ```bash
   curl https://api.openai.com/v1/embeddings \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"text-embedding-3-small","input":"test"}'
   ```

3. **Run embedding generation:**
   ```bash
   cd ~/.claude/tools
   bun run scripts/generate-embeddings.ts
   ```

**Common Causes:**

1. **API key invalid:** OpenAI key expired or wrong
   - **Fix:** Update `OPENAI_API_KEY` in `.env`

2. **API quota:** Free tier limit reached
   - **Fix:** Upgrade OpenAI plan

3. **Batch size too large:** >100 chunks per request
   - **Fix:** Reduce `EMBEDDING_BATCH_SIZE` in config

---

### File Not Searchable

**Symptoms:**
- File processed, chunked, embedded
- But RAG search doesn't return it

**Diagnosis:**

1. **Check RAG search directly:**
   ```bash
   cd ~/.claude/tools
   bun run rag-search.ts "query text" --folder "CTS010"
   ```

2. **Check chunk embeddings:**
   ```sql
   SELECT
     f.filename,
     c.heading_path,
     c.embedding IS NOT NULL as has_embedding
   FROM file_chunks c
   JOIN files f ON c.file_id = f.id
   WHERE f.filename = 'missing-file.pdf';
   ```

3. **Check similarity threshold:**
   ```sql
   SELECT
     f.filename,
     c.heading_path,
     1 - (c.embedding <=> '[your-query-embedding]'::vector) as similarity
   FROM file_chunks c
   JOIN files f ON c.file_id = f.id
   ORDER BY similarity DESC
   LIMIT 20;
   ```

**Common Causes:**

1. **Low similarity:** Query doesn't match content semantically
   - **Fix:** Try more specific query

2. **Wrong folder filter:** Searching in wrong project
   - **Fix:** Remove folder filter or check file's actual folder

3. **Embedding model mismatch:** Query uses different model than indexing
   - **Fix:** Regenerate embeddings with correct model

---

## Performance Metrics

### Current State (February 2026)

**Database:**
- Files indexed: 73
- Chunks generated: 2,908
- Embeddings: 2,836 (97.5% coverage)

**Processing Times:**
- Inbox scan: ~2 seconds
- Extraction (per file): 5-30 seconds (varies by size)
- Classification: ~3-5 seconds per file
- Chunking: ~1-2 seconds per file
- Embedding: ~0.5 seconds per 100 chunks

**Total Pipeline:**
- Small file (5 pages PDF): ~20 seconds
- Medium file (50 pages PDF): ~90 seconds
- Large file (200 pages PDF): ~5 minutes

### Bottlenecks

1. **Dockling API latency:** 5-30 seconds per file (depends on Modal cold start)
2. **AI classification:** 3-5 seconds per file (OpenRouter → Claude Haiku)
3. **OpenAI embeddings:** Rate limited to 3,000 RPM

### Optimization Opportunities

1. **Parallel processing:** Process multiple files concurrently
2. **Dockling caching:** Results cached 24h, but cold starts still slow
3. **Incremental embeddings:** Only embed new chunks, not entire document
4. **Local embedding model:** Replace OpenAI with local ONNX model

---

## Related Documentation

- [RAG Search](./rag-search.md) - Semantic search over processed files
- [Telegram Bot](./telegram-bot.md) - Real-time inbox watcher interface
- [Notion Sync](./notion-sync.md) - How file metadata syncs
- [Database Schema](../04-development/database-schema.md) - Files and chunks tables
