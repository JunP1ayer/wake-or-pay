# wake-or-pay

## 🎯 プロダクト概要

100円固定没収アラームアプリ - シンプル単一画面設計による早起き習慣化サービス

### 主要機能
- **100円固定ペナルティ**: 起床失敗時の自動課金システム
- **顔認証による起床証明**: カメラを使った本人確認
- **SNS シェア機能**: LINE & X(Twitter) への成果共有
- **シンプル単一画面**: 30秒で完了するオンボーディング

## 🛠 技術スタック

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (認証・データベース・Edge Functions)
- **決済**: Stripe (事前払い・失敗時自動徴収)
- **デプロイ**: Vercel
- **パッケージ管理**: pnpm

## 🚀 セットアップ手順

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/your-username/wake-or-pay.git
   cd wake-or-pay
   ```

2. **依存関係のインストール**
   ```bash
   pnpm install
   ```

3. **環境変数の設定**
   ```bash
   cp .env.example .env.local
   # 必要な環境変数を設定
   ```

4. **Vercel連携**
   ```bash
   vercel link
   ```

5. **開発サーバー起動**
   ```bash
   pnpm dev
   ```

## 🚫 絶対禁止事項 (R-01〜R-05)

以下のルールに違反する変更は **即座に中断** してください：

- **R-01**: テスト・型エラー解消のための条件緩和 禁止
- **R-02**: `it.skip` / `describe.skip` / 不適切 mock 禁止  
- **R-03**: 出力・レスポンスのハードコード 禁止
- **R-04**: エラーメッセージの無視・隠蔽 禁止
- **R-05**: TODO / FIXME / HACK を残した一時パッチ 禁止

**違反検出時の対応**: `FAIL: R-XX <理由>` で即座に報告し、作業を停止する

## ✅ 必須ワークフロー

### 開発フローの4段階

1. **`/explore`** - 現状リポジトリ把握（read-only）
2. **`/plan`** - 設計・テスト戦略・実装計画の策定
3. **`/code`** - 実装・テスト作成
4. **`/commit`** - コミット・プッシュ

### TDD 方針

- **テストファースト**: 新機能は先にテスト作成
- **フレームワーク**: Vitest + @testing-library/react
- **型安全性**: TypeScript strict mode 必須
- **品質保証**: R-01〜R-05 違反時は即座に中断

## 🔧 CI/Git Hooks

### Pre-commit フック (.husky/pre-commit)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 型チェック
pnpm typecheck
if [ $? -ne 0 ]; then
  echo "FAIL: R-01 Type errors detected"
  exit 1
fi

# リント
pnpm lint
if [ $? -ne 0 ]; then
  echo "FAIL: R-04 Linting errors detected"
  exit 1
fi

# テスト実行
pnpm test
if [ $? -ne 0 ]; then
  echo "FAIL: R-01 Test failures detected"
  exit 1
fi

# 禁止パターンの検出
if grep -r "it\.skip\|describe\.skip" __tests__ tests; then
  echo "FAIL: R-02 Skipped tests detected"
  exit 1
fi

if grep -r "TODO\|FIXME\|HACK" src app; then
  echo "FAIL: R-05 Temporary patches detected"
  exit 1
fi

echo "✅ All checks passed"
```

### Vercel 連携要件

- **自動デプロイ**: main ブランチへの push 時
- **プレビュー**: PR 作成時の自動プレビュー環境
- **失敗時の対応**: ビルド・テスト失敗時はデプロイ阻止

## 🤝 貢献ガイドライン

### 質問・疑問点の報告

質問は必ず以下の形式で開始してください：

```
QUESTION: 具体的な質問内容
```

### コードレビュー基準

1. **R-01〜R-05 準拠**: 絶対禁止事項への違反がないか
2. **型安全性**: TypeScript の型定義が適切か
3. **テストカバレッジ**: 新機能に対するテストが存在するか
4. **セキュリティ**: 認証・決済周りのセキュリティ対策
5. **パフォーマンス**: ユーザー体験に影響する性能問題がないか

### 実装前の承認プロセス

1. **必須**: `/plan` フェーズで実装計画を提示
2. **承認**: 計画内容の確認・承認を得る
3. **実装**: 承認後に `/code` フェーズで実装開始

## 📱 アーキテクチャ概要

### コンポーネント構成

```
app/
├── page.tsx              # メイン画面（単一画面設計）
├── api/
│   ├── auth/            # Supabase 認証
│   ├── payment/         # Stripe 決済処理
│   └── share/           # SNS シェア API
├── components/
│   ├── WakeChallenge.tsx    # 起床チャレンジ UI
│   ├── FaceVerification.tsx # 顔認証コンポーネント
│   └── SocialShare.tsx      # SNS シェア機能
└── lib/
    ├── supabase.ts      # Supabase クライアント
    ├── stripe.ts        # Stripe ラッパー
    └── utils.ts         # 共通ユーティリティ
```

### データベース設計 (Supabase)

- `users`: ユーザー情報・設定
- `wake_challenges`: 起床チャレンジ記録  
- `payments`: 決済履歴
- `achievements`: 達成状況

## 🧪 テスト戦略

### テスト分類

1. **Unit Tests**: コンポーネント・ユーティリティ関数のテスト
2. **Integration Tests**: API・データベース連携のテスト
3. **E2E Tests**: 起床チャレンジ完全フローのテスト

### 実行コマンド

```bash
# 全テスト実行
pnpm test

# 監視モード
pnpm test:watch

# カバレッジ計測
pnpm test:coverage

# 型チェック
pnpm typecheck

# リント
pnpm lint
```

## 🌟 MVP 実装ロードマップ

### Phase 1: Foundation ✅
- [x] プロジェクト初期化
- [x] README・ワークフロー整備
- [x] 基本的な UI 構築

### Phase 2: Core Features
- [ ] 単一画面への統合
- [ ] Supabase 統合
- [ ] 顔認証機能
- [ ] Stripe 決済統合

### Phase 3: Social Features  
- [ ] LINE シェア機能
- [ ] X(Twitter) シェア機能
- [ ] 達成システム

### Phase 4: Production Ready
- [ ] 包括的テストスイート
- [ ] パフォーマンス最適化
- [ ] セキュリティ監査
- [ ] 本番環境デプロイ

---

**🔥 "起きろ、さもなくば払え" - 小さなペナルティで大きな変化を！**