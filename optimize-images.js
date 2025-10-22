// TNR Business Solutions - Image Optimization Script
// Optimizes images for faster loading and better performance

const fs = require("fs");
const path = require("path");

// Image optimization configuration
const IMAGE_CONFIG = {
  // Maximum dimensions for different image types
  maxDimensions: {
    hero: { width: 1200, height: 800 },
    card: { width: 400, height: 300 },
    thumbnail: { width: 200, height: 200 },
    logo: { width: 300, height: 100 },
    icon: { width: 64, height: 64 },
  },

  // Quality settings
  quality: {
    jpeg: 85,
    png: 90,
    webp: 80,
  },

  // File size limits (in bytes)
  maxFileSize: {
    hero: 500000, // 500KB
    card: 100000, // 100KB
    thumbnail: 50000, // 50KB
    logo: 50000, // 50KB
    icon: 20000, // 20KB
  },
};

// Critical images that need optimization
const criticalImages = [
  {
    path: "media/logo.png",
    type: "logo",
    description: "Main logo",
  },
  {
    path: "media/web-design-laptop.jpg",
    type: "card",
    description: "Web design service image",
  },
  {
    path: "media/seo-analytics-dashboard.jpg",
    type: "card",
    description: "SEO service image",
  },
  {
    path: "media/social-media-marketing.jpg",
    type: "card",
    description: "Social media service image",
  },
  {
    path: "media/paid-advertising-dashboard.jpg",
    type: "card",
    description: "Paid advertising service image",
  },
  {
    path: "media/auto-insurance-car.jpg",
    type: "card",
    description: "Auto insurance service image",
  },
  {
    path: "media/home-insurance-protection.jpg",
    type: "card",
    description: "Home insurance service image",
  },
  {
    path: "media/business-team-meeting.jpg",
    type: "card",
    description: "Business insurance service image",
  },
  {
    path: "media/generated-imagelifeinsurance1.png",
    type: "card",
    description: "Life insurance service image",
  },
  {
    path: "media/reviewqrcode.png",
    type: "icon",
    description: "Review QR code",
  },
];

// Image analysis results
const analysisResults = {
  totalImages: 0,
  optimizedImages: 0,
  oversizedImages: 0,
  missingImages: 0,
  totalSize: 0,
  optimizedSize: 0,
  details: [],
};

// Analyze image file
function analyzeImage(imagePath, imageType) {
  const result = {
    path: imagePath,
    type: imageType,
    exists: false,
    size: 0,
    needsOptimization: false,
    issues: [],
  };

  try {
    if (fs.existsSync(imagePath)) {
      result.exists = true;
      const stats = fs.statSync(imagePath);
      result.size = stats.size;
      analysisResults.totalSize += result.size;

      // Check if image is oversized
      const maxSize = IMAGE_CONFIG.maxFileSize[imageType];
      if (result.size > maxSize) {
        result.needsOptimization = true;
        result.issues.push(
          `File size ${Math.round(
            result.size / 1024
          )}KB exceeds limit of ${Math.round(maxSize / 1024)}KB`
        );
        analysisResults.oversizedImages++;
      }

      // Check file extension
      const ext = path.extname(imagePath).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp", ".svg"].includes(ext)) {
        result.issues.push(`Unsupported file format: ${ext}`);
      }

      analysisResults.optimizedImages++;
    } else {
      result.issues.push("File not found");
      analysisResults.missingImages++;
    }
  } catch (error) {
    result.issues.push(`Error analyzing file: ${error.message}`);
  }

  analysisResults.details.push(result);
  return result;
}

// Generate optimization recommendations
function generateOptimizationRecommendations() {
  const recommendations = [];

  // Check for oversized images
  const oversizedImages = analysisResults.details.filter(
    (img) => img.needsOptimization
  );
  if (oversizedImages.length > 0) {
    recommendations.push({
      priority: "HIGH",
      category: "File Size",
      message: `${oversizedImages.length} images exceed recommended file size limits`,
      action: "Compress these images to reduce loading time",
      images: oversizedImages.map((img) => img.path),
    });
  }

  // Check for missing images
  const missingImages = analysisResults.details.filter((img) => !img.exists);
  if (missingImages.length > 0) {
    recommendations.push({
      priority: "HIGH",
      category: "Missing Files",
      message: `${missingImages.length} critical images are missing`,
      action: "Add these images to prevent broken links",
      images: missingImages.map((img) => img.path),
    });
  }

  // Check for non-optimized formats
  const nonOptimizedImages = analysisResults.details.filter((img) => {
    if (!img.exists) return false;
    const ext = path.extname(img.path).toLowerCase();
    return ![".webp", ".svg"].includes(ext) && img.size > 50000; // 50KB
  });

  if (nonOptimizedImages.length > 0) {
    recommendations.push({
      priority: "MEDIUM",
      category: "Format Optimization",
      message: `${nonOptimizedImages.length} images could benefit from WebP format`,
      action: "Convert large images to WebP for better compression",
      images: nonOptimizedImages.map((img) => img.path),
    });
  }

  return recommendations;
}

