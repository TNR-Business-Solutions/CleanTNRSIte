/**
 * Build "She's All That & More" Site Script
 * Automatically builds a Wix site based on www.Shesallthatandmore.com
 */

const WixEditorConnector = require("./wix-editor-connector");
const { clientTokensDB } = require("./server/handlers/auth-wix-callback");
const tokenManager = require("./server/handlers/wix-token-manager");
const fs = require("fs");
const path = require("path");

// Color output helpers
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Site data structure based on www.Shesallthatandmore.com
const siteData = {
  site: {
    title: "Shop Plus Size Fashion at She's All That & More",
    description: "Trendy Clothing for Larger Women",
    keywords: [
      "plus size",
      "fashion",
      "clothing",
      "women",
      "boutique",
      "larger women",
      "trendy clothing",
    ],
    seo: {
      title:
        "Shop Plus Size Fashion at She's All That & More | Trendy Clothing for Larger Women",
      description:
        "Discover trendy plus size fashion at She's All That & More. Shop stylish clothing designed for larger women. Find dresses, tops, bottoms, and accessories in extended sizes.",
      keywords:
        "plus size fashion, plus size clothing, trendy plus size, larger women clothing, plus size boutique",
    },
  },
  pages: [
    {
      title: "Home",
      url: "/",
      description:
        "Homepage featuring latest collections and featured products",
      seo: {
        title:
          "Shop Plus Size Fashion at She's All That & More | Trendy Clothing for Larger Women",
        description:
          "Discover trendy plus size fashion at She's All That & More. Shop stylish clothing designed for larger women.",
      },
    },
    {
      title: "Shop",
      url: "/shop",
      description: "Browse all products",
      seo: {
        title: "Shop All Plus Size Clothing | She's All That & More",
        description:
          "Browse our complete collection of plus size clothing including dresses, tops, bottoms, and accessories.",
      },
    },
    {
      title: "Dresses",
      url: "/dresses",
      description: "Plus size dresses collection",
      seo: {
        title: "Plus Size Dresses | She's All That & More",
        description:
          "Shop trendy plus size dresses in extended sizes. Find the perfect dress for any occasion.",
      },
    },
    {
      title: "Tops & Blouses",
      url: "/tops",
      description: "Plus size tops and blouses",
      seo: {
        title: "Plus Size Tops & Blouses | She's All That & More",
        description:
          "Discover stylish plus size tops and blouses in a variety of styles and sizes.",
      },
    },
    {
      title: "Bottoms",
      url: "/bottoms",
      description: "Plus size pants, jeans, and skirts",
      seo: {
        title:
          "Plus Size Bottoms | Pants, Jeans & Skirts | She's All That & More",
        description:
          "Shop comfortable and stylish plus size bottoms including pants, jeans, and skirts.",
      },
    },
    {
      title: "Accessories",
      url: "/accessories",
      description: "Plus size accessories",
      seo: {
        title: "Plus Size Accessories | She's All That & More",
        description:
          "Complete your look with our collection of plus size accessories.",
      },
    },
    {
      title: "Sale",
      url: "/sale",
      description: "Sale items and special offers",
      seo: {
        title: "Plus Size Sale | Discounted Clothing | She's All That & More",
        description:
          "Shop our sale section for discounted plus size clothing and special offers.",
      },
    },
    {
      title: "About Us",
      url: "/about",
      description: "Learn about She's All That & More",
      seo: {
        title: "About Us | She's All That & More",
        description:
          "Learn about She's All That & More, your destination for trendy plus size fashion.",
      },
    },
    {
      title: "Contact",
      url: "/contact",
      description: "Contact information and form",
      seo: {
        title: "Contact Us | She's All That & More",
        description:
          "Get in touch with She's All That & More. We're here to help with your fashion needs.",
      },
    },
    {
      title: "Size Guide",
      url: "/size-guide",
      description: "Size chart and fitting guide",
      seo: {
        title: "Size Guide | Plus Size Sizing Chart | She's All That & More",
        description:
          "Find your perfect fit with our comprehensive plus size sizing guide.",
      },
    },
    {
      title: "Shipping & Returns",
      url: "/shipping-returns",
      description: "Shipping and return policy",
      seo: {
        title: "Shipping & Returns Policy | She's All That & More",
        description:
          "Learn about our shipping and returns policy for plus size clothing.",
      },
    },
  ],
  collections: [
    {
      name: "All Products",
      description: "Complete product catalog",
    },
    {
      name: "Dresses",
      description: "Plus size dresses in various styles",
    },
    {
      name: "Tops & Blouses",
      description: "Plus size tops and blouses",
    },
    {
      name: "Pants & Jeans",
      description: "Plus size pants and jeans",
    },
    {
      name: "Skirts",
      description: "Plus size skirts",
    },
    {
      name: "Jackets & Coats",
      description: "Plus size outerwear",
    },
    {
      name: "Accessories",
      description: "Plus size accessories",
    },
    {
      name: "Sale Items",
      description: "Discounted plus size clothing",
    },
    {
      name: "New Arrivals",
      description: "Latest plus size fashion arrivals",
    },
  ],
  products: [
    // Sample products - in production, these would be scraped from the source site
    {
      name: "Floral Print Plus Size Maxi Dress",
      price: 49.99,
      salePrice: 39.99,
      description:
        "Beautiful floral print maxi dress perfect for any occasion. Made from comfortable, breathable fabric.",
      sku: "DRS-001",
      stock: 25,
      category: "Dresses",
      tags: ["dress", "maxi", "floral", "plus size"],
      sizes: ["1X", "2X", "3X", "4X", "5X"],
      colors: ["Navy Blue", "Rose Pink", "Lavender"],
    },
    {
      name: "Classic Plus Size Blouse",
      price: 34.99,
      description:
        "Versatile blouse that pairs with everything. Perfect for work or casual wear.",
      sku: "TOP-001",
      stock: 30,
      category: "Tops & Blouses",
      tags: ["blouse", "classic", "plus size"],
      sizes: ["1X", "2X", "3X", "4X"],
      colors: ["White", "Black", "Navy"],
    },
    {
      name: "Comfort Fit Plus Size Jeans",
      price: 44.99,
      description:
        "Comfortable stretch jeans with a perfect fit. Available in multiple washes.",
      sku: "JNS-001",
      stock: 20,
      category: "Pants & Jeans",
      tags: ["jeans", "comfort fit", "plus size"],
      sizes: ["18", "20", "22", "24", "26"],
      colors: ["Dark Wash", "Medium Wash", "Light Wash"],
    },
  ],
};

