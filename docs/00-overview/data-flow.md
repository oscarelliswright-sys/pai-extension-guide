# PAI Data Flow Diagrams

**Purpose:** Visual representation of how data moves through the PAI system
**Audience:** Developers, system administrators
**Last Updated:** February 4, 2026

---

## Complete System Data Flow

```mermaid
graph TB
    subgraph "External Services"
        Notion[Notion API]
        GCal[Google Calendar]
        Gmail[Gmail API]
        TMDB[TMDB API]
        RAWG[RAWG API]
        OpenRouter[OpenRouter LLM]
        Modal[Modal/Dockling]
        Telegram[Telegram Bot API]
    end

    subgraph "VPS (Hostinger)"
        TBot[Telegram Bot Process]
        Nextcloud[Nextcloud Docker]
        Cron[Cron Jobs]
        MCP[MCP Servers]
    end

    subgraph "Railway"
        Sync[Sync Service]
        LibreChat[LibreChat + PAI API]
    end

    subgraph "Database (Neon PostgreSQL)"
        Tasks[(tasks)]
        Projects[(projects)]
        Files[(files)]
        Emails[(email_messages)]
        Calendar[(calendar_events)]
        Chunks[(file_chunks)]
    end

    %% Notion bidirectional sync
    Notion <-->|Every 10 min| Sync
    Sync <-->|SQL queries| Tasks
    Sync <-->|SQL queries| Projects
    Sync <-->|SQL queries| Calendar

    %% Google Calendar sync
    GCal <-->|OAuth| Sync
    Sync <-->|Events| Calendar

    %% Gmail processing
    Gmail -->|Fetch| Sync
    Sync -->|Classify| Emails
    Sync -->|Extract| Tasks

    %% Telegram bot interactions
    Telegram <-->|Messages| TBot
    TBot <-->|Queries| Tasks
    TBot <-->|Queries| Projects
    TBot <-->|RAG search| Chunks
    TBot -->|LLM calls| OpenRouter

    %% File processing
    Nextcloud -->|Watch| TBot
    TBot -->|Parse| Modal
    TBot -->|Store| Files
    Files -->|Chunk| Chunks

    %% LibreChat
    Telegram <-->|Updates| LibreChat
    LibreChat -->|MCP Tools| Tasks
    LibreChat -->|MCP Tools| Files
    LibreChat -->|LLM calls| OpenRouter

    %% Cron automations
    Cron -->|Sync| Tasks
    Cron -->|Index| Chunks
    Cron -->|Extract| MCP
```

---

## Task Creation Flow

### Via Telegram

```mermaid
sequenceDiagram
    participant User
    participant Telegram as Telegram Bot
    participant DB as PostgreSQL
    participant Railway as Railway Sync
    participant Notion

    User->>Telegram: "Add task: Call mum tomorrow"
    Telegram->>OpenRouter: Parse intent (LLM)
    OpenRouter-->>Telegram: Task details
    Telegram->>DB: INSERT INTO tasks
    Note over DB: sql_local_last_edited_at = NOW()
    Telegram-->>User: "Task created"

    Note over Railway: Wait for sync (up to 10 min)
    Railway->>DB: Query tasks with flag
    DB-->>Railway: New task found
    Railway->>Notion: Create page via API
    Notion-->>Railway: Page ID returned
    Railway->>DB: UPDATE task SET notion_page_id

    User->>Notion: Opens Notion app
    Note over Notion: Task visible in Notion
```

### Via Notion

```mermaid
sequenceDiagram
    participant User
    participant Notion
    participant Railway as Railway Sync
    participant DB as PostgreSQL
    participant Telegram as Telegram Bot

    User->>Notion: Creates task in database
    Note over Notion: notion_last_edited_at updated

    Note over Railway: Wait for sync (up to 10 min)
    Railway->>Notion: Fetch recent changes
    Notion-->>Railway: New task returned
    Railway->>DB: UPSERT INTO tasks
    Note over DB: Task now in PostgreSQL

    User->>Telegram: "What tasks do I have?"
    Telegram->>DB: Query tasks
    DB-->>Telegram: All tasks (including Notion one)
    Telegram-->>User: Task list (includes new task)
```

---

## File Processing Pipeline

