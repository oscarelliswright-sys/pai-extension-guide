#!/usr/bin/env bun
/**
 * KAY Query MCP Tool - Direct Database Access
 *
 * For trusted users (like Oscar's dad) building their own PAI.
 * Provides read-only access to Oscar's live system for guidance.
 *
 * Tools:
 * 1. query_kay_system - 10 live queries (syncs, tasks, files, stats, etc.)
 * 2. get_kay_config - 5 config queries (cron, sync, integrations, etc.)
 * 3. get_memory_topics - List available MEMORY topics
 *
 * Setup for claude_desktop_config.json:
 * {
 *   "mcpServers": {
 *     "kay-query": {
 *       "command": "bun",
 *       "args": ["run", "/path/to/kay-query-direct.ts"],
 *       "env": {
 *         "DATABASE_URL": "postgresql://readonly_user:password@...neon.tech/neondb"
 *       }
 *     }
 *   }
 * }
 *
 * Note: No OpenAI API key needed - removed RAG search (dad has docs from GitHub)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import postgres from 'postgres';
import { readFile } from 'fs/promises';
import { glob } from 'glob';

const sql = postgres(process.env.DATABASE_URL!);

// Create MCP server
const server = new Server(
  {
    name: 'kay-query',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Note: search_kay_docs tool removed - dad has the docs from GitHub already!

/**
 * Tool 2: Query KAY's Live System State
 * Get actual data from KAY's running system
 */
