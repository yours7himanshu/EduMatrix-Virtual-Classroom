# EduMatrix Virtual Classroom

EduMatrix is a MERN-based virtual classroom platform with separate apps for students (`client`), administrators (`admin`), and APIs/realtime services (`server`).

![EduMatrix Home Page](assets/homepage.png)

## What it includes

- Student web app built with React + Vite
- Admin dashboard built with React + Vite
- Node.js + Express backend with MongoDB
- Live classroom features with Socket.IO and LiveKit
- Assignments, quizzes, announcements, attendance, and fee workflows

## Repository structure

```text
.
├── client/   # Student-facing frontend
├── admin/    # Admin frontend
├── server/   # Backend API + realtime + tests
└── assets/   # Project media/assets
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB instance (local or hosted)

## Quick start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yours7himanshu/EduMatrix-Virtual-Classroom.git
   cd EduMatrix-Virtual-Classroom
   ```

2. **Install dependencies**

   ```bash
   npm install --prefix server
   npm install --prefix client
   npm install --prefix admin
   ```

3. **Configure environment variables**

   - Copy `server/.env.example` to `server/.env` and fill in required values.
   - Create `client/.env` with:

     ```env
     VITE_BACKEND_URL=http://localhost:5000
     VITE_ADMIN_URL=http://localhost:5174
     ```

   - Create/update `admin/.env` with:

     ```env
     VITE_BACKEND_URL=http://localhost:5000
     VITE_LIVEKIT_URL=wss://your-livekit-url
     ```

4. **Run all services (separate terminals)**

   ```bash
   npm run dev --prefix server
   npm run dev --prefix client
   npm run dev --prefix admin
   ```

5. **Open apps**

   - Student app: http://localhost:5173
   - Admin app: http://localhost:5174
   - API server: http://localhost:5000

## Useful scripts

| Area | Command | Description |
| --- | --- | --- |
| Server | `npm run dev --prefix server` | Start backend with nodemon |
| Server | `npm test --prefix server` | Run Node.js backend tests |
| Client | `npm run dev --prefix client` | Start student app |
| Client | `npm run build --prefix client` | Build student app |
| Client | `npm run lint --prefix client` | Lint student app |
| Admin | `npm run dev --prefix admin` | Start admin app |
| Admin | `npm run build --prefix admin` | Build admin app |
| Admin | `npm run lint --prefix admin` | Lint admin app |

## Server environment variables

See `server/.env.example` for the full list. Core variables:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `STRIPE_SECRET_KEY`
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `GIMINI_API_KEY` (or `GEMINI_API_KEY`)

## Additional docs

- Contributor guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Server architecture/audit notes: [`server/docs/`](server/docs)

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

## License

Licensed under the Apache License 2.0. See [LICENSE.txt](LICENSE.txt).
