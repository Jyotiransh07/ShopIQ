# ShopIQ Analytics - Deployment Guide

This project is built with React, Vite, and Supabase. Follow these steps to deploy it to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account.
2. A [Supabase](https://supabase.com) project.
3. Your project's SQL tables and policies must be set up in Supabase (see the SQL provided in the chat).

## Deployment Steps

### 1. Push to GitHub
- Export this project to GitHub using the **Settings > Export to GitHub** menu in AI Studio.
- If you encounter authentication errors, try disconnecting and reconnecting your GitHub account in AI Studio settings.

### 2. Connect to Vercel
- Log in to [Vercel](https://vercel.com).
- Click **"Add New"** > **"Project"**.
- Import your GitHub repository.

### 3. Configure Environment Variables
In the Vercel deployment settings, add the following **Environment Variables**:

| Key | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key |

*Note: You can find these in your Supabase Dashboard under **Project Settings > API**.*

### 4. Deploy
- Click **"Deploy"**.
- Vercel will automatically build your project using `npm run build` and serve it from the `dist` folder.
- The included `vercel.json` ensures that client-side routing works correctly (handling page refreshes).

## Local Development

```bash
npm install
npm run dev
```

Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```
