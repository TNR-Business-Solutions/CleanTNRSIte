// Image Lazy Loading and Optimization Script
// Automatically adds lazy loading to all images on the page

document.addEventListener('DOMContentLoaded', function() {
  // Add lazy loading to all images that don't have it
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    img.setAttribute('loading', 'lazy');
    
    // Add decoding="async" for better performance
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });

  // Add rel="noopener noreferrer" to external links
  const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="tnrbusinesssolutions.com"])');
  externalLinks.forEach(link => {
    if (!link.hasAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer');
    } else if (!link.getAttribute('rel').includes('noopener')) {
      link.setAttribute('rel', link.getAttribute('rel') + ' noopener noreferrer');
    }
    
    // Add target="_blank" if not set
    if (!link.hasAttribute('target')) {
      link.setAttribute('target', '_blank');
    }
  });

  console.log('✅ SEO Optimizations Applied:', {
    lazyImages: images.length,
    securedExternalLinks: externalLinks.length
  });
});