```mermaid
flowchart TD
    Start([User drops file in Nextcloud Inbox]) --> Watch[Inbox Watcher detects file]
    Watch --> Notify[Telegram: New file detected]
    Notify --> Hint{User provides hint?}

    Hint -->|Yes| Direct[Direct placement]
    Hint -->|No| Extract[Extract text]

    Direct --> Move[Move to destination]

    Extract --> Type{File type?}
    Type -->|PDF/DOCX| Dockling[Dockling parse]
    Type -->|Image| OCR[OCR if needed]
    Type -->|Text| Read[Direct read]
    Type -->|Excel/CSV| Table[Table extract]

    Dockling --> Classify[LLM classification]
    OCR --> Classify
    Read --> Classify
    Table --> Classify

    Classify --> Confidence{Confidence?}
    Confidence -->|High| Move
    Confidence -->|Low| Ask[Ask user for confirmation]

    Ask --> Confirmed{Confirmed?}
    Confirmed -->|Yes| Move
    Confirmed -->|No| Inbox[Stay in Inbox]

    Move --> Scan[Nextcloud files:scan]
    Scan --> Chunk[Create chunks]
    Chunk --> Embed[Generate embeddings]
    Embed --> Index[Store in file_chunks]
    Index --> Done([Searchable via RAG])
```

---

## Email Classification Flow

```mermaid
flowchart TD
    Start([New email in Gmail]) --> Fetch[Railway sync fetches]
    Fetch --> Parse[Parse email content]
    Parse --> LLM[LLM classification]

    LLM --> Cat{Category?}

    Cat -->|Actionable| Action[Mark actionable]
    Cat -->|Informational| Info[Mark informational]
    Cat -->|Promotional| Promo[Mark promotional]
    Cat -->|Junk| Junk[Mark junk]

    Action --> Label1[Auto-label in Gmail]
    Info --> Label1
    Promo --> Label1
    Junk --> Label1

    Label1 --> Store[Store in database]
    Store --> Actionable{Is actionable?}

    Actionable -->|Yes| TelegramConfirm[Telegram: Create task?]
    Actionable -->|No| Done([Done])

    TelegramConfirm --> UserReply{User replies?}
    UserReply -->|Yes| CreateTask[Create task]
    UserReply -->|No| Pending[Pending in /tasks]

    CreateTask --> Done
    Pending --> Done
```

---

## Meeting Recording Pipeline

```mermaid
flowchart TD
    Start([Recording saved to Nextcloud]) --> Cron[Cron detects new recording]
    Cron --> Check{Already processed?}
    Check -->|Yes| Skip([Skip])
    Check -->|No| Extract[ffmpeg extract audio]

    Extract --> Transcribe[Groq Whisper transcribe]
    Transcribe --> Clean[LLM cleanup transcript]
    Clean --> Speakers{Speaker detection needed?}

    Speakers -->|Yes| Screenshots[Capture Teams UI screenshots]
    Speakers -->|No| SkipSpeakers[Skip speaker detection]

    Screenshots --> Vision[Vision model analyze]
    Vision --> SpeakerNames[Extract speaker names]
    SpeakerNames --> Combine[Combine with transcript]
    SkipSpeakers --> Combine

    Combine --> ExtractTasks[Claude Sonnet extract]
    ExtractTasks --> Structured{Structured output?}

    Structured -->|Tasks| Tasks[Create tasks]
    Structured -->|Decisions| Decisions[Log decisions]
    Structured -->|Topics| Topics[Identify topics]

    Tasks --> ChunkTranscript[Chunk transcript]
    Decisions --> ChunkTranscript
    Topics --> ChunkTranscript

    ChunkTranscript --> Embed[Generate embeddings]
    Embed --> Store[Store in database]
    Store --> Notify[Telegram notification]
    Notify --> Done([Searchable + tasks created])
```

---

## Bidirectional Sync (Notion ↔ PostgreSQL)

### Inbound: Notion → PostgreSQL

```mermaid
sequenceDiagram
    participant Notion
    participant Railway as Railway Sync
    participant DB as PostgreSQL

    loop Every 10 minutes
        Railway->>Notion: Query recent changes
        Note over Railway: Filter: notion_last_edited_at > last_sync
        Notion-->>Railway: Changed pages

        loop For each changed page
            Railway->>DB: Check if exists (by notion_page_id)

            alt Page exists
                Railway->>DB: Check timestamps
                alt Notion newer than PostgreSQL
                    Railway->>DB: UPDATE row
                    Note over DB: Keep notion_page_id
                else PostgreSQL newer
                    Note over Railway: Skip (outbound will handle)
                end
            else Page doesn't exist
                Railway->>DB: INSERT row
                Note over DB: Set notion_page_id
            end
        end

        Railway->>DB: Update last_sync_time
    end
```

