-- Supabase PostgreSQL Schema for AI Resume Analyzer (Phase 2 Ready)

-- 1. Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_name TEXT,
    file_name TEXT NOT NULL,
    storage_path TEXT,
    raw_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create resume_analyses table
CREATE TABLE IF NOT EXISTS public.resume_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    job_role_id TEXT NOT NULL,
    match_score INTEGER NOT NULL,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    extracted_skills JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    suggestions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS) setup
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads/inserts for hackathon MVP if needed
CREATE POLICY "Allow public read on resumes" ON public.resumes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on resumes" ON public.resumes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on resume_analyses" ON public.resume_analyses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on resume_analyses" ON public.resume_analyses FOR INSERT WITH CHECK (true);
