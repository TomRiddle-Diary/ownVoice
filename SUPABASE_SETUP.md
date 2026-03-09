# 🚀 Supabaseセットアップ手順

メールアドレス認証のみのシンプルな認証システムをSupabaseで構築します。

---

## ステップ1️⃣：Supabaseプロジェクトを作成

### 1. Supabaseにアクセス
[https://supabase.com](https://supabase.com) を開いてサインアップ/ログイン

### 2. 新しいプロジェクトを作成
1. "New project" ボタンをクリック
2. 以下の情報を入力：
   - **Name**: `writecraft`（または好きな名前）
   - **Database Password**: 強力なパスワードを設定（**必ず保存！**）
   - **Region**: `Northeast Asia (Tokyo)` を選択（日本から近い）
   - **Pricing Plan**: `Free` を選択

3. "Create new project" をクリック
4. プロジェクトの準備が完了するまで待つ（約1-2分）

---

## ステップ2️⃣：データベース接続URLを取得

### 方法1：Connectボタンを使う（簡単！）
1. 画面右上の **"Connect"** ボタンをクリック
2. **"Pooler"** タブを選択（推奨）
3. **"Connection string"** をコピー（こんな感じ）：
   ```
   postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```

### 方法2：Settings から取得
1. 左側のメニュー下部から **⚙️ (Settings アイコン)** をクリック
2. **"Database"** をクリック
3. 下にスクロールして **"Connection string"** セクションを見つける
4. **"URI"** タブを選択
5. 接続文字列をコピー

### 2. パスワードを置き換え
- `[YOUR-PASSWORD]` の部分を、ステップ1で設定した**データベースパスワード**に置き換える

**例：**
```
元：postgresql://postgres.abc123:[YOUR-PASSWORD]@...
↓
完成：postgresql://postgres.abc123:MyS3cur3P@ssw0rd@...
```

---

## ステップ3️⃣：.envファイルに設定

### 1. .envファイルを開く
プロジェクトの `.env` ファイルを開いてください。

### 2. DATABASE_URLを更新
以下の行を探して：
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

↓ Supabaseからコピーした接続文字列に置き換え：
```env
DATABASE_URL="postgresql://postgres.abc123:MyS3cur3P@ssw0rd@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
```

### 3. NEXTAUTH_SECRETを生成（まだの場合）
PowerShellで以下を実行：
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

生成された文字列を `.env` の `NEXTAUTH_SECRET` に貼り付け：
```env
NEXTAUTH_SECRET="生成された文字列をここに"
```

### 4. 保存
`.env` ファイルを保存してください。

---

## ステップ4️⃣：データベースをセットアップ

### 1. マイグレーションを実行
PowerShellで以下のコマンドを実行：

```powershell
cd writecraft
npx prisma migrate dev --name initial_setup
```

これで以下が自動的に実行されます：
- データベースにテーブル（User, Post, Bullet）を作成
- Prismaクライアントを再生成

### 2. 成功メッセージを確認
以下のようなメッセージが表示されればOK：
```
✔ Generated Prisma Client
✔ Migrations applied successfully
```

---

## ステップ5️⃣：開発サーバーを起動

### 1. サーバーを起動
```powershell
npm run dev
```

### 2. ブラウザで確認
`http://localhost:3000` を開く

### 3. 新規登録を試す
1. "始める" をクリック → ログインページへリダイレクト
2. "新規登録" をクリック
3. 名前、メールアドレス、パスワードを入力
4. "アカウントを作成" をクリック
5. 自動的にログインされ、ダッシュボードに移動

---

## ✅ 完了！

これで以下が動作します：
- ✅ Supabaseのデータベースに接続
- ✅ メールアドレスとパスワードで新規登録
- ✅ ログイン・ログアウト
- ✅ 各ユーザーのデータが分離される

---

## 📊 データを確認する方法

Supabaseの管理画面でデータを確認できます：

1. Supabaseのプロジェクトダッシュボードを開く
2. 左側のメニューから **"Table Editor"** をクリック
3. `User` テーブルを選択
4. 登録したユーザーが表示されます

---

## 🆘 トラブルシューティング

### エラー: "Can't reach database server"
→ `.env` の `DATABASE_URL` が正しいか確認してください
→ パスワードに特殊文字（`@`, `#`, `%` など）が含まれる場合は、URLエンコードが必要な場合があります

### エラー: "P1001" または接続エラー
→ インターネット接続を確認してください
→ Supabaseのプロジェクトが起動しているか確認（ダッシュボードで確認）

### マイグレーションエラー
→ 開発サーバー（`npm run dev`）を停止してから、もう一度マイグレーションを実行してください

---

## 💰 料金について

**Supabase Free Tier（無料枠）**
- ✅ 500MB データベースストレージ
- ✅ 50,000 月間アクティブユーザー
- ✅ 2GB データ転送
- ✅ 個人プロジェクトには十分

このプロジェクトでは無料枠で十分です！

---

何か問題があれば教えてください！
