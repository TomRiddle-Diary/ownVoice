# WriteCraft - Quick Setup Guide

This guide will walk you through setting up WriteCraft on your local machine.

## Step 1: Prerequisites

Before you begin, make sure you have:
- ✅ Node.js 20.x or higher installed
- ✅ A PostgreSQL database (local or cloud)
- ✅ An OpenAI API key (from https://platform.openai.com/api-keys)

## Step 2: Environment Configuration

1. Open the `.env` file in the root directory
2. Update the following variables:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/writecraft?schema=public"

# NextAuth - Generate a secret key
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# OpenAI - Add your API key
OPENAI_API_KEY="sk-your-actual-api-key-here"
```

### Generating NEXTAUTH_SECRET

Run this command in your terminal (on Windows use Git Bash or WSL):
```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET`.

## Step 3: Database Setup

### Option A: Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create a new database:
   ```sql
   CREATE DATABASE writecraft;
   ```

2. Update `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/writecraft?schema=public"
   ```

### Option B: Cloud PostgreSQL (Recommended)

Use one of these services for quick setup:

**Supabase (Free)**:
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Paste it in your `.env` file as `DATABASE_URL`

**Railway (Free)**:
1. Go to https://railway.app
2. Create a new PostgreSQL service
3. Copy the connection string
4. Paste it in your `.env` file

## Step 4: Initialize the Database

Run these commands in your terminal:

```bash
# Generate Prisma Client
npx prisma generate

# Push the database schema (for development)
npx prisma db push

# (Optional) View your database
npx prisma studio
```

## Step 5: Run the Application

Start the development server:

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

You should see the WriteCraft landing page! 🎉

## Step 6: Test the Features

1. **Homepage**: Click "Get Started" or "Start Writing"
2. **Dashboard**: View the dashboard (temporarily accessible without auth)
3. **Editor**: Click "Open Project" to access the PREP editor
4. **Add Bullets**: Add your ideas as bullet points
5. **Drag & Drop**: Organize bullets into the PREP structure
6. **Write**: Compose your draft in the editor
7. **Get Feedback**: Click "Get AI Feedback" to analyze your writing
8. **Compare**: Click "Compare with Ideal" to see a model version

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`
- ✅ Check if PostgreSQL is running
- ✅ Verify your `DATABASE_URL` credentials
- ✅ Make sure the database exists
- ✅ Check if your IP is whitelisted (for cloud databases)

### OpenAI API Issues

**Error**: `Failed to generate feedback`
- ✅ Verify your `OPENAI_API_KEY` is correct
- ✅ Check if you have API credits available
- ✅ Ensure your API key has access to GPT-4o

### Build Errors

**Error**: `Module not found`
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

### Port Already in Use

If port 3000 is busy:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

## Next Steps

### Production Deployment

Ready to deploy? Check out:
- [Deploy to Vercel](https://vercel.com/new) - Easiest option for Next.js
- [Deploy to Railway](https://railway.app) - Includes database hosting

### Development

- Add more categories in the editor
- Implement user authentication properly
- Add save/load functionality for posts
- Create analytics and progress tracking

## Need Help?

- 📚 Read the [full README](./README.md)
- 🐛 Check [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Ask questions in Discussions

Enjoy building with WriteCraft! ✍️
