const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
require('dotenv').config({ path: '.env.local' });

// Check command line arguments
const args = process.argv.slice(2);
const envOnlyCheck = args.includes('--env-only');
const debug = args.includes('--debug');

// Check if running from the correct directory
if (!fs.existsSync('package.json')) {
  console.error(chalk.red('❌ Must run from project root directory'));
  process.exit(1);
}

let hasErrors = false;

// Run TypeScript type checking
function runTypeCheck() {
  try {
    console.log(chalk.blue('Running type check...'));
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
    console.log(chalk.green('✅ Type check passed'));
  } catch (error) {
    console.error(chalk.red('❌ Type check failed'));
    process.exit(1);
  }
}

// 1. Check for 'use client' directives in auth-related files
function checkClientDirective() {
  const authPaths = [
    'src/components/auth',
    'src/lib/firebase',
    'src/context'
  ];

  authPaths.forEach(dirPath => {
    if (fs.existsSync(dirPath)) {
      if (fs.statSync(dirPath).isDirectory()) {
        // If it's a directory, read all .ts and .tsx files in it
        const files = fs.readdirSync(dirPath).filter(file => 
          file.endsWith('.ts') || file.endsWith('.tsx')
        );
        
        files.forEach(file => {
          const fullPath = path.join(dirPath, file);
          const content = fs.readFileSync(fullPath, 'utf8');
          if (!content.includes('use client')) {
            console.error(chalk.red(`❌ Missing 'use client' directive in ${fullPath}`));
            hasErrors = true;
          }
        });
      } else {
        // If it's a file, read it directly
        const content = fs.readFileSync(dirPath, 'utf8');
        if (!content.includes('use client')) {
          console.error(chalk.red(`❌ Missing 'use client' directive in ${dirPath}`));
          hasErrors = true;
        }
      }
    }
  });
}

// 2. Check Firebase initialization pattern
function checkFirebaseInit() {
  const configPath = 'src/lib/firebase/config.ts';
  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf8');
    if (!content.includes('getApps().length')) {
      console.error(chalk.red('❌ Firebase initialization not using singleton pattern'));
      hasErrors = true;
    }
  }
}

// Enhanced environment variable check
function checkEnvVariables() {
  console.log(chalk.blue('🔍 Checking environment variables...'));
  
  // First check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    console.error(chalk.red('❌ Missing .env.local file'));
    console.log(chalk.yellow('Please create .env.local with the following variables:'));
    console.log(`
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
    `);
    process.exit(1);
  }

  // Load environment variables
  const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
  
  // Merge with process.env
  Object.entries(envConfig).forEach(([key, value]) => {
    process.env[key] = value;
  });

  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missingVars = [];
  const emptyVars = [];
  const invalidVars = [];

  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (!value) {
      missingVars.push(envVar);
      if (debug) {
        console.log(`\nMissing ${envVar}:`);
        console.log('Value in process.env:', process.env[envVar]);
        console.log('Value in envConfig:', envConfig[envVar]);
      }
    } else if (value.trim() === '') {
      emptyVars.push(envVar);
    } else {
      // Validate specific formats
      switch (envVar) {
        case 'NEXT_PUBLIC_FIREBASE_API_KEY':
          if (!value.startsWith('AIza')) {
            invalidVars.push(`${envVar} (must start with 'AIza')`);
          }
          break;
        case 'NEXT_PUBLIC_FIREBASE_PROJECT_ID':
          if (!/^[a-z0-9-]+$/.test(value)) {
            invalidVars.push(`${envVar} (must contain only lowercase letters, numbers, and hyphens)`);
          }
          break;
        case 'NEXT_PUBLIC_FIREBASE_APP_ID':
          if (!/^\d:\d+:web:[a-f0-9]+$/.test(value)) {
            invalidVars.push(`${envVar} (invalid format)`);
          }
          break;
      }
    }
  });

  if (missingVars.length > 0 || emptyVars.length > 0 || invalidVars.length > 0) {
    console.error(chalk.red('\n❌ Environment variable errors:'));
    
    if (missingVars.length > 0) {
      console.error(chalk.red('\nMissing variables:'));
      missingVars.forEach(variable => console.error(chalk.red(`  - ${variable}`)));
    }
    
    if (emptyVars.length > 0) {
      console.error(chalk.red('\nEmpty variables:'));
      emptyVars.forEach(variable => console.error(chalk.red(`  - ${variable}`)));
    }
    
    if (invalidVars.length > 0) {
      console.error(chalk.red('\nInvalid variables:'));
      invalidVars.forEach(variable => console.error(chalk.red(`  - ${variable}`)));
    }

    console.error(chalk.yellow('\nPlease fix these issues in your .env.local file'));
    process.exit(1);
  }

  // Create a new .env.local with normalized values
  const normalizedEnv = requiredEnvVars
    .map(key => `${key}=${process.env[key]}`)
    .join('\n');
  
  fs.writeFileSync('.env.local', normalizedEnv + '\n');

  // Verify the values are actually set
  const missingAfterWrite = requiredEnvVars.filter(key => !process.env[key]);
  if (missingAfterWrite.length > 0) {
    console.error(chalk.red('\n❌ Failed to set environment variables:'));
    missingAfterWrite.forEach(variable => console.error(chalk.red(`  - ${variable}`)));
    process.exit(1);
  }

  console.log(chalk.green('✅ Environment variables verified'));
}

