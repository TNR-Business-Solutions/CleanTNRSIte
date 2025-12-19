const nodemailer = require("nodemailer");
require("dotenv").config();

// In-memory cart storage (in production, use a database)
let carts = new Map();

// Create transporter for sending emails
const createTransporter = () => {
  // Validate required environment variables
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      "SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables."
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Service definitions
const services = {
  // Digital Marketing Packages
  "basic-website": {
    id: "basic-website",
    name: "Basic Website Package",
    price: 300,
    category: "Digital Marketing",
    description:
      "Professional website with 5 pages, mobile responsive design, and basic SEO",
    features: [
      "5 Pages",
      "Mobile Responsive",
      "Basic SEO",
      "Contact Form",
      "1 Month Support",
    ],
  },
  "premium-website": {
    id: "premium-website",
    name: "Premium Website Package",
    price: 800,
    category: "Digital Marketing",
    description:
      "Advanced website with 10 pages, e-commerce integration, and comprehensive SEO",
    features: [
      "10 Pages",
      "E-commerce Ready",
      "Advanced SEO",
      "Analytics Setup",
      "3 Months Support",
    ],
  },
  "ecommerce-package": {
    id: "ecommerce-package",
    name: "E-commerce Package",
    price: 2500,
    category: "Digital Marketing",
    description:
      "Complete e-commerce solution with payment processing and inventory management",
    features: [
      "Unlimited Products",
      "Payment Processing",
      "Inventory Management",
      "Order Tracking",
      "6 Months Support",
    ],
  },

  // A La Carte Services
  "seo-optimization": {
    id: "seo-optimization",
    name: "SEO Optimization",
    price: 200,
    category: "A La Carte",
    description: "Comprehensive SEO audit and optimization for your website",
    features: [
      "Keyword Research",
      "On-Page Optimization",
      "Technical SEO",
      "Performance Analysis",
    ],
  },
  "social-media-setup": {
    id: "social-media-setup",
    name: "Social Media Setup",
    price: 150,
    category: "A La Carte",
    description: "Complete social media profile setup and content strategy",
    features: [
      "Profile Optimization",
      "Content Calendar",
      "Brand Guidelines",
      "Posting Schedule",
    ],
  },
  "email-marketing-setup": {
    id: "email-marketing-setup",
    name: "Email Marketing Setup",
    price: 180,
    category: "A La Carte",
    description: "Email marketing platform setup with templates and automation",
    features: [
      "Platform Setup",
      "Email Templates",
      "Automation Workflows",
      "List Management",
    ],
  },
  "google-ads-setup": {
    id: "google-ads-setup",
    name: "Google Ads Setup",
    price: 250,
    category: "A La Carte",
    description: "Google Ads campaign setup and optimization",
    features: [
      "Campaign Creation",
      "Keyword Research",
      "Ad Copy Writing",
      "Landing Page Optimization",
    ],
  },
  "content-creation": {
    id: "content-creation",
    name: "Content Creation",
    price: 100,
    category: "A La Carte",
    description: "Professional content creation for your marketing needs",
    features: [
      "Blog Posts",
      "Social Media Content",
      "Website Copy",
      "Marketing Materials",
    ],
  },
  "analytics-setup": {
    id: "analytics-setup",
    name: "Analytics Setup",
    price: 120,
    category: "A La Carte",
    description: "Complete analytics and tracking setup for your business",
    features: [
      "Google Analytics",
      "Conversion Tracking",
      "Custom Reports",
      "Data Analysis",
    ],
  },
};

// Cart management functions
const getCart = (sessionId) => {
  if (!carts.has(sessionId)) {
    carts.set(sessionId, {
      items: [],
      total: 0,
      createdAt: new Date(),
    });
  }
  return carts.get(sessionId);
};

const addToCart = (sessionId, serviceId, quantity = 1) => {
  const cart = getCart(sessionId);
  const service = services[serviceId];

  if (!service) {
    return { success: false, message: "Service not found" };
  }

  const existingItem = cart.items.find((item) => item.id === serviceId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      ...service,
      quantity: quantity,
    });
  }

  updateCartTotal(cart);
  return { success: true, message: "Item added to cart", cart };
};

const removeFromCart = (sessionId, serviceId) => {
  const cart = getCart(sessionId);
  cart.items = cart.items.filter((item) => item.id !== serviceId);
  updateCartTotal(cart);
  return { success: true, message: "Item removed from cart", cart };
};

