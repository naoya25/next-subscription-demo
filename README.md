# next-subscription-demo

Stripe **テストモード**でサブスクリプション（Checkout → Webhook）の流れを **ローカル検証**するための Next.js（App Router）サンプル用リポジトリです。実課金・本番キーは想定していません。

## ドキュメント

| 内容                               | 場所                                                                 |
| ---------------------------------- | -------------------------------------------------------------------- |
| **方針・実装手順・チェックリスト** | [docs/subscription-local-test.md](./docs/subscription-local-test.md) |

## 起動

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

## スタック（現状）

- Next.js 16 · React 19 · TypeScript · Tailwind CSS · ESLint · `src/` レイアウト

Stripe 連携は未実装です。手順は上記 `docs` を参照してください。

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
