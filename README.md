# PAI - Personal AI Infrastructure

**Version:** 1.0
**Last Updated:** February 4, 2026
**Status:** Production (85-90% complete)

---

## What is PAI?

PAI (Personal AI Infrastructure) is a comprehensive, self-hosted AI assistant system designed to integrate deeply with your digital life. Unlike commercial AI assistants that sit in isolated apps, PAI connects to your:

- **Task management** (Notion)
- **Calendar** (Google Calendar)
- **Files** (Nextcloud)
- **Email** (Gmail)
- **Communication** (Telegram)
- **Projects, notes, people, goals** (Notion databases)

PAI provides multiple interfaces:
- **Telegram bot** - Mobile-first, always available
- **LibreChat web UI** - Claude conversations with MCP tools
- **Claude Code** - Development environment integration

---

## What Can PAI Do?

### Task & Project Management
- Create, update, complete tasks via Telegram or LibreChat
- Bidirectional sync with Notion (changes anywhere update everywhere)
- Task extraction from emails
- Task reminders and overdue alerts
- Calendar-based task triggers

### File Management
- Automatic file classification (work, personal, projects)
- PARA organization (Projects, Areas, Resources, Archive)
- Semantic search across all files (RAG)
- Voice transcription (send voice memo → get text)
- Image analysis and document extraction

### Communication & Notifications
- Morning roundup (tasks due today, calendar, priorities)
- Overdue task alerts
- File expiry warnings
- Meeting recording processing (video → transcript → tasks/decisions)

### Knowledge Management
- Semantic search over files and emails
- Automatic chunking and embeddings
- Document generation (Word, PowerPoint, Excel, Markdown)
- Note-taking with automatic organization

### Media & Entertainment
- Movies, TV shows, anime watchlist (TMDB integration)
- Games backlog management (RAWG API)
- Rating and tracking

### System Intelligence
- Context-aware responses (knows your projects, people, schedule)
- Session memory and learning extraction
- Proactive suggestions based on patterns
- System feedback collection (`/feedback` command)

---

## Architecture

```
┌──────────────────────────────────────────┐
│       External Services (Cloud)          │
│  Notion • Google • OpenRouter • Modal    │
│  RAWG • Telegram • TMDB                  │
└──────────────────────────────────────────┘
                    ↕
┌──────────────────────────────────────────┐
│            VPS (Hostinger)               │
│  • Nextcloud (file storage)              │
│  • Telegram Bot (message processing)     │
│  • Cron Jobs (automation)                │
│  • MCP Servers (RAG, docs, LLM advisor)  │
└──────────────────────────────────────────┘
                    ↕
┌──────────────────────────────────────────┐
│            Railway (Cloud)               │
│  • LibreChat + PAI API (web UI)          │
│  • Sync Service (Notion ↔ PostgreSQL)   │
└──────────────────────────────────────────┘
                    ↕
┌──────────────────────────────────────────┐
│       Neon PostgreSQL (Database)         │
│  47 tables, pgvector, embeddings         │
└──────────────────────────────────────────┘
```

---

## Why Build Your Own PAI?

### Ownership & Privacy
- Your data stays in your infrastructure
- No vendor lock-in
- Full control over AI models and providers

### Deep Integration
- Connects to YOUR systems (Notion, Calendar, Files)
- Learns YOUR workflows and context
- Customizable to YOUR needs

### Extensibility
- Open source, modifiable
- Add new capabilities via MCP tools
- Integrate with any API

### Cost-Effective
- Pay only for compute and LLM API calls
- Self-hosted storage
- No per-user licensing fees

---

## Who Should Build PAI?

### Good Fit:
- **Power users** who want deep AI integration with their digital life
- **Knowledge workers** managing complex projects, tasks, files
- **Privacy-conscious users** who want to own their AI infrastructure
- **Developers** comfortable with command-line tools and basic debugging

