// Vercel serverless route for /api/campaigns/*
const handler = require("../campaign-api");

module.exports = (req, res) => handler(req, res);


