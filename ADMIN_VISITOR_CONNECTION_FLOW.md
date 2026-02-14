# Admin-Visitor Connection Flow - Complete Process

## 📋 Overview
Yeh document explain karta hai ki admin kaise visitor ke saath connect hota hai aur chat kaise kaam karta hai.

---

## 🔄 Complete Flow (Step by Step)

### **STEP 1: Visitor Website Pe Aata Hai**
```
Visitor → Website Open Karta Hai
         ↓
Browser me FloatingChatWidget load hota hai
         ↓
LocalStorage se sessionId check hota hai (agar nahi hai to naya banata hai)
         ↓
Socket.io connection establish hota hai (visitor ke liye token nahi chahiye)
```

**Code Location:** `components/chat/FloatingChatWidget.tsx`

---

### **STEP 2: Visitor Tracking**
```
Visitor socket connection establish karta hai
         ↓
Socket emit karta hai: "visitor_connected" event
         ↓
Server receive karta hai aur database me VisitorSession save/update karta hai
         ↓
Server emit karta hai: "new_visitor" event → Admin room ko
```

**Code Location:** `pages/api/socket.ts` (line 50-94)

**Database:** `VisitorSession` model me save hota hai:
- sessionId
- visitorId  
- currentPage
- lastActivity
- status (active/idle)

---

### **STEP 3: Admin Dashboard Pe Visitors Dikhte Hain**
```
Admin → /admin/visitors page open karta hai
         ↓
Frontend fetch karta hai: GET /api/admin/visitors
         ↓
API route check karta hai: Admin authenticated hai ya nahi
         ↓
Database se active visitors fetch karte hain (last 30 minutes)
         ↓
Frontend me list render hoti hai
```

**Code Location:** 
- Frontend: `app/admin/visitors/page.tsx`
- API: `app/api/admin/visitors/route.ts`

**Data Structure:**
```javascript
{
  sessionId: "abc123",
  currentPage: "/pricing",
  status: "active",
  lastActivity: "2024-01-01T10:00:00Z",
  timeOnSite: 120 // seconds
}
```

---

### **STEP 4: Admin "Connect" Button Click Karta Hai**
```
Admin clicks "Connect" button
         ↓
connectWithVisitor() function call hota hai
```

**Code Location:** `app/admin/visitors/page.tsx` (line 80)

---

### **STEP 5: Socket Token Fetch (YAHI ISSUE HAI)**
```
Frontend → GET /api/socket/token
         ↓
API route me:
  1. getToken() se NextAuth token fetch hota hai
  2. Token me se extract karte hain:
     - email
     - role (admin/client)
     - sub (user ID)
     - name
  3. Agar sub/role missing hai:
     → Database se User fetch karte hain (email se)
     → Missing fields set karte hain
  4. signSocketToken() se JWT token generate karte hain
         ↓
Response: { ok: true, token: "jwt_token_here", role: "admin" }
```

**Code Location:** `app/api/socket/token/route.ts`

**Current Issue:** Token me `sub` (user ID) ya `role` missing hai, isliye 400 error aa raha hai.

**Fix:** Database se fetch kar rahe hain agar token me missing ho.

---

### **STEP 6: Socket Connection Establish**
```
Frontend → getSocket({ token: "jwt_token" })
         ↓
Socket.io client connect hota hai server se
         ↓
Server verify karta hai token ko (verifySocketToken)
         ↓
Socket join karta hai: "admin-room" me
```

**Code Location:**
- Client: `lib/socket/client.ts`
- Server: `pages/api/socket.ts` (line 25-48)

---

### **STEP 7: Admin Connection Request Send Karta Hai**
```
Admin socket emit karta hai: "admin_connect_request"
         ↓
Data: {
  visitorSessionId: "abc123",
  message: "Our admin wants to connect with you..."
}
         ↓
Server receive karta hai aur forward karta hai visitor ko
```

**Code Location:**
- Frontend: `app/admin/visitors/page.tsx` (line 119)
- Server: `pages/api/socket.ts` (admin_connect_request handler)

---

### **STEP 8: Visitor Ko Popup Dikhta Hai**
```
Server emit karta hai visitor ko: "connection_request" event
         ↓
Visitor ke FloatingChatWidget me listener hai
         ↓
Popup show hota hai:
  - Message: "Our admin wants to connect with you..."
  - Buttons: "Accept" / "Decline"
```

**Code Location:** `components/chat/FloatingChatWidget.tsx` (line 34-105)

**UI:** Custom popup with Accept/Decline buttons

---

