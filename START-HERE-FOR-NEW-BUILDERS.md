# Start Here: Building Your Personal AI Infrastructure

**For:** New builders who want to create their own PAI system
**Time to read:** 15 minutes
**Purpose:** Understand what PAI is and decide where to host it

---

## 🎯 Before You Begin

**Watch this first (20 minutes):**
[Daniel Miessler - Building Your Personal AI Infrastructure](https://www.youtube.com/watch?v=your-video-link)

This video explains the WHY and WHAT of Personal AI Infrastructure better than any document can.

---

## 🔑 IMPORTANT: You Have Access to Oscar's Live System

**Your Claude Code has MCP tools to query Oscar's actual running KAY system.**

You can ask me to:
- Search Oscar's documentation in his database (RAG search)
- Query Oscar's live system state (sync runs, tasks, files, etc.)
- Get Oscar's actual configuration (cron schedules, integrations)
- Search Oscar's MEMORY learnings

**Use these tools liberally throughout the build process when:**
- Documentation is unclear or ambiguous
- You need to see real examples from Oscar's system
- You want to verify how something actually works
- You're stuck and need clarification

**Example queries you can use:**
```
Use kay-query tools to:
- Search for "Notion sync conflict resolution" in KAY's docs
- Show me a real task from KAY's database with all sync fields
- What's KAY's cron schedule?
- Get KAY's file processing pipeline configuration
```

**Setup instructions:** See `KAY-QUERY-SETUP.md` for complete setup (your user should have already configured this).

---

## 📋 What is Personal AI Infrastructure (PAI)?

Personal AI Infrastructure is a system that acts as your **second brain** - it remembers everything, automates routine tasks, and provides instant access to your information through natural conversation.

### What PAI Does

**Information Management:**
- Stores all your tasks, projects, notes, files, emails in one place
- Bidirectional sync with tools you already use (Notion, Google Calendar)
- Semantic search across everything (find documents by meaning, not just keywords)

**Automation:**
- Scheduled notifications (morning summary, task reminders, meeting alerts)
- Automatic email classification and task extraction
- File organization using PARA method (Projects, Areas, Resources, Archive)
- Meeting transcription and action item extraction

**Interfaces:**
- **Telegram bot:** Chat with your system from anywhere (phone, desktop)
- **Web UI:** LibreChat with 43+ specialized tools
- **Claude Code integration:** AI assistant that knows your entire system

**Intelligence:**
- RAG (Retrieval-Augmented Generation) for document search
- LLM-powered classification and summarization
- Context-aware responses based on your history
- Learns from your patterns and preferences

### What Makes PAI Different from Regular AI Tools?

| Feature | ChatGPT/Claude Web | Your PAI |
|---------|-------------------|----------|
| **Memory** | Forgets after session | Remembers forever |
| **Your Data** | Can't access your files | Full access to everything |
| **Automation** | No automation | Runs 24/7 with cron jobs |
| **Customization** | Fixed features | Build exactly what you need |
| **Privacy** | Data sent to provider | Your data stays on your infrastructure |
| **Integration** | Limited | Syncs with all your tools |

---

## 🏗️ System Architecture Overview

### Four Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 4: INTERFACES                                      │
│ - Telegram Bot (mobile/desktop chat)                    │
│ - LibreChat Web UI (43 MCP tools)                       │
│ - Claude Code (AI assistant with full context)          │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│ Layer 3: PROCESSING                                      │
│ - File classification & organization                     │
│ - Email classification & task extraction                 │
│ - Meeting transcription & speaker detection              │
│ - RAG search (semantic + keyword hybrid)                 │
│ - LLM orchestration (model selection, cost tracking)     │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│ Layer 2: INTEGRATION                                     │
│ - Notion (bidirectional sync, 11 databases)             │
│ - Google Calendar & Gmail (OAuth, read/write)           │
│ - OpenRouter (LLM API access, 59+ models)               │
│ - Modal (Dockling for document parsing)                 │
│ - Telegram (bot API, notifications)                     │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│ Layer 1: STORAGE                                         │
│ - PostgreSQL (47 tables, pgvector for RAG)              │
│ - File storage (Nextcloud or similar, PARA organized)   │
│ - Git repository (code, configs, documentation)         │
└─────────────────────────────────────────────────────────┘
```

### Core Components

**Database (PostgreSQL):**
- Source of truth for all data
- 47 tables covering tasks, projects, notes, files, emails, calendar, people, media, games
- pgvector extension for semantic search
- Hosted on Neon (cloud) or self-hosted

**File Storage:**
- PARA-organized (Projects, Areas, Resources, Archive)
- Automatic classification and embedding
- Nextcloud for sync across devices
- Or any file storage you prefer

**Sync Engine:**
- Bidirectional sync with Notion (every 10 minutes)
- Google Calendar sync
- Email fetching and classification
- Conflict resolution (last-write-wins)

**Telegram Bot:**
- Natural language interface
- Voice transcription, image analysis
- File processing, task management
- Scheduled notifications
- Real-time inbox watching

**Automation (Cron Jobs):**
- Git auto-sync (every 15 min)
- Health checks (daily)
- RAG reindexing (daily)
- Meeting detection (every 15 min during business hours)
- Memory maintenance (weekly)

---

## 🎯 What This System (KAY) Can Do

### Daily Workflows

**Morning (8:00 AM):**
- Receive summary: Today's tasks, calendar, overdue items
- Weather, meeting prep suggestions

**Throughout Day:**
- "Add task: Call mum tomorrow" → Created in database, synced to Notion
- "What tasks do I have?" → Instant list with context
- "Find documents about cost-effectiveness" → Semantic search across all files
- "Schedule meeting Friday 2pm: Project review" → Added to calendar

**File Drop:**
- Drop PDF in Inbox folder
- Telegram: "New file detected: proposal.pdf"
- Reply: "Revenue Growth project"
- File automatically moved to Projects/Revenue Growth/Deliverables/
- Indexed, searchable within 60 seconds

**Email Arrives:**
- Fetched from Gmail (every 10 min)
- Classified (actionable/informational/promotional/junk)
- Auto-labeled in Gmail
- If actionable: Telegram asks "Create task from this email?"

**Meeting Ends:**
- Save recording to Recordings/Meetings/
- Within 15 min: Transcribed, speaker detection, tasks extracted
- Telegram notification with summary

**Evening:**
- "What did I accomplish today?" → Summary of completed tasks
- "Review tomorrow's calendar" → Preview with prep suggestions

### Advanced Features

**RAG Search:**
- "What did we discuss about pricing in the Q3 meeting?" → Finds exact transcript chunk
- "Show me all files mentioning machine learning" → Semantic search, not just keyword

**Context Awareness:**
- Bot remembers your conversation history
- Knows your active projects, recurring tasks
- Suggests relevant files when discussing topics

**Multi-Interface:**
- Start conversation on phone (Telegram)
- Continue on desktop (LibreChat web UI)
- Or use Claude Code with full system context

**Cost Tracking:**
- Every LLM call logged
- Monthly cost breakdown by operation type
- Model recommendations based on task

---

## 🏠 CRITICAL DECISION: Where Should Your PAI Live?

You need to decide where to host your PAI. This is the **most important decision** because it affects cost, complexity, and capabilities.

### Option 1: Cloud VPS (Recommended for Most)

**What it is:** Rent a virtual server from Hostinger, DigitalOcean, Linode, etc.

**Pros:**
- ✅ Always on (24/7 automation works)
- ✅ Accessible from anywhere
- ✅ No hardware maintenance
- ✅ Easy to upgrade resources
- ✅ Telegram bot works perfectly (needs public IP)
- ✅ Fast, reliable internet

**Cons:**
- ❌ Monthly cost ($5-20/month for VPS)
- ❌ Requires basic Linux knowledge
- ❌ Data stored with provider (but encrypted)

**Best for:**
- People who want 24/7 automation
- Those without spare hardware
- Anyone who travels or works remotely

**Monthly Cost Estimate:**
- VPS (4GB RAM, 2 CPU): $12/month
- Neon PostgreSQL (free tier): $0
- Railway (sync service): $5/month (free tier often works)
- OpenRouter LLM calls: $5-15/month
- **Total: $15-30/month**

---

### Option 2: Local Machine (Laptop/Desktop)

**What it is:** Run PAI on your personal computer (Mac, Windows, Linux)

**Pros:**
- ✅ No monthly VPS cost
- ✅ Full control of hardware
- ✅ Data never leaves your machine
- ✅ Fast local access

**Cons:**
- ❌ Only works when computer is on
- ❌ No 24/7 automation (unless always-on)
- ❌ Telegram bot harder to configure (needs port forwarding or ngrok)
- ❌ Limited when traveling
- ❌ Need to handle backups manually

**Best for:**
- Privacy-conscious users
- Those with always-on desktop at home
- People who want to minimize costs
- Developers comfortable with local setup

**Monthly Cost Estimate:**
- VPS: $0 (using own hardware)
- Neon PostgreSQL: $0 (or local PostgreSQL)
- Railway: $0 (run sync locally)
- OpenRouter LLM calls: $5-15/month
- **Total: $5-15/month**

**Challenges:**
- Telegram bot needs public IP (use ngrok tunnel: $8/month)
- Power/internet outages stop automation
- Must manage backups

---

### Option 3: Home Server (Old Laptop/NUC/Raspberry Pi)

**What it is:** Repurpose old hardware as a dedicated server

**Pros:**
- ✅ No monthly VPS cost
- ✅ 24/7 operation (if always on)
- ✅ Full privacy (data at home)
- ✅ Good learning experience
- ✅ Can upgrade hardware easily

**Cons:**
- ❌ Initial hardware setup time
- ❌ Electricity cost (~$2-5/month)
- ❌ Need to handle networking (port forwarding, dynamic DNS)
- ❌ Reliability depends on home internet
- ❌ Louder/more heat than VPS

**Best for:**
- People with spare hardware
- Those with technical interest in home servers
- Privacy-focused individuals
- Homelab enthusiasts

**Monthly Cost Estimate:**
- Hardware: $0 (repurposed)
- Electricity: $3/month (old laptop, 24/7)
- Dynamic DNS: $0 (free tier) or $5/month
- OpenRouter LLM calls: $5-15/month
- **Total: $8-20/month**

**Requirements:**
- Old laptop (4GB+ RAM, 50GB+ storage)
- Home internet with ability to port forward (or use ngrok)
- Basic networking knowledge

---

### Option 4: Company Infrastructure (If You Own the Company)

**What it is:** Run PAI on your company's existing cloud/server infrastructure

**Pros:**
- ✅ Leverage existing resources (may be "free")
- ✅ Professional-grade reliability
- ✅ IT support available (if you have team)
- ✅ Can use company email API directly
- ✅ Scale with company growth

**Cons:**
- ❌ Mixing personal and business data (consider carefully)
- ❌ Company policies may restrict
- ❌ More complex compliance requirements

**Best for:**
- Company owners who want to integrate personal and business workflows
- Those with existing cloud infrastructure (AWS, Azure, GCP)
- People comfortable with business/personal data coexistence

---

## 📊 Decision Matrix

| Factor | Cloud VPS | Local Machine | Home Server | Company Infrastructure |
|--------|-----------|---------------|-------------|----------------------|
| **Cost** | $15-30/mo | $5-15/mo | $8-20/mo | Variable |
| **Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Setup Difficulty** | Medium | Easy | Hard | Medium-Hard |
| **24/7 Operation** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Privacy** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Accessibility** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Maintenance** | Low | Medium | High | Low-Medium |

---

## ✅ Your Decision

**I choose:** _________________ (Cloud VPS / Local Machine / Home Server / Company Infrastructure)

**Reasoning:**
_____________________________________________________________________
_____________________________________________________________________

**Next steps:**
- If **Cloud VPS**: Proceed to next section "Setting Up Cloud VPS with Claude"
- If **Local Machine**: Skip to "Local Setup Guide" (create if needed)
- If **Home Server**: Skip to "Home Server Setup Guide" (create if needed)
- If **Company Infrastructure**: Consult with IT, then follow similar to Cloud VPS

---

## 🤖 Setting Up Your Infrastructure with Claude's Help

Once you've decided where to host, you'll use **regular Claude** (claude.ai) to help you set up the infrastructure.

### Prompt Template for Claude

**Copy this prompt and give it to Claude along with this document + `vps-setup.md`:**

```
I'm building a Personal AI Infrastructure (PAI) system. I've decided to host it on: [YOUR CHOICE]

I'm giving you two documents:
1. START-HERE-FOR-NEW-BUILDERS.md - Overview of what PAI is
2. vps-setup.md - Technical setup guide for infrastructure

Your purpose right now is EXCLUSIVELY to help me:
1. Understand the infrastructure requirements
2. Set up the hosting environment ([VPS/Local/Server/Company])
3. Install required software (Docker, PostgreSQL, Bun, etc.)
4. Configure security (firewall, SSH keys, user permissions)
5. Verify everything is working correctly

Please read both documents carefully, then:
- Ask me any clarifying questions about my specific setup
- Guide me step-by-step through the infrastructure setup
- Verify each step before moving to the next
- Help me troubleshoot any issues

I'm comfortable with: [technical/semi-technical/non-technical]
I have experience with: [Linux/Docker/databases/none/etc.]

Let's begin with step 1.
```

**After infrastructure is set up and Claude Code is installed**, you'll move to the next phase.

---

## 🎯 What Happens Next?

**Phase 1: Infrastructure Setup** ← You are here
- Decide where to host
- Use regular Claude + vps-setup.md
- Get a "home" for your PAI with Claude Code installed

**Phase 2: Install Base PAI (Daniel Miessler's Official Bundles)**
- Go to: https://github.com/danielmiessler/Personal_AI_Infrastructure/tree/main/Bundles/Official
- Follow the README using Claude Code
- Install required packs + any additional packs you want
- This creates the foundation

**Phase 3: Get KAY Documentation**

**Tell your Claude Code to get the documentation:**

```
Please clone the KAY documentation to a separate reference directory:

1. Create directory: ~/reference/pai-blueprints/
2. Clone: https://github.com/oscarelliswright-sys/pai-extension-guide.git
3. This should be SEPARATE from my PAI implementation in ~/.claude/

After cloning, confirm the documentation is at:
~/reference/pai-blueprints/pai-extension-guide/
```

**Your Claude Code will:**
```bash
mkdir -p ~/reference/pai-blueprints
cd ~/reference/pai-blueprints
git clone https://github.com/oscarelliswright-sys/pai-extension-guide.git
# ✅ Documentation cloned to ~/reference/pai-blueprints/pai-extension-guide/
```

**Important: Keep documentation separate from your implementation**
- Your actual PAI code lives in: `~/.claude/`
- KAY documentation lives in: `~/reference/pai-blueprints/pai-extension-guide/`
- This prevents confusion between "the blueprint" and "your system"

**Then give Claude Code the extension prompt:**

Open `~/reference/pai-blueprints/pai-extension-guide/KAY-EXTENSION-GUIDE.md` and copy the prompt from the top of that file. Give it to your Claude Code.

**Claude Code will then:**
- Read the full KAY documentation from `~/reference/pai-blueprints/`
- Systematically implement features in YOUR `~/.claude/` directory
- Present you with decision points before implementing each feature
- Keep the blueprint and your implementation completely separate

**To update documentation later, tell Claude Code:**
```
Please update the KAY documentation:
cd ~/reference/pai-blueprints/pai-extension-guide && git pull
```

**Phase 4: Customize and Use**
- Add your own features
- Adjust to your workflows
- Query KAY for help when needed

---

## 🔗 Resources

**Video:**
- [Daniel Miessler - Building Your Personal AI Infrastructure](https://www.youtube.com/watch?v=your-link)

**Base PAI (Daniel Miessler):**
- GitHub: https://github.com/danielmiessler/Personal_AI_Infrastructure
- Official Bundles: https://github.com/danielmiessler/Personal_AI_Infrastructure/tree/main/Bundles/Official

**KAY Documentation (Full System):**
- GitHub: https://github.com/oscarelliswright-sys/pai-extension-guide
- Extension Guide: `KAY-EXTENSION-GUIDE.md`

**Community:**
- Daniel Miessler's Discord: [Link if available]
- PAI Builders Forum: [Link if available]

---

## ❓ Common Questions

**Q: Do I need to use Notion?**
A: No. Notion sync is optional. You can use database + Telegram bot only.

**Q: Can I use my work email instead of Gmail?**
A: Yes! If you own your company, use your work email API directly. Skip the Gmail setup.

**Q: What if I don't want file processing?**
A: Skip it. Install only the features you need.

**Q: How much does it cost?**
A: $5-30/month depending on hosting choice. Most cost is LLM API calls.

**Q: Is this secure?**
A: Yes, if set up correctly. VPS uses SSH keys, firewall, encrypted connections. Data in database is yours.

**Q: Can I migrate later?**
A: Yes. Move from local → VPS or VPS → home server anytime. Database and files are portable.

**Q: What if I get stuck?**
A: Your PAI can query KAY (Oscar's system) for help. See Phase 4 setup.

---

## 🚀 Ready?

**Your next steps:**

1. ✅ You've read this document
2. ✅ You've made your hosting decision
3. ⬜ Open claude.ai (regular Claude)
4. ⬜ Upload this document + `vps-setup.md`
5. ⬜ Copy the prompt template above
6. ⬜ Let Claude guide you through infrastructure setup

**Once infrastructure is ready:**
- Install Claude Code on your new infrastructure
- Proceed to Phase 2: Daniel Miessler's base PAI installation
- Clone KAY documentation to `~/reference/pai-blueprints/` (see Phase 3 above)
- Then Phase 3: Use KAY-EXTENSION-GUIDE.md to extend to KAY's features

---

**Good luck building your PAI!** 🎉

*Last updated: February 4, 2026*
