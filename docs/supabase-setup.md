# Supabase プロジェクトセットアップ手順

## 1. プロジェクト作成

1. https://supabase.com でアカウント作成/ログイン
2. "New Project" をクリック
3. 以下を設定:
   - Project name: `wake-or-pay-prod`
   - Organization: 任意
   - Database password: 強力なパスワード (保存必須)
   - Region: Asia Pacific (Tokyo) または closest
4. "Create new project" をクリック

## 2. 認証設定

Dashboard > Authentication > Settings で以下を設定:

```sql
-- Anonymous sign-ups を有効化
-- Email confirmations を無効化（匿名認証のため）
-- Secure email change を有効化
```

## 3. データベーススキーマ作成

SQL Editor で以下を実行:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- User profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Alarms table
CREATE TABLE alarms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wake_time TIME NOT NULL,
  penalty_amount INTEGER NOT NULL, -- in cents
  is_active BOOLEAN DEFAULT true NOT NULL,
  verification_method TEXT CHECK (verification_method IN ('face', 'shake', 'both')) NOT NULL,
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Monday, 7=Sunday
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Results table
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alarm_id UUID REFERENCES alarms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  verification_time TIMESTAMP WITH TIME ZONE,
  is_success BOOLEAN NOT NULL,
  verification_method TEXT,
  penalty_charged BOOLEAN DEFAULT false NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User KPI table
CREATE TABLE user_kpi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_alarms INTEGER DEFAULT 0 NOT NULL,
  successful_wakeups INTEGER DEFAULT 0 NOT NULL,
  total_penalties INTEGER DEFAULT 0 NOT NULL, -- in cents
  streak_days INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Experiments table (for A/B testing)
CREATE TABLE experiments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experiment_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_alarms_user_id ON alarms(user_id);
CREATE INDEX idx_alarms_active ON alarms(is_active) WHERE is_active = true;
CREATE INDEX idx_results_user_id ON results(user_id);
CREATE INDEX idx_results_alarm_id ON results(alarm_id);
CREATE INDEX idx_results_scheduled_time ON results(scheduled_time);
CREATE INDEX idx_user_kpi_user_date ON user_kpi(user_id, date);

-- Row Level Security Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own alarms" ON alarms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alarms" ON alarms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alarms" ON alarms FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own results" ON results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results" ON results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own kpi" ON user_kpi FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own kpi" ON user_kpi FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own kpi" ON user_kpi FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own experiments" ON experiments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own experiments" ON experiments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alarms_updated_at BEFORE UPDATE ON alarms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4. API キー取得

Project Settings > API で以下をコピー:
- Project URL
- `anon` `public` key  
- `service_role` `secret` key (サーバーサイドのみ)

## 5. 設定完了確認

SQL Editor で以下を実行してテーブル作成を確認:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

以下のテーブルが表示されればOK:
- alarms
- experiments  
- results
- user_kpi
- user_profiles