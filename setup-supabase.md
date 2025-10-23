# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `task-manager-app` (or any name you prefer)
   - Database Password: Create a strong password
   - Region: Choose closest to your location
5. Click "Create new project"
6. Wait for the project to be set up (usually takes 1-2 minutes)

## Step 2: Get Your Credentials

1. Once your project is ready, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Update Environment Files

### Backend (.env)
Update `/backend/.env`:
```bash
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key-here
```

### Frontend (.env.local)
Update `/frontend/.env.local`:
```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...your-anon-key-here
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## Step 4: Test Authentication

1. Start your backend: `cd backend && npm start`
2. Start your frontend: `cd frontend && npm start`
3. Open `http://localhost:3000`
4. Try creating an account and logging in

## Troubleshooting

- **"Invalid API key"**: Double-check your Supabase URL and anon key
- **"Failed to fetch tasks"**: Make sure your backend is running on port 5000
- **CORS errors**: Ensure your Supabase project allows your frontend URL

## Security Notes

- The anon key is safe to use in frontend code
- User authentication is handled by Supabase
- Tasks are automatically scoped to the authenticated user
- Never commit your `.env` files to version control