### Outbound: PostgreSQL → Notion

```mermaid
sequenceDiagram
    participant DB as PostgreSQL
    participant Railway as Railway Sync
    participant Notion

    loop Every 10 minutes
        Railway->>DB: Query local changes
        Note over Railway: Filter: sql_local_last_edited_at > last_sync
        DB-->>Railway: Changed rows

        loop For each changed row
            alt Has notion_page_id
                Railway->>Notion: Update page via API
                Notion-->>Railway: Success
                Railway->>DB: Clear sql_local_last_edited_at flag
            else No notion_page_id (new row)
                Railway->>Notion: Create page via API
                Notion-->>Railway: New page_id
                Railway->>DB: UPDATE SET notion_page_id
                Railway->>DB: Clear sql_local_last_edited_at flag
            end
        end

        Railway->>DB: Update last_sync_time
    end
```

### Conflict Resolution

```mermaid
flowchart TD
    Start([Sync detects change]) --> BothChanged{Both changed?}

    BothChanged -->|No| Simple[Simple sync]
    BothChanged -->|Yes| Timestamps{Compare timestamps}

    Simple --> Done([Done])

    Timestamps --> Which{Which is newer?}
    Which -->|Notion newer| UseNotion[Notion wins]
    Which -->|PostgreSQL newer| UsePostgreSQL[PostgreSQL wins]
    Which -->|Same timestamp| UseNotion

    UseNotion --> UpdatePostgreSQL[Update PostgreSQL]
    UsePostgreSQL --> UpdateNotion[Update Notion]

    UpdatePostgreSQL --> Done
    UpdateNotion --> Done
```

**Note:** True conflicts (both edited at nearly same time) are rare because:
- User typically edits in ONE place at a time
- 10-minute sync window is short
- Last-write-wins strategy is acceptable for personal use

---

## RAG Search Flow

```mermaid
sequenceDiagram
    participant User
    participant Interface as Telegram/LibreChat
    participant Embedder as OpenAI Embeddings
    participant DB as PostgreSQL (pgvector)
    participant Files as Nextcloud

    User->>Interface: "Find documents about cost effectiveness"
    Interface->>Embedder: Generate query embedding
    Embedder-->>Interface: Query vector
    Interface->>DB: Vector similarity search
    Note over DB: SELECT * FROM file_chunks<br/>ORDER BY embedding <=> query_vector<br/>LIMIT 10
    DB-->>Interface: Top 10 matching chunks

    Interface->>Interface: Rank by relevance
    Interface->>Files: Retrieve full files (if needed)
    Files-->>Interface: File content
    Interface->>User: Results with context

    alt User wants full file
        User->>Interface: "Show me the full document"
        Interface->>Files: Retrieve file
        Files-->>Interface: Complete file
        Interface->>User: File sent to Telegram/displayed
    end
```

---

## Scheduled Notification Flow

```mermaid
flowchart TD
    Start([Scheduler runs every minute]) --> Time{What time?}

    Time -->|8:00 AM| Morning[Morning Summary]
    Time -->|9:00 AM| Overdue[Overdue Tasks Alert]
    Time -->|2:00 PM| Afternoon[High Priority Reminder]
    Time -->|Any time| Meetings[Meeting Reminders]
    Time -->|All day| Sync[Task Sync]

    Morning --> CheckMorningSent{Already sent today?}
    CheckMorningSent -->|Yes| Skip1([Skip])
    CheckMorningSent -->|No| QueryMorning[Query tasks, calendar, overdue]

    QueryMorning --> FormatMorning[Format message]
    FormatMorning --> SendMorning[Send to Telegram]
    SendMorning --> RecordMorning[Record notification sent]
    RecordMorning --> Done1([Done])

    Overdue --> CheckOverdueSent{Already sent today?}
    CheckOverdueSent -->|Yes| Skip2([Skip])
    CheckOverdueSent -->|No| QueryOverdue[Query overdue tasks]

    QueryOverdue --> HasOverdue{Has overdue?}
    HasOverdue -->|No| Skip3([Skip])
    HasOverdue -->|Yes| FormatOverdue[Format message]
    FormatOverdue --> SendOverdue[Send to Telegram]
    SendOverdue --> RecordOverdue[Record notification sent]
    RecordOverdue --> Done2([Done])

    Meetings --> CheckEvents[Query today's events]
    CheckEvents --> Loop{For each event}

    Loop --> MinutesUntil{Minutes until event?}
    MinutesUntil -->|14-16 min| Send15[Send 15-min reminder]
    MinutesUntil -->|4-6 min| Send5[Send 5-min reminder]
    MinutesUntil -->|Other| SkipEvent([Skip event])

    Send15 --> CheckSent15{Already sent?}
    CheckSent15 -->|Yes| SkipEvent
    CheckSent15 -->|No| SendMeeting15[Send to Telegram]
    SendMeeting15 --> RecordSent15[Record notification]
    RecordSent15 --> SkipEvent

    Send5 --> CheckSent5{Already sent?}
    CheckSent5 -->|Yes| SkipEvent
    CheckSent5 -->|No| SendMeeting5[Send to Telegram]
    SendMeeting5 --> RecordSent5[Record notification]
    RecordSent5 --> SkipEvent

    SkipEvent --> Done3([Done])

    Sync --> RunSync[Run tasks-sql-to-notion.ts]
    RunSync --> Done4([Done])
```

