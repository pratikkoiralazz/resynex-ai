-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Research Sessions
CREATE TABLE IF NOT EXISTS research_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) DEFAULT 'anonymous_user',
    topic TEXT NOT NULL,
    instructions TEXT,
    depth VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (depth IN ('quick', 'standard', 'deep')),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'planning', 'searching', 'processing', 'analyzing', 'comparing', 'generating', 'completed', 'failed')),
    progress_message TEXT DEFAULT 'Research session initialized.',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Research Queries
CREATE TABLE IF NOT EXISTS research_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sources
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    domain VARCHAR(255),
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source_type VARCHAR(50) DEFAULT 'web_page',
    content TEXT,
    summary TEXT,
    credibility_score NUMERIC(3, 2) DEFAULT 0.50
);

-- 4. Research Sources (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS research_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    relevance_score NUMERIC(3, 2) DEFAULT 0.00,
    selected BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(research_session_id, source_id)
);

-- 5. Source Claims
CREATE TABLE IF NOT EXISTS source_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    claim TEXT NOT NULL,
    evidence TEXT,
    confidence NUMERIC(3, 2) DEFAULT 0.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Source Comparisons
CREATE TABLE IF NOT EXISTS source_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_session_id UUID NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    source_a_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    source_b_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('agrees', 'contradicts', 'complements', 'unrelated')),
    explanation TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    research_session_id UUID UNIQUE NOT NULL REFERENCES research_sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    executive_summary TEXT NOT NULL,
    report_content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Citations
CREATE TABLE IF NOT EXISTS citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    claim_reference TEXT NOT NULL,
    citation_number INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_research_sessions_status ON research_sessions(status);
CREATE INDEX IF NOT EXISTS idx_research_sources_session ON research_sources(research_session_id);
CREATE INDEX IF NOT EXISTS idx_citations_report ON citations(report_id);