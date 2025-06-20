-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alarms table
CREATE TABLE public.alarms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    wake_time TIME NOT NULL,
    penalty_amount INTEGER NOT NULL, -- in cents
    is_active BOOLEAN DEFAULT true,
    verification_method TEXT CHECK (verification_method IN ('face', 'shake', 'both')) DEFAULT 'face',
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Results table
CREATE TABLE public.results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alarm_id UUID REFERENCES public.alarms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    verification_time TIMESTAMP WITH TIME ZONE,
    is_success BOOLEAN DEFAULT FALSE,
    verification_method TEXT,
    penalty_charged BOOLEAN DEFAULT FALSE,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User KPI table
CREATE TABLE public.user_kpi (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    total_alarms INTEGER DEFAULT 0,
    successful_wakeups INTEGER DEFAULT 0,
    total_penalties INTEGER DEFAULT 0, -- in cents
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Experiments table for A/B testing
CREATE TABLE public.experiments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    experiment_name TEXT NOT NULL,
    variant TEXT NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_alarms_user_id ON public.alarms(user_id);
CREATE INDEX idx_alarms_wake_time ON public.alarms(wake_time);
CREATE INDEX idx_results_user_id ON public.results(user_id);
CREATE INDEX idx_results_scheduled_time ON public.results(scheduled_time);
CREATE INDEX idx_user_kpi_user_date ON public.user_kpi(user_id, date);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alarms_updated_at BEFORE UPDATE ON public.alarms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();