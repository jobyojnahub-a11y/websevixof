# VPS Complete Setup Guide - Step by Step

## 🚀 Starting से Complete Setup

### Step 1: VPS pe Login करें
```bash
ssh root@your-vps-ip
```

### Step 2: Project Directory में जाएं
```bash
cd /var/www/websevix/websevix
```

### Step 3: PM2 Stop करें (अगर running है)
```bash
pm2 stop websevix
pm2 delete websevix
```

### Step 4: Old Files Clean करें (IMPORTANT!)
```bash
# .next folder delete करें (Next.js cache)
rm -rf .next

# node_modules delete करें
rm -rf node_modules

# package-lock.json delete करें (optional, fresh install के लिए)
rm -f package-lock.json
```

### Step 5: Git Status Check करें
```bash
git status
```

### Step 6: Git Pull करें (Unrelated Histories के साथ)
```bash
git pull origin main --allow-unrelated-histories
```

### Step 7: अगर Conflicts आए तो Resolve करें
```bash
# Sabhi conflicted files को GitHub version से replace करें
git checkout --theirs package.json
git checkout --theirs tailwind.config.ts
git checkout --theirs tsconfig.json

# Add और commit करें
git add package.json tailwind.config.ts tsconfig.json
git commit -m "Resolve merge conflicts"
```

### Step 8: Environment Variables Check करें
```bash
# .env.local file check करें
cat .env.local

# अगर file नहीं है तो create करें
nano .env.local
```

**Required Environment Variables:**
```
MONGODB_URI=mongodb://localhost:27017/websevix
NEXTAUTH_URL=https://websevix.com
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
OPENAI_API_KEY=your-openai-api-key-here
SOCKET_SECRET=your-socket-secret-min-32-chars
```

**nano editor में:**
- Type करें variables
- Save: `Ctrl + O`, `Enter`
- Exit: `Ctrl + X`

### Step 9: MongoDB Check करें
```bash
# MongoDB running है?
sudo systemctl status mongod

# अगर नहीं है तो start करें
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 10: Node Version Check करें
```bash
node -v
# Should be 18.x or 20.x

# अगर नहीं है तो install करें
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 11: npm Install करें
```bash
npm install
```

**अगर error आए:**
```bash
# Legacy peer deps के साथ try करें
npm install --legacy-peer-deps
```

### Step 12: Build करें
```bash
npm run build
```

**अगर build में error आए:**
- Error message copy करें
- MongoDB connection check करें
- Environment variables check करें

### Step 13: PM2 Start करें
```bash
# Option 1: ecosystem.config.js use करें
pm2 start ecosystem.config.js

# Option 2: Direct npm start
pm2 start npm --name "websevix" -- start

# PM2 save करें
pm2 save

# PM2 startup (server restart पर auto-start)
pm2 startup
```

### Step 14: PM2 Logs Check करें
```bash
pm2 logs websevix
```

**अगर errors दिखें:**
- MongoDB connection error → MongoDB start करें
- Port already in use → `lsof -i :3000` और kill करें
- Environment variables missing → `.env.local` check करें

### Step 15: Nginx Restart (अगर reverse proxy use कर रहे हो)
```bash
# Nginx config test करें
sudo nginx -t

# Nginx restart करें
sudo systemctl restart nginx
```

### Step 16: Website Check करें
```bash
# Local check
curl http://localhost:3000

# Browser में check करें
# https://websevix.com
```

## 🔧 Common Issues & Fixes

### Issue 1: Git Pull Error - Unrelated Histories
```bash
git pull origin main --allow-unrelated-histories
```

### Issue 2: Merge Conflicts
```bash
# Sabhi conflicts resolve करें
git checkout --theirs package.json
git checkout --theirs tailwind.config.ts
git checkout --theirs tsconfig.json
git add .
git commit -m "Resolve conflicts"
```

### Issue 3: npm Install Error
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue 4: Build Error - MongoDB Connection
```bash
# MongoDB start करें
sudo systemctl start mongod
# Build फिर से करें
npm run build
```

### Issue 5: Port Already in Use
```bash
# Check which process is using port 3000
lsof -i :3000
# Kill that process
kill -9 <PID>
# या .env.local में PORT change करें
```

### Issue 6: PM2 Not Starting
```bash
# PM2 logs check करें
pm2 logs websevix --err

# Manual start करके test करें
npm run start
# अलग terminal में
curl http://localhost:3000
```

## ✅ Success Checklist

- [ ] Git pull successful
- [ ] No merge conflicts
- [ ] .env.local file exists with all variables
- [ ] MongoDB running
- [ ] Node.js 18+ installed
- [ ] npm install successful
- [ ] npm run build successful (no errors)
- [ ] PM2 process running
- [ ] PM2 logs show no errors
- [ ] Website accessible on browser

## 📝 Quick Commands Reference

```bash
# Git
cd /var/www/websevix/websevix
git pull origin main --allow-unrelated-histories
git checkout --theirs package.json

# Clean
rm -rf .next node_modules

# Install & Build
npm install
npm run build

# PM2
pm2 stop websevix
pm2 delete websevix
pm2 start ecosystem.config.js
pm2 logs websevix

# MongoDB
sudo systemctl status mongod
sudo systemctl start mongod

# Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## 🆘 अगर अभी भी Problem है

1. **PM2 logs share करें:**
   ```bash
   pm2 logs websevix --lines 50
   ```

2. **Build output share करें:**
   ```bash
   npm run build 2>&1 | tee build.log
   cat build.log
   ```

3. **Git status check करें:**
   ```bash
   git status
   ```

4. **Environment variables check करें:**
   ```bash
   cat .env.local
   ```
