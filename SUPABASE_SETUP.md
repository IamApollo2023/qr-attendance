# Supabase Setup Guide

Follow these steps to connect your app to Supabase.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - **Name**: Your project name (e.g., "QR Attendance Scanner")
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **Create new project** (takes 1-2 minutes)

## Step 2: Get Your Credentials

1. Once project is ready, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase-setup.sql` file
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

## Step 4: Configure Environment Variables

1. In your project root, create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Replace the values with your actual credentials from Step 2

## Step 5: Install Dependencies & Run

```bash
pnpm install
pnpm dev
```

## Verify It Works

1. Open `http://localhost:3000` (scanner)
2. Scan a QR code - it should save to Supabase
3. Open `http://localhost:3000/admin` - you should see the scan appear

## Troubleshooting

**"Missing Supabase environment variables" warning:**
- Make sure `.env.local` exists in project root
- Restart the dev server after creating `.env.local`
- Check that variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Database errors:**
- Make sure you ran the SQL setup script
- Check Supabase dashboard → Table Editor → you should see `attendance` table

**Scans not appearing:**
- Check browser console for errors
- Verify your Supabase URL and key are correct
- Make sure Row Level Security policies are set (they're in the SQL script)

## Next Steps

Once set up, your app will:
- ✅ Save all scans to Supabase
- ✅ Sync across devices (phone ↔ laptop)
- ✅ Persist data (survives server restarts)
- ✅ Show real-time updates in admin page



