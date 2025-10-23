const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "roy.turner@tnrbusinesssolutions.com",
    pass: process.env.SMTP_PASS,
  },
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { sessionId, customerInfo, paymentInfo, cart } = req.body;
    
    console.log("📦 Checkout request received:", { sessionId, customerInfo, cartItems: cart.length });

    // Generate order number
    const orderNumber = `TNR-${Date.now()}`;
    
    // Calculate totals
    let subtotal = 0;
    let setupFee = 0;
    
    cart.forEach(item => {
      subtotal += item.price * item.quantity;
      
      // Add setup fees
      if (item.id.includes('website') || item.id.includes('ecommerce') || item.id.includes('seo')) {
        setupFee += 200;
      } else if (item.id.includes('ads') || item.id.includes('analytics')) {
        setupFee += 100;
      }
    });
    
    const tax = subtotal * 0.08;
    const monthlyTotal = subtotal + tax;
    const annualTotal = monthlyTotal * 10;
    
    // Build cart items HTML
    const cartItemsHtml = cart.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd;">
          <strong>${item.name}</strong><br>
          <span style="color: #666; font-size: 14px;">${item.description}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toLocaleString()}/mo</td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toLocaleString()}/mo</td>
      </tr>
    `).join('');

    // Email to business
    const businessEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5530; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #2c5530; border-bottom: 2px solid #f59e0b; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .total-row { font-weight: bold; background: #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Order Received!</h1>
            <p>Order #${orderNumber}</p>
          </div>
          <div class="content">
            <div class="section">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${customerInfo.firstName} ${customerInfo.lastName}</p>
              <p><strong>Email:</strong> ${customerInfo.email}</p>
              <p><strong>Phone:</strong> ${customerInfo.phone}</p>
              ${customerInfo.company ? `<p><strong>Company:</strong> ${customerInfo.company}</p>` : ''}
              <p><strong>Address:</strong> ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}</p>
            </div>

            <div class="section">
              <h3>Order Details</h3>
              <table>
                <thead>
                  <tr style="background: #2c5530; color: white;">
                    <th style="padding: 12px; text-align: left;">Service</th>
                    <th style="padding: 12px; text-align: center;">Qty</th>
                    <th style="padding: 12px; text-align: right;">Price</th>
                    <th style="padding: 12px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${cartItemsHtml}
                  <tr class="total-row">
                    <td colspan="3" style="padding: 12px; text-align: right;">Subtotal:</td>
                    <td style="padding: 12px; text-align: right;">$${subtotal.toLocaleString()}/mo</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Tax (8%):</td>
                    <td style="padding: 12px; text-align: right;">$${tax.toFixed(2)}/mo</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Setup Fee (One-time):</td>
                    <td style="padding: 12px; text-align: right;">$${setupFee.toLocaleString()}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" style="padding: 12px; text-align: right; font-size: 18px;">Monthly Total:</td>
                    <td style="padding: 12px; text-align: right; font-size: 18px; color: #f59e0b;">$${monthlyTotal.toFixed(2)}/mo</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding: 12px; text-align: right;">Annual Total (Save 2 months!):</td>
                    <td style="padding: 12px; text-align: right; color: #28a745;">$${annualTotal.toFixed(2)}/yr</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="section">
              <h3>Project Details</h3>
              <p><strong>Timeline:</strong> ${customerInfo.projectTimeline || 'Not specified'}</p>
              ${customerInfo.specialRequests ? `<p><strong>Special Requests:</strong><br>${customerInfo.specialRequests}</p>` : ''}
            </div>

            <div class="section">
              <h3>Payment Information</h3>
              <p><strong>Method:</strong> ${paymentInfo.method === 'credit-card' ? 'Credit Card' : 'PayPal'}</p>
              <p><strong>Session ID:</strong> ${sessionId}</p>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #f59e0b;">
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Contact the customer within 24 hours</li>
                <li>Confirm project details and timeline</li>
                <li>Process payment and begin onboarding</li>
              </ol>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email to customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c5530; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #2c5530; border-bottom: 2px solid #f59e0b; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          .total-row { font-weight: bold; background: #f0f0f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p>Thank you for choosing TNR Business Solutions</p>
          </div>
          <div class="content">
            <p>Hi ${customerInfo.firstName},</p>
            <p>We've received your order and we're excited to work with you! Here's a summary of your order:</p>

            <div class="section">
              <h3>Order Summary - #${orderNumber}</h3>
              <table>
                <thead>
                  <tr style="background: #2c5530; color: white;">
                    <th style="padding: 12px; text-align: left;">Service</th>
                    <th style="padding: 12px; text-align: center;">Qty</th>
                    <th style="padding: 12px; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${cartItemsHtml}
                  <tr class="total-row">
                    <td colspan="2" style="padding: 12px; text-align: right;">Monthly Total:</td>
                    <td style="padding: 12px; text-align: right; color: #f59e0b;">$${monthlyTotal.toFixed(2)}/mo</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 12px; text-align: right;">Annual Total (Save 2 months!):</td>
                    <td style="padding: 12px; text-align: right; color: #28a745;">$${annualTotal.toFixed(2)}/yr</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-top: 20px; padding: 15px; background: #d1f2eb; border-left: 4px solid #28a745;">
              <p><strong>What Happens Next?</strong></p>
              <ol>
                <li>We'll contact you within 24 hours to confirm details</li>
                <li>We'll discuss your project timeline and requirements</li>
                <li>Once payment is processed, we'll begin your project</li>
              </ol>
            </div>

            <div style="margin-top: 20px; text-align: center; padding: 20px; background: white; border-radius: 8px;">
              <p><strong>Questions?</strong></p>
              <p>Contact us at:<br>
              📧 <a href="mailto:roy.turner@tnrbusinesssolutions.com">roy.turner@tnrbusinesssolutions.com</a><br>
              📞 412-499-2987</p>
            </div>

            <p style="margin-top: 20px;">We look forward to helping your business grow!</p>
            <p><strong>The TNR Business Solutions Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const businessEmail = process.env.BUSINESS_EMAIL || "roy.turner@tnrbusinesssolutions.com";

    // Send emails
    const [businessResult, customerResult] = await Promise.all([
      transporter.sendMail({
        from: `"TNR Business Solutions" <${businessEmail}>`,
        to: businessEmail,
        subject: `🎉 New Order #${orderNumber} - ${customerInfo.firstName} ${customerInfo.lastName}`,
        html: businessEmailHtml,
      }),
      transporter.sendMail({
        from: `"TNR Business Solutions" <${businessEmail}>`,
        to: customerInfo.email,
        replyTo: businessEmail,
        subject: `Order Confirmation #${orderNumber} - TNR Business Solutions`,
        html: customerEmailHtml,
      })
    ]);

    console.log("📧 Emails sent successfully:", {
      business: businessResult.messageId,
      customer: customerResult.messageId
    });

    return res.status(200).json({
      success: true,
      orderNumber: orderNumber,
      message: "Order processed successfully",
      emailSent: true,
    });

  } catch (error) {
    console.error("❌ Checkout error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process checkout",
      error: error.message,
    });
  }
};

