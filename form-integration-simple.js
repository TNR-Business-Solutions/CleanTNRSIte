// TNR Business Solutions - Simple Form Integration
// One clear path: Form → CRM Lead → Server Email

class SimpleFormIntegration {
  constructor() {
    this.setupFormHandlers();
  }

  setupFormHandlers() {
    // Wait for DOM
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initForms());
    } else {
      this.initForms();
    }
  }

  initForms() {
    // Handle all form types
    const forms = {
      "contact-form": "Contact Form",
      "insurance-inquiry-form": "Insurance Inquiry",
      careerApplicationForm: "Career Application",
      "quote-form": "Quote Request",
    };

    Object.keys(forms).forEach((formId) => {
      const form = document.getElementById(formId);
      if (form) {
        const formType = forms[formId];
        form.addEventListener("submit", (e) => this.handleSubmit(e, formType));
        console.log(`✅ ${formType} handler attached`);
      }
    });
  }

  async handleSubmit(event, formType = "Contact Form") {
    event.preventDefault();
    console.log(`📝 ${formType} submitted`);

    const formData = new FormData(event.target);

    // Collect ALL form data (works for all form types)
    const submission = {
      name: formData.get("name") || formData.get("fullName") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      company: formData.get("company") || formData.get("businessName") || "",
      website: formData.get("website") || "",
      industry: formData.get("industry") || "",
      services: this.getServices(formData),
      budget: formData.get("budget") || "",
      timeline: formData.get("timeline") || "",
      message:
        formData.get("message") ||
        formData.get("additionalInfo") ||
        formData.get("details") ||
        "",
      additionalInfo: formData.get("additionalInfo") || "",
      contactMethod:
        formData.get("contactMethod") || formData.get("preferredContact") || "",

      // Insurance-specific fields
      insuranceType: formData.get("insuranceType") || "",
      coverageNeeds: formData.get("coverageNeeds") || "",
      currentInsurance: formData.get("currentInsurance") || "",

      // Career application fields
      position: formData.get("position") || "",
      resume: formData.get("resume") || "",
      coverLetter: formData.get("coverLetter") || "",

      source: formType,
      status: "New",
      date: new Date().toISOString().split("T")[0],
    };

    console.log("📊 Form data collected:", submission);

    // 1. Create lead in CRM (localStorage)
    this.createLead(submission);

    // 2. Send to server for email
    await this.sendToServer(submission);

    // 3. Show success message
    this.showSuccess();

    // Reset form
    event.target.reset();
  }

  getServices(formData) {
    const services = formData.getAll("services[]");
    return services.length > 0 ? services : [];
  }

  createLead(data) {
    console.log("🔄 createLead called");
    console.log(
      "🔍 TNRCRMData available?",
      typeof window.TNRCRMData !== "undefined"
    );
    console.log("🔍 window.tnrCRM exists?", !!window.tnrCRM);

    // Initialize CRM if needed
    if (!window.tnrCRM && typeof window.TNRCRMData !== "undefined") {
      console.log("🏗️ Creating new CRM instance...");
      window.tnrCRM = new window.TNRCRMData();
      console.log("✅ CRM instance created");
    }

    if (window.tnrCRM) {
      console.log("✅ CRM available, creating lead with data:", data);

      try {
        const lead = window.tnrCRM.addLead(data);
        console.log("✅ Lead created in CRM:", lead);

        // Force save
        window.tnrCRM.saveToStorage();
        console.log("💾 Saved to localStorage");

        // Verify
        const savedLeads = localStorage.getItem("tnr_crm_leads");
        const leadsArray = savedLeads ? JSON.parse(savedLeads) : [];
        console.log("📊 Total leads in localStorage:", leadsArray.length);
        console.log("📋 All leads:", leadsArray);

        return lead;
      } catch (error) {
        console.error("❌ Error creating lead:", error);
        alert("ERROR: " + error.message);
        return null;
      }
    } else {
      console.error(
        "❌ CRM not available - TNRCRMData:",
        typeof window.TNRCRMData
      );
      alert("ERROR: CRM system not loaded. crm-data.js may not be loading.");
      return null;
    }
  }

  async sendToServer(data) {
    try {
      const response = await fetch("/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("✅ Email sent successfully");
      } else {
        console.error("❌ Server error:", response.statusText);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
    }
  }

  showSuccess() {
    alert("✅ Thank you! Your message has been sent. We'll contact you soon.");
  }
}

// Initialize when page loads
if (typeof window !== "undefined") {
  console.log("🚀 form-integration-simple.js loaded");

  // Wait for both DOM and CRM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      console.log("📄 DOM ready, initializing form integration");
      window.simpleFormIntegration = new SimpleFormIntegration();
    });
  } else {
    console.log(
      "📄 DOM already ready, initializing form integration immediately"
    );
    window.simpleFormIntegration = new SimpleFormIntegration();
  }
}
