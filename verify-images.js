// Image Verification Script for Deployment
// This script checks if all critical images exist and are accessible

const fs = require("fs");
const path = require("path");

const criticalImages = [
  "media/logo.png",
  "media/web-design-laptop.jpg",
  "media/seo-analytics-dashboard.jpg",
  "media/social-media-marketing.jpg",
  "media/paid-advertising-dashboard.jpg",
  "media/auto-insurance-car.jpg",
  "media/home-insurance-protection.jpg",
  "media/business-team-meeting.jpg",
  "media/generated-imagelifeinsurance1.png",
  "media/reviewqrcode.png",
];

console.log("TNR Business Solutions - Image Verification");
console.log("==========================================");

let allGood = true;
let totalSize = 0;

criticalImages.forEach((imagePath) => {
  try {
    const stats = fs.statSync(imagePath);
    const sizeKB = Math.round(stats.size / 1024);
    totalSize += stats.size;

    if (stats.size === 0) {
      console.log(`❌ ${imagePath} - EMPTY FILE (0 bytes)`);
      allGood = false;
    } else {
      console.log(`✅ ${imagePath} - ${sizeKB}KB`);
    }
  } catch (error) {
    console.log(`❌ ${imagePath} - NOT FOUND`);
    allGood = false;
  }
});

console.log("==========================================");
console.log(`Total images checked: ${criticalImages.length}`);
console.log(`Total size: ${Math.round(totalSize / 1024)}KB`);

if (allGood) {
  console.log("✅ All critical images are present and have content");
  process.exit(0);
} else {
  console.log("❌ Some images are missing or corrupted");
  process.exit(1);
}
