# ngrok Setup for Local Testing

**Note:** For production, use [Vercel deployment](./VERCEL_DEPLOY.md) instead. ngrok is only for local development/testing.

This guide will help you access your QR Attendance Scanner from your mobile phone using ngrok for **local testing only**.

## Prerequisites

1. **Sign up for ngrok** (free account works):
   - Go to [ngrok.com](https://ngrok.com) and create an account
   - Get your authtoken from the dashboard

2. **Authenticate ngrok**:
   ```bash
   npx ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
   Or if you have ngrok installed globally:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

## Quick Start

### Option 1: Automated (Recommended)

Run both Next.js and ngrok together:

```bash
pnpm dev:tunnel
```

This will:
1. Start the Next.js dev server on `http://localhost:3000`
2. Wait for the server to be ready
3. Start ngrok and create a public tunnel
4. Display the ngrok URL in the terminal

**Copy the ngrok HTTPS URL** (looks like `https://abc123.ngrok-free.app`) and open it on your mobile phone.

**Note for Windows users:** If the automated script doesn't work, see "Windows Setup" below.

### Option 2: Manual (More Control)

1. **Start Next.js dev server** (in one terminal):
   ```bash
   pnpm dev
   ```

2. **Start ngrok** (in another terminal):
   ```bash
   npx ngrok http 3000
   ```
   Or if installed globally:
   ```bash
   ngrok http 3000
   ```

3. **Copy the ngrok URL** from the terminal output and open it on your mobile device.

## Important Notes

### HTTPS Required for Camera Access

- **Camera access requires HTTPS** in production/remote access
- ngrok provides HTTPS automatically (that's why we use it!)
- The ngrok URL will be `https://` - perfect for camera access

### Mobile Browser Access

1. Make sure your phone and computer are on the **same network** (or use ngrok's public URL)
2. Open the ngrok URL in your mobile browser
3. Grant camera permissions when prompted
4. Start scanning!

### ngrok Free Tier Limitations

- Free tier provides random URLs each time
- URLs change when you restart ngrok
- For consistent URLs, consider ngrok's paid plans

### Troubleshooting

**ngrok not starting:**
- Make sure you've authenticated: `npx ngrok config add-authtoken YOUR_TOKEN`
- Check if port 3000 is already in use

**Camera not working on mobile:**
- Make sure you're using the **HTTPS** ngrok URL (not HTTP)
- Check browser permissions on your phone
- Try a different mobile browser (Chrome recommended)

**Connection refused:**
- Make sure Next.js dev server is running on port 3000
- Check firewall settings
- Verify the ngrok URL is correct

**Safari can't connect / "Couldn't connect to server":**
- **ngrok free tier warning page** - Safari on iOS blocks this by default
- **Solution 1:** Bypass the warning page by adding this to your ngrok command:
  ```bash
  ngrok http 3000 --request-header-add "ngrok-skip-browser-warning: true"
  ```
- **Solution 2:** Use ngrok config file to always skip warnings:
  Create/edit `~/.ngrok2/ngrok.yml` (or `%USERPROFILE%\.ngrok2\ngrok.yml` on Windows):
  ```yaml
  version: "2"
  authtoken: YOUR_AUTH_TOKEN
  tunnels:
    default:
      proto: http
      addr: 3000
      request_header:
        add:
          - "ngrok-skip-browser-warning: true"
  ```
  Then run: `ngrok start default`
- **Solution 3:** Try Chrome or Firefox on your phone instead of Safari
- **Solution 4:** On the ngrok warning page, tap "Visit Site" button (if it appears)

## Windows Setup (If Automated Script Fails)

The ngrok npm package sometimes has issues on Windows. Here are reliable alternatives:

### Method 1: Download ngrok Directly (Recommended for Windows)

1. **Download ngrok:**
   - Go to [https://ngrok.com/download](https://ngrok.com/download)
   - Download the Windows version (ZIP file)
   - Extract the `ngrok.exe` file

2. **Add to PATH or place in project:**
   - **Option A:** Add `ngrok.exe` to your system PATH
   - **Option B:** Place `ngrok.exe` in your project root folder

3. **Configure authtoken:**
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

4. **Run manually:**
   - Terminal 1: `pnpm dev`
   - Terminal 2: `ngrok http 3000`

### Method 2: Use Chocolatey (If Installed)

```bash
choco install ngrok
ngrok config add-authtoken YOUR_AUTH_TOKEN
ngrok http 3000
```

### Method 3: Use Scoop (If Installed)

```bash
scoop install ngrok
ngrok config add-authtoken YOUR_AUTH_TOKEN
ngrok http 3000
```

## Alternative: Use Your Local Network IP

If you're on the same WiFi network, you can also access via your local IP:

1. Find your computer's local IP:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
   
2. Start Next.js with hostname binding:
   ```bash
   next dev -H 0.0.0.0
   ```

3. Access from mobile: `http://YOUR_LOCAL_IP:3000`

**Note:** This won't work for camera access (needs HTTPS), but ngrok solves that!

## Production Alternative

For production, deploy to:
- **Vercel** (recommended for Next.js) - automatic HTTPS
- **Netlify** - automatic HTTPS
- Any hosting with HTTPS support

