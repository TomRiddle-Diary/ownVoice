# 認証システムのセットアップ手順

認証システムの修正が完了しました。以下の手順でセットアップしてください。

## 1. データベースマイグレーション

Prismaスキーマに`password`フィールドを追加したので、データベースを更新する必要があります。

```powershell
# マイグレーションを作成して実行
npx prisma migrate dev --name add_password_to_user

# Prismaクライアントを再生成
npx prisma generate
```

## 2. OAuth認証の設定

GitHub と Google の OAuth 認証を使用するには、各プラットフォームでアプリケーションを登録する必要があります。

### GitHub OAuth

1. [GitHub Developer Settings](https://github.com/settings/developers) にアクセス
2. "New OAuth App" をクリック
3. 以下の情報を入力：
   - **Application name**: own voice
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 作成後、Client ID と Client Secret をコピー
5. `.env` ファイルに追加：
   ```
   GITHUB_ID="あなたのClient ID"
   GITHUB_SECRET="あなたのClient Secret"
   ```

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. "APIs & Services" > "Credentials" に移動
4. "Create Credentials" > "OAuth client ID" をクリック
5. アプリケーションタイプで "Web application" を選択
6. 以下の情報を入力：
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google`
7. Client ID と Client Secret をコピー
8. `.env` ファイルに追加：
   ```
   GOOGLE_CLIENT_ID="あなたのClient ID"
   GOOGLE_CLIENT_SECRET="あなたのClient Secret"
   ```

## 3. NextAuth Secret の生成

セキュアなシークレットキーを生成します：

```powershell
# PowerShellでランダムな文字列を生成
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

生成された文字列を `.env` ファイルの `NEXTAUTH_SECRET` に設定してください。

## 4. 開発サーバーの起動

```powershell
npm run dev
```

## 5. 認証機能の動作確認

1. `http://localhost:3000` にアクセス
2. "始める" をクリックすると、ログインページにリダイレクトされます
3. 以下の方法でログインできます：
   - **Google アカウント**: "Googleでログイン" をクリック
   - **GitHub アカウント**: "GitHubでログイン" をクリック
   - **メールアドレス**: 新規登録してからログイン

## 変更内容

### ✅ 追加されたファイル
- [src/components/SessionProvider.tsx](src/components/SessionProvider.tsx) - NextAuthのセッション管理
- [src/app/auth/signin/page.tsx](src/app/auth/signin/page.tsx) - ログインページ
- [src/app/auth/signup/page.tsx](src/app/auth/signup/page.tsx) - 新規登録ページ
- [src/app/api/auth/signup/route.ts](src/app/api/auth/signup/route.ts) - サインアップAPI

### ✏️ 修正されたファイル
- [src/lib/auth.ts](src/lib/auth.ts) - GitHub/Googleプロバイダーを追加、パスワード検証を実装
- [src/app/layout.tsx](src/app/layout.tsx) - SessionProviderを追加
- [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx) - 認証チェックを追加
- [prisma/schema.prisma](prisma/schema.prisma) - Userモデルにpasswordフィールドを追加
- [.env](.env) - OAuth認証の環境変数を追加

## 注意事項

- OAuth認証を使用しない場合でも、メールアドレスとパスワードで認証できます
- 本番環境では、必ず `NEXTAUTH_URL` を本番URLに変更してください
- OAuth認証のリダイレクトURLも本番環境に合わせて変更する必要があります
