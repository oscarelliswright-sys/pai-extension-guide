# Database Schema

**Database:** Neon PostgreSQL (eu-west-2)
**Tables:** 47 total
**Extensions:** pgvector (vector embeddings), pg_trgm (full-text search)
**Purpose:** Central data store for all PAI components

---

## Table of Contents

1. [Overview](#overview)
2. [Core Data Tables](#core-data-tables)
3. [File System Tables](#file-system-tables)
4. [Email Tables](#email-tables)
5. [Calendar & Meetings](#calendar--meetings)
6. [Media & Entertainment](#media--entertainment)
7. [System & Monitoring](#system--monitoring)
8. [OAuth & Authentication](#oauth--authentication)
9. [Common Patterns](#common-patterns)
10. [Indexes & Performance](#indexes--performance)

---

## Overview

The PAI database uses **PostgreSQL** with the **pgvector** extension for vector similarity search.

### Key Characteristics

**Normalized Structure:**
- Separate tables for entities (tasks, projects, notes, etc.)
- Join tables for many-to-many relationships
- Foreign keys enforce referential integrity

**Timestamp Tracking:**
- `created_at` - When created in PostgreSQL
- `updated_at` - When last modified in PostgreSQL
- `notion_last_edited_at` - Last edit time in Notion (for synced items)
- `sql_local_last_edited_at` - Last edit time in PostgreSQL (for conflict resolution)

**Soft Deletes:**
- Most tables use status columns instead of DELETE
- `status = 'cancelled'` or `'archived'` instead of removal
- Preserves history and relationships

---

## Core Data Tables

### tasks

**Purpose:** User tasks (todos, action items)
**Synced with:** Notion
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Task name |
| `notes` | TEXT | Task description/details |
| `status` | VARCHAR | todo, in_progress, done, cancelled |
| `priority` | VARCHAR | low, medium, high, critical |
| `due_date` | TIMESTAMP | Deadline |
| `completed_at` | TIMESTAMP | When marked done |
| `project_id` | UUID | FK to projects |
| `source` | VARCHAR | email, meeting, telegram, manual |
| `notion_page_id` | VARCHAR | Notion page ID (or sql:* temp ID) |
| `notion_last_edited_at` | TIMESTAMP | Last Notion edit time |
| `sql_local_last_edited_at` | TIMESTAMP | Last SQL edit time |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Indexes:**
- `tasks_notion_page_id_idx` (unique) - Notion sync
- `tasks_status_idx` - Query by status
- `tasks_due_date_idx` - Query by deadline
- `tasks_project_id_idx` - Project tasks

**Relationships:**
- Many-to-one with `projects`
- Many-to-many with `tags` (via join table)

---

### projects

**Purpose:** Active projects (work and personal)
**Synced with:** Notion
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Project name |
| `description` | TEXT | Project overview |
| `status` | VARCHAR | active, on_hold, completed |
| `type` | VARCHAR | work, personal, learning |
| `start_date` | DATE | Project start |
| `target_date` | DATE | Target completion |
| `notion_page_id` | VARCHAR | Notion page ID |
| `notion_last_edited_at` | TIMESTAMP | Last Notion edit |
| `sql_local_last_edited_at` | TIMESTAMP | Last SQL edit |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Relationships:**
- One-to-many with `tasks`
- One-to-many with `notes`
- Many-to-many with `tags`
- Many-to-many with `goals`

---

### notes

**Purpose:** Text notes, meeting minutes, ideas
**Synced with:** Notion
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Note title |
| `content` | TEXT | Note body (markdown) |
| `type` | VARCHAR | meeting, idea, learning, reference |
| `project_id` | UUID | FK to projects (optional) |
| `notion_page_id` | VARCHAR | Notion page ID |
| `notion_last_edited_at` | TIMESTAMP | Last Notion edit |
| `sql_local_last_edited_at` | TIMESTAMP | Last SQL edit |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Relationships:**
- Many-to-one with `projects`
- Many-to-many with `tags`

---

### goals

**Purpose:** Personal and professional goals
**Synced with:** Notion
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Goal description |
| `category` | VARCHAR | health, career, learning, finance, etc. |
| `progress` | INTEGER | Percent complete (0-100) |
| `target_date` | DATE | Target completion date |
| `status` | VARCHAR | active, achieved, abandoned |
| `notes` | TEXT | Progress notes |
| `notion_page_id` | VARCHAR | Notion page ID |
| `notion_last_edited_at` | TIMESTAMP | Last Notion edit |
| `sql_local_last_edited_at` | TIMESTAMP | Last SQL edit |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Relationships:**
- Many-to-many with `projects` (via `project_goals`)

---

### people

**Purpose:** Contacts, colleagues, family
**Synced with:** Notion
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Full name |
| `relationship` | VARCHAR | family, friend, colleague, client |
| `email` | TEXT | Primary email |
| `phone` | TEXT | Phone number |
| `notes` | TEXT | Additional info |
| `notion_page_id` | VARCHAR | Notion page ID |
| `notion_last_edited_at` | TIMESTAMP | Last Notion edit |
| `sql_local_last_edited_at` | TIMESTAMP | Last SQL edit |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Relationships:**
- Many-to-many with `projects`
- Many-to-many with `tags`

---

### tags

**Purpose:** Categorization labels
**Synced with:** Notion
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Tag name |
| `type` | VARCHAR | area, resource |
| `description` | TEXT | Tag purpose |
| `notion_page_id` | VARCHAR | Notion page ID |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Used by:**
- Tasks
- Projects
- Notes
- People

---

## File System Tables

### files

**Purpose:** File index for Nextcloud documents
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `filename` | TEXT | File name |
| `file_path` | TEXT | Full path in Nextcloud |
| `file_size` | BIGINT | Size in bytes |
| `file_type` | VARCHAR | pdf, docx, pptx, xlsx, txt, md, etc. |
| `mime_type` | VARCHAR | MIME type |
| `folder` | TEXT | Folder name (extracted from path) |
| `subfolder` | TEXT | Subfolder (Deliverables, Contracts, etc.) |
| `processing_status` | VARCHAR | pending, extracted, processed, failed |
| `content_extracted` | TEXT | Full text content (from Dockling) |
| `content_summary` | TEXT | AI-generated summary |
| `classification_confidence` | FLOAT | AI confidence score (0-1) |
| `classification_reasoning` | TEXT | Why classified this way |
| `extraction_completed_at` | TIMESTAMP | When text extracted |
| `extraction_error` | TEXT | Error message if failed |
| `processed_at` | TIMESTAMP | When fully processed |
| `embedding` | VECTOR(1536) | Document-level embedding |
| `embedding_model` | VARCHAR | Model used (text-embedding-3-small) |
| `embedded_at` | TIMESTAMP | When embedding generated |
| `created_at` | TIMESTAMP | When file detected |
| `updated_at` | TIMESTAMP | Last modification |

**Indexes:**
- `files_file_path_idx` (unique) - No duplicates
- `files_processing_status_idx` - Query by status
- `files_folder_idx` - Search by folder
- `files_embedding_idx` (ivfflat) - Vector search

**Relationships:**
- One-to-many with `file_chunks`

---

### file_chunks

**Purpose:** Hierarchical chunks for RAG search
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `file_id` | UUID | FK to files |
| `chunk_index` | INTEGER | Order in file |
| `content` | TEXT | Chunk text |
| `heading` | TEXT | Section title |
| `heading_path` | TEXT | Full path (e.g., "Methods > Analysis") |
| `hierarchy_level` | INTEGER | 0=doc, 1=section, 2=subsection, 3=para |
| `token_count` | INTEGER | Approximate tokens |
| `char_start` | INTEGER | Start position in original |
| `char_end` | INTEGER | End position in original |
| `embedding` | VECTOR(1536) | Chunk-level embedding |
| `embedded_at` | TIMESTAMP | When embedding generated |
| `created_at` | TIMESTAMP | Creation time |

**Indexes:**
- `file_chunks_file_id_idx` - Find chunks for file
- `file_chunks_embedding_idx` (ivfflat) - Vector search

---

### file_deliverable_tracking

**Purpose:** Track work project deliverables mentioned in files
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `file_id` | UUID | FK to files |
| `project_code` | VARCHAR | CTS010, SOBI036, etc. |
| `deliverable_type` | VARCHAR | report, presentation, analysis, etc. |
| `status` | VARCHAR | draft, review, final |
| `mentioned_at` | TIMESTAMP | When detected |
| `created_at` | TIMESTAMP | Creation time |

---

### pending_files

**Purpose:** Files awaiting user classification (low confidence)
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `file_path` | TEXT | Full path |
| `suggested_folder` | TEXT | AI suggestion |
| `confidence` | FLOAT | AI confidence (0-1) |
| `reasoning` | TEXT | AI reasoning |
| `status` | VARCHAR | pending, approved, rejected |
| `user_decision` | TEXT | User's choice |
| `telegram_message_id` | TEXT | Message ID for tracking |
| `created_at` | TIMESTAMP | Creation time |
| `resolved_at` | TIMESTAMP | When user decided |

---

## Email Tables

### email_logs

**Purpose:** Processed emails from Gmail
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `gmail_message_id` | VARCHAR | Gmail API message ID (unique) |
| `gmail_thread_id` | VARCHAR | Gmail thread ID |
| `subject` | TEXT | Email subject |
| `sender_email` | VARCHAR | From address |
| `sender_name` | VARCHAR | From name |
| `received_at` | TIMESTAMP | When received |
| `snippet` | TEXT | First 100 chars |
| `body_text` | TEXT | Full plain text body |
| `category` | VARCHAR | actionable, informational, promotional, junk |
| `classification_confidence` | FLOAT | AI confidence (0-1) |
| `classification_model` | VARCHAR | Model used (gemma-2-9b-it) |
| `classification_reasoning` | TEXT | Why classified this way |
| `classified_at` | TIMESTAMP | When classified |
| `extracted_deadlines` | JSONB | Array of {text, date, type} |
| `extracted_contacts` | JSONB | Array of {name, context} |
| `extracted_action_items` | JSONB | Array of strings |
| `extraction_summary` | TEXT | One-sentence summary |
| `processing_status` | VARCHAR | processed, needs_review |
| `gmail_labels` | JSONB | Array of label names |
| `embedding` | VECTOR(1536) | Email embedding |
| `embedded_at` | TIMESTAMP | When embedding generated |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**Indexes:**
- `email_logs_gmail_message_id_idx` (unique) - No duplicates
- `email_logs_category_idx` - Filter by category
- `email_logs_sender_email_idx` - Sender lookup
- `email_logs_embedding_idx` (ivfflat) - Semantic search

---

### email_sender_stats

**Purpose:** Sender patterns for classification learning
**Primary Key:** `sender_email` (VARCHAR)

| Column | Type | Description |
|--------|------|-------------|
| `sender_email` | VARCHAR | Primary key |
| `sender_name` | VARCHAR | Display name |
| `sender_domain` | VARCHAR | Email domain |
| `total_count` | INTEGER | Total emails received |
| `actionable_count` | INTEGER | Actionable emails |
| `informational_count` | INTEGER | Informational emails |
| `promotional_count` | INTEGER | Promotional emails |
| `junk_count` | INTEGER | Junk emails |
| `suggested_action` | VARCHAR | Pattern suggestion |
| `last_email_at` | TIMESTAMP | Most recent email |
| `created_at` | TIMESTAMP | First seen |
| `updated_at` | TIMESTAMP | Last update |

---

### email_label_rules

**Purpose:** Learned labeling rules from user corrections
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `sender_email` | VARCHAR | Sender to match |
| `label_name` | VARCHAR | Target Gmail label |
| `confidence` | FLOAT | Rule confidence (0-1) |
| `correction_count` | INTEGER | Times user corrected |
| `source` | VARCHAR | user_correction, ai_analysis |
| `created_at` | TIMESTAMP | First correction |
| `updated_at` | TIMESTAMP | Last update |

**Unique Constraint:** `(sender_email, label_name)`

---

### pending_email_tasks

**Purpose:** Email action items awaiting Telegram confirmation
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email_id` | UUID | FK to email_logs |
| `proposed_title` | TEXT | Task title |
| `proposed_notes` | TEXT | Task details |
| `proposed_due_date` | DATE | Suggested deadline |
| `status` | VARCHAR | pending, approved, rejected |
| `telegram_message_id` | TEXT | Message ID |
| `created_at` | TIMESTAMP | Creation time |
| `resolved_at` | TIMESTAMP | When user decided |

---

## Calendar & Meetings

### calendar_events

**Purpose:** Google Calendar events
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `google_event_id` | VARCHAR | Google Calendar event ID (unique) |
| `summary` | TEXT | Event title |
| `description` | TEXT | Event details |
| `location` | TEXT | Where |
| `start_time` | TIMESTAMP | Start (with timezone) |
| `end_time` | TIMESTAMP | End (with timezone) |
| `calendar_type` | VARCHAR | personal, work_readonly |
| `source_task_id` | UUID | FK to tasks (if created from task) |
| `google_last_modified` | TIMESTAMP | Last edit in Google |
| `sql_local_last_edited_at` | TIMESTAMP | Last edit in SQL |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**Indexes:**
- `calendar_events_google_event_id_idx` (unique)
- `calendar_events_start_time_idx` - Range queries

---

### meetings

**Purpose:** Recorded meeting metadata and transcripts
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `recording_path` | TEXT | Path to video file (unique) |
| `title` | TEXT | Meeting title (AI extracted) |
| `recorded_at` | TIMESTAMP | When meeting happened |
| `recording_duration_seconds` | INTEGER | Duration |
| `processing_status` | VARCHAR | pending, transcribing, extracted, failed |
| `processing_error` | TEXT | Error if failed |
| `transcript_text` | TEXT | Full cleaned transcript |
| `transcript_vtt` | TEXT | WebVTT format |
| `transcript_json` | JSONB | Array of segments |
| `summary` | TEXT | Meeting summary |
| `attendees` | JSONB | Array of {name, role} |
| `action_items` | JSONB | Array of {task, assignee, deadline} |
| `decisions` | JSONB | Array of strings |
| `topics_discussed` | JSONB | Array of strings |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**Indexes:**
- `meetings_recording_path_idx` (unique)
- `meetings_recorded_at_idx` - Date queries

---

### meeting_chunks

**Purpose:** Transcript chunks for RAG search
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `meeting_id` | UUID | FK to meetings |
| `content` | TEXT | Chunk text (speaker turn) |
| `speaker` | VARCHAR | Speaker name |
| `sequence_number` | INTEGER | Order in meeting |
| `heading` | TEXT | Topic (optional) |
| `heading_path` | TEXT | Topic path |
| `level` | INTEGER | Hierarchy level |
| `token_count` | INTEGER | Approximate tokens |
| `embedding` | VECTOR(1536) | Chunk embedding |
| `embedded_at` | TIMESTAMP | When embedded |
| `created_at` | TIMESTAMP | Creation time |

---

## Media & Entertainment

### media_watchlist

**Purpose:** Movies, TV shows, anime to watch
**Synced with:** Notion
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Movie/show name |
| `type` | VARCHAR | movie, tv, anime |
| `status` | VARCHAR | watching, completed, plan_to_watch |
| `rating` | INTEGER | 1-10 |
| `notes` | TEXT | Review/thoughts |
| `tmdb_id` | INTEGER | TMDB API ID |
| `poster_url` | TEXT | Cover image URL |
| `year` | INTEGER | Release year |
| `notion_page_id` | VARCHAR | Notion page ID |
| `notion_last_edited_at` | TIMESTAMP | Last Notion edit |
| `sql_local_last_edited_at` | TIMESTAMP | Last SQL edit |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

---

### games_backlog

**Purpose:** Video games backlog
**Synced with:** Notion
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Game title |
| `platform` | VARCHAR | PC, PS5, Switch, Xbox, etc. |
| `status` | VARCHAR | playing, completed, backlog |
| `rating` | INTEGER | 1-10 |
| `hours_played` | INTEGER | Playtime |
| `notes` | TEXT | Review/thoughts |
| `rawg_id` | INTEGER | RAWG API ID |
| `cover_url` | TEXT | Game cover URL |
| `notion_page_id` | VARCHAR | Notion page ID |
| `notion_last_edited_at` | TIMESTAMP | Last Notion edit |
| `sql_local_last_edited_at` | TIMESTAMP | Last SQL edit |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

---

## System & Monitoring

### system_upgrades

**Purpose:** PAI feature ideas and planned improvements
**Synced with:** Notion
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Feature description |
| `status` | VARCHAR | idea, planned, in_progress, done |
| `priority` | VARCHAR | low, medium, high, critical |
| `category` | VARCHAR | database, automation, ui, etc. |
| `description` | TEXT | Detailed plan |
| `source` | VARCHAR | telegram, ai_analysis, manual |
| `project_plan_url` | TEXT | Link to implementation plan |
| `associated_links` | TEXT | Related docs |
| `notion_page_id` | VARCHAR | Notion page ID |
| `notion_last_edited_at` | TIMESTAMP | Last Notion edit |
| `sql_local_last_edited_at` | TIMESTAMP | Last SQL edit |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

---

### system_fixes

**Purpose:** PAI bugs and issues
**Synced with:** Notion
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Bug description |
| `status` | VARCHAR | reported, investigating, in_progress, fixed |
| `priority` | VARCHAR | low, medium, high, critical |
| `category` | VARCHAR | sync, email, file_processing, etc. |
| `description` | TEXT | Bug details |
| `steps_to_reproduce` | TEXT | How to trigger |
| `affected_component` | VARCHAR | Which system |
| `source` | VARCHAR | telegram, user_report, auto_detection |
| `resolution_notes` | TEXT | How fixed |
| `notion_page_id` | VARCHAR | Notion page ID |
| `notion_last_edited_at` | TIMESTAMP | Last Notion edit |
| `sql_local_last_edited_at` | TIMESTAMP | Last SQL edit |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

---

### sync_run_history

**Purpose:** Track sync execution for monitoring
**Primary Key:** `id` (SERIAL)

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `sync_name` | VARCHAR | Script name (e.g., "tasks-notion-to-sql") |
| `entity` | VARCHAR | Entity type (tasks, projects, etc.) |
| `direction` | VARCHAR | inbound, outbound |
| `status` | VARCHAR | started, completed, failed |
| `started_at` | TIMESTAMP | Start time |
| `completed_at` | TIMESTAMP | End time |
| `duration_ms` | INTEGER | Duration in milliseconds |
| `records_processed` | INTEGER | Number of records |
| `records_created` | INTEGER | New records |
| `records_updated` | INTEGER | Modified records |
| `records_skipped` | INTEGER | Unchanged records |
| `error_message` | TEXT | Error if failed |

**Indexes:**
- `sync_run_history_entity_idx` - Filter by entity
- `sync_run_history_started_at_idx` - Time range queries

---

### ai_call_log

**Purpose:** Track AI API usage and costs
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `automation_name` | VARCHAR | Which system called (email, file, meeting) |
| `model` | VARCHAR | Model used |
| `provider` | VARCHAR | openrouter, openai, groq |
| `input_tokens` | INTEGER | Prompt tokens |
| `output_tokens` | INTEGER | Response tokens |
| `total_cost` | DECIMAL | Cost in USD |
| `purpose` | VARCHAR | classification, extraction, etc. |
| `call_timestamp` | TIMESTAMP | When called |

**Indexes:**
- `ai_call_log_automation_name_idx` - Cost by automation
- `ai_call_log_call_timestamp_idx` - Time series analysis

---

### bot_logs

**Purpose:** Telegram conversation logs
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `conversation_id` | VARCHAR | Session identifier |
| `user_id` | VARCHAR | Telegram user ID |
| `operation` | VARCHAR | message_received, tool_call, api_call, etc. |
| `message` | TEXT | Log message |
| `metadata` | JSONB | Additional data |
| `timestamp` | TIMESTAMP | When logged |

**Indexes:**
- `bot_logs_conversation_id_idx` - Session queries
- `bot_logs_timestamp_idx` - Time range

---

### llm_models

**Purpose:** LLM model database for recommendations
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `model_id` | VARCHAR | Provider model ID (unique) |
| `provider` | VARCHAR | anthropic, openai, google, etc. |
| `name` | TEXT | Display name |
| `context_window` | INTEGER | Max context tokens |
| `max_output_tokens` | INTEGER | Max output tokens |
| `input_cost_per_m` | DECIMAL | Cost per 1M input tokens |
| `output_cost_per_m` | DECIMAL | Cost per 1M output tokens |
| `supports_vision` | BOOLEAN | Image input support |
| `supports_tools` | BOOLEAN | Function calling support |
| `supports_system` | BOOLEAN | System prompt support |
| `latency_score` | INTEGER | 1-10 (10=fastest) |
| `quality_score` | INTEGER | 1-10 (10=best) |
| `is_tier1` | BOOLEAN | Top 15 providers |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**Indexes:**
- `llm_models_model_id_idx` (unique)
- `llm_models_provider_idx` - Filter by provider

---

## OAuth & Authentication

### oauth_tokens

**Purpose:** OAuth tokens for external services
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `service` | VARCHAR | google, microsoft, onedrive (unique) |
| `access_token` | TEXT | Current access token |
| `refresh_token` | TEXT | Refresh token |
| `expires_at` | TIMESTAMP | Token expiration |
| `scope` | TEXT | OAuth scopes |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last refresh |

**Current Services:**
- Google (Calendar API)

---

### oauth_clients

**Purpose:** OAuth client configurations
**Primary Key:** `id` (UUID)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `client_id` | VARCHAR | OAuth client ID |
| `client_secret` | VARCHAR | OAuth client secret |
| `redirect_uri` | TEXT | Callback URL |
| `service` | VARCHAR | google, microsoft, etc. |
| `created_at` | TIMESTAMP | Creation time |

---

## Common Patterns

### Notion Sync Pattern

**Tables with Notion sync:**
- tasks
- projects
- notes
- goals
- people
- tags
- media_watchlist
- games_backlog
- system_upgrades
- system_fixes

**Common Columns:**
```sql
notion_page_id VARCHAR,           -- Notion page ID or sql:* temp ID
notion_last_edited_at TIMESTAMP,  -- Last edit in Notion
sql_local_last_edited_at TIMESTAMP -- Last edit in SQL
```

**Conflict Resolution:**

```sql
-- Inbound sync (Notion → SQL)
UPDATE tasks SET
  title = notion_task.title,
  status = notion_task.status,
  notion_last_edited_at = notion_task.last_edited_time
WHERE notion_page_id = notion_task.id
  AND (notion_last_edited_at IS NULL
       OR notion_task.last_edited_time > notion_last_edited_at);

-- Outbound sync (SQL → Notion)
SELECT * FROM tasks
WHERE sql_local_last_edited_at > notion_last_edited_at
  OR notion_page_id LIKE 'sql:%';
```

---

### Vector Search Pattern

**Tables with embeddings:**
- files (document-level)
- file_chunks (section-level)
- email_logs (email-level)
- meeting_chunks (speaker turn-level)

**Common Columns:**
```sql
embedding VECTOR(1536),          -- pgvector embedding
embedding_model VARCHAR,          -- Model used
embedded_at TIMESTAMP             -- When generated
```

**Similarity Query:**

```sql
-- Find similar items
SELECT
  id,
  content,
  1 - (embedding <=> $query_embedding::vector) as similarity
FROM file_chunks
WHERE embedding IS NOT NULL
  AND 1 - (embedding <=> $query_embedding::vector) > 0.7
ORDER BY similarity DESC
LIMIT 10;
```

---

### Pending Confirmation Pattern

**Tables with pending items:**
- pending_email_tasks
- pending_files
- pending_notes

**Common Columns:**
```sql
status VARCHAR,                   -- pending, approved, rejected
telegram_message_id TEXT,        -- For tracking responses
created_at TIMESTAMP,
resolved_at TIMESTAMP
```

**Workflow:**
1. System creates pending item
2. Sends Telegram notification
3. User approves/rejects
4. Status updated
5. Action taken if approved

---

## Indexes & Performance

### Vector Indexes

**IVFFlat Configuration:**

```sql
-- File chunks (most critical)
CREATE INDEX file_chunks_embedding_idx ON file_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 500);

-- Files (document-level)
CREATE INDEX files_embedding_idx ON files
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Emails
CREATE INDEX email_logs_embedding_idx ON email_logs
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 200);
```

**Tuning `lists` Parameter:**
- Formula: `sqrt(row_count)`
- 2,908 chunks → lists=54, rounded to 500 for growth
- Balance: more lists = better accuracy, slower search

---

### Full-Text Indexes

**BM25 Search:**

```sql
-- Chunk content search
CREATE INDEX file_chunks_content_fts_idx ON file_chunks
  USING gin(to_tsvector('english', content));

-- Email body search
CREATE INDEX email_logs_body_fts_idx ON email_logs
  USING gin(to_tsvector('english', body_text));
```

---

### Foreign Key Indexes

**Automatically indexed:**
- All `_id` columns with foreign keys
- Ensures fast joins

**Example:**
```sql
CREATE INDEX tasks_project_id_idx ON tasks(project_id);
CREATE INDEX file_chunks_file_id_idx ON file_chunks(file_id);
```

---

### Query Patterns

**Filter before sort:**

```sql
-- Bad: sorts all 2,908 chunks
SELECT * FROM file_chunks
ORDER BY embedding <=> $query_embedding
LIMIT 10;

-- Good: filters first (100 candidates), then sorts
SELECT * FROM file_chunks
WHERE file_id IN (
  SELECT id FROM files WHERE folder LIKE '%CTS010%'
)
ORDER BY embedding <=> $query_embedding
LIMIT 10;
```

**Use appropriate index:**

```sql
-- Uses vector index
EXPLAIN ANALYZE
SELECT * FROM file_chunks
ORDER BY embedding <=> $query_embedding
LIMIT 10;

-- Index Scan using file_chunks_embedding_idx
-- Planning Time: 0.5ms
-- Execution Time: 50ms
```

---

## Maintenance

### Vacuum & Analyze

```sql
-- Regular maintenance (weekly)
VACUUM ANALYZE files;
VACUUM ANALYZE file_chunks;
VACUUM ANALYZE email_logs;

-- After bulk operations
VACUUM FULL files;
REINDEX INDEX file_chunks_embedding_idx;
```

### Statistics

```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

---

## Migration Pattern

**Version control:**

```
tools/migrations/
├── 001_initial_schema.sql
├── 002_add_embeddings.sql
├── 003_add_email_tables.sql
├── 004_add_meetings.sql
└── ...
```

**Migration script:**

```typescript
// tools/migrations/run-migrations.ts
import { sql } from '../lib/db';
import { readFileSync } from 'fs';
import { glob } from 'glob';

async function runMigrations() {
  // Get applied migrations
  const applied = await sql`
    SELECT version FROM schema_migrations
    ORDER BY version
  `;
  const appliedVersions = new Set(applied.map(m => m.version));

  // Find pending migrations
  const files = glob.sync('tools/migrations/*.sql');

  for (const file of files.sort()) {
    const version = parseInt(file.match(/(\d+)_/)?.[1] || '0');

    if (appliedVersions.has(version)) continue;

    console.log(`Applying migration ${version}...`);
    const content = readFileSync(file, 'utf-8');

    await sql.unsafe(content);
    await sql`INSERT INTO schema_migrations (version) VALUES (${version})`;

    console.log(`✓ Migration ${version} applied`);
  }
}
```

---

## Related Documentation

- [Notion Sync](../02-capabilities/notion-sync.md) - Sync patterns
- [File Processing](../02-capabilities/file-processing.md) - File tables usage
- [Email System](../02-capabilities/email-system.md) - Email tables usage
- [RAG Search](../02-capabilities/rag-search.md) - Vector search details
- [LibreChat](../02-capabilities/librechat.md) - How LibreChat queries database
