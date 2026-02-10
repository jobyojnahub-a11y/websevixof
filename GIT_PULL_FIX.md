# Git Pull Fix - Unrelated Histories Error

## Problem:
```
fatal: refusing to merge unrelated histories
```

## Solution Options:

### Option 1: Allow Unrelated Histories (Recommended)
```bash
git pull origin main --allow-unrelated-histories
```

Agar conflicts aaye to:
```bash
# Conflicts resolve करें
git add .
git commit -m "Merge remote changes"
```

### Option 2: Force Pull (अगर local changes important नहीं हैं)
```bash
# Warning: यह local changes को overwrite कर देगा!
git fetch origin
git reset --hard origin/main
```

### Option 3: Stash Local Changes (अगर local changes save करनी हैं)
```bash
git stash
git pull origin main --allow-unrelated-histories
git stash pop
```

## Complete VPS Update Process:

```bash
# 1. Current directory check
cd /var/www/websevix/websevix

# 2. PM2 stop
pm2 stop websevix
pm2 delete websevix

# 3. .next और node_modules delete
rm -rf .next
rm -rf node_modules

# 4. Git pull with allow-unrelated-histories
git pull origin main --allow-unrelated-histories

# 5. अगर conflicts aaye तो:
git add .
git commit -m "Merge remote changes"

# 6. Fresh install
npm install

# 7. Build
npm run build

# 8. PM2 start
pm2 start ecosystem.config.js
# या
pm2 start npm --name "websevix" -- start

# 9. Logs check
pm2 logs websevix
```
