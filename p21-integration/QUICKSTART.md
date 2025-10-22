# Quick Start Guide

Get the P21 Order Integration system up and running in 5 minutes.

## Step 1: Install Dependencies

```bash
cd p21-integration/backend
npm install
```

This will install all required Node.js packages including Express, SQLite, Winston, and more.

## Step 2: Configure the System

### Set Up Environment Variables

```bash
cd ../
cp .env.example .env
```

Edit `.env` and add your P21 credentials:

```env
ERP_USERNAME=your_p21_username
ERP_PASSWORD=your_p21_password
```

**Important**: The system will automatically obtain fresh bearer tokens using these credentials. Tokens expire after ~60 minutes, but the system handles this automatically.

### Set Up Configuration File

```bash
cd config
cp config.example.json config.json
```

Edit `config.json` and update these critical fields:

### Required P21 Settings

```json
"p21": {
  "middlewareUrl": "https://crosscreek-api.epicordistribution.com",
  "companyId": "YOUR_COMPANY_ID",
  "locationId": "YOUR_LOCATION_ID"
}
```

**Where to find these values:**
- **middlewareUrl**: Already set to Cross Creek's P21 server
- **companyId**: Your company identifier in P21
- **locationId**: Your warehouse/location identifier in P21

### Customer IDs (Already Configured)

These are already set from your existing system:
- Amazon: `110690`
- eBay: `109408`
- Walmart: `127129`

### File Paths

Update these paths to match your computer:

```json
"fileWatcher": {
  "paths": {
    "downloads": "c:/Users/YOUR_USERNAME/OneDrive/Documents/Downloads",
    "amazonMaster": "C:/Users/YOUR_USERNAME/Cross Creek Tractor Co., Inc/Ecommerce Digital Marketing Team - Documents/Amazon Order Input Program/master-amazon-order-data.json",
    "ebayMaster": "C:/Users/YOUR_USERNAME/Cross Creek Tractor Co., Inc/Ecommerce Digital Marketing Team - Documents/Ebay Order Input Program/master-ebay-order-data.json"
  }
}
```

Replace `YOUR_USERNAME` with your actual Windows username (currently: `mick.CROSSCREEK100`).

## Step 3: Initialize Database

```bash
cd ../backend
npm run init-db
```

You should see:
```
Initializing database...
Database initialized successfully!
Database location: /path/to/data/orders.db
```

## Step 4: Start the Server

```bash
npm start
```

You should see:
```
P21 Order Integration Server started
Server running at http://localhost:3000
Web UI available at http://localhost:3000/index.html
Starting file watcher
File watchers started successfully
```

## Step 5: Access the Web UI

Open your browser and go to:

```
http://localhost:3000/index.html
```

You should see the Order Review dashboard.

## Testing the System

### Test with Existing Orders

If you have existing master JSON files with orders, you can manually trigger a test:

1. Copy an old Amazon or eBay file to your downloads folder
2. Watch the server console - you should see:
   ```
   Processing Amazon file...
   Amazon file processed successfully
   ```
3. Refresh the web UI - pending orders should appear

### Approve Your First Order

1. In the web UI, click **View** on any pending order
2. Review the order details, shipping info, and P21 XML
3. Click **Approve & Submit** if everything looks correct
4. The order will be sent to P21 and status updated to "Submitted"

### Check Logs

If anything goes wrong, check the logs:

```bash
cd p21-integration
cat data/logs/combined.log
```

Or for errors only:
```bash
cat data/logs/error.log
```

## Common Issues

### "Configuration file not found"

Make sure you:
1. Copied `config.example.json` to `config.json`
2. Are in the correct directory when starting the server

### "Error connecting to P21"

Check:
1. Your `middlewareUrl` is correct and accessible
2. Your `bearerToken` is valid
3. You're on the network that can access P21
4. Firewall isn't blocking the connection

### "No orders appearing"

Verify:
1. File watcher is enabled in config.json
2. File paths point to correct directories
3. New files are being created in downloads folder
4. Server console shows "File watchers started successfully"

### Port 3000 Already in Use

If port 3000 is already in use, edit `config.json`:

```json
"server": {
  "port": 3001,
  "host": "localhost"
}
```

Then access at: http://localhost:3001/index.html

## Next Steps

1. **Test thoroughly** with a few orders before going live
2. **Monitor logs** for the first few days
3. **Set up backup** of the database file regularly
4. **Consider authentication** for the web UI in production
5. **Schedule cleanup** - old orders are auto-cleaned after 30 days

## Getting Help

- Check the full **README.md** for detailed documentation
- Review logs in `data/logs/` directory
- Contact Epicor support for P21 API issues
- Verify P21 API docs at: `https://your-p21-server/docs/V2API.aspx`

## Running as a Service (Optional)

For production use, you may want to run the server as a Windows service using tools like:
- **pm2**: Process manager for Node.js
- **NSSM**: Non-Sucking Service Manager for Windows
- **node-windows**: Create Windows services from Node.js apps

Example with pm2:
```bash
npm install -g pm2
pm2 start server.js --name p21-integration
pm2 save
pm2 startup
```

This ensures the server starts automatically when your computer boots.
