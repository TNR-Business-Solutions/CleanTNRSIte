/**
 * Test the email template fix locally
 */

const http = require('http');

const testData = {
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
  message: 'Testing comprehensive auto insurance form data capture with NEW email template',
  industry: 'Technology',
  contactMethod: 'email',
  source: 'Auto Insurance Form'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/submit-form',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing Email Template Fix Locally');
console.log('📋 Form Data Fields:', Object.keys(testData).length);
console.log('🔍 Sample detailed fields:', {
  dateOfBirth: testData.dateOfBirth,
  vehicleYear: testData.vehicleYear,
  vehicleMake: testData.vehicleMake,
  coverageLevel: testData.coverageLevel,
  roadsideAssistance: testData.roadsideAssistance
});
console.log('');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    try {
      const response = JSON.parse(data);
      console.log('📨 Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        console.log('✅ Form submission successful!');
        console.log('📧 Email sent:', response.emailSent);
        console.log('🎯 Check your email - should now show ALL detailed fields!');
        console.log('📋 Expected fields in email:');
        console.log('  - Name, Email, Phone, Company');
        console.log('  - Date Of Birth, Marital Status');
        console.log('  - Address, City, State, Zip Code');
        console.log('  - License Number, License State');
        console.log('  - Vehicle Year, Make, Model, VIN');
        console.log('  - Vehicle Use, Annual Mileage, Ownership');
        console.log('  - Years Licensed, Accidents, Violations');
        console.log('  - Coverage Level, Deductible');
        console.log('  - All coverage options (Roadside, Rental, etc.)');
        console.log('  - And many more...');
      } else {
        console.log('❌ Form submission failed:', response.message);
      }
    } catch (error) {
      console.log('❌ Error parsing response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('💡 Make sure the server is running on port 5000');
});

req.write(postData);
req.end();
