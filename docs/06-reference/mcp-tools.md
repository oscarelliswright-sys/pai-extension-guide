# MCP Tools Reference

**Purpose:** Complete reference for all PAI MCP tools
**Available In:** LibreChat, Claude Code (local MCP), Telegram (via API)
**Total Tools:** 43
**Last Updated:** February 4, 2026

---

## Tool Categories

- [Task Management](#task-management-8-tools) (8 tools)
- [Calendar](#calendar-3-tools) (3 tools)
- [File & Email Search](#file--email-search-3-tools) (3 tools)
- [Document Generation](#document-generation-4-tools) (4 tools)
- [Context Queries](#context-queries-4-tools) (4 tools)
- [People Management](#people-management-3-tools) (3 tools)
- [Projects](#projects-3-tools) (3 tools)
- [Goals](#goals-3-tools) (3 tools)
- [Notes](#notes-2-tools) (2 tools)
- [Work Projects](#work-projects-4-tools) (4 tools)
- [Media & Games](#media--games-6-tools) (6 tools)

---

## Task Management (8 tools)

### get_tasks

**Purpose:** Query tasks with filters

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | string | No | todo, in_progress, done, cancelled |
| `priority` | string | No | low, medium, high, critical |
| `due_date` | string | No | today, tomorrow, this_week, or YYYY-MM-DD |
| `project_id` | string | No | UUID of project |

**Example:**
```json
{
  "status": "todo",
  "priority": "high",
  "due_date": "this_week"
}
```

**Returns:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Review deliverable",
      "status": "todo",
      "priority": "high",
      "due_date": "2026-02-07",
      "project": "CTS010 denovoSkin",
      "notes": "Must review before client submission"
    }
  ]
}
```

---

### query_tasks

**Purpose:** Advanced task search with multiple filters

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | No | Search in title/notes |
| `status` | string[] | No | Array of statuses |
| `priority` | string[] | No | Array of priorities |
| `project_id` | string | No | Filter by project |
| `tags` | string[] | No | Filter by tags |
| `limit` | number | No | Max results (default: 50) |

**Example:**
```json
{
  "search": "deliverable",
  "status": ["todo", "in_progress"],
  "priority": ["high", "critical"],
  "limit": 10
}
```

---

### query_pending_tasks

**Purpose:** List pending email task confirmations

**Parameters:** None

**Returns:**
```json
{
  "tasks": [
    {
      "number": 1,
      "id": "uuid",
      "name": "Review deliverable draft",
      "from_email": "ben@example.com",
      "deadline": "2026-02-07",
      "context": "From email about Q4 deliverable"
    }
  ]
}
```

---

### create_task

**Purpose:** Create new task

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Task name |
| `notes` | string | No | Task description |
| `due_date` | string | No | YYYY-MM-DD or natural language |
| `priority` | string | No | low, medium, high, critical |
| `project_id` | string | No | Link to project UUID |
| `status` | string | No | Default: todo |

**Example:**
```json
{
  "title": "Review deliverable draft",
  "notes": "Must review before Friday submission",
  "due_date": "2026-02-07",
  "priority": "high",
  "project_id": "project-uuid"
}
```

---

### update_task

**Purpose:** Update existing task

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Task UUID |
| `title` | string | No | New title |
| `notes` | string | No | New notes |
| `status` | string | No | New status |
| `priority` | string | No | New priority |
| `due_date` | string | No | New due date |

**Example:**
```json
{
  "id": "task-uuid",
  "status": "done"
}
```

---

### delete_task

**Purpose:** Delete task

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Task UUID |

---

### archive_task

**Purpose:** Archive completed task

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Task UUID |

---

### get_project_tasks

**Purpose:** Get all tasks for specific project

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `project_code` | string | Yes | Project code (e.g., CTS010) |

---

## Calendar (3 tools)

### get_calendar

**Purpose:** Query calendar events

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `start_date` | string | No | YYYY-MM-DD (default: today) |
| `end_date` | string | No | YYYY-MM-DD (default: +7 days) |
| `calendar_type` | string | No | personal, work_readonly |

**Example:**
```json
{
  "start_date": "2026-02-04",
  "end_date": "2026-02-10"
}
```

**Returns:**
```json
{
  "events": [
    {
      "id": "uuid",
      "summary": "Team Meeting",
      "start": "2026-02-04T10:00:00Z",
      "end": "2026-02-04T11:00:00Z",
      "location": "Teams",
      "calendar_type": "personal"
    }
  ]
}
```

---

### create_calendar_event

**Purpose:** Create new calendar event

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `summary` | string | Yes | Event title |
| `start_time` | string | Yes | ISO 8601 datetime |
| `end_time` | string | Yes | ISO 8601 datetime |
| `description` | string | No | Event details |
| `location` | string | No | Where |

**Example:**
```json
{
  "summary": "Meeting with Sarah",
  "start_time": "2026-02-07T13:00:00Z",
  "end_time": "2026-02-07T14:00:00Z",
  "description": "Discuss Q4 deliverable"
}
```

---

### update_calendar_event

**Purpose:** Update existing event

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Event UUID |
| `summary` | string | No | New title |
| `start_time` | string | No | New start |
| `end_time` | string | No | New end |

---

## File & Email Search (3 tools)

### search_files

**Purpose:** Semantic search across files

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `limit` | number | No | Max results (default: 5) |
| `folder` | string | No | Filter by folder path |
| `fileType` | string | No | pdf, docx, xlsx, etc. |
| `daysAgo` | number | No | Only recent files |
| `minSimilarity` | number | No | Min score 0-1 (default: 0) |
| `rerank` | boolean | No | LLM rerank (default: auto) |

**Example:**
```json
{
  "query": "cost-effectiveness analysis",
  "limit": 10,
  "folder": "CTS010",
  "fileType": "pdf",
  "rerank": true
}
```

**Returns:**
```json
{
  "results": [
    {
      "filename": "CTS010_Deliverable.pdf",
      "similarity": 0.94,
      "heading_path": "Methods > Economic Evaluation",
      "content": "The cost-effectiveness analysis...",
      "file_path": "C:\\Users\\oscar\\Nextcloud\\...",
      "level": "chunk"
    }
  ]
}
```

---

### search_emails

**Purpose:** Semantic search across emails

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `limit` | number | No | Max results (default: 5) |
| `minSimilarity` | number | No | Min score (default: 0.3) |

**Example:**
```json
{
  "query": "meeting with Ben about deliverables",
  "limit": 10
}
```

**Returns:**
```json
{
  "results": [
    {
      "subject": "DenovoSkin Q4 Review",
      "sender_name": "Ben Wilding",
      "sender_email": "ben@example.com",
      "received_at": "2026-02-04T10:30:00Z",
      "similarity": 0.89,
      "extraction_summary": "Meeting request..."
    }
  ]
}
```

---

### get_file_content

**Purpose:** Retrieve full file content

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filename` | string | Yes | Filename (partial match OK) |
| `section` | string | No | Specific section heading |
| `maxLength` | number | No | Max chars (default: 50000) |

**Example:**
```json
{
  "filename": "CTS010_Deliverable.pdf",
  "section": "Cost-Effectiveness Analysis",
  "maxLength": 10000
}
```

**Returns:**
```json
{
  "filename": "CTS010_Deliverable_Q4.pdf",
  "content": "[Full extracted markdown content]",
  "length": 8543,
  "section_found": true
}
```

---

## Document Generation (4 tools)

### create_document

**Purpose:** Generate Word/PowerPoint/Excel/Markdown documents

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | Yes | docx, pptx, xlsx, md |
| `title` | string | Yes | Document title |
| `content` | object | Yes | Document content (format varies) |
| `filename` | string | No | Output filename |

**Example (Word):**
```json
{
  "type": "docx",
  "title": "Project Status Report",
  "content": {
    "sections": [
      {
        "heading": "Executive Summary",
        "paragraphs": ["The project is on track..."]
      },
      {
        "heading": "Progress This Week",
        "paragraphs": ["Completed deliverable draft..."]
      }
    ]
  },
  "filename": "CTS010_Status_Report.docx"
}
```

**Returns:**
```json
{
  "success": true,
  "path": "/tmp/pai-documents/CTS010_Status_Report.docx",
  "message": "Document created successfully"
}
```

---

### list_temp_documents

**Purpose:** List documents awaiting review

**Parameters:** None

**Returns:**
```json
{
  "documents": [
    {
      "filename": "CTS010_Status_Report.docx",
      "created_at": "2026-02-04T15:30:00Z",
      "size": 45120,
      "path": "/tmp/pai-documents/..."
    }
  ]
}
```

---

### finalize_document

**Purpose:** Move document to final location

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filename` | string | Yes | Document to finalize |
| `destination` | string | No | Target folder (auto-detect if omitted) |

---

### delete_temp_document

**Purpose:** Delete temporary document

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filename` | string | Yes | Document to delete |

---

## Context Queries (4 tools)

### get_system_context

**Purpose:** Load PAI system context files

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `path` | string | No | Specific context path |

**Example:**
```json
{
  "path": "context/pai/CLAUDE.md"
}
```

---

### get_project_context

**Purpose:** Load project context file

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `project` | string | Yes | Project code (CTS010) or name |

**Example:**
```json
{
  "project": "CTS010"
}
```

**Returns:**
```json
{
  "project": "CTS010 denovoSkin",
  "content": "[Full context file markdown]",
  "path": "context/projects/CTS010 denovoSkin.md"
}
```

---

### get_area_context

**Purpose:** Load area context file

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `area` | string | Yes | Area name (Health, Finance, etc.) |

---

### search_learnings

**Purpose:** Search MEMORY/learnings/

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search query |
| `topic` | string | No | Topic folder (TypeScript, Infrastructure, etc.) |

**Example:**
```json
{
  "query": "database connection",
  "topic": "Infrastructure"
}
```

---

## People Management (3 tools)

### query_people

**Purpose:** Search contacts

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | No | Search name/email |
| `relationship` | string | No | family, friend, colleague, client |

---

### create_person

**Purpose:** Add new contact

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Full name |
| `email` | string | No | Email address |
| `relationship` | string | No | Relationship type |
| `notes` | string | No | Additional info |

---

### update_person

**Purpose:** Update contact details

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Person UUID |
| `name` | string | No | New name |
| `email` | string | No | New email |
| `notes` | string | No | New notes |

---

## Projects (3 tools)

### query_projects

**Purpose:** List projects

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | string | No | active, on_hold, completed |
| `type` | string | No | work, personal, learning |

---

### create_project

**Purpose:** Create new project

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Project name |
| `description` | string | No | Overview |
| `type` | string | No | work, personal, learning |
| `status` | string | No | Default: active |

---

### update_project

**Purpose:** Update project

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Project UUID |
| `name` | string | No | New name |
| `status` | string | No | New status |
| `description` | string | No | New description |

---

## Goals (3 tools)

### query_goals

**Purpose:** List goals

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `category` | string | No | health, career, learning, etc. |
| `status` | string | No | active, achieved, abandoned |

---

### create_goal

**Purpose:** Create new goal

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Goal description |
| `category` | string | No | Goal category |
| `target_date` | string | No | Target completion |
| `progress` | number | No | Current progress 0-100 |

---

### update_goal_progress

**Purpose:** Update goal progress

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Goal UUID |
| `progress` | number | Yes | New progress 0-100 |

---

## Notes (2 tools)

### query_notes

**Purpose:** Search notes

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | No | Search title/content |
| `type` | string | No | meeting, idea, learning, reference |
| `project_id` | string | No | Filter by project |

---

### create_note

**Purpose:** Create new note

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Note title |
| `content` | string | Yes | Note body (markdown) |
| `type` | string | No | Note type |
| `project_id` | string | No | Link to project |

---

## Work Projects (4 tools)

### query_work_projects

**Purpose:** List work projects

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | string | No | active, archived |

---

### create_work_project

**Purpose:** Add work project

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `project_code` | string | Yes | CTS010, SOBI036, etc. |
| `project_name` | string | Yes | Full name |
| `client_name` | string | No | Client organization |

---

### update_work_project

**Purpose:** Update work project

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Project UUID |
| `status` | string | No | active, archived |
| `project_name` | string | No | New name |

---

### archive_work_project

**Purpose:** Archive work project

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Project UUID |

---

## Media & Games (6 tools)

### query_media

**Purpose:** Search watchlist

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | No | Search title |
| `type` | string | No | movie, tv, anime |
| `status` | string | No | watching, completed, plan_to_watch |

---

### add_media

**Purpose:** Add to watchlist

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | Yes | Movie/show name |
| `type` | string | Yes | movie, tv, anime |
| `tmdb_id` | number | No | TMDB API ID |

---

### update_media_watched

**Purpose:** Mark as watched/update status

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Media UUID |
| `status` | string | No | New status |
| `rating` | number | No | Rating 1-10 |

---

### query_games

**Purpose:** Search games backlog

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | No | Search name |
| `platform` | string | No | PC, PS5, Switch, etc. |
| `status` | string | No | playing, completed, backlog |

---

### add_game

**Purpose:** Add to backlog

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | Yes | Game title |
| `platform` | string | Yes | Platform |
| `rawg_id` | number | No | RAWG API ID |

---

### update_game_status

**Purpose:** Update game progress

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string | Yes | Game UUID |
| `status` | string | No | New status |
| `rating` | number | No | Rating 1-10 |

---

## Related Documentation

- [LibreChat](../02-capabilities/librechat.md) - Using tools in web UI
- [Telegram Bot](../02-capabilities/telegram-bot.md) - Tools via mobile
- [Database Schema](../04-development/database-schema.md) - Data structure
- [API Documentation](../04-development/api-documentation.md) - REST API endpoints
