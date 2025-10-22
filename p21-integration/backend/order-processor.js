const Database = require('better-sqlite3');
const path = require('path');
const logger = require('./logger');
const OrderTransformer = require('./order-transformer');
const P21ApiClient = require('./p21-api-client');

class OrderProcessor {
  constructor(config) {
    this.config = config;
    this.db = new Database(path.join(__dirname, '..', config.database.path));
    this.transformer = new OrderTransformer(config.p21);
    this.p21Client = new P21ApiClient(config.p21);
  }

  /**
   * Process orders from JSON data (Amazon or eBay)
   * @param {Array} orders - Array of order objects
   * @param {string} platform - 'amazon' or 'ebay'
   */
  processOrders(orders, platform) {
    logger.info(`Processing ${orders.length} ${platform} orders`);

    // Group orders by order ID (for multi-item orders)
    const groupedOrders = this.groupOrdersByOrderId(orders, platform);

    let inserted = 0;
    let updated = 0;
    let errors = 0;

    for (const [orderId, orderItems] of Object.entries(groupedOrders)) {
      try {
        // Check if order already exists
        const existing = this.db.prepare(
          'SELECT id, status FROM orders WHERE order_id = ? AND platform = ?'
        ).get(orderId, platform);

        if (existing) {
          // Update existing order if not yet submitted
          if (existing.status === 'pending_review') {
            this.updateOrder(existing.id, orderItems, platform);
            updated++;
          }
          continue;
        }

        // Insert new order
        this.insertOrder(orderId, orderItems, platform);
        inserted++;

      } catch (error) {
        logger.error('Error processing order', {
          orderId,
          platform,
          error: error.message
        });
        errors++;
      }
    }

    logger.info(`Orders processed: ${inserted} inserted, ${updated} updated, ${errors} errors`);
    return { inserted, updated, errors };
  }

  /**
   * Group orders by order ID (handles multi-item orders)
   * @param {Array} orders
   * @param {string} platform
   * @returns {Object}
   */
  groupOrdersByOrderId(orders, platform) {
    const grouped = {};

    orders.forEach(order => {
      const orderId = platform === 'amazon' ? order.OrderId : order.OrderNumber;

      if (!grouped[orderId]) {
        grouped[orderId] = [];
      }

      grouped[orderId].push(order);
    });

    return grouped;
  }

  /**
   * Insert new order into database
   * @param {string} orderId
   * @param {Array} orderItems
   * @param {string} platform
   */
  insertOrder(orderId, orderItems, platform) {
    const orderData = JSON.stringify(orderItems);

    // Generate P21 XML
    let p21Xml;
    try {
      if (orderItems.length === 1) {
        p21Xml = platform === 'amazon'
          ? this.transformer.transformAmazonOrder(orderItems[0])
          : this.transformer.transformEbayOrder(orderItems[0]);
      } else {
        p21Xml = this.transformer.transformMultiItemOrder(orderItems, platform);
      }
    } catch (error) {
      logger.error('Error transforming order to P21 XML', {
        orderId,
        platform,
        error: error.message
      });
      throw error;
    }

    // Insert order
    const insert = this.db.prepare(`
      INSERT INTO orders (order_id, platform, status, order_data, p21_xml)
      VALUES (?, ?, 'pending_review', ?, ?)
    `);

    const result = insert.run(orderId, platform, orderData, p21Xml);

    // Insert order items
    const insertItem = this.db.prepare(`
      INSERT INTO order_items (order_id, item_number, quantity, price)
      VALUES (?, ?, ?, ?)
    `);

    orderItems.forEach(item => {
      const itemNumber = platform === 'amazon' ? item.Sku : item.CustomLabel;
      const quantity = platform === 'amazon' ? item.QuantityPurchased : item.Quantity;
      const price = platform === 'amazon' ? this.parsePrice(item.ItemPrice) : this.parsePrice(item.SoldFor);

      insertItem.run(result.lastInsertRowid, itemNumber, quantity, price);
    });

    logger.info('Order inserted', { orderId, platform, dbId: result.lastInsertRowid });
  }

