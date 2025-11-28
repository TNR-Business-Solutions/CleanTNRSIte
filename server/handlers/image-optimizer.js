// Image Optimization Utility
// Converts images to WebP and creates responsive versions

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Convert image to WebP format
 * @param {string} inputPath - Input image path
 * @param {string} outputPath - Output WebP path
 * @param {object} options - Conversion options
 * @returns {Promise<string>} - Output path
 */
async function convertToWebP(inputPath, outputPath, options = {}) {
  const {
    quality = 85,
    width = null,
    height = null
  } = options;

  try {
    let sharpInstance = sharp(inputPath);

    // Resize if dimensions provided
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to WebP
    await sharpInstance
      .webp({ quality })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error(`Error converting ${inputPath} to WebP:`, error);
    throw error;
  }
}

/**
 * Create responsive image set (multiple sizes)
 * @param {string} inputPath - Input image path
 * @param {string} baseName - Base name for output files
 * @param {string} outputDir - Output directory
 * @returns {Promise<object>} - Object with srcset and sizes
 */
async function createResponsiveImages(inputPath, baseName, outputDir) {
  const sizes = [
    { width: 480, suffix: '480' },
    { width: 768, suffix: '768' },
    { width: 1024, suffix: '1024' },
    { width: 1920, suffix: '1920' }
  ];

  const srcset = [];
  const webpSrcset = [];

  for (const size of sizes) {
    const webpPath = path.join(outputDir, `${baseName}-${size.suffix}.webp`);
    await convertToWebP(inputPath, webpPath, { width: size.width });
    
    webpSrcset.push(`/media/optimized/${baseName}-${size.suffix}.webp ${size.width}w`);
  }

  // Create fallback (original size, WebP)
  const fallbackWebp = path.join(outputDir, `${baseName}.webp`);
  await convertToWebP(inputPath, fallbackWebp);

  return {
    webpSrcset: webpSrcset.join(', '),
    fallbackWebp: `/media/optimized/${baseName}.webp`,
    sizes: '(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw'
  };
}

/**
 * Optimize single image
 * @param {string} imagePath - Path to image
 * @returns {Promise<object>} - Optimization result
 */
async function optimizeImage(imagePath) {
  try {
    const stats = await fs.stat(imagePath);
    const originalSize = stats.size;
    
    const ext = path.extname(imagePath);
    const baseName = path.basename(imagePath, ext);
    const dir = path.dirname(imagePath);
    const optimizedDir = path.join(dir, 'optimized');
    
    // Create optimized directory if it doesn't exist
    await fs.mkdir(optimizedDir, { recursive: true });
    
    const webpPath = path.join(optimizedDir, `${baseName}.webp`);
    await convertToWebP(imagePath, webpPath);
    
    const webpStats = await fs.stat(webpPath);
    const newSize = webpStats.size;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    
    return {
      original: imagePath,
      optimized: webpPath,
      originalSize,
      newSize,
      savings: `${savings}%`
    };
  } catch (error) {
    console.error(`Error optimizing ${imagePath}:`, error);
    throw error;
  }
}

/**
 * Generate responsive image HTML
 * @param {string} imagePath - Original image path
 * @param {string} alt - Alt text
 * @param {string} className - CSS class
 * @returns {Promise<string>} - HTML string
 */
async function generateResponsiveImageHTML(imagePath, alt = '', className = '') {
  const ext = path.extname(imagePath);
  const baseName = path.basename(imagePath, ext);
  const dir = path.dirname(imagePath);
  const optimizedDir = path.join(dir, 'optimized');
  
  try {
    const responsive = await createResponsiveImages(imagePath, baseName, optimizedDir);
    
    return `
<picture class="${className}">
  <source srcset="${responsive.webpSrcset}" 
          sizes="${responsive.sizes}" 
          type="image/webp">
  <img src="${responsive.fallbackWebp}" 
       alt="${alt}" 
       loading="lazy"
       class="${className}">
</picture>`.trim();
  } catch (error) {
    // Fallback to original image if optimization fails
    console.error('Error generating responsive image, using fallback:', error);
    return `<img src="${imagePath}" alt="${alt}" loading="lazy" class="${className}">`;
  }
}

module.exports = {
  convertToWebP,
  createResponsiveImages,
  optimizeImage,
  generateResponsiveImageHTML
};

