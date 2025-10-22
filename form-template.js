// TNR Business Solutions Form Template
// Standardized form fields and validation for all site forms

class TNRFormTemplate {
  constructor() {
    this.standardFields = {
      // Basic Information
      name: { type: 'text', required: true, placeholder: 'Full Name' },
      email: { type: 'email', required: true, placeholder: 'Email Address' },
      phone: { type: 'tel', required: false, placeholder: 'Phone Number' },
      company: { type: 'text', required: false, placeholder: 'Company Name' },
      
      // Business Information
      website: { type: 'text', required: false, placeholder: 'Current Website (if any)' },
      industry: { 
        type: 'select', 
        required: false, 
        options: [
          { value: '', text: 'Select your industry' },
          { value: 'Construction', text: 'Construction' },
          { value: 'Legal Services', text: 'Legal Services' },
          { value: 'E-commerce', text: 'E-commerce' },
          { value: 'Food Service', text: 'Food Service' },
          { value: 'Healthcare', text: 'Healthcare' },
          { value: 'Real Estate', text: 'Real Estate' },
          { value: 'Retail', text: 'Retail' },
          { value: 'Technology', text: 'Technology' },
          { value: 'Other', text: 'Other' }
        ]
      },
      
      // Services
      services: {
        type: 'checkbox',
        required: false,
        options: [
          { value: 'Web Design', text: 'Web Design' },
          { value: 'SEO Services', text: 'SEO Services' },
          { value: 'Social Media Management', text: 'Social Media Management' },
          { value: 'Content Creation', text: 'Content Creation' },
          { value: 'Paid Advertising', text: 'Paid Advertising' },
          { value: 'Email Marketing', text: 'Email Marketing' }
        ]
      },
      
      // Project Details
      budget: {
        type: 'select',
        required: false,
        options: [
          { value: '', text: 'Select budget range' },
          { value: 'under-1000', text: 'Under $1,000' },
          { value: '1000-5000', text: '$1,000 - $5,000' },
          { value: '5000-10000', text: '$5,000 - $10,000' },
          { value: '10000-25000', text: '$10,000 - $25,000' },
          { value: '25000-plus', text: '$25,000+' },
          { value: 'discuss', text: 'Prefer to discuss' }
        ]
      },
      timeline: {
        type: 'select',
        required: false,
        options: [
          { value: '', text: 'Select timeline' },
          { value: 'asap', text: 'ASAP' },
          { value: '1-month', text: 'Within 1 month' },
          { value: '3-months', text: 'Within 3 months' },
          { value: '6-months', text: 'Within 6 months' },
          { value: 'flexible', text: 'Flexible' }
        ]
      },
      
      // Contact Preferences
      contactMethod: {
        type: 'radio',
        required: false,
        options: [
          { value: 'phone', text: 'Phone Call' },
          { value: 'email', text: 'Email' },
          { value: 'text', text: 'Text Message' }
        ],
        default: 'email'
      },
      
      // Messages
      message: { type: 'textarea', required: true, placeholder: 'Tell us about your project...', rows: 6 },
      additionalInfo: { type: 'textarea', required: false, placeholder: 'Any additional information...', rows: 3 }
    };
  }

  // Generate form HTML based on required fields
  generateFormHTML(fields, formId = 'inquiry-form', formTitle = 'Get Your Free Quote') {
    let html = `
      <div style="background: rgba(255, 255, 255, 0.1); padding: 3rem; border-radius: 12px; margin-bottom: 4rem;">
        <h2 style="text-align: center; color: var(--tnr-secondary); margin-bottom: 2rem;">${formTitle}</h2>
        <form id="${formId}" style="max-width: 800px; margin: 0 auto;">
    `;

    // Group fields into sections
    const sections = this.groupFieldsInto Sections(fields);
    
    sections.forEach(section => {
      html += this.generateSectionHTML(section);
    });

    // Submit button
    html += `
          <div style="text-align: center; margin-top: 2rem;">
            <button type="submit" class="submit-btn" style="background: var(--tnr-primary); color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease;">
              Send My Request & Get Free Quote
            </button>
            <p style="color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; margin-top: 1rem;">
              * Required fields. We'll respond within 24 hours during business days.
            </p>
          </div>
        </form>
      </div>
    `;

    return html;
  }

  groupFieldsInto Sections(fields) {
    const sections = {
      personal: { title: 'Personal Information', fields: [] },
      business: { title: 'Business Information', fields: [] },
      project: { title: 'Project Details', fields: [] },
      contact: { title: 'Contact Preferences', fields: [] },
      message: { title: 'Tell Us About Your Needs', fields: [] }
    };

    fields.forEach(fieldName => {
      const field = this.standardFields[fieldName];
      if (!field) return;

      if (['name', 'email', 'phone'].includes(fieldName)) {
        sections.personal.fields.push(fieldName);
      } else if (['company', 'website', 'industry'].includes(fieldName)) {
        sections.business.fields.push(fieldName);
      } else if (['services', 'budget', 'timeline'].includes(fieldName)) {
        sections.project.fields.push(fieldName);
      } else if (['contactMethod'].includes(fieldName)) {
        sections.contact.fields.push(fieldName);
      } else if (['message', 'additionalInfo'].includes(fieldName)) {
        sections.message.fields.push(fieldName);
      }
    });

    return Object.values(sections).filter(section => section.fields.length > 0);
  }