### **STEP 9: Visitor Response**
```
Visitor clicks "Accept" button
         ↓
Frontend emit karta hai: "connection_response"
         ↓
Data: {
  visitorSessionId: "abc123",
  accepted: true
}
         ↓
Frontend emit karta hai: "join_visitor_chat"
         ↓
Chat window open hota hai visitor ke liye
```

**Code Location:** `components/chat/FloatingChatWidget.tsx` (line 90-99)

---

### **STEP 10: Admin Ko Response Milta Hai**
```
Server forward karta hai admin ko: "visitor_connection_response"
         ↓
Admin ke frontend me listener hai
         ↓
Agar accepted:
  → Alert: "✅ Visitor accepted! Opening chat..."
  → openChatWindow() call hota hai
  → /admin/chat/[sessionId] page open hota hai
```

**Code Location:** `app/admin/visitors/page.tsx` (line 125-139)

---

### **STEP 11: Chat Interface Open Hota Hai**
```
Admin → /admin/chat/[sessionId] page
         ↓
Frontend:
  1. Socket connection establish (admin token se)
  2. "join_visitor_chat" emit karta hai
  3. Previous messages fetch karta hai (agar hain)
  4. Real-time message listeners setup karta hai
```

**Code Location:** `app/admin/chat/[sessionId]/page.tsx`

---

### **STEP 12: Real-Time Messaging**
```
Admin types message → "send_message" emit
         ↓
Server receive karta hai
         ↓
Message save hota hai database me (agar conversation model use ho)
         ↓
Server emit karta hai visitor ko: "receive_message"
         ↓
Visitor ke chat me message dikhta hai
```

**Vice Versa:**
```
Visitor types message → "send_visitor_message" emit
         ↓
Server receive karta hai
         ↓
Server emit karta hai admin ko: "receive_message"
         ↓
Admin ke chat me message dikhta hai
```

**Code Location:**
- Server: `pages/api/socket.ts` (send_message, send_visitor_message handlers)
- Admin Chat: `app/admin/chat/[sessionId]/page.tsx`
- Visitor Chat: `components/chat/FloatingChatWidget.tsx`

---

## 🔑 Key Components

### **1. Socket Token System**
- **Purpose:** Admin ko authenticate karne ke liye
- **Flow:** NextAuth session → JWT token → Socket connection
- **Issue:** Token me `sub` (user ID) missing ho sakta hai
- **Fix:** Database se fetch karte hain agar missing ho

### **2. Visitor Session**
- **Purpose:** Anonymous visitors ko track karna
- **Storage:** LocalStorage me sessionId
- **Database:** VisitorSession model

### **3. Socket Rooms**
- **`admin-room`:** Sab admins join karte hain
- **`identity:admin:userId`:** Specific admin ke liye
- **`identity:visitor:sessionId`:** Specific visitor ke liye

### **4. Events Flow**
```
Admin → "admin_connect_request" → Server → Visitor
Visitor → "connection_response" → Server → Admin
Admin → "send_message" → Server → Visitor
Visitor → "send_visitor_message" → Server → Admin
```

---

## 🐛 Current Issue & Fix

### **Problem:**
```
GET /api/socket/token → 400 Error
Reason: Token me `sub` (user ID) ya `role` missing hai
```

### **Solution:**
1. Token se email extract karte hain
2. Database se User fetch karte hain (email se)
3. Missing fields (sub, role, name) set karte hain
4. Socket token generate karte hain

**Code:** `app/api/socket/token/route.ts` (line 61-96)

---

## 📊 Database Models

### **VisitorSession**
```javascript
{
  sessionId: String,
  visitorId: String,
  currentPage: String,
  status: String, // active/idle
  lastActivity: Date,
  connectedWithAdmin: Boolean
}
```

### **User**
```javascript
{
  _id: ObjectId,
  email: String,
  fullName: String,
  role: String, // admin/client
  passwordHash: String
}
```

### **Conversation** (Optional - direct chat me use nahi hota)
```javascript
{
  conversationId: String,
  visitorSessionId: String,
  adminId: String,
  status: String
}
```

---

## 🎯 Summary

1. **Visitor aata hai** → Socket connect → Database me save
2. **Admin dashboard** → Visitors list dekhta hai
3. **Admin "Connect" click** → Socket token fetch → Socket connect
4. **Admin request send** → Visitor ko popup dikhta hai
5. **Visitor accept** → Chat open hota hai dono ke liye
6. **Real-time messaging** → Messages dono ko dikhte hain

**Current Fix:** Token me missing fields database se fetch kar rahe hain.
