// Direct test of lead insertion
const TNRDatabase = require("./database");

async function testLeadInsert() {
  const db = new TNRDatabase();
  try {
    await db.initialize();
    
    console.log("Testing lead insertion...");
    
    const testLead = {
      name: "Direct Test Lead",
      email: "direct-test@example.com",
      phone: "412-555-0000",
      company: "Test Company",
      source: "Direct Test",
      status: "New",
      date: new Date().toISOString().split("T")[0],
    };
    
    console.log("\nAttempting to create lead...");
    const lead = await db.addLead(testLead);
    
    console.log("✅ Lead created successfully!");
    console.log("Lead ID:", lead.id);
    console.log("Lead Name:", lead.name);
    
    // Verify it was actually saved
    const retrieved = await db.getLead(lead.id);
    if (retrieved) {
      console.log("✅ Lead verified in database");
    } else {
      console.log("❌ Lead not found in database");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

testLeadInsert();

