#!/usr/bin/env node

import { execSync } from 'child_process';
import readline from 'readline';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  interactive: args.includes('--interactive'),
  push: args.includes('--push'),
  verbose: args.includes('--verbose'),
};

// Helper to execute git commands
function git(command, silent = false) {
  try {
    const result = execSync(`git ${command}`, { encoding: 'utf8' });
    if (!silent) {
      return result.trim();
    }
    return result;
  } catch (error) {
    if (!silent) {
      console.error(`${colors.red}Git command failed: ${command}${colors.reset}`);
      console.error(error.message);
    }
    return null;
  }
}

// Get file changes with statistics
function getChangedFiles() {
  const status = git('status --porcelain');
  if (!status) return [];

  return status.split('\n').filter(line => line.trim()).map(line => {
    const [status, ...pathParts] = line.trim().split(/\s+/);
    const path = pathParts.join(' ');
    
    // Get change statistics for modified files
    let stats = null;
    if (status.includes('M')) {
      const diffStat = git(`diff --stat "${path}"`, true);
      if (diffStat) {
        const match = diffStat.match(/(\d+)\s+insertions.*?(\d+)\s+deletions/);
        if (match) {
          stats = { insertions: parseInt(match[1]), deletions: parseInt(match[2]) };
        }
      }
    }
    
    return { status, path, stats };
  });
}

