# P21 Order Integration System

Automated order processing system that integrates Amazon and eBay orders with Epicor Prophet 21 (P21) via API.

## Components

The system consists of 3 main components:

1. **Download Orders** - Chrome extension that downloads order files from Amazon and eBay
2. **Excel to JSON** - Node.js program that converts downloaded files to JSON format
3. **P21 Integration** - Backend server that automatically submits orders to P21 via Transaction API

## How It Works

1. **Download Orders** extension downloads order files from Amazon (.txt) or eBay (.csv)
2. **Excel to JSON** watches for new files and converts them to JSON format
3. **P21 Integration** automatically imports orders, stores them in a review database, and provides a web UI for approval
4. Approved orders are automatically submitted to P21 via the Transaction API

## Quick Start

See [p21-integration/QUICKSTART.md](p21-integration/QUICKSTART.md) for setup instructions.

## Documentation

- [Download Orders Overview](download-orders/overview.md)
- [Excel to JSON Overview](excel-to-json/overview.md)
- [P21 Integration Full Documentation](p21-integration/README.md)

## Migration from Manual Entry System

This system replaces the old manual copy/paste workflow with automated API integration. The manual browser extensions (amazon-order-input, ebay-order-input) are no longer needed.
