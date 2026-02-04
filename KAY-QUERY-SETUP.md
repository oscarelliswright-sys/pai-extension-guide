# KAY Query System - Setup for Your Dad

This guide explains how to set up the KAY Query MCP tool so your dad's Claude Code can query your actual KAY system.

---

## What This Does

Your dad's Claude Code will have 4 powerful tools to query YOUR live KAY system:

1. **`search_kay_docs`** - RAG search through your documentation in your database
2. **`query_kay_system`** - Get live data (recent syncs, tasks, files, Telegram stats, etc.)
3. **`get_kay_config`** - Get your actual configuration (cron schedules, sync settings, etc.)
4. **`search_kay_memory`** - Search your MEMORY learnings

**This is trusted, read-only access to your actual database.**

---

## Step 1: Create Read-Only Database User (You Do This)

Create a secure read-only user in Neon for your dad:

```bash
# Connect to your Neon database
psql $DATABASE_URL

# Create read-only user
CREATE ROLE query_readonly WITH LOGIN PASSWORD 'GENERATE_SECURE_PASSWORD_HERE';

-- Grant database connection
GRANT CONNECT ON DATABASE neondb TO query_readonly;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO query_readonly;

-- Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO query_readonly;

-- Grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO query_readonly;

-- Verify permissions
\du query_readonly
```

**Generate a secure password:**
```bash
# Use openssl to generate a strong password
openssl rand -base64 32
```

**Get the connection string:**

Your dad will need a connection string in this format:
```
postgresql://query_readonly:PASSWORD_HERE@ep-dry-forest-abv53mtg-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

Replace:
- `PASSWORD_HERE` with the password you generated
- Keep your same host: `ep-dry-forest-abv53mtg-pooler.eu-west-2.aws.neon.tech`

---

## Step 2: Share With Your Dad

Send your dad:

1. **The read-only connection string** (from Step 1)
2. **Your OpenAI API key** (optional, for RAG search to work properly)
3. **Link to this setup guide**

---

## Step 3: Your Dad Configures Claude Code

**File location:** `~/.config/Claude/claude_desktop_config.json`

**Configuration to add:**

```json
{
  "mcpServers": {
    "kay-query": {
      "command": "bun",
      "args": ["run", "/home/YOUR_DAD_USERNAME/.claude/tools/mcp/kay-query-direct.ts"],
      "env": {
        "DATABASE_URL": "postgresql://query_readonly:PASSWORD@ep-dry-forest-abv53mtg-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require",
        "OPENAI_API_KEY": "sk-proj-..."
      }
    }
  }
}
```

**Important:**
- Replace `YOUR_DAD_USERNAME` with his actual username
- Replace `PASSWORD` with the read-only password you gave him
- Replace `sk-proj-...` with your OpenAI API key (or omit if not needed)

---

## Step 4: Your Dad Copies the MCP Tool

The MCP tool file needs to be at:
```
~/.claude/tools/mcp/kay-query-direct.ts
```

**Options:**

**Option A: Clone from GitHub (Recommended)**
```bash
# Dad already has the pai-extension-guide repo at:
# ~/reference/pai-blueprints/pai-extension-guide/

# Create the tools directory
mkdir -p ~/.claude/tools/mcp

# Copy the MCP tool
cp ~/reference/pai-blueprints/pai-extension-guide/mcp/kay-query-direct.ts \
   ~/.claude/tools/mcp/
```

**Option B: Download directly**
```bash
mkdir -p ~/.claude/tools/mcp
cd ~/.claude/tools/mcp
curl -O https://raw.githubusercontent.com/oscarelliswright-sys/pai-extension-guide/main/mcp/kay-query-direct.ts
```

---

## Step 5: Restart Claude Code

Your dad needs to restart Claude Code (or Claude.app) for the MCP tool to load.

---

## Step 6: Test It

**Tell his Claude Code:**

```
Use the kay-query tools to:
1. Search for "Notion sync" in KAY's documentation
2. Show me a sample task from KAY's database
3. Get KAY's cron schedule
```

**Expected response:**

The tools should return:
- Relevant documentation excerpts about Notion sync
- An actual task from your database with all fields
- Your actual cron configuration

---

## Example Usage

Once set up, your dad's Claude Code can ask questions like:

**About Documentation:**
- "Search KAY's docs for information about file classification"
- "How does Oscar handle Notion conflict resolution?"

**About Live System:**
- "Show me a real task from KAY's database"
- "What's KAY's sync health for the last 7 days?"
- "How many files does Oscar have in each PARA category?"

**About Configuration:**
- "What's Oscar's cron schedule?"
- "How is Oscar's file processing pipeline configured?"
- "What integrations does KAY use?"

**About MEMORY:**
- "Search Oscar's learnings about Notion sync"

---

## Troubleshooting

### "Database connection failed"

**Check:**
1. Connection string is correct (no typos)
2. Read-only user was created successfully
3. Network allows connection to Neon

**Test connection:**
```bash
psql "postgresql://query_readonly:PASSWORD@ep-dry-forest-abv53mtg-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require" -c "SELECT 1;"
```

### "Tools not showing up"

**Check:**
1. MCP tool file exists at `~/.claude/tools/mcp/kay-query-direct.ts`
2. Configuration file is valid JSON (no trailing commas)
3. Restarted Claude Code

**Verify configuration:**
```bash
cat ~/.config/Claude/claude_desktop_config.json | jq .
```

### "Embedding search returns random results"

**Check:**
- `OPENAI_API_KEY` is set in the MCP configuration
- The API key is valid and has credits

**Note:** If no API key is set, RAG search will return random results (but the tool will still work for other queries).

---

## Security Notes

✅ **Safe:**
- Read-only access (can't modify your data)
- Single trusted user (your dad)
- Direct database access (no public API)

⚠️ **Remember:**
- Your dad can see ALL your data (tasks, files, calendar, etc.)
- Protect the read-only password (though it can't modify anything)
- If concerned, revoke access by dropping the user:
  ```sql
  DROP ROLE query_readonly;
  ```

---

## What Your Dad Can Query

### Documentation Search
- Any question about your PAI documentation
- Specific feature implementations
- Configuration details

### Live System Data
- **recent-syncs**: Last 20 sync runs with status, duration, errors
- **sync-health**: 7-day sync health metrics by script
- **sample-task**: A real task showing all fields and sync timestamps
- **tasks-summary**: Task counts by status, priority, overdue
- **files-summary**: PARA distribution, classification confidence
- **telegram-stats**: Bot usage last 7 days
- **database-schema**: All tables with sizes
- **notion-databases**: Sync status for tasks/projects/notes
- **calendar-summary**: Events 7 days back/forward
- **llm-models**: Available models and pricing

### Configuration
- **cron-schedule**: All your cron jobs (VPS + Railway + Telegram)
- **sync-configuration**: Notion, Calendar, Git sync settings
- **telegram-bot**: Features, commands, deployment
- **file-processing**: Pipeline stages, PARA structure, classification
- **integrations**: All external services you use

### MEMORY
- Search your accumulated learnings by topic

---

**Status:** ✅ Ready to set up
**Time to setup:** 15 minutes
**Access level:** Read-only, trusted user

Your dad's PAI will now be able to ask your actual KAY for help when building his own system.
