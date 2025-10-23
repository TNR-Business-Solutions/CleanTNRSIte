/**
 * Comprehensive test of all forms and CRM integration
 */

const http = require('http');

// Test data for all forms
const testForms = [
  {
    name: 'Auto Insurance Form',
    endpoint: '/submit-form',
    data: {
      name: 'Roy Turner',
      email: 'roy.turner@tnrbusinesssolutions.com',
      phone: '4124992987',
      company: 'TNR Business Solutions',
      dateOfBirth: '1989-01-04',
      maritalStatus: 'divorced',
      address: '418 Concord Avenue',
      apartment: 'Suite 100',
      city: 'Greensburg',
      state: 'PA',
      zipCode: '15601',
      licenseNumber: '123456879',
      licenseState: 'PA',
      vehicleYear: '2018',
      vehicleMake: 'chevy',
      vehicleModel: 'malibu',
      vin: '1HGBH41JXMN109186',
      licensePlate: 'ABC1234',
      vehicleUse: 'business',
      annualMileage: '1234',
      vehicleOwnership: 'financed',
      garagingAddress: '418 Concord Avenue, Greensburg, PA 15601',
      yearsLicensed: '5-10',
      accidents: '0',
      trafficViolations: '0',
      duiDwi: 'no',
      licenseSuspended: 'no',
      currentInsurance: 'yes',
      coverageLevel: 'standard',
      deductible: '96',
      roadsideAssistance: 'on',
      rentalCarCoverage: 'on',
      gapInsurance: 'on',
      personalInjuryProtection: 'on',
      uninsuredMotorist: 'on',
      underinsuredMotorist: 'on',
      message: 'Testing comprehensive auto insurance form data capture',
      industry: 'Technology',
      contactMethod: 'email',
      source: 'Auto Insurance Form'
    }
  },
  {
    name: 'Home Insurance Form',
    endpoint: '/submit-form',
    data: {
      name: 'Roy Turner',
      email: 'roy.turner@tnrbusinesssolutions.com',
      phone: '4124992987',
      company: 'TNR Business Solutions',
      dateOfBirth: '1985-01-15',
      maritalStatus: 'married',
      address: '418 Concord Avenue',
      apartment: 'Suite 100',
      city: 'Greensburg',
      state: 'PA',
      zipCode: '15601',
      yearBuilt: '1995',
      propertyType: 'single-family',
      squareFootage: '2500',
      bedrooms: '4',
      bathrooms: '3',
      constructionType: 'frame',
      roofType: 'asphalt',
      homeValue: '350000',
      coverageLevel: 'full',
      deductible: '1000',
      floodInsurance: 'on',
      earthquakeCoverage: 'on',
      sewerBackupCoverage: 'on',
      identityTheftProtection: 'on',
      message: 'Testing home insurance form with comprehensive data capture',
      industry: 'Technology',
      contactMethod: 'email',
      source: 'Home Insurance Form'
    }
  },
  {
    name: 'Life Insurance Form',
    endpoint: '/submit-form',
    data: {
      name: 'Roy Turner',
      email: 'roy.turner@tnrbusinesssolutions.com',
      phone: '4124992987',
      company: 'TNR Business Solutions',
      dateOfBirth: '1985-01-15',
      gender: 'male',
      coverageType: 'term',
      coverageAmount: '1000000',
      termLength: '20',
      smokingStatus: 'non-smoker',
      height: '6 feet 0 inches',
      weight: '180',
      heartDisease: 'on',
      diabetes: 'on',
      cancer: 'on',
      highBloodPressure: 'on',
      depressionAnxiety: 'on',
      noneOfAbove: 'on',
      message: 'Testing life insurance form with comprehensive data capture',
      industry: 'Technology',
      contactMethod: 'email',
      source: 'Life Insurance Form'
    }
  },
  {
    name: 'Business Insurance Form',
    endpoint: '/submit-form',
    data: {
      company: 'Test Business LLC',
      name: 'Roy Turner',
      email: 'roy.turner@tnrbusinesssolutions.com',
      phone: '4124992987',
      businessAddress: '418 Concord Avenue, Suite 100',
      city: 'Greensburg',
      state: 'PA',
      zipCode: '15601',
      firstName: 'Roy',
      lastName: 'Turner',
      contactEmail: 'roy.turner@tnrbusinesssolutions.com',
      contactPhone: '4124992987',
      jobTitle: 'CEO',
      generalLiability: 'on',
      commercialProperty: 'on',
      workersCompensation: 'on',
      professionalLiability: 'on',
      cyberLiability: 'on',
      commercialAuto: 'on',
      directorsOfficers: 'on',
      otherCoverage: 'on',
      message: 'Testing business insurance form with comprehensive data capture',
      industry: 'Technology',
      contactMethod: 'email',
      source: 'Business Insurance Form'
    }
  },
  {
    name: 'Umbrella Insurance Form',
    endpoint: '/submit-form',
    data: {
      name: 'Roy Turner',
      email: 'roy.turner@tnrbusinesssolutions.com',
      phone: '4124992987',
      company: 'Test Company LLC',
      coverageAmount: '2-million',
      currentPolicies: 'home-auto-business',
      insuranceType: 'both',
      message: 'Testing umbrella insurance form with comprehensive data capture',
      contactMethod: 'email',
      source: 'Umbrella Insurance Form'
    }
  },
  {
    name: 'Contact Form',
    endpoint: '/submit-form',
    data: {
      name: 'Roy Turner',
      company: 'Test Company LLC',
      email: 'roy.turner@tnrbusinesssolutions.com',
      phone: '4124992987',
      website: 'www.testcompany.com',
      industry: 'Technology',
      services: ['Web Design', 'SEO Services', 'Social Media Management'],
      budget: '10000-25000',
      timeline: '1-month',
      message: 'Testing contact form with comprehensive data capture',
      additionalInfo: 'Additional information for testing',
      contactMethod: 'email',
      source: 'Contact Form'
    }
  }
];

async function testForm(form) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(form.data);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: form.endpoint,
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
          resolve({
            form: form.name,
            success: response.success,
            emailSent: response.emailSent,
            fieldCount: Object.keys(form.data).length
          });
        } catch (error) {
          reject({
            form: form.name,
            error: 'Failed to parse response',
            rawResponse: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        form: form.name,
        error: error.message
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing All Forms and CRM Integration');
  console.log('==========================================');
  
  const results = [];
  
  for (const form of testForms) {
    try {
      console.log(`\n📝 Testing ${form.name}...`);
      console.log(`   Fields: ${Object.keys(form.data).length}`);
      
      const result = await testForm(form);
      results.push(result);
      
      if (result.success) {
        console.log(`   ✅ Success - Email sent: ${result.emailSent}`);
      } else {
        console.log(`   ❌ Failed - ${result.error || 'Unknown error'}`);
      }
      
      // Wait 1 second between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.push({
        form: form.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${testForms.length}`);
  console.log(`❌ Failed: ${failed}/${testForms.length}`);
  
  if (successful === testForms.length) {
    console.log('\n🎉 ALL FORMS WORKING CORRECTLY!');
    console.log('📧 All emails should be sent to roy.turner@tnrbusinesssolutions.com');
    console.log('📊 All leads should be created in CRM');
    console.log('🔄 Admin dashboard should show updated lead counts');
  } else {
    console.log('\n⚠️  Some forms failed - check the errors above');
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Check your email for all form submissions');
  console.log('2. Open admin-dashboard.html to verify leads were created');
  console.log('3. Check that lead counts are updating correctly');
  console.log('4. Verify all detailed form data is captured');
}

// Run the tests
runTests().catch(console.error);
