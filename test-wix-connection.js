/**
 * Test Wix Connection Script
 * Tests the connection to Wix sites and verifies all functionality
 */

const WixEditorConnector = require("./wix-editor-connector");
const { clientTokensDB } = require("./server/handlers/auth-wix-callback");
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

class ConnectionTester {
  constructor(instanceId) {
    this.instanceId = instanceId;
    this.connector = new WixEditorConnector(instanceId);
    this.results = {
      passed: [],
      failed: [],
      warnings: [],
      startTime: Date.now(),
    };
  }

  async testAll() {
    log("\n🧪 Testing Wix Connection", "bright");
    log("═".repeat(60), "cyan");
    log(`Instance ID: ${this.instanceId}`, "blue");
    log("", "reset");

    // Test 1: Site Info
    await this.testSiteInfo();

    // Test 2: List Pages
    await this.testListPages();

    // Test 3: Get Page Details
    await this.testGetPage();

    // Test 4: List Products
    await this.testListProducts();

    // Test 5: Get Product Details
    await this.testGetProduct();

    // Test 6: List Collections
    await this.testListCollections();

    // Test 7: Get Collection Items
    await this.testGetCollectionItems();

    // Test 8: List Blog Posts
    await this.testListBlogPosts();

    // Test 9: Get Site SEO
    await this.testGetSiteSEO();

    // Test 10: Get Page SEO
    await this.testGetPageSEO();

    // Print Summary
    this.printSummary();
  }

  async testSiteInfo() {
    log("\n📊 Test 1: Get Site Information", "cyan");
    try {
      const result = await this.connector.getSiteInfo();
      if (result.success) {
        log("  ✅ Site info retrieved successfully", "green");
        log(`     Site ID: ${result.site?.id || "N/A"}`, "blue");
        log(`     Site Name: ${result.site?.displayName || "N/A"}`, "blue");
        this.results.passed.push("Get Site Info");
      } else {
        log(`  ❌ Failed: ${result.error}`, "red");
        this.results.failed.push(`Get Site Info: ${result.error}`);
      }
    } catch (error) {
      log(`  ❌ Error: ${error.message}`, "red");
      this.results.failed.push(`Get Site Info: ${error.message}`);
    }
  }

  async testListPages() {
    log("\n📄 Test 2: List Pages", "cyan");
    try {
      const result = await this.connector.listPages();
      if (result.success) {
        log(
          `  ✅ Pages listed successfully (${result.pages.length} pages)`,
          "green"
        );
        if (result.pages.length > 0) {
          log(
            `     First page: ${result.pages[0].title || result.pages[0].id}`,
            "blue"
          );
          this.testPageId = result.pages[0].id; // Store for later tests
        }
        this.results.passed.push("List Pages");
      } else {
        log(`  ❌ Failed: ${result.error}`, "red");
        this.results.failed.push(`List Pages: ${result.error}`);
      }
    } catch (error) {
      log(`  ❌ Error: ${error.message}`, "red");
      this.results.failed.push(`List Pages: ${error.message}`);
    }
  }

  async testGetPage() {
    log("\n📄 Test 3: Get Page Details", "cyan");
    if (!this.testPageId) {
      log("  ⚠️  Skipped (no page ID available)", "yellow");
      this.results.warnings.push("Get Page Details: No page ID");
      return;
    }

    try {
      const result = await this.connector.getPage(this.testPageId);
      if (result.success) {
        log("  ✅ Page details retrieved successfully", "green");
        log(`     Page Title: ${result.page?.title || "N/A"}`, "blue");
        this.results.passed.push("Get Page Details");
      } else {
        log(`  ❌ Failed: ${result.error}`, "red");
        this.results.failed.push(`Get Page Details: ${result.error}`);
      }
    } catch (error) {
      log(`  ❌ Error: ${error.message}`, "red");
      this.results.failed.push(`Get Page Details: ${error.message}`);
    }
  }

  async testListProducts() {
    log("\n🛍️  Test 4: List Products", "cyan");
    try {
      const result = await this.connector.listProducts({ limit: 5 });
      if (result.success) {
        log(
          `  ✅ Products listed successfully (${result.total} total, showing ${result.products.length})`,
          "green"
        );
        if (result.products.length > 0) {
          log(
            `     First product: ${
              result.products[0].name || result.products[0].id
            }`,
            "blue"
          );
          this.testProductId = result.products[0].id; // Store for later tests
        }
        this.results.passed.push("List Products");
      } else {
        log(`  ⚠️  Warning: ${result.error}`, "yellow");
        this.results.warnings.push(`List Products: ${result.error}`);
      }
    } catch (error) {
      log(`  ⚠️  Warning: ${error.message}`, "yellow");
      this.results.warnings.push(`List Products: ${error.message}`);
    }
  }

