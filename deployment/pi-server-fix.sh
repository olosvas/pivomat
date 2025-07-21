// Temporary fix for import.meta.dirname issue in production
// This replaces the problematic serveStatic function

const express = require('express');
const path = require('path');
const fs = require('fs');

function serveStatic(app) {
  // Use process.cwd() for production builds
  const distPath = path.resolve(process.cwd(), 'dist', 'public');
  
  console.log(`Looking for static files in: ${distPath}`);
  
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}`);
  }

  app.use(express.static(distPath));
  
  // Serve index.html for all non-API routes
  app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

module.exports = { serveStatic };