// 4. Check import patterns
function checkImports() {
  const files = getAllFiles('src');
  const importErrors = [];

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for default imports of auth functions
    if (content.includes('import signIn from')) {
      importErrors.push(`${file}: Using default import for auth functions`);
    }
    
    // Check for incorrect auth context imports
    if (content.includes('from \'@/lib/auth-context\'')) {
      importErrors.push(`${file}: Incorrect auth context import path`);
    }

    // React Import Checks
    if (content.includes('import React from \'react\'')) {
      importErrors.push(`${file}: Unnecessary default React import in Next.js 13+`);
    }

    // Component Export Checks
    const hasDefaultExport = content.includes('export default');
    const hasNamedExports = content.match(/export\s+(?:const|function|class|interface|type)\s+\w+/g);
    
    if (file.includes('/components/') || file.includes('/pages/') || file.includes('/app/')) {
      // Page components should use default exports
      if (file.includes('page.tsx') && !hasDefaultExport) {
        importErrors.push(`${file}: Page component must use default export`);
      }
      
      // Layout components should use default exports
      if (file.includes('layout.tsx') && !hasDefaultExport) {
        importErrors.push(`${file}: Layout component must use default export`);
      }

      // Components should be named exports unless they're pages/layouts
      if (!file.includes('page.tsx') && !file.includes('layout.tsx') && hasDefaultExport) {
        importErrors.push(`${file}: Regular components should use named exports`);
      }
    }

    // Hook Export Checks
    if (file.includes('/hooks/')) {
      if (hasDefaultExport) {
        importErrors.push(`${file}: Hooks must use named exports`);
      }
      
      // Check hook naming convention
      const hookExports = content.match(/export\s+(?:const|function)\s+(\w+)/g);
      if (hookExports) {
        hookExports.forEach(hook => {
          if (!hook.includes('use')) {
            importErrors.push(`${file}: Hook must start with 'use' prefix`);
          }
        });
      }
    }

    // Context Export Checks
    if (file.includes('/context/')) {
      const contextExports = content.match(/export\s+const\s+(\w+)Context/g);
      if (contextExports) {
        contextExports.forEach(contextExport => {
          if (!content.includes(`use${contextExport.split('Context')[0].split('const ')[1]}`)) {
            importErrors.push(`${file}: Context must have accompanying hook`);
          }
        });
      }
    }

    // Utility Function Export Checks
    if (file.includes('/utils/') || file.includes('/lib/')) {
      if (hasDefaultExport) {
        importErrors.push(`${file}: Utility functions must use named exports`);
      }
    }

    // Firebase-specific checks
    if (content.includes('from \'firebase/auth\'') || 
        content.includes('from \'firebase/firestore\'') ||
        content.includes('from \'firebase/storage\'')) {
      
      // Ensure firebase imports are only in client components
      if (!content.includes('\'use client\'')) {
        importErrors.push(`${file}: Firebase SDK imports must be in client components ('use client' directive required)`);
      }

      // Check for direct firebase imports in pages/layouts
      if (file.includes('page.tsx') || file.includes('layout.tsx')) {
        importErrors.push(`${file}: Firebase SDK cannot be imported directly in pages/layouts. Use a client component or hook instead.`);
      }
    }

    // Server Component Safety
    if (!content.includes('\'use client\'')) {
      // Check for useState/useEffect in potential server components
      if (content.includes('useState') || content.includes('useEffect')) {
        importErrors.push(`${file}: React hooks found in server component. Add 'use client' directive or move hooks to client component`);
      }
      
      // Check for browser APIs in potential server components
      const browserAPIs = [
        'window.',
        'document.',
        'localStorage.',
        'sessionStorage.',
        'navigator.',
        'location.',
        'history.'
      ];
      
      if (browserAPIs.some(api => content.includes(api))) {
        importErrors.push(`${file}: Browser APIs found in server component. Add 'use client' directive or move to client component`);
      }
    }

    // Auth Context Usage
    if (content.includes('useAuth')) {
      if (!content.includes('\'use client\'')) {
        importErrors.push(`${file}: useAuth hook must be used in client components only`);
      }
    }
  });

  if (importErrors.length > 0) {
    console.error(chalk.red('❌ Import/Export pattern errors:'));
    importErrors.forEach(error => console.error(chalk.red(`  - ${error}`)));
    hasErrors = true;
  }
}

// 5. Check dependency versions
function checkDependencies() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = packageJson.dependencies || {};

  // Check for conflicting versions
  if (deps['date-fns'] && !deps['date-fns'].startsWith('^2.')) {
    console.error(chalk.red('❌ Incorrect date-fns version. Must use ^2.x.x'));
    hasErrors = true;
  }

  if (!deps['tailwindcss-animate']) {
    console.error(chalk.red('❌ Missing tailwindcss-animate dependency'));
    hasErrors = true;
  }
}

// Helper function to get all files recursively
function getAllFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getAllFiles(fullPath));
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  });

  return files;
}

// Run checks based on mode
if (envOnlyCheck) {
  console.log(chalk.blue('🔍 Running environment variable verification...'));
  checkEnvVariables();
  console.log(chalk.green('\n✅ Environment check passed!'));
} else {
  console.log(chalk.blue('🔍 Running full verification...'));
  
  // Always check environment variables first
  checkEnvVariables();

  // Run type check
  runTypeCheck();

  // Only continue with other checks if previous checks pass
  if (!hasErrors) {
    checkClientDirective();
    checkFirebaseInit();
    checkImports();
    checkDependencies();
  }

  if (hasErrors) {
    console.error(chalk.red('\n❌ Verification failed. Please fix the above errors before proceeding.'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ Verification passed!'));
  }
} 