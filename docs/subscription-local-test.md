# サブスク課金のローカル検証（Stripe テストモード）

このリポジトリは **本番課金を行わず**、Stripe のテストモードで Checkout・Webhook・サブスクリプションの流れを学ぶ・動かすための Next.js サンプル用ベースです。

## 要点（先に読む）

| 項目         | 内容                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| **目的**     | `localhost` 上でサブスクの一連の動き（決済画面 → 成立 → Webhook）を再現する                               |
| **課金**     | **発生しない**。`pk_test_` / `sk_test_` のみ。ダッシュボードは常に **Test mode**                          |
| **公開**     | 基本はローカルのみ。デプロイする場合もプレビュー＋テストキーに限定（ライブキーは使わない）                |
| **技術**     | Next.js App Router、Stripe（Checkout `mode: subscription`、Webhook）、Stripe CLI でローカルへイベント転送 |
| **状態保存** | Webhook で購読状態を反映するには保存先が必要。SQLite + Prisma 等、最小構成でよい                          |
| **法的注意** | テスト用途の整理。実際に一般向けに課金を始める際は税務・特商法等は別途扱う                                |

## 処理の流れ（概要）

1. ユーザーがアプリで「登録」→ API が **Checkout Session**（`mode: subscription`）を作成
2. ブラウザが Stripe Hosted Checkout へリダイレクト
3. **テストカード**で完了
4. Stripe →（通常は Webhook URL）→ ローカルでは **Stripe CLI** が `localhost` の Route Handlers に転送
5. アプリが署名を検証し、**subscription 関連イベント**に応じて DB 等を更新

公式: [Test mode](https://stripe.com/docs/test-mode)、[Testing](https://stripe.com/docs/testing)、[Stripe CLI](https://stripe.com/docs/stripe-cli)

## 実装チェックリスト

### 1. 事前準備

- Node（LTS 推奨）
- [Stripe](https://dashboard.stripe.com/) アカウント（無料で可）
- [Stripe CLI](https://stripe.com/docs/stripe-cli) インストール・ログイン

### 2. 依存パッケージ（未インストールの場合）

```bash
npm install stripe
# Hosted Checkout のみなら @stripe/stripe-js は任意
```

### 3. Stripe ダッシュボード（テストモード）

- **Product** を作成
- **定期課金用 Price**（例: 月額）を 1 つ紐づける
- **Price ID**（`price_...`）をメモ → 後で `.env.local` の `STRIPE_PRICE_ID` に設定

### 4. 環境変数（`.env.local`・コミットしない）

| 変数名                               | 説明                                                               |
| ------------------------------------ | ------------------------------------------------------------------ |
| `STRIPE_SECRET_KEY`                  | `sk_test_...`                                                      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...`                                                      |
| `STRIPE_PRICE_ID`                    | 上記の recurring price id                                          |
| `STRIPE_WEBHOOK_SECRET`              | `stripe listen` 実行時に表示される `whsec_...`（ローカル専用で可） |

`.env.example` に **キー名だけ** 列挙しておくと安全。

### 5. API（Route Handlers の例）

- **`POST /api/checkout`（名前は任意）**
  - `stripe.checkout.sessions.create`
  - `mode: 'subscription'`
  - `line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }]`
  - `success_url` / `cancel_url` を `http://localhost:3000/...` に固定

- **`POST /api/webhooks/stripe`**
  - **生の body** で Stripe の署名ヘッダを検証（`stripe.webhooks.constructEvent`）
  - 例: `checkout.session.completed`、`customer.subscription.updated`、`customer.subscription.deleted` などを処理し、顧客・サブスク ID・ステータスを DB に反映

Next.js では Webhook ルートで `req.text()` 等を使い、JSON パース前の raw body を渡すこと。

### 6. 最小 UI

- トップ: 「プランに登録」ボタン → Checkout API を叩いて `session.url` へリダイレクト
- 成功ページ: 完了メッセージ（任意で [Customer Portal](https://stripe.com/docs/customer-management) でプラン変更・解約 UI を Stripe 側に任せる）

### 7. ローカルでの動かし方

ターミナル 1:

```bash
npm run dev
```

ターミナル 2（Webhook 転送。パスは実装に合わせて変える）:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

表示された **signing secret** を `STRIPE_WEBHOOK_SECRET` にセットしてサーバーを再起動。

Checkout 完了後、CLI にイベントが出ること、アプリ側のログまたは DB が更新されることを確認する。

### 8. テストカード

[Stripe Testing](https://stripe.com/docs/testing) の番号を使う（例: `4242424242424242`、有効期限・CVC は任意の将来日付で可）。

### 9. リポジトリ衛生

- `.env.local` を **git に含めない**（`create-next-app` デフォルトで除外されていることが多いが要確認）
- ライブモードのキーをこのプロジェクトに置かない

## 完了の定義

- テストモードで **Checkout → サブスク成立 → Webhook でアプリ側が状態更新** まで通る
- **解約または更新**に相当するイベントを 1 回以上再現できる（ダッシュボードや Portal から）

## 関連ドキュメント

- このファイル: 方針・手順の全体像
- リポジトリ直下 [README.md](../README.md): 起動方法とドキュメントへのリンク
