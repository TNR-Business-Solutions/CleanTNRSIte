// TNR Business Solutions - Production Minification Script
// Uses proper minifiers for CSS and JavaScript

const fs = require("fs");
const path = require("path");
const terser = require("terser");
const CleanCSS = require("clean-css");

// Files to minify
const filesToMinify = [
  {
    input: "assets/styles.css",
    output: "assets/styles.min.css",
    type: "css",
  },
  {
    input: "form-integration.js",
    output: "form-integration.min.js",
    type: "js",
  },
  {
    input: "cart-handler.js",
    output: "cart-handler.min.js",
    type: "js",
  },
  {
    input: "email-handler.js",
    output: "email-handler.min.js",
    type: "js",
  },
  {
    input: "email-service.js",
    output: "email-service.min.js",
    type: "js",
  },
  {
    input: "crm-data.js",
    output: "crm-data.min.js",
    type: "js",
  },
];

// Minify CSS using CleanCSS
async function minifyCSS(inputPath, outputPath) {
  try {
    const content = fs.readFileSync(inputPath, "utf8");

    const cleanCSS = new CleanCSS({
      level: 2,
      format: "beautify",
    });

    const result = cleanCSS.minify(content);

    if (result.errors.length > 0) {
      console.error(`CSS errors in ${inputPath}:`, result.errors);
      return false;
    }

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, result.styles);

    const originalSize = Buffer.byteLength(content, "utf8");
    const minifiedSize = Buffer.byteLength(result.styles, "utf8");
    const savings = (
      ((originalSize - minifiedSize) / originalSize) *
      100
    ).toFixed(1);

    console.log(`✅ ${inputPath} → ${outputPath}`);
    console.log(`   Original: ${originalSize} bytes`);
    console.log(`   Minified: ${minifiedSize} bytes`);
    console.log(`   Savings: ${savings}%`);

    return true;
  } catch (error) {
    console.error(`❌ Error minifying CSS ${inputPath}:`, error.message);
    return false;
  }
}

// Minify JavaScript using Terser
async function minifyJS(inputPath, outputPath) {
  try {
    const content = fs.readFileSync(inputPath, "utf8");

    const result = await terser.minify(content, {
      compress: {
        drop_console: true, // Remove console.log statements
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ["console.log", "console.info", "console.debug"], // Remove specific functions
        passes: 2,
      },
      mangle: {
        toplevel: false, // Don't mangle top-level names
      },
      format: {
        comments: false, // Remove comments
      },
    });

    if (result.error) {
      console.error(`JavaScript error in ${inputPath}:`, result.error);
      return false;
    }

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, result.code);

    const originalSize = Buffer.byteLength(content, "utf8");
    const minifiedSize = Buffer.byteLength(result.code, "utf8");
    const savings = (
      ((originalSize - minifiedSize) / originalSize) *
      100
    ).toFixed(1);

    console.log(`✅ ${inputPath} → ${outputPath}`);
    console.log(`   Original: ${originalSize} bytes`);
    console.log(`   Minified: ${minifiedSize} bytes`);
    console.log(`   Savings: ${savings}%`);

    return true;
  } catch (error) {
    console.error(`❌ Error minifying JS ${inputPath}:`, error.message);
    return false;
  }
}

// Minify a single file
async function minifyFile(inputPath, outputPath, type) {
  if (!fs.existsSync(inputPath)) {
    console.log(`⚠️  File not found: ${inputPath}`);
    return false;
  }

  if (type === "css") {
    return await minifyCSS(inputPath, outputPath);
  } else if (type === "js") {
    return await minifyJS(inputPath, outputPath);
  }

  return false;
}

// Main minification function
async function minifyAll() {
  console.log("🔧 TNR Business Solutions - Production Asset Minification");
  console.log("=========================================================");

  let successCount = 0;
  let totalCount = filesToMinify.length;

  for (const file of filesToMinify) {
    if (await minifyFile(file.input, file.output, file.type)) {
      successCount++;
    }
  }

  console.log("\n📊 Minification Summary:");
  console.log(`✅ Successfully minified: ${successCount}/${totalCount} files`);

  if (successCount === totalCount) {
    console.log("🎉 All files minified successfully!");

    // Create a production build info file
    const buildInfo = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      minifiedFiles: filesToMinify.map((f) => f.output),
      buildType: "production",
    };

    fs.writeFileSync("build-info.json", JSON.stringify(buildInfo, null, 2));
    console.log("📄 Build info saved to build-info.json");
  } else {
    console.log("⚠️  Some files failed to minify. Check the errors above.");
  }

  return successCount === totalCount;
}

// Run minification if this script is executed directly
if (require.main === module) {
  minifyAll().catch((error) => {
    console.error("Minification failed:", error);
    process.exit(1);
  });
}

module.exports = {
  minifyAll,
  minifyFile,
  minifyCSS,
  minifyJS,
};
