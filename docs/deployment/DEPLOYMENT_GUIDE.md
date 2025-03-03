# Deployment Guide

This guide provides detailed instructions for deploying the Personal Finance Dashboard application to production.

## Prerequisites

- Node.js v16.0.0 or later
- PostgreSQL (Neon Tech)
- Plaid account with production credentials
- Domain name and SSL certificate
- CI/CD platform access (GitHub Actions)

## Environment Setup

### 1. Production Environment Variables

Create a `.env.production` file:

```env
# Database Configuration (Neon Tech)
DATABASE_URL=your_production_db_url
PGUSER=your_production_db_user
PGPASSWORD=your_production_db_password
PGDATABASE=your_production_db_name
PGHOST=your_production_db_host
PGPORT=5432
PGSSLMODE=require

# Plaid API Configuration
PLAID_CLIENT_ID=your_production_plaid_client_id
PLAID_SECRET=your_production_plaid_secret
PLAID_ENV=production
PLAID_WEBHOOK_SECRET=your_production_webhook_secret

# Security Configuration
JWT_SECRET=your_production_jwt_secret
ENCRYPTION_MASTER_KEY=your_production_encryption_key

# Application Configuration
NODE_ENV=production
PORT=3000
API_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

### 2. Database Setup

1. Create production database in Neon Tech:
   ```sql
   CREATE DATABASE production_db;
   ```

2. Run migrations:
   ```bash
   NODE_ENV=production npm run migrate
   ```

3. Verify database connection:
   ```bash
   npm run verify-db
   ```

## Build Process

### 1. Frontend Build

```bash
# Install dependencies
npm install --production

# Build frontend
npm run build

# Output will be in the 'build' directory
```

### 2. Backend Build

```bash
# Compile TypeScript
npm run build:server

# Output will be in the 'dist' directory
```

## Deployment Steps

### 1. Initial Server Setup

1. Update server packages:
   ```bash
   sudo apt-get update
   sudo apt-get upgrade
   ```

2. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Install PM2:
   ```bash
   sudo npm install -g pm2
   ```

### 2. Application Deployment

1. Clone repository:
   ```bash
   git clone https://github.com/yourusername/personal-finance-dashboard.git
   cd personal-finance-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install --production
   ```

3. Build application:
   ```bash
   npm run build
   ```

4. Start application with PM2:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

### 3. Nginx Configuration

1. Install Nginx:
   ```bash
   sudo apt-get install nginx
   ```

2. Configure Nginx:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable HTTPS with Certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Production Deployment

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Run Tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy
        run: |
          # Add deployment commands here
```

## Monitoring & Logging

### 1. Application Monitoring

1. Set up PM2 monitoring:
   ```bash
   pm2 monitor
   ```

2. Configure error tracking (Sentry):
   ```javascript
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: "production"
   });
   ```

### 2. Database Monitoring

1. Set up Neon Tech monitoring
2. Configure database connection pooling
3. Monitor query performance

### 3. Log Management

1. Configure Winston logging:
   ```javascript
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' })
     ]
   });
   ```

## Backup & Recovery

### 1. Database Backups

1. Configure automated backups in Neon Tech
2. Set up backup verification
3. Test restore procedures

### 2. Application Backups

1. Back up environment configurations
2. Store secrets securely
3. Document recovery procedures

## Security Checklist

- [ ] SSL/TLS certificates installed
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting configured
- [ ] CORS policies set
- [ ] Security headers configured
- [ ] Input validation implemented
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] SQL injection prevention verified

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check connection string
   - Verify network access
   - Check SSL configuration

2. **Application Startup Issues**
   - Verify environment variables
   - Check log files
   - Verify port availability

3. **Performance Issues**
   - Monitor server resources
   - Check database query performance
   - Review application logs

## Rollback Procedures

### 1. Application Rollback

```bash
# Switch to previous version
pm2 delete all
cd /path/to/previous/version
pm2 start ecosystem.config.js --env production
```

### 2. Database Rollback

```sql
-- Revert to previous migration
npm run migrate:down
```

## Performance Optimization

### 1. Frontend Optimization

- Enable code splitting
- Implement lazy loading
- Configure caching
- Optimize images and assets

### 2. Backend Optimization

- Configure connection pooling
- Implement caching
- Optimize database queries
- Set up load balancing

## Maintenance Procedures

### 1. Regular Updates

- Update Node.js packages
- Apply security patches
- Update SSL certificates
- Review and update configurations

### 2. Monitoring & Alerts

- Set up uptime monitoring
- Configure error alerts
- Monitor resource usage
- Set up performance alerts

## Support & Documentation

### 1. Contact Information

- Technical Support: tech@yourdomain.com
- Emergency Contact: emergency@yourdomain.com
- On-Call Schedule: [Link to schedule]

### 2. Additional Resources

- [API Documentation](../api-docs.md)
- [Database Schema](../database-schema.md)
- [Troubleshooting Guide](../troubleshooting.md) 