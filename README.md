# Poll Voting App (JavaScript)

React + Vite frontend and Express + MongoDB backend, written in JavaScript (JSX for React).

## Requirements
- Node.js 18 or newer
- MongoDB Atlas account (or local MongoDB)

## Configure environment
1. Copy `server/.env.example` to `server/.env`. Set `MONGODB_URI` and a strong `JWT_SECRET`.
2. Copy `client/.env.example` to `client/.env`. For local development keep `VITE_API_URL=http://localhost:5000/api`.
3. In MongoDB Atlas, create a database user and allow your development IP address. Never commit `.env` files.

## Run backend
```powershell
cd server
npm install
npm run dev
```

## Run frontend (open a second terminal from the project root)
```powershell
cd client
npm install
npm run dev
```

## Deployment
- Render backend Root Directory: `server`; Build Command: `npm install`; Start Command: `npm start`. Add `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` environment variables.
- Vercel frontend Root Directory: `client`; Build Command: `npm run build`; Output Directory: `dist`; set `VITE_API_URL` to `https://YOUR-RENDER-SERVICE.onrender.com/api`.
- After deployment, set `CLIENT_ORIGIN` in Render to the actual Vercel URL.
