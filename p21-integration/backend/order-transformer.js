const xml2js = require('xml2js');
const logger = require('./logger');

class OrderTransformer {
  constructor(config) {
    this.config = config;
    this.xmlBuilder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      headless: false,
      renderOpts: { pretty: true, indent: '  ' }
    });
  }

  /**
   * Transform Amazon order to P21 XML format
   * @param {Object} order - Amazon order data
   * @returns {string} XML formatted order
   */
  transformAmazonOrder(order) {
    const customerId = this.config.defaultCustomerId.amazon;

    const p21Order = {
      Transaction: {
        $: {
          xmlns: 'http://www.p21.com/xml/transaction',
          type: 'SalesOrder'
        },
        Header: {
          CompanyId: this.config.companyId,
          LocationId: this.config.locationId,
          CustomerId: customerId,
          CustomerPO: order.OrderId,
          OrderDate: new Date().toISOString().split('T')[0],
          RequestedShipDate: new Date().toISOString().split('T')[0],
          Status: 'Pending Review' // This ensures order is not processed automatically
        },
        ShipTo: {
          Name: this.sanitizeText(order.RecipientName),
          Address1: this.sanitizeText(order.ShipAddress1),
          Address2: this.sanitizeText(order.ShipAddress2 || ''),
          City: this.sanitizeText(order.ShipCity),
          State: this.sanitizeText(order.ShipState),
          PostalCode: this.sanitizeText(order.ShipZip)
        },
        Lines: {
          Line: []
        }
      }
    };

    // Add line item
    p21Order.Transaction.Lines.Line.push({
      LineNumber: 1,
      ItemId: this.sanitizeText(order.Sku),
      Quantity: order.QuantityPurchased,
      Price: this.parsePrice(order.ItemPrice)
    });

    return this.xmlBuilder.buildObject(p21Order);
  }

  /**
   * Transform eBay order to P21 XML format
   * @param {Object} order - eBay order data
   * @returns {string} XML formatted order
   */
  transformEbayOrder(order) {
    const customerId = this.config.defaultCustomerId.ebay;

    const p21Order = {
      Transaction: {
        $: {
          xmlns: 'http://www.p21.com/xml/transaction',
          type: 'SalesOrder'
        },
        Header: {
          CompanyId: this.config.companyId,
          LocationId: this.config.locationId,
          CustomerId: customerId,
          CustomerPO: order.OrderNumber,
          OrderDate: order.SaleDate ? this.formatDate(order.SaleDate) : new Date().toISOString().split('T')[0],
          RequestedShipDate: order.ShipByDate ? this.formatDate(order.ShipByDate) : new Date().toISOString().split('T')[0],
          Status: 'Pending Review',
          Notes: order.BuyerNote ? this.sanitizeText(order.BuyerNote) : ''
        },
        ShipTo: {
          Name: this.sanitizeText(order.ShipToName || order.BuyerName),
          Phone: this.sanitizeText(order.ShipToPhone || ''),
          Address1: this.sanitizeText(order.ShipToAddress1),
          Address2: this.sanitizeText(order.ShipToAddress2 || ''),
          City: this.sanitizeText(order.ShipToCity),
          State: this.sanitizeText(order.ShipToState),
          PostalCode: this.sanitizeText(order.ShipToZip)
        },
        Lines: {
          Line: []
        }
      }
    };

    // Add line item
    p21Order.Transaction.Lines.Line.push({
      LineNumber: 1,
      ItemId: this.sanitizeText(order.CustomLabel),
      Quantity: order.Quantity,
      Price: this.parsePrice(order.SoldFor)
    });

    return this.xmlBuilder.buildObject(p21Order);
  }

  /**
   * Transform multiple items from same order into P21 XML format
   * @param {Array} orderItems - Array of order items with same order ID
   * @param {string} platform - 'amazon' or 'ebay'
   * @returns {string} XML formatted order
   */
  transformMultiItemOrder(orderItems, platform) {
    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items provided');
    }

    const firstItem = orderItems[0];
    let p21Order;

    if (platform === 'amazon') {
      const customerId = this.config.defaultCustomerId.amazon;

      p21Order = {
        Transaction: {
          $: {
            xmlns: 'http://www.p21.com/xml/transaction',
            type: 'SalesOrder'
          },
          Header: {
            CompanyId: this.config.companyId,
            LocationId: this.config.locationId,
            CustomerId: customerId,
            CustomerPO: firstItem.OrderId,
            OrderDate: new Date().toISOString().split('T')[0],
            RequestedShipDate: new Date().toISOString().split('T')[0],
            Status: 'Pending Review'
          },
          ShipTo: {
            Name: this.sanitizeText(firstItem.RecipientName),
            Address1: this.sanitizeText(firstItem.ShipAddress1),
            Address2: this.sanitizeText(firstItem.ShipAddress2 || ''),
            City: this.sanitizeText(firstItem.ShipCity),
            State: this.sanitizeText(firstItem.ShipState),
            PostalCode: this.sanitizeText(firstItem.ShipZip)
          },
          Lines: {
            Line: []
          }
        }
      };

      // Add all line items
      orderItems.forEach((item, index) => {
        p21Order.Transaction.Lines.Line.push({
          LineNumber: index + 1,
          ItemId: this.sanitizeText(item.Sku),
          Quantity: item.QuantityPurchased,
          Price: this.parsePrice(item.ItemPrice)
        });
      });

    } else if (platform === 'ebay') {
      const customerId = this.config.defaultCustomerId.ebay;

      p21Order = {
        Transaction: {
          $: {
            xmlns: 'http://www.p21.com/xml/transaction',
            type: 'SalesOrder'
          },
          Header: {
            CompanyId: this.config.companyId,
            LocationId: this.config.locationId,
            CustomerId: customerId,
            CustomerPO: firstItem.OrderNumber,
            OrderDate: firstItem.SaleDate ? this.formatDate(firstItem.SaleDate) : new Date().toISOString().split('T')[0],
            RequestedShipDate: firstItem.ShipByDate ? this.formatDate(firstItem.ShipByDate) : new Date().toISOString().split('T')[0],
            Status: 'Pending Review',
            Notes: firstItem.BuyerNote ? this.sanitizeText(firstItem.BuyerNote) : ''
          },
          ShipTo: {
            Name: this.sanitizeText(firstItem.ShipToName || firstItem.BuyerName),
            Phone: this.sanitizeText(firstItem.ShipToPhone || ''),
            Address1: this.sanitizeText(firstItem.ShipToAddress1),
            Address2: this.sanitizeText(firstItem.ShipToAddress2 || ''),
            City: this.sanitizeText(firstItem.ShipToCity),
            State: this.sanitizeText(firstItem.ShipToState),
            PostalCode: this.sanitizeText(firstItem.ShipToZip)
          },
          Lines: {
            Line: []
          }
        }
      };

      // Add all line items
      orderItems.forEach((item, index) => {
        p21Order.Transaction.Lines.Line.push({
          LineNumber: index + 1,
          ItemId: this.sanitizeText(item.CustomLabel),
          Quantity: item.Quantity,
          Price: this.parsePrice(item.SoldFor)
        });
      });
    }

    return this.xmlBuilder.buildObject(p21Order);
  }

  /**
   * Sanitize text to prevent XML issues
   * @param {string} text
   * @returns {string}
   */
  sanitizeText(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .trim();
  }

  /**
   * Parse price from string
   * @param {string|number} price
   * @returns {number}
   */
  parsePrice(price) {
    if (typeof price === 'number') return price;
    if (!price) return 0;

    // Remove currency symbols and parse
    const cleaned = String(price).replace(/[$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Format date to YYYY-MM-DD
   * @param {string} dateString
   * @returns {string}
   */
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      logger.warn('Error formatting date, using current date', { dateString });
      return new Date().toISOString().split('T')[0];
    }
  }
}

module.exports = OrderTransformer;