const updateCartItem = (sessionId, serviceId, quantity) => {
  const cart = getCart(sessionId);
  const item = cart.items.find((item) => item.id === serviceId);

  if (item) {
    if (quantity <= 0) {
      return removeFromCart(sessionId, serviceId);
    }
    item.quantity = quantity;
    updateCartTotal(cart);
  }

  return { success: true, message: "Cart updated", cart };
};

const clearCart = (sessionId) => {
  carts.set(sessionId, {
    items: [],
    total: 0,
    createdAt: new Date(),
  });
  return { success: true, message: "Cart cleared" };
};

const updateCartTotal = (cart) => {
  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

// Checkout and payment processing
const processCheckout = async (
  sessionId,
  customerInfo,
  paymentInfo,
  cartData = null
) => {
  let cart;

  if (cartData && cartData.length > 0) {
    // Use cart data passed from frontend
    cart = {
      items: cartData,
      total: cartData.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
      createdAt: new Date(),
    };
  } else {
    // Use stored cart
    cart = getCart(sessionId);
  }

  if (cart.items.length === 0) {
    return { success: false, message: "Cart is empty" };
  }

  try {
    // Generate order number
    const orderNumber = `TNR-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // For now, we'll simulate payment processing and send email confirmation
    // In production, integrate with Square API here

    const order = {
      orderNumber,
      customerInfo,
      items: cart.items,
      total: cart.total,
      status: "confirmed",
      createdAt: new Date(),
      paymentMethod: paymentInfo.method || "Credit Card",
    };

    // Send confirmation email
    await sendOrderConfirmation(order);

    // Clear cart after successful checkout
    clearCart(sessionId);

    return {
      success: true,
      message: "Order processed successfully",
      orderNumber,
      order,
    };
  } catch (error) {
    return { success: false, message: "Checkout failed: " + error.message };
  }
};

// Send order confirmation email
const sendOrderConfirmation = async (order) => {
  const transporter = createTransporter();

  const orderItemsHtml = order.items
    .map(
      (item) => `
    <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
      <h4 style="margin: 0 0 10px 0; color: #2c5530;">${item.name}</h4>
      <p style="margin: 5px 0; color: #666;">${item.description}</p>
      <p style="margin: 5px 0;"><strong>Quantity:</strong> ${item.quantity}</p>
      <p style="margin: 5px 0;"><strong>Price:</strong> $${item.price.toFixed(
        2
      )} each</p>
      <p style="margin: 5px 0;"><strong>Subtotal:</strong> $${(
        item.price * item.quantity
      ).toFixed(2)}</p>
    </div>
  `
    )
    .join("");

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: order.customerInfo.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530; text-align: center;">Order Confirmation</h2>
        <p>Dear ${order.customerInfo.firstName} ${
      order.customerInfo.lastName
    },</p>
        
        <p>Thank you for your order! We're excited to work with you on your digital marketing needs.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c5530;">Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>
        
        <h3 style="color: #2c5530;">Items Ordered</h3>
        ${orderItemsHtml}
        
        <div style="background-color: #2c5530; color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; text-align: center;">Total: $${order.total.toFixed(
            2
          )}</h3>
        </div>
        
        <h3 style="color: #2c5530;">Next Steps</h3>
        <p>Our team will contact you within 24 hours to discuss your project details and get started. We'll need to gather some additional information about your business and goals.</p>
        
        <p>If you have any questions about your order, please don't hesitate to contact us at <a href="mailto:Roy.Turner@tnrbusinesssolutions.com">Roy.Turner@tnrbusinesssolutions.com</a> or call us at (412) 499-2987.</p>
        
        <p>Thank you for choosing TNR Business Solutions!</p>
        
        <hr style="margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          TNR Business Solutions<br>
          418 Concord Avenue, Greensburg, PA 15601<br>
          Phone: (412) 499-2987 | Email: Roy.Turner@tnrbusinesssolutions.com
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);

  // Also send notification to business email
  const businessNotification = {
    from: process.env.SMTP_USER,
    to: process.env.BUSINESS_EMAIL,
    subject: `New Order Received - ${order.orderNumber}`,
    html: `
      <h2>New Order Received</h2>
      <p><strong>Order Number:</strong> ${order.orderNumber}</p>
      <p><strong>Customer:</strong> ${order.customerInfo.firstName} ${
      order.customerInfo.lastName
    }</p>
      <p><strong>Email:</strong> ${order.customerInfo.email}</p>
      <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
      
      <h3>Items:</h3>
      ${orderItemsHtml}
      
      <p><strong>Action Required:</strong> Contact customer within 24 hours to begin project.</p>
    `,
  };

  await transporter.sendMail(businessNotification);
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  processCheckout,
  services,
};
