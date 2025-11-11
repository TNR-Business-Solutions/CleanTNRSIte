// Debug database insert
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
  services: ["Web Design", "SEO Services"],
  status: "Active",
  source: "Internal",
  notes: "Personal Testing",
  businessType: "Digital Marketing & Insurance Services",
  businessName: "TNR Business Solutions",
  businessAddress: "418 Concord Avenue, Greensburg, PA 15601"
};

const clientId = `client-${Date.now()}`;

const values = [
  clientId,                    // 1
  clientData.name,             // 2
  clientData.email || null,    // 3
  clientData.phone || null,    // 4
  clientData.company || null,  // 5
  clientData.website || null,  // 6
  clientData.industry || null, // 7
  clientData.address || null,  // 8
  clientData.city || null,     // 9
  clientData.state || null,    // 10
  clientData.zip || null,      // 11
  JSON.stringify(clientData.services || []), // 12
  clientData.status || "Active", // 13
  new Date().toISOString().split("T")[0], // 14 joinDate
  new Date().toISOString().split("T")[0], // 15 lastContact
  clientData.notes || null,    // 16
  clientData.source || "Manual Entry", // 17
  new Date().toISOString(),    // 18 createdAt
  new Date().toISOString(),    // 19 updatedAt
  clientData.businessType || null, // 20
  clientData.businessName || clientData.company || null, // 21
  clientData.businessAddress || clientData.address || null, // 22
  clientData.interest || null, // 23
];

console.log('Values array length:', values.length);
console.log('Expected: 23');
values.forEach((v, i) => {
  console.log(`${i + 1}. ${v}`);
});

