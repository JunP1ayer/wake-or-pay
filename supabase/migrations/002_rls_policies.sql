-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Alarms Policies
CREATE POLICY "Users can view own alarms" ON public.alarms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alarms" ON public.alarms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alarms" ON public.alarms
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alarms" ON public.alarms
    FOR DELETE USING (auth.uid() = user_id);

-- Results Policies
CREATE POLICY "Users can view own results" ON public.results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results" ON public.results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own results" ON public.results
    FOR UPDATE USING (auth.uid() = user_id);

-- User KPI Policies
CREATE POLICY "Users can view own KPI" ON public.user_kpi
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KPI" ON public.user_kpi
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own KPI" ON public.user_kpi
    FOR UPDATE USING (auth.uid() = user_id);

-- Experiments Policies
CREATE POLICY "Users can view own experiments" ON public.experiments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage experiments" ON public.experiments
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');