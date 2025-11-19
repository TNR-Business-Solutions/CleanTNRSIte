// Frontend form handler for TNR Business Solutions
document.addEventListener('DOMContentLoaded', function() {
    // Handle all forms on the page
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            try {
                // Collect form data
                const formData = new FormData(form);
                const data = {};
                
                // Convert FormData to object
                for (let [key, value] of formData.entries()) {
                    // Handle checkboxes (multiple values)
                    if (data[key]) {
                        if (Array.isArray(data[key])) {
                            data[key].push(value);
                        } else {
                            data[key] = [data[key], value];
                        }
                    } else {
                        data[key] = value;
                    }
                }
                
                // Send form data to server
                const response = await fetch('/submit-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success message
                    showMessage('Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.', 'success');
                    form.reset();
                } else {
                    // Show error message
                    showMessage('Sorry, there was an error sending your message. Please try again or call us at (412) 499-2987.', 'error');
                }
                
            } catch (error) {
                console.error('Form submission error:', error);
                showMessage('Sorry, there was an error sending your message. Please try again or call us at (412) 499-2987.', 'error');
            } finally {
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    });
});

// Function to show success/error messages
function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4CAF50';
    } else {
        messageDiv.style.backgroundColor = '#f44336';
    }
    
    messageDiv.textContent = message;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to validate phone number format
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Add form validation
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const emailInputs = form.querySelectorAll('input[type="email"]');
        const phoneInputs = form.querySelectorAll('input[type="tel"]');
        
        // Validate email inputs
        emailInputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value && !isValidEmail(this.value)) {
                    this.style.borderColor = '#f44336';
                    showFieldError(this, 'Please enter a valid email address');
                } else {
                    this.style.borderColor = '';
                    clearFieldError(this);
                }
            });
        });
        
        // Validate phone inputs
        phoneInputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value && !isValidPhone(this.value)) {
                    this.style.borderColor = '#f44336';
                    showFieldError(this, 'Please enter a valid phone number');
                } else {
                    this.style.borderColor = '';
                    clearFieldError(this);
                }
            });
        });
    });
});

// Function to show field-specific error messages
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = `
        color: #f44336;
        font-size: 0.8rem;
        margin-top: 5px;
    `;
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

// Function to clear field-specific error messages
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}
