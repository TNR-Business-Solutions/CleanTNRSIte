// TNR Business Solutions - Asset Minification Script
// Minifies CSS and JavaScript files for production deployment

const fs = require("fs");
const path = require("path");

// Simple minification functions (in production, use proper minifiers like terser, clean-css)
function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\s*{\s*/g, "{") // Remove spaces around braces
    .replace(/\s*}\s*/g, "}") // Remove spaces around braces
    .replace(/\s*;\s*/g, ";") // Remove spaces around semicolons
    .replace(/\s*:\s*/g, ":") // Remove spaces around colons
    .replace(/\s*,\s*/g, ",") // Remove spaces around commas
    .replace(/\s*>\s*/g, ">") // Remove spaces around >
    .replace(/\s*\+\s*/g, "+") // Remove spaces around +
    .replace(/\s*~\s*/g, "~") // Remove spaces around ~
    .replace(/\s*\[\s*/g, "[") // Remove spaces around [
    .replace(/\s*\]\s*/g, "]") // Remove spaces around ]
    .replace(/\s*\(\s*/g, "(") // Remove spaces around (
    .replace(/\s*\)\s*/g, ")") // Remove spaces around )
    .trim();
}

function minifyJS(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove block comments
    .replace(/\/\/.*$/gm, "") // Remove line comments
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\s*{\s*/g, "{") // Remove spaces around braces
    .replace(/\s*}\s*/g, "}") // Remove spaces around braces
    .replace(/\s*;\s*/g, ";") // Remove spaces around semicolons
    .replace(/\s*:\s*/g, ":") // Remove spaces around colons
    .replace(/\s*,\s*/g, ",") // Remove spaces around commas
    .replace(/\s*\(\s*/g, "(") // Remove spaces around (
    .replace(/\s*\)\s*/g, ")") // Remove spaces around )
    .replace(/\s*\[\s*/g, "[") // Remove spaces around [
    .replace(/\s*\]\s*/g, "]") // Remove spaces around ]
    .replace(/\s*\+\s*/g, "+") // Remove spaces around +
    .replace(/\s*-\s*/g, "-") // Remove spaces around -
    .replace(/\s*\*\s*/g, "*") // Remove spaces around *
    .replace(/\s*\/\s*/g, "/") // Remove spaces around /
    .replace(/\s*=\s*/g, "=") // Remove spaces around =
    .replace(/\s*!\s*/g, "!") // Remove spaces around !
    .replace(/\s*<\s*/g, "<") // Remove spaces around <
    .replace(/\s*>\s*/g, ">") // Remove spaces around >
    .replace(/\s*&\s*/g, "&") // Remove spaces around &
    .replace(/\s*\|\s*/g, "|") // Remove spaces around |
    .replace(/\s*\?\s*/g, "?") // Remove spaces around ?
    .replace(/\s*%\s*/g, "%") // Remove spaces around %
    .replace(/\s*^\s*/g, "^") // Remove spaces around ^
    .replace(/\s*~\s*/g, "~") // Remove spaces around ~
    .replace(/\s*\.\s*/g, ".") // Remove spaces around .
    .replace(/\s*#\s*/g, "#") // Remove spaces around #
    .replace(/\s*@\s*/g, "@") // Remove spaces around @
    .replace(/\s*$\s*/g, "$") // Remove spaces around $
    .replace(/\s*#\s*/g, "#") // Remove spaces around #
    .replace(/\s*!\s*/g, "!") // Remove spaces around !
    .replace(/\s*%\s*/g, "%") // Remove spaces around %
    .replace(/\s*&\s*/g, "&") // Remove spaces around &
    .replace(/\s*\*\s*/g, "*") // Remove spaces around *
    .replace(/\s*\+\s*/g, "+") // Remove spaces around +
    .replace(/\s*,\s*/g, ",") // Remove spaces around commas
    .replace(/\s*-\s*/g, "-") // Remove spaces around -
    .replace(/\s*\.\s*/g, ".") // Remove spaces around .
    .replace(/\s*\/\s*/g, "/") // Remove spaces around /
    .replace(/\s*:\s*/g, ":") // Remove spaces around colons
    .replace(/\s*;\s*/g, ";") // Remove spaces around semicolons
    .replace(/\s*<\s*/g, "<") // Remove spaces around <
    .replace(/\s*=\s*/g, "=") // Remove spaces around =
    .replace(/\s*>\s*/g, ">") // Remove spaces around >
    .replace(/\s*\?\s*/g, "?") // Remove spaces around ?
    .replace(/\s*@\s*/g, "@") // Remove spaces around @
    .replace(/\s*\[\s*/g, "[") // Remove spaces around [
    .replace(/\s*\\\s*/g, "\\") // Remove spaces around \
    .replace(/\s*\]\s*/g, "]") // Remove spaces around ]
    .replace(/\s*^\s*/g, "^") // Remove spaces around ^
    .replace(/\s*_\s*/g, "_") // Remove spaces around _
    .replace(/\s*`\s*/g, "`") // Remove spaces around `
    .replace(/\s*{\s*/g, "{") // Remove spaces around {
    .replace(/\s*|\s*/g, "|") // Remove spaces around |
    .replace(/\s*}\s*/g, "}") // Remove spaces around }
    .replace(/\s*~\s*/g, "~") // Remove spaces around ~
    .trim();
}

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
  {
    input: "serve-clean.js",
    output: "serve-clean.min.js",
    type: "js",
  },
];

// Minify a single file
function minifyFile(inputPath, outputPath, type) {
  try {
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  File not found: ${inputPath}`);
      return false;
    }

    const content = fs.readFileSync(inputPath, "utf8");
    const minified = type === "css" ? minifyCSS(content) : minifyJS(content);

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, minified);

    const originalSize = Buffer.byteLength(content, "utf8");
    const minifiedSize = Buffer.byteLength(minified, "utf8");
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
    console.error(`❌ Error minifying ${inputPath}:`, error.message);
    return false;
  }
}

// Main minification function
function minifyAll() {
  console.log("🔧 TNR Business Solutions - Asset Minification");
  console.log("==============================================");

  let successCount = 0;
  let totalCount = filesToMinify.length;

  filesToMinify.forEach((file) => {
    if (minifyFile(file.input, file.output, file.type)) {
      successCount++;
    }
  });

  console.log("\n📊 Minification Summary:");
  console.log(`✅ Successfully minified: ${successCount}/${totalCount} files`);

  if (successCount === totalCount) {
    console.log("🎉 All files minified successfully!");
  } else {
    console.log("⚠️  Some files failed to minify. Check the errors above.");
  }

  return successCount === totalCount;
}

// Run minification if this script is executed directly
if (require.main === module) {
  minifyAll();
}

module.exports = {
  minifyAll,
  minifyFile,
  minifyCSS,
  minifyJS,
};
