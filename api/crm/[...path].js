// Vercel serverless route for /api/crm/*
const handler = require("../crm-api");

module.exports = (req, res) => handler(req, res);


