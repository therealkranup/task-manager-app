# Task Manager App - Deployment Setup

## 🚀 Your App URLs

- **Frontend (Vercel):** https://task-manager-app-blush-nine.vercel.app
- **Backend (Render):** https://task-manager-app-tpdd.onrender.com

## 🔧 Required Setup: Supabase Authentication

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Choose organization and enter project details
5. Wait for project to be created (2-3 minutes)

### Step 2: Get Supabase Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 3: Configure Backend (Render)
1. Go to [render.com](https://render.com) → Your project
2. Go to **Environment** tab
3. Add these environment variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJ...your-anon-key
   NODE_ENV=production
   ```
4. Click **Save Changes**
5. Render will automatically redeploy

### Step 4: Configure Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com) → Your project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:
   ```
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJ...your-anon-key
   ```
4. Click **Save**
5. Go to **Deployments** → **Redeploy** latest deployment

## ✅ Test Your App

1. Visit: https://task-manager-app-blush-nine.vercel.app
2. Click "Sign Up" to create an account
3. Create your first task!
4. Test all features: create, edit, delete, mark complete

## 🎯 Features Available

- ✅ User authentication (sign up/login)
- ✅ Create tasks with title and description
- ✅ Mark tasks as complete/incomplete
- ✅ Edit task details
- ✅ Delete tasks
- ✅ Task statistics
- ✅ Responsive design

## 🔄 Data Storage

- **Current:** In-memory storage (data resets when Render restarts)
- **For Production:** Consider migrating to Supabase PostgreSQL

## 🆘 Troubleshooting

- **502 Error:** Check Render logs for backend issues
- **Auth Issues:** Verify Supabase credentials are correct
- **API Errors:** Check if backend URL is correct in frontend
