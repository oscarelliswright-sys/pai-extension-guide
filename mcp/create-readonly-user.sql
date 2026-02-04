-- Create Read-Only Database User for KAY Query MCP Tool
--
-- This creates a secure read-only user for trusted users (like family/friends)
-- to query Oscar's KAY system via MCP tools.
--
-- Usage:
--   1. Generate a secure password: openssl rand -base64 32
--   2. Replace YOUR_SECURE_PASSWORD_HERE below
--   3. Run this in Neon PostgreSQL console or via psql:
--      psql $DATABASE_URL -f create-readonly-user.sql

-- Create the read-only user
CREATE ROLE query_readonly WITH LOGIN PASSWORD 'YOUR_SECURE_PASSWORD_HERE';

-- Grant database connection
GRANT CONNECT ON DATABASE neondb TO query_readonly;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO query_readonly;

-- Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO query_readonly;

-- Grant SELECT on future tables (automatic)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO query_readonly;

-- Verify the user was created
\du query_readonly

-- Test query (should work)
-- SELECT COUNT(*) FROM tasks;

-- Test write (should fail with permission denied)
-- INSERT INTO tasks (name, status) VALUES ('test', 'To Do');

-- Connection string format for MCP tool:
-- postgresql://query_readonly:YOUR_PASSWORD@HOST:PORT/neondb?sslmode=require
--
-- Replace:
-- - YOUR_PASSWORD: The password you generated
-- - HOST:PORT: Your Neon host (e.g., ep-dry-forest-abv53mtg-pooler.eu-west-2.aws.neon.tech)
