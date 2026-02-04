# PAI Deployment Checklist

**Purpose:** Verify complete and correct PAI setup
**Use:** After initial setup, after migrations, quarterly health checks
**Format:** Checkbox-style verification

---

## Pre-Deployment

### Accounts Created
- [ ] Hostinger VPS account (or similar Linux VPS)
- [ ] Neon PostgreSQL account
- [ ] Railway account
- [ ] Notion account
- [ ] Google account (for Calendar, Gmail)
- [ ] Telegram account
- [ ] OpenRouter account
- [ ] Modal account (for Dockling)
- [ ] RAWG account (optional, for games)
- [ ] TMDB account (optional, for movies/TV)

### Credentials Collected
- [ ] Database connection string (Neon)
- [ ] Notion integration token
- [ ] Google OAuth credentials (.credentials.json)
- [ ] Telegram bot token
- [ ] OpenRouter API key
- [ ] Modal token ID and secret
- [ ] RAWG API key (if using)
- [ ] TMDB API key (if using)

### Local Setup
- [ ] `.env` file created with all credentials
- [ ] `.credentials.json` for Google OAuth
- [ ] SSH key generated for GitHub (if using git sync)

---

## Infrastructure

### VPS
- [ ] VPS provisioned and accessible via SSH
- [ ] Users created: `ubuntu` (primary), `oscar` (optional)
- [ ] Bun installed at `~/.bun/bin/bun`
- [ ] Claude Code installed at `~/.local/bin/claude`
- [ ] Git configured (user.name, user.email)
- [ ] GitHub authentication working (test: `git ls-remote origin`)

### VPS Startup
- [ ] `.bashrc` startup menu working (4 options)
- [ ] tmux available and working
- [ ] Option 2 (new tmux session) works
- [ ] Option 3 (resume tmux) works
- [ ] `claude-persistent.sh` script exists at `~/.claude/scripts/`
- [ ] PATH includes `/home/ubuntu/.local/bin` and `/home/ubuntu/.bun/bin`

### Docker (Nextcloud)
- [ ] Docker installed
- [ ] Docker auto-start enabled: `sudo systemctl is-enabled docker`
- [ ] Nextcloud container running: `sudo docker ps | grep nextcloud`
- [ ] Nextcloud accessible via web UI
- [ ] Nextcloud desktop client installed and syncing
- [ ] Mobile app configured (optional)

### Nextcloud Structure
- [ ] `/opt/nextcloud/files/oscar/files/` exists
- [ ] PARA folders created:
  - [ ] `Projects/`
  - [ ] `Areas/`
  - [ ] `Resources/`
  - [ ] `Archive/`
  - [ ] `Inbox/`
  - [ ] `Recordings/Meetings/`

---

## Database

### Neon PostgreSQL
- [ ] Database created (neondb or custom name)
- [ ] Connection string obtained
- [ ] pgvector extension enabled
- [ ] Connection test: `psql $DATABASE_URL -c "SELECT 1;"`

### Schema Migration
- [ ] All 47 tables created
- [ ] Key tables verified:
  - [ ] `tasks`
  - [ ] `projects`
  - [ ] `notes`
  - [ ] `files`
  - [ ] `file_chunks`
  - [ ] `calendar_events`
  - [ ] `bot_logs`
  - [ ] `sync_run_history`
  - [ ] `llm_models`

### Sample Data (Optional)
- [ ] Test task created
- [ ] Test project created
- [ ] LLM models table populated (59 models)

---

## Notion Integration

### Notion Setup
- [ ] Integration created at https://www.notion.so/my-integrations
- [ ] Integration token obtained
- [ ] All 11 databases created in Notion
- [ ] Integration connected to all databases

### Notion Databases
- [ ] Tasks database
- [ ] Projects database
- [ ] Goals database
- [ ] Notes database
- [ ] Tags database
- [ ] People database
- [ ] Media Watchlist database
- [ ] Games Backlog database
- [ ] System Upgrades database
- [ ] System Fixes database
- [ ] Areas database (if using)

### Database IDs
- [ ] All database IDs collected (from Notion URL)
- [ ] Database IDs added to `.env` file

---

## Google Integration

