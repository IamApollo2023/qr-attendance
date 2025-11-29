# Jesus is Lord Luna QR Code Attendance

A production-ready web application for event facilitators to scan QR codes and track attendee attendance in real-time.

## Features

- 📷 **Camera-based QR Scanning** - Uses device camera to scan QR codes automatically
- 🔄 **Real-time Feedback** - Visual and audio confirmation when attendance is recorded
- 📋 **Live Attendee List** - See all scanned attendees with timestamps
- 🔀 **Camera Switching** - Toggle between front and rear cameras
- 📱 **Mobile Optimized** - Designed for portrait mobile orientation
- ⚡ **Duplicate Prevention** - Prevents duplicate scans within 2 seconds
- 🎯 **Visual Scanning Guide** - Overlay frame to guide QR code positioning
- 🛡️ **Error Handling** - Graceful handling of camera permissions, network errors, and invalid codes

## Tech Stack

- **Next.js 14+** with App Router
- **Tailwind CSS** for styling
- **Supabase** for database (real-time sync across devices)
- **@zxing/library** for QR code scanning

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up Supabase:**
   - Create a project at [supabase.com](https://supabase.com)
   - Go to **Settings** → **API** and copy your:
     - Project URL
     - Anon/public key

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database:**
   - In Supabase dashboard, go to **SQL Editor**
   - Copy and paste the contents of `supabase-setup.sql`
   - Click **Run** to execute

5. **Create user accounts:**
   - Go to **Authentication** → **Users** in Supabase dashboard
   - Create users manually, or enable email signup
   - **Important**: After creating a user, update their role in the `user_profiles` table:
     ```sql
     UPDATE user_profiles SET role = 'admin' WHERE email = 'admin@example.com';
     UPDATE user_profiles SET role = 'scanner' WHERE email = 'scanner@example.com';
     ```

6. **Run the development server:**
   ```bash
   pnpm dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)
   - You'll see a landing page with two options: **Scanner** and **Admin Dashboard**

### Testing on Mobile Device

To test on your mobile phone, use ngrok to create a secure tunnel:

```bash
# First, authenticate ngrok (one-time setup)
npx ngrok config add-authtoken YOUR_AUTH_TOKEN

# Then run with ngrok tunnel
pnpm dev:tunnel
```

See [NGROK_SETUP.md](./NGROK_SETUP.md) for detailed instructions.

## Usage

### Scanner Flow

1. Go to `/scanner/login` or click "Scanner" on the home page
2. Sign in with scanner credentials
3. Click "Start Scanning" or "Grant Camera Permission" to allow camera access
4. Point the camera at a QR code containing an attendee ID
5. The app will automatically detect and scan the QR code
6. You'll see visual feedback (green flash) and hear a confirmation sound
7. The scanned attendee will appear in the list below with a timestamp
8. Use the camera switch button to toggle between front/rear cameras

### Admin Flow

1. Go to `/admin/login` or click "Admin Dashboard" on the home page
2. Sign in with admin credentials
3. View all scanned attendees in real-time
4. Filter by event, export data, or clear records
5. The dashboard auto-refreshes every 3 seconds

## Data Storage

All attendance data is stored in **Supabase**, providing:
- ✅ **Real-time sync** - Scans from phone appear instantly on admin page
- ✅ **Persistent storage** - Data survives server restarts
- ✅ **Multi-device** - Phone and laptop share the same database
- ✅ **Scalable** - Works with multiple scanners and devices
- ✅ **Secure** - Row Level Security policies enabled

### Data Structure

Each attendance record contains:
- `id` (UUID) - Unique identifier
- `attendee_id` (TEXT) - The unique identifier from the QR code
- `scanned_at` (TIMESTAMPTZ) - When the scan occurred
- `event_id` (TEXT) - Event identifier (defaults to 'default')
- `scanned_by` (UUID) - References the scanner user who scanned it
- `created_at` (TIMESTAMPTZ) - Record creation timestamp

**Note:** The table is named `qr_attendance` to avoid conflicts with existing attendance tables in the database.

## Production Deployment

### Recommended: Deploy to Vercel

Vercel is the best option for this app:
- ✅ **Permanent HTTPS URL** (no changing URLs like ngrok)
- ✅ **Free tier** with generous limits
- ✅ **Automatic HTTPS** (required for camera)
- ✅ **Easy setup** - connect GitHub and deploy
- ✅ **Auto-deploy** on every git push

See [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) for detailed deployment instructions.

**Quick steps:**
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables (Supabase URL & key)
4. Deploy!

**Alternative:** You can also deploy to Netlify, Railway, or any platform that supports Next.js.

**For local testing:** Use ngrok (see [NGROK_SETUP.md](./NGROK_SETUP.md)) for quick testing without deploying.

## Error Handling

The app handles:
- Camera permission denied
- No camera found
- Invalid QR codes
- Duplicate scans (prevents same attendee from being scanned twice)
- Database connection errors
- Network failures when saving to Supabase

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11+)
- Mobile browsers with camera support

## License

MIT