  async testGetProduct() {
    log("\n🛍️  Test 5: Get Product Details", "cyan");
    if (!this.testProductId) {
      log("  ⚠️  Skipped (no product ID available)", "yellow");
      this.results.warnings.push("Get Product Details: No product ID");
      return;
    }

    try {
      const result = await this.connector.getProduct(this.testProductId);
      if (result.success) {
        log("  ✅ Product details retrieved successfully", "green");
        log(`     Product Name: ${result.product?.name || "N/A"}`, "blue");
        this.results.passed.push("Get Product Details");
      } else {
        log(`  ⚠️  Warning: ${result.error}`, "yellow");
        this.results.warnings.push(`Get Product Details: ${result.error}`);
      }
    } catch (error) {
      log(`  ⚠️  Warning: ${error.message}`, "yellow");
      this.results.warnings.push(`Get Product Details: ${error.message}`);
    }
  }

  async testListCollections() {
    log("\n📚 Test 6: List Collections", "cyan");
    try {
      const result = await this.connector.listCollections();
      if (result.success) {
        log(
          `  ✅ Collections listed successfully (${result.collections.length} collections)`,
          "green"
        );
        if (result.collections.length > 0) {
          log(
            `     First collection: ${
              result.collections[0].displayName || result.collections[0].id
            }`,
            "blue"
          );
          this.testCollectionId = result.collections[0].id; // Store for later tests
        }
        this.results.passed.push("List Collections");
      } else {
        log(`  ⚠️  Warning: ${result.error}`, "yellow");
        this.results.warnings.push(`List Collections: ${result.error}`);
      }
    } catch (error) {
      log(`  ⚠️  Warning: ${error.message}`, "yellow");
      this.results.warnings.push(`List Collections: ${error.message}`);
    }
  }

  async testGetCollectionItems() {
    log("\n📦 Test 7: Get Collection Items", "cyan");
    if (!this.testCollectionId) {
      log("  ⚠️  Skipped (no collection ID available)", "yellow");
      this.results.warnings.push("Get Collection Items: No collection ID");
      return;
    }

    try {
      const result = await this.connector.getCollectionItems(
        this.testCollectionId,
        { limit: 5 }
      );
      if (result.success) {
        log(
          `  ✅ Collection items retrieved successfully (${result.total} total, showing ${result.items.length})`,
          "green"
        );
        this.results.passed.push("Get Collection Items");
      } else {
        log(`  ⚠️  Warning: ${result.error}`, "yellow");
        this.results.warnings.push(`Get Collection Items: ${result.error}`);
      }
    } catch (error) {
      log(`  ⚠️  Warning: ${error.message}`, "yellow");
      this.results.warnings.push(`Get Collection Items: ${error.message}`);
    }
  }

  async testListBlogPosts() {
    log("\n📰 Test 8: List Blog Posts", "cyan");
    try {
      const result = await this.connector.listBlogPosts({ limit: 5 });
      if (result.success) {
        log(
          `  ✅ Blog posts listed successfully (${result.total} total, showing ${result.posts.length})`,
          "green"
        );
        this.results.passed.push("List Blog Posts");
      } else {
        log(`  ⚠️  Warning: ${result.error}`, "yellow");
        this.results.warnings.push(`List Blog Posts: ${result.error}`);
      }
    } catch (error) {
      log(`  ⚠️  Warning: ${error.message}`, "yellow");
      this.results.warnings.push(`List Blog Posts: ${error.message}`);
    }
  }

  async testGetSiteSEO() {
    log("\n🔍 Test 9: Get Site SEO", "cyan");
    try {
      const result = await this.connector.getSiteSEO();
      if (result.success) {
        log("  ✅ Site SEO retrieved successfully", "green");
        log(`     Title: ${result.seo?.title || "N/A"}`, "blue");
        this.results.passed.push("Get Site SEO");
      } else {
        log(`  ⚠️  Warning: ${result.error}`, "yellow");
        this.results.warnings.push(`Get Site SEO: ${result.error}`);
      }
    } catch (error) {
      log(`  ⚠️  Warning: ${error.message}`, "yellow");
      this.results.warnings.push(`Get Site SEO: ${error.message}`);
    }
  }