async function querySystemState(entity: string, filters?: any) {
  const queries: Record<string, () => Promise<any>> = {
    'recent-syncs': async () => {
      const syncs = await sql`
        SELECT
          script_name,
          started_at,
          completed_at,
          status,
          records_processed,
          duration_ms,
          errors
        FROM sync_run_history
        ORDER BY started_at DESC
        LIMIT 20
      `;
      return {
        description: "KAY's recent sync runs (last 20)",
        data: syncs,
        note: "This is live data from KAY's actual system"
      };
    },

    'sync-health': async () => {
      const health = await sql`
        SELECT
          script_name,
          COUNT(*) as total_runs,
          COUNT(*) FILTER (WHERE status = 'success') as successful,
          COUNT(*) FILTER (WHERE status = 'error') as failed,
          AVG(duration_ms)::int as avg_duration_ms,
          MAX(started_at) as last_run
        FROM sync_run_history
        WHERE started_at > NOW() - INTERVAL '7 days'
        GROUP BY script_name
        ORDER BY last_run DESC
      `;
      return {
        description: "KAY's sync health (last 7 days)",
        data: health,
        metrics: {
          total_scripts: health.length,
          overall_success_rate: (
            health.reduce((sum, s) => sum + Number(s.successful), 0) /
            health.reduce((sum, s) => sum + Number(s.total_runs), 0) * 100
          ).toFixed(1) + '%'
        }
      };
    },

    'sample-task': async () => {
      const task = await sql`
        SELECT
          name,
          status,
          priority,
          due_at,
          notion_page_id,
          sql_local_last_edited_at,
          notion_last_edited_at,
          sql_updated_at
        FROM tasks
        WHERE deleted_at IS NULL
        ORDER BY sql_updated_at DESC
        LIMIT 1
      `;
      return {
        description: "A real task from KAY's database",
        data: task[0],
        note: "Shows actual field structure, sync timestamps, Notion page ID format"
      };
    },

    'tasks-summary': async () => {
      const summary = await sql`
        SELECT
          status,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
          COUNT(*) FILTER (WHERE due_date < NOW()) as overdue,
          COUNT(*) FILTER (WHERE notion_page_id IS NOT NULL) as synced_to_notion
        FROM tasks
        WHERE deleted_at IS NULL
        GROUP BY status
      `;
      return {
        description: "KAY's task statistics",
        data: summary,
        total: summary.reduce((sum, s) => sum + Number(s.count), 0)
      };
    },

    'files-summary': async () => {
      const summary = await sql`
        SELECT
          suggested_para_type,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE embedding IS NOT NULL) as embedded,
          AVG(classification_confidence)::numeric(3,2) as avg_confidence
        FROM files
        WHERE suggested_para_type IS NOT NULL
        GROUP BY suggested_para_type
        ORDER BY count DESC
      `;
      return {
        description: "KAY's file organization (PARA distribution)",
        data: summary,
        note: "Shows how KAY classifies files into Projects/Areas/Resources/Archive"
      };
    },

    'telegram-stats': async () => {
      const stats = await sql`
        SELECT
          operation_type,
          COUNT(*) as count
        FROM bot_logs
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY operation_type
        ORDER BY count DESC
        LIMIT 10
      `;
      return {
        description: "KAY's Telegram bot usage (last 7 days)",
        data: stats,
        note: "Shows which operations are most commonly used"
      };
    },

    'database-schema': async () => {
      const tables = await sql`
        SELECT
          table_name,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
          pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC
      `;
      return {
        description: "KAY's database schema",
        data: tables,
        total_tables: tables.length
      };
    },

    'notion-databases': async () => {
      const summary = await sql`
        SELECT
          'tasks' as database,
          COUNT(*) as total_records,
          COUNT(*) FILTER (WHERE notion_page_id IS NOT NULL) as synced,
          COUNT(*) FILTER (WHERE sql_local_last_edited_at IS NOT NULL) as pending_sync
        FROM tasks WHERE deleted_at IS NULL
        UNION ALL
        SELECT
          'projects' as database,
          COUNT(*) as total_records,
          COUNT(*) FILTER (WHERE notion_page_id IS NOT NULL) as synced,
          COUNT(*) FILTER (WHERE sql_local_last_edited_at IS NOT NULL) as pending_sync
        FROM projects WHERE deleted_at IS NULL
        UNION ALL
        SELECT
          'notes' as database,
          COUNT(*) as total_records,
          COUNT(*) FILTER (WHERE notion_page_id IS NOT NULL) as synced,
          COUNT(*) FILTER (WHERE sql_local_last_edited_at IS NOT NULL) as pending_sync
        FROM notes WHERE deleted_at IS NULL
      `;
      return {
        description: "KAY's Notion sync status",
        data: summary,
        note: "Shows sync coverage for main databases"
      };
    },

    'calendar-summary': async () => {
      const events = await sql`
        SELECT
          DATE(start_time) as date,
          COUNT(*) as events,
          string_agg(DISTINCT source, ', ') as sources
        FROM calendar_events
        WHERE start_time BETWEEN NOW() - INTERVAL '7 days' AND NOW() + INTERVAL '7 days'
        GROUP BY DATE(start_time)
        ORDER BY date
      `;
      return {
        description: "KAY's calendar (7 days back, 7 days forward)",
        data: events
      };
    },

    'llm-models': async () => {
      const models = await sql`
        SELECT
          provider,
          COUNT(*) as model_count,
          AVG(cost_per_1k_input)::numeric(10,5) as avg_input_cost,
          AVG(cost_per_1k_output)::numeric(10,5) as avg_output_cost
        FROM llm_models
        GROUP BY provider
        ORDER BY model_count DESC
      `;
      return {
        description: "LLM models in KAY's database (59 total)",
        data: models
      };
    }
  };

  const query = queries[entity];
  if (!query) {
    return {
      success: false,
      error: `Unknown entity: ${entity}`,
      available: Object.keys(queries)
    };
  }

  return {
    success: true,
    ...(await query())
  };
}

/**
 * Tool 3: Get KAY's Configuration
 * Show actual environment setup, cron schedules, etc.
 */
