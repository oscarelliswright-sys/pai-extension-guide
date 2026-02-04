# Database Setup

**Purpose:** Initialize Neon PostgreSQL database with PAI schema
**Estimated Time:** 30-45 minutes
**Difficulty:** Intermediate
**Last Updated:** February 4, 2026

---

## Table of Contents

1. [Neon PostgreSQL Setup](#neon-postgresql-setup)
2. [Database Connection](#database-connection)
3. [Schema Creation](#schema-creation)
4. [pgvector Extension](#pgvector-extension)
5. [Initial Data](#initial-data)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Neon PostgreSQL Setup

### Step 1: Create Neon Account

**Go to:** [neon.tech](https://neon.tech)

**Sign up with:**
- GitHub account (recommended)
- Or email/password

**Verify email** if using email signup

---

### Step 2: Create Project

**After login:**
1. Click "Create a project"
2. Project name: `PAI`
3. Region: **Europe (AWS eu-west-2)** (or closest to your VPS)
4. Compute size: **Shared** (free tier)
5. Click "Create project"

**Wait 30-60 seconds** for project provisioning

---

### Step 3: Get Connection String

**On project dashboard:**
1. Look for "Connection string"
2. Click "Copy" button
3. Save to password manager

**Format:**
```
postgresql://neondb_owner:[PASSWORD]@[HOST].neon.tech/neondb?sslmode=require
```

**Example:**
```
postgresql://neondb_owner:abc123xyz@ep-dry-forest-abc123.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

---

### Step 4: Enable Connection Pooling

**Why:** Better performance, more concurrent connections

**In Neon dashboard:**
1. Click "Connection pooling" in left sidebar
2. Toggle "Enable pooling" to ON
3. Mode: **Transaction** (recommended)
4. Copy pooled connection string
5. Save this too (will use for applications)

**Pooled string ends with:** `-pooler.neon.tech`

---

## Database Connection

### Step 1: Install PostgreSQL Client on VPS

**SSH into VPS as ubuntu:**
```bash
ssh ubuntu@YOUR_VPS_IP
```

**Install psql client:**
```bash
# Already installed in VPS setup, but verify:
psql --version

# If not installed:
sudo apt update
sudo apt install postgresql-client -y
```

**Verification:**
```bash
psql --version
# Should output: psql (PostgreSQL) 14.x or higher
```

---

### Step 2: Test Database Connection

**Connect to Neon:**
```bash
psql "YOUR_NEON_CONNECTION_STRING"
```

**Example:**
```bash
psql "postgresql://neondb_owner:abc123xyz@ep-dry-forest-abc123.eu-west-2.aws.neon.tech/neondb?sslmode=require"
```

**You should see:**
```
neondb=>
```

**Test query:**
```sql
SELECT version();
```

**Exit:**
```sql
\q
```

---

### Step 3: Save Connection String Securely

**Create .env file:**
```bash
# Create tools directory
mkdir -p ~/.claude/tools

# Create .env file
nano ~/.claude/tools/.env
```

**Add connection strings:**
```bash
# Neon PostgreSQL (direct connection)
DATABASE_URL=postgresql://neondb_owner:[PASSWORD]@[HOST].neon.tech/neondb?sslmode=require

# Neon PostgreSQL (pooled connection - for applications)
DATABASE_URL_POOLED=postgresql://neondb_owner:[PASSWORD]@[HOST]-pooler.neon.tech/neondb?sslmode=require

# For Railway deployment (will use pooled)
DATABASE_URL=${DATABASE_URL_POOLED}
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Set permissions:**
```bash
chmod 600 ~/.claude/tools/.env
```

**Verification:**
```bash
# Check file permissions
ls -la ~/.claude/tools/.env
# Should show: -rw------- (read/write for owner only)
```

---

## Schema Creation

### Step 1: Download Schema SQL

**Create migrations directory:**
```bash
mkdir -p ~/.claude/tools/migrations
cd ~/.claude/tools/migrations
```

**Create schema file:**
```bash
nano 001-initial-schema.sql
```

**Paste complete schema** (see Appendix A below for full SQL)

**Save:** `Ctrl+X`, `Y`, `Enter`

---

### Step 2: Apply Schema

**Connect to database:**
```bash
psql "YOUR_NEON_CONNECTION_STRING"
```

**Apply schema:**
```sql
\i /home/ubuntu/.claude/tools/migrations/001-initial-schema.sql
```

**You'll see output like:**
```
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
```

**Wait for completion** (30-60 seconds)

**Verification:**
```sql
-- List all tables
\dt

-- Should show 47 tables including:
-- tasks, projects, notes, people, files, etc.
```

---

### Step 3: Verify Table Structure

**Check key tables:**
```sql
-- Tasks table
\d tasks

-- Should show columns:
-- id, title, status, due_date, notion_page_id, etc.

-- Files table
\d files

-- Should show columns:
-- id, filename, folder, content_extracted, etc.

-- File chunks table
\d file_chunks

-- Should show columns:
-- id, file_id, chunk_text, embedding, etc.
```

**Exit psql:**
```sql
\q
```

---

## pgvector Extension

### Step 1: Enable pgvector

**Reconnect to database:**
```bash
psql "YOUR_NEON_CONNECTION_STRING"
```

**Enable extension:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Verification:**
```sql
-- List extensions
\dx

-- Should show:
-- Name    | Version
-- vector  | 0.5.0 (or higher)

-- Test vector type
SELECT '[1,2,3]'::vector(3);
-- Should output: [1,2,3]
```

**Exit:**
```sql
\q
```

---

### Step 2: Create Vector Indexes

**These indexes speed up semantic search:**

```bash
psql "YOUR_NEON_CONNECTION_STRING"
```

**Create indexes:**
```sql
-- Index for file_chunks embeddings (IVFFlat for approximate nearest neighbor)
CREATE INDEX IF NOT EXISTS idx_file_chunks_embedding
ON file_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Full-text search index for hybrid search
CREATE INDEX IF NOT EXISTS idx_file_chunks_fts
ON file_chunks
USING GIN(to_tsvector('english', chunk_text));

-- Analyze for query planner
ANALYZE file_chunks;
```

**Verification:**
```sql
-- List indexes on file_chunks
\d file_chunks

-- Should show indexes including:
-- idx_file_chunks_embedding
-- idx_file_chunks_fts
```

**Exit:**
```sql
\q
```

---

## Initial Data

### Step 1: Create LLM Models Data

**Purpose:** Populate llm_models table for model recommendations

**Create seed file:**
```bash
nano ~/.claude/tools/migrations/002-seed-llm-models.sql
```

**Paste seed data** (see Appendix B below for full SQL)

**Save:** `Ctrl+X`, `Y`, `Enter`

**Apply seed:**
```bash
psql "YOUR_NEON_CONNECTION_STRING" < ~/.claude/tools/migrations/002-seed-llm-models.sql
```

**Verification:**
```bash
psql "YOUR_NEON_CONNECTION_STRING" -c "SELECT COUNT(*) FROM llm_models;"
# Should output: 59 (or more)
```

---

### Step 2: Create Initial Tags

**Purpose:** Seed common tags for tasks/projects

```bash
psql "YOUR_NEON_CONNECTION_STRING"
```

**Insert tags:**
```sql
INSERT INTO tags (name, color, notion_page_id, sql_local_last_edited_at)
VALUES
  ('urgent', 'red', 'sql:' || gen_random_uuid()::text, NOW()),
  ('important', 'orange', 'sql:' || gen_random_uuid()::text, NOW()),
  ('work', 'blue', 'sql:' || gen_random_uuid()::text, NOW()),
  ('personal', 'green', 'sql:' || gen_random_uuid()::text, NOW()),
  ('health', 'purple', 'sql:' || gen_random_uuid()::text, NOW()),
  ('family', 'pink', 'sql:' || gen_random_uuid()::text, NOW()),
  ('finance', 'yellow', 'sql:' || gen_random_uuid()::text, NOW())
ON CONFLICT (name) DO NOTHING;
```

**Verification:**
```sql
SELECT name, color FROM tags ORDER BY name;

-- Should show:
-- family   | pink
-- finance  | yellow
-- health   | purple
-- important| orange
-- personal | green
-- urgent   | red
-- work     | blue
```

**Exit:**
```sql
\q
```

---

## Verification

### Complete Database Verification

**Create verification script:**
```bash
nano ~/verify-database.sh
```

**Paste this script:**
```bash
#!/bin/bash

# Load environment variables
source ~/.claude/tools/.env

echo "╔════════════════════════════════════════╗"
echo "║   PAI Database Verification            ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to run query and check result
check_query() {
  local query=$1
  local expected=$2
  local description=$3

  result=$(psql "$DATABASE_URL" -t -c "$query" 2>/dev/null | xargs)

  if [ "$result" = "$expected" ]; then
    echo -e "${GREEN}✓${NC} $description: $result"
    return 0
  else
    echo -e "${RED}✗${NC} $description: got '$result', expected '$expected'"
    return 1
  fi
}

echo "=== Connection Test ==="
if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
  echo -e "${GREEN}✓${NC} Database connection successful"
else
  echo -e "${RED}✗${NC} Database connection failed"
  exit 1
fi
echo ""

echo "=== Table Count ==="
table_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
if [ "$table_count" -ge 47 ]; then
  echo -e "${GREEN}✓${NC} Tables created: $table_count"
else
  echo -e "${RED}✗${NC} Insufficient tables: $table_count (expected 47+)"
fi
echo ""

echo "=== Key Tables ==="
for table in tasks projects notes files file_chunks calendar_events bot_logs llm_models; do
  if psql "$DATABASE_URL" -c "\d $table" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $table exists"
  else
    echo -e "${RED}✗${NC} $table missing"
  fi
done
echo ""

echo "=== Extensions ==="
if psql "$DATABASE_URL" -t -c "SELECT 1 FROM pg_extension WHERE extname = 'vector';" | grep -q 1; then
  echo -e "${GREEN}✓${NC} pgvector extension enabled"
else
  echo -e "${RED}✗${NC} pgvector extension not enabled"
fi
echo ""

echo "=== Indexes ==="
idx_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';" | xargs)
echo "Indexes created: $idx_count"
if psql "$DATABASE_URL" -t -c "SELECT 1 FROM pg_indexes WHERE indexname = 'idx_file_chunks_embedding';" | grep -q 1; then
  echo -e "${GREEN}✓${NC} Vector index exists"
else
  echo -e "${RED}✗${NC} Vector index missing"
fi
echo ""

echo "=== Initial Data ==="
llm_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM llm_models;" | xargs)
tag_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM tags;" | xargs)
echo "LLM models: $llm_count (expected 59+)"
echo "Tags: $tag_count (expected 7)"
echo ""

echo "=== Sample Queries ==="
# Test vector similarity (dummy data)
psql "$DATABASE_URL" -c "SELECT '[1,2,3]'::vector(3) <=> '[1,2,4]'::vector(3) AS distance;" 2>/dev/null | head -3
echo ""

echo "╔════════════════════════════════════════╗"
echo "║   Verification Complete                ║"
echo "╚════════════════════════════════════════╝"
```

**Save:** `Ctrl+X`, `Y`, `Enter`

**Make executable:**
```bash
chmod +x ~/verify-database.sh
```

**Run verification:**
```bash
./verify-database.sh
```

**Expected output:**
```
✓ Database connection successful
✓ Tables created: 47
✓ tasks exists
✓ projects exists
...
✓ pgvector extension enabled
✓ Vector index exists
LLM models: 59
Tags: 7
```

---

## Troubleshooting

### Issue: Connection refused or timeout

**Symptom:**
```
psql: error: connection to server at "..." failed: Connection timed out
```

**Solutions:**

**1. Check connection string format:**
```bash
# Should have ?sslmode=require at end
echo $DATABASE_URL
```

**2. Check Neon project is running:**
- Go to Neon dashboard
- Click on project
- Check "Compute" status (should show "Active")

**3. If project is "Idle" (auto-paused):**
- Make any query to wake it up:
```bash
psql "$DATABASE_URL" -c "SELECT 1;"
```
- Wait 10-15 seconds
- Try again

**4. Check firewall (VPS side):**
```bash
# Neon uses port 5432, should be allowed outbound by default
sudo ufw status

# If blocked, allow:
sudo ufw allow out 5432/tcp
```

---

### Issue: Permission denied for schema public

**Symptom:**
```
ERROR:  permission denied for schema public
```

**Solution:**

**Grant permissions:**
```sql
GRANT ALL ON SCHEMA public TO neondb_owner;
GRANT ALL ON ALL TABLES IN SCHEMA public TO neondb_owner;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO neondb_owner;
```

---

### Issue: pgvector extension not available

**Symptom:**
```
ERROR:  extension "vector" is not available
```

**Solution:**

**This shouldn't happen on Neon** (pgvector is pre-installed)

**If it does:**
1. Go to Neon dashboard
2. Check project settings
3. Verify region (some regions may not have pgvector)
4. Contact Neon support

---

### Issue: Out of storage

**Symptom:**
```
ERROR:  could not extend file: No space left on device
```

**Solution:**

**Check usage:**
- Go to Neon dashboard
- Check "Usage" tab
- Free tier limit: 0.5 GB

**Reduce usage:**
```sql
-- Find large tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Delete old bot logs if needed
DELETE FROM bot_logs WHERE created_at < NOW() - INTERVAL '30 days';

-- Vacuum to reclaim space
VACUUM FULL;
```

**Upgrade if needed:**
- Neon Pro: $19/month (unlimited storage)

---

### Issue: Connection pool exhausted

**Symptom:**
```
ERROR:  sorry, too many clients already
```

**Solution:**

**Use pooled connection string** (ends with `-pooler.neon.tech`)

**Update .env:**
```bash
# Use pooled connection for applications
DATABASE_URL=postgresql://...@...-pooler.neon.tech/neondb?sslmode=require
```

**Free tier limits:**
- Direct connections: 10 max
- Pooled connections: 100 max

---

## Post-Setup Steps

**Database setup complete!** ✅

**What's been configured:**
- ✅ Neon PostgreSQL project created
- ✅ 47 tables initialized
- ✅ pgvector extension enabled
- ✅ Vector indexes created
- ✅ LLM models seeded (59 models)
- ✅ Initial tags created (7 tags)
- ✅ Connection string saved securely

**Next steps:**
1. **[Notion Integration](notion-integration.md)** - Connect Notion databases
2. **[Telegram Bot Setup](telegram-bot-setup.md)** - Configure Telegram interface
3. **[Railway Deployment](railway-deployment.md)** - Deploy sync service

**Save these for later:**
- Direct connection string: `postgresql://...@...neon.tech/neondb`
- Pooled connection string: `postgresql://...@...-pooler.neon.tech/neondb`

---

## Appendix A: Complete Schema SQL

**File:** `001-initial-schema.sql`

```sql
-- PAI Database Schema
-- Version: 1.0
-- Date: 2026-02-04

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE ENTITIES (Synced with Notion)
-- ============================================================================

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT,
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  project_id UUID,
  tags TEXT[],
  notion_page_id TEXT UNIQUE,
  sql_local_last_edited_at TIMESTAMP DEFAULT NOW(),
  notion_last_edited_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_notion_page_id ON tasks(notion_page_id);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  notion_page_id TEXT UNIQUE,
  sql_local_last_edited_at TIMESTAMP DEFAULT NOW(),
  notion_last_edited_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_notion_page_id ON projects(notion_page_id);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  project_id UUID,
  notion_page_id TEXT UNIQUE,
  sql_local_last_edited_at TIMESTAMP DEFAULT NOW(),
  notion_last_edited_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_notes_notion_page_id ON notes(notion_page_id);
CREATE INDEX idx_notes_project_id ON notes(project_id);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMP,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  notion_page_id TEXT UNIQUE,
  sql_local_last_edited_at TIMESTAMP DEFAULT NOW(),
  notion_last_edited_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_notion_page_id ON goals(notion_page_id);

-- People table
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relationship TEXT,
  notes TEXT,
  notion_page_id TEXT UNIQUE,
  sql_local_last_edited_at TIMESTAMP DEFAULT NOW(),
  notion_last_edited_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_people_name ON people(name);
CREATE INDEX idx_people_notion_page_id ON people(notion_page_id);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  notion_page_id TEXT UNIQUE,
  sql_local_last_edited_at TIMESTAMP DEFAULT NOW(),
  notion_last_edited_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  summary TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  location TEXT,
  attendees TEXT[],
  google_event_id TEXT UNIQUE,
  source TEXT DEFAULT 'google',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

CREATE INDEX idx_calendar_events_start ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_google_id ON calendar_events(google_event_id);

-- Media watchlist table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT, -- 'movie', 'tv', 'anime'
  status TEXT DEFAULT 'plan_to_watch',
  rating INTEGER,
  tmdb_id TEXT,
  watched_at TIMESTAMP,
  notion_page_id TEXT UNIQUE,
  sql_local_last_edited_at TIMESTAMP DEFAULT NOW(),
  notion_last_edited_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_notion_page_id ON media(notion_page_id);

-- Games backlog table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  platform TEXT,
  status TEXT DEFAULT 'backlog',
  rating INTEGER,
  rawg_id INTEGER,
  completed_at TIMESTAMP,
  notion_page_id TEXT UNIQUE,
  sql_local_last_edited_at TIMESTAMP DEFAULT NOW(),
  notion_last_edited_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_notion_page_id ON games(notion_page_id);

-- System upgrades table
CREATE TABLE IF NOT EXISTS system_upgrades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'idea',
  priority TEXT,
  category TEXT,
  source TEXT,
  project_plan_url TEXT,
  associated_links TEXT[],
  notion_page_id TEXT UNIQUE,
  sql_local_last_edited_at TIMESTAMP DEFAULT NOW(),
  notion_last_edited_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_upgrades_status ON system_upgrades(status);
CREATE INDEX idx_system_upgrades_notion_page_id ON system_upgrades(notion_page_id);

-- System fixes table
CREATE TABLE IF NOT EXISTS system_fixes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'reported',
  priority TEXT,
  category TEXT,
  affected_component TEXT,
  steps_to_reproduce TEXT,
  resolution_notes TEXT,
  source TEXT,
  notion_page_id TEXT UNIQUE,
  sql_local_last_edited_at TIMESTAMP DEFAULT NOW(),
  notion_last_edited_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_system_fixes_status ON system_fixes(status);
CREATE INDEX idx_system_fixes_notion_page_id ON system_fixes(notion_page_id);

-- Work projects table
CREATE TABLE IF NOT EXISTS work_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client TEXT,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  budget NUMERIC,
  notion_page_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_work_projects_status ON work_projects(status);

-- ============================================================================
-- FILE SYSTEM
-- ============================================================================

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  folder TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  content_extracted TEXT,
  content_summary TEXT,
  classification TEXT,
  classification_confidence REAL,
  tags TEXT[],
  project_id UUID,
  classified_at TIMESTAMP,
  embedded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_files_folder ON files(folder);
CREATE INDEX idx_files_file_type ON files(file_type);
CREATE INDEX idx_files_classified_at ON files(classified_at);

-- File chunks table (for RAG)
CREATE TABLE IF NOT EXISTS file_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER,
  heading_path TEXT,
  token_count INTEGER,
  embedding vector(1536), -- OpenAI text-embedding-3-small
  embedded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_file_chunks_file_id ON file_chunks(file_id);
CREATE INDEX idx_file_chunks_chunk_index ON file_chunks(chunk_index);

-- File hints table
CREATE TABLE IF NOT EXISTS file_hints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_path TEXT NOT NULL,
  hint TEXT NOT NULL,
  applied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- File queue table
CREATE TABLE IF NOT EXISTS file_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  hint TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pending files table (Telegram confirmations)
CREATE TABLE IF NOT EXISTS pending_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  user_id TEXT NOT NULL,
  hint TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- EMAIL SYSTEM
-- ============================================================================

-- Emails table
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gmail_message_id TEXT UNIQUE,
  thread_id TEXT,
  subject TEXT,
  sender_email TEXT,
  sender_name TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP,
  classification TEXT,
  category TEXT,
  subcategory TEXT,
  project TEXT,
  sentiment TEXT,
  confidence REAL,
  labels TEXT[],
  has_attachment BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_emails_gmail_id ON emails(gmail_message_id);
CREATE INDEX idx_emails_sender ON emails(sender_email);
CREATE INDEX idx_emails_received_at ON emails(received_at);

-- Email embeddings table
CREATE TABLE IF NOT EXISTS email_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_embeddings_email_id ON email_embeddings(email_id);

-- Email senders table
CREATE TABLE IF NOT EXISTS email_senders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  classification TEXT,
  is_tracked BOOLEAN DEFAULT false,
  first_seen TIMESTAMP,
  last_seen TIMESTAMP,
  email_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_senders_email ON email_senders(email);

-- Email classification rules table
CREATE TABLE IF NOT EXISTS email_classification_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_email TEXT,
  subject_pattern TEXT,
  classification TEXT NOT NULL,
  category TEXT,
  confidence REAL DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SYNC INFRASTRUCTURE
-- ============================================================================

-- Sync run history table
CREATE TABLE IF NOT EXISTS sync_run_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  status TEXT,
  entity TEXT,
  direction TEXT,
  records_processed INTEGER,
  errors TEXT,
  duration_ms INTEGER
);

CREATE INDEX idx_sync_run_history_started_at ON sync_run_history(started_at);
CREATE INDEX idx_sync_run_history_entity ON sync_run_history(entity);

-- Notion sync state table
CREATE TABLE IF NOT EXISTS notion_sync_state (
  entity TEXT PRIMARY KEY,
  last_sync_timestamp TIMESTAMP,
  last_sync_status TEXT
);

-- OAuth tokens table
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_oauth_tokens_service ON oauth_tokens(service);

-- LLM models table
CREATE TABLE IF NOT EXISTS llm_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT UNIQUE NOT NULL,
  provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  context_window INTEGER,
  max_output_tokens INTEGER,
  cost_per_1k_input NUMERIC,
  cost_per_1k_output NUMERIC,
  supports_vision BOOLEAN DEFAULT false,
  supports_tools BOOLEAN DEFAULT false,
  quality_score INTEGER,
  latency_tier TEXT,
  use_cases TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_llm_models_provider ON llm_models(provider);
CREATE INDEX idx_llm_models_model_id ON llm_models(model_id);

-- LLM tier 1 providers table
CREATE TABLE IF NOT EXISTS llm_tier1_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT UNIQUE NOT NULL,
  rank INTEGER,
  is_tier1 BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI spend log table
CREATE TABLE IF NOT EXISTS ai_spend_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_used TEXT NOT NULL,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd NUMERIC,
  operation_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_spend_log_created_at ON ai_spend_log(created_at);
CREATE INDEX idx_ai_spend_log_model ON ai_spend_log(model_used);

-- ============================================================================
-- TELEGRAM BOT
-- ============================================================================

-- Bot logs table
CREATE TABLE IF NOT EXISTS bot_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  message TEXT,
  response TEXT,
  operation_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bot_logs_user_id ON bot_logs(user_id);
CREATE INDEX idx_bot_logs_created_at ON bot_logs(created_at);

-- Pending notes table
CREATE TABLE IF NOT EXISTS pending_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Scheduled notifications table
CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending',
  message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scheduled_notifications_scheduled_time ON scheduled_notifications(scheduled_time);
CREATE INDEX idx_scheduled_notifications_status ON scheduled_notifications(status);

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

-- Vacuum and analyze
VACUUM ANALYZE;
```

---

## Appendix B: LLM Models Seed Data

**File:** `002-seed-llm-models.sql`

```sql
-- Seed LLM models for PAI
-- This is a subset - full list available in PAI repository

INSERT INTO llm_models (model_id, provider, model_name, context_window, max_output_tokens, cost_per_1k_input, cost_per_1k_output, supports_vision, supports_tools, quality_score, latency_tier, use_cases)
VALUES
-- Anthropic models
('anthropic/claude-sonnet-4.5', 'anthropic', 'Claude Sonnet 4.5', 200000, 8192, 0.003, 0.015, false, true, 95, 'fast', '{"general","coding","analysis"}'),
('anthropic/claude-opus-4', 'anthropic', 'Claude Opus 4', 200000, 4096, 0.015, 0.075, false, true, 98, 'medium', '{"complex","research","creative"}'),
('anthropic/claude-haiku-4', 'anthropic', 'Claude Haiku 4', 200000, 4096, 0.00025, 0.00125, false, true, 85, 'ultrafast', '{"simple","classification","speed"}'),

-- OpenAI models
('openai/gpt-4-turbo', 'openai', 'GPT-4 Turbo', 128000, 4096, 0.01, 0.03, true, true, 92, 'fast', '{"general","coding","vision"}'),
('openai/gpt-4o', 'openai', 'GPT-4o', 128000, 16384, 0.0025, 0.01, true, true, 94, 'fast', '{"general","vision","audio"}'),
('openai/gpt-3.5-turbo', 'openai', 'GPT-3.5 Turbo', 16385, 4096, 0.0005, 0.0015, false, true, 80, 'ultrafast', '{"simple","cheap","fast"}'),

-- Google models
('google/gemini-2.0-flash-exp', 'google', 'Gemini 2.0 Flash', 1000000, 8192, 0, 0, true, true, 88, 'ultrafast', '{"free","vision","large-context"}'),
('google/gemini-pro-1.5', 'google', 'Gemini Pro 1.5', 2000000, 8192, 0.00125, 0.005, true, true, 90, 'fast', '{"large-context","vision","general"}'),

-- Meta models
('meta-llama/llama-3.1-405b-instruct', 'meta', 'Llama 3.1 405B', 128000, 4096, 0.00275, 0.00275, false, true, 89, 'medium', '{"general","coding","open-source"}'),
('meta-llama/llama-3.1-70b-instruct', 'meta', 'Llama 3.1 70B', 128000, 4096, 0.00052, 0.00052, false, true, 85, 'fast', '{"general","cost-effective"}'),

-- Additional top models
('mistralai/mixtral-8x7b-instruct', 'mistral', 'Mixtral 8x7B', 32768, 4096, 0.00024, 0.00024, false, true, 82, 'fast', '{"cheap","multilingual"}'),
('cohere/command-r-plus', 'cohere', 'Command R+', 128000, 4096, 0.003, 0.015, false, true, 87, 'fast', '{"enterprise","rag"}')

ON CONFLICT (model_id) DO NOTHING;
```

**Note:** This is a minimal seed. Full list of 59 models available in PAI repository.

---

**Database Ready!** Proceed to [Notion Integration](notion-integration.md).
