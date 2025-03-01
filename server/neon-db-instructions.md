# Neon Database Connection Troubleshooting

We're experiencing authentication issues with the Neon PostgreSQL database. Here are steps to resolve this issue:

## 1. Reset the Neon DB Password

1. Go to the [Neon Tech Dashboard](https://console.neon.tech/)
2. Sign in with your credentials
3. Select your project "personal-finance-dashboard" 
4. Navigate to the "Connection Details" tab
5. Find the role "neondb_owner" (or create a new role if needed)
6. Reset the password for this role
7. Make sure to copy the new password

## 2. Update the Connection String

After resetting the password, update the DATABASE_URL in both these files:
- `server/.env`
- `.env.production`

The format should be:
```
DATABASE_URL=postgres://neondb_owner:YOUR_NEW_PASSWORD@ep-tidy-pine-a1cqk8l9.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## 3. Update Your Environment Variables

On your local machine:
1. Open your `.env` file
2. Update the `DATABASE_URL` value with your new connection string
3. Restart your application to test the new connection

## 4. Update Deployment Environment Variables

Make sure to update the environment variable in your deployment platform:
1. Go to your deployment platform dashboard (Netlify)
2. Navigate to the environment variables section
3. Update the `DATABASE_URL` variable with the new connection string
4. Deploy your application to apply the changes

## 5. Testing the Connection

Once the database connection is updated, deploy your application to ensure everything works end-to-end.

## 5. Common Neon DB Issues

- **Authentication failures**: Make sure the username and password match exactly
- **SSL issues**: Neon requires SSL connections, ensure `sslmode=require` is in the URL
- **Connection limits**: Neon has connection limits based on your plan
- **Idle timeouts**: Neon can disconnect idle connections, ensure your app handles reconnections

## Next Steps

Once the database connection is working, deploy your updated application to Netlify to ensure everything works end-to-end. 