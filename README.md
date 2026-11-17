# Party Pass — school party registration & door check-in

A small full-stack app for exactly this: students register their name + photo
ahead of time, and at the door you search their name and compare the photo on
screen to the person standing in front of you before letting them in.

- `server/` — Node/Express + MongoDB API
- `client/` — React (Vite) frontend: a public registration page (`/`) and a
  passcode-protected door check-in screen (`/admin`)

Photos are resized in the browser before upload (~50–150KB each), so 200+
registrations comfortably fit MongoDB's free tier (512MB) — no separate image
hosting service needed.

## 1. Set up the database

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user (username + password) and, under Network Access,
   allow access from anywhere (`0.0.0.0/0`) — simplest for a short-lived event.
3. Copy your connection string (Atlas → Connect → Drivers).

## 2. Deploy the backend

Any Node host works (Render's free tier is easiest):

1. Push this project to a GitHub repo.
2. On [render.com](https://render.com), New → Web Service → point it at
   `server/` as the root directory.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables (copy from `server/.env.example`):
   - `MONGODB_URI` — your Atlas connection string
   - `ADMIN_KEY` — a passcode only you and your door volunteers know
   - `CLIENT_ORIGINS` — you'll fill this in after step 3, once you have your
     frontend URL (comma-separate if you need more than one)
5. Deploy, then note your backend URL (e.g. `https://party-pass-api.onrender.com`).

## 3. Deploy the frontend

1. On [vercel.com](https://vercel.com) (or Netlify), New Project → point it at
   `client/` as the root directory. Framework preset: Vite.
2. Add environment variable `VITE_API_URL` = your backend URL from step 2.
3. Deploy, then note your frontend URL (e.g. `https://party-pass.vercel.app`).
4. Go back to Render and set `CLIENT_ORIGINS` to that frontend URL, then
   redeploy the backend so CORS allows it.

## 4. Use it

- Share the frontend URL (`https://party-pass.vercel.app`) with students — that's
  the registration form.
- At the door, open `https://party-pass.vercel.app/admin` on your own phone,
  enter the `ADMIN_KEY` passcode once (it stays unlocked for the session), and
  search each guest by name as they arrive. Their photo shows up — compare it
  to the person, tap **Check in**.
- The header shows a live "checked in / total" count.

## Local testing (optional, before you deploy)

```bash
# Terminal 1
cd server
cp .env.example .env   # fill in MONGODB_URI and ADMIN_KEY
npm install
npm run dev

# Terminal 2
cd client
cp .env.example .env   # VITE_API_URL=http://localhost:4000
npm install
npm run dev
```

## Notes on scope

- The admin passcode is a shared secret, not per-user accounts — fine for a
  one-off event with a small number of trusted volunteers checking people in,
  not meant as production-grade auth.
- There's no photo moderation — anyone with the link can submit any image.
  For a school event with a known audience this is usually fine, but worth
  knowing.
- All data lives in your own MongoDB Atlas cluster, so you can export or wipe
  it whenever you want after the event.
