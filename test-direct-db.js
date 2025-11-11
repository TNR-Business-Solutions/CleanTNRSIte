// Test direct database insertion
const TNRDatabase = require('./database');

async function test() {
  const db = new TNRDatabase();
  await db.initialize();
  
  const clientData = {
    name: "TNR Business Solutions",
    email: "Roy.Turner@TNRBusinessSolutions.com",
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
  
  try {
    console.log('Adding client directly to database...');
    const client = await db.addClient(clientData);
    console.log('✅ Client added successfully!');
    console.log('Client ID:', client.id);
    console.log('Name:', client.name);
    console.log('Email:', client.email);
    console.log('Services:', client.services.length);
    
    // Verify it was saved
    const clients = await db.getClients();
    const saved = clients.find(c => c.id === client.id);
    if (saved) {
      console.log('\n✅ Client verified in database!');
      console.log('Notes:', saved.notes);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();

