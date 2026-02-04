# System Monitoring

**Purpose:** Track PAI system health and performance
**Tools:** Railway dashboards, database queries, logs
**Alert Channel:** Telegram (via send_notification)
**Last Updated:** February 4, 2026

---

## Quick Health Check

```bash
# All systems operational?
npx @railway/cli status && \
ps aux | grep telegram && \
psql "$DATABASE_URL" -c "SELECT 'DB OK'" && \
echo "✅ All systems operational"
```

---

## Key Metrics

### Sync Performance

```sql
-- Last 10 sync runs
SELECT
  entity,
  direction,
  status,
  duration_ms / 1000.0 as duration_sec,
  records_processed,
  started_at
FROM sync_run_history
ORDER BY started_at DESC
LIMIT 10;

-- Average duration by entity (last 24h)
SELECT
  entity,
  direction,
  COUNT(*) as runs,
  ROUND(AVG(duration_ms) / 1000.0, 2) as avg_duration_sec,
  MAX(duration_ms) / 1000.0 as max_duration_sec
FROM sync_run_history
WHERE started_at > NOW() - INTERVAL '24 hours'
GROUP BY entity, direction
ORDER BY avg_duration_sec DESC;
```

---

### File Processing

```sql
-- Processing status distribution
SELECT
  processing_status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percent
FROM files
GROUP BY processing_status;

-- Embedding coverage
SELECT
  COUNT(*) as total_files,
  COUNT(*) FILTER (WHERE embedding IS NOT NULL) as embedded_files,
  ROUND(100.0 * COUNT(*) FILTER (WHERE embedding IS NOT NULL) / COUNT(*), 1) as coverage_pct
FROM files;

-- Recent processing errors
SELECT
  filename,
  extraction_error,
  created_at
FROM files
WHERE processing_status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

---

### Email Processing

```sql
-- Classification distribution (last 7 days)
SELECT
  category,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percent
FROM email_logs
WHERE classified_at > NOW() - INTERVAL '7 days'
GROUP BY category
ORDER BY count DESC;

-- Task extraction rate
SELECT
  COUNT(*) as actionable_emails,
  COUNT(*) FILTER (WHERE (extracted_action_items::text) != '[]') as with_tasks,
  ROUND(100.0 * COUNT(*) FILTER (WHERE (extracted_action_items::text) != '[]') / COUNT(*), 1) as extraction_rate_pct
FROM email_logs
WHERE category = 'actionable'
  AND classified_at > NOW() - INTERVAL '7 days';
```

---

### AI API Usage

```sql
-- Usage by automation (this month)
SELECT
  automation_name,
  COUNT(*) as calls,
  SUM(input_tokens + output_tokens) as total_tokens,
  ROUND(SUM(total_cost)::numeric, 2) as total_cost_usd
FROM ai_call_log
WHERE call_timestamp > DATE_TRUNC('month', NOW())
GROUP BY automation_name
ORDER BY total_cost_usd DESC;

-- Usage by model (this month)
SELECT
  model,
  COUNT(*) as calls,
  ROUND(SUM(total_cost)::numeric, 2) as total_cost_usd
FROM ai_call_log
WHERE call_timestamp > DATE_TRUNC('month', NOW())
GROUP BY model
ORDER BY total_cost_usd DESC;

-- Daily trend (last 7 days)
SELECT
  DATE(call_timestamp) as date,
  COUNT(*) as calls,
  ROUND(SUM(total_cost)::numeric, 2) as cost_usd
FROM ai_call_log
WHERE call_timestamp > NOW() - INTERVAL '7 days'
GROUP BY DATE(call_timestamp)
ORDER BY date DESC;
```

---

## System Health Checks

### Database Health

```sql
-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Connection count
SELECT
  COUNT(*) as connections,
  COUNT(*) FILTER (WHERE state = 'active') as active,
  COUNT(*) FILTER (WHERE state = 'idle') as idle
FROM pg_stat_activity;

-- Slow queries (if pg_stat_statements enabled)
SELECT
  query,
  calls,
  ROUND(mean_exec_time::numeric, 2) as mean_ms,
  ROUND(total_exec_time::numeric, 2) as total_ms
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