class SiteBuilder {
  constructor(instanceId) {
    this.instanceId = instanceId;
    this.connector = new WixEditorConnector(instanceId);
    this.stats = {
      pagesUpdated: 0,
      productsCreated: 0,
      seoUpdated: 0,
      errors: [],
    };
  }

  async build() {
    log('\n🏗️  Building "She\'s All That & More" Site', "bright");
    log("═".repeat(60), "cyan");
    log(`Instance ID: ${this.instanceId}`, "blue");
    log("", "reset");

    try {
      // Step 1: Update Site SEO
      await this.updateSiteSEO();

      // Step 2: Update/Create Pages
      await this.updatePages();

      // Step 3: Create Products
      await this.createProducts();

      // Step 4: Summary
      this.printSummary();
    } catch (error) {
      log(`\n❌ Build failed: ${error.message}`, "red");
      console.error(error);
      process.exit(1);
    }
  }

  async updateSiteSEO() {
    log("\n📝 Step 1: Updating Site SEO...", "cyan");

    try {
      const result = await this.connector.updateSiteSEO({
        title: siteData.site.seo.title,
        description: siteData.site.seo.description,
        keywords: siteData.site.seo.keywords,
      });

      if (result.success) {
        log("✅ Site SEO updated successfully", "green");
        this.stats.seoUpdated++;
      } else {
        log(`⚠️  Site SEO update: ${result.error}`, "yellow");
        this.stats.errors.push(`Site SEO: ${result.error}`);
      }
    } catch (error) {
      log(`❌ Error updating site SEO: ${error.message}`, "red");
      this.stats.errors.push(`Site SEO: ${error.message}`);
    }
  }

