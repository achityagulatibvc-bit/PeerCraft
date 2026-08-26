-- ==============================================================================
-- PeerCraft HuskSync PostgreSQL Database Schema (Supabase / Managed Postgres)
-- ==============================================================================
-- Used for real-time lockstep player state synchronization across dimension-sharded nodes
-- (Overworld on Primary Node <-> Nether & The End on Secondary Node)
-- ==============================================================================

-- 1. HuskSync Users Table
CREATE TABLE IF NOT EXISTS husksync_users (
    uuid UUID PRIMARY KEY,
    username VARCHAR(16) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_husksync_username ON husksync_users(username);

-- 2. HuskSync User Data Snapshots Table
CREATE TABLE IF NOT EXISTS husksync_user_data (
    id BIGSERIAL PRIMARY KEY,
    player_uuid UUID NOT NULL REFERENCES husksync_users(uuid) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    save_cause VARCHAR(32) NOT NULL,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    inventory_data BYTEA,
    ender_chest_data BYTEA,
    potion_effects_data BYTEA,
    advancements_data BYTEA,
    statistics_data BYTEA,
    persistent_data BYTEA,
    health DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    max_health DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    hunger INT NOT NULL DEFAULT 20,
    saturation REAL NOT NULL DEFAULT 5.0,
    experience_level INT NOT NULL DEFAULT 0,
    experience_progress REAL NOT NULL DEFAULT 0.0,
    game_mode VARCHAR(16) NOT NULL DEFAULT 'SURVIVAL',
    is_flying BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_husksync_data_player_time 
ON husksync_user_data(player_uuid, timestamp DESC);

-- 3. HuskSync Current Active Snapshot Table (O(1) lookup during dimension switch)
CREATE TABLE IF NOT EXISTS husksync_current_snapshots (
    player_uuid UUID PRIMARY KEY REFERENCES husksync_users(uuid) ON DELETE CASCADE,
    data_id BIGINT NOT NULL REFERENCES husksync_user_data(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cluster Dimension Savepoints Audit Log
CREATE TABLE IF NOT EXISTS peercraft_dimension_checkpoints (
    id BIGSERIAL PRIMARY KEY,
    dimension VARCHAR(32) NOT NULL, -- 'overworld' | 'nether_end'
    version BIGINT NOT NULL,
    manifest_sha256 VARCHAR(64) NOT NULL,
    chunk_count INT NOT NULL,
    node_id VARCHAR(64) NOT NULL,
    r2_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dimension_checkpoints_dim_time
ON peercraft_dimension_checkpoints(dimension, created_at DESC);