---

## MCP Tool Call Flow (LibreChat)

```mermaid
sequenceDiagram
    participant User
    participant LibreChat
    participant MCP as PAI API (MCP Server)
    participant DB as PostgreSQL
    participant Notion

    User->>LibreChat: "What tasks do I have today?"
    LibreChat->>MCP: Call query_tasks tool
    MCP->>DB: SELECT FROM tasks WHERE due_date = today
    DB-->>MCP: Task results
    MCP-->>LibreChat: Structured response
    LibreChat->>Claude: Generate natural response
    Claude-->>LibreChat: Formatted message
    LibreChat-->>User: "You have 3 tasks today:..."

    User->>LibreChat: "Mark the first one done"
    LibreChat->>MCP: Call update_task tool
    MCP->>DB: UPDATE tasks SET status='Done'
    Note over DB: sql_local_last_edited_at = NOW()
    DB-->>MCP: Success
    MCP-->>LibreChat: Task updated
    LibreChat-->>User: "Task marked complete"

    Note over MCP: Wait for sync (up to 10 min)
    Railway->>DB: Detect local change
    DB-->>Railway: Updated task
    Railway->>Notion: Update page
    Notion-->>Railway: Success
```

---

## Data Persistence Layers

```mermaid
graph TD
    subgraph "Layer 1: Source of Truth"
        DB[PostgreSQL Database<br/>47 tables, pgvector]
    end

    subgraph "Layer 2: User-Facing Storage"
        Notion[Notion Databases<br/>11 databases]
        Nextcloud[Nextcloud Files<br/>PARA organized]
        GCal[Google Calendar<br/>Events]
    end

    subgraph "Layer 3: Caches & Logs"
        BotLogs[Bot Logs<br/>Telegram conversations]
        SyncLogs[Sync History<br/>sync_run_history]
        AILogs[AI Call Log<br/>LLM usage]
    end

    DB -.Bidirectional sync.-> Notion
    DB -.Bidirectional sync.-> GCal
    DB -.Index.-> Nextcloud

    DB --> BotLogs
    DB --> SyncLogs
    DB --> AILogs

    style DB fill:#2d5,stroke:#333,stroke-width:4px
    style Notion fill:#ff9,stroke:#333,stroke-width:2px
    style Nextcloud fill:#9cf,stroke:#333,stroke-width:2px
    style GCal fill:#9f9,stroke:#333,stroke-width:2px
```

**Key Principles:**
1. **PostgreSQL is source of truth** - All interfaces read/write here first
2. **External services sync bidirectionally** - Changes flow both ways
3. **Sync is eventual** - Max 10-minute lag
4. **Conflicts resolved by timestamp** - Last write wins
5. **All data versioned** - Can trace changes via logs

---

## Related Documentation

- [System Overview](system-overview.md) - High-level architecture
- [Notion Sync](../02-capabilities/notion-sync.md) - Detailed sync mechanics
- [File Processing](../02-capabilities/file-processing.md) - File pipeline details
- [Email System](../02-capabilities/email-system.md) - Email processing flow

---

**Last Updated:** February 4, 2026
**Diagrams:** Mermaid format (render in compatible viewer)
