/**
 * Wix CLI Commands
 * Command-line interface for managing Wix sites programmatically
 *
 * Usage:
 *   node wix-cli-commands.js list-clients
 *   node wix-cli-commands.js connect <clientId>
 *   node wix-cli-commands.js get-site <instanceId>
 *   node wix-cli-commands.js list-pages <instanceId>
 *   node wix-cli-commands.js list-products <instanceId>
 *   node wix-cli-commands.js create-product <instanceId> <productData.json>
 */

const WixEditorConnector = require("./wix-editor-connector");
const { clientTokensDB } = require("./server/handlers/auth-wix-callback");
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
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Command handlers
async function listClients() {
  log("\n📋 Connected Wix Clients:", "cyan");
  log("─".repeat(50), "cyan");

  const clients = Array.from(clientTokensDB.entries()).map(([id, data]) => ({
    instanceId: id,
    clientId: data.metadata?.clientId || "N/A",
    metasiteId: data.metadata?.metasiteId || "N/A",
    createdAt: new Date(data.createdAt).toLocaleString(),
    expiresAt: new Date(data.expiresAt).toLocaleString(),
    isValid: data.expiresAt > Date.now(),
  }));

  if (clients.length === 0) {
    log("No clients connected.", "yellow");
    log("\nTo connect a client, run:", "yellow");
    log("  node wix-cli-commands.js connect <clientId>", "yellow");
    return;
  }

  clients.forEach((client, index) => {
    log(`\n${index + 1}. Client ID: ${client.clientId}`, "bright");
    log(`   Instance ID: ${client.instanceId}`, "blue");
    log(`   Metasite ID: ${client.metasiteId}`, "blue");
    log(
      `   Status: ${client.isValid ? "✅ Active" : "❌ Expired"}`,
      client.isValid ? "green" : "red"
    );
    log(`   Created: ${client.createdAt}`, "reset");
    log(`   Expires: ${client.expiresAt}`, "reset");
  });

  log("\n", "reset");
}

