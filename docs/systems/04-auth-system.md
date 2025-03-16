# Authentication System (Immune System)

## Auth Flow
```
/server/middleware/auth.js
↓
/server/routes/auth.js
↓
/server/models/User.js
```

## Context Management Flow
```
/contexts/AuthContext.js:AuthProvider()
↓
/contexts/AuthContext.js:useAuth()
↓
/contexts/AuthContext.js:logout()
```