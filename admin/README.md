# EduMatrix Admin App

This package contains the admin dashboard for EduMatrix Virtual Classroom.

## Tech stack

- React 18
- Vite 5
- Material UI
- Socket.IO client
- LiveKit client

## Prerequisites

- Node.js 20+
- npm 10+
- Running backend server (`server` package)

## Environment variables

Create `admin/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_LIVEKIT_URL=wss://your-livekit-url
```

## Install

```bash
npm install
```

## Run in development

```bash
npm run dev
```

Default dev URL: http://localhost:5174

## Build and preview

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## Notes

- Ensure backend CORS allows the admin origin.
- `VITE_BACKEND_URL` must point to a reachable server instance.
