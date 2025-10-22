const axios = require('axios');
const xml2js = require('xml2js');
const logger = require('./logger');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

class P21ApiClient {
  constructor(config) {
    this.config = config;
    this.baseUrl = `${config.middlewareUrl}${config.endpoint}`;
    this.tokenBaseUrl = `${config.middlewareUrl}/api/security/token/`;
    this.bearerToken = null;
    this.tokenExpiry = null;
    this.xmlBuilder = new xml2js.Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
    this.xmlParser = new xml2js.Parser();

    // Get credentials from environment variables
    this.username = process.env.ERP_USERNAME;
    this.password = process.env.ERP_PASSWORD;

    if (!this.username || !this.password) {
      throw new Error('ERP_USERNAME and ERP_PASSWORD must be set in .env file');
    }
  }

  /**
   * Get a fresh bearer token from P21 API
   * @returns {Promise<string>} Bearer token
   */
  async getToken() {
    // If we have a valid token that hasn't expired, return it
    if (this.bearerToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      logger.debug('Using cached bearer token');
      return this.bearerToken;
    }

    try {
      logger.info('Requesting new bearer token from P21...');

      const tokenResponse = await axios.post(
        this.tokenBaseUrl,
        {},
        {
          headers: {
            'username': this.username,
            'password': this.password,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      this.bearerToken = tokenResponse.data.AccessToken;

      // Set expiry to 50 minutes from now (tokens typically valid for 60 minutes)
      // This ensures we refresh before it actually expires
      this.tokenExpiry = Date.now() + (50 * 60 * 1000);

      logger.info('Bearer token obtained successfully');
      return this.bearerToken;

    } catch (error) {
      logger.error('Error obtaining bearer token', {
        message: error.message,
        response: error.response?.data
      });
      throw new Error(`Failed to obtain bearer token: ${error.message}`);
    }
  }

  /**
   * Submit an order to P21 Transaction API
   * @param {string} orderXml - XML formatted order
   * @returns {Promise<Object>} API response
   */
  async submitOrder(orderXml) {
    try {
      // Get a fresh token (will use cached if still valid)
      const token = await this.getToken();

      logger.info('Submitting order to P21...');

      const response = await axios.post(
        this.baseUrl,
        orderXml,
        {
          headers: {
            'Content-Type': 'application/xml',
            'Authorization': `Bearer ${token}`,
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
      const token = await this.getToken();

      const response = await axios.get(
        `${this.baseUrl}/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
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
      // Test by getting a fresh token
      const token = await this.getToken();

      if (token) {
        logger.info('P21 connection validated successfully - token obtained');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('P21 connection validation failed', {
        error: error.message
      });
      return false;
    }
  }
}

module.exports = P21ApiClient;
