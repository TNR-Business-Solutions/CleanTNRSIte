/**
 * Clear all CRM data and test lead count functionality
 */

console.log('🧹 Clearing all CRM data from localStorage...');

// Clear all CRM-related data
localStorage.removeItem('tnr_crm_clients');
localStorage.removeItem('tnr_crm_leads');
localStorage.removeItem('tnr_crm_orders');
localStorage.removeItem('tnr_form_submissions');

console.log('✅ All CRM data cleared!');

// Verify data is cleared
console.log('🔍 Verification:');
console.log('- Clients:', localStorage.getItem('tnr_crm_clients') || 'null');
console.log('- Leads:', localStorage.getItem('tnr_crm_leads') || 'null');
console.log('- Orders:', localStorage.getItem('tnr_crm_orders') || 'null');
console.log('- Form Submissions:', localStorage.getItem('tnr_form_submissions') || 'null');

// Test CRM initialization
console.log('\n🧪 Testing CRM initialization...');
if (typeof window !== 'undefined' && window.TNRCRMData) {
  const crm = new window.TNRCRMData();
  const stats = crm.getStats();
  console.log('📊 CRM Stats after clear:', stats);
  
  // Test adding a lead
  console.log('\n➕ Testing lead creation...');
  const testLead = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '555-1234',
    company: 'Test Company',
    source: 'Test',
    status: 'New',
    date: new Date().toISOString().split('T')[0]
  };
  
  const newLead = crm.addLead(testLead);
  console.log('✅ Lead created:', newLead);
  
  const updatedStats = crm.getStats();
  console.log('📊 Updated stats:', updatedStats);
  
  if (updatedStats.newLeads === 1) {
    console.log('🎉 Lead count is working correctly!');
  } else {
    console.log('❌ Lead count is not working properly');
  }
} else {
  console.log('❌ CRM not available in this environment');
}

console.log('\n📋 Next steps:');
console.log('1. Refresh the admin dashboard');
console.log('2. All counts should show 0');
console.log('3. Submit a form to test lead creation');
console.log('4. Check that lead count updates correctly');
