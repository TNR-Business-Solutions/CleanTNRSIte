// Migration script to add missing columns to leads table
const TNRDatabase = require("./database");

async function migrateLeadsTable() {
  const db = new TNRDatabase();
  try {
    await db.initialize();
    
    console.log("🔄 Starting leads table migration...");
    
    const columnsToAdd = [
      { name: "businessType", type: "TEXT" },
      { name: "businessName", type: "TEXT" },
      { name: "businessAddress", type: "TEXT" },
      { name: "interest", type: "TEXT" },
    ];
    
    if (db.usePostgres) {
      // PostgreSQL migration
      for (const col of columnsToAdd) {
        try {
          await db.execute(
            `ALTER TABLE leads ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`
          );
          console.log(`✅ Added column: ${col.name}`);
        } catch (err) {
          if (err.message.includes("already exists") || err.message.includes("duplicate")) {
            console.log(`ℹ️  Column ${col.name} already exists`);
          } else {
            console.error(`❌ Error adding ${col.name}:`, err.message);
          }
        }
      }
    } else {
      // SQLite migration
      for (const col of columnsToAdd) {
        try {
          // SQLite doesn't support IF NOT EXISTS in ALTER TABLE
          // Check if column exists first
          const tableInfo = await db.query("PRAGMA table_info(leads)");
          const columnExists = tableInfo.some(row => row.name === col.name);
          
          if (!columnExists) {
            await db.execute(
              `ALTER TABLE leads ADD COLUMN "${col.name}" ${col.type}`
            );
            console.log(`✅ Added column: ${col.name}`);
          } else {
            console.log(`ℹ️  Column ${col.name} already exists`);
          }
        } catch (err) {
          console.error(`❌ Error adding ${col.name}:`, err.message);
        }
      }
    }
    
    console.log("\n✅ Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  }
}

migrateLeadsTable();

