# Wake-or-Pay 完全実装 - セットアップガイド

## 🎯 実装完了機能

### ✅ 1. 自動Stripe課金システム
- 起床失敗時に100円を自動課金
- `/api/scheduler/check-wakeups` - cron job用自動チェック機能
- `/api/verify-wakeup` - 起床成功時の記録機能

### ✅ 2. リアル顔認証システム
- MediaPipe Face Detection による実際の顔検出
- まばたき検出による生体認証
- フォールバック機能（MediaPipe失敗時）

### ✅ 3. Supabase連携強化
- `wake_verification` テーブル追加
- 起床記録の自動保存
- 連続記録追跡

### ✅ 4. 報酬システム & SNS拡散機能
- 4種類のバッジシステム
- 祝福演出（紙吹雪アニメーション）
- Twitter, LINE, Facebook 自動シェア
- バッジ画像生成・ダウンロード機能

### ✅ 5. 自動スケジューラー
- 朝の起床チェック自動化
- 課金処理の自動実行

## 🛠 セットアップ手順

### 1. 依存関係のインストール

```bash
cd wake-or-pay
npm install
```

新規追加された依存関係:
- `@mediapipe/face_detection`
- `@mediapipe/camera_utils`

### 2. 環境変数の設定

`.env.local` に以下を追加:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Scheduler（cron job用）
SCHEDULER_SECRET_KEY=your-secure-random-key

# App URL（シェア用）
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Supabaseマイグレーション実行

```sql
-- wake_verification テーブルが追加されています
-- supabase/migrations/001_initial_schema.sql を実行
```

### 4. cron job設定

自動課金チェック用のcron jobを設定:

```bash
# 毎朝8:30に実行（例）
30 8 * * * curl -X POST "https://your-domain.com/api/scheduler/check-wakeups" \
  -H "Authorization: Bearer your-scheduler-secret-key"
```

## 🎮 使用方法

### 起床チャレンジの流れ

1. **アラーム設定** → ユーザーが起床時刻を設定
2. **朝の認証** → 顔認証で起床を証明
3. **自動判定** → 30分以内に認証されなければ自動課金
4. **報酬表示** → 成功時は祝福演出とバッジ獲得
5. **SNS拡散** → バッジをSNSでシェア可能

### 新しいコンポーネント

- `<FaceVerification />` - リアル顔認証
- `<RewardBadge />` - バッジ表示・シェア
- `<CelebrationModal />` - 成功時祝福演出

## 🔧 カスタマイズ可能項目

### 課金設定
- `lib/stripe.ts` の `PENALTY_AMOUNT` で金額変更
- 認証期限は現在30分（scheduler内で変更可能）

### バッジ設定
- `RewardBadge.tsx` で新しいバッジ追加可能
- 達成条件のカスタマイズ

### 顔認証精度
- `FaceVerification.tsx` で信頼度閾値調整
- まばたき回数の変更（現在2回）

## 🚀 デプロイ確認事項

- [ ] Stripe webhook エンドポイント設定
- [ ] Supabase RLS ポリシー確認
- [ ] cron job 動作テスト
- [ ] 顔認証用MediaPipe CDN 接続確認
- [ ] 環境変数すべて設定済み

## 📋 テスト方法

```bash
# テスト実行
npm run test

# 型チェック
npm run typecheck

# Lint
npm run lint
```

---

**🎉 実装完了！**

帰宅後、すべての機能が自動で動作しているはずです。
問題があれば各ファイルの実装を確認してください。