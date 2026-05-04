# 🚀 Vercel + MongoDB Atlas Deployment Guide

Complete guide to deploy your Next.js full-stack exam system.

---

## 📋 Prerequisites

1. **Vercel Account**: [vercel.com](https://vercel.com) (Sign up with GitHub)
2. **MongoDB Atlas Account**: [mongodb.com/atlas](https://mongodb.com/atlas)
3. **GitHub Account**: [github.com](https://github.com)
4. **Git installed** on your computer

---

## Step 1: Setup MongoDB Atlas

### 1.1 Create Cluster
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up / Log in
3. Click "Build a Database"
4. Choose "M0 FREE" tier
5. Select region closest to you (e.g., Mumbai for India)
6. Click "Create Cluster"

### 1.2 Configure Database Access
1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username: `admin`
5. Enter password: `YourStrongPassword123`
6. Under "Built-in Role", select **"Read and write to any database"**
7. Click "Add User"

### 1.3 Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (or add your specific IP)
4. Click "Confirm"

### 1.4 Get Connection String
1. Go to **Database** > Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://admin:YourStrongPassword123@cluster0.xxxxx.mongodb.net/mock_test_system?retryWrites=true&w=majority
   ```
4. **SAVE THIS** - you'll need it for Vercel

---

## Step 2: Update Environment Variables

### 2.1 Update .env.local
Edit `.env.local` in your project root:

```env
# MongoDB Atlas Connection (Replace with your actual connection string)
MONGODB_URI=mongodb+srv://admin:YourPassword@cluster0.xxxxx.mongodb.net/mock_test_system?retryWrites=true&w=majority

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# For Vercel deployment
NEXT_PUBLIC_VERCEL_URL=${VERCEL_URL}
```

### 2.2 Generate Strong JWT Secret
Run this in PowerShell to generate a secure key:
```powershell
# Generate random 64-character string
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

---

## Step 3: Prepare Project for Deployment

### 3.1 Create vercel.json
Create `vercel.json` in project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/uploads/(.*)",
      "dest": "/uploads/$1"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

### 3.2 Update next.config.js
Ensure `next.config.js` has:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

### 3.3 Add .gitignore
Ensure `.gitignore` includes:

```
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment (keep .env.local for now, we'll use Vercel env vars)
.env*.local

# Uploads (optional - don't commit uploaded files)
/uploads/*
!/uploads/.gitkeep

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

---

## Step 4: Push to GitHub

### 4.1 Initialize Git (if not done)
```bash
cd c:\offline-mock-test-system
git init
git add .
git commit -m "Initial commit - Next.js Exam System"
```

### 4.2 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `mock-test-system`
3. Keep it Public or Private
4. **DO NOT** initialize with README (we have our own)
5. Click "Create repository"

### 4.3 Push to GitHub
Run these commands in PowerShell:

```bash
git remote add origin https://github.com/YOUR_USERNAME/mock-test-system.git
git branch -M main
git push -u origin main
```

---

## Step 5: Deploy on Vercel

### 5.1 Import Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Click "Import Git Repository"
4. Find and select `mock-test-system`
5. Click "Import"

### 5.2 Configure Project
1. **Framework Preset**: Select "Next.js"
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: Leave default (`next build`)
4. **Output Directory**: Leave default

### 5.3 Add Environment Variables
Click "Environment Variables" and add:

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Your Atlas connection string | `mongodb+srv://admin:pass@cluster0.xxx.mongodb.net/mock_test_system?retryWrites=true&w=majority` |
| `JWT_SECRET` | Your generated secret | `aB3dE5fG7hI9jK1lM2nO3pQ4rS5tU6vW7xY8zA9bC0` |

Click "Add" for each variable.

### 5.4 Deploy
1. Click "Deploy"
2. Wait for build (2-3 minutes)
3. Once done, you'll get a URL like:
   ```
   https://mock-test-system.vercel.app
   ```

---

## Step 6: Post-Deployment Setup

### 6.1 Create Admin User
Since MongoDB is fresh, you need to create an admin user.

**Option A: Using MongoDB Atlas (Browser)**
1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Select `mock_test_system` database
4. Click `users` collection
5. Click "Insert Document"
6. Add this document:

```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "$2a$10$YourHashedPasswordHere", 
  "role": "admin",
  "batch": null,
  "exam_type": null,
  "created_at": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

**Option B: Using API Endpoint (Recommended)**
Create a script `create-admin.js`:

```javascript
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const uri = 'YOUR_ATLAS_CONNECTION_STRING';

async function createAdmin() {
  const client = new MongoClient(uri);
  await client.connect();
  
  const db = client.db('mock_test_system');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await db.collection('users').insertOne({
    name: 'Admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin',
    batch: null,
    exam_type: null,
    created_at: new Date()
  });
  
  console.log('Admin created!');
  await client.close();
}

createAdmin();
```

Run:
```bash
node create-admin.js
```

---

## Step 7: Testing Checklist

### 7.1 Test Authentication
- [ ] Open your Vercel URL
- [ ] Try admin login: `admin@example.com` / `admin123`
- [ ] Should redirect to admin dashboard

### 7.2 Test Admin Features
- [ ] Add a student (check roll number auto-generation)
- [ ] Create an exam manually
- [ ] Upload Word file with sections
- [ ] View results page

### 7.3 Test Student Features
- [ ] Login as student
- [ ] View available exams
- [ ] Start an exam
- [ ] Answer questions
- [ ] Submit exam
- [ ] Check timer works

### 7.4 Test Images
- [ ] Upload Word file with images
- [ ] Check images display in exam

---

## 🔧 Troubleshooting

### Error: "MongoDB connection failed"
**Solution**: 
1. Check IP whitelist in MongoDB Atlas (Network Access)
2. Verify connection string in Vercel env vars
3. Ensure password doesn't have special characters that need URL encoding

### Error: "JWT verification failed"
**Solution**:
1. Check JWT_SECRET is set in Vercel
2. JWT_SECRET must be same for encoding and decoding

### Error: "API route not found"
**Solution**:
1. Check that `pages/api/` folder exists
2. Ensure file names are correct (e.g., `login.js` not `Login.js`)

### Error: "Module not found"
**Solution**:
1. Run `npm install` locally
2. Ensure all dependencies are in `package.json`
3. Commit `package-lock.json`

### Error: "Upload failed"
**Solution**:
1. Vercel has read-only filesystem (except `/tmp`)
2. Modify upload to use `/tmp/uploads/` or use cloud storage
3. For production, use AWS S3 or Cloudinary for images

---

## 🌟 Production Recommendations

1. **Use Cloudinary/AWS S3** for image uploads (Vercel filesystem is temporary)
2. **Enable Vercel Analytics** for performance monitoring
3. **Set up custom domain** (Settings > Domains)
4. **Enable HTTPS** (automatic on Vercel)
5. **Configure CORS** if needed

---

## 📞 Need Help?

If deployment fails:
1. Check Vercel deployment logs (Dashboard > Project > Deployments)
2. Test locally with production build: `npm run build && npm start`
3. Verify MongoDB Atlas connection from your IP

**Your deployed app URL**: `https://mock-test-system.vercel.app`