  generateSectionHTML(section) {
    let html = `
      <div style="background: rgba(255, 255, 255, 0.05); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
        <h3 style="color: var(--tnr-gold); margin-bottom: 1.5rem; text-align: center;">${section.title}</h3>
    `;

    // Group fields into rows
    const rows = this.groupFieldsIntoRows(section.fields);
    
    rows.forEach(row => {
      html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1rem;">';
      
      row.forEach(fieldName => {
        html += this.generateFieldHTML(fieldName, this.standardFields[fieldName]);
      });
      
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  groupFieldsIntoRows(fields) {
    const rows = [];
    let currentRow = [];
    
    fields.forEach(fieldName => {
      const field = this.standardFields[fieldName];
      
      // Textarea fields get their own row
      if (field.type === 'textarea') {
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
        rows.push([fieldName]);
      }
      // Checkbox groups get their own row
      else if (field.type === 'checkbox') {
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
        rows.push([fieldName]);
      }
      // Radio groups get their own row
      else if (field.type === 'radio') {
        if (currentRow.length > 0) {
          rows.push(currentRow);
          currentRow = [];
        }
        rows.push([fieldName]);
      }
      // Regular fields can share rows
      else {
        currentRow.push(fieldName);
        if (currentRow.length >= 2) {
          rows.push(currentRow);
          currentRow = [];
        }
      }
    });
    
    if (currentRow.length > 0) {
      rows.push(currentRow);
    }
    
    return rows;
  }

  generateFieldHTML(fieldName, field) {
    const required = field.required ? 'required' : '';
    const placeholder = field.placeholder || '';
    const commonStyle = 'padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; width: 100%; box-sizing: border-box;';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return `
          <input type="${field.type}" 
                 name="${fieldName}" 
                 placeholder="${placeholder}${field.required ? ' *' : ''}" 
                 ${required} 
                 style="${commonStyle}">
        `;
        
      case 'select':
        let options = field.options.map(opt => 
          `<option value="${opt.value}">${opt.text}</option>`
        ).join('');
        return `
          <select name="${fieldName}" ${required} style="${commonStyle}">
            ${options}
          </select>
        `;
        
      case 'textarea':
        return `
          <textarea name="${fieldName}" 
                    placeholder="${placeholder}${field.required ? ' *' : ''}" 
                    rows="${field.rows || 4}" 
                    ${required} 
                    style="${commonStyle}; grid-column: 1 / -1;">
          </textarea>
        `;
        
      case 'checkbox':
        return `
          <div style="grid-column: 1 / -1;">
            <label style="display: block; margin-bottom: 1rem; color: white; font-weight: bold;">Services of Interest</label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem;">
              ${field.options.map(opt => `
                <label style="display: flex; align-items: center; color: white;">
                  <input type="checkbox" name="services[]" value="${opt.value}" style="margin-right: 0.5rem;">
                  ${opt.text}
                </label>
              `).join('')}
            </div>
          </div>
        `;
        
      case 'radio':
        return `
          <div style="grid-column: 1 / -1;">
            <label style="display: block; margin-bottom: 1rem; color: white; font-weight: bold;">Preferred Contact Method</label>
            <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
              ${field.options.map(opt => `
                <label style="display: flex; align-items: center; color: white;">
                  <input type="radio" name="${fieldName}" value="${opt.value}" ${opt.value === field.default ? 'checked' : ''} style="margin-right: 0.5rem;">
                  ${opt.text}
                </label>
              `).join('')}
            </div>
          </div>
        `;
        
      default:
        return '';
    }
  }

  // Get standard field set for different form types
  getFormFields(formType) {
    const fieldSets = {
      'contact': ['name', 'email', 'phone', 'company', 'website', 'industry', 'services', 'budget', 'timeline', 'message', 'additionalInfo', 'contactMethod'],
      'insurance': ['name', 'email', 'phone', 'company', 'message', 'contactMethod'],
      'service': ['name', 'email', 'phone', 'company', 'website', 'industry', 'services', 'budget', 'timeline', 'message', 'contactMethod'],
      'quote': ['name', 'email', 'phone', 'company', 'website', 'industry', 'services', 'budget', 'timeline', 'message', 'contactMethod'],
      'career': ['name', 'email', 'phone', 'company', 'message', 'additionalInfo']
    };
    
    return fieldSets[formType] || fieldSets['contact'];
  }
}

// Make it available globally
window.TNRFormTemplate = TNRFormTemplate;
