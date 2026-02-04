# Troubleshooting Guide

**Purpose:** Solutions to common PAI system issues
**Audience:** Oscar (system owner) and Kay (AI assistant)
**Last Updated:** February 4, 2026

---

## Quick Reference

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Task not syncing to Notion | Sync service down or timestamp conflict | Check Railway logs, force sync |
| File not searchable | Embeddings not generated | Run embeddings script |
| Email not classified | Gmail API token expired | Re-authenticate Gmail |
| Telegram bot not responding | Process crashed or network issue | Restart bot process |
| Meeting not transcribed | Groq API error or file format issue | Check Groq status, convert file |
| LibreChat tools not working | MCP server down or database connection lost | Restart Railway service |

---

## System Health Checks

### Check All Services

```bash
# VPS Services
ps aux | grep -E "telegram|claude"     # Telegram bot running?
systemctl --user status kay-telegram   # Service status (if configured)
crontab -l                             # Cron jobs configured?

# Railway Services
npx @railway/cli status pai-api        # LibreChat + MCP server
npx @railway/cli status pai-sync       # Sync service

# Database
psql "$DATABASE_URL" -c "SELECT NOW();" # Database accessible?
```

### Check Recent Errors

```bash
# Telegram bot logs
journalctl --user -u kay-telegram --since "1 hour ago"

# Railway logs
npx @railway/cli logs pai-api --tail 100
npx @railway/cli logs pai-sync --tail 100

# VPS automation logs
tail -100 /home/ubuntu/automations/logs/*.log
```

---

## Common Issues

### Notion Sync Not Working

**Symptoms:**
- Task created in Telegram not appearing in Notion
- Edit in Notion not reflecting in PAI

**Diagnosis:**

```bash
# Check sync logs
npx @railway/cli logs pai-sync --tail 50

# Check last sync time
psql "$DATABASE_URL" -c "
  SELECT entity, direction, status, started_at
  FROM sync_run_history
  ORDER BY started_at DESC
  LIMIT 10;
"
```

**Common Causes & Solutions:**

**1. Sync Service Crashed**
```bash
# Restart service
npx @railway/cli restart pai-sync
```

**2. Notion API Rate Limit**
- Wait 10 minutes, sync will resume
- Check Notion status: https://status.notion.so/

**3. Timestamp Conflict**
```sql
-- Force re-sync by resetting timestamp
UPDATE tasks SET sql_local_last_edited_at = '2020-01-01'::timestamp WHERE id = 'task-id';
```

**4. Invalid Notion Page ID**
```sql
-- Check for sql:* IDs (not yet created in Notion)
SELECT title, notion_page_id FROM tasks WHERE notion_page_id LIKE 'sql:%';

-- Fix: Trigger outbound sync manually
cd ~/.claude/tools
bun run sync/trigger-outbound.ts tasks
```

---

### File Not Searchable

**Symptoms:**
- File processed but search doesn't find it
- search_files returns empty

**Diagnosis:**

```sql
-- Check file embedding status
SELECT
  filename,
  processing_status,
  embedding IS NOT NULL as has_embedding,
  embedded_at
FROM files
WHERE filename LIKE '%search-term%';
```

**Solutions:**

**1. Embeddings Not Generated**
```bash
cd ~/.claude/tools
bun run scripts/generate-embeddings.ts --files
bun run scripts/generate-embeddings.ts --chunks
```

**2. File Not Fully Processed**
```bash
# Check processing status
psql "$DATABASE_URL" -c "SELECT * FROM files WHERE processing_status != 'processed';"

# Reprocess if stuck
bun run sync/files-process.ts
```

**3. Search Query Too Specific**
```typescript
// Lower similarity threshold
search_files("query", { minSimilarity: 0.5 })  // Instead of 0.7
```

---

### Telegram Bot Not Responding

**Symptoms:**
- Messages sent but no reply
- Bot shows "typing" but never responds

**Diagnosis:**

```bash
# Check if process running
ps aux | grep "telegram/index.ts"

# Check logs
cd ~/.claude/tools
tail -100 ~/.claude/tools/telegram/.bot.log
```

**Solutions:**

**1. Process Crashed**
```bash
# Restart bot
cd ~/.claude/tools
bun run telegram/index.ts --vps &

# Or with systemd (if configured)
systemctl --user restart kay-telegram
```

**2. OpenRouter API Error**
```bash
# Test API
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"anthropic/claude-sonnet-4","messages":[{"role":"user","content":"test"}]}'
```

---

### Email Not Classified

**Symptoms:**
- Emails in inbox but no labels applied
- No Telegram notification for actionable emails

**Diagnosis:**

```bash
# Check sync logs
npx @railway/cli logs pai-sync --tail 50 | grep email

# Check database
psql "$DATABASE_URL" -c "
  SELECT COUNT(*) FROM email_logs
  WHERE classified_at > NOW() - INTERVAL '1 hour';
"
```

**Solutions:**

**1. Gmail OAuth Token Expired**
```bash
cd ~/.claude/tools
bun run email/scripts/setup-oauth.ts
# Follow prompts to re-authenticate
```

**2. Gmail API Quota Exceeded**
- Check Google Cloud Console quotas
- Wait for quota reset (usually 24 hours)