async function getConfiguration(component: string) {
  const configs: Record<string, any> = {
    'cron-schedule': {
      description: "KAY's cron automation schedule",
      vps_crons: [
        { schedule: "*/15 * * * *", script: "sync-to-github.sh", description: "Git auto-sync" },
        { schedule: "0 2 * * 1-6", script: "health-check.sh", description: "Health check (Mon-Sat)" },
        { schedule: "0 2 * * 0", script: "security-audit.sh", description: "Security audit (Sunday)" },
        { schedule: "0 3 * * *", script: "rag-reindex.sh", description: "RAG reindex (daily)" },
        { schedule: "0 4 * * *", script: "extract-missed-learnings.sh", description: "Extract learnings (daily)" },
        { schedule: "0 5 * * 0", script: "memory-maintenance.sh", description: "Memory maintenance (Sunday)" },
        { schedule: "*/15 8-19 * * 1-5", script: "meeting-check.sh", description: "Meeting check (weekdays)" }
      ],
      railway_crons: [
        { schedule: "*/10 * * * *", script: "cron-sync.ts", description: "Full sync cycle" }
      ],
      telegram_scheduler: [
        { time: "8:00 AM", type: "morning_summary" },
        { time: "9:00 AM", type: "overdue_tasks" },
        { time: "2:00 PM", type: "high_priority_reminder" },
        { interval: "every minute", type: "meeting_reminders" }
      ]
    },

    'sync-configuration': {
      description: "KAY's sync configuration",
      notion_sync: {
        interval: "10 minutes",
        databases: 11,
        conflict_resolution: "last-write-wins",
        retry_on_failure: true
      },
      google_calendar: {
        sync_direction: "bidirectional",
        interval: "10 minutes"
      },
      git_auto_sync: {
        interval: "15 minutes",
        branch: "main",
        auto_push: true
      }
    },

    'telegram-bot': {
      description: "KAY's Telegram bot configuration",
      deployment: "VPS",
      features: [
        "Natural language task management",
        "Voice transcription",
        "Image analysis",
        "File processing",
        "Scheduled notifications",
        "Real-time inbox watching"
      ],
      commands: ["/help", "/clear", "/tasks", "/changes", "/costs", "/feedback", "/analyze", "/logs"]
    },

    'file-processing': {
      description: "KAY's file processing configuration",
      pipeline_stages: [
        "1. Scan inbox",
        "2. Extract text (Dockling)",
        "3. Classify (LLM)",
        "4. Move to PARA folder",
        "5. Chunk",
        "6. Generate embeddings"
      ],
      para_structure: ["Projects", "Areas", "Resources", "Archive"],
      classification_threshold: 0.7,
      embedding_model: "text-embedding-3-small"
    },

    'integrations': {
      description: "KAY's external integrations",
      services: [
        { name: "Notion", purpose: "11 databases, bidirectional sync" },
        { name: "Google Calendar", purpose: "Event sync" },
        { name: "Gmail", purpose: "Email classification" },
        { name: "Telegram", purpose: "Bot interface" },
        { name: "OpenRouter", purpose: "LLM access (59 models)" },
        { name: "Modal", purpose: "Dockling for file parsing" },
        { name: "Neon", purpose: "PostgreSQL database" },
        { name: "Railway", purpose: "Sync service + LibreChat" }
      ]
    }
  };

  const config = configs[component];
  if (!config) {
    return {
      success: false,
      error: `Unknown component: ${component}`,
      available: Object.keys(configs)
    };
  }

  return {
    success: true,
    ...config
  };
}

/**
 * Tool 3: Get KAY's MEMORY Topics
 * Show what learning topics are available
 */
async function getMemoryTopics() {
  return {
    description: "KAY's MEMORY structure",
    learnings_topics: [
      "Environment",
      "Infrastructure",
      "Security",
      "TypeScript",
      "PAI"
    ],
    note: "These are Oscar's accumulated learnings from previous sessions",
    suggestion: "The raw markdown files are at: ~/reference/pai-blueprints/pai-extension-guide/ - your Claude Code can read them directly"
  };
}

// OpenAI embeddings not needed - removed search_kay_docs tool

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_kay_system',
        description: 'Query KAY\'s live system state. Get actual data from Oscar\'s running PAI - sync runs, tasks, files, Telegram usage, database stats, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            entity: {
              type: 'string',
              enum: [
                'recent-syncs',
                'sync-health',
                'sample-task',
                'tasks-summary',
                'files-summary',
                'telegram-stats',
                'database-schema',
                'notion-databases',
                'calendar-summary',
                'llm-models'
              ],
              description: 'What aspect of KAY\'s system to query'
            }
          },
          required: ['entity']
        }
      },
      {
        name: 'get_kay_config',
        description: 'Get KAY\'s actual configuration - cron schedules, sync settings, integrations, file processing pipeline, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            component: {
              type: 'string',
              enum: [
                'cron-schedule',
                'sync-configuration',
                'telegram-bot',
                'file-processing',
                'integrations'
              ],
              description: 'Which configuration to retrieve'
            }
          },
          required: ['component']
        }
      },
      {
        name: 'get_memory_topics',
        description: 'Get list of MEMORY topics available. The actual learnings are in the GitHub repo markdown files that your Claude Code can read directly.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'query_kay_system':
        result = await querySystemState(args.entity as string);
        break;

      case 'get_kay_config':
        result = await getConfiguration(args.component as string);
        break;

      case 'get_memory_topics':
        result = await getMemoryTopics();
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('KAY Query MCP Server (Direct Access) running');
}

main().catch(console.error);
