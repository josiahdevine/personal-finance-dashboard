# Security Guide

This document outlines the security measures and best practices implemented in the Personal Finance Dashboard application.

## Overview

Our application handles sensitive financial data and requires robust security measures. This guide details our security implementation and best practices.

## Authentication & Authorization

### 1. JWT Authentication

```javascript
// JWT Configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256'
};

// Token Generation
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};

// Token Verification Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 2. Role-Based Access Control (RBAC)

```javascript
const roles = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer'
};

const permissions = {
  READ_TRANSACTIONS: 'read:transactions',
  WRITE_TRANSACTIONS: 'write:transactions',
  MANAGE_ACCOUNTS: 'manage:accounts',
  ADMIN_PANEL: 'admin:panel'
};

const rolePermissions = {
  [roles.ADMIN]: [
    permissions.READ_TRANSACTIONS,
    permissions.WRITE_TRANSACTIONS,
    permissions.MANAGE_ACCOUNTS,
    permissions.ADMIN_PANEL
  ],
  [roles.USER]: [
    permissions.READ_TRANSACTIONS,
    permissions.WRITE_TRANSACTIONS,
    permissions.MANAGE_ACCOUNTS
  ],
  [roles.VIEWER]: [
    permissions.READ_TRANSACTIONS
  ]
};
```

## Data Encryption

### 1. Database Encryption

```javascript
// Encryption Configuration
const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 64
};

// Encryption Utility
const encrypt = (text) => {
  const iv = crypto.randomBytes(encryptionConfig.ivLength);
  const salt = crypto.randomBytes(encryptionConfig.saltLength);
  const key = crypto.pbkdf2Sync(
    process.env.ENCRYPTION_MASTER_KEY,
    salt,
    100000,
    encryptionConfig.keyLength,
    'sha512'
  );

  const cipher = crypto.createCipheriv(encryptionConfig.algorithm, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    tag: tag.toString('hex')
  };
};
```

### 2. Sensitive Data Handling

```javascript
// Plaid Token Encryption
const encryptPlaidToken = async (token) => {
  const encrypted = encrypt(token);
  return encrypted;
};

// Database Storage
const storeEncryptedToken = async (userId, encryptedToken) => {
  const query = `
    INSERT INTO plaid_tokens (user_id, encrypted_token, iv, salt, tag)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await db.query(query, [
    userId,
    encryptedToken.encrypted,
    encryptedToken.iv,
    encryptedToken.salt,
    encryptedToken.tag
  ]);
};
```

## API Security

### 1. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', limiter);
```

### 2. CORS Configuration

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

### 3. Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.plaid.com"]
  }
}));
```

## Input Validation

### 1. Request Validation

```javascript
const { body, validationResult } = require('express-validator');

const validateTransaction = [
  body('amount').isNumeric(),
  body('date').isISO8601(),
  body('description').trim().isLength({ min: 1, max: 255 }),
  body('category').isIn(['income', 'expense']),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### 2. SQL Injection Prevention

```javascript
// Using Parameterized Queries
const getTransactions = async (userId, startDate, endDate) => {
  const query = `
    SELECT * FROM transactions
    WHERE user_id = $1
    AND date BETWEEN $2 AND $3
  `;
  return db.query(query, [userId, startDate, endDate]);
};
```

## Error Handling

### 1. Secure Error Responses

```javascript
// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    requestId: req.id
  });

  // Send response
  res.status(err.status || 500).json({
    error: {
      message: isProduction ? 'An unexpected error occurred' : err.message,
      code: err.code || 'INTERNAL_ERROR',
      requestId: req.id
    }
  });
};
```

### 2. Audit Logging

```javascript
const winston = require('winston');

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'audit.log' })
  ]
});

const logAuditEvent = (userId, action, details) => {
  auditLogger.info({
    timestamp: new Date().toISOString(),
    userId,
    action,
    details
  });
};
```

## Security Best Practices

### 1. Password Handling

```javascript
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
```

### 2. Session Management

```javascript
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

## Security Monitoring

### 1. Activity Monitoring

```javascript
const monitorActivity = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userId: req.user?.id
    });
  });
  
  next();
};
```

### 2. Threat Detection

```javascript
const detectThreats = (req, res, next) => {
  // Check for suspicious patterns
  const suspicious = [
    /union\s+select/i,
    /exec\s+xp/i,
    /<script>/i
  ];

  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);

  if (suspicious.some(pattern => pattern.test(body) || pattern.test(query))) {
    logAuditEvent(req.user?.id, 'THREAT_DETECTED', {
      ip: req.ip,
      path: req.path
    });
    return res.status(400).json({ error: 'Invalid request' });
  }

  next();
};
```

## Security Checklist

- [ ] Enable HTTPS only
- [ ] Implement proper authentication
- [ ] Set up RBAC
- [ ] Configure security headers
- [ ] Implement rate limiting
- [ ] Set up input validation
- [ ] Configure error handling
- [ ] Enable audit logging
- [ ] Implement encryption
- [ ] Configure CORS properly
- [ ] Set up monitoring
- [ ] Regular security updates
- [ ] Penetration testing
- [ ] Security training

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://nodejs.org/en/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Plaid Security Documentation](https://plaid.com/docs/security/) 