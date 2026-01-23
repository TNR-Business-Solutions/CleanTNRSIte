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
        
        // Check if handler already attached (prevent duplicates)
        if (form.dataset.handlerAttached === "true") {
          console.log(`⚠️ Handler already attached to #${formId}, skipping`);
          return;
        }
        
        // Mark as attached and add event listener
        form.dataset.handlerAttached = "true";
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
    event.stopImmediatePropagation(); // Prevent other handlers from firing
    
    // Prevent double submission
    const form = event.target;
    if (form.dataset.submitting === "true") {
      console.warn("⚠️ Form submission already in progress, ignoring duplicate");
      return;
    }
    
    form.dataset.submitting = "true";
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      const originalText = submitButton.textContent;
      submitButton.textContent = "Sending...";
    }
    
    console.log(`📝 ${formType} submitted`);

    const formData = new FormData(event.target);

    // Collect ALL form data dynamically
    const submission = {
      // Core fields (always included)
      name:
        formData.get("name") ||
        (formData.get("firstName") && formData.get("lastName")
          ? `${formData.get("firstName")} ${formData.get("lastName")}`
          : formData.get("fullName") || ""),
      firstName: formData.get("firstName") || "",
      lastName: formData.get("lastName") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      company:
        formData.get("company") ||
        formData.get("currentCompany") ||
        formData.get("businessName") ||
        formData.get("business") ||
        "",
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
        formData.get("needs") ||
        "",
      additionalInfo:
        formData.get("additionalInfo") ||
        (formData.get("goal") ? `Goal: ${formData.get("goal")}` : "") ||
        (formData.get("newsletter") === "on" ? "Newsletter: Yes" : ""),
      contactMethod:
        formData.get("contactMethod") || formData.get("preferredContact") || "",

      // Insurance-specific fields
      insuranceType: formData.get("insuranceType") || "",
      insuranceTypes: formData.getAll("insuranceTypes") || [],
      coverageNeeds: formData.get("coverageNeeds") || "",
      currentInsurance: formData.get("currentInsurance") || "",

      // Career application fields
      position: formData.get("position") || "",
      experience: formData.get("experience") || "",
      availability: formData.get("availability") || "",
      resume: formData.get("resume") ? formData.get("resume").name : "",
      coverLetter: formData.get("coverLetter")
        ? formData.get("coverLetter").name
        : "",

      source: formType,
      status: "New",
      date: new Date().toISOString().split("T")[0],
    };

    // Collect ALL other form fields dynamically
    // Handle arrays properly (e.g., insuranceTypes checkboxes, services[])
    // Fields that should always be arrays (use getAll)
    const arrayFields = ["services", "insuranceTypes", "services[]"];

    for (const [key, value] of formData.entries()) {
      // Skip file inputs (already handled above)
      if (value instanceof File) {
        if (!submission.hasOwnProperty(key)) {
          submission[key] = value.name;
        }
        continue;
      }

      // Skip if already handled above with explicit single-value extraction
      if (submission.hasOwnProperty(key)) {
        // Only convert to array for fields that are meant to be arrays
        if (arrayFields.includes(key) || key.endsWith("[]")) {
          if (!Array.isArray(submission[key])) {
            submission[key] = [submission[key], value];
          } else {
            submission[key].push(value);
          }
        }
        // For single-value fields, keep the first value only (already set above)
        continue;
      }

      // Handle fields that should be arrays
      if (arrayFields.includes(key) || key.endsWith("[]")) {
        const allValues = formData.getAll(key);
        if (allValues.length > 0) {
          submission[key] = allValues;
        }
        continue;
      }

      // For single-value fields, use the first occurrence only
      // Skip empty values
      if (value && value.toString().trim() !== "") {
        submission[key] = value;
      }
    }

    // Normalize array fields - ensure they are arrays, and ensure single-value fields are strings
    if (
      submission.insuranceTypes &&
      !Array.isArray(submission.insuranceTypes)
    ) {
      submission.insuranceTypes = [submission.insuranceTypes];
    }
    if (submission.services && !Array.isArray(submission.services)) {
      submission.services = [submission.services];
    }

    // Ensure critical single-value fields are strings, not arrays
    if (Array.isArray(submission.name)) {
      submission.name = submission.name[0] || "";
    }
    if (Array.isArray(submission.email)) {
      submission.email = submission.email[0] || "";
    }
    if (Array.isArray(submission.phone)) {
      submission.phone = submission.phone[0] || "";
    }
    if (Array.isArray(submission.company)) {
      submission.company = submission.company[0] || "";
    }
    if (Array.isArray(submission.website)) {
      submission.website = submission.website[0] || "";
    }
    if (Array.isArray(submission.message)) {
      submission.message = submission.message[0] || "";
    }

    console.log("📊 Form data collected:", submission);
    console.log("📊 Form data keys:", Object.keys(submission));
    console.log("📊 Form data values:", Object.values(submission));

    try {
      // 1. Create lead in CRM (database via API, with localStorage fallback)
      console.log("🚀 Starting lead creation process...");
      const leadResult = await this.createLead(submission);
      if (leadResult) {
        console.log("✅ Lead created successfully:", leadResult.id);
      } else {
        console.error(
          "❌ CRITICAL: Lead creation returned null/undefined - lead may not be saved in database!"
        );
        console.error(
          "❌ This means the API call failed and localStorage fallback also failed."
        );
        // Don't block form submission, but log the critical error
      }

      // 2. Send to server for email (with files if career application)
      let emailResult = null;
      if (formType === "Career Application") {
        emailResult = await this.sendToServerWithFiles(
          event.target,
          submission
        );
      } else {
        emailResult = await this.sendToServer(submission);
      }

      if (emailResult && emailResult.success === false) {
        console.error("❌ Email sending failed:", emailResult.error);
      } else {
        console.log("✅ Email sent successfully");
      }

      // 3. Show success message
      this.showSuccess();

      // Reset form only after successful submission
      event.target.reset();

      // Reset cover letter notification
      const coverLetterNotification = document.getElementById(
        "coverLetterNotification"
      );
      if (coverLetterNotification) {
        coverLetterNotification.style.display = "none";
      }
    } catch (error) {
      console.error("❌ Form submission error:", error);
      alert(
        "There was an error submitting your form. Please try again or contact us directly at Roy.Turner@tnrbusinesssolutions.com"
      );
      throw error;
    } finally {
      // Reset submission flag and button state
      form.dataset.submitting = "false";
      if (submitButton) {
        submitButton.disabled = false;
        if (originalText) {
          submitButton.textContent = originalText;
        }
      }
    }
  }

  getServices(formData) {
    const services = formData.getAll("services[]");
    return services.length > 0 ? services : [];
  }

  async createLead(data) {
    console.log("🔄 createLead called with data:", data);

    // First, try to save to database via API (persistent storage)
    try {
      console.log("💾 Attempting to save lead to database via API...");
      const response = await fetch("/api/crm/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log(
        "📡 API response status:",
        response.status,
        response.statusText
      );
      console.log(
        "📡 API response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log("✅ Lead saved to database:", result.data);
          // Also save to localStorage as backup
          this.saveToLocalStorageBackup(result.data);
          return result.data;
        } else {
          console.error("❌ API returned success:false", result);
          throw new Error(result.error || "Failed to save lead");
        }
      } else {
        const errorText = await response
          .text()
          .catch(() => response.statusText);
        console.error("❌ API request failed:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          url: "/api/crm/leads",
          method: "POST",
        });
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - ${errorText}`
        );
      }
    } catch (apiError) {
      console.error(
        "⚠️ API save failed, falling back to localStorage:",
        apiError.message,
        apiError.stack
      );
      console.error("⚠️ Full error object:", apiError);

      // Fallback to localStorage if API fails
      console.log("🔍 Checking CRM availability for localStorage fallback...");
      console.log(
        "  - TNRCRMData class:",
        typeof window.TNRCRMData !== "undefined"
          ? "✅ Available"
          : "❌ Not found"
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
        console.log("✅ CRM is ready, creating lead in localStorage...");

        try {
          const lead = window.tnrCRM.addLead(data);
          console.log("✅ Lead created in localStorage:", lead);

          // Force save to localStorage
          window.tnrCRM.saveToStorage();
          console.log("💾 Lead saved to localStorage (fallback)");

          return lead;
        } catch (error) {
          console.error("❌ Error creating lead in localStorage:", error);
          console.error("Error stack:", error.stack);
          // Don't alert - just log, as this is a fallback
          return null;
        }
      } else {
        console.error("❌ CRITICAL: Both API and CRM system unavailable!");
        // Don't alert - form submission will still send email
        return null;
      }
    }
  }

  // Save to localStorage as backup
  saveToLocalStorageBackup(lead) {
    try {
      const stored = localStorage.getItem("tnr_crm_leads");
      const leads = stored ? JSON.parse(stored) : [];
      leads.push(lead);
      localStorage.setItem("tnr_crm_leads", JSON.stringify(leads));
      console.log("💾 Lead also saved to localStorage as backup");
    } catch (error) {
      console.warn("⚠️ Failed to save to localStorage backup:", error);
    }
  }

  async sendToServer(data) {
    try {
      console.log("📧 Sending form data to server for email notification...");
      console.log("📧 Data being sent:", JSON.stringify(data, null, 2));

      const response = await fetch("/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        console.log("✅ Email sent successfully:", result);
        return { success: true, result };
      } else {
        const errorText = await response
          .text()
          .catch(() => response.statusText);
        console.error("❌ Server error:", response.status, errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      return { success: false, error: error.message };
    }
  }

  async sendToServerWithFiles(form, data) {
    try {
      // Convert files to base64 for sending in JSON
      const formData = new FormData(form);
      const resumeFile = formData.get("resume");
      const coverLetterFile = formData.get("coverLetter");

      // Convert resume to base64 if present (max 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (resumeFile && resumeFile instanceof File && resumeFile.size > 0) {
        if (resumeFile.size > MAX_FILE_SIZE) {
          alert(
            `Resume file is too large (${(
              resumeFile.size /
              1024 /
              1024
            ).toFixed(
              2
            )} MB). Maximum size is 10 MB. Please compress the file and try again.`
          );
          console.error("❌ Resume file too large:", resumeFile.size, "bytes");
        } else {
          try {
            data.resumeFileName = resumeFile.name;
            data.resumeFileSize = resumeFile.size;
            data.resumeFileType = resumeFile.type;
            data.resumeFileBase64 = await this.fileToBase64(resumeFile);
            console.log(
              "✅ Resume file converted to base64:",
              resumeFile.name,
              `(${(resumeFile.size / 1024).toFixed(2)} KB)`
            );
          } catch (error) {
            console.error("❌ Error converting resume to base64:", error);
            alert("Error processing resume file. Please try again.");
          }
        }
      }

      // Convert cover letter to base64 if present (max 10MB)
      if (
        coverLetterFile &&
        coverLetterFile instanceof File &&
        coverLetterFile.size > 0
      ) {
        if (coverLetterFile.size > MAX_FILE_SIZE) {
          alert(
            `Cover letter file is too large (${(
              coverLetterFile.size /
              1024 /
              1024
            ).toFixed(
              2
            )} MB). Maximum size is 10 MB. Please compress the file and try again.`
          );
          console.error(
            "❌ Cover letter file too large:",
            coverLetterFile.size,
            "bytes"
          );
        } else {
          try {
            data.coverLetterFileName = coverLetterFile.name;
            data.coverLetterFileSize = coverLetterFile.size;
            data.coverLetterFileType = coverLetterFile.type;
            data.coverLetterFileBase64 = await this.fileToBase64(
              coverLetterFile
            );
            console.log(
              "✅ Cover letter file converted to base64:",
              coverLetterFile.name,
              `(${(coverLetterFile.size / 1024).toFixed(2)} KB)`
            );
          } catch (error) {
            console.error("❌ Error converting cover letter to base64:", error);
            alert("Error processing cover letter file. Please try again.");
          }
        }
      }

      // Send JSON data with base64 encoded files
      const jsonResponse = await fetch("/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (jsonResponse.ok) {
        console.log("✅ Email sent successfully with file attachments");
      } else {
        const errorData = await jsonResponse.json().catch(() => ({}));
        console.error("❌ Server error:", jsonResponse.statusText, errorData);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      return { success: false, error: error.message };
    }
  }

  // Helper function to convert File to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove the data:application/...;base64, prefix
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  showSuccess() {
    // Check if this was a career application
    const url = window.location.pathname;
    if (url.includes("careers") || url.includes("career")) {
      alert(
        "✅ Thank you for your application! We will review your information and get back to you within 2-3 business days."
      );
    } else {
      alert(
        "✅ Thank you! Your message has been sent. We'll contact you soon."
      );
    }
  }
}

// Initialize when page loads
if (typeof window !== "undefined") {
  console.log("🚀 form-integration-simple.js loaded");

  // Prevent duplicate initialization
  if (window.simpleFormIntegration) {
    console.warn("⚠️ form-integration-simple.js already initialized, skipping");
  } else {
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
}