  /**
   * Update existing order
   * @param {number} dbId
   * @param {Array} orderItems
   * @param {string} platform
   */
  updateOrder(dbId, orderItems, platform) {
    const orderData = JSON.stringify(orderItems);

    // Regenerate P21 XML
    let p21Xml;
    if (orderItems.length === 1) {
      p21Xml = platform === 'amazon'
        ? this.transformer.transformAmazonOrder(orderItems[0])
        : this.transformer.transformEbayOrder(orderItems[0]);
    } else {
      p21Xml = this.transformer.transformMultiItemOrder(orderItems, platform);
    }

    const update = this.db.prepare(`
      UPDATE orders
      SET order_data = ?, p21_xml = ?
      WHERE id = ?
    `);

    update.run(orderData, p21Xml, dbId);

    logger.info('Order updated', { dbId });
  }

  /**
   * Get all pending orders
   * @returns {Array}
   */
  getPendingOrders() {
    const stmt = this.db.prepare(`
      SELECT o.*,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      WHERE status = 'pending_review'
      ORDER BY created_at DESC
    `);

    return stmt.all();
  }

  /**
   * Get order by ID
   * @param {number} id
   * @returns {Object}
   */
  getOrderById(id) {
    const order = this.db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

    if (order) {
      const items = this.db.prepare(
        'SELECT * FROM order_items WHERE order_id = ?'
      ).all(id);

      order.items = items;
      order.order_data = JSON.parse(order.order_data);
    }

    return order;
  }

  /**
   * Approve order and submit to P21
   * @param {number} id
   * @param {string} approvedBy
   * @returns {Promise<Object>}
   */
  async approveAndSubmitOrder(id, approvedBy = 'system') {
    const order = this.getOrderById(id);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending_review') {
      throw new Error(`Order cannot be approved. Current status: ${order.status}`);
    }

    logger.info('Submitting order to P21', { orderId: order.order_id, platform: order.platform });

    // Submit to P21
    const result = await this.p21Client.submitOrder(order.p21_xml);

    // Update order status
    const updateStmt = this.db.prepare(`
      UPDATE orders
      SET status = ?,
          reviewed_at = CURRENT_TIMESTAMP,
          reviewed_by = ?,
          submitted_at = CURRENT_TIMESTAMP,
          p21_response = ?,
          error_message = ?
      WHERE id = ?
    `);

    if (result.success) {
      updateStmt.run('submitted', approvedBy, JSON.stringify(result.data), null, id);

      // Log to audit
      this.logAudit(id, 'approved_and_submitted', approvedBy, 'Order submitted successfully to P21');

      logger.info('Order submitted successfully', { orderId: order.order_id });
    } else {
      updateStmt.run('failed', approvedBy, JSON.stringify(result), result.error, id);

      // Log to audit
      this.logAudit(id, 'submission_failed', approvedBy, `Failed: ${result.error}`);

      logger.error('Order submission failed', { orderId: order.order_id, error: result.error });
    }

    return result;
  }

  /**
   * Reject order
   * @param {number} id
   * @param {string} rejectedBy
   * @param {string} reason
   */
  rejectOrder(id, rejectedBy, reason = '') {
    const update = this.db.prepare(`
      UPDATE orders
      SET status = 'rejected',
          reviewed_at = CURRENT_TIMESTAMP,
          reviewed_by = ?,
          error_message = ?
      WHERE id = ?
    `);

    update.run(rejectedBy, reason, id);

    this.logAudit(id, 'rejected', rejectedBy, reason);

    logger.info('Order rejected', { id, rejectedBy, reason });
  }

  /**
   * Log audit event
   * @param {number} orderId
   * @param {string} action
   * @param {string} user
   * @param {string} details
   */
  logAudit(orderId, action, user, details = '') {
    const stmt = this.db.prepare(`
      INSERT INTO audit_log (order_id, action, user, details)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(orderId, action, user, details);
  }

  /**
   * Parse price from string
   * @param {string|number} price
   * @returns {number}
   */
  parsePrice(price) {
    if (typeof price === 'number') return price;
    if (!price) return 0;

    const cleaned = String(price).replace(/[$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Clean up old orders
   */
  cleanupOldOrders() {
    const daysToKeep = this.config.orderRetention.daysToKeep || 30;

    const stmt = this.db.prepare(`
      DELETE FROM orders
      WHERE created_at < datetime('now', '-${daysToKeep} days')
      AND status IN ('submitted', 'rejected')
    `);

    const result = stmt.run();

    logger.info(`Cleaned up ${result.changes} old orders`);
    return result.changes;
  }

  /**
   * Close database connection
   */
  close() {
    this.db.close();
  }
}

module.exports = OrderProcessor;
