# Cron Schedule Reference

**Purpose:** Complete reference for all automated tasks
**Platform:** VPS (Hostinger) + Railway
**Maintenance:** Auto-documented via session close hooks
**Last Updated:** February 4, 2026

---

## Quick Reference

| Task | Frequency | Time | Script |
|------|-----------|------|--------|
| Git auto-sync | Every 15 min | All day | `sync-to-github.sh` |
| Health check | Daily | 2am Mon-Sat | `health-check.sh` |
| Security audit | Weekly | 2am Sunday | `security-audit.sh` |
| RAG reindexing | Daily | 3am | `rag-reindex.sh` |
| Learning extraction | Daily | 4am | `extract-missed-learnings.sh` |
| Memory maintenance | Weekly | 5am Sunday | `memory-maintenance.sh` |
| Meeting check | Every 15 min | 8am-7pm Mon-Fri | `meeting-check.sh` |

---

## VPS Cron Jobs

### Git Auto-Sync

**Schedule:** Every 15 minutes, 24/7
**Cron:** `*/15 * * * *`
**Script:** `/home/ubuntu/.claude/sync-to-github.sh`

**Purpose:**
- Commits context changes to git
- Pushes to GitHub (backup + Railway deployment trigger)
- Preserves system state continuously

**What It Does:**
```bash
#!/bin/bash
cd "$HOME/.claude"
git add -A
git diff --cached --quiet || git commit -m "Auto-sync"
git push origin main 2>/dev/null
```

**Output:**
- Commits created every 15 min if changes detected
- Push happens automatically (SSH auth)
- Errors logged to `/home/ubuntu/.claude/.git-sync-errors.log`

**Verification:**
```bash
# Check last commit
git log -1 --oneline

# Check push status
git status -sb
```

---

### Health Check

**Schedule:** Daily 2am Mon-Sat
**Cron:** `0 2 * * 1-6`
**Script:** `/home/ubuntu/automations/health-check.sh`

**Purpose:**
- Verify all PAI services operational
- Check sync success rates
- Monitor file processing queue
- Review AI costs
- Detect anomalies

**What It Checks:**
1. Railway services (pai-api, pai-sync)
2. Database connectivity
3. Sync run history (success rate)
4. File processing queue size
5. Email classification rate
6. AI API costs (daily/monthly)

**Output:**
- Telegram notification with summary
- Detailed log: `/home/ubuntu/automations/logs/health-check-YYYY-MM-DD.log`

**Example Notification:**
```
🏥 PAI Health Check (Feb 4, 2:00 AM)

✅ Railway Services: Operational
✅ Database: Connected (40ms latency)
✅ Sync Success Rate: 98% (last 24h)
✅ File Processing: 3 pending (normal)
✅ Email Classification: 24 emails processed
⚠️ AI Costs: $1.23 today (trending high)
```

---

### Security Audit

**Schedule:** Weekly Sunday 2am
**Cron:** `0 2 * * 0`
**Script:** `/home/ubuntu/automations/security-audit.sh`

**Purpose:**
- Scan for security vulnerabilities
- Check SSH config
- Review firewall rules
- Audit package updates
- Verify file permissions

**What It Checks:**
1. SSH configuration security
2. Firewall rules (ufw status)
3. Package updates needed
4. File permissions on sensitive files
5. OAuth token expiration
6. SSL certificate validity

**Output:**
- Telegram notification with findings
- Detailed log: `/home/ubuntu/automations/logs/security-audit-YYYY-MM-DD.log`

**Example Notification:**
```
🔒 Security Audit (Feb 4, 2:00 AM)

✅ SSH: Secure (key-only, root disabled)
✅ Firewall: Active (22, 80, 443 open)
⚠️ Package Updates: 3 available (non-critical)
✅ File Permissions: Correct
✅ OAuth Tokens: Valid (Google expires Mar 15)
✅ SSL Certificates: Valid (expires May 1)

Recommended actions:
• Update packages: sudo apt update && sudo apt upgrade
```

---

### RAG Reindexing

**Schedule:** Daily 3am
**Cron:** `0 3 * * *`
**Script:** `/home/ubuntu/automations/rag-reindex.sh`

**Purpose:**
- Generate missing embeddings
- Rebuild vector indexes
- Verify embedding coverage
- Optimize search performance

**What It Does:**
1. Check embedding coverage (files & chunks)
2. Generate missing embeddings
3. Rebuild ivfflat indexes if needed
4. Vacuum and analyze vector tables

**Script:**
```bash
#!/bin/bash
cd /home/ubuntu/.claude/tools

# Generate missing embeddings
/home/ubuntu/.bun/bin/bun run scripts/generate-embeddings.ts --files
/home/ubuntu/.bun/bin/bun run scripts/generate-embeddings.ts --chunks

# Check coverage
COVERAGE=$(psql "$DATABASE_URL" -t -c "
  SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE embedding IS NOT NULL) / COUNT(*), 1)
  FROM file_chunks
")

echo "Embedding coverage: $COVERAGE%"

if [ $(echo "$COVERAGE < 95" | bc) -eq 1 ]; then
  echo "⚠️ Coverage below 95%, reindexing needed"
fi
```

