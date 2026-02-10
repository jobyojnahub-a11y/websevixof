# VPS Quick Fix - Wrong Directory Error

## Problem:
```
fatal: not a git repository (or any of the parent directories): .git
```

**Reason:** Aap home directory (`~`) me ho, project directory me nahi.

## Solution:

### Step 1: Project Directory me jao
```bash
cd /var/www/websevix/websevix
```

### Step 2: Ab sab commands yahi se run karo
```bash
# PM2 stop
pm2 stop websevix
pm2 delete websevix

# Clean
rm -rf .next
rm -rf node_modules
rm -f package-lock.json

# Git pull
git pull origin main --allow-unrelated-histories

# Conflicts resolve (agar aaye)
git checkout --theirs package.json tailwind.config.ts tsconfig.json
git add package.json tailwind.config.ts tsconfig.json
git commit -m "Resolve conflicts"

# Install
npm install --legacy-peer-deps

# Build
npm run build

# PM2 start
pm2 start ecosystem.config.js
# Ya
pm2 start npm --name "websevix" -- start

# Logs
pm2 logs websevix
```

## Important:
**Har command se pehle check karo ki aap sahi directory me ho:**
```bash
pwd
# Should show: /var/www/websevix/websevix
```