// Generate image optimization report
function generateReport() {
  console.log("\n📊 IMAGE OPTIMIZATION REPORT");
  console.log("============================");
  console.log(`Total Images Analyzed: ${analysisResults.totalImages}`);
  console.log(`Images Found: ${analysisResults.optimizedImages}`);
  console.log(`Missing Images: ${analysisResults.missingImages}`);
  console.log(`Oversized Images: ${analysisResults.oversizedImages}`);
  console.log(`Total Size: ${Math.round(analysisResults.totalSize / 1024)}KB`);

  // Generate recommendations
  const recommendations = generateOptimizationRecommendations();

  if (recommendations.length > 0) {
    console.log("\n🔧 OPTIMIZATION RECOMMENDATIONS:");
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. [${rec.priority}] ${rec.category}`);
      console.log(`   Issue: ${rec.message}`);
      console.log(`   Action: ${rec.action}`);
      if (rec.images.length <= 5) {
        console.log(`   Files: ${rec.images.join(", ")}`);
      } else {
        console.log(
          `   Files: ${rec.images.slice(0, 5).join(", ")} and ${
            rec.images.length - 5
          } more`
        );
      }
    });
  } else {
    console.log("\n✅ All images are properly optimized!");
  }

  // Save detailed report
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalImages: analysisResults.totalImages,
      foundImages: analysisResults.optimizedImages,
      missingImages: analysisResults.missingImages,
      oversizedImages: analysisResults.oversizedImages,
      totalSize: analysisResults.totalSize,
    },
    details: analysisResults.details,
    recommendations: recommendations,
  };

  fs.writeFileSync(
    "image-optimization-report.json",
    JSON.stringify(reportData, null, 2)
  );
  console.log("\n📄 Detailed report saved to image-optimization-report.json");

  return recommendations;
}

// Create image optimization guide
function createOptimizationGuide() {
  const guide = `# TNR Business Solutions - Image Optimization Guide

## Current Status
- Total Images: ${analysisResults.totalImages}
- Found Images: ${analysisResults.optimizedImages}
- Missing Images: ${analysisResults.missingImages}
- Oversized Images: ${analysisResults.oversizedImages}
- Total Size: ${Math.round(analysisResults.totalSize / 1024)}KB

## Optimization Recommendations

### 1. File Size Optimization
${analysisResults.details
  .filter((img) => img.needsOptimization)
  .map(
    (img) =>
      `- **${img.path}**: ${Math.round(img.size / 1024)}KB (exceeds limit)`
  )
  .join("\n")}

### 2. Missing Images
${analysisResults.details
  .filter((img) => !img.exists)
  .map((img) => `- **${img.path}**: ${img.type} - ${img.description}`)
  .join("\n")}

### 3. Format Optimization
Consider converting large images to WebP format for better compression:
${analysisResults.details
  .filter((img) => {
    if (!img.exists) return false;
    const ext = path.extname(img.path).toLowerCase();
    return ![".webp", ".svg"].includes(ext) && img.size > 50000;
  })
  .map((img) => `- ${img.path}`)
  .join("\n")}

## Tools for Image Optimization

### Online Tools
- **TinyPNG**: https://tinypng.com/ (PNG/JPEG compression)
- **Squoosh**: https://squoosh.app/ (Google's image optimizer)
- **ImageOptim**: https://imageoptim.com/ (Mac app)

### Command Line Tools
- **ImageMagick**: For batch processing
- **Sharp**: Node.js image processing library
- **WebP tools**: For WebP conversion

## Implementation Steps

1. **Fix Missing Images**: Add all missing critical images
2. **Compress Oversized Images**: Reduce file sizes to recommended limits
3. **Convert to WebP**: Convert large images to WebP format
4. **Add Lazy Loading**: Implement lazy loading for images below the fold
5. **Use Responsive Images**: Implement srcset for different screen sizes

## Performance Impact

Optimizing images can improve:
- Page load speed by 20-40%
- Mobile performance significantly
- SEO rankings
- User experience
- Bandwidth usage

## Next Steps

1. Run this analysis regularly
2. Monitor Core Web Vitals
3. Test on different devices and connections
4. Consider CDN for image delivery
`;

  fs.writeFileSync("IMAGE_OPTIMIZATION_GUIDE.md", guide);
  console.log(
    "📖 Image optimization guide saved to IMAGE_OPTIMIZATION_GUIDE.md"
  );
}

// Main optimization function
function optimizeImages() {
  console.log("🖼️  TNR Business Solutions - Image Optimization Analysis");
  console.log("=======================================================");

  // Analyze all critical images
  criticalImages.forEach((image) => {
    analysisResults.totalImages++;
    analyzeImage(image.path, image.type);
  });

  // Generate report
  const recommendations = generateReport();

  // Create optimization guide
  createOptimizationGuide();

  // Return success status
  return (
    analysisResults.missingImages === 0 && analysisResults.oversizedImages === 0
  );
}

// Run optimization if this script is executed directly
if (require.main === module) {
  const success = optimizeImages();
  process.exit(success ? 0 : 1);
}

module.exports = {
  optimizeImages,
  analyzeImage,
  generateReport,
  createOptimizationGuide,
};