  async updatePages() {
    log("\n📄 Step 2: Updating Pages...", "cyan");

    try {
      // Get existing pages
      const pagesResult = await this.connector.listPages();

      if (!pagesResult.success) {
        log(`⚠️  Could not list pages: ${pagesResult.error}`, "yellow");
        return;
      }

      const existingPages = pagesResult.pages || [];
      log(`Found ${existingPages.length} existing pages`, "blue");

      // Update each page
      for (const pageData of siteData.pages) {
        try {
          // Find matching page by title or URL
          let page = existingPages.find(
            (p) =>
              p.title === pageData.title ||
              p.url === pageData.url ||
              p.url === pageData.url.replace(/^\//, "")
          );

          if (page) {
            log(`  Updating page: ${pageData.title}`, "reset");

            // Update page content
            const updateResult = await this.connector.updatePage(page.id, {
              title: pageData.title,
              description: pageData.description,
            });

            if (updateResult.success) {
              // Update page SEO
              const seoResult = await this.connector.updatePageSEO(page.id, {
                title: pageData.seo.title,
                description: pageData.seo.description,
              });

              if (seoResult.success) {
                log(`    ✅ ${pageData.title} - Updated`, "green");
                this.stats.pagesUpdated++;
              } else {
                log(`    ⚠️  ${pageData.title} - SEO update failed`, "yellow");
              }
            } else {
              log(
                `    ⚠️  ${pageData.title} - Update failed: ${updateResult.error}`,
                "yellow"
              );
            }
          } else {
            log(`  ⚠️  Page not found: ${pageData.title}`, "yellow");
            log(`     (Create this page manually in Wix Editor)`, "yellow");
          }
        } catch (error) {
          log(
            `  ❌ Error updating page ${pageData.title}: ${error.message}`,
            "red"
          );
          this.stats.errors.push(`Page ${pageData.title}: ${error.message}`);
        }
      }
    } catch (error) {
      log(`❌ Error in page update process: ${error.message}`, "red");
      this.stats.errors.push(`Pages: ${error.message}`);
    }
  }

  async createProducts() {
    log("\n🛍️  Step 3: Creating Products...", "cyan");

    try {
      // Get existing products to avoid duplicates
      const existingProductsResult = await this.connector.listProducts({
        limit: 100,
      });
      const existingProducts = existingProductsResult.success
        ? existingProductsResult.products
        : [];
      const existingSkus = new Set(
        existingProducts.map((p) => p.sku).filter(Boolean)
      );

      log(`Found ${existingProducts.length} existing products`, "blue");

      // Create products
      for (const productData of siteData.products) {
        try {
          // Skip if product already exists
          if (existingSkus.has(productData.sku)) {
            log(
              `  ⏭️  Skipping ${productData.name} (already exists)`,
              "yellow"
            );
            continue;
          }

          log(`  Creating: ${productData.name}`, "reset");

          // Build product options for sizes and colors
          const productOptions = {
            options: [],
          };

          if (productData.sizes && productData.sizes.length > 0) {
            productOptions.options.push({
              name: "Size",
              choices: productData.sizes,
            });
          }

          if (productData.colors && productData.colors.length > 0) {
            productOptions.options.push({
              name: "Color",
              choices: productData.colors,
            });
          }

          // Create product
          const productPayload = {
            name: productData.name,
            price: productData.price,
            description: productData.description,
            sku: productData.sku,
            inventory: {
              quantity: productData.stock || 0,
              trackQuantity: true,
            },
            productOptions:
              productOptions.options.length > 0 ? productOptions : undefined,
            visible: true,
          };

          if (productData.salePrice) {
            productPayload.price = productData.salePrice;
            productPayload.comparePrice = productData.price;
          }

          const result = await this.connector.createProduct(productPayload);

          if (result.success) {
            log(
              `    ✅ ${productData.name} - Created (ID: ${result.product.id})`,
              "green"
            );
            this.stats.productsCreated++;
          } else {
            log(`    ❌ ${productData.name} - Failed: ${result.error}`, "red");
            this.stats.errors.push(
              `Product ${productData.name}: ${result.error}`
            );
          }

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          log(
            `  ❌ Error creating product ${productData.name}: ${error.message}`,
            "red"
          );
          this.stats.errors.push(
            `Product ${productData.name}: ${error.message}`
          );
        }
      }
    } catch (error) {
      log(`❌ Error in product creation process: ${error.message}`, "red");
      this.stats.errors.push(`Products: ${error.message}`);
    }
  }

  printSummary() {
    log("\n" + "═".repeat(60), "cyan");
    log("📊 Build Summary", "bright");
    log("═".repeat(60), "cyan");
    log(`✅ Site SEO Updated: ${this.stats.seoUpdated}`, "green");
    log(`✅ Pages Updated: ${this.stats.pagesUpdated}`, "green");
    log(`✅ Products Created: ${this.stats.productsCreated}`, "green");

    if (this.stats.errors.length > 0) {
      log(`\n⚠️  Errors: ${this.stats.errors.length}`, "yellow");
      this.stats.errors.forEach((error, index) => {
        log(`  ${index + 1}. ${error}`, "yellow");
      });
    } else {
      log("\n🎉 Build completed successfully with no errors!", "green");
    }

    log("\n", "reset");
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const instanceId = args[0];

  if (!instanceId) {
    log("❌ Error: Instance ID required", "red");
    log("\nUsage:", "yellow");
    log("  node build-shesallthat-site.js <instanceId>", "reset");
    log("\nTo get your instance ID:", "yellow");
    log("  node wix-cli-commands.js list-clients", "reset");
    return;
  }

  // Load tokens from database into memory before building
  log("📥 Loading tokens from database...", "cyan");
  try {
    await tokenManager.loadTokens(clientTokensDB);
    log(`✅ Loaded tokens into memory`, "green");
  } catch (error) {
    log(`⚠️  Warning: Could not load tokens: ${error.message}`, "yellow");
  }

  const builder = new SiteBuilder(instanceId);
  await builder.build();
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  });
}

module.exports = { SiteBuilder, siteData };
