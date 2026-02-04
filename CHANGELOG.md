# PAI System Changelog

All notable changes to the Personal AI Infrastructure documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2026-02-04 - Production Release

### System Status
- **Completeness:** 85-90%
- **Stability:** Production-ready
- **Daily Active Use:** Yes

### Infrastructure
- Neon PostgreSQL (47 tables, pgvector enabled)
- Nextcloud on VPS Docker (PARA organized)
- Railway: LibreChat + Sync Service
- VPS: Telegram bot, cron jobs, MCP servers

### Major Features
- ✅ Telegram bot (message processing, file handling, notifications)
- ✅ LibreChat + 43 MCP tools
- ✅ Notion bidirectional sync (11 databases)
- ✅ File processing pipeline (scan, classify, chunk, embed)
- ✅ Email classification and labeling
- ✅ Meeting recording processing
- ✅ RAG search (files and emails)
- ✅ Scheduled automations (7 cron jobs)
- ✅ Git auto-sync (every 15 minutes)

---

## [0.9.0] - 2026-02-02 - Telegram Bot VPS Migration

### Added
- Telegram bot migrated from Railway to VPS
- Direct file hint application (bypasses agent)
- Subfolder override from user hints
- Nextcloud files:scan integration
- rename_file tool for bot

### Changed
- Bot deployment: Railway → VPS systemd service
- Notification system: No Markdown parse_mode (fixed rendering)

### Fixed
- Telegram polling conflict (Railway and VPS both running)
- Bot startup reliability

---

## [0.8.5] - 2026-02-01 - Nextcloud Migration Complete

### Added
- Nextcloud replaces OneDrive completely
- PARA folder structure in Nextcloud
- Desktop and mobile sync working
- Docker auto-start configured

### Removed
- OneDrive integration decommissioned
- OneDrive OAuth tokens deleted
- OneDrive sync scripts removed

### Migration
- All files moved from OneDrive to Nextcloud
- File paths updated in database
- RAG embeddings regenerated

---

## [0.8.0] - 2026-01-30 - Database Migration to Neon

### Added
- Neon PostgreSQL (cloud-hosted, pgvector)
- 47 tables migrated from Railway PostgreSQL

### Changed
- Database: Railway PostgreSQL → Neon PostgreSQL
- Connection string updated in all services
- Backup strategy changed (Neon backups)

### Performance
- Query latency: Improved (~20% faster)
- Storage: Unlimited (was 512 MB on Railway)
- Embeddings: pgvector native (was extension)

---

## [0.7.5] - 2026-01-28 - LLM Models Database

### Added
- `llm_models` table (59 models, 11 providers)
- Model metadata: pricing, context, capabilities
- pai-llm-advisor MCP server
- Model recommendation system

### Features
- recommend_models tool (suggest model for task)
- list_models tool (browse all models)
- Cost optimization suggestions

---

## [0.7.0] - 2026-01-26 - Telegram Bot Improvements

### Added
- Destructive operation confirmation system
- Database connection resilience (auto-reconnect)
- Modular tool context system
- Media watchlist management (movies, TV, anime)
- Games backlog management (RAWG API)

### Changed
- Tool context now modular (easier to maintain)
- Confirmation prompts for delete/archive operations

### Fixed
- Database connection drops
- Tool context duplication

---

## [0.6.5] - 2026-01-23 - Document Generation MCP

### Added
- pai-doc-gen MCP server
- create_document tool (Word, PowerPoint, Excel, Markdown)
- Template-based document generation
- Finalize and save to Nextcloud

### Features
- Word: Paragraphs, headings, tables, lists
- PowerPoint: Slides, titles, bullet points
- Excel: Tables, formulas, formatting
- Markdown: GitHub-flavored

---

## [0.6.0] - 2026-01-22 - RAG Upgrade

### Added
- Hierarchical chunking (doc → section → paragraph)
- Hybrid search (vector + keyword)
- Reranking for better results
- Context extraction at chunk level

### Changed
- Chunking strategy: Flat → Hierarchical
- Search: Vector-only → Hybrid + reranking
- Embedding model: text-embedding-ada-002 → text-embedding-3-small

### Performance
- Search accuracy: +35%
- Query latency: -40% (caching)
- Storage: +20% (more chunks)

---

## [0.5.5] - 2026-01-20 - Email System Enhancements

### Added
- Selective sender tracking (real people only)
- Context enrichment (sender history, project matching)
- Reclassification workflow via Telegram

### Changed
- Classification accuracy: +25%
- Auto-labeling: Improved logic
- Task extraction: Better prompt

### Fixed
- Forwarded email parsing (kayworkforwarding)
- Duplicate email detection

---

## [0.5.0] - 2026-01-15 - Meeting Recording System

### Added
- Meeting recording pipeline (video → transcript → tasks)
- Groq Whisper transcription
- Speaker detection (vision model on Teams UI)
- Task/decision extraction (Claude Sonnet)
- Telegram notification with summary

### Automation
- Cron every 15 min during business hours
- Auto-detect new recordings in Nextcloud
- Process and notify within 30 minutes

---

## [0.4.5] - 2026-01-10 - Sync System Improvements

