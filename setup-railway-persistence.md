# Railway Data Persistence Setup Guide

## Problem
Railway's filesystem is ephemeral - when your app redeploys, all local files are lost. This includes:
- Login sessions (`sessions.json`)
- Shopify credentials (`shopify-credentials.json`) 
- User configuration data (`user-data.json`)

## Solution
Use Railway environment variables to persist data across deployments.

## Step 1: Access Railway Dashboard
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Find your `delivery-scheduler` project
3. Click on your service
4. Go to the **Variables** tab

## Step 2: Set Up Environment Variables

Add these environment variables in Railway:

### Basic Configuration
```
VITE_ADMIN_USERNAME=your_preferred_username
VITE_ADMIN_PASSWORD=your_secure_password
VITE_ADMIN_EMAIL=your_email@example.com
```

### Data Persistence Variables
```
SHOPIFY_CREDENTIALS_JSON={}
USER_DATA_JSON={}
SESSIONS_JSON={}
```

**Note:** Start with empty JSON objects `{}` - the system will populate these automatically when you save data.

## Step 3: How It Works

### When you save Shopify credentials:
The system will log a message like:
```
💡 To persist credentials across Railway restarts, set environment variable:
   SHOPIFY_CREDENTIALS_JSON={"admin":{"shopDomain":"your-shop.myshopify.com","accessToken":"shpat_xxxxx","apiVersion":"2024-01","appSecret":"","savedAt":"2024-06-15T01:30:00.000Z"}}
```

### When you save user data:
The system will log:
```
💡 To persist user data across Railway restarts, set environment variable:
   USER_DATA_JSON={"admin":{"timeslots":[...],"blockedDates":[...],"settings":{...},"lastUpdated":"2024-06-15T01:30:00.000Z"}}
```

### When you login:
The system will log:
```
💡 To persist sessions across Railway restarts, set environment variable:
   SESSIONS_JSON={"token123":{"user":"admin","timestamp":1718412600000}}
```

## Step 4: Update Environment Variables

1. Copy the JSON values from the server logs
2. Go to Railway Dashboard → Variables
3. Update the corresponding environment variable
4. Click **Save**
5. Railway will automatically redeploy with the new variables

## Step 5: Verification

After setting environment variables, check the deployment logs for:
```
📊 Environment Check:
   - Shopify Credentials Env: true
   - User Data Env: true
   - Sessions Env: true
```

## Automated Backup

The system automatically:
- Saves data to files every 5 minutes
- Saves data on graceful shutdown
- Logs the environment variable commands for easy copying

## Quick Recovery Steps

If you lose data after deployment:

1. Check Railway logs for the persistence commands
2. Copy the JSON values from the logs
3. Set them as environment variables in Railway
4. Redeploy or wait for automatic restart

## Security Notes

- Environment variables are encrypted in Railway
- Never share your environment variable values
- Use strong passwords for admin accounts
- Regularly backup your environment variables

## Troubleshooting

### Data Still Lost After Setting Variables?
- Check that JSON is valid (use a JSON validator)
- Ensure no trailing spaces in variable names
- Verify the variable names match exactly

### Can't Find the Log Messages?
- The messages appear when you save data
- Check Railway logs in real-time
- Look for messages starting with "💡 To persist"

### Variables Not Loading?
- Check Railway deployment logs
- Look for "📁 Loaded from environment" messages
- Verify JSON syntax is correct 