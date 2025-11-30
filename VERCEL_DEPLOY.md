# Deploy to Vercel

Deploying to Vercel gives you a permanent HTTPS URL, perfect for camera access and production use.

## Prerequisites

- GitHub account (or GitLab/Bitbucket)
- Supabase project set up (see `SUPABASE_SETUP.md`)
- Your code pushed to a Git repository

## Step 1: Push to GitHub

1. Initialize git (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create a new repository on GitHub

3. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `pnpm build` (or leave default)
   - **Output Directory**: `.next` (default)
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click **Deploy**

### Option B: Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   pnpm add -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow prompts and add environment variables when asked

## Step 3: Access Your App

After deployment, you'll get a URL like:
- `https://your-app.vercel.app`

This URL:
- ✅ Works permanently (no expiration)
- ✅ Has HTTPS (camera will work)
- ✅ Can be accessed from anywhere
- ✅ Auto-updates on every git push

## Step 4: Test on Mobile

1. Open the Vercel URL on your phone
2. Grant camera permissions
3. Scan QR codes - they'll save to Supabase
4. Check admin page on laptop - scans appear automatically!

## Custom Domain (Optional)

1. In Vercel dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS setup instructions
4. Your app will be available at your custom domain

## Environment Variables

To update environment variables:
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/edit variables
3. Redeploy (or they auto-update on next push)

## Continuous Deployment

Every time you push to your main branch:
- Vercel automatically builds and deploys
- You get a preview URL for each branch/PR
- Production URL updates automatically

## Benefits Over ngrok

| Feature | ngrok | Vercel |
|---------|-------|--------|
| URL | Changes on restart | Permanent |
| HTTPS | ✅ | ✅ |
| Cost | Free (limited) | Free tier |
| Performance | Tunnel (slower) | CDN (fast) |
| Production-ready | ❌ | ✅ |
| Auto-deploy | ❌ | ✅ (on git push) |

## Troubleshooting

**Build fails:**
- Check build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- Verify environment variables are set

**Camera not working:**
- Make sure you're using the HTTPS URL (not HTTP)
- Check browser permissions
- Verify you're not on localhost

**Supabase connection errors:**
- Verify environment variables in Vercel dashboard
- Check Supabase project is active
- Ensure RLS policies allow public access



