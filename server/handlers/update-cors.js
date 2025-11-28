// Script to update all handlers to use CORS utility
// This is a helper script - run manually to update files

const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'submit-form.js',
  'post-to-facebook.js',
  'check-facebook-permissions.js',
  'instagram-webhooks.js',
  'whatsapp-webhooks.js',
  'meta-webhooks.js',
  'wix-webhooks.js',
  'settings-api.js',
  'campaign-api.js',
  'post-to-instagram.js',
  'analytics-api.js',
  'activities-api.js',
  'email-templates-api.js',
  'workflows-api.js',
  'checkout.js'
];

// Pattern to find and replace
const corsPattern = /res\.setHeader\(['"]Access-Control-Allow-Origin['"],\s*['"]\*['"]\);/g;
const corsPattern2 = /res\.header\(['"]Access-Control-Allow-Origin['"],\s*['"]\*['"]\);/g;

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import at top if not present
    if (!content.includes('cors-utils')) {
      const importLine = "const { setCorsHeaders, handleCorsPreflight } = require('./cors-utils');\n";
      // Find first line after comments/requires
      const lines = content.split('\n');
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('require') || lines[i].trim() === '' || lines[i].startsWith('//')) {
          insertIndex = i + 1;
        } else {
          break;
        }
      }
      lines.splice(insertIndex, 0, importLine);
      content = lines.join('\n');
    }
    
    // Replace CORS headers
    content = content.replace(corsPattern, '// CORS handled by cors-utils');
    content = content.replace(corsPattern2, '// CORS handled by cors-utils');
    
    // Add CORS handling in function
    if (content.includes('module.exports') && !content.includes('handleCorsPreflight')) {
      // Find the function start
      const functionMatch = content.match(/(module\.exports\s*=\s*async\s*\([^)]*\)\s*=>\s*\{)/);
      if (functionMatch) {
        const afterMatch = functionMatch.index + functionMatch[0].length;
        const beforeBody = content.substring(0, afterMatch);
        const afterBody = content.substring(afterMatch);
        
        // Add CORS handling
        const corsCode = `
  // Handle CORS
  const origin = req.headers.origin || req.headers.referer;
  if (handleCorsPreflight(req, res)) {
    return;
  }
  setCorsHeaders(res, origin);
`;
        content = beforeBody + corsCode + afterBody;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('CORS update complete!');