**Output:**
- Log: `/home/ubuntu/automations/logs/rag-reindex-YYYY-MM-DD.log`
- Telegram notification if coverage < 95%

---

### Learning Extraction

**Schedule:** Daily 4am
**Cron:** `0 4 * * *`
**Script:** `/home/ubuntu/automations/extract-missed-learnings.sh`

**Purpose:**
- Extract learnings from previous day's sessions
- Catch learnings missed by session close hooks
- Update MEMORY/learnings/ directory

**What It Does:**
1. Read yesterday's session transcripts
2. Identify learnings not already captured
3. Extract and categorize by topic
4. Create markdown files in appropriate directories

**Output:**
- New learning files in `MEMORY/learnings/`
- Log: `/home/ubuntu/automations/logs/extract-missed-learnings-YYYY-MM-DD.log`

**Example Output:**
```
✅ Extracted 3 learnings from Feb 3 sessions:

1. Infrastructure/2026-02-03-postgres-connection-retry.md
2. TypeScript/2026-02-03-bun-env-handling.md
3. PAI/2026-02-03-telegram-bot-rate-limiting.md
```

---

### Memory Maintenance

**Schedule:** Weekly Sunday 5am
**Cron:** `0 5 * * 0`
**Script:** `/home/ubuntu/automations/memory-maintenance.sh`

**Purpose:**
- Prune outdated learnings
- Merge duplicate insights
- Detect inefficiencies in system
- Tighten automation rules
- Update cron-schedule.md with duration stats

**What It Does:**
1. Review all learnings for relevance
2. Identify duplicates or outdated info
3. Merge similar learnings
4. Update cron-schedule.md with avg durations
5. Suggest system improvements

**Output:**
- Updated MEMORY/learnings/ files
- Updated context/pai/cron-schedule.md
- Log: `/home/ubuntu/automations/logs/memory-maintenance-YYYY-MM-DD.log`
- Telegram notification with summary

**Example Notification:**
```
🧹 Memory Maintenance Complete (Feb 4, 5:00 AM)

**Actions Taken:**
• Merged 3 duplicate learnings
• Archived 2 outdated learnings
• Updated cron-schedule.md with durations

**System Health:**
• 127 active learnings
• Average learning age: 12 days
• Coverage: Infrastructure (45), TypeScript (32), PAI (28), Security (15), Other (7)

**Suggestions:**
• Consider consolidating Infrastructure learnings (45 total, growing)
```

---

### Meeting Check

**Schedule:** Every 15 min, Mon-Fri 8am-7pm
**Cron:** `*/15 8-19 * * 1-5`
**Script:** `/home/ubuntu/automations/meeting-check.sh`

**Purpose:**
- Detect new meeting recordings
- Trigger transcription pipeline
- Process action items
- Send notifications

**What It Does:**
1. Scan `/opt/nextcloud/files/oscar/files/Recordings/Meetings/`
2. Find unprocessed recordings (not in database)
3. Trigger processing: `bun run meetings/process-recording.ts --check`

**Script:**
```bash
#!/bin/bash
RECORDINGS_DIR="/opt/nextcloud/files/oscar/files/Recordings/Meetings"
LOGFILE="/home/ubuntu/automations/logs/meeting-check.log"

echo "[$(date -Iseconds)] Checking for new recordings..." >> "$LOGFILE"

cd /home/ubuntu/.claude/tools
/home/ubuntu/.bun/bin/bun run meetings/process-recording.ts --check >> "$LOGFILE" 2>&1

echo "[$(date -Iseconds)] Check complete" >> "$LOGFILE"
```

**Output:**
- Processed meetings in database
- Telegram notification with summary
- Extracted action items sent for confirmation

---

## Railway Cron Jobs

### Sync Service

**Schedule:** Every 10 minutes, 24/7
**Config:** `railway.toml` → `cronSchedule = "*/10 * * * *"`
**Script:** `scripts/startup.ts` → `sync/cron-sync.ts`

**Purpose:**
- Bidirectional sync: Notion ↔ PostgreSQL
- Email fetch and classification
- File processing
- Calendar sync

**What It Does:**

1. **Inbound Sync (External → SQL):**
   - tags-notion-to-sql.ts
   - tasks-notion-to-sql.ts
   - projects-notion-to-sql.ts
   - goals-notion-to-sql.ts
   - notes-notion-to-sql.ts
   - people-notion-to-sql.ts
   - media-notion-to-sql.ts
   - games-notion-to-sql.ts
   - system-upgrades-notion-to-sql.ts
   - system-fixes-notion-to-sql.ts
   - calendar-google-to-sql.ts