### Railway Status

```bash
# Service status
npx @railway/cli status

# Recent deployments
npx @railway/cli deployments --service pai-api --limit 5
npx @railway/cli deployments --service pai-sync --limit 5

# Resource usage
npx @railway/cli metrics pai-api
npx @railway/cli metrics pai-sync
```

---

### VPS Resources

```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU load
uptime

# Top processes
ps aux --sort=-%mem | head -10
```

---

## Automated Monitoring

### Health Check Automation

**Script:** `/home/ubuntu/automations/health-check.sh`
**Schedule:** Daily 2am Mon-Sat, Sunday 2am (weekly security audit)

**Checks:**
1. Railway services (pai-api, pai-sync)
2. Database connectivity
3. Sync run success rate
4. File processing queue size
5. Email classification rate
6. AI API costs

**Output:** Telegram notification with summary

**Example Notification:**

```
🏥 PAI Health Check (Feb 4, 2:00 AM)

✅ Railway Services: Operational
✅ Database: Connected (40ms latency)
✅ Sync Success Rate: 98% (last 24h)
✅ File Processing: 3 pending (normal)
✅ Email Classification: 24 emails processed
⚠️ AI Costs: $1.23 today (trending high)

Full report: /home/ubuntu/automations/logs/health-check-2026-02-04.log
```

---

### Alert Thresholds

**Configure in** `/home/ubuntu/automations/lib/health-check-config.ts`:

```typescript
export const ALERT_THRESHOLDS = {
  sync: {
    failureRate: 0.1,        // Alert if >10% failures
    maxDuration: 300,        // Alert if sync >5 minutes
  },
  files: {
    processingQueue: 50,     // Alert if >50 files pending
    failureRate: 0.05,       // Alert if >5% failures
  },
  email: {
    classificationRate: 0.9, // Alert if <90% classified
  },
  ai: {
    dailyCost: 5.0,          // Alert if >$5/day
    monthlyCost: 100.0,      // Alert if >$100/month
  },
  database: {
    connections: 80,         // Alert if >80% pool used
    queryTime: 1000,         // Alert if queries >1s
  },
};
```

---

## Manual Checks

### Check Sync Status

```bash
# Last sync time for each entity
cd ~/.claude/tools
bun -e "
import { sql } from './lib/db.js';
const result = await sql\`
  SELECT DISTINCT ON (entity, direction)
    entity,
    direction,
    status,
    started_at,
    NOW() - started_at as time_since
  FROM sync_run_history
  ORDER BY entity, direction, started_at DESC
\`;
console.table(result);
await sql.end();
"
```

---

### Check File Processing Queue

```bash
# Files waiting to be processed
cd ~/.claude/tools
bun -e "
import { sql } from './lib/db.js';
const result = await sql\`
  SELECT
    processing_status,
    COUNT(*) as count
  FROM files
  GROUP BY processing_status
\`;
console.table(result);
await sql.end();
"
```

---

### Check Email Processing

```bash
# Recent email classification
cd ~/.claude/tools
bun -e "
import { sql } from './lib/db.js';
const result = await sql\`
  SELECT
    category,
    COUNT(*) as count
  FROM email_logs
  WHERE classified_at > NOW() - INTERVAL '24 hours'
  GROUP BY category
\`;
console.table(result);
await sql.end();
"
```

---

## Performance Baselines

**Current State (February 2026):**

| Metric | Current | Target | Alert If |
|--------|---------|--------|----------|
| Sync cycle duration | 40-60s | <120s | >300s |
| File processing time | 2-5 min | <10 min | >30 min |
| Email classification time | 2-3s | <5s | >10s |
| RAG search latency | 100-200ms | <500ms | >1s |
| Database queries | 10-50ms | <100ms | >1s |
| Sync success rate | 98% | >95% | <90% |
| Embedding coverage | 97.5% | >95% | <80% |

---

## Related Documentation

- [Troubleshooting](./troubleshooting.md) - Fix common issues
- [Database Schema](../04-development/database-schema.md) - Query reference
- [Cron Schedule](../06-reference/cron-schedule.md) - Automation timing
