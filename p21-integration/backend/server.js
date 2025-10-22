const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const OrderProcessor = require('./order-processor');
const FileWatcher = require('./file-watcher');

// Load configuration
const configPath = path.join(__dirname, '..', 'config', 'config.json');
if (!fs.existsSync(configPath)) {
  console.error('Configuration file not found!');
  console.error('Please copy config.example.json to config.json and configure it.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'web-ui')));

// Initialize order processor
const orderProcessor = new OrderProcessor(config);

// Initialize file watcher
const fileWatcher = new FileWatcher(config, orderProcessor);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'P21 Order Integration'
  });
});

// Get all pending orders
app.get('/api/orders/pending', (req, res) => {
  try {
    const orders = orderProcessor.getPendingOrders();
    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    logger.error('Error fetching pending orders', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  try {
    const order = orderProcessor.getOrderById(parseInt(req.params.id));

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    logger.error('Error fetching order', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Approve and submit order to P21
app.post('/api/orders/:id/approve', async (req, res) => {
  try {
    const { approvedBy = 'web-user' } = req.body;
    const orderId = parseInt(req.params.id);

    logger.info('Approving order', { orderId, approvedBy });

    const result = await orderProcessor.approveAndSubmitOrder(orderId, approvedBy);

    res.json({
      success: result.success,
      message: result.success ? 'Order approved and submitted to P21' : 'Order submission failed',
      result: result
    });
  } catch (error) {
    logger.error('Error approving order', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Approve and submit multiple orders
app.post('/api/orders/approve-batch', async (req, res) => {
  try {
    const { orderIds, approvedBy = 'web-user' } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'orderIds must be a non-empty array'
      });
    }

    logger.info('Batch approving orders', { count: orderIds.length, approvedBy });

    const results = [];

    for (const orderId of orderIds) {
      try {
        const result = await orderProcessor.approveAndSubmitOrder(orderId, approvedBy);
        results.push({
          orderId,
          success: result.success,
          result: result
        });

        // Small delay between submissions to avoid overwhelming P21
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        results.push({
          orderId,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Processed ${results.length} orders: ${successCount} succeeded, ${results.length - successCount} failed`,
      results: results
    });

  } catch (error) {
    logger.error('Error in batch approval', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reject order
app.post('/api/orders/:id/reject', (req, res) => {
  try {
    const { rejectedBy = 'web-user', reason = '' } = req.body;
    const orderId = parseInt(req.params.id);

    orderProcessor.rejectOrder(orderId, rejectedBy, reason);

    res.json({
      success: true,
      message: 'Order rejected'
    });
  } catch (error) {
    logger.error('Error rejecting order', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get order statistics
app.get('/api/stats', (req, res) => {
  try {
    const db = orderProcessor.db;

    const stats = {
      pending: db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('pending_review').count,
      submitted: db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('submitted').count,
      failed: db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('failed').count,
      rejected: db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').get('rejected').count,
      byPlatform: {
        amazon: db.prepare('SELECT COUNT(*) as count FROM orders WHERE platform = ? AND status = ?').get('amazon', 'pending_review').count,
        ebay: db.prepare('SELECT COUNT(*) as count FROM orders WHERE platform = ? AND status = ?').get('ebay', 'pending_review').count
      }
    };

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    logger.error('Error fetching stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cleanup old orders (manual trigger)
app.post('/api/maintenance/cleanup', (req, res) => {
  try {
    const deletedCount = orderProcessor.cleanupOldOrders();

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old orders`
    });
  } catch (error) {
    logger.error('Error cleaning up orders', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const PORT = config.server.port || 3000;
const HOST = config.server.host || 'localhost';

app.listen(PORT, HOST, () => {
  logger.info(`P21 Order Integration Server started`);
  logger.info(`Server running at http://${HOST}:${PORT}`);
  logger.info(`Web UI available at http://${HOST}:${PORT}/index.html`);

  // Start file watcher
  fileWatcher.start();

  // Schedule automatic cleanup (once per day)
  setInterval(() => {
    logger.info('Running scheduled cleanup...');
    orderProcessor.cleanupOldOrders();
  }, 24 * 60 * 60 * 1000); // 24 hours
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  orderProcessor.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  orderProcessor.close();
  process.exit(0);
});
