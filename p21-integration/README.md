# P21 Order Integration System

Automated order integration system for Epicor Prophet 21 (P21) with order review and approval workflow.

## Overview

This system replaces the manual clipboard-based order entry process with an automated API integration. Key features:

- **Automated Order Import**: Watches for new Amazon and eBay order files and imports them automatically
- **Order Review Workflow**: All orders are held in "Pending Review" status until manually approved
- **Web-Based Review UI**: Modern web interface for reviewing and approving orders
- **P21 Transaction API Integration**: Uses P21's Transaction API v2 with XML format for reliability
- **Order Staging Database**: SQLite database stores orders with full audit trail
- **Batch Processing**: Approve multiple orders at once
- **Error Handling & Logging**: Comprehensive logging and error tracking

## Architecture

```
p21-integration/
├── backend/              # Node.js backend service
│   ├── server.js        # Express API server
│   ├── p21-api-client.js      # P21 API client
│   ├── order-transformer.js   # Transform orders to P21 XML
│   ├── order-processor.js     # Order processing logic
│   ├── file-watcher.js        # Watch for new order files
│   ├── logger.js              # Winston logger
│   ├── init-database.js       # Database initialization
│   └── package.json           # Dependencies
├── web-ui/              # Web-based review interface
│   └── index.html       # Single-page application
├── config/              # Configuration files
│   └── config.example.json    # Example configuration
└── data/                # Data directory (created at runtime)
    ├── orders.db        # SQLite database
    └── logs/            # Log files
```

## Installation

### Prerequisites

- Node.js 16+ and npm
- Access to Epicor P21 middleware server
- P21 API bearer token

### Setup Steps

1. **Navigate to the integration directory**:
   ```bash
   cd p21-integration
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Configure the system**:
   ```bash
   cd ../config
   cp config.example.json config.json
   ```

4. **Edit config.json** with your settings:
   - `p21.middlewareUrl`: Your P21 middleware server URL
   - `p21.bearerToken`: Your P21 API bearer token
   - `p21.companyId`: Your company ID in P21
   - `p21.locationId`: Your location ID in P21
   - `p21.defaultCustomerId`: Customer IDs for Amazon, eBay, Walmart
   - `fileWatcher.paths`: Update file paths to match your system

5. **Initialize the database**:
   ```bash
   cd ../backend
   npm run init-db
   ```

6. **Start the server**:
   ```bash
   npm start
   ```

   The server will start on http://localhost:3000

## Usage

### Starting the System

```bash
cd p21-integration/backend
npm start
```

The system will:
1. Start the web server on port 3000
2. Begin watching for new order files
3. Automatically import new orders as they appear

### Accessing the Review UI

Open your browser to: http://localhost:3000/index.html

From the UI you can:
- View all pending orders
- See order details including items, shipping info, and P21 XML
- Approve individual orders
- Reject orders with optional reason
- Batch approve multiple orders
- View statistics (pending, submitted, failed, rejected)

### Order Workflow

1. **File Detected**: System detects new Amazon (.txt) or eBay (.csv) file
2. **Import**: Order is imported and transformed to P21 XML format
3. **Pending Review**: Order status is set to "Pending Review"
4. **Human Review**: Staff reviews order in web UI
5. **Approval**: Upon approval, order is submitted to P21 via Transaction API
6. **Confirmation**: Order status updated to "Submitted" or "Failed"

### Order States

- **pending_review**: Order waiting for approval
- **submitted**: Successfully submitted to P21
- **failed**: Submission to P21 failed (check error_message)
- **rejected**: Manually rejected by reviewer

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/health` - Health check
- `GET /api/orders/pending` - Get all pending orders
- `GET /api/orders/:id` - Get specific order details
- `POST /api/orders/:id/approve` - Approve and submit order
- `POST /api/orders/:id/reject` - Reject order
- `POST /api/orders/approve-batch` - Batch approve orders
- `GET /api/stats` - Get order statistics
- `POST /api/maintenance/cleanup` - Clean up old orders

## Configuration

### P21 Configuration

The system uses P21's Transaction API v2. Key configuration:

- **Endpoint**: `/uiserver0/api/v2/transaction`
- **Format**: XML (more reliable than JSON for POST operations)
- **Authentication**: Bearer token
- **Order Status**: Set to "Pending Review" to prevent automatic processing

### File Watcher Configuration

The system watches for:
- **Amazon**: `.txt` files in downloads folder
- **eBay**: `eBay-awaiting-shipment-report*.csv` files

Configure paths in `config.json` under `fileWatcher.paths`.

### Database Configuration

SQLite database stores:
- Orders with full data and P21 XML
- Order line items
- Audit log of all actions
- Automatically cleans up orders older than configured retention period

## Logging

Logs are written to:
- Console (stdout) - all levels with colors
- `data/logs/combined.log` - all logs
- `data/logs/error.log` - errors only

Log level can be set via `LOG_LEVEL` environment variable (default: 'info').

## Maintenance

### Clean Up Old Orders

Old submitted/rejected orders are automatically cleaned up daily. Manual cleanup:

```bash
curl -X POST http://localhost:3000/api/maintenance/cleanup
```

Or use the API endpoint from your application.

### Backup Database

The SQLite database can be backed up by copying:

```bash
cp data/orders.db data/orders.db.backup
```

### Viewing Logs

```bash
tail -f data/logs/combined.log
```

## Development

### Running in Development Mode

Install nodemon for auto-restart:

```bash
npm install -g nodemon
cd backend
npm run dev
```

### Database Schema

See `backend/init-database.js` for full schema.

Key tables:
- `orders` - Main orders table
- `order_items` - Line items for each order
- `audit_log` - Audit trail of all actions

## Troubleshooting

### Orders Not Being Imported

1. Check file watcher is enabled in config.json
2. Verify file paths are correct
3. Check logs for errors: `tail -f data/logs/error.log`
4. Ensure files match expected format

### P21 Submission Failures

1. Verify P21 middleware URL is correct
2. Check bearer token is valid
3. Verify company and location IDs
4. Check P21 XML format in order details
5. Review error message in order record

### Connection Issues

1. Verify P21 middleware server is accessible
2. Check firewall settings
3. Verify network connectivity
4. Test with: `curl -H "Authorization: Bearer YOUR_TOKEN" YOUR_MIDDLEWARE_URL`

## Migration from Old System

The new system maintains compatibility with the old master JSON files:

- Master files are still updated when new orders are imported
- Old Chrome extensions can continue to work alongside new system
- Gradual migration: Use review UI for some orders while old system runs

## Security Considerations

1. **Bearer Token**: Keep your P21 bearer token secure in config.json
2. **Access Control**: Consider adding authentication to the web UI
3. **Network**: Run behind firewall or VPN for production use
4. **Config File**: Never commit config.json with real credentials

## Support

For issues or questions:
1. Check logs in `data/logs/`
2. Review P21 API documentation at your middleware server's `/docs/V2API.aspx`
3. Contact your Epicor representative for P21 API issues

## License

Internal use - Cross Creek Tractor Co., Inc
