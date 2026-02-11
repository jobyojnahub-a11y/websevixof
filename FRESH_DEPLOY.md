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

### Step 3: Configuration Setup करें
Environment variables ab code me hardcode hain. Agar kuch change karna ho to:

```bash
nano lib/config.ts
```

**File me yeh variables update karein:**
- `MONGODB_URI` - MongoDB connection string (password update karein)
- `NEXTAUTH_URL` - Website URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay secret
- `EMAIL_USER` - Email address
- `EMAIL_PASSWORD` - Email app password
- `OPENAI_API_KEY` - OpenAI API key (agar use ho raha ho)
- `SOCKET_SECRET` - Socket secret (agar use ho raha ho)

**nano editor:**
- Variables update करें
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
