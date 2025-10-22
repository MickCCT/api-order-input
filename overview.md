# System Overview

## High-Level Architecture

This system automates the process of importing Amazon and eBay orders into Epicor Prophet 21 (P21) using the P21 Transaction API.

### Workflow

1. **Download Orders** - Chrome extension downloads order files from Amazon/eBay to your downloads folder
   - Amazon orders: `.txt` files
   - eBay orders: `eBay-awaiting-shipment-report*.csv` files

2. **Excel to JSON** - Node.js file watcher converts downloaded files to JSON format
   - Watches downloads folder for new files
   - Parses CSV/TXT files
   - Updates master JSON files for each platform

3. **P21 Integration** - Backend server processes orders via P21 API
   - File watcher detects new order files
   - Imports orders into SQLite database
   - Transforms orders to P21 XML format
   - Provides web UI for order review and approval
   - Submits approved orders to P21 via Transaction API v2

### Key Improvements Over Manual System

- **Automated Submission** - Orders are submitted via API, no manual data entry
- **Review Workflow** - All orders held for review before submission
- **Error Handling** - Failed submissions are tracked with error details
- **Audit Trail** - Complete history of all order actions
- **Batch Processing** - Approve multiple orders at once
- **Modern UI** - Web-based review interface

## Component Details

### Download Orders
- **Type**: Chrome browser extension
- **Purpose**: Download order reports from Amazon and eBay websites
- **Location**: `download-orders/`
- **Documentation**: [download-orders/overview.md](download-orders/overview.md)

### Excel to JSON
- **Type**: Node.js application
- **Purpose**: Convert downloaded order files to JSON format
- **Location**: `excel-to-json/`
- **Documentation**: [excel-to-json/overview.md](excel-to-json/overview.md)

### P21 Integration
- **Type**: Node.js backend server with web UI
- **Purpose**: Automated P21 order submission via Transaction API
- **Location**: `p21-integration/`
- **Documentation**:
  - [p21-integration/README.md](p21-integration/README.md) - Full documentation
  - [p21-integration/QUICKSTART.md](p21-integration/QUICKSTART.md) - Setup guide

## Setup Order

1. Set up Download Orders extension in Chrome
2. Set up Excel to JSON (install dependencies, configure paths)
3. Set up P21 Integration (install dependencies, configure P21 connection, initialize database)
4. Start Excel to JSON file watcher
5. Start P21 Integration server

See [p21-integration/QUICKSTART.md](p21-integration/QUICKSTART.md) for detailed setup instructions.