**3. Email Fetch Not Running**
```bash
# Check Railway sync schedule
npx @railway/cli variables pai-sync | grep CRON

# Manual fetch
cd ~/.claude/tools
bun run email/index.ts fetch --max 50
```

---

### Meeting Not Transcribed

**Symptoms:**
- Recording in folder but no transcript
- Meeting status stuck on 'transcribing'

**Diagnosis:**

```sql
-- Check meeting processing status
SELECT
  recording_path,
  processing_status,
  processing_error,
  updated_at
FROM meetings
WHERE processing_status IN ('pending', 'transcribing', 'failed')
ORDER BY recorded_at DESC;
```

**Solutions:**

**1. Groq API Error**
```bash
# Test Groq API
curl https://api.groq.com/openai/v1/audio/transcriptions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -F "file=@test.wav" \
  -F "model=whisper-large-v3"
```

**2. Unsupported File Format**
```bash
# Check file type
file /path/to/recording.mp4

# Convert if needed
ffmpeg -i recording.mkv -c:v libx264 -c:a aac recording.mp4
```

**3. Retry Processing**
```bash
cd ~/.claude/tools
bun run meetings/process-recording.ts /path/to/recording.mp4
```

---

## Railway Issues

### Service Not Responding

**Check Status:**
```bash
npx @railway/cli status
```

**Restart Service:**
```bash
npx @railway/cli restart pai-api
npx @railway/cli restart pai-sync
```

**View Logs:**
```bash
npx @railway/cli logs pai-api --tail 200
npx @railway/cli logs pai-sync --tail 200
```

---

### Deployment Failed

**Check Build Logs:**
```bash
npx @railway/cli logs pai-api --deployment latest
```

**Common Causes:**

1. **Build Error:** Syntax error in code
2. **Environment Variable Missing:** Check Railway dashboard
3. **Out of Memory:** Increase Railway plan or optimize build

**Fix:**
```bash
# Redeploy
npx @railway/cli up --service pai-api
```

---

## Database Issues

### Connection Pool Exhausted

**Symptoms:**
- "All connections are busy" error
- Slow queries

**Solutions:**

**1. Increase Pool Size**

Edit tools/lib/db.ts:
```typescript
export const sql = postgres(config.databaseUrl, {
  max: 30,  // Increase from 20
});
```

**2. Close Unused Connections**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND state_change < NOW() - INTERVAL '10 minutes';
```

---

### Slow Queries

**Diagnosis:**
```sql
-- Find slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Solutions:**

1. **Missing Index:** Add index on frequently queried columns
2. **Full Table Scan:** Add WHERE clause filters
3. **Large Dataset:** Implement pagination

---

## Nextcloud Issues

### Files Not Syncing

**Desktop Client:**

1. Check sync status icon (bottom-right)
2. Pause and resume sync
3. Check for conflicts (red exclamation)

**VPS:**

```bash
# Force scan
sudo -u www-data php /var/www/html/occ files:scan oscar

# Check Nextcloud logs
sudo tail -100 /var/www/html/data/nextcloud.log
```

---

### Disk Space Full

**Check Space:**
```bash
df -h /opt/nextcloud
```

**Free Space:**

1. **Delete temp files:**
   ```bash
   rm -rf /tmp/pai-*
   ```

2. **Archive old files:**
   Move to external storage or delete

3. **Clean Nextcloud trash:**
   ```bash
   sudo -u www-data php /var/www/html/occ trashbin:cleanup --all-users
   ```

---

## Emergency Recovery

### Complete System Down

**Priority Order:**

1. **Database:** Verify Neon PostgreSQL accessible
2. **Railway:** Check pai-api and pai-sync services
3. **Telegram Bot:** Restart if needed
4. **VPS Cron:** Check cron jobs running

**Nuclear Option:**

```bash
# Restart everything
systemctl --user restart kay-telegram
npx @railway/cli restart pai-api
npx @railway/cli restart pai-sync
sudo systemctl restart docker  # Restarts Nextcloud
```

---

### Data Loss Prevention

**Backups:**

1. **Database:** Neon automatic backups (7 days)
2. **Files:** Nextcloud desktop client sync (local copy)
3. **Code:** Git auto-sync every 15 minutes
4. **Context:** Synced to Railway every session close

**Restore Process:**

1. **Database:** Contact Neon support for restore
2. **Files:** Use Nextcloud version history
3. **Code:** git pull latest from GitHub
4. **Context:** Deploy from Railway with context-mirror

---

## Getting Help

### Self-Diagnosis

1. Check this troubleshooting guide
2. Check service-specific documentation
3. Check Railway/Neon/Notion status pages
4. Search MEMORY/learnings/ for similar issues

### External Support

**Neon PostgreSQL:** support@neon.tech
**Railway:** https://railway.app/help
**Notion:** https://notion.so/help
**OpenRouter:** https://openrouter.ai/docs

---

## Related Documentation

- [Monitoring](./monitoring.md) - System health dashboards
- [System Overview](../00-overview/system-overview.md) - Architecture reference
- [Database Schema](../04-development/database-schema.md) - Database structure
