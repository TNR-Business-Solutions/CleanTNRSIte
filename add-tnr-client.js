// Script to add TNR Business Solutions as the first client
// Run with: node add-tnr-client.js

const http = require('http');

const clientData = {
  name: "TNR Business Solutions",
  email: "Roy.Turner@tnrbusinesssolutions.com",
  phone: "412-499-2987",
  company: "TNR Business Solutions",
  website: "www.TNRBusinessSolutions.com",
  industry: "Digital Marketing & Insurance Services",
  address: "418 Concord Avenue",
  city: "Greensburg",
  state: "PA",
  zip: "15601",
  services: [
    "Web Design & Development",
    "SEO Services",
    "Social Media Management",
    "Content Creation",
    "Paid Advertising",
    "Email Marketing",
    "Google My Business (GMB) Optimization",
    "Business Listings",
    "Insurance Services",
    "Digital Marketing Consulting"
  ],
  status: "Active",
  source: "Internal",
  notes: "Personal Testing",
  businessType: "Digital Marketing & Insurance Services",
  businessName: "TNR Business Solutions",
  businessAddress: "418 Concord Avenue, Greensburg, PA 15601"
};

const postData = JSON.stringify(clientData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/crm/clients',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.success) {
        console.log('✅ TNR Business Solutions successfully added as client!');
        console.log('Client ID:', response.data.id);
        console.log('\n📧 Welcome email should be sent to:', clientData.email);
        console.log('📧 Notification email should be sent to:', clientData.email);
        console.log('\n✅ Client data saved to serverless database');
      } else {
        console.error('❌ Error:', response.error);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error);
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.log('\n💡 Make sure the server is running on port 3000');
  console.log('   Run: node serve-clean.js');
});

req.write(postData);
req.end();

