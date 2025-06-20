# wake-or-pay｜MVP Ultra-Think プロジェクト定義

## 🎯 目的
30 秒オンボーディング + 強制起床認証（顔 or シェイク）で寝坊を罰金化し、
Supabase・Stripe 連携まで含めた検証用 MVP を 1 週間以内に完成させる。

## 🛠 技術スタック
- TypeScript / Next.js 14
- Tailwind CSS
- Supabase (Auth, DB, Edge Functions)
- Stripe (事前払い & 失敗時自動徴収)
- vitest + testing-library/react
- ESLint + Prettier

## 📂 ディレクトリ / 主要ファイル
| パス | 役割 |
|---|---|
| `/pages/index.tsx` | 30 秒オンボーディング UI |
| `/pages/dashboard.tsx` | 毎朝のフィードバック |
| `/components/FaceCheck.tsx` | 顔認証 (Camera API) |
| `/components/ShakeCheck.tsx` | シェイク認証 (DeviceMotion) |
| `/lib/supabase.ts` | Supabase 初期化 |
| `/lib/stripe.ts` | Stripe ラッパ |
| `/utils/recordResult.ts` | 成功/失敗 & KPI 保存 |
| `/supabase/migrations/*.sql` | `alarms`, `results`, `user_kpi`, `experiments` |
| `/tests/*` | vitest ユニットテスト |

## 🔑 準拠ルール
1. **Plan → Build**：計画モードでタスクリストを確定後、実装へ進むこと。

2. **🧠 Ultra-Think モード**：以下の場面で深い思考プロセスを実行
   - **設計時**: アーキテクチャ決定、技術選定、パフォーマンス最適化
   - **バグ修正時**: 根本原因分析、副作用の検討、複数の解決策の比較
   - **疑問解決時**: 複数の可能性を検討し、最適解を導出
   - **使用方法**: ユーザーが「ultra think」と言及したら、以下を実行：
     * 問題を3つ以上の観点から分析
     * 各アプローチのメリット・デメリットを明示
     * 推奨案に理由を添えて提示
     * 実装の具体的な手順を提供

3. **/clear**：フェーズ転換時に履歴をクリア。

4. **実行コマンドの確認**：`npm install`, `npm run lint` などは要確認。開発サーバーは人間側で起動。

5. **CLAUDE.md の継続更新**：仕様が変わったら `コード全体を読んで CLAUDE.md をアップデートして` と指示。

6. **テスト必須**：新規ロジックには vitest を追加し、PRIORITY＝高。

7. **アクセシビリティ**：音声ガイド／高コントラストを考慮。

8. **セキュリティ**：RLS、Stripe 署名検証、.env 秘匿。