### OAuth Setup
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] Credentials created (OAuth 2.0 Client ID)
- [ ] `.credentials.json` downloaded
- [ ] Redirect URI configured: `http://localhost:3000/oauth2callback`

### OAuth Flow
- [ ] Run `bun run setup-google-oauth.ts`
- [ ] Browser opens for consent
- [ ] Authorization successful
- [ ] Token saved to `oauth_tokens` table
- [ ] Test: `bun run sync/calendar-google-to-sql.ts`

### Scopes
- [ ] Calendar read/write enabled
- [ ] Gmail read enabled (if using email system)

---

## Railway Deployment

### Project Setup
- [ ] Railway project created
- [ ] GitHub repo connected (or direct deploy)
- [ ] Environment variables set (copy from .env)

### Services
- [ ] Sync Service deployed
  - [ ] Dockerfile: `Dockerfile` (main)
  - [ ] Start command: `bun run scripts/startup.ts`
  - [ ] Cron schedule: `*/10 * * * *`
  - [ ] Environment variables set
  - [ ] Deployment successful
  - [ ] Logs show sync runs

- [ ] PAI API deployed
  - [ ] Dockerfile: `Dockerfile.api`
  - [ ] Port: 3456
  - [ ] Public URL obtained
  - [ ] MCP endpoints accessible
  - [ ] Test: curl https://your-url/health

### LibreChat (Optional)
- [ ] LibreChat deployed (if using)
- [ ] MCP server URL configured
- [ ] Test: Open web UI, try MCP tool

---

## Telegram Bot

### Bot Setup
- [ ] Bot created via @BotFather
- [ ] Bot token obtained
- [ ] Bot username recorded
- [ ] Allowed users (chat IDs) collected

### VPS Deployment
- [ ] Bot code deployed to `/home/ubuntu/.claude/tools/telegram/`
- [ ] `.env` file with TELEGRAM_BOT_TOKEN
- [ ] TELEGRAM_ALLOWED_USERS set
- [ ] Test run: `bun run telegram/index.ts --vps`
- [ ] Bot responds to /help

### Systemd (Optional - if available)
- [ ] Service file created: `kay-telegram-vps.service`
- [ ] Service enabled: `systemctl --user enable kay-telegram-vps`
- [ ] Service started: `systemctl --user start kay-telegram-vps`
- [ ] Service status check: `systemctl --user status kay-telegram-vps`

**Note:** If systemd user services unavailable, run as direct process.

### Bot Verification
- [ ] Send test message to bot
- [ ] Bot responds
- [ ] `/help` command works
- [ ] Task query works: "What tasks do I have?"
- [ ] File processing works: Send a file
- [ ] Voice transcription works: Send voice message
- [ ] Image analysis works: Send image

---

## Sync System

### Railway Sync Service
- [ ] Service running: `npx @railway/cli status`
- [ ] Logs show regular sync: `npx @railway/cli logs`
- [ ] `sync_run_history` table has entries
- [ ] Last sync < 15 minutes ago

### Sync Scripts (VPS)
- [ ] All sync scripts exist in `/home/ubuntu/.claude/tools/sync/`
- [ ] Test manual sync: `bun run sync/cron-sync.ts`
- [ ] No errors in output

### Bidirectional Sync Test
1. **Notion → PostgreSQL:**
   - [ ] Create task in Notion
   - [ ] Wait 10 minutes (or run sync manually)
   - [ ] Query PostgreSQL: task appears
   - [ ] Task visible in Telegram bot

2. **PostgreSQL → Notion:**
   - [ ] Create task via Telegram bot
   - [ ] Wait 10 minutes (or run sync manually)
   - [ ] Check Notion: task appears
   - [ ] Notion page ID in PostgreSQL

---

## File Processing

### Pipeline Components
- [ ] Dockling parser accessible (Modal)
- [ ] Modal token configured
- [ ] Test Dockling: `bun run sync/files-process.ts` (with PDF in Inbox)

### Inbox Watcher
- [ ] Telegram bot has inbox watcher enabled
- [ ] Drop file in Nextcloud Inbox
- [ ] Telegram notification appears immediately
- [ ] File processing completes

### RAG Search
- [ ] Embeddings generated for test files
- [ ] Test search: `bun run rag-search.ts "test query"`
- [ ] Results returned
- [ ] Test via Telegram: "Find documents about [topic]"