async function getSiteInfo(instanceId) {
  if (!instanceId) {
    log("❌ Error: Instance ID required", "red");
    log("Usage: node wix-cli-commands.js get-site <instanceId>", "yellow");
    return;
  }

  log(`\n🔍 Getting site info for instance: ${instanceId}`, "cyan");

  try {
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.getSiteInfo();

    if (result.success) {
      log("\n✅ Site Information:", "green");
      log("─".repeat(50), "cyan");
      console.log(JSON.stringify(result.site, null, 2));
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function listPages(instanceId) {
  if (!instanceId) {
    log("❌ Error: Instance ID required", "red");
    log("Usage: node wix-cli-commands.js list-pages <instanceId>", "yellow");
    return;
  }

  log(`\n📄 Listing pages for instance: ${instanceId}`, "cyan");

  try {
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.listPages();

    if (result.success) {
      log(`\n✅ Found ${result.pages.length} pages:`, "green");
      log("─".repeat(50), "cyan");

      result.pages.forEach((page, index) => {
        log(`\n${index + 1}. ${page.title || "Untitled"}`, "bright");
        log(`   ID: ${page.id}`, "blue");
        log(`   URL: ${page.url || "N/A"}`, "blue");
        log(`   Type: ${page.type || "N/A"}`, "blue");
      });
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function listProducts(instanceId, options = {}) {
  if (!instanceId) {
    log("❌ Error: Instance ID required", "red");
    log(
      "Usage: node wix-cli-commands.js list-products <instanceId> [--limit=10]",
      "yellow"
    );
    return;
  }

  log(`\n🛍️  Listing products for instance: ${instanceId}`, "cyan");

  try {
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.listProducts(options);

    if (result.success) {
      log(
        `\n✅ Found ${result.total} products (showing ${result.products.length}):`,
        "green"
      );
      log("─".repeat(50), "cyan");

      result.products.forEach((product, index) => {
        log(`\n${index + 1}. ${product.name || "Untitled"}`, "bright");
        log(`   ID: ${product.id}`, "blue");
        log(`   Price: $${product.price?.toFixed(2) || "0.00"}`, "blue");
        log(`   Stock: ${product.inventory?.quantity || "N/A"}`, "blue");
        log(`   SKU: ${product.sku || "N/A"}`, "blue");
      });
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function createProduct(instanceId, productDataFile) {
  if (!instanceId || !productDataFile) {
    log("❌ Error: Instance ID and product data file required", "red");
    log(
      "Usage: node wix-cli-commands.js create-product <instanceId> <productData.json>",
      "yellow"
    );
    return;
  }

  log(`\n➕ Creating product for instance: ${instanceId}`, "cyan");

  try {
    // Read product data from file
    const productDataPath = path.resolve(productDataFile);
    if (!fs.existsSync(productDataPath)) {
      log(`❌ Error: File not found: ${productDataFile}`, "red");
      return;
    }

    const productData = JSON.parse(fs.readFileSync(productDataPath, "utf8"));
    log(`\n📦 Product Data:`, "cyan");
    console.log(JSON.stringify(productData, null, 2));

    const connector = new WixEditorConnector(instanceId);
    const result = await connector.createProduct(productData);

    if (result.success) {
      log(`\n✅ Product created successfully!`, "green");
      log(`   Product ID: ${result.product.id}`, "blue");
      log(`   Name: ${result.product.name}`, "blue");
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function connectClient(clientId) {
  if (!clientId) {
    log("❌ Error: Client ID required", "red");
    log("Usage: node wix-cli-commands.js connect <clientId>", "yellow");
    return;
  }

  log(`\n🔗 Connecting client: ${clientId}`, "cyan");
  log("\nTo connect, visit this URL in your browser:", "yellow");
  log(`http://localhost:3000/api/auth/wix?clientId=${clientId}`, "bright");
  log("\nOr if running on production:", "yellow");
  log(
    `https://www.tnrbusinesssolutions.com/api/auth/wix?clientId=${clientId}`,
    "bright"
  );
  log(
    "\nAfter authorization, the client will be automatically connected.",
    "cyan"
  );
}

async function updatePage(instanceId, pageId, pageDataFile) {
  if (!instanceId || !pageId || !pageDataFile) {
    log("❌ Error: Instance ID, Page ID, and page data file required", "red");
    log(
      "Usage: node wix-cli-commands.js update-page <instanceId> <pageId> <pageData.json>",
      "yellow"
    );
    return;
  }

  log(`\n📝 Updating page ${pageId} for instance: ${instanceId}`, "cyan");

  try {
    const pageDataPath = path.resolve(pageDataFile);
    if (!fs.existsSync(pageDataPath)) {
      log(`❌ Error: File not found: ${pageDataFile}`, "red");
      return;
    }

    const pageData = JSON.parse(fs.readFileSync(pageDataPath, "utf8"));
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.updatePage(pageId, pageData);

    if (result.success) {
      log(`\n✅ Page updated successfully!`, "green");
      log(`   Page ID: ${result.page.id}`, "blue");
      log(`   Title: ${result.page.title}`, "blue");
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function updateProduct(instanceId, productId, productDataFile) {
  if (!instanceId || !productId || !productDataFile) {
    log(
      "❌ Error: Instance ID, Product ID, and product data file required",
      "red"
    );
    log(
      "Usage: node wix-cli-commands.js update-product <instanceId> <productId> <productData.json>",
      "yellow"
    );
    return;
  }

  log(`\n📝 Updating product ${productId} for instance: ${instanceId}`, "cyan");

  try {
    const productDataPath = path.resolve(productDataFile);
    if (!fs.existsSync(productDataPath)) {
      log(`❌ Error: File not found: ${productDataFile}`, "red");
      return;
    }

    const productData = JSON.parse(fs.readFileSync(productDataPath, "utf8"));
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.updateProduct(productId, productData);

    if (result.success) {
      log(`\n✅ Product updated successfully!`, "green");
      log(`   Product ID: ${result.product.id}`, "blue");
      log(`   Name: ${result.product.name}`, "blue");
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function listCollections(instanceId) {
  if (!instanceId) {
    log("❌ Error: Instance ID required", "red");
    log(
      "Usage: node wix-cli-commands.js list-collections <instanceId>",
      "yellow"
    );
    return;
  }

  log(`\n📚 Listing collections for instance: ${instanceId}`, "cyan");

  try {
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.listCollections();

    if (result.success) {
      log(`\n✅ Found ${result.collections.length} collections:`, "green");
      log("─".repeat(50), "cyan");

      result.collections.forEach((collection, index) => {
        log(
          `\n${index + 1}. ${collection.displayName || collection.id}`,
          "bright"
        );
        log(`   ID: ${collection.id}`, "blue");
        log(`   Type: ${collection.type || "N/A"}`, "blue");
      });
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function getCollectionItems(instanceId, collectionId, options = {}) {
  if (!instanceId || !collectionId) {
    log("❌ Error: Instance ID and Collection ID required", "red");
    log(
      "Usage: node wix-cli-commands.js get-collection-items <instanceId> <collectionId> [--limit=10]",
      "yellow"
    );
    return;
  }

  log(`\n📦 Getting collection items for collection: ${collectionId}`, "cyan");

  try {
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.getCollectionItems(collectionId, options);

    if (result.success) {
      log(
        `\n✅ Found ${result.total} items (showing ${result.items.length}):`,
        "green"
      );
      log("─".repeat(50), "cyan");

      result.items.forEach((item, index) => {
        log(`\n${index + 1}. Item ID: ${item.id}`, "bright");
        log(
          `   Data: ${JSON.stringify(item.data || {}, null, 2).substring(
            0,
            200
          )}...`,
          "blue"
        );
      });
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function listBlogPosts(instanceId, options = {}) {
  if (!instanceId) {
    log("❌ Error: Instance ID required", "red");
    log(
      "Usage: node wix-cli-commands.js list-blog-posts <instanceId> [--limit=10]",
      "yellow"
    );
    return;
  }

  log(`\n📰 Listing blog posts for instance: ${instanceId}`, "cyan");

  try {
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.listBlogPosts(options);

    if (result.success) {
      log(
        `\n✅ Found ${result.total} posts (showing ${result.posts.length}):`,
        "green"
      );
      log("─".repeat(50), "cyan");

      result.posts.forEach((post, index) => {
        log(`\n${index + 1}. ${post.title || "Untitled"}`, "bright");
        log(`   ID: ${post.id}`, "blue");
        log(`   URL: ${post.url || "N/A"}`, "blue");
        log(`   Status: ${post.status || "N/A"}`, "blue");
      });
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function getSiteSEO(instanceId) {
  if (!instanceId) {
    log("❌ Error: Instance ID required", "red");
    log("Usage: node wix-cli-commands.js get-site-seo <instanceId>", "yellow");
    return;
  }

  log(`\n🔍 Getting site SEO for instance: ${instanceId}`, "cyan");

  try {
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.getSiteSEO();

    if (result.success) {
      log("\n✅ Site SEO:", "green");
      log("─".repeat(50), "cyan");
      console.log(JSON.stringify(result.seo, null, 2));
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function updateSiteSEO(instanceId, seoDataFile) {
  if (!instanceId || !seoDataFile) {
    log("❌ Error: Instance ID and SEO data file required", "red");
    log(
      "Usage: node wix-cli-commands.js update-site-seo <instanceId> <seoData.json>",
      "yellow"
    );
    return;
  }

  log(`\n📝 Updating site SEO for instance: ${instanceId}`, "cyan");

  try {
    const seoDataPath = path.resolve(seoDataFile);
    if (!fs.existsSync(seoDataPath)) {
      log(`❌ Error: File not found: ${seoDataFile}`, "red");
      return;
    }

    const seoData = JSON.parse(fs.readFileSync(seoDataPath, "utf8"));
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.updateSiteSEO(seoData);

    if (result.success) {
      log(`\n✅ Site SEO updated successfully!`, "green");
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function getPageSEO(instanceId, pageId) {
  if (!instanceId || !pageId) {
    log("❌ Error: Instance ID and Page ID required", "red");
    log(
      "Usage: node wix-cli-commands.js get-page-seo <instanceId> <pageId>",
      "yellow"
    );
    return;
  }

  log(`\n🔍 Getting page SEO for page: ${pageId}`, "cyan");

  try {
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.getPageSEO(pageId);

    if (result.success) {
      log("\n✅ Page SEO:", "green");
      log("─".repeat(50), "cyan");
      console.log(JSON.stringify(result.seo, null, 2));
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function updatePageSEO(instanceId, pageId, seoDataFile) {
  if (!instanceId || !pageId || !seoDataFile) {
    log("❌ Error: Instance ID, Page ID, and SEO data file required", "red");
    log(
      "Usage: node wix-cli-commands.js update-page-seo <instanceId> <pageId> <seoData.json>",
      "yellow"
    );
    return;
  }

  log(`\n📝 Updating page SEO for page: ${pageId}`, "cyan");

  try {
    const seoDataPath = path.resolve(seoDataFile);
    if (!fs.existsSync(seoDataPath)) {
      log(`❌ Error: File not found: ${seoDataFile}`, "red");
      return;
    }

    const seoData = JSON.parse(fs.readFileSync(seoDataPath, "utf8"));
    const connector = new WixEditorConnector(instanceId);
    const result = await connector.updatePageSEO(pageId, seoData);

    if (result.success) {
      log(`\n✅ Page SEO updated successfully!`, "green");
    } else {
      log(`❌ Error: ${result.error}`, "red");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
  }
}

async function buildSite(instanceId) {
  if (!instanceId) {
    log("❌ Error: Instance ID required", "red");
    log("Usage: node wix-cli-commands.js build-site <instanceId>", "yellow");
    log(
      "\nThis will build the site based on www.Shesallthatandmore.com",
      "yellow"
    );
    return;
  }

  log(`\n🏗️  Building site for instance: ${instanceId}`, "cyan");
  log("This will use the build-shesallthat-site.js script", "yellow");

  try {
    const { SiteBuilder } = require("./build-shesallthat-site");
    const builder = new SiteBuilder(instanceId);
    await builder.build();
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
    console.error(error);
  }
}

// Main command router
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    log("\n📚 Wix CLI Commands", "bright");
    log("═".repeat(60), "cyan");
    log("\n🔗 Client Management:", "bright");
    log("  list-clients              - List all connected clients", "reset");
    log("  connect <clientId>        - Connect a new client", "reset");
    log("\n📊 Site Information:", "bright");
    log("  get-site <instanceId>     - Get site information", "reset");
    log("  get-site-seo <instanceId> - Get site SEO settings", "reset");
    log(
      "  update-site-seo <instanceId> <seoData.json> - Update site SEO",
      "reset"
    );
    log("\n📄 Page Management:", "bright");
    log("  list-pages <instanceId>    - List all pages", "reset");
    log(
      "  update-page <instanceId> <pageId> <pageData.json> - Update page",
      "reset"
    );
    log("  get-page-seo <instanceId> <pageId> - Get page SEO", "reset");
    log(
      "  update-page-seo <instanceId> <pageId> <seoData.json> - Update page SEO",
      "reset"
    );
    log("\n🛍️  Product Management:", "bright");
    log(
      "  list-products <instanceId> [--limit=N] - List all products",
      "reset"
    );
    log(
      "  create-product <instanceId> <productData.json> - Create a product",
      "reset"
    );
    log(
      "  update-product <instanceId> <productId> <productData.json> - Update product",
      "reset"
    );
    log("\n📚 Collection Management:", "bright");
    log("  list-collections <instanceId> - List all collections", "reset");
    log(
      "  get-collection-items <instanceId> <collectionId> [--limit=N] - Get collection items",
      "reset"
    );
    log("\n📰 Blog Management:", "bright");
    log(
      "  list-blog-posts <instanceId> [--limit=N] - List blog posts",
      "reset"
    );
    log("\n🏗️  Site Building:", "bright");
    log("  build-site <instanceId>    - Build site from template", "reset");
    log("\nExamples:", "cyan");
    log("  node wix-cli-commands.js list-clients", "reset");
    log("  node wix-cli-commands.js connect shesallthatandmore", "reset");
    log("  node wix-cli-commands.js get-site <instanceId>", "reset");
    log("  node wix-cli-commands.js list-pages <instanceId>", "reset");
    log("  node wix-cli-commands.js build-site <instanceId>", "reset");
    return;
  }

  try {
    switch (command) {
      case "list-clients":
        await listClients();
        break;

      case "connect":
        await connectClient(args[1]);
        break;

      case "get-site":
        await getSiteInfo(args[1]);
        break;

      case "list-pages":
        await listPages(args[1]);
        break;

      case "list-products":
        const productLimit = args
          .find((arg) => arg.startsWith("--limit="))
          ?.split("=")[1];
        await listProducts(
          args[1],
          productLimit ? { limit: parseInt(productLimit) } : {}
        );
        break;

      case "create-product":
        await createProduct(args[1], args[2]);
        break;

      case "update-product":
        await updateProduct(args[1], args[2], args[3]);
        break;

      case "update-page":
        await updatePage(args[1], args[2], args[3]);
        break;

      case "list-collections":
        await listCollections(args[1]);
        break;

      case "get-collection-items":
        const collectionLimit = args
          .find((arg) => arg.startsWith("--limit="))
          ?.split("=")[1];
        await getCollectionItems(
          args[1],
          args[2],
          collectionLimit ? { limit: parseInt(collectionLimit) } : {}
        );
        break;

      case "list-blog-posts":
        const blogLimit = args
          .find((arg) => arg.startsWith("--limit="))
          ?.split("=")[1];
        await listBlogPosts(
          args[1],
          blogLimit ? { limit: parseInt(blogLimit) } : {}
        );
        break;

      case "get-site-seo":
        await getSiteSEO(args[1]);
        break;

      case "update-site-seo":
        await updateSiteSEO(args[1], args[2]);
        break;

      case "get-page-seo":
        await getPageSEO(args[1], args[2]);
        break;

      case "update-page-seo":
        await updatePageSEO(args[1], args[2], args[3]);
        break;

      case "build-site":
        await buildSite(args[1]);
        break;

      default:
        log(`❌ Unknown command: ${command}`, "red");
        log("Run without arguments to see available commands.", "yellow");
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, "red");
    console.error(error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  listClients,
  getSiteInfo,
  listPages,
  listProducts,
  createProduct,
  updateProduct,
  updatePage,
  listCollections,
  getCollectionItems,
  listBlogPosts,
  getSiteSEO,
  updateSiteSEO,
  getPageSEO,
  updatePageSEO,
  buildSite,
  connectClient,
};