// Categorize files into logical commit groups
function categorizeFiles(files) {
  const categories = {
    'Database & Seeds': {
      patterns: [/^prisma\//, /seed/, /migration/],
      files: [],
      message: 'refactor: update database schema and seed scripts',
    },
    'Authentication & Security': {
      patterns: [/auth/, /session/, /jwt/, /permission/, /role/],
      files: [],
      message: 'feat: enhance authentication and security',
    },
    'API Routes': {
      patterns: [/^src\/app\/api\//, /route\.(ts|js)$/],
      files: [],
      message: 'fix: update API routes and handlers',
    },
    'Middleware': {
      patterns: [/middleware/],
      files: [],
      message: 'fix: enhance middleware and request handling',
    },
    'UI Components': {
      patterns: [/components\//, /\.tsx$/, /\.jsx$/],
      files: [],
      message: 'fix: update UI components',
    },
    'Types & Interfaces': {
      patterns: [/types\//, /Types\.ts$/, /\.d\.ts$/],
      files: [],
      message: 'feat: update type definitions',
    },
    'Configuration': {
      patterns: [/^\.env/, /config/, /\.json$/, /\.toml$/, /\.yaml$/, /\.yml$/],
      files: [],
      message: 'chore: update configuration',
    },
    'Documentation': {
      patterns: [/\.md$/, /^docs\//, /README/],
      files: [],
      message: 'docs: update documentation',
    },
    'Tests': {
      patterns: [/test/, /spec/, /\.test\.(ts|js)$/, /\.spec\.(ts|js)$/],
      files: [],
      message: 'test: update test suites',
    },
    'Scripts & Tools': {
      patterns: [/^scripts\//, /\.sh$/, /check/, /fix/, /debug/, /bootstrap/],
      files: [],
      message: 'chore: add utility scripts',
    },
    'Styles': {
      patterns: [/\.css$/, /\.scss$/, /\.sass$/, /styles/],
      files: [],
      message: 'style: update styles',
    },
    'Cache & Local': {
      patterns: [/cache/, /\.local/, /tmp/],
      files: [],
      message: 'chore: update local files',
      skip: true, // These typically shouldn't be committed
    },
  };

  // Categorize each file
  files.forEach(file => {
    let categorized = false;
    
    for (const [category, config] of Object.entries(categories)) {
      if (config.patterns && Array.isArray(config.patterns)) {
        for (const pattern of config.patterns) {
          if (pattern.test(file.path)) {
            config.files.push(file);
            categorized = true;
            break;
          }
        }
        if (categorized) break;
      }
    }
    
    // If not categorized, add to misc
    if (!categorized) {
      if (!categories['Miscellaneous']) {
        categories['Miscellaneous'] = {
          files: [],
          message: 'chore: miscellaneous updates',
        };
      }
      categories['Miscellaneous'].files.push(file);
    }
  });

  // Remove empty categories
  return Object.entries(categories)
    .filter(([_, config]) => config.files.length > 0)
    .map(([name, config]) => ({ name, ...config }));
}

// Analyze file content for better commit messages
async function analyzeChanges(category) {
  if (!options.verbose || category.files.length === 0) {
    return category.message;
  }

  // For verbose mode, try to generate more specific commit messages
  const fileTypes = new Set();
  const operations = new Set();
  
  category.files.forEach(file => {
    // Determine operation type
    if (file.status === 'A' || file.status === '??') operations.add('add');
    else if (file.status === 'M') operations.add('update');
    else if (file.status === 'D') operations.add('remove');
    else if (file.status.includes('R')) operations.add('rename');
    
    // Extract file type
    const ext = file.path.split('.').pop();
    if (ext) fileTypes.add(ext);
  });

  // Build more specific message
  const operation = operations.size === 1 ? 
    Array.from(operations)[0] : 
    operations.has('update') ? 'update' : 'modify';
    
  return `${operation}: ${category.name.toLowerCase()} (${category.files.length} files)`;
}

// Create readline interface for interactive mode
const rl = options.interactive ? readline.createInterface({
  input: process.stdin,
  output: process.stdout
}) : null;

// Ask for user confirmation
function askConfirmation(question) {
  return new Promise((resolve) => {
    if (!options.interactive) {
      resolve(true);
      return;
    }
    
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Main execution
async function main() {
  console.log(`${colors.bright}${colors.blue}🎯 Smart Git Commit Analyzer${colors.reset}\n`);
  
  // Check if we're in a git repository
  const isGitRepo = git('rev-parse --git-dir', true);
  if (!isGitRepo) {
    console.error(`${colors.red}Error: Not in a git repository${colors.reset}`);
    process.exit(1);
  }
  
  // Get current branch
  const branch = git('rev-parse --abbrev-ref HEAD');
  console.log(`${colors.cyan}Current branch:${colors.reset} ${branch}`);
  
  // Get changed files
  const files = getChangedFiles();
  if (files.length === 0) {
    console.log(`${colors.green}✓ No changes to commit${colors.reset}`);
    process.exit(0);
  }
  
  console.log(`${colors.yellow}Found ${files.length} changed files${colors.reset}\n`);
  
  // Categorize files
  const categories = categorizeFiles(files);
  
  // Display commit plan
  console.log(`${colors.bright}📋 Commit Plan:${colors.reset}\n`);
  
  for (const category of categories) {
    if (category.skip) {
      console.log(`${colors.yellow}⚠️  ${category.name} (${category.files.length} files) - SKIPPING${colors.reset}`);
      category.files.forEach(file => {
        console.log(`   ${colors.yellow}${file.status}${colors.reset} ${file.path}`);
      });
      console.log();
      continue;
    }
    
    const message = await analyzeChanges(category);
    console.log(`${colors.green}✓ ${category.name}${colors.reset} (${category.files.length} files)`);
    console.log(`  ${colors.cyan}Message:${colors.reset} "${message}"`);
    
    if (options.verbose) {
      category.files.forEach(file => {
        let fileInfo = `   ${colors.magenta}${file.status}${colors.reset} ${file.path}`;
        if (file.stats) {
          fileInfo += ` ${colors.green}+${file.stats.insertions}${colors.reset}/${colors.red}-${file.stats.deletions}${colors.reset}`;
        }
        console.log(fileInfo);
      });
    }
    console.log();
  }
  
  // Execute commits if not dry-run
  if (!options.dryRun) {
    const proceed = await askConfirmation('\nProceed with commits?');
    if (!proceed) {
      console.log(`${colors.yellow}Aborted by user${colors.reset}`);
      process.exit(0);
    }
    
    console.log(`\n${colors.bright}🚀 Creating commits...${colors.reset}\n`);
    
    for (const category of categories) {
      if (category.skip) continue;
      
      const message = await analyzeChanges(category);
      const filePaths = category.files.map(f => `"${f.path}"`).join(' ');
      
      const commitThis = await askConfirmation(`Commit ${category.name}?`);
      if (!commitThis) {
        console.log(`${colors.yellow}Skipped: ${category.name}${colors.reset}`);
        continue;
      }
      
      // Stage files
      console.log(`${colors.cyan}Staging ${category.name}...${colors.reset}`);
      git(`add ${filePaths}`);
      
      // Create commit
      const commitResult = git(`commit -m "${message}"`);
      if (commitResult) {
        const shortHash = git('rev-parse --short HEAD');
        console.log(`${colors.green}✓ Committed:${colors.reset} [${shortHash}] ${message}\n`);
      }
    }
    
    // Push if requested
    if (options.push) {
      console.log(`${colors.cyan}Pushing to remote...${colors.reset}`);
      const pushResult = git(`push origin ${branch}`);
      if (pushResult !== null) {
        console.log(`${colors.green}✓ Pushed to origin/${branch}${colors.reset}`);
      }
    }
  }
  
  // Cleanup
  if (rl) rl.close();
  console.log(`\n${colors.green}${colors.bright}✨ Done!${colors.reset}`);
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  if (rl) rl.close();
  process.exit(1);
});