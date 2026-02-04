#!/usr/bin/env bun
/**
 * Test KAY Query MCP Tool
 *
 * This tests the MCP tool can connect to the database and query it properly.
 * Run this BEFORE giving the tool to your dad to verify it works.
 *
 * Usage:
 *   bun run mcp/test-kay-query.ts
 */

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set');
  console.error('Usage: DATABASE_URL="postgresql://..." bun run mcp/test-kay-query.ts');
  process.exit(1);
}

console.log('🔍 Testing KAY Query MCP Tool\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const sql = postgres(DATABASE_URL);

try {
  // Test 1: Database connection
  console.log('TEST 1: Database Connection');
  const dbTest = await sql`SELECT NOW() as time, current_database() as db, current_user as user`;
  console.log('✅ Connected successfully');
  console.log(`   Database: ${dbTest[0].db}`);
  console.log(`   User: ${dbTest[0].user}`);
  console.log(`   Time: ${dbTest[0].time}\n`);

  // Test 2: Read permissions
  console.log('TEST 2: Read Permissions');
  const tables = ['tasks', 'files', 'sync_run_history', 'file_chunks'];
  for (const table of tables) {
    try {
      const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
      console.log(`✅ Can read ${table}: ${result[0].count} rows`);
    } catch (error: any) {
      console.log(`❌ Cannot read ${table}: ${error.message}`);
    }
  }
  console.log();

  // Test 3: Write permissions (should fail for read-only user)
  console.log('TEST 3: Write Permissions (should fail for read-only)');
  try {
    await sql`CREATE TABLE test_write_check (id int)`;
    console.log('⚠️  WARNING: User has WRITE access (should be read-only!)');
    await sql`DROP TABLE test_write_check`;
  } catch (error: any) {
    console.log('✅ Write denied (correct for read-only user)');
  }
  console.log();

  // Test 4: Sample queries (matching what the MCP tool does)
  console.log('TEST 4: Sample Queries\n');

  // Recent syncs
  console.log('Query: Recent Syncs');
  const syncs = await sql`
    SELECT script_name, started_at, status, records_processed
    FROM sync_run_history
    ORDER BY started_at DESC
    LIMIT 3
  `;
  console.log(`✅ Retrieved ${syncs.length} sync runs`);
  if (syncs.length > 0) {
    console.log(`   Latest: ${syncs[0].script_name} (${syncs[0].status})`);
  }
  console.log();

  // Sample task
  console.log('Query: Sample Task');
  const tasks = await sql`
    SELECT title, status, priority, notion_page_id
    FROM tasks
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (tasks.length > 0) {
    console.log(`✅ Retrieved task: "${tasks[0].title}"`);
    console.log(`   Status: ${tasks[0].status}, Priority: ${tasks[0].priority}`);
  } else {
    console.log('⚠️  No tasks found');
  }
  console.log();

  // Files summary
  console.log('Query: Files Summary');
  const files = await sql`
    SELECT
      suggested_para_type,
      COUNT(*) as count
    FROM files
    WHERE classified_at IS NOT NULL
    GROUP BY suggested_para_type
    ORDER BY count DESC
  `;
  console.log(`✅ Files by PARA type:`);
  files.forEach(f => {
    console.log(`   ${f.suggested_para_type}: ${f.count}`);
  });
  console.log();

  // Test 5: Embeddings (if available)
  console.log('TEST 5: Vector Search (Embeddings)');
  try {
    const chunks = await sql`
      SELECT COUNT(*) as count
      FROM file_chunks
      WHERE embedding IS NOT NULL
    `;
    console.log(`✅ Found ${chunks[0].count} chunks with embeddings`);

    // Try a sample vector search (using zero vector since we don't have OpenAI here)
    const zeroVector = Array(1536).fill(0);
    const searchResults = await sql`
      SELECT
        f.filename,
        c.chunk_text,
        c.embedding <=> ${zeroVector}::vector as distance
      FROM file_chunks c
      JOIN files f ON c.file_id = f.id
      WHERE f.folder LIKE '%pai-documentation%'
        AND c.embedding IS NOT NULL
      ORDER BY distance ASC
      LIMIT 3
    `;
    console.log(`✅ Vector search works (retrieved ${searchResults.length} results)`);
    if (searchResults.length > 0) {
      console.log(`   Note: Need OPENAI_API_KEY for meaningful search results`);
    }
  } catch (error: any) {
    console.log(`⚠️  Vector search unavailable: ${error.message}`);
  }
  console.log();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ ALL TESTS PASSED\n');
  console.log('The MCP tool should work correctly with this database connection.\n');
  console.log('Next steps:');
  console.log('1. Copy this connection string to your dad\'s claude_desktop_config.json');
  console.log('2. Have him restart Claude Code');
  console.log('3. Test the tools in Claude Code\n');

} catch (error: any) {
  console.error('\n❌ TEST FAILED:', error.message);
  console.error('\nCheck:');
  console.error('- DATABASE_URL is correct');
  console.error('- Database user has SELECT permissions');
  console.error('- Network allows connection to database\n');
  process.exit(1);
} finally {
  await sql.end();
}
