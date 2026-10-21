# VoltFix Production Cloud Deployment Guide

This guide walks you step-by-step through deploying **VoltFix** to the cloud using the recommended, modern, free-tier-friendly stack:

```
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│     Frontend (Vercel)           │ ───> │   Backend API (Render.com)      │
│  React + Vite + Leaflet + PWA   │ <─── │ Node.js + Express + Socket.io   │
└─────────────────────────────────┘      └────────────────┬────────────────┘
                                                          │
                                                          ▼
                                         ┌─────────────────────────────────┐
                                         │   Cloud MySQL Database          │
                                         │   Aiven / Railway / PlanetScale │
                                         └─────────────────────────────────┘
```

---

## Step 1: Push Code to GitHub

If you haven't pushed your code to GitHub yet:
1. Create a new repository on [GitHub](https://github.com/new) (e.g. `voltfix`).
2. In your terminal on your PC:
   ```bash
   git init
   git add .
   git commit -m "feat: complete VoltFix production build"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/voltfix.git
   git push -u origin main
   ```

---

## Step 2: Set Up a Free Cloud MySQL Database

VoltFix requires a MySQL database. Choose any free cloud provider:

### Option A: Aiven for MySQL (Recommended - Free Tier)
1. Go to [aiven.io](https://aiven.io) and create a free account.
2. Create a new service: select **MySQL** (Free plan available in select regions).
3. Once provisioned, copy the **Service URI** connection string:
   ```text
   mysql://avnadmin:PASSWORD@mysql-xxxx.aivencloud.com:PORT/defaultdb?ssl-mode=REQUIRED
   ```

### Option B: Railway MySQL
1. Go to [railway.app](https://railway.app).
2. Click **New Project** → **Provision MySQL**.
3. Under the database **Variables** tab, copy `MYSQL_URL`.

---

## Step 3: Deploy the Backend API (Render.com)

Render supports Node.js WebSockets (Socket.io) out of the box on its free tier.

1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** → select **Web Service**.
3. Connect your GitHub `voltfix` repository.
4. Fill in the service configuration:
   - **Name**: `voltfix-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build && npx prisma db push
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
5. Click **Advanced** → **Add Environment Variables**:

| Variable | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Render standard port |
| `DATABASE_URL` | `mysql://...` *(from Step 2)* | Your cloud MySQL connection string |
| `JWT_ACCESS_SECRET` | *(Random 32+ character string)* | e.g. `v0ltf1x_s3cr3t_jwt_acc3ss_k3y_9921_prod` |
| `JWT_REFRESH_SECRET` | *(Random 32+ character string)* | e.g. `v0ltf1x_s3cr3t_jwt_r3fr3sh_k3y_8812_prod` |
| `CLIENT_URL` | `https://voltfix.vercel.app` *(update after Step 4)* | Allowed CORS origin |
| `ENABLE_PAYMENTS` | `true` | Enables billing system |

6. Click **Create Web Service**.
7. Once deployed, Render will provide a public URL like:
   👉 `https://voltfix-api.onrender.com`

---

## Step 4: Deploy the Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your `voltfix` repository.
4. In the project setup screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Open **Environment Variables** and add:

| Key | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://voltfix-api.onrender.com/api` | Your Render backend URL + `/api` |
| `VITE_SOCKET_URL` | `https://voltfix-api.onrender.com` | Your Render backend URL (for Socket.io) |

6. Click **Deploy**.
7. Vercel will build and assign you a free production domain, e.g.:
   👉 `https://voltfix.vercel.app`

---

## Step 5: Final Cross-Origin Sync

Now that your frontend has a live URL (e.g. `https://voltfix.vercel.app`):
1. Go back to your [Render.com](https://render.com) Dashboard → `voltfix-api` → **Environment**.
2. Update `CLIENT_URL` to your exact Vercel URL:
   ```text
   CLIENT_URL = https://voltfix.vercel.app
   ```
3. Click **Save Changes** (Render will automatically redeploy the backend in ~30 seconds).

---

## Step 6: Seed Initial Demo Data (Optional)

To populate certified electricians, verified reviews, and demo bookings in your cloud database:
1. In your Render Dashboard, click the **Shell** tab for `voltfix-api`.
2. Run:
   ```bash
   npx prisma db seed
   ```
3. All verified electricians in Dhaka, categories, and test user accounts will be populated!
