-- ==============================================================================
-- PeerCraft Cluster: Supabase PostgreSQL Schema for HuskSync State Synchronization
-- ==============================================================================

-- 1. HuskSync Registered Users Table
CREATE TABLE IF NOT EXISTS husksync_users (
    uuid UUID PRIMARY KEY,
    username VARCHAR(16) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Data Snapshots (Inventories, Ender Chest, Health, XP, Advancements, Statistics)
CREATE TABLE IF NOT EXISTS husksync_user_data (
    id BIGSERIAL PRIMARY KEY,
    player_uuid UUID REFERENCES husksync_users(uuid) ON DELETE CASCADE,
    version_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    save_cause VARCHAR(64) NOT NULL, -- 'PORTAL_TRANSFER', 'LOGOUT', 'SERVER_SWITCH', 'AUTO_SAVE'
    pinned BOOLEAN DEFAULT FALSE,
    inventory_data JSONB NOT NULL,
    ender_chest_data JSONB NOT NULL,
    health DOUBLE PRECISION DEFAULT 20.0,
    max_health DOUBLE PRECISION DEFAULT 20.0,
    hunger INT DEFAULT 20,
    saturation DOUBLE PRECISION DEFAULT 5.0,
    experience_level INT DEFAULT 0,
    experience_progress DOUBLE PRECISION DEFAULT 0.0,
    potion_effects JSONB DEFAULT '[]'::JSONB,
    advancements_data JSONB DEFAULT '{}'::JSONB,
    statistics_data JSONB DEFAULT '{}'::JSONB,
    location_dimension VARCHAR(32) DEFAULT 'minecraft:overworld',
    location_x DOUBLE PRECISION DEFAULT 0.0,
    location_y DOUBLE PRECISION DEFAULT 64.0,
    location_z DOUBLE PRECISION DEFAULT 0.0,
    location_yaw REAL DEFAULT 0.0,
    location_pitch REAL DEFAULT 0.0
);

-- 3. Dimension Transfer Logs
CREATE TABLE IF NOT EXISTS dimension_transfers (
    id BIGSERIAL PRIMARY KEY,
    player_uuid UUID REFERENCES husksync_users(uuid) ON DELETE CASCADE,
    from_dimension VARCHAR(32) NOT NULL,
    to_dimension VARCHAR(32) NOT NULL,
    from_node_id VARCHAR(64) NOT NULL,
    to_node_id VARCHAR(64) NOT NULL,
    sync_latency_ms INT NOT NULL,
    transferred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for low-latency queries
CREATE INDEX IF NOT EXISTS idx_husksync_data_uuid_time ON husksync_user_data(player_uuid, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_uuid ON dimension_transfers(player_uuid, transferred_at DESC);