  async testGetPageSEO() {
    log("\n🔍 Test 10: Get Page SEO", "cyan");
    if (!this.testPageId) {
      log("  ⚠️  Skipped (no page ID available)", "yellow");
      this.results.warnings.push("Get Page SEO: No page ID");
      return;
    }

    try {
      const result = await this.connector.getPageSEO(this.testPageId);
      if (result.success) {
        log("  ✅ Page SEO retrieved successfully", "green");
        log(`     Title: ${result.seo?.title || "N/A"}`, "blue");
        this.results.passed.push("Get Page SEO");
      } else {
        log(`  ⚠️  Warning: ${result.error}`, "yellow");
        this.results.warnings.push(`Get Page SEO: ${result.error}`);
      }
    } catch (error) {
      log(`  ⚠️  Warning: ${error.message}`, "yellow");
      this.results.warnings.push(`Get Page SEO: ${error.message}`);
    }
  }

  printSummary() {
    const duration = ((Date.now() - this.results.startTime) / 1000).toFixed(2);

    log("\n" + "═".repeat(60), "cyan");
    log("📊 Test Results Summary", "bright");
    log("═".repeat(60), "cyan");
    log(`✅ Passed: ${this.results.passed.length}`, "green");
    log(
      `❌ Failed: ${this.results.failed.length}`,
      this.results.failed.length > 0 ? "red" : "green"
    );
    log(
      `⚠️  Warnings: ${this.results.warnings.length}`,
      this.results.warnings.length > 0 ? "yellow" : "green"
    );
    log(`⏱️  Duration: ${duration}s`, "blue");
    log("", "reset");

    if (this.results.passed.length > 0) {
      log("✅ Passed Tests:", "green");
      this.results.passed.forEach((test) => log(`   - ${test}`, "reset"));
      log("", "reset");
    }

    if (this.results.failed.length > 0) {
      log("❌ Failed Tests:", "red");
      this.results.failed.forEach((test) => log(`   - ${test}`, "reset"));
      log("", "reset");
    }

    if (this.results.warnings.length > 0) {
      log("⚠️  Warnings:", "yellow");
      this.results.warnings.forEach((test) => log(`   - ${test}`, "reset"));
      log("", "reset");
    }

    // Overall Status
    if (this.results.failed.length === 0 && this.results.passed.length > 0) {
      log("🎉 All critical tests passed! Connection is working.", "green");
    } else if (this.results.failed.length > 0) {
      log("⚠️  Some tests failed. Please check the errors above.", "yellow");
    } else {
      log("ℹ️  No tests could be completed. Check your connection.", "yellow");
    }

    log("", "reset");
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const instanceId = args[0];

  if (!instanceId) {
    log("❌ Error: Instance ID required", "red");
    log("\nUsage:", "yellow");
    log("  node test-wix-connection.js <instanceId>", "reset");
    log("\nTo get your instance ID:", "yellow");
    log("  node wix-cli-commands.js list-clients", "reset");
    log("\nOr test all connected clients:", "yellow");
    log("  node test-wix-connection.js --all", "reset");
    return;
  }

  if (instanceId === "--all") {
    // Test all connected clients
    const clients = Array.from(clientTokensDB.entries()).map(([id, data]) => ({
      instanceId: id,
      clientId: data.metadata?.clientId || "Unknown",
      isValid: data.expiresAt > Date.now(),
    }));

    if (clients.length === 0) {
      log("❌ No connected clients found.", "red");
      log("\nTo connect a client:", "yellow");
      log("  node wix-cli-commands.js connect <clientId>", "reset");
      return;
    }

    log(`\n🧪 Testing ${clients.length} connected client(s)...`, "bright");

    for (const client of clients) {
      if (!client.isValid) {
        log(`\n⚠️  Skipping ${client.clientId} (token expired)`, "yellow");
        continue;
      }

      log(`\n${"═".repeat(60)}`, "cyan");
      log(`Testing: ${client.clientId} (${client.instanceId})`, "bright");
      log("═".repeat(60), "cyan");

      const tester = new ConnectionTester(client.instanceId);
      await tester.testAll();
    }
  } else {
    // Test single instance
    const tester = new ConnectionTester(instanceId);
    await tester.testAll();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  });
}

module.exports = { ConnectionTester };
