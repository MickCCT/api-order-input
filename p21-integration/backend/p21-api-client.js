const axios = require('axios');
const xml2js = require('xml2js');
const logger = require('./logger');

class P21ApiClient {
  constructor(config) {
    this.config = config;
    this.baseUrl = `${config.middlewareUrl}${config.endpoint}`;
    this.bearerToken = config.bearerToken;
    this.xmlBuilder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
    this.xmlParser = new xml2js.Parser();
  }

  /**
   * Submit an order to P21 Transaction API
   * @param {string} orderXml - XML formatted order
   * @returns {Promise<Object>} API response
   */
  async submitOrder(orderXml) {
    try {
      logger.info('Submitting order to P21...');

      const response = await axios.post(
        this.baseUrl,
        orderXml,
        {
          headers: {
            'Content-Type': 'application/xml',
            'Authorization': `Bearer ${this.bearerToken}`,
            'Accept': 'application/xml'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      logger.info('Order submitted successfully to P21', {
        status: response.status,
        statusText: response.statusText
      });

      // Parse XML response
      const parsedResponse = await this.xmlParser.parseStringPromise(response.data);

      return {
        success: true,
        status: response.status,
        data: parsedResponse,
        rawResponse: response.data
      };
    } catch (error) {
      logger.error('Error submitting order to P21', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        details: error.response?.data
      };
    }
  }

  /**
   * Retrieve order from P21
   * @param {string} orderId - P21 order ID
   * @returns {Promise<Object>} Order data
   */
  async getOrder(orderId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.bearerToken}`,
            'Accept': 'application/xml'
          }
        }
      );

      const parsedResponse = await this.xmlParser.parseStringPromise(response.data);

      return {
        success: true,
        data: parsedResponse
      };
    } catch (error) {
      logger.error('Error retrieving order from P21', {
        orderId,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate connection to P21
   * @returns {Promise<boolean>}
   */
  async validateConnection() {
    try {
      // Attempt a simple request to verify connection
      const response = await axios.get(
        this.config.middlewareUrl,
        {
          headers: {
            'Authorization': `Bearer ${this.bearerToken}`
          },
          timeout: 5000
        }
      );

      logger.info('P21 connection validated successfully');
      return true;
    } catch (error) {
      logger.error('P21 connection validation failed', {
        error: error.message
      });
      return false;
    }
  }
}

module.exports = P21ApiClient;