---

## Email System (Optional)

### Gmail API
- [ ] Gmail API enabled in Google Cloud
- [ ] OAuth scopes include Gmail
- [ ] Test fetch: `bun run email/index.ts fetch`
- [ ] Emails appear in database

### Classification
- [ ] Test email classified correctly
- [ ] Gmail labels applied
- [ ] Telegram confirmation for actionable emails

---

## Meeting Recording (Optional)

### Pipeline
- [ ] Recordings folder exists: `Nextcloud/Recordings/Meetings/`
- [ ] Groq API configured (for Whisper)
- [ ] Test recording processed
- [ ] Transcript generated
- [ ] Telegram notification received

### Cron
- [ ] Meeting check cron configured (every 15 min, weekdays 8 AM-7 PM)
- [ ] Test: Drop recording, wait for cron
- [ ] Processing triggered automatically

---

## Automation & Cron

### VPS Cron
- [ ] Crontab configured: `crontab -l`
- [ ] All 7 jobs present:
  - [ ] sync-to-github.sh (every 15 min)
  - [ ] health-check.sh (Mon-Sat 2 AM)
  - [ ] security-audit.sh (Sunday 2 AM)
  - [ ] rag-reindex.sh (daily 3 AM)
  - [ ] extract-missed-learnings.sh (daily 4 AM)
  - [ ] memory-maintenance.sh (Sunday 5 AM)
  - [ ] meeting-check.sh (weekdays 8 AM-7 PM, every 15 min)

### Git Auto-Sync
- [ ] Script exists: `~/.claude/sync-to-github.sh`
- [ ] Script executable: `chmod +x`
- [ ] SSH authentication working
- [ ] Test sync: Run script manually
- [ ] Commit created and pushed to GitHub

### Verification
- [ ] Check logs for each job (in `/home/ubuntu/automations/logs/`)
- [ ] Recent execution timestamps
- [ ] No errors in logs

---

## Scheduled Notifications

### Telegram Scheduler
- [ ] Telegram bot scheduler running
- [ ] Notification settings configured in database
- [ ] Test: Enable morning summary
- [ ] Wait for next 8 AM (or adjust time for testing)
- [ ] Morning summary received

### Notification Types
- [ ] Morning summary (8 AM) - Test enabled
- [ ] Overdue tasks (9 AM) - Test enabled
- [ ] High priority reminder (2 PM) - Test enabled
- [ ] Meeting reminders (15 min, 5 min before) - Test enabled

---

## MCP Servers

### Local MCP Servers (VPS)
- [ ] `pai-rag-search` configured in Claude Code
- [ ] `pai-doc-gen` configured
- [ ] `pai-llm-advisor` configured
- [ ] Test: Use MCP tool in Claude Code

### LibreChat MCP (Railway)
- [ ] PAI API accessible
- [ ] 43 MCP tools available
- [ ] Test: Use tool in LibreChat web UI

---

## Verification Tests

### End-to-End Task Flow
1. [ ] Create task in Notion
2. [ ] Task appears in Telegram bot (within 10 min)
3. [ ] Update task via Telegram
4. [ ] Update appears in Notion (within 10 min)
5. [ ] Mark task done in Telegram
6. [ ] Status updated in Notion

### End-to-End File Flow
1. [ ] Drop file in Nextcloud Inbox
2. [ ] Telegram notification immediate
3. [ ] Provide project hint
4. [ ] File moved to project folder
5. [ ] File indexed and searchable
6. [ ] RAG search returns file

### End-to-End Email Flow
1. [ ] Email arrives in Gmail
2. [ ] Railway sync fetches (within 10 min)
3. [ ] Email classified
4. [ ] Gmail label applied
5. [ ] Telegram confirmation (if actionable)
6. [ ] Task created from email

---

## Performance & Health

### Response Times
- [ ] Telegram bot responds < 3 seconds
- [ ] Database queries < 500ms
- [ ] RAG search < 2 seconds
- [ ] File processing < 90 seconds

### Sync Latency
- [ ] Notion → PostgreSQL < 10 minutes
- [ ] PostgreSQL → Notion < 10 minutes
- [ ] Calendar sync < 10 minutes

