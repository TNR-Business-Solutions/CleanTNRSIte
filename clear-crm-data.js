/**
 * Clear all CRM data from localStorage
 */

console.log("🧹 Clearing all CRM data from localStorage...");

// Clear all CRM-related data
localStorage.removeItem("tnr_crm_clients");
localStorage.removeItem("tnr_crm_leads");
localStorage.removeItem("tnr_crm_orders");
localStorage.removeItem("tnr_form_submissions");

console.log("✅ All CRM data cleared!");
console.log("📊 CRM should now show 0s across the board");

// Verify data is cleared
console.log("🔍 Verification:");
console.log("- Clients:", localStorage.getItem("tnr_crm_clients") || "null");
console.log("- Leads:", localStorage.getItem("tnr_crm_leads") || "null");
console.log("- Orders:", localStorage.getItem("tnr_crm_orders") || "null");
console.log(
  "- Form Submissions:",
  localStorage.getItem("tnr_form_submissions") || "null"
);
