# Fresh VPS Deploy Guide - New Repo

## 🚀 Fresh Start - New Repo: https://github.com/jobyojnahub-a11y/websevixof

## VPS pe Complete Fresh Setup:

### Step 1: Old Project Delete करें (अगर exists करता है)
```bash
cd /var/www/websevix
rm -rf websevix
```

### Step 2: Fresh Clone करें
```bash
cd /var/www/websevix
git clone https://github.com/jobyojnahub-a11y/websevixof.git websevix
cd websevix
```

### Step 3: Environment Variables Setup करें
```bash
nano .env.local
```

**Add these variables:**
```
MONGODB_URI=mongodb://localhost:27017/websevix
NEXTAUTH_URL=https://websevix.com
NEXTAUTH_SECRET=your-secret-key-min-32-chars-random-string
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
OPENAI_API_KEY=your-openai-api-key-here
SOCKET_SECRET=your-socket-secret-min-32-chars-random-string
```

**nano editor:**
- Variables type करें
- Save: `Ctrl + O`, `Enter`
- Exit: `Ctrl + X`

### Step 4: MongoDB Check करें
```bash
sudo systemctl status mongod
# अगर नहीं है तो:
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 5: Dependencies Install करें
```bash
npm install --legacy-peer-deps
```

### Step 6: Build करें
```bash
npm run build
```

### Step 7: PM2 Start करें
```bash
pm2 start ecosystem.config.js
# या
pm2 start npm --name "websevix" -- start
pm2 save
pm2 startup
```

### Step 8: Logs Check करें
```bash
pm2 logs websevix
```

### Step 9: Nginx Restart (अगर use कर रहे हो)
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## ✅ Success!

Website ab https://websevix.com pe accessible होगी!

## 🔄 Future Updates के लिए:

```bash
cd /var/www/websevix/websevix
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart websevix
```
