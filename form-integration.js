// TNR Business Solutions Form Integration
// This script captures form submissions from the website and adds them to the CRM

class TNRFormIntegration {
  constructor() {
    this.initializeFormHandlers();
  }

  initializeFormHandlers() {
    // Skip DOM operations if document is not available (e.g., in Node.js)
    if (typeof document === "undefined") return;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupFormHandlers()
      );
    } else {
      this.setupFormHandlers();
    }
  }

  setupFormHandlers() {
    // Skip DOM operations if document is not available (e.g., in Node.js)
    if (typeof document === "undefined") return;

    console.log("🔧 Setting up form handlers...");

    // Handle contact form submissions
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
      console.log("✅ Found contact form, adding event listener");
      contactForm.addEventListener("submit", (e) => this.handleContactForm(e));
    } else {
      console.warn("❌ Contact form not found");
    }

    // Handle all inquiry forms (insurance, service, quote, etc.)
    const inquiryForms = document.querySelectorAll(
      "form[id*='inquiry'], form[id*='quote'], form[id*='application']"
    );
    inquiryForms.forEach((form) => {
      form.addEventListener("submit", (e) => this.handleInquiryForm(e));
    });

    // Handle service inquiry forms
    const serviceForms = document.querySelectorAll(".service-inquiry-form");
    serviceForms.forEach((form) => {
      form.addEventListener("submit", (e) => this.handleServiceInquiry(e));
    });

    // Handle newsletter signups
    const newsletterForms = document.querySelectorAll(".newsletter-form");
    newsletterForms.forEach((form) => {
      form.addEventListener("submit", (e) => this.handleNewsletterSignup(e));
    });

    // Handle quote request forms
    const quoteForms = document.querySelectorAll(".quote-form");
    quoteForms.forEach((form) => {
      form.addEventListener("submit", (e) => this.handleQuoteRequest(e));
    });

    // Handle checkout forms
    const checkoutForms = document.querySelectorAll("#checkout-form");
    checkoutForms.forEach((form) => {
      form.addEventListener("submit", (e) => this.handleCheckoutForm(e));
    });
  }

  handleContactForm(event) {
    event.preventDefault();
    console.log("📝 Contact form submitted");

    const formData = new FormData(event.target);
    const submission = {
      name: formData.get("name") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      company: formData.get("company") || "",
      website: formData.get("website") || "",
      industry: formData.get("industry") || "",
      services: this.getSelectedServices(formData),
      budget: formData.get("budget") || "",
      timeline: formData.get("timeline") || "",
      message: formData.get("message") || "",
      additionalInfo: formData.get("additionalInfo") || "",
      contactMethod: formData.get("contactMethod") || "",
      source: "Contact Form",
      date: new Date().toISOString().split("T")[0],
      status: "New",
    };

    console.log("📊 Form submission data:", submission);
    console.log("🔄 Calling processFormSubmission...");
    this.processFormSubmission(submission);
    this.showSuccessMessage(
      "Thank you for your message! We'll get back to you soon."
    );
  }

  handleServiceInquiry(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const serviceType = event.target.dataset.service || "General Inquiry";

    const submission = {
      name: formData.get("name") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      company: formData.get("company") || "",
      message: formData.get("message") || "",
      services: [serviceType],
      industry: formData.get("industry") || "General",
      source: "Service Inquiry",
      date: new Date().toISOString().split("T")[0],
      status: "New",
    };

    this.processFormSubmission(submission);
    this.showSuccessMessage(
      "Thank you for your interest! We'll contact you about our " +
        serviceType +
        " services."
    );
  }

  handleNewsletterSignup(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const submission = {
      name: formData.get("name") || "",
      email: formData.get("email") || "",
      phone: "",
      company: "",
      message: "Newsletter signup",
      services: ["Email Marketing"],
      industry: "General",
      source: "Newsletter Signup",
      date: new Date().toISOString().split("T")[0],
      status: "New",
    };

    this.processFormSubmission(submission);
    this.showSuccessMessage("Thank you for subscribing to our newsletter!");
  }

  handleQuoteRequest(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const submission = {
      name: formData.get("name") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      company: formData.get("company") || "",
      message: formData.get("message") || "",
      services: this.getSelectedServices(formData),
      industry: formData.get("industry") || "General",
      budget: formData.get("budget") || "",
      timeline: formData.get("timeline") || "",
      source: "Quote Request",
      date: new Date().toISOString().split("T")[0],
      status: "New",
    };

    this.processFormSubmission(submission);
    this.showSuccessMessage(
      "Thank you for your quote request! We'll prepare a customized proposal for you."
    );
  }

  getSelectedServices(formData) {
    const services = [];
    const serviceCheckboxes = formData.getAll("services[]");
    if (serviceCheckboxes.length > 0) {
      services.push(...serviceCheckboxes);
    }

    // Also check for individual service fields
    const serviceFields = [
      "web-design",
      "seo",
      "social-media",
      "content-creation",
      "paid-advertising",
      "email-marketing",
    ];
    serviceFields.forEach((field) => {
      if (formData.get(field)) {
        services.push(this.formatServiceName(field));
      }
    });

    return services.length > 0 ? services : ["General Inquiry"];
  }

  formatServiceName(serviceField) {
    const serviceMap = {
      "web-design": "Web Design",
      seo: "SEO Services",
      "social-media": "Social Media Management",
      "content-creation": "Content Creation",
      "paid-advertising": "Paid Advertising",
      "email-marketing": "Email Marketing",
    };
    return serviceMap[serviceField] || serviceField;
  }

  async processFormSubmission(submission) {
    console.log("🔄 processFormSubmission called with:", submission);
    console.log("📊 Submission keys:", Object.keys(submission));
    console.log("📊 Submission values:", Object.values(submission));

    // Add timestamp to submission
    submission.timestamp = new Date().toISOString();
    submission.submissionDate = new Date().toLocaleString();
    submission.submissionDateTime = new Date().toISOString();

    // Store in localStorage for CRM access
    let submissions = JSON.parse(
      localStorage.getItem("tnr_form_submissions") || "[]"
    );
    submission.id = "submission-" + Date.now();

    // Mark this submission as NOT yet converted (force fresh conversion)
    submission.convertedToLead = false;

    submissions.push(submission);
    localStorage.setItem("tnr_form_submissions", JSON.stringify(submissions));
    console.log(
      "💾 Stored submission in localStorage. Total submissions:",
      submissions.length
    );

    // Ensure CRM is available and create lead IMMEDIATELY
    console.log("🔄 Creating lead from submission...");
    this.createLeadFromSubmission(submission);

    // Send email notification
    console.log("📧 Sending email notification...");
    await this.sendEmailNotification(submission);

    // Send to server (if available)
    console.log("🌐 Sending to server...");
    console.log(
      "🌐 Data being sent to server:",
      JSON.stringify(submission, null, 2)
    );
    this.sendToServer(submission);

    console.log("✅ processFormSubmission completed");
  }

  createLeadFromSubmission(submission) {
    console.log("🏗️ createLeadFromSubmission called");
    console.log("📋 Submission data received:", submission);

    // Initialize CRM if not available
    if (typeof window.TNRCRMData !== "undefined") {
      if (!window.tnrCRM) {
        console.log("🏗️ Creating new CRM instance...");
        window.tnrCRM = new window.TNRCRMData();
      }

      // Create lead data
      const leadData = {
        name: submission.name || "Unknown",
        email: submission.email || "",
        phone: submission.phone || "",
        company: submission.company || "",
        website: submission.website || "",
        industry: submission.industry || "Not specified",
        services: Array.isArray(submission.services)
          ? submission.services
          : [submission.services || "Not specified"],
        budget: submission.budget || "",
        timeline: submission.timeline || "",
        message: submission.message || "",
        additionalInfo: submission.additionalInfo || "",
        contactMethod: submission.contactMethod || "",
        source: submission.source || "Website Form",
        status: "New",
        submissionDate:
          submission.submissionDate || new Date().toLocaleString(),
        submissionDateTime:
          submission.submissionDateTime || new Date().toISOString(),
        originalSubmissionId: submission.id,
      };

      console.log("📊 Lead data created:", leadData);

      // Add lead directly
      const newLead = window.tnrCRM.addLead(leadData);
      console.log("✅ Lead created:", newLead.id, "-", newLead.name);
      console.log("📋 Full lead object:", newLead);

      // Mark submission as converted
      submission.convertedToLead = true;

      // Update submissions in storage
      const submissions = JSON.parse(
        localStorage.getItem("tnr_form_submissions") || "[]"
      );
      const submissionIndex = submissions.findIndex(
        (s) => s.id === submission.id
      );
      if (submissionIndex !== -1) {
        submissions[submissionIndex].convertedToLead = true;
        localStorage.setItem(
          "tnr_form_submissions",
          JSON.stringify(submissions)
        );
      }

      // Update notification count
      window.tnrCRM.updateNotificationCount();

      return newLead;
    } else {
      console.error("❌ CRM not available - lead not created");
      return null;
    }
  }

  ensureCRMAndCreateLead(submission, allSubmissions) {
    console.log("🔄 ensureCRMAndCreateLead called");
    console.log(
      "TNRCRMData available:",
      typeof window.TNRCRMData !== "undefined"
    );
    console.log("tnrCRM instance:", window.tnrCRM ? "Yes" : "No");

    // Force CRM initialization if not available
    if (typeof window.TNRCRMData !== "undefined") {
      if (!window.tnrCRM) {
        console.log("🏗️ Creating new CRM instance...");
        window.tnrCRM = new window.TNRCRMData();
      }

      // Update CRM with all submissions
      console.log("📊 Updating CRM with submissions...");
      window.tnrCRM.formSubmissions = allSubmissions;
      window.tnrCRM.saveToStorage();

      // Convert this specific submission to a lead
      console.log("🔄 Creating lead from submission...");
      const leadData = {
        name: submission.name || "Unknown",
        email: submission.email || "",
        phone: submission.phone || "",
        company: submission.company || "",
        website: submission.website || "",
        industry: submission.industry || "Not specified",
        services: Array.isArray(submission.services)
          ? submission.services
          : [submission.services || "Not specified"],
        budget: submission.budget || "",
        timeline: submission.timeline || "",
        message: submission.message || "",
        additionalInfo: submission.additionalInfo || "",
        contactMethod: submission.contactMethod || "",
        source: submission.source || "Website Form",
        status: "New",
        submissionDate:
          submission.submissionDate || new Date().toLocaleString(),
        submissionDateTime:
          submission.submissionDateTime || new Date().toISOString(),
        originalSubmissionId: submission.id,
      };

      console.log("📝 Lead data:", leadData);

      // Add as lead directly
      const newLead = window.tnrCRM.addLead(leadData);
      console.log("✅ Lead created:", newLead.id, "-", newLead.name);
      console.log("📊 Total leads now:", window.tnrCRM.leads.length);

      // Update notification count
      window.tnrCRM.updateNotificationCount();

      // Force a page refresh to show the lead in admin dashboard
      console.log("🔄 Lead created successfully! Check admin dashboard.");
    } else {
      console.error("❌ CRM not available - lead not created");
      console.error("TNRCRMData type:", typeof window.TNRCRMData);

      // Try to initialize CRM after a delay
      setTimeout(() => {
        console.log("🔄 Retrying CRM initialization...");
        if (typeof window.TNRCRMData !== "undefined") {
          window.tnrCRM = new window.TNRCRMData();
          window.tnrCRM.formSubmissions = allSubmissions;
          window.tnrCRM.saveToStorage();

          const leadData = {
            name: submission.name || "Unknown",
            email: submission.email || "",
            phone: submission.phone || "",
            company: submission.company || "",
            website: submission.website || "",
            industry: submission.industry || "Not specified",
            services: Array.isArray(submission.services)
              ? submission.services
              : [submission.services || "Not specified"],
            budget: submission.budget || "",
            timeline: submission.timeline || "",
            message: submission.message || "",
            additionalInfo: submission.additionalInfo || "",
            contactMethod: submission.contactMethod || "",
            source: submission.source || "Website Form",
            status: "New",
            submissionDate:
              submission.submissionDate || new Date().toLocaleString(),
            submissionDateTime:
              submission.submissionDateTime || new Date().toISOString(),
            originalSubmissionId: submission.id,
          };

          const newLead = window.tnrCRM.addLead(leadData);
          console.log(
            "✅ Delayed lead created:",
            newLead.id,
            "-",
            newLead.name
          );
          window.tnrCRM.updateNotificationCount();
        }
      }, 1000);
    }
  }

  async sendEmailNotification(submission) {
    // Email notification is handled by the server
    console.log("📧 Email notification will be handled by server");
  }

  async sendToServer(submission) {
    try {
      // Send to server endpoint
      const response = await fetch("/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submission),
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        return { success: false, error: response.statusText };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  showSuccessMessage(message) {
    // Create success notification
    const notification = document.createElement("div");
    notification.className = "form-success-notification";
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
    notification.textContent = message;

    // Add animation styles
    const style = document.createElement("style");
    style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 5000);
  }

  // Method to get all form submissions (for CRM integration)
  getFormSubmissions() {
    return JSON.parse(localStorage.getItem("tnr_form_submissions") || "[]");
  }

  // Method to clear form submissions (for testing)
  clearFormSubmissions() {
    localStorage.removeItem("tnr_form_submissions");
    if (window.tnrCRM) {
      window.tnrCRM.formSubmissions = [];
      window.tnrCRM.saveToStorage();
    }
  }

  // New comprehensive form handler for all inquiry forms
  handleInquiryForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formId = event.target.id;

    // Determine form type and source
    let formType = "General Inquiry";
    let source = "Website Form";

    if (formId.includes("insurance")) {
      formType = "Insurance Inquiry";
      source = "Insurance Quote Request";
    } else if (formId.includes("quote")) {
      formType = "Quote Request";
      source = "Quote Request";
    } else if (formId.includes("application")) {
      formType = "Job Application";
      source = "Career Application";
    }

    const submission = {
      name: formData.get("name") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      company: formData.get("company") || "",
      website: formData.get("website") || "",
      industry: formData.get("industry") || "",
      services: this.getSelectedServices(formData),
      budget: formData.get("budget") || "",
      timeline: formData.get("timeline") || "",
      message: formData.get("message") || "",
      additionalInfo: formData.get("additionalInfo") || "",
      contactMethod: formData.get("contactMethod") || "",
      formType: formType,
      source: source,
      date: new Date().toISOString().split("T")[0],
      status: "New",
    };

    this.processFormSubmission(submission);
    this.showSuccessMessage(
      `Thank you for your ${formType.toLowerCase()}! We'll get back to you soon.`
    );
  }

  // Handle checkout forms
  handleCheckoutForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    const submission = {
      name: formData.get("name") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      company: formData.get("company") || "",
      message: formData.get("message") || "",
      services: this.getSelectedServices(formData),
      formType: "Checkout",
      source: "Checkout Form",
      date: new Date().toISOString().split("T")[0],
      status: "New",
    };

    this.processFormSubmission(submission);
    this.showSuccessMessage(
      "Thank you for your order! We'll process it and contact you soon."
    );
  }
}

// Initialize form integration when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Initializing form integration...");
    window.tnrFormIntegration = new TNRFormIntegration();
    console.log("✅ Form integration initialized");
  });
} else {
  console.log("🚀 Initializing form integration immediately...");
  window.tnrFormIntegration = new TNRFormIntegration();
  console.log("✅ Form integration initialized");
}