### Error Rates
- [ ] Check `sync_run_history`: Success rate > 95%
- [ ] Check `bot_logs`: Error rate < 5%
- [ ] No critical errors in logs

### Resource Usage
- [ ] VPS CPU usage < 50% average
- [ ] VPS memory usage < 80%
- [ ] Database size reasonable (< 2 GB)
- [ ] Nextcloud storage sufficient

---

## Security

### Credentials
- [ ] `.env` file NOT in git (in .gitignore)
- [ ] `.credentials.json` NOT in git
- [ ] SSH keys have passphrases (recommended)
- [ ] Telegram bot only responds to allowed users

### Database
- [ ] Connection string uses SSL
- [ ] Neon password rotation available (know how)
- [ ] No public database access (only via connection string)

### VPS
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication (password disabled recommended)
- [ ] fail2ban configured (optional)
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`

---

## Backup & Recovery

### Backup Strategy
- [ ] Neon database backups enabled (automatic)
- [ ] `.env` file backed up securely (encrypted)
- [ ] `.credentials.json` backed up
- [ ] SSH keys backed up
- [ ] Nextcloud data backed up (or accepted as synced copy)

### Recovery Plan
- [ ] Know how to restore Neon database
- [ ] Know how to rebuild VPS from scratch
- [ ] Know how to redeploy Railway services
- [ ] Documentation accessible if VPS lost

---

## Documentation

### For Yourself
- [ ] `.env.example` file created (no secrets)
- [ ] Custom config documented (if any)
- [ ] Architecture decisions recorded (ADRs)

### For Others (if sharing)
- [ ] README.md explains setup
- [ ] Prerequisites documented
- [ ] Step-by-step setup guide
- [ ] Troubleshooting section

---

## Optional Features

### Advanced
- [ ] LibreChat deployed
- [ ] Email system active
- [ ] Meeting recording active
- [ ] Games backlog configured
- [ ] Media watchlist configured
- [ ] AI cost tracking active

### Monitoring (Future)
- [ ] Observability dashboard deployed (if using)
- [ ] Grafana/Prometheus (if using)
- [ ] Alert system configured

---

## Final Verification

### Smoke Tests
- [ ] Send Telegram message: Bot responds
- [ ] Create task via Telegram: Appears in Notion
- [ ] Drop file: Processed and searchable
- [ ] Check cron: sync-to-github committed today
- [ ] Check Railway: Sync logs show recent runs

### User Acceptance
- [ ] Morning summary works as expected
- [ ] Task management workflow smooth
- [ ] File organization intuitive
- [ ] Search finds relevant files
- [ ] Notifications helpful (not annoying)

---

## Post-Deployment

### First Week
- [ ] Monitor sync_run_history for failures
- [ ] Check bot_logs for errors
- [ ] Adjust notification settings if needed
- [ ] Fine-tune file classification (hints)

### First Month
- [ ] Review LLM costs (`/costs` command)
- [ ] Optimize sync frequency if needed
- [ ] Add custom workflows/automations
- [ ] Extract learnings to MEMORY/

### Quarterly
- [ ] Review this checklist again
- [ ] Update Notion structure if needed
- [ ] Review and archive old files
- [ ] Check for PAI updates

---

## Troubleshooting Reference

If anything fails during checklist:
1. Check logs (Railway, VPS, database)
2. Verify environment variables
3. Test connections (database, APIs)
4. Consult docs: `docs/05-operations/troubleshooting.md`
5. Run diagnostic: `bun run scripts/verify-system.ts` (if exists)

---

## Checklist Complete

- [ ] All required items checked
- [ ] All tests passing
- [ ] System stable for 24 hours
- [ ] User satisfied with setup

**Date Completed:** ___________
**Deployed By:** ___________
**Version:** ___________

---

**Next Review Date:** ___________ (Recommend: 3 months)

---

## Related Documentation

- [Prerequisites](prerequisites.md)
- [VPS Setup](vps-setup.md)
- [Database Setup](database-setup.md)
- [Notion Integration](notion-integration.md)
- [Troubleshooting](../05-operations/troubleshooting.md)

---

**Last Updated:** February 4, 2026
**Use:** Print and check off as you deploy
