const chokidar = require('chokidar');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class FileWatcher {
  constructor(config, orderProcessor) {
    this.config = config;
    this.orderProcessor = orderProcessor;
    this.lastAmazonFile = null;
    this.lastEbayFile = null;
    this.processing = false;
  }

  /**
   * Start watching for files
   */
  start() {
    if (!this.config.fileWatcher.enabled) {
      logger.info('File watcher is disabled');
      return;
    }

    const downloadsPath = this.config.fileWatcher.paths.downloads;

    logger.info('Starting file watcher', { path: downloadsPath });

    // Watch for Amazon files (.txt extension - Excel saved as tab-delimited)
    const amazonWatcher = chokidar.watch(path.join(downloadsPath, '*.txt'), {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    amazonWatcher.on('add', (filePath) => {
      this.handleAmazonFile(filePath);
    });

    // Watch for eBay files (.csv extension starting with specific prefix)
    const ebayWatcher = chokidar.watch(path.join(downloadsPath, 'eBay-awaiting-shipment-report*.csv'), {
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });

    ebayWatcher.on('add', (filePath) => {
      this.handleEbayFile(filePath);
    });

    logger.info('File watchers started successfully');
  }

  /**
   * Handle Amazon file
   * @param {string} filePath
   */
  async handleAmazonFile(filePath) {
    if (this.processing) {
      logger.debug('Already processing, skipping', { filePath });
      return;
    }

    try {
      this.processing = true;

      // Check if this is the same file we just processed
      const fileStats = fs.statSync(filePath);
      const fileKey = `${path.basename(filePath)}-${fileStats.mtime.getTime()}`;

      if (fileKey === this.lastAmazonFile) {
        logger.debug('Same Amazon file, skipping', { filePath });
        return;
      }

      this.lastAmazonFile = fileKey;

      logger.info('Processing Amazon file', { filePath });

      // Read Excel file
      const wb = XLSX.readFile(filePath, { dateNF: 'mm/dd/yyyy' });
      const ws = wb.Sheets['Sheet1'];
      const data = XLSX.utils.sheet_to_json(ws, { raw: false });

      if (!data || data.length === 0) {
        logger.warn('No data found in Amazon file', { filePath });
        return;
      }

      // Transform data to match expected format
      const orders = data.map(item => ({
        OrderId: item['order-id'],
        RecipientName: item['recipient-name'],
        Sku: item['sku'],
        QuantityPurchased: item['quantity-purchased'],
        ItemPrice: item['item-price'],
        ShipAddress1: item['ship-address-1'],
        ShipAddress2: item['ship-address-2'],
        ShipCity: item['ship-city'],
        ShipState: item['ship-state'],
        ShipZip: item['ship-postal-code']
      }));

      // Process orders
      const result = this.orderProcessor.processOrders(orders, 'amazon');

      logger.info('Amazon file processed successfully', {
        filePath,
        ordersProcessed: orders.length,
        ...result
      });

      // Update master file if configured
      if (this.config.fileWatcher.paths.amazonMaster) {
        this.updateMasterFile(orders, this.config.fileWatcher.paths.amazonMaster, 'OrderId');
      }

    } catch (error) {
      logger.error('Error processing Amazon file', {
        filePath,
        error: error.message,
        stack: error.stack
      });
    } finally {
      this.processing = false;
    }
  }

  /**
   * Handle eBay file
   * @param {string} filePath
   */
  async handleEbayFile(filePath) {
    if (this.processing) {
      logger.debug('Already processing, skipping', { filePath });
      return;
    }

    try {
      this.processing = true;

      // Check if this is the same file we just processed
      const fileStats = fs.statSync(filePath);
      const fileKey = `${path.basename(filePath)}-${fileStats.mtime.getTime()}`;

      if (fileKey === this.lastEbayFile) {
        logger.debug('Same eBay file, skipping', { filePath });
        return;
      }

      this.lastEbayFile = fileKey;

      logger.info('Processing eBay file', { filePath });

      // Read CSV file
      const wb = XLSX.readFile(filePath, { dateNF: 'mm/dd/yyyy' });
      const ws = wb.Sheets['Sheet1'];

      // Add proper headers (this matches the structure from the original ebay-script.js)
      XLSX.utils.sheet_add_aoa(ws, [[
        "SalesRecordNumber", "OrderNumber", "BuyerUsername", "BuyerName", "BuyerEmail",
        "BuyerNote", "BuyerAddress1", "BuyerAddress2", "BuyerCity", "BuyerState",
        "BuyerZip", "BuyerCountry", "BuyerTaxIdentifierName", "BuyerTaxIdentifierValue",
        "ShipToName", "ShipToPhone", "ShipToAddress1", "ShipToAddress2", "ShipToCity",
        "ShipToState", "ShipToZip", "ShipToCountry", "ItemNumber", "ItemTitle",
        "CustomLabel", "SoldViaPromotedListings", "Quantity", "SoldFor",
        "ShippingAndHandling", "ItemLocation", "ItemZipCode", "ItemCountry",
        "EbayCollectAndRemitTaxRate", "EbayCollectAndRemitTaxType", "EbayReferenceName",
        "EbayReferenceValue", "TaxStatus", "SellerCollectedTax", "EbayCollectedTax",
        "ElectronicWasteRecyclingFee", "MattressRecyclingFee", "BatteryRecyclingFee",
        "WhiteGoodsDisopsal", "TireRecyclingFee", "AdditionalFee", "LumberFee",
        "PrepaidWirelessFee", "RoadImprovementAndFoodDeliveryFee", "EbayCollectedCharges",
        "TotalPrice", "EbayCollectedTaxAndFeesIncludedInTotal", "PaymentMethod",
        "SaleDate", "PayidOnDate", "ShipByDate", "MinimumEstimatedDeliveryDate",
        "MaximunEstimatedDeliveryDate", "ShippedOnDate", "FeedbackLeft",
        "FeedbackReceived", "MyItemNote", "PayPalTransactionID", "ShippingService",
        "TrackingNumber", "TransactionID", "VariationDetails", "GlobalShippingProgram",
        "GlobalShippingReferenceID", "ClickAndCollect", "ClickAndCollectReferenceNumber",
        "EbayPlus", "AuthenticityVerificationProgram", "AuthenticityVerificationStatus",
        "AuthenticityVerificationOutcomeReason", "EbayVaultProgram", "VaultFulfillmentType",
        "EbayFulfillmentProgram", "TaxCity", "TaxState", "TaxZip", "TaxCountry",
        "EbayInternationalShipping"
      ]], { origin: "A1" });

      const data = XLSX.utils.sheet_to_json(ws, { raw: false });

      if (!data || data.length === 0) {
        logger.warn('No data found in eBay file', { filePath });
        return;
      }

      // Filter out header rows and invalid entries
      const orders = data.filter(order =>
        order.BuyerUsername &&
        order.BuyerUsername !== 'Buyer Username' &&
        order.OrderNumber
      );

      if (orders.length === 0) {
        logger.warn('No valid orders found in eBay file', { filePath });
        return;
      }

      // Process orders
      const result = this.orderProcessor.processOrders(orders, 'ebay');

      logger.info('eBay file processed successfully', {
        filePath,
        ordersProcessed: orders.length,
        ...result
      });

      // Update master file if configured
      if (this.config.fileWatcher.paths.ebayMaster) {
        this.updateMasterFile(orders, this.config.fileWatcher.paths.ebayMaster, 'OrderNumber');
      }

    } catch (error) {
      logger.error('Error processing eBay file', {
        filePath,
        error: error.message,
        stack: error.stack
      });
    } finally {
      this.processing = false;
    }
  }

  /**
   * Update master JSON file (maintains compatibility with existing system)
   * @param {Array} newOrders
   * @param {string} masterFilePath
   * @param {string} orderIdField
   */
  updateMasterFile(newOrders, masterFilePath, orderIdField) {
    try {
      const currentDate = new Date().toISOString();

      // Add MasterDate to each order
      newOrders.forEach(obj => obj.MasterDate = currentDate);

      let masterData = [];

      // Read existing master file
      if (fs.existsSync(masterFilePath)) {
        const masterDataStr = fs.readFileSync(masterFilePath, 'utf8');
        masterData = JSON.parse(masterDataStr);
      }

      // Merge new orders with master
      newOrders.forEach(tempObj => {
        const match = masterData.find(masterObj =>
          masterObj[orderIdField] === tempObj[orderIdField]
        );

        if (!match) {
          masterData.push(tempObj);
        } else {
          match.MasterDate = tempObj.MasterDate;
        }
      });

      // Remove orders older than 4 days
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
      masterData = masterData.filter(obj => obj.MasterDate >= fourDaysAgo);

      // Write back to master file
      fs.writeFileSync(masterFilePath, JSON.stringify(masterData, null, 2));

      logger.info('Master file updated', {
        filePath: masterFilePath,
        totalOrders: masterData.length
      });

    } catch (error) {
      logger.error('Error updating master file', {
        filePath: masterFilePath,
        error: error.message
      });
    }
  }
}

module.exports = FileWatcher;
