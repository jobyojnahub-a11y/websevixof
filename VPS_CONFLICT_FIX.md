# VPS Package.json Conflict Fix

## Quick Fix Commands:

```bash
# 1. Conflict resolve - GitHub version use करें
cd /var/www/websevix/websevix
git checkout --theirs package.json

# 2. Add और commit करें
git add package.json
git commit -m "Resolve package.json conflict"

# 3. npm install
npm install

# 4. Build करें
npm run build
```

## Alternative: Manual Fix

अगर `--theirs` काम नहीं करे तो:

```bash
# 1. package.json देखें
cat package.json

# 2. nano से edit करें
nano package.json

# 3. Conflict markers (<<<<<<, ======, >>>>>>) delete करें
# सिर्फ correct JSON content रखें

# 4. Save: Ctrl+O, Enter, Ctrl+X

# 5. Add और commit
git add package.json
git commit -m "Resolve package.json conflict"
```

## Complete Process:

```bash
cd /var/www/websevix/websevix

# PM2 stop
pm2 stop websevix
pm2 delete websevix

# Clean
rm -rf .next
rm -rf node_modules

# Conflict resolve
git checkout --theirs package.json
git add package.json
git commit -m "Resolve package.json conflict"

# Install
npm install

# Build
npm run build

# PM2 start
pm2 start ecosystem.config.js
# या
pm2 start npm --name "websevix" -- start

# Logs
pm2 logs websevix
```
