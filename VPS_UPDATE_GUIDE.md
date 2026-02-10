# VPS Update Guide - Website Update नहीं हो रहा तो ये करें

## 🔧 Step-by-Step Fix

### 1. PM2 Stop करें
```bash
pm2 stop websevix
pm2 delete websevix
```

### 2. .next Folder Delete करें (Important!)
```bash
cd /var/www/websevix/websevix
rm -rf .next
rm -rf node_modules
```

### 3. Fresh Git Pull
```bash
git pull origin main
```

### 4. Fresh Install
```bash
npm install
```

### 5. Environment Variables Check करें
```bash
nano .env.local
```

**Required Variables:**
```
MONGODB_URI=mongodb://localhost:27017/websevix
NEXTAUTH_URL=https://websevix.com
NEXTAUTH_SECRET=your-secret-key-here
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
OPENAI_API_KEY=your-openai-api-key-here
SOCKET_SECRET=your-socket-secret
```

### 6. Build करें (Errors Check करें)
```bash
npm run build
```

**अगर build में error आए तो:**
- MongoDB running है? `sudo systemctl status mongod`
- Port 3000 free है? `lsof -i :3000`
- Node version check: `node -v` (should be 18+)

### 7. PM2 Start करें
```bash
pm2 start npm --name "websevix" -- start
pm2 save
pm2 startup
```

### 8. PM2 Logs Check करें
```bash
pm2 logs websevix
```

### 9. Nginx Restart (अगर reverse proxy use कर रहे हो)
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 10. Browser Cache Clear करें
- Hard refresh: `Ctrl + Shift + R` (Windows) या `Cmd + Shift + R` (Mac)
- या Incognito mode में check करें

## 🐛 Common Issues & Solutions

### Issue 1: Build Success but Website Not Updating
**Solution:**
```bash
# PM2 को completely restart करें
pm2 restart websevix --update-env
pm2 logs websevix --lines 50
```

### Issue 2: Port Already in Use
**Solution:**
```bash
# Check which process is using port 3000
lsof -i :3000
# Kill that process
kill -9 <PID>
# Or change port in .env.local
PORT=3001
```

### Issue 3: MongoDB Connection Error
**Solution:**
```bash
# MongoDB start करें
sudo systemctl start mongod
sudo systemctl enable mongod
# Check status
sudo systemctl status mongod
```

### Issue 4: Next.js Cache Issue
**Solution:**
```bash
# Complete cleanup
rm -rf .next
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### Issue 5: Environment Variables Not Loading
**Solution:**
```bash
# PM2 को env file explicitly दें
pm2 start npm --name "websevix" -- start --update-env
# या ecosystem.config.js use करें
```

## 📝 Quick Debug Commands

```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs websevix --lines 100

# Check if app is running
curl http://localhost:3000

# Check Nginx status
sudo systemctl status nginx

# Check MongoDB
mongo --eval "db.version()"

# Check disk space
df -h

# Check memory
free -h
```

## ✅ Success Checklist

- [ ] PM2 process running है
- [ ] Build successful है (no errors)
- [ ] MongoDB connected है
- [ ] Environment variables set हैं
- [ ] Port 3000 accessible है
- [ ] Nginx configured correctly है
- [ ] Browser cache cleared है

## 🚨 अगर अभी भी नहीं हो रहा

1. **PM2 logs check करें:**
   ```bash
   pm2 logs websevix --err
   ```

2. **Manual start करके test करें:**
   ```bash
   npm run start
   # अलग terminal में
   curl http://localhost:3000
   ```

3. **GitHub repo check करें:**
   - https://github.com/jobyojnahub-a11y/websevix
   - Latest commit check करें
   - Files properly pushed हैं?

4. **Contact me with:**
   - PM2 logs output
   - Build output
   - Error messages (if any)
