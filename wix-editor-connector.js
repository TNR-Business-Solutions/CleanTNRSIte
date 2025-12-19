/**
 * Wix Editor Connector
 * Connects to Wix Studio editor programmatically using OAuth and REST API
 * Based on: https://dev.wix.com/docs/rest/getting-started/introduction
 */

const axios = require('axios');
const { clientTokensDB } = require('./server/handlers/auth-wix-callback');
const { WixAPIClient } = require('./server/handlers/wix-api-client');

// Wix REST API Base URLs
const WIX_REST_API_BASE = 'https://www.wixapis.com';
const WIX_SITES_API = `${WIX_REST_API_BASE}/sites/v1`;
const WIX_PAGES_API = `${WIX_REST_API_BASE}/pages/v1`;
const WIX_STORES_API = `${WIX_REST_API_BASE}/stores/v1`;
const WIX_BLOG_API = `${WIX_REST_API_BASE}/blog/v1`;
const WIX_DATA_API = `${WIX_REST_API_BASE}/wix-data/v2`;

class WixEditorConnector {
  constructor(instanceId) {
    this.instanceId = instanceId;
    this.apiClient = new WixAPIClient(instanceId);
  }

  /**
   * Get site information
   */
  async getSiteInfo() {
    try {
      const response = await this.apiClient.request('GET', '/sites/v1/site');
      return {
        success: true,
        site: response.data.site
      };
    } catch (error) {
      console.error('Error getting site info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List all pages on the site
   */
  async listPages() {
    try {
      const response = await this.apiClient.request('GET', '/pages/v1/pages');
      return {
        success: true,
        pages: response.data.pages || []
      };
    } catch (error) {
      console.error('Error listing pages:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get page details
   */
  async getPage(pageId) {
    try {
      const response = await this.apiClient.request('GET', `/pages/v1/pages/${pageId}`);
      return {
        success: true,
        page: response.data.page
      };
    } catch (error) {
      console.error('Error getting page:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update page content
   */
  async updatePage(pageId, pageData) {
    try {
      const response = await this.apiClient.request('PATCH', `/pages/v1/pages/${pageId}`, pageData);
      return {
        success: true,
        page: response.data.page
      };
    } catch (error) {
      console.error('Error updating page:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List all products
   */
  async listProducts(options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.offset) queryParams.append('offset', options.offset);
      if (options.query) queryParams.append('query', JSON.stringify(options.query));

      const queryString = queryParams.toString();
      const url = `/stores/v1/products${queryString ? '?' + queryString : ''}`;
      
      const response = await this.apiClient.request('GET', url);
      return {
        success: true,
        products: response.data.products || [],
        total: response.data.totalCount || 0
      };
    } catch (error) {
      console.error('Error listing products:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get product details
   */
  async getProduct(productId) {
    try {
      const response = await this.apiClient.request('GET', `/stores/v1/products/${productId}`);
      return {
        success: true,
        product: response.data.product
      };
    } catch (error) {
      console.error('Error getting product:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create a new product
   */
  async createProduct(productData) {
    try {
      const response = await this.apiClient.request('POST', '/stores/v1/products', {
        product: productData
      });
      return {
        success: true,
        product: response.data.product
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId, productData) {
    try {
      const response = await this.apiClient.request('PATCH', `/stores/v1/products/${productId}`, {
        product: productData
      });
      return {
        success: true,
        product: response.data.product
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List collections (Wix Data)
   */
  async listCollections() {
    try {
      const response = await this.apiClient.request('GET', '/wix-data/v2/collections');
      return {
        success: true,
        collections: response.data.collections || []
      };
    } catch (error) {
      console.error('Error listing collections:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get collection items
   */
  async getCollectionItems(collectionId, options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.offset) queryParams.append('offset', options.offset);
      if (options.query) queryParams.append('query', JSON.stringify(options.query));

      const queryString = queryParams.toString();
      const url = `/wix-data/v2/collections/${collectionId}/items${queryString ? '?' + queryString : ''}`;
      
      const response = await this.apiClient.request('GET', url);
      return {
        success: true,
        items: response.data.items || [],
        total: response.data.totalCount || 0
      };
    } catch (error) {
      console.error('Error getting collection items:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create collection item
   */
  async createCollectionItem(collectionId, itemData) {
    try {
      const response = await this.apiClient.request('POST', `/wix-data/v2/collections/${collectionId}/items`, {
        dataItem: {
          data: itemData
        }
      });
      return {
        success: true,
        item: response.data.dataItem
      };
    } catch (error) {
      console.error('Error creating collection item:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update collection item
   */
  async updateCollectionItem(collectionId, itemId, itemData) {
    try {
      const response = await this.apiClient.request('PATCH', `/wix-data/v2/collections/${collectionId}/items/${itemId}`, {
        dataItem: {
          data: itemData
        }
      });
      return {
        success: true,
        item: response.data.dataItem
      };
    } catch (error) {
      console.error('Error updating collection item:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List blog posts
   */
  async listBlogPosts(options = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.offset) queryParams.append('offset', options.offset);

      const queryString = queryParams.toString();
      const url = `/blog/v1/posts${queryString ? '?' + queryString : ''}`;
      
      const response = await this.apiClient.request('GET', url);
      return {
        success: true,
        posts: response.data.posts || [],
        total: response.data.totalCount || 0
      };
    } catch (error) {
      console.error('Error listing blog posts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create blog post
   */
  async createBlogPost(postData) {
    try {
      const response = await this.apiClient.request('POST', '/blog/v1/posts', {
        post: postData
      });
      return {
        success: true,
        post: response.data.post
      };
    } catch (error) {
      console.error('Error creating blog post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update blog post
   */
  async updateBlogPost(postId, postData) {
    try {
      const response = await this.apiClient.request('PATCH', `/blog/v1/posts/${postId}`, {
        post: postData
      });
      return {
        success: true,
        post: response.data.post
      };
    } catch (error) {
      console.error('Error updating blog post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get site SEO settings
   */
  async getSiteSEO() {
    try {
      const response = await this.apiClient.request('GET', '/sites/v1/site/seo');
      return {
        success: true,
        seo: response.data.seo
      };
    } catch (error) {
      console.error('Error getting site SEO:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update site SEO settings
   */
  async updateSiteSEO(seoData) {
    try {
      const response = await this.apiClient.request('PATCH', '/sites/v1/site/seo', {
        seo: seoData
      });
      return {
        success: true,
        seo: response.data.seo
      };
    } catch (error) {
      console.error('Error updating site SEO:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get page SEO settings
   */
  async getPageSEO(pageId) {
    try {
      const response = await this.apiClient.request('GET', `/pages/v1/pages/${pageId}/seo`);
      return {
        success: true,
        seo: response.data.seo
      };
    } catch (error) {
      console.error('Error getting page SEO:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update page SEO settings
   */
  async updatePageSEO(pageId, seoData) {
    try {
      const response = await this.apiClient.request('PATCH', `/pages/v1/pages/${pageId}/seo`, {
        seo: seoData
      });
      return {
        success: true,
        seo: response.data.seo
      };
    } catch (error) {
      console.error('Error updating page SEO:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = WixEditorConnector;

