// Quick script to check database schema
const TNRDatabase = require("./database");

async function checkSchema() {
  const db = new TNRDatabase();
  try {
    await db.initialize();

    console.log("Checking leads table schema...");

    // Try to get table info
    if (db.usePostgres) {
      // PostgreSQL
      const result = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'leads' 
        ORDER BY ordinal_position
      `);
      console.log("\n📋 Current leads table schema (Postgres):");
      result.forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.column_name} (${row.data_type})`);
      });
      console.log(`\nTotal columns: ${result.length}`);
    } else {
      // SQLite
      const result = await db.query("PRAGMA table_info(leads)");
      console.log("\n📋 Current leads table schema (SQLite):");
      result.forEach((row, i) => {
        console.log(`  ${i + 1}. ${row.name} (${row.type})`);
      });
      console.log(`\nTotal columns: ${result.length}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking schema:", error.message);
    console.error(
      "Table may not exist yet - this is OK, it will be created on first use"
    );
    process.exit(0);
  }
}

checkSchema();
