// Test CRM conversion by simulating a browser environment
const fs = require('fs');

// Simulate localStorage
global.localStorage = {
  data: {},
  getItem: function(key) {
    return this.data[key] || null;
  },
  setItem: function(key, value) {
    this.data[key] = value;
  },
  removeItem: function(key) {
    delete this.data[key];
  }
};

// Simulate window object
global.window = {
  localStorage: global.localStorage,
  TNRCRMData: null,
  tnrCRM: null
};

// Simulate document object
global.document = {
  readyState: 'complete',
  addEventListener: function() {},
  getElementById: function() { return null; },
  querySelectorAll: function() { return []; },
  createElement: function() { return { appendChild: function() {} }; },
  head: {
    appendChild: function() {}
  }
};

// Load the CRM data class
eval(fs.readFileSync('crm-data.js', 'utf8'));

// Load the form integration class
eval(fs.readFileSync('form-integration.js', 'utf8'));

console.log('🧪 Testing CRM conversion...');

// Test 1: Check if CRM is initialized
console.log('\n1. Checking CRM initialization:');
console.log('TNRCRMData available:', typeof window.TNRCRMData !== 'undefined');
console.log('tnrCRM instance:', window.tnrCRM ? 'Yes' : 'No');

// Test 2: Create a test form submission
console.log('\n2. Creating test form submission:');
const testSubmission = {
  name: 'CRM Test User',
  email: 'crmtest@example.com',
  phone: '555-123-4567',
  company: 'CRM Test Company',
  message: 'This is a test form submission for CRM conversion',
  services: ['Web Design'],
  source: 'CRM Test Script',
  date: new Date().toISOString().split('T')[0],
  status: 'New'
};

console.log('Test submission:', testSubmission);

// Test 3: Process the form submission
console.log('\n3. Processing form submission:');
if (window.tnrFormIntegration) {
  window.tnrFormIntegration.processFormSubmission(testSubmission).then(() => {
    console.log('Form submission processed');
    
    // Test 4: Check if lead was created
    console.log('\n4. Checking lead creation:');
    console.log('Total leads in CRM:', window.tnrCRM.leads.length);
    console.log('New leads:', window.tnrCRM.leads.filter(l => l.status === 'New').length);
    console.log('Form submissions:', window.tnrCRM.formSubmissions.length);
    
    if (window.tnrCRM.leads.length > 0) {
      console.log('Recent leads:');
      window.tnrCRM.leads.slice(-3).forEach(lead => {
        console.log(`- ${lead.name} (${lead.email}) - ${lead.source} - ${lead.status}`);
      });
    }
    
    // Test 5: Check localStorage
    console.log('\n5. Checking localStorage:');
    const storedSubmissions = localStorage.getItem('tnr_form_submissions');
    console.log('Stored submissions:', storedSubmissions ? JSON.parse(storedSubmissions).length : 0);
    
    const storedLeads = localStorage.getItem('tnr_crm_leads');
    console.log('Stored leads:', storedLeads ? JSON.parse(storedLeads).length : 0);
    
    if (window.tnrCRM.leads.length > 0) {
      console.log('\n✅ SUCCESS: Lead was created in CRM!');
    } else {
      console.log('\n❌ FAILURE: No lead was created in CRM');
    }
    
  }).catch(error => {
    console.error('Error processing form submission:', error);
  });
} else {
  console.error('Form integration not available');
}