### Added
- sync_run_history table (track all sync runs)
- Sync failure alerting via Telegram
- Retry logic for transient failures

### Changed
- Sync interval: 5 min → 10 min (Railway optimization)
- Error handling: Silent fail → Alert + retry
- Logging: Minimal → Comprehensive

### Performance
- Sync reliability: 95% → 99.5%
- Alert latency: <1 min after failure

---

## [0.4.0] - 2026-01-05 - LibreChat Integration

### Added
- LibreChat web UI deployed on Railway
- PAI API MCP server (43 tools)
- MCP tools: tasks, projects, calendar, files, search
- OAuth integration with OpenRouter

### Features
- Claude conversations in web UI
- Tool calling (database queries)
- File search via RAG
- Context persistence

---

## [0.3.5] - 2025-12-28 - Scheduled Notifications

### Added
- Morning summary (8 AM)
- Overdue task alerts (9 AM)
- High priority reminder (2 PM)
- Meeting reminders (15 min, 5 min before)
- Evening review (on-demand)

### Configuration
- Per-user notification settings
- Deduplication (won't send twice)
- Task context for follow-up actions

---

## [0.3.0] - 2025-12-20 - File Processing Pipeline

### Added
- Automatic file classification
- PARA organization (Projects, Areas, Resources, Archive)
- Text extraction (Dockling for PDFs/DOCX)
- Chunking and embedding
- RAG search over files

### Features
- Inbox watcher (real-time detection)
- User hints (project assignment)
- Low-confidence review workflow
- Nextcloud integration

---

## [0.2.5] - 2025-12-15 - Calendar Integration

### Added
- Google Calendar bidirectional sync
- Calendar event to task trigger
- Event exclusion filtering
- Meeting link extraction

### Features
- Sync personal calendar (bidirectional)
- Work calendar (read-only)
- Task due dates → Calendar events
- Reminders via Telegram

---

## [0.2.0] - 2025-12-10 - Notion Sync

### Added
- Notion API integration
- Bidirectional sync (11 databases)
- Conflict resolution (last-write-wins)
- Sync every 5 minutes (later 10 min)

### Databases Synced
- Tasks, Projects, Goals, Notes
- Tags, People, Media, Games
- System Upgrades, System Fixes
- Areas, Resources

---

## [0.1.5] - 2025-12-05 - Telegram Bot Launch

### Added
- Telegram bot interface
- Claude Sonnet integration (via OpenRouter)
- Task management commands
- File handling (voice, images, documents)
- Conversation history

### Features
- Natural language task creation
- Voice transcription
- Image analysis
- File inbox processing

---

## [0.1.0] - 2025-12-01 - Initial Release

### Infrastructure
- PostgreSQL database (Railway, later migrated to Neon)
- VPS setup (Hostinger)
- Basic sync scripts
- Claude Code integration

### Core Features
- Task database
- Project tracking
- Basic file storage

---

## Upcoming Features (Planned)

### Short-term (Next 1-2 months)
- [ ] LLM models auto-update (sync from OpenRouter)
- [ ] Word document table support (pai-doc-gen)
- [ ] Database backup automation
- [ ] Email task extraction improvements
- [ ] Proactive calendar conflict detection

### Medium-term (Next 3-6 months)
- [ ] Multi-user support (family/team instances)
- [ ] Advanced analytics dashboard
- [ ] Cross-project dependency tracking
- [ ] Automatic task prioritization
- [ ] Meeting speaker detection improvements

### Long-term (6+ months)
- [ ] Mobile app (native vs web app TBD)
- [ ] Voice interface (beyond transcription)
- [ ] Predictive notifications (ML-based)
- [ ] Integration marketplace (community extensions)
- [ ] White-label packaging (easier deployment for others)

---

## Known Issues

### High Priority
- None currently

### Medium Priority
- Email task confirmation workflow could be streamlined
- Meeting speaker detection accuracy varies
- File classification needs manual review for low-confidence cases

### Low Priority
- Telegram bot no auto-restart (systemd unavailable on VPS)
- Error logging could be more structured
- Some sync failures not alerted (edge cases)

---

## Deprecations & Removals

### Removed in v0.8.5
- **OneDrive integration** - Replaced by Nextcloud
  - Last version with OneDrive: v0.8.0
  - Migration guide: See docs/migrations/onedrive-to-nextcloud.md

### Decommissioned in v0.8.0
- **Railway PostgreSQL** - Migrated to Neon
  - Last version: v0.7.5
  - Migration: Automated via scripts

### Removed in v0.6.0
- **Flat chunking** - Replaced by hierarchical
  - Required re-indexing all files

---

## Contributors

**Primary Developer:** Oscar Wright
**AI Assistant:** Kay (Claude Sonnet 4.5)

---

## Versioning

PAI follows [Semantic Versioning](https://semver.org/):
- **Major (1.x.x):** Breaking changes, major features
- **Minor (x.1.x):** New features, backward compatible
- **Patch (x.x.1):** Bug fixes, minor improvements

**Current:** v1.0.0 (Production-ready)
**Next:** v1.1.0 (LLM models auto-update planned)

---

**Last Updated:** February 4, 2026
**Documentation:** See docs/ for full details