### Not a Good Fit (Yet):
- **Non-technical users** without command-line experience (though we're working on this!)
- **Users on limited budgets** (requires VPS, database, LLM API costs)
- **Users wanting plug-and-play** (setup requires 2-4 hours of configuration)

---

## What You'll Need

### Technical Skills
- Basic command-line navigation (cd, ls, cat)
- Ability to edit configuration files
- Comfortable following step-by-step instructions
- Basic understanding of APIs and OAuth (or willingness to learn)

### Services & Accounts
- **Hostinger VPS** ($5-15/month) or similar Linux VPS
- **Neon PostgreSQL** (free tier sufficient to start)
- **Railway** (free tier sufficient to start)
- **Notion** account (free tier works)
- **Google** account (for Calendar, Gmail)
- **Telegram** account (for mobile interface)
- **OpenRouter** account (pay-as-you-go LLM access)

### Time Investment
- **Initial setup:** 2-4 hours
- **Learning curve:** 1-2 weeks to become proficient
- **Maintenance:** ~30 minutes/month

### Estimated Costs
- VPS: $5-15/month
- LLM API (OpenRouter): $10-30/month (varies by usage)
- Railway: $0-5/month (free tier usually sufficient)
- Neon PostgreSQL: $0 (free tier)
- **Total:** ~$15-50/month depending on usage

---

## Modular Architecture

PAI is designed to be **modular** - you can choose which components to deploy:

### Core (Required)
- PostgreSQL database (Neon)
- VPS with basic setup
- Notion integration

### Interfaces (Pick One or More)
- Telegram bot (mobile-first)
- LibreChat (web UI)
- Claude Code integration

### Features (Optional)
- File processing & RAG search
- Email classification & task extraction
- Meeting recording processing
- Media watchlist management
- Games backlog tracking
- Calendar integration
- Scheduled notifications

**Start with Core + one Interface, then add Features as needed.**

---

## Documentation Structure

This repository contains complete setup and usage documentation:

### Getting Started
1. [System Overview](docs/00-overview/system-overview.md) - High-level architecture
2. [Prerequisites](docs/01-setup/prerequisites.md) - What you need before starting
3. [Setup Guides](docs/01-setup/) - Step-by-step installation

### Using PAI
- [Capabilities](docs/02-capabilities/) - What each system can do
- [Usage Guides](docs/03-usage/) - Daily workflows and common tasks
- [Reference](docs/06-reference/) - Commands, APIs, tables

### For Developers
- [Development](docs/04-development/) - Codebase structure, extending PAI
- [Operations](docs/05-operations/) - Monitoring, troubleshooting, backups

---

## Quick Start

### Option A: Full Setup (2-4 hours)
Follow the complete setup guide for a fully functional PAI system:
1. [Prerequisites](docs/01-setup/prerequisites.md)
2. [VPS Setup](docs/01-setup/vps-setup.md)
3. [Database Setup](docs/01-setup/database-setup.md)
4. [Notion Integration](docs/01-setup/notion-integration.md)
5. [Telegram Bot](docs/01-setup/telegram-bot-setup.md)

### Option B: Minimal Setup (30 minutes)
Get a basic working system quickly:
1. PostgreSQL database (Neon)
2. Notion integration
3. Railway sync service
4. One interface (Telegram or LibreChat)

### Option C: Explore First (15 minutes)
Read the documentation to understand what PAI can do:
1. [System Overview](docs/00-overview/system-overview.md)
2. [Telegram Bot Capabilities](docs/02-capabilities/telegram-bot.md)
3. [File Processing](docs/02-capabilities/file-processing.md)

---

## Support & Community

### Documentation
- Full setup guides in `docs/01-setup/`
- Troubleshooting in `docs/05-operations/troubleshooting.md`
- Reference documentation in `docs/06-reference/`

### Getting Help
- **Issues:** GitHub Issues for bugs and feature requests
- **Questions:** GitHub Discussions for usage questions
- **Pull Requests:** Contributions welcome!

---

## Credits

**Created by:** Oscar Wright
**AI Assistant:** Kay (Claude Sonnet 4.5)
**Inspired by:** PARA method (Tiago Forte), Building a Second Brain, Zettelkasten

---

## License

[License TBD - discuss with Oscar]

---

## Building Your Own PAI

Want to replicate this system? You have two paths:

### Path 1: Start from Daniel Miessler's Base PAI (Recommended for New Builders)

1. **Watch:** [Daniel Miessler - Building Your Personal AI Infrastructure](https://www.youtube.com/watch?v=your-video-link) (20 min)
2. **Install Base PAI:** https://github.com/danielmiessler/Personal_AI_Infrastructure
3. **Extend to KAY's Features:** [START-HERE-FOR-NEW-BUILDERS.md](START-HERE-FOR-NEW-BUILDERS.md)
4. **Follow Extension Guide:** [KAY-EXTENSION-GUIDE.md](KAY-EXTENSION-GUIDE.md)

**🔑 Special Feature for New Builders:**

Your Claude Code can query Oscar's live KAY system while you build! This provides:
- RAG search through Oscar's documentation (in his database)
- Real examples from Oscar's running system
- Oscar's actual configuration details
- Access to Oscar's MEMORY learnings

See [KAY-QUERY-SETUP.md](KAY-QUERY-SETUP.md) for setup instructions.

### Path 2: Clone This Exact Setup

1. **[Read the System Overview](docs/00-overview/system-overview.md)** - Understand how it works
2. **[Check Prerequisites](docs/01-setup/prerequisites.md)** - Make sure you have what you need
3. **[Start Setup](docs/01-setup/vps-setup.md)** - Begin with VPS configuration

---

## Next Steps

Questions? Start with the [System Overview](docs/00-overview/system-overview.md) or jump to [Troubleshooting](docs/05-operations/troubleshooting.md).
