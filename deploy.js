#!/usr/bin/env node

/**
 * Quick deployment script for hassaniya.info
 * This script automates the deployment process to Vercel
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Deploying Hassaniya Host to hassaniya.info...\n');

const runCommand = (command, description) => {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
};

// Check if we're in the right directory
if (!require('fs').existsSync(path.join(__dirname, 'package.json'))) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Deployment steps
const steps = [
  {
    command: 'npm run audit:security',
    description: 'Running security audit'
  },
  {
    command: 'npm run lint',
    description: 'Running code linting'
  },
  {
    command: 'npm run build:prod',
    description: 'Building production bundle'
  },
  {
    command: 'vercel --prod',
    description: 'Deploying to Vercel production (hassaniya.info)'
  }
];

// Execute deployment steps
steps.forEach(step => {
  runCommand(step.command, step.description);
});

console.log('🎉 Deployment completed successfully!');
console.log('🌐 Your site is now live at: https://hassaniya.info');
console.log('📊 Visit Vercel dashboard to monitor performance and analytics');
