# Quick Fix for Socket Token Issue

## Problem
Admin getting 400 error when trying to get socket token for connecting with visitors.

## Root Cause
Admin session expired or cookies missing.

## Solution

### Step 1: Complete Logout/Login
1. Go to browser settings
2. Clear all cookies for websevix.com
3. Close browser completely
4. Open fresh browser
5. Go to https://websevix.com/admin/auth
6. Login again with admin credentials

### Step 2: Test Authentication
After login, go to: https://websevix.com/api/test-auth
Should show:
```json
{
  "authenticated": true,
  "email": "admin@websevix.com",
  "role": "admin"
}
```

### Step 3: Test Connection
1. Go to https://websevix.com/admin/visitors
2. Open another browser tab as visitor: https://websevix.com
3. In admin tab, click "Connect" button
4. Should work now

## If Still Not Working

Check server logs:
```bash
pm2 logs websevix --lines 20 | grep -i "socket\|token"
```

The issue is 99% authentication - fresh login will fix it.