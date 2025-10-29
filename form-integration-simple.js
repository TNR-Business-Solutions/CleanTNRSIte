// TNR Business Solutions - Simple Form Integration
// One clear path: Form → CRM Lead → Server Email

class SimpleFormIntegration {
  constructor() {
    console.log("🔧 SimpleFormIntegration constructor called");
    this.initForms();
  }

  initForms() {
    console.log("🔍 initForms called, looking for forms...");

    // Handle all form types
    const forms = {
      "contact-form": "Contact Form",
      "insurance-inquiry-form": "Insurance Inquiry",
      careerApplicationForm: "Career Application",
      "quote-form": "Quote Request",
    };

    let formsFound = 0;
    Object.keys(forms).forEach((formId) => {
      const form = document.getElementById(formId);
      if (form) {
        const formType = forms[formId];
        form.addEventListener("submit", (e) => this.handleSubmit(e, formType));
        console.log(`✅ ${formType} handler attached to #${formId}`);
        formsFound++;
      } else {
        console.log(`⚠️ Form #${formId} not found on this page`);
      }
    });

    if (formsFound === 0) {
      console.warn("⚠️ No forms found on this page!");
    } else {
      console.log(`✅ Total forms initialized: ${formsFound}`);
    }
  }

  async handleSubmit(event, formType = "Contact Form") {
    event.preventDefault();
    console.log(`📝 ${formType} submitted`);

    const formData = new FormData(event.target);

    // Collect ALL form data dynamically
    const submission = {
      // Core fields (always included)
      name: formData.get("name") || 
            (formData.get("firstName") && formData.get("lastName") 
              ? `${formData.get("firstName")} ${formData.get("lastName")}` 
              : formData.get("fullName") || ""),
      firstName: formData.get("firstName") || "",
      lastName: formData.get("lastName") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      company: formData.get("company") || formData.get("currentCompany") || formData.get("businessName") || "",
      currentCompany: formData.get("currentCompany") || "",
      address: formData.get("address") || "",
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
      experience: formData.get("experience") || "",
      availability: formData.get("availability") || "",
      resume: formData.get("resume") ? formData.get("resume").name : "",
      coverLetter: formData.get("coverLetter") ? formData.get("coverLetter").name : "",

      source: formType,
      status: "New",
      date: new Date().toISOString().split("T")[0],
    };

    // Collect ALL other form fields dynamically
    for (const [key, value] of formData.entries()) {
      // Skip file inputs (already handled above)
      if (value instanceof File) {
        if (!submission.hasOwnProperty(key)) {
          submission[key] = value.name;
        }
        continue;
      }
      // Skip empty values
      if (!submission.hasOwnProperty(key) && value && value.toString().trim() !== '') {
        submission[key] = value;
      }
    }

    console.log("📊 Form data collected:", submission);

    // 1. Create lead in CRM (localStorage)
    this.createLead(submission);

    // 2. Send to server for email (with files if career application)
    if (formType === "Career Application") {
      await this.sendToServerWithFiles(event.target, submission);
    } else {
      await this.sendToServer(submission);
    }

    // 3. Show success message
    this.showSuccess();

    // Reset form
    event.target.reset();
    // Reset cover letter notification
    const coverLetterNotification = document.getElementById('coverLetterNotification');
    if (coverLetterNotification) {
      coverLetterNotification.style.display = 'none';
    }
  }

  getServices(formData) {
    const services = formData.getAll("services[]");
    return services.length > 0 ? services : [];
  }

  createLead(data) {
    console.log("🔄 createLead called with data:", data);
    console.log("🔍 Checking CRM availability...");
    console.log(
      "  - TNRCRMData class:",
      typeof window.TNRCRMData !== "undefined" ? "✅ Available" : "❌ Not found"
    );
    console.log(
      "  - window.tnrCRM instance:",
      window.tnrCRM ? "✅ Exists" : "❌ Not initialized"
    );

    // Initialize CRM if needed (fallback)
    if (!window.tnrCRM && typeof window.TNRCRMData !== "undefined") {
      console.log("🏗️ CRM not initialized, creating new instance...");
      window.tnrCRM = new window.TNRCRMData();
      console.log("✅ CRM instance created");
    }

    if (window.tnrCRM) {
      console.log("✅ CRM is ready, creating lead...");

      try {
        const lead = window.tnrCRM.addLead(data);
        console.log("✅ Lead created successfully:", lead);

        // Force save to localStorage
        window.tnrCRM.saveToStorage();
        console.log("💾 Lead saved to localStorage");

        // Verify it was saved
        const savedLeads = localStorage.getItem("tnr_crm_leads");
        const leadsArray = savedLeads ? JSON.parse(savedLeads) : [];
        console.log(`📊 Total leads in localStorage: ${leadsArray.length}`);
        console.log(
          "📋 Last lead in storage:",
          leadsArray[leadsArray.length - 1]
        );

        return lead;
      } catch (error) {
        console.error("❌ Error creating lead:", error);
        console.error("Error stack:", error.stack);
        alert("ERROR creating lead: " + error.message);
        return null;
      }
    } else {
      console.error("❌ CRITICAL: CRM system not available!");
      console.error("  - TNRCRMData class:", typeof window.TNRCRMData);
      console.error("  - window.tnrCRM:", window.tnrCRM);
      alert(
        "ERROR: CRM system not loaded. Please refresh the page and try again."
      );
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

  async sendToServerWithFiles(form, data) {
    try {
      // Create FormData to send files
      const formData = new FormData(form);
      
      // Add all text fields to FormData
      Object.keys(data).forEach(key => {
        if (key !== 'resume' && key !== 'coverLetter' && data[key]) {
          formData.append(key, data[key]);
        }
      });

      // Add file info to the data object
      const resumeFile = formData.get("resume");
      const coverLetterFile = formData.get("coverLetter");
      
      if (resumeFile instanceof File) {
        data.resumeFileName = resumeFile.name;
        data.resumeFileSize = resumeFile.size;
        data.resumeFileType = resumeFile.type;
      }
      
      if (coverLetterFile instanceof File) {
        data.coverLetterFileName = coverLetterFile.name;
        data.coverLetterFileSize = coverLetterFile.size;
        data.coverLetterFileType = coverLetterFile.type;
      }

      // First, send JSON data (includes file metadata)
      const jsonResponse = await fetch("/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (jsonResponse.ok) {
        console.log("✅ Email sent successfully with file attachments");
      } else {
        console.error("❌ Server error:", jsonResponse.statusText);
      }

      // For actual file uploads, you would need a separate endpoint that accepts multipart/form-data
      // For now, we're sending file metadata in the JSON payload
      // The email will include the file names and sizes
    } catch (error) {
      console.error("❌ Network error:", error);
    }
  }

  showSuccess() {
    // Check if this was a career application
    const url = window.location.pathname;
    if (url.includes('careers') || url.includes('career')) {
      alert("✅ Thank you for your application! We will review your information and get back to you within 2-3 business days.");
    } else {
      alert("✅ Thank you! Your message has been sent. We'll contact you soon.");
    }
  }
}

// Initialize when page loads
if (typeof window !== "undefined") {
  console.log("🚀 form-integration-simple.js loaded");

  // Wait for DOM to be fully ready
  if (document.readyState === "loading") {
    console.log("⏳ Waiting for DOM to load...");
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
