-- MindCanvas Database Schema - Migration 001
-- PostgreSQL 16 + pgvector

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enum Types
CREATE TYPE idea_status AS ENUM ('captured','exploring','planned','in_progress','completed','archived');
CREATE TYPE idea_priority AS ENUM ('low','medium','high');
CREATE TYPE project_status AS ENUM ('idea','planning','active','on_hold','completed','archived');
CREATE TYPE project_priority AS ENUM ('low','medium','high');
CREATE TYPE task_status AS ENUM ('todo','in_progress','completed','cancelled');
CREATE TYPE task_priority AS ENUM ('low','medium','high','urgent');
CREATE TYPE transaction_type AS ENUM ('income','expense','transfer');
CREATE TYPE transaction_category AS ENUM ('food','travel','shopping','bills','education','entertainment','health','subscriptions','investment','salary','freelance','gift','other');
CREATE TYPE wellness_type AS ENUM ('meditation','exercise','sleep','walking','yoga','other');
CREATE TYPE learning_status AS ENUM ('not_started','in_progress','completed','paused','archived');
CREATE TYPE media_type AS ENUM ('image','audio','document');
CREATE TYPE ai_action_status AS ENUM ('pending','confirmed','rejected','expired');

-- 1. Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    country TEXT,
    profession TEXT,
    job_title TEXT,
    organization TEXT,
    bio TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_profiles_email ON profiles(email);

-- 2. User Preferences
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    currency TEXT DEFAULT 'INR',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    time_format TEXT DEFAULT '12h',
    week_start TEXT DEFAULT 'monday',
    theme TEXT DEFAULT 'dark',
    daily_journal_reminder BOOLEAN DEFAULT TRUE,
    daily_motivation_enabled BOOLEAN DEFAULT TRUE,
    ai_enabled BOOLEAN DEFAULT TRUE,
    notification_email BOOLEAN DEFAULT TRUE,
    notification_push BOOLEAN DEFAULT FALSE,
    goals JSONB DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);
CREATE INDEX idx_tags_user ON tags(user_id);

-- 4. Journal Entries
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT,
    content_html TEXT,
    mood TEXT,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    weather JSONB,
    location TEXT,
    is_draft BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    word_count INTEGER DEFAULT 0,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_date ON journal_entries(user_id, entry_date DESC);
CREATE INDEX idx_journal_mood ON journal_entries(user_id, mood);

-- 5. Journal Tags (M:M)
CREATE TABLE journal_tags (
    journal_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (journal_id, tag_id)
);

-- 6. Journal Media
CREATE TABLE journal_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    media_type media_type NOT NULL DEFAULT 'image',
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_journal_media_journal ON journal_media(journal_id);

-- 7. Ideas
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status idea_status DEFAULT 'captured',
    priority idea_priority DEFAULT 'medium',
    journal_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ideas_user ON ideas(user_id);
CREATE INDEX idx_ideas_status ON ideas(user_id, status);

-- 8. Idea Tags (M:M)
CREATE TABLE idea_tags (
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (idea_id, tag_id)
);

-- 9. Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT,
    status project_status DEFAULT 'idea',
    priority project_priority DEFAULT 'medium',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    target_date DATE,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(user_id, status);

-- 10. Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority task_priority DEFAULT 'medium',
    status task_status DEFAULT 'todo',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    google_event_id TEXT,
    completed_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_due ON tasks(user_id, due_date);
CREATE INDEX idx_tasks_project ON tasks(project_id);

-- 11. Task Tags (M:M)
CREATE TABLE task_tags (
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- 12. Financial Transactions
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    journal_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    type transaction_type NOT NULL DEFAULT 'expense',
    category transaction_category DEFAULT 'other',
    description TEXT,
    payment_method TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_finance_user ON financial_transactions(user_id);
CREATE INDEX idx_finance_date ON financial_transactions(user_id, transaction_date DESC);
CREATE INDEX idx_finance_type ON financial_transactions(user_id, type);

-- 13. Learning Items
CREATE TABLE learning_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status learning_status DEFAULT 'not_started',
    target_date DATE,
    resource_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_learning_items_user ON learning_items(user_id);

-- 14. Learning Sessions
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    learning_item_id UUID REFERENCES learning_items(id) ON DELETE SET NULL,
    topic TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    notes TEXT,
    session_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_learning_sessions_user ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_date ON learning_sessions(user_id, session_date DESC);

-- 15. Wellness Activities
CREATE TABLE wellness_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type wellness_type NOT NULL,
    activity_name TEXT,
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    intensity TEXT,
    notes TEXT,
    journal_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_wellness_user ON wellness_activities(user_id);
CREATE INDEX idx_wellness_date ON wellness_activities(user_id, activity_date DESC);

-- 16. Calendar Accounts
CREATE TABLE calendar_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    provider TEXT DEFAULT 'google',
    email TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_calendar_accounts_user ON calendar_accounts(user_id);

-- 17. Personal Events
CREATE TABLE personal_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    person_name TEXT,
    relationship TEXT,
    event_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE,
    reminder_days_before INTEGER DEFAULT 1,
    notes TEXT,
    google_event_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_personal_events_user ON personal_events(user_id);

-- 18. AI Conversations & Messages
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conv ON ai_messages(conversation_id);

-- 19. AI Actions
CREATE TABLE ai_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    action_payload JSONB NOT NULL,
    status ai_action_status DEFAULT 'pending',
    confidence NUMERIC(3,2),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ai_actions_user ON ai_actions(user_id);

-- 20. AI Embeddings (pgvector)
CREATE TABLE ai_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ai_embeddings_user ON ai_embeddings(user_id);
CREATE INDEX idx_ai_embeddings_source ON ai_embeddings(source_type, source_id);

-- 21. Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_prefs_updated BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_journal_updated BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_ideas_updated BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_finance_updated BEFORE UPDATE ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_learning_items_updated BEFORE UPDATE ON learning_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_calendar_updated BEFORE UPDATE ON calendar_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_personal_events_updated BEFORE UPDATE ON personal_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_ai_conv_updated BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
