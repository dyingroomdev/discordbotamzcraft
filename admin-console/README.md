# Amaze Gaming Admin Console

Modern admin dashboard for Discord bot management built with React, TypeScript, and Tailwind CSS.

## Features

- Discord OAuth authentication
- Guild management
- Welcome banner configuration
- Broadcast system
- XP leaderboards
- Minecraft server status
- Analytics dashboard

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Query
- **HTTP Client**: Axios
- **Icons**: Heroicons
- **UI Components**: Headless UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_BASE=http://localhost:4000
VITE_DISCORD_CLIENT_ID=your_client_id
VITE_DISCORD_REDIRECT_URI=http://localhost:3000/auth/callback
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
├── features/        # Feature-specific modules
├── layouts/         # Layout components
├── lib/             # Utilities and API client
├── pages/           # Page components
├── services/        # API services
└── styles/          # Global styles
```

## Development

- Dev server: `npm run dev` (http://localhost:3000)
- Build: `npm run build`
- Preview: `npm run preview`
- Test: `npm run test`

## API Integration

The app connects to the FastAPI backend at `http://localhost:4000/api`.

All API calls use JWT authentication stored in localStorage.

## Discord OAuth Flow

1. User clicks "Login with Discord"
2. Redirected to Discord OAuth
3. Discord redirects to `/auth/callback?code=...`
4. App exchanges code for JWT token
5. Token stored in localStorage
6. User redirected to dashboard