2. **Outbound Sync (SQL → External):**
   - tags-sql-to-notion.ts
   - tasks-sql-to-notion.ts
   - projects-sql-to-notion.ts
   - goals-sql-to-notion.ts
   - notes-sql-to-notion.ts
   - people-sql-to-notion.ts
   - media-sql-to-notion.ts
   - games-sql-to-notion.ts
   - system-upgrades-sql-to-notion.ts
   - system-fixes-sql-to-notion.ts
   - areas-sql-to-notion.ts
   - resources-sql-to-notion.ts
   - calendar-sql-to-google.ts

3. **Task Trigger:**
   - calendar-task-trigger.ts (task due dates → calendar events)

4. **Email Processing:**
   - email/index.ts fetch (classify, label, extract)

5. **File Processing:**
   - sync/files-scan.ts (detect new files in Inbox)
   - sync/files-process.ts (extract, classify, move)

**Duration:** ~40-60 seconds per cycle

**Monitoring:**

```bash
# Check sync logs
npx @railway/cli logs pai-sync --tail 100

# Check last sync times
psql "$DATABASE_URL" -c "
  SELECT entity, direction, status, started_at
  FROM sync_run_history
  ORDER BY started_at DESC
  LIMIT 10
"
```

---

## Sunday Schedule

**Busiest day - all jobs run sequentially:**

```
2:00 AM - Health Check (daily)
         ↓ (waits for lock)
2:00 AM - Security Audit (weekly)
         ↓ (waits for lock)
3:00 AM - RAG Reindexing (daily)
         ↓ (waits for lock)
4:00 AM - Learning Extraction (daily)
         ↓ (waits for lock)
5:00 AM - Memory Maintenance (weekly)
```

**Lock Mechanism:**

All jobs use shared lock file: `/home/ubuntu/automations/.claude-lock`

**Job Runner Pattern:**
```bash
# All scripts use this wrapper
/home/ubuntu/automations/lib/run-job.sh <job-name> <command>

# Acquires lock, runs job, logs duration, releases lock
# If previous job still running, waits up to 60 minutes
```

**Duration Tracking:**

Each run logged to `/home/ubuntu/automations/logs/durations.jsonl`:
```json
{
  "job": "health-check",
  "status": "completed",
  "started": "2026-02-04T02:00:00Z",
  "ended": "2026-02-04T02:02:15Z",
  "duration_minutes": 2.25
}
```

Memory maintenance reviews durations weekly and updates this document.

---

## Monitoring

### Check Cron Status

```bash
# List all cron jobs
crontab -l

# Check cron service
sudo systemctl status cron

# View cron execution logs
grep CRON /var/log/syslog | tail -20
```

---

### Check Job Logs

```bash
# Health check
tail -100 /home/ubuntu/automations/logs/health-check.log

# Meeting processing
tail -100 /home/ubuntu/automations/logs/meeting-check.log

# All logs (recent)
ls -lt /home/ubuntu/automations/logs/*.log | head -10
```

---

### Check Duration Trends

```bash
# View recent durations
tail -50 /home/ubuntu/automations/logs/durations.jsonl

# Average duration by job (jq required)
cat /home/ubuntu/automations/logs/durations.jsonl | \
  jq -s 'group_by(.job) | map({job: .[0].job, avg_min: (map(.duration_minutes) | add / length)})' | \
  jq -r '.[] | "\(.job): \(.avg_min) min"'
```

---

## Manual Execution

### Run Health Check

```bash
/home/ubuntu/automations/health-check.sh
```

---

### Run Sync Manually

```bash
cd ~/.claude/tools
bun run sync/cron-sync.ts
```

---

### Process Specific File

```bash
cd ~/.claude/tools
bun run sync/files-process.ts
```

---

### Generate Embeddings

```bash
cd ~/.claude/tools
bun run scripts/generate-embeddings.ts --files
bun run scripts/generate-embeddings.ts --chunks
```

---

## Adding New Jobs

**Process:**

1. Create script in `/home/ubuntu/automations/`
2. Use job runner pattern:
   ```bash
   #!/bin/bash
   /home/ubuntu/automations/lib/run-job.sh job-name \
     command-to-execute
   ```
3. Add to crontab: `crontab -e`
4. Update this documentation
5. Test manually first

**Example:**

```bash
# New script: /home/ubuntu/automations/backup-check.sh
#!/bin/bash
/home/ubuntu/automations/lib/run-job.sh backup-check \
  claude -p "Check if all backups completed successfully in last 24h. Report issues via Telegram."

# Add to crontab
0 6 * * * /home/ubuntu/automations/backup-check.sh

# Test
/home/ubuntu/automations/backup-check.sh
```

---

## Conflict Rules

1. **Sequential execution:** Jobs use shared lock, run one at a time
2. **Sunday chain:** All 5 jobs scheduled Sunday, run sequentially
3. **Rate limit budget:** Background jobs during 2-5am, interactive priority during day
4. **Duration monitoring:** Weekly review updates this document with averages

---

## Related Documentation

- [System Overview](../00-overview/system-overview.md) - Architecture context
- [Monitoring](../05-operations/monitoring.md) - Health checks and metrics
- [Troubleshooting](../05-operations/troubleshooting.md) - When jobs fail
