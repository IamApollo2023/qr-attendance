# Quick Start Guide

Get your QR Attendance Scanner up and running in minutes!

## Prerequisites

- Node.js 18+ installed
- A device with a camera (for testing)
- A modern browser with IndexedDB support (all modern browsers)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd qr-attendance-scanner
pnpm install
```

### 2. Run the Application

```bash
pnpm dev
```

### 3. Test It Out

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click "Start Scanning" and allow camera access
3. Point your camera at a QR code containing an attendee ID
4. Watch it get scanned and added to the list!

## Testing Without Real QR Codes

You can test the app by:
1. Generating a QR code online with any text (e.g., "ATTENDEE-001")
2. Displaying it on another device or printing it
3. Scanning it with the app

## Troubleshooting

### Camera Not Working
- Make sure you're using HTTPS in production (localhost works for development)
- Check browser permissions for camera access
- Try a different browser (Chrome/Edge recommended)

### Storage Issues
- Make sure your browser supports IndexedDB (all modern browsers do)
- Check browser storage permissions (usually automatic)
- If data isn't persisting, check if you're in private/incognito mode (some browsers restrict storage)

### Build Errors
- Make sure all dependencies are installed: `pnpm install`
- Check Node.js version: `node --version` (should be 18+)

## Next Steps

- Customize the `eventId` prop in `app/page.tsx` for different events
- Export attendance data (add export functionality if needed)
- Deploy to Vercel, Netlify, or your preferred hosting platform

## Production Deployment

Remember:
- **HTTPS is required** for camera access in production
- **No environment variables needed** - everything works out of the box
- Test on mobile devices before going live
- Data is stored per browser/device, so each user has their own attendance records

Happy scanning! 🎉

