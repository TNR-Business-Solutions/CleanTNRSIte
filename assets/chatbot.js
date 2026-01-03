/* eslint-env browser */
// TNR Business Solutions - Conversational Chatbot
// Based on Demonte Contracting chatbot design
// Created by TNR Business Solutions

(function() {
    'use strict';
    
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    
    if (!chatbotToggle || !chatbotWindow) {
        console.log('Chatbot elements not found');
        return;
    }
    
    // Lead data storage
    const leadData = {
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        companyName: '',
        serviceType: '',
        urgency: '',
        description: '',
        hearAboutUs: '',
        marketingConsent: false,
        source: 'Website Chatbot'
    };
    
    let currentStep = 'greeting';
    let awaitingInput = false;
    let currentField = '';
    
    // Conversation flow
    const conversationFlow = {
        greeting: {
            message: "Hello! Welcome to TNR Business Solutions. We're here to help with your digital marketing and insurance needs. What type of service are you interested in?",
            options: [
                { text: 'Digital Marketing Services', value: 'digital_marketing', next: 'serviceType' },
                { text: 'Insurance Services', value: 'insurance', next: 'serviceType' },
                { text: 'Both Services', value: 'both', next: 'serviceType' },
                { text: 'Get a Quote', value: 'quote', next: 'urgency' }
            ]
        },
        serviceType: {
            message: "Great! Which specific service do you need?",
            options: [
                { text: 'Web Design & Development', value: 'web_design', next: 'urgency' },
                { text: 'SEO Services', value: 'seo', next: 'urgency' },
                { text: 'Social Media Management', value: 'social_media', next: 'urgency' },
                { text: 'Content Creation', value: 'content', next: 'urgency' },
                { text: 'Paid Advertising', value: 'paid_ads', next: 'urgency' },
                { text: 'Auto Insurance', value: 'auto_insurance', next: 'urgency' },
                { text: 'Home Insurance', value: 'home_insurance', next: 'urgency' },
                { text: 'Business Insurance', value: 'business_insurance', next: 'urgency' },
                { text: 'Life Insurance', value: 'life_insurance', next: 'urgency' }
            ]
        },
        urgency: {
            message: "Thanks! When do you need this service?",
            options: [
                { text: '🚨 Urgent - Need Help ASAP!', value: 'urgent', next: 'firstName' },
                { text: '📅 Within the Next Week', value: 'week', next: 'firstName' },
                { text: '📆 Planning Ahead', value: 'planning', next: 'firstName' }
            ]
        },
        firstName: {
            message: "Perfect! Let's get your information. What's your first name?",
            type: 'input',
            field: 'firstName',
            next: 'lastName'
        },
        lastName: {
            message: "Thanks, {firstName}! What's your last name?",
            type: 'input',
            field: 'lastName',
            next: 'companyName'
        },
        companyName: {
            message: "What's your company name? (Type 'none' if not applicable)",
            type: 'input',
            field: 'companyName',
            placeholder: 'Your Company Name or none',
            next: 'phone'
        },
        phone: {
            message: "What's the best phone number to reach you?",
            type: 'input',
            field: 'phone',
            placeholder: '412-555-1234',
            next: 'email'
        },
        email: {
            message: "Great! And your email address?",
            type: 'input',
            field: 'email',
            placeholder: 'your@email.com',
            next: 'description'
        },
        description: {
            message: "Please describe what you're looking for. Be as detailed as possible so we can help you better:",
            type: 'textarea',
            field: 'description',
            placeholder: 'Example: I need a new website for my business...',
            next: 'hearAboutUs'
        },
        hearAboutUs: {
            message: "How did you hear about us?",
            options: [
                { text: 'Google Search', value: 'google', next: 'marketing' },
                { text: 'Facebook', value: 'facebook', next: 'marketing' },
                { text: 'Instagram', value: 'instagram', next: 'marketing' },
                { text: 'LinkedIn', value: 'linkedin', next: 'marketing' },
                { text: 'Friend/Family Referral', value: 'referral', next: 'marketing' },
                { text: 'Other', value: 'other', next: 'marketing' }
            ]
        },
        marketing: {
            message: "One last thing - can we send you occasional updates about our services and special offers via email?",
            options: [
                { text: '✓ Yes, keep me updated', value: true, next: 'submit' },
                { text: '✗ No thanks', value: false, next: 'submit' }
            ]
        },
        submit: {
            message: "Perfect! Let me submit your information to our team...",
            action: 'submit'
        }
    };
    
    // Initialize chatbot
    chatbotToggle.addEventListener('click', function() {
        chatbotWindow.classList.toggle('active');
        if (chatbotWindow.classList.contains('active') && currentStep === 'greeting') {
            startConversation();
        }
    });
    
    chatbotClose.addEventListener('click', function() {
        chatbotWindow.classList.remove('active');
    });
    
    function startConversation() {
        // Clear any existing messages except the initial one
        const existingMessages = chatbotMessages.querySelectorAll('.chatbot-message:not(:first-child), .chatbot-options, .chatbot-input-container');
        existingMessages.forEach(el => el.remove());
        
        showMessage(conversationFlow.greeting.message, 'bot');
        showOptions(conversationFlow.greeting.options);
    }
    
    function showMessage(text, type = 'bot') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${type}-message`;
        
        // Replace placeholders
        let processedText = text;
        for (const key in leadData) {
            processedText = processedText.replace(`{${key}}`, leadData[key]);
        }
        
        const p = document.createElement('p');
        p.textContent = processedText;
        messageDiv.appendChild(p);
        
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    function showOptions(options) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'chatbot-options';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'chatbot-option-btn';
            button.textContent = option.text;
            
            button.addEventListener('mouseover', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.4)';
            });
            
            button.addEventListener('mouseout', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.3)';
            });
            
            button.addEventListener('click', function() {
                handleOptionClick(option);
                optionsDiv.remove();
            });
            
            optionsDiv.appendChild(button);
        });
        
        chatbotMessages.appendChild(optionsDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    function showInput(step) {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chatbot-input-container';
        
        let inputElement;
        
        if (step.type === 'textarea') {
            inputElement = document.createElement('textarea');
            inputElement.rows = 4;
            inputElement.style.cssText = 'width: 100%; padding: 12px; border: 2px solid #D4AF37; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical;';
        } else {
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.style.cssText = 'width: 100%; padding: 12px; border: 2px solid #D4AF37; border-radius: 8px; font-size: 14px;';
        }
        
        inputElement.placeholder = step.placeholder || 'Type here...';
        inputElement.className = 'chatbot-user-input';
        
        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Submit';
        submitBtn.className = 'chatbot-submit-btn';
        
        submitBtn.addEventListener('click', function() {
            const value = inputElement.value.trim();
            if (value) {
                handleInputSubmit(step, value);
                inputContainer.remove();
            } else {
                alert('Please enter a value');
            }
        });
        
        // Enter key to submit
        inputElement.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey && step.type !== 'textarea') {
                e.preventDefault();
                submitBtn.click();
            }
        });
        
        inputContainer.appendChild(inputElement);
        inputContainer.appendChild(submitBtn);
        chatbotMessages.appendChild(inputContainer);
        
        inputElement.focus();
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    function handleOptionClick(option) {
        // Show user's selection
        showMessage(option.text, 'user');
        
        // Store the value
        if (currentStep === 'greeting') {
            if (option.value === 'quote') {
                leadData.serviceType = 'quote';
            }
        } else if (currentStep === 'serviceType') {
            leadData.serviceType = option.value;
        } else if (currentStep === 'urgency') {
            leadData.urgency = option.value;
        } else if (currentStep === 'hearAboutUs') {
            leadData.hearAboutUs = option.value;
        } else if (currentStep === 'marketing') {
            leadData.marketingConsent = option.value;
        }
        
        // Move to next step
        currentStep = option.next;
        processStep();
    }
    
    function handleInputSubmit(step, value) {
        // Show user's input
        showMessage(value, 'user');
        
        // Store the value
        leadData[step.field] = value === 'none' ? '' : value;
        
        // Move to next step
        currentStep = step.next;
        processStep();
    }
    
    function processStep() {
        const step = conversationFlow[currentStep];
        
        if (!step) {
            showMessage("Sorry, something went wrong. Please call us at (412) 499-2987.", 'bot');
            return;
        }
        
        // Handle action steps
        if (step.action === 'submit') {
            submitLead();
            return;
        }
        
        // Show message
        setTimeout(() => {
            showMessage(step.message, 'bot');
            
            // Show options or input
            if (step.options) {
                showOptions(step.options);
            } else if (step.type === 'input' || step.type === 'textarea') {
                showInput(step);
            }
        }, 500);
    }
    
    async function submitLead() {
        showMessage("Submitting your information...", 'bot');
        
        try {
            // Prepare payload
            const payload = {
                name: `${leadData.firstName} ${leadData.lastName}`,
                firstName: leadData.firstName,
                lastName: leadData.lastName,
                phone: leadData.phone,
                email: leadData.email,
                companyName: leadData.companyName,
                serviceType: leadData.serviceType,
                urgency: leadData.urgency,
                description: leadData.description,
                hearAboutUs: leadData.hearAboutUs,
                marketingConsent: leadData.marketingConsent,
                source: 'Website Chatbot'
            };
            
            // Submit to API
            const response = await fetch('/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                if (leadData.urgency === 'urgent') {
                    showMessage("✅ Your urgent request has been submitted! Our team will contact you immediately at " + leadData.phone + ". For immediate assistance, you can also call us at (412) 499-2987", 'bot');
                } else {
                    showMessage("✅ Thank you! Your request has been submitted successfully. We'll contact you within 24 hours at " + leadData.phone + " to discuss your needs. If you need immediate assistance, call us at (412) 499-2987.", 'bot');
                }
                
                // Track conversion
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'generate_lead', {
                        'event_category': 'Chatbot',
                        'event_label': leadData.serviceType,
                        'value': 1
                    });
                }
                
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Lead', {
                        content_name: leadData.serviceType,
                        value: 1
                    });
                }
                
            } else {
                throw new Error('Submission failed');
            }
            
        } catch (error) {
            console.error('Lead submission error:', error);
            
            // Create clickable error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chatbot-message bot-message';
            errorDiv.innerHTML = `
                <p>⚠️ We're having trouble submitting your information. Please call us directly at 
                <a href="tel:4124992987" style="color: #1a365d; font-weight: 700; text-decoration: underline;">(412) 499-2987</a>. 
                We apologize for the inconvenience!</p>
            `;
            chatbotMessages.appendChild(errorDiv);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
    }
    
    console.log('TNR Business Solutions Chatbot initialized');
})();
