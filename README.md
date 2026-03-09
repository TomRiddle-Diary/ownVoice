# WriteCraft - 論理的ライティングスキル向上プラットフォーム

WriteCraftは、AI に文章を書いてもらうのではなく、**あなた自身の論理的な文章力を鍛える**ためのSaaSアプリケーションです。PREP法（Point、Reason、Example、Point）という構造化された手法を使って、説得力のある文章を書けるようになります。

## 📚 目次

- [このアプリでできること](#-このアプリでできること)
- [PREP法とは？](#-prep法とは)
- [使用技術（初心者向け説明）](#️-使用技術tech-stack)
- [アプリの構成（どう動いているか）](#-アプリの構成どう動いているか)
- [環境構築（Getting Started）](#-getting-started)
- [プロジェクト構造](#-プロジェクト構造フォルダとファイルの説明)
- [データベース設計](#-データベース設計どんなデータを保存しているか)
- [主な機能の詳細](#-主な機能の詳細どんなことができるか)
- [API一覧](#-api一覧サーバーとの通信方法)
- [開発を進める（機能追加）](#-開発を進める機能追加の方法)
- [本番環境へのデプロイ](#-本番環境へのデプロイ公開する方法)
- [初心者向けのヒント](#-初心者向けのヒント)

## 🎯 このアプリでできること

- ✍️ **構造化された下書き**: ドラッグ&ドロップでアイデアをPREPフレームワークに整理
- 🤖 **AIフィードバック**: 文法、論理性、完全性について即座にフィードバック取得
- 📚 **比較学習**: あなたの下書きと理想的なバージョンを並べて比較
- 📝 **複数カテゴリ対応**: Tech Blog、提案書、自己PR、エッセイなど

## 🎓 PREP法とは？

**PREP法**は、論理的で説得力のある文章を書くためのフレームワークです：

1. **P**oint（結論）: まず結論を述べる
2. **R**eason（理由）: なぜそう言えるのか理由を説明
3. **E**xample（具体例）: 具体的な証拠や事例を示す
4. **P**oint（結論）: 最後にもう一度結論を強調

**例**:
```
P: Next.jsは最高のWebフレームワークです
R: なぜなら、ページの読み込みが非常に高速だからです
E: 実際、SSRにより初回表示が0.5秒以内に完了します
P: このように、Next.jsは開発者にとって最良の選択です
```

## 🛠️ 使用技術（Tech Stack）

このアプリは、以下の技術を組み合わせて作られています。各技術の役割を初心者向けに説明します。

### フロントエンド（ユーザーが見る画面）

#### **Next.js 14+ (App Router)**
- **何をするもの？**: Webアプリを作るためのフレームワーク（開発の土台）
- **なぜこれを使う？**: React（画面を作るライブラリ）をもっと便利にしたもの。ページのルーティング（URLごとのページ切り替え）や、サーバー側の処理も簡単にできる
- **このアプリでの役割**: アプリ全体の構造を管理し、ページ間の移動やデータの取得を制御

#### **TypeScript**
- **何をするもの？**: JavaScriptに「型」を追加したプログラミング言語
- **なぜこれを使う？**: 型があることで、コードのミスを事前に発見でき、バグが減る。大規模なアプリ開発に向いている
- **このアプリでの役割**: すべてのコードをTypeScriptで書いて、開発時のエラーを減らす

#### **Tailwind CSS**
- **何をするもの？**: CSSフレームワーク（デザインを簡単にするツール）
- **なぜこれを使う？**: クラス名を組み合わせるだけで、素早くスタイリング（色・サイズ・配置など）ができる
- **このアプリでの役割**: ボタン、カード、レイアウトなど、すべての見た目をデザイン

#### **shadcn/ui**
- **何をするもの？**: 再利用可能なUIコンポーネント集（ボタン、ダイアログ、カードなど）
- **なぜこれを使う？**: プロフェッショナルなデザインのパーツを簡単に使える。カスタマイズも自由
- **このアプリでの役割**: ボタン、入力フォーム、モーダルなどのUI部品を提供

#### **@hello-pangea/dnd**
- **何をするもの？**: ドラッグ&ドロップ機能を実装するライブラリ
- **なぜこれを使う？**: 要素をマウスで掴んで移動させる機能を簡単に作れる
- **このアプリでの役割**: アイデアのメモをPREP構造にドラッグ&ドロップで並べ替える機能

### バックエンド（サーバー側の処理）

#### **PostgreSQL**
- **何をするもの？**: リレーショナルデータベース（データを保存する場所）
- **なぜこれを使う？**: 大量のデータを安全に保存・検索できる。複雑なデータの関連性も管理できる
- **このアプリでの役割**: ユーザー情報、投稿（Post）、アイデアのメモ（Bullet）などを保存

#### **Prisma ORM**
- **何をするもの？**: データベースを簡単に操作するためのツール
- **なぜこれを使う？**: SQLを直接書かなくても、TypeScriptのコードでデータベース操作ができる。型安全でミスが減る
- **このアプリでの役割**: データベースへのデータ保存・取得・更新・削除を簡単に実行

#### **NextAuth.js**
- **何をするもの？**: 認証（ログイン・ログアウト）機能を提供するライブラリ
- **なぜこれを使う？**: 複雑なログイン機能を簡単に実装できる。セキュリティもしっかりしている
- **このアプリでの役割**: ユーザーのログイン状態を管理し、誰がどのデータを見られるか制御

### AI機能

#### **OpenAI API (GPT-4o)**
- **何をするもの？**: ChatGPTなどを動かすAIのAPI（外部サービス）
- **なぜこれを使う？**: 文章の文法チェックや論理性の分析、理想的な文章の生成ができる
- **このアプリでの役割**: ユーザーが書いた文章にフィードバックを提供したり、見本の文章を生成

## 📊 アプリの構成（どう動いているか）

```
┌─────────────────────────────────────────────────────────────┐
│                      ブラウザ（ユーザー）                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │        Next.jsフロントエンド（React + TypeScript）        │  │
│  │  - ページ表示（page.tsx）                               │  │
│  │  - UIコンポーネント（shadcn/ui）                         │  │
│  │  - ドラッグ&ドロップ（@hello-pangea/dnd）                │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPリクエスト
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Next.js サーバー（バックエンド）                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  APIルート（src/app/api/）                             │  │
│  │  - /api/auth/[...nextauth] → ログイン処理             │  │
│  │  - /api/feedback → AI文章フィードバック                │  │
│  │  - /api/model → 理想的な文章生成                       │  │
│  └─────┬─────────────────────────┬─────────────────────┘  │
│        │                         │                         │
│        ↓                         ↓                         │
│  ┌──────────┐            ┌─────────────┐                  │
│  │  Prisma  │            │  OpenAI API │                  │
│  │  Client  │            │   (GPT-4o)  │                  │
│  └─────┬────┘            └─────────────┘                  │
└────────┼──────────────────────────────────────────────────┘
         │
         ↓
┌─────────────────┐
│   PostgreSQL    │
│   データベース   │
│  - User（ユーザー） │
│  - Post（投稿）   │
│  - Bullet（メモ） │
└─────────────────┘
```

### データの流れ（例：文章フィードバック機能）

1. **ユーザーが文章を入力** → ブラウザ（Next.jsフロントエンド）
2. **「フィードバックをもらう」ボタンをクリック** → `/api/feedback` へHTTPリクエスト
3. **APIルートが処理** → OpenAI APIに文章を送信
4. **AIが分析** → 文法・論理性をチェックしてフィードバック生成
5. **結果を返す** → ユーザーの画面にフィードバック表示
6. **データベースに保存**（オプション）→ PostgreSQLに結果を記録

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database
- OpenAI API key

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/writecraft?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

   # OpenAI
   OPENAI_API_KEY="sk-..."
   ```

   To generate a secure NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations (or push schema for development)
   npx prisma db push

   # Optional: Open Prisma Studio to view data
   npx prisma studio
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 プロジェクト構造（フォルダとファイルの説明）

このアプリのファイル構造と、各ファイルが何をしているかを説明します。

```
writecraft/
├── src/                              # ソースコード（アプリの本体）
│   ├── app/                          # Next.js App Router（ページとAPI）
│   │   ├── api/                      # バックエンドAPI（サーバー側の処理）
│   │   │   ├── auth/[...nextauth]/  # 🔐 ログイン・ログアウト処理
│   │   │   │   └── route.ts         #    NextAuth.jsの設定
│   │   │   ├── feedback/            # 💬 AI文章フィードバック機能
│   │   │   │   └── route.ts         #    ユーザーの文章を分析してアドバイス返す
│   │   │   └── model/               # ✨ 理想的な文章生成機能
│   │   │       └── route.ts         #    PREP構造から見本の文章を生成
│   │   ├── dashboard/               # 📊 ダッシュボードページ
│   │   │   └── page.tsx             #    ユーザーの投稿一覧を表示
│   │   ├── editor/[id]/             # ✏️ エディターページ
│   │   │   └── page.tsx             #    PREP構造で文章を書く画面
│   │   ├── layout.tsx               # 🎨 全ページ共通のレイアウト
│   │   ├── page.tsx                 # 🏠 トップページ（ランディングページ）
│   │   └── globals.css              # 🎨 グローバルスタイル
│   ├── components/                   # 再利用可能なUIパーツ
│   │   └── ui/                      # shadcn/uiのコンポーネント
│   │       ├── button.tsx           #    ボタン
│   │       ├── card.tsx             #    カード
│   │       ├── dialog.tsx           #    モーダルダイアログ
│   │       ├── input.tsx            #    入力フィールド
│   │       └── ...                  #    その他のUIパーツ
│   ├── lib/                          # 共通ライブラリ（便利な機能）
│   │   ├── auth.ts                  # 🔐 NextAuth.jsの設定ファイル
│   │   ├── openai.ts                # 🤖 OpenAI APIクライアント
│   │   ├── prisma.ts                # 💾 Prismaデータベースクライアント
│   │   └── utils.ts                 # 🛠️ 汎用ユーティリティ関数
│   └── types/                        # TypeScriptの型定義
│       └── next-auth.d.ts           #    NextAuth.jsの型拡張
├── prisma/                           # データベース関連
│   └── schema.prisma                # 📊 データベース設計図（テーブル構造）
├── public/                           # 静的ファイル（画像など）
├── .env                              # 🔑 環境変数（秘密情報）
├── package.json                      # 📦 使用しているライブラリのリスト
├── tsconfig.json                     # ⚙️ TypeScriptの設定
├── next.config.ts                    # ⚙️ Next.jsの設定
└── tailwind.config.ts                # ⚙️ Tailwind CSSの設定
```

### 重要なファイルの詳細

#### **`src/app/api/` フォルダ**
バックエンドのAPI（サーバー側の処理）をまとめたフォルダです。
- ブラウザから `/api/feedback` などのURLにアクセスすると、対応する `route.ts` が実行される
- データベースへのアクセスや、外部API（OpenAI）との通信をここで行う

#### **`src/lib/` フォルダ**
複数の場所で使う共通の機能をまとめたフォルダです。
- `prisma.ts`: データベースに接続するための設定
- `openai.ts`: OpenAI APIを呼び出すための設定
- `auth.ts`: ログイン機能の設定

#### **`prisma/schema.prisma`**
データベースの設計図です。以下の3つのテーブルを定義しています：
- **User**: ユーザーアカウント情報（メール、パスワードなど）
- **Post**: ユーザーが作成した投稿（タイトル、カテゴリなど）
- **Bullet**: 投稿内のアイデアメモ（PREP構造の各パーツ）

#### **`.env` ファイル**
秘密情報を保存するファイル（GitHubにはアップしない）：
- データベースの接続情報
- OpenAI APIキー
- セッション管理用のシークレットキー

## 💾 データベース設計（どんなデータを保存しているか）

このアプリは3つの主要なテーブル（データの保存場所）を使っています。

### User（ユーザーテーブル）
**役割**: ユーザーアカウント情報を保存

| 項目 | 説明 | 例 |
|------|------|-----|
| id | ユーザーを識別するID | "user_123abc" |
| name | ユーザー名 | "田中太郎" |
| email | メールアドレス | "tanaka@example.com" |
| password | パスワード（暗号化済み） | "hashed_password" |
| createdAt | アカウント作成日時 | 2026-03-09 |

### Post（投稿テーブル）
**役割**: ユーザーが作成した文章プロジェクトを保存

| 項目 | 説明 | 例 |
|------|------|-----|
| id | 投稿を識別するID | "post_456def" |
| title | 投稿のタイトル | "Next.jsの魅力について" |
| category | カテゴリ | "Tech Blog" |
| content | 完成した文章 | "Next.jsは..." |
| modelText | AI生成の見本文章 | "理想的な文章は..." |
| userId | 誰が作ったか（UserテーブルのIDと紐づく） | "user_123abc" |
| createdAt | 作成日時 | 2026-03-09 10:00 |

### Bullet（アイデアメモテーブル）
**役割**: PREP構造の各パーツ（メモ）を保存

| 項目 | 説明 | 例 |
|------|------|-----|
| id | メモを識別するID | "bullet_789ghi" |
| content | メモの内容 | "高速なページ遷移" |
| section | どのパート？ | "reason"（理由パート） |
| order | 並び順 | 1, 2, 3... |
| postId | どの投稿に属するか | "post_456def" |

### テーブルの関係性

```
User (ユーザー)
  │
  │ 1人のユーザーが複数の投稿を持つ
  │
  └──> Post (投稿) × 複数
         │
         │ 1つの投稿が複数のメモ（Bullet）を持つ
         │
         └──> Bullet (メモ) × 複数
```

**例**: 田中太郎さん（User）が「Next.jsの魅力」という投稿（Post）を作り、その中に「高速なページ遷移」というメモ（Bullet）を複数保存している

## ✨ 主な機能の詳細（どんなことができるか）

### 1. 📝 構造化された下書き（PREP Method）

**PREP法とは？**
論理的な文章を書くためのフレームワーク（型）です：
- **P**oint (結論): 最初に主張を述べる
- **R**eason (理由): なぜそう思うのか説明
- **E**xample (具体例): 具体的な証拠や事例を示す
- **P**oint (結論): 最後にもう一度主張を強調

**このアプリでできること:**
1. 💡 アイデアをメモとして追加（まだPREP構造に入れない）
2. 🖱️ メモをドラッグ&ドロップでPREPの各パートに配置
   - 「高速なページ遷移」→ Reasonエリアへドラッグ
   - 「実際の体験談」→ Exampleエリアへドラッグ
3. ✏️ 各パートのメモを見ながら文章を書く
4. 📊 PREP構造が守られているか視覚的に確認

**メリット**: 思いついたアイデアを整理してから書き始められるので、論理的な文章が書きやすい

---

### 2. 🤖 AIによる文章フィードバック

**何をしてくれる？**
OpenAI（GPT-4o）があなたの文章を分析して、改善点を教えてくれます。

**チェック項目:**
- ✅ **文法**: タイプミスや文法の間違い
- ✅ **論理性**: ExampleがReasonをちゃんと支えているか？
- ✅ **完全性**: PREP構造のすべてのパートが書かれているか？
- ✅ **明瞭性**: 文章がわかりやすいか、改善点は？

**使い方:**
1. エディターで文章を書く
2. 「フィードバックをもらう」ボタンをクリック
3. 5秒以内にAIから具体的なアドバイスが返ってくる

**技術的な仕組み:**
```
あなたの文章
    ↓
/api/feedback API（Next.js）
    ↓
OpenAI API（GPT-4o）に送信
    ↓
AIが分析してフィードバック生成
    ↓
画面に結果を表示
```

---

### 3. 📚 比較学習（Ideal Versionとの比較）

**何ができる？**
あなたが作ったPREP構造を元に、AIが「理想的な文章」を生成します。

**流れ:**
1. あなたのPREP構造（メモの配置）を読み取る
2. AIが同じ構造で、プロのライターのような文章を生成
3. あなたの文章とAI生成の文章を並べて比較

**学べること:**
- 💡 プロはどんな言い回しを使うのか
- 💡 パート間のつなぎ方（接続詞の使い方）
- 💡 同じ内容でも、表現方法で印象が変わること

**重要**: AIに書いてもらうのではなく、「お手本」として参考にするための機能です

## 🔌 API一覧（サーバーとの通信方法）

**APIとは？** ブラウザ（フロントエンド）とサーバー（バックエンド）が通信するための窓口です。データを送ったり受け取ったりします。

### 1. POST `/api/feedback` - 文章フィードバック取得

**何をする？** ユーザーが書いた文章をAIに送って、フィードバックをもらう

**いつ使う？** エディター画面で「フィードバックをもらう」ボタンを押したとき

**送るデータ（Request）:**
```json
{
  "content": "Next.jsは最高のフレームワークです。なぜなら...",  // ユーザーが書いた文章
  "structure": {                                              // PREP構造
    "point1": ["Next.jsは最高"],                             // 最初の主張
    "reason": ["高速だから", "開発が楽だから"],                  // 理由
    "example": ["実際の事例..."],                             // 具体例
    "point2": ["だからNext.jsは最高"]                         // 結論
  }
}
```

**返ってくるデータ（Response）:**
```json
{
  "feedback": "文章全体の構造は良いですが、Exampleパートでより具体的な数値データがあるとさらに説得力が増します..."
}
```

**技術的な流れ:**
1. フロントエンドから `POST /api/feedback` にデータ送信
2. サーバー側（`src/app/api/feedback/route.ts`）で受け取る
3. OpenAI APIにデータを転送
4. AIの分析結果を受け取る
5. フロントエンドに結果を返す

---

### 2. POST `/api/model` - 理想的な文章生成

**何をする？** PREP構造を元に、AIが「お手本の文章」を生成

**いつ使う？** エディター画面で「見本を見る」ボタンを押したとき

**送るデータ（Request）:**
```json
{
  "structure": {                      // PREP構造のメモたち
    "point1": ["Next.jsは最高"],
    "reason": ["高速だから"],
    "example": ["SSRの例"],
    "point2": ["だから最高"]
  },
  "category": "Tech Blog"             // カテゴリ（文体を調整）
}
```

**返ってくるデータ（Response）:**
```json
{
  "modelText": "Next.jsは現代のWeb開発において最も優れたフレームワークです。その理由は、ページの読み込み速度が圧倒的に速いためです。例えば、サーバーサイドレンダリング（SSR）により、初回表示が0.5秒以内に完了します。このように、Next.jsは開発者にとって最良の選択肢と言えるでしょう。"
}
```

---

### 3. `/api/auth/[...nextauth]` - 認証（ログイン・ログアウト）

**何をする？** ユーザーのログイン状態を管理

**いつ使う？** ログイン・ログアウト・ユーザー情報取得の時

**主な機能:**
- ログイン処理
- ログアウト処理
- セッション管理（誰がログインしているか記録）
- パスワードの暗号化・検証

**Note**: NextAuth.jsが自動的に処理するので、手動でこのAPIを呼ぶことは少ない

## 🚀 開発を進める（機能追加の方法）

このアプリをカスタマイズしたり、新しい機能を追加する方法を説明します。

### 新しいページを追加する

**例**: `/about`（アバウトページ）を追加したい

1. `src/app/about/` フォルダを作成
2. その中に `page.tsx` を作成：
   ```tsx
   export default function AboutPage() {
     return <div>このアプリについて</div>
   }
   ```
3. ブラウザで `http://localhost:3000/about` にアクセス

**仕組み**: Next.jsのApp Routerは、フォルダ構造 = URLになる
- `src/app/about/page.tsx` → `/about`
- `src/app/contact/page.tsx` → `/contact`

---

### 新しいAPIを追加する

**例**: `/api/save`（データ保存API）を追加したい

1. `src/app/api/save/` フォルダを作成
2. その中に `route.ts` を作成：
   ```typescript
   import { NextResponse } from 'next/server'
   import { prisma } from '@/lib/prisma'
   
   export async function POST(request: Request) {
     const data = await request.json()
     // データベースに保存
     const result = await prisma.post.create({ data })
     return NextResponse.json(result)
   }
   ```
3. フロントエンドから `fetch('/api/save', { method: 'POST', body: ... })` で呼び出す

---

### データベースのテーブルを変更する

**例**: Postテーブルに「いいね数」フィールドを追加

1. `prisma/schema.prisma` を編集：
   ```prisma
   model Post {
     id        String   @id @default(cuid())
     title     String
     likes     Int      @default(0)  // ← 追加
     // ... 他のフィールド
   }
   ```
2. データベースに反映：
   ```bash
   npx prisma db push
   ```
3. Prismaクライアントを再生成（自動的に実行されます）

**注意**: 既存のデータがある場合、フィールド追加時は `@default(0)` のようなデフォルト値が必要

---

### UIコンポーネント（shadcn/ui）を追加する

**例**: トースト通知を追加したい

1. shadcn/uiからコンポーネントをインストール：
   ```bash
   npx shadcn@latest add toast
   ```
2. 自動的に `src/components/ui/toast.tsx` が作成される
3. コード内でインポートして使用：
   ```tsx
   import { useToast } from '@/components/ui/use-toast'
   
   const { toast } = useToast()
   toast({ title: "保存しました！" })
   ```

**利用可能なコンポーネント**: button, card, dialog, input, select, table, など50種類以上

---

### デザインを変更する（Tailwind CSS）

**例**: ボタンの色を変える

```tsx
// 現在
<button className="bg-blue-500 text-white">クリック</button>

// 緑色に変更
<button className="bg-green-500 text-white">クリック</button>
```

**Tailwindのクラス名の読み方:**
- `bg-blue-500`: 背景色が青（濃さ500）
- `text-white`: 文字色が白
- `p-4`: パディング（余白）4単位
- `rounded`: 角を丸くする
- `hover:bg-blue-600`: ホバー時に背景色を変える

**カスタムカラーを追加**: `tailwind.config.ts` で設定可能

## 🌐 本番環境へのデプロイ（公開する方法）

**デプロイとは？** 作ったアプリをインターネット上に公開して、誰でもアクセスできるようにすること

### ステップ1: データベースを準備

ローカル環境（localhost）ではなく、インターネット上で動くデータベースが必要です。

**おすすめサービス（無料プランあり）:**

#### 🚂 Railway
- **難易度**: ⭐⭐☆☆☆（簡単）
- **手順**:
  1. https://railway.app でアカウント作成
  2. "New Project" → "PostgreSQL" を選択
  3. "Connect" タブから接続文字列をコピー
  4. これを後で環境変数に設定

#### 🟣 Supabase
- **難易度**: ⭐⭐☆☆☆（簡単）
- **手順**:
  1. https://supabase.com でアカウント作成
  2. "New Project" を作成（リージョンは Tokyo がおすすめ）
  3. Settings → Database → Connection String をコピー
  4. これを後で環境変数に設定

---

### ステップ2: アプリをデプロイ

#### ▲ Vercel（最もおすすめ）
Next.js を作った会社のサービスなので、相性抜群

**手順:**
1. https://vercel.com でアカウント作成（GitHubアカウントでログイン）
2. "Add New..." → "Project" を選択
3. GitHubリポジトリを接続
4. **環境変数を設定**（重要！）:
   ```
   DATABASE_URL=（Supabase/Railwayからコピー）
   NEXTAUTH_URL=（Vercelが自動設定）
   NEXTAUTH_SECRET=（新しく生成: openssl rand -base64 32）
   OPENAI_API_KEY=（OpenAIからコピー）
   ```
5. "Deploy" ボタンをクリック
6. 数分で完了！ `https://your-app.vercel.app` のURLが発行される

**メリット**:
- Next.jsに最適化されている
- GitHubにpushするたびに自動デプロイ
- 無料プランでも十分な性能

---

### ステップ3: データベースのマイグレーション

デプロイ後、最初に1回だけ実行する必要があります：

```bash
# ローカルで実行（本番データベースに接続）
npx prisma migrate deploy
```

または、Vercelのビルド設定で自動実行：
- Build Command: `npx prisma generate && next build`

---

### デプロイ後のチェックリスト

✅ アプリのURLにアクセスして、トップページが表示されるか  
✅ ログイン機能が動作するか  
✅ データベースへの書き込み・読み取りができるか  
✅ OpenAI APIのフィードバック機能が動くか  

---

## 💡 初心者向けのヒント

### 開発時に役立つツール

1. **Prisma Studio**: データベースの中身を視覚的に確認
   ```bash
   npx prisma studio
   # → http://localhost:5555 が開く
   ```

2. **VS Code拡張機能**:
   - **Prisma**: `schema.prisma` のシンタックスハイライト
   - **Tailwind CSS IntelliSense**: クラス名の自動補完
   - **ES7+ React/Redux/React-Native snippets**: Reactコードの自動生成

3. **ブラウザの開発者ツール**:
   - `F12` または `Cmd+Option+I` で開く
   - **Console**: エラーメッセージを確認
   - **Network**: API通信を確認
   - **React DevTools**: コンポーネントの状態を確認

---

### よくあるエラーと解決方法

#### ❌ `Error: P1001: Can't reach database server`
**原因**: データベースに接続できない  
**解決**:
- `.env` ファイルの `DATABASE_URL` が正しいか確認
- PostgreSQLが起動しているか確認（ローカルの場合）
- ファイアウォールでポート5432が開いているか確認

#### ❌ `Module not found: Can't resolve '@/lib/prisma'`
**原因**: パスエイリアス（`@/`）が認識されていない  
**解決**:
- `tsconfig.json` の `paths` 設定を確認
- 開発サーバーを再起動（`npm run dev` をCtrl+Cで停止して再実行）

#### ❌ `OpenAI API error: 401 Unauthorized`
**原因**: APIキーが無効または設定されていない  
**解決**:
- `.env` の `OPENAI_API_KEY` が正しいか確認
- OpenAIアカウントにクレジットがあるか確認
- 開発サーバーを再起動（環境変数の変更は再起動が必要）

#### ❌ `Error: Cannot find module 'next/font'`
**原因**: Node.jsのバージョンが古い  
**解決**:
- Node.js 20.x以上にアップデート
- `node -v` でバージョン確認

---

### 学習リソース

- **Next.js公式ドキュメント**: https://nextjs.org/docs（日本語あり）
- **Prismaドキュメント**: https://www.prisma.io/docs
- **Tailwind CSS公式**: https://tailwindcss.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## パフォーマンス最適化

このアプリは以下の最適化が施されています：

- ⚡ **AI応答速度**: GPT-4oを使用し、5秒以内にフィードバック返答
- 🎨 **スムーズなUI**: @hello-pangea/dndによる滑らかなドラッグ&ドロップ
- 💀 **スケルトンローダー**: API待機中も即座にフィードバック表示
- 🔄 **サーバーコンポーネント**: Next.jsのRSCで初回表示を高速化

## ライセンス

MIT License - 学習・開発目的で自由に使用できます

## サポート

質問や問題がある場合は、GitHubリポジトリでIssueを開いてください
