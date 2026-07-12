#!/usr/bin/env node

/**
 * Deployment Readiness Verification Script
 * 
 * Script ini mengecek apakah project Mentalytics siap dideploy ke Vercel
 * 
 * Usage:
 *   node verify-deployment-ready.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkMark() {
  return '✅';
}

function crossMark() {
  return '❌';
}

function warningMark() {
  return '⚠️';
}

// Checks
const checks = {
  files: {
    required: [
      'package.json',
      'package-lock.json',
      'vite.config.js',
      'tailwind.config.js',
      'postcss.config.js',
      'index.html',
      'vercel.json',
      '.gitignore',
      'README.md',
      'DEPLOYMENT_GUIDE.md',
      'deploy.md',
      'PRE_DEPLOYMENT_CHECKLIST.md',
      'DEPLOYMENT_SUMMARY.md',
    ],
    envLocal: '.env.local',
  },
  folders: {
    required: [
      'src',
      'public',
      'supabase/migrations',
    ],
  },
  envVariables: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GEMINI_API_KEY',
  ],
};

let totalChecks = 0;
let passedChecks = 0;
let warnings = 0;

function performCheck(condition, successMessage, failMessage, isWarning = false) {
  totalChecks++;
  if (condition) {
    log(`${checkMark()} ${successMessage}`, 'green');
    passedChecks++;
  } else {
    if (isWarning) {
      log(`${warningMark()} ${failMessage}`, 'yellow');
      warnings++;
      passedChecks++; // Still counts as passed for warnings
    } else {
      log(`${crossMark()} ${failMessage}`, 'red');
    }
  }
}

console.log('\n');
log('═══════════════════════════════════════════════════════════', 'cyan');
log('🚀 MENTALYTICS DEPLOYMENT READINESS CHECK', 'cyan');
log('═══════════════════════════════════════════════════════════', 'cyan');
console.log('\n');

// Check 1: Required Files
log('📄 Checking Required Files...', 'blue');
checks.files.required.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  performCheck(
    exists,
    `File found: ${file}`,
    `Missing required file: ${file}`
  );
});
console.log('\n');

// Check 2: Environment File
log('🔐 Checking Environment Variables File...', 'blue');
const envExists = fs.existsSync(path.join(__dirname, checks.files.envLocal));
performCheck(
  envExists,
  'Environment file (.env.local) exists',
  'Missing .env.local file - required for development'
);

if (envExists) {
  const envContent = fs.readFileSync(path.join(__dirname, checks.files.envLocal), 'utf-8');
  checks.envVariables.forEach(varName => {
    const hasVar = envContent.includes(varName);
    performCheck(
      hasVar,
      `Environment variable defined: ${varName}`,
      `Missing environment variable: ${varName}`
    );
  });
}
console.log('\n');

// Check 3: Required Folders
log('📁 Checking Required Folders...', 'blue');
checks.folders.required.forEach(folder => {
  const exists = fs.existsSync(path.join(__dirname, folder));
  performCheck(
    exists,
    `Folder found: ${folder}`,
    `Missing required folder: ${folder}`
  );
});
console.log('\n');

// Check 4: Package.json Scripts
log('📦 Checking Package.json Scripts...', 'blue');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  
  performCheck(
    packageJson.scripts?.dev,
    'Dev script found: npm run dev',
    'Missing dev script in package.json'
  );
  
  performCheck(
    packageJson.scripts?.build,
    'Build script found: npm run build',
    'Missing build script in package.json'
  );
  
  performCheck(
    packageJson.scripts?.preview,
    'Preview script found: npm run preview',
    'Missing preview script in package.json'
  );
} catch (error) {
  log(`${crossMark()} Failed to read package.json: ${error.message}`, 'red');
}
console.log('\n');

// Check 5: Critical Dependencies
log('🔧 Checking Critical Dependencies...', 'blue');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const criticalDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    'vite',
    '@vitejs/plugin-react',
    'tailwindcss',
    '@supabase/supabase-js',
    '@google/generative-ai',
  ];
  
  criticalDeps.forEach(dep => {
    performCheck(
      deps[dep],
      `Dependency installed: ${dep}`,
      `Missing critical dependency: ${dep}`
    );
  });
} catch (error) {
  log(`${crossMark()} Failed to check dependencies: ${error.message}`, 'red');
}
console.log('\n');

// Check 6: Git Setup
log('🌿 Checking Git Setup...', 'blue');
const gitExists = fs.existsSync(path.join(__dirname, '.git'));
performCheck(
  gitExists,
  'Git repository initialized',
  'Git not initialized (run: git init)',
  true // This is a warning, not a blocker
);

const gitignoreExists = fs.existsSync(path.join(__dirname, '.gitignore'));
if (gitignoreExists) {
  const gitignoreContent = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf-8');
  performCheck(
    gitignoreContent.includes('.env.local') || gitignoreContent.includes('.env'),
    '.gitignore includes .env files',
    '.env files not in .gitignore - SECURITY RISK!'
  );
  
  performCheck(
    gitignoreContent.includes('node_modules'),
    '.gitignore includes node_modules',
    'node_modules not in .gitignore'
  );
}
console.log('\n');

// Check 7: Vercel Configuration
log('⚡ Checking Vercel Configuration...', 'blue');
const vercelJsonExists = fs.existsSync(path.join(__dirname, 'vercel.json'));
performCheck(
  vercelJsonExists,
  'vercel.json exists (SPA routing configured)',
  'vercel.json missing (SPA routing may not work)'
);

if (vercelJsonExists) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf-8'));
    performCheck(
      vercelConfig.rewrites && vercelConfig.rewrites.length > 0,
      'SPA rewrites configured in vercel.json',
      'No rewrites found in vercel.json - SPA routing may fail',
      true
    );
  } catch (error) {
    log(`${warningMark()} Could not parse vercel.json: ${error.message}`, 'yellow');
    warnings++;
  }
}
console.log('\n');

// Check 8: Database Migrations
log('🗄️  Checking Database Migrations...', 'blue');
const migrationsPath = path.join(__dirname, 'supabase', 'migrations');
if (fs.existsSync(migrationsPath)) {
  const migrations = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));
  performCheck(
    migrations.length > 0,
    `Found ${migrations.length} migration file(s)`,
    'No migration files found in supabase/migrations'
  );
  
  // Check specific migrations
  const expectedMigrations = [
    '0001_init.sql',
    '0002_add_multi_class.sql',
    '0005_add_anxiety_details.sql',
    '0007_update_solutions_table.sql',
  ];
  
  expectedMigrations.forEach(migration => {
    const exists = migrations.includes(migration);
    performCheck(
      exists,
      `Migration exists: ${migration}`,
      `Migration missing: ${migration}`,
      true
    );
  });
} else {
  log(`${crossMark()} supabase/migrations folder not found`, 'red');
  totalChecks++;
}
console.log('\n');

// Check 9: Milo Assets
log('🎨 Checking Milo Character Assets...', 'blue');
const miloPath = path.join(__dirname, 'public', 'assets', 'milo');
if (fs.existsSync(miloPath)) {
  const miloAssets = ['milo-wave.png', 'milo-happy.png', 'milo-thinking.png', 'milo-explain.png'];
  miloAssets.forEach(asset => {
    const exists = fs.existsSync(path.join(miloPath, asset));
    performCheck(
      exists,
      `Milo asset found: ${asset}`,
      `Missing Milo asset: ${asset}`,
      true // This is a warning
    );
  });
} else {
  log(`${warningMark()} public/assets/milo folder not found (upload Milo images)`, 'yellow');
  totalChecks++;
  warnings++;
}
console.log('\n');

// Summary
log('═══════════════════════════════════════════════════════════', 'cyan');
log('📊 VERIFICATION SUMMARY', 'cyan');
log('═══════════════════════════════════════════════════════════', 'cyan');
console.log('\n');

const successRate = Math.round((passedChecks / totalChecks) * 100);

log(`Total Checks: ${totalChecks}`, 'blue');
log(`Passed: ${passedChecks} ${checkMark()}`, 'green');
log(`Failed: ${totalChecks - passedChecks} ${crossMark()}`, passedChecks === totalChecks ? 'green' : 'red');
log(`Warnings: ${warnings} ${warningMark()}`, warnings > 0 ? 'yellow' : 'green');
log(`Success Rate: ${successRate}%`, successRate === 100 ? 'green' : successRate >= 80 ? 'yellow' : 'red');

console.log('\n');

// Final Verdict
if (passedChecks === totalChecks && warnings === 0) {
  log('═══════════════════════════════════════════════════════════', 'green');
  log('🎉 READY TO DEPLOY!', 'green');
  log('═══════════════════════════════════════════════════════════', 'green');
  console.log('\n');
  log('Next steps:', 'cyan');
  log('1. Run: npm run build', 'blue');
  log('2. Run: npm run preview (test build locally)', 'blue');
  log('3. Follow deploy.md for deployment instructions', 'blue');
  console.log('\n');
} else if (passedChecks === totalChecks && warnings > 0) {
  log('═══════════════════════════════════════════════════════════', 'yellow');
  log('⚠️  READY WITH WARNINGS', 'yellow');
  log('═══════════════════════════════════════════════════════════', 'yellow');
  console.log('\n');
  log('The project is ready to deploy, but some optional items are missing.', 'yellow');
  log('Review the warnings above and fix if needed.', 'yellow');
  console.log('\n');
  log('Next steps:', 'cyan');
  log('1. Address warnings (optional)', 'blue');
  log('2. Run: npm run build', 'blue');
  log('3. Run: npm run preview', 'blue');
  log('4. Follow deploy.md for deployment instructions', 'blue');
  console.log('\n');
} else {
  log('═══════════════════════════════════════════════════════════', 'red');
  log('❌ NOT READY TO DEPLOY', 'red');
  log('═══════════════════════════════════════════════════════════', 'red');
  console.log('\n');
  log('Please fix the failed checks above before deploying.', 'red');
  log('Review PRE_DEPLOYMENT_CHECKLIST.md for detailed guidance.', 'yellow');
  console.log('\n');
}

// Exit with appropriate code
process.exit(passedChecks === totalChecks ? 0 : 1);
