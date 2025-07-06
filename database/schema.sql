-- Create database
CREATE DATABASE IF NOT EXISTS llm_diagnostic;

-- Connect to the database
\c llm_diagnostic;

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL,
  title TEXT,
  description TEXT,
  html TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
  structure_semantics INTEGER CHECK (structure_semantics >= 0 AND structure_semantics <= 25),
  relevance_intent INTEGER CHECK (relevance_intent >= 0 AND relevance_intent <= 25),
  token_efficiency INTEGER CHECK (token_efficiency >= 0 AND token_efficiency <= 20),
  link_graph INTEGER CHECK (link_graph >= 0 AND link_graph <= 15),
  llm_output_likelihood INTEGER CHECK (llm_output_likelihood >= 0 AND llm_output_likelihood <= 15),
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
  summary TEXT,
  detailed_analysis JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create overlays table
CREATE TABLE IF NOT EXISTS overlays (
  id SERIAL PRIMARY KEY,
  page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
  highlights JSONB, -- [{start, end, severity, suggestion, reason, element_selector}]
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create domains table for overall domain scores
CREATE TABLE IF NOT EXISTS domains (
  id SERIAL PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  pages_analyzed INTEGER DEFAULT 0,
  top_improvements JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_domain ON pages(domain);
CREATE INDEX IF NOT EXISTS idx_pages_url ON pages(url);
CREATE INDEX IF NOT EXISTS idx_scores_page_id ON scores(page_id);
CREATE INDEX IF NOT EXISTS idx_overlays_page_id ON overlays(page_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 