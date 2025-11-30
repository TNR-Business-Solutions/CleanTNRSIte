/**
 * Wix Content Manager
 * Handles content management operations: pages, blog posts, collections, elements
 */

const WixAPIClient = require('./wix-api-client');

class WixContentManager {
  constructor(instanceId) {
    this.client = new WixAPIClient(instanceId);
  }

  /**
   * Get all pages
   */
  async getPages() {
    try {
      const response = await this.client.request('GET', '/site-search/v1/site-search/pages');
      return {
        success: true,
        pages: response.data?.pages || []
      };
    } catch (error) {
      console.error('Error getting pages:', error);
      // Fallback: try alternative endpoint
      try {
        const response = await this.client.request('GET', '/pages/v1/pages');
        return {
          success: true,
          pages: response.data?.pages || response.data || []
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: fallbackError.message || 'Failed to get pages'
        };
      }
    }
  }

  /**
   * Create a new page
   */
  async createPage(pageData) {
    try {
      const payload = {
        page: {
          title: pageData.title,
          url: pageData.url || this.generateSlug(pageData.title),
          description: pageData.description,
          seo: {
            title: pageData.seoTitle || pageData.title,
            description: pageData.seoDescription || pageData.description
          }
        }
      };

      const response = await this.client.request('POST', '/pages/v1/pages', payload);
      return {
        success: true,
        page: response.data
      };
    } catch (error) {
      console.error('Error creating page:', error);
      return {
        success: false,
        error: error.message || 'Failed to create page'
      };
    }
  }

  /**
   * Update an existing page
   */
  async updatePage(pageId, pageData) {
    try {
      const payload = {
        page: {
          title: pageData.title,
          url: pageData.url,
          description: pageData.description,
          seo: {
            title: pageData.seoTitle || pageData.title,
            description: pageData.seoDescription || pageData.description
          }
        }
      };

      const response = await this.client.request('PATCH', `/pages/v1/pages/${pageId}`, payload);
      return {
        success: true,
        page: response.data
      };
    } catch (error) {
      console.error('Error updating page:', error);
      return {
        success: false,
        error: error.message || 'Failed to update page'
      };
    }
  }

  /**
   * Delete a page
   */
  async deletePage(pageId) {
    try {
      await this.client.request('DELETE', `/pages/v1/pages/${pageId}`);
      return {
        success: true,
        message: 'Page deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting page:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete page'
      };
    }
  }

  /**
   * Get all blog posts
   */
  async getBlogPosts() {
    try {
      const response = await this.client.request('GET', '/blog/v3/posts');
      return {
        success: true,
        posts: response.data?.posts || response.data || []
      };
    } catch (error) {
      console.error('Error getting blog posts:', error);
      return {
        success: false,
        error: error.message || 'Failed to get blog posts'
      };
    }
  }

  /**
   * Create a new blog post
   */
  async createBlogPost(postData) {
    try {
      const payload = {
        post: {
          title: postData.title,
          slug: postData.url || this.generateSlug(postData.title),
          excerpt: postData.excerpt,
          content: postData.content,
          featuredImage: postData.featuredImage ? {
            url: postData.featuredImage
          } : undefined,
          category: postData.category,
          tags: postData.tags || [],
          publishStatus: postData.status || 'draft',
          publishDate: postData.publishDate || new Date().toISOString()
        }
      };

      const response = await this.client.request('POST', '/blog/v3/posts', payload);
      return {
        success: true,
        post: response.data
      };
    } catch (error) {
      console.error('Error creating blog post:', error);
      return {
        success: false,
        error: error.message || 'Failed to create blog post'
      };
    }
  }

  /**
   * Update an existing blog post
   */
  async updateBlogPost(postId, postData) {
    try {
      const payload = {
        post: {
          title: postData.title,
          slug: postData.url,
          excerpt: postData.excerpt,
          content: postData.content,
          featuredImage: postData.featuredImage ? {
            url: postData.featuredImage
          } : undefined,
          category: postData.category,
          tags: postData.tags || [],
          publishStatus: postData.status,
          publishDate: postData.publishDate
        }
      };

      const response = await this.client.request('PATCH', `/blog/v3/posts/${postId}`, payload);
      return {
        success: true,
        post: response.data
      };
    } catch (error) {
      console.error('Error updating blog post:', error);
      return {
        success: false,
        error: error.message || 'Failed to update blog post'
      };
    }
  }

  /**
   * Delete a blog post
   */
  async deleteBlogPost(postId) {
    try {
      await this.client.request('DELETE', `/blog/v3/posts/${postId}`);
      return {
        success: true,
        message: 'Blog post deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete blog post'
      };
    }
  }

  /**
   * Get all collections (CMS collections)
   */
  async getCollections() {
    try {
      const response = await this.client.request('GET', '/wix-data/v2/collections');
      return {
        success: true,
        collections: response.data?.collections || response.data || []
      };
    } catch (error) {
      console.error('Error getting collections:', error);
      return {
        success: false,
        error: error.message || 'Failed to get collections'
      };
    }
  }

  /**
   * Get items from a collection
   */
  async getCollectionItems(collectionId, options = {}) {
    try {
      const query = new URLSearchParams();
      if (options.limit) query.append('limit', options.limit);
      if (options.offset) query.append('offset', options.offset);
      
      const response = await this.client.request('GET', `/wix-data/v2/collections/${collectionId}/items?${query}`);
      return {
        success: true,
        items: response.data?.items || response.data || []
      };
    } catch (error) {
      console.error('Error getting collection items:', error);
      return {
        success: false,
        error: error.message || 'Failed to get collection items'
      };
    }
  }

  /**
   * Get page elements (content elements on a page)
   */
  async getPageElements(pageId) {
    try {
      // Try to get page structure
      const pageResponse = await this.client.request('GET', `/pages/v1/pages/${pageId}`);
      
      // Extract elements from page structure
      // Note: This is a simplified version - actual implementation depends on Wix API structure
      const elements = [];
      
      if (pageResponse.data?.page?.elements) {
        pageResponse.data.page.elements.forEach((element, index) => {
          elements.push({
            id: element.id || `element-${index}`,
            type: element.type || 'unknown',
            content: element.text || element.html || '',
            position: element.position
          });
        });
      }
      
      return {
        success: true,
        elements: elements
      };
    } catch (error) {
      console.error('Error getting page elements:', error);
      return {
        success: false,
        error: error.message || 'Failed to get page elements',
        elements: []
      };
    }
  }

  /**
   * Generate URL slug from title
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

module.exports = WixContentManager;

