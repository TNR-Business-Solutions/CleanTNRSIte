// Optimize All Images Script
// Converts all images to WebP and creates responsive versions

const fs = require('fs').promises;
const path = require('path');
const { optimizeImage, generateResponsiveImageHTML } = require('../server/handlers/image-optimizer');

const MEDIA_DIR = path.join(__dirname, '../media');
const OPTIMIZED_DIR = path.join(MEDIA_DIR, 'optimized');

// Image extensions to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

/**
 * Get all image files in directory
 */
async function getAllImages(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && entry.name !== 'optimized') {
      // Recursively search subdirectories
      const subFiles = await getAllImages(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Optimize all images
 */
async function optimizeAllImages() {
  console.log('🖼️  Starting image optimization...\n');
  
  // Create optimized directory
  await fs.mkdir(OPTIMIZED_DIR, { recursive: true });
  
  // Get all images
  const images = await getAllImages(MEDIA_DIR);
  console.log(`Found ${images.length} images to optimize\n`);
  
  const results = [];
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  
  for (const imagePath of images) {
    try {
      console.log(`Processing: ${path.basename(imagePath)}`);
      const result = await optimizeImage(imagePath);
      results.push(result);
      totalOriginalSize += result.originalSize;
      totalNewSize += result.newSize;
      console.log(`  ✅ Optimized: ${result.savings} smaller\n`);
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}\n`);
      results.push({
        original: imagePath,
        error: error.message
      });
    }
  }
  
  // Summary
  const totalSavings = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(2);
  console.log('\n📊 Optimization Summary:');
  console.log(`  Total images: ${images.length}`);
  console.log(`  Successful: ${results.filter(r => !r.error).length}`);
  console.log(`  Failed: ${results.filter(r => r.error).length}`);
  console.log(`  Original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Optimized size: ${(totalNewSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Total savings: ${totalSavings}%`);
  
  // Save results
  const resultsPath = path.join(__dirname, '../image-optimization-results.json');
  await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results saved to: ${resultsPath}`);
  
  return results;
}

// Run if called directly
if (require.main === module) {
  optimizeAllImages()
    .then(() => {
      console.log('\n✅ Image optimization complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { optimizeAllImages };

