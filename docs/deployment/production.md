# Production Deployment Guide

## Overview
This guide covers the deployment process for the Personal Finance Dashboard application to production environments.

## Prerequisites
- Node.js v18 or higher
- Access to production environment credentials
- Docker installed (optional)
- Access to Neon Tech DB dashboard
- Firebase project configuration
- Plaid API credentials

## Environment Setup

### Environment Variables
Create a `.env.production` file:
```env
# Database
DATABASE_URL=your_neon_db_url
DATABASE_SSL=true

# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Plaid
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=production

# Application
NODE_ENV=production
API_URL=https://your-api-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

## Build Process

### Frontend Build
```bash
# Install dependencies
npm install

# Build frontend
npm run build:prod

# Output will be in the 'dist' directory
```

### Backend Build
```bash
# Build backend
npm run build:server

# Output will be in the 'dist-server' directory
```

## Database Migration

### Production Database Setup
1. Create production database in Neon Tech
2. Run migrations:
```bash
npm run migrate:prod
```

### Data Seeding (if required)
```bash
npm run seed:prod
```

## Deployment Steps

### Manual Deployment
1. Build the application
2. Upload to production server
3. Install dependencies
4. Run database migrations
5. Start the application

### Docker Deployment
```bash
# Build Docker image
docker build -t personal-finance-dashboard:prod .

# Run container
docker run -d \
  --name personal-finance-dashboard \
  -p 3000:3000 \
  --env-file .env.production \
  personal-finance-dashboard:prod
```

### CI/CD Pipeline
The application uses GitHub Actions for automated deployment:
1. Push to main branch triggers deployment
2. Tests run automatically
3. Build process starts
4. Deployment to production if all checks pass

## Monitoring & Logging

### Application Monitoring
- Set up New Relic monitoring
- Configure error tracking with Sentry
- Set up performance monitoring

### Log Management
- Configure log aggregation
- Set up log rotation
- Enable error alerting

## Security Measures

### SSL/TLS Configuration
- Enable HTTPS
- Configure SSL certificates
- Set up automatic renewal

### Firewall Rules
- Configure network access
- Set up IP whitelisting
- Enable DDoS protection

## Backup & Recovery

### Database Backups
- Automated daily backups
- Point-in-time recovery
- Backup verification process

### Application Backups
- Code repository backups
- Configuration backups
- User data backups

## Performance Optimization

### Caching Strategy
- Configure Redis caching
- Set up CDN
- Implement browser caching

### Database Optimization
- Configure connection pooling
- Set up read replicas
- Optimize queries

## Troubleshooting

### Common Issues
1. Database connection errors
2. Memory leaks
3. High CPU usage
4. Slow response times

### Debug Process
1. Check application logs
2. Monitor system resources
3. Review error tracking
4. Analyze performance metrics

## Rollback Procedures

### Version Rollback
```bash
# Get previous version
git checkout v1.2.3

# Rebuild application
npm run build:prod

# Deploy previous version
npm run deploy
```

### Database Rollback
```bash
# Revert last migration
npm run migrate:down

# Restore from backup
npm run db:restore --backup=backup_name
```

## Health Checks

### Endpoint Monitoring
- `/health`: Basic application health
- `/health/db`: Database connectivity
- `/health/cache`: Cache status
- `/health/external`: External services status

### Automated Monitoring
```bash
# Run health check
curl -f https://your-domain.com/health

# Monitor response times
curl -w "%{time_total}\n" -o /dev/null -s https://your-domain.com/
```

## Scaling

### Horizontal Scaling
- Configure load balancer
- Add application instances
- Scale database connections

### Vertical Scaling
- Increase server resources
- Optimize application performance
- Upgrade database tier

## Support & Maintenance

### Regular Maintenance
- Update dependencies
- Rotate credentials
- Clean up old data
- Monitor disk space

### Emergency Contacts
- DevOps Team: devops@example.com
- Database Admin: dba@example.com
- Security Team: security@example.com

## Compliance & Auditing

### Security Compliance
- Regular security audits
- Penetration testing
- Vulnerability scanning

### Data Compliance
- GDPR compliance
- CCPA compliance
- Data retention policies

## Documentation Updates
Last updated: [Current Date]
Next review: [Next Review Date] 