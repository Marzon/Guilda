#!/usr/bin/env npx ts-node
/**
 * Script to detect hardcoded URLs that might be incorrect
 * 
 * Usage: npx ts-node scripts/check-hardcoded-urls.ts
 * 
 * This script scans the codebase for hardcoded guilda.app.br URLs
 * and validates them against the defined routes in src/lib/routes.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Define valid routes (mirrors src/lib/routes.ts)
const VALID_ROUTES = new Set([
  '/',
  '/auth',
  '/tavern',
  '/profile',
  '/settings',
  '/messages',
  '/create-project',
  '/create-project/advanced',
  '/projects',
  '/pricing',
  '/conexoes',
  '/quem-viu',
  '/faq',
  '/minhas-candidaturas',
  '/blog',
  '/vagas',
  '/install',
  '/notifications',
  '/admin',
  '/terms',
  '/privacy',
  '/success-stories',
  '/onboarding',
  '/discover',
  '/builders',
  '/sellers',
  '/capital',
  '/investors',
  '/payment-history',
  '/success',
  '/success-confirm',
  // Dynamic routes (patterns)
]);

// Dynamic route patterns
const DYNAMIC_ROUTE_PATTERNS = [
  /^\/projeto\/[a-f0-9-]+$/,           // /projeto/:id
  /^\/u\/[a-zA-Z0-9_-]+$/,             // /u/:username
  /^\/blog\/[a-zA-Z0-9_-]+$/,          // /blog/:slug
  /^\/ferramentas-empreendedores\/.+/, // /ferramentas-empreendedores/*
];

// Known deprecated/incorrect routes
const DEPRECATED_ROUTES = new Map([
  ['/projects/new', '/create-project'],
  ['/projects/', '/projeto/'],  // projects/:id should be projeto/:id
]);

interface UrlFinding {
  file: string;
  line: number;
  url: string;
  path: string;
  issue: 'deprecated' | 'unknown' | 'ok';
  suggestion?: string;
}

function extractUrlsFromContent(content: string, filePath: string): UrlFinding[] {
  const findings: UrlFinding[] = [];
  const lines = content.split('\n');
  
  // Regex to find guilda.app.br URLs
  const urlRegex = /https?:\/\/guilda\.app\.br(\/[^\s"'`<>)}\]]*)?/g;
  
  lines.forEach((line, index) => {
    let match;
    while ((match = urlRegex.exec(line)) !== null) {
      const fullUrl = match[0];
      const urlPath = match[1] || '/';
      
      // Check if it's a deprecated route
      let issue: 'deprecated' | 'unknown' | 'ok' = 'ok';
      let suggestion: string | undefined;
      
      for (const [deprecated, replacement] of DEPRECATED_ROUTES) {
        if (urlPath.startsWith(deprecated)) {
          issue = 'deprecated';
          suggestion = urlPath.replace(deprecated, replacement);
          break;
        }
      }
      
      // If not deprecated, check if it's a valid route
      if (issue === 'ok') {
        const isValidStatic = VALID_ROUTES.has(urlPath);
        const isValidDynamic = DYNAMIC_ROUTE_PATTERNS.some(pattern => pattern.test(urlPath));
        
        if (!isValidStatic && !isValidDynamic) {
          issue = 'unknown';
        }
      }
      
      findings.push({
        file: filePath,
        line: index + 1,
        url: fullUrl,
        path: urlPath,
        issue,
        suggestion,
      });
    }
  });
  
  return findings;
}

function scanDirectory(dir: string, extensions: string[]): UrlFinding[] {
  const findings: UrlFinding[] = [];
  
  const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!ignoreDirs.includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          findings.push(...extractUrlsFromContent(content, fullPath));
        }
      }
    }
  }
  
  walk(dir);
  return findings;
}

function main() {
  console.log('🔍 Scanning for hardcoded guilda.app.br URLs...\n');
  
  const projectRoot = path.resolve(__dirname, '..');
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'];
  
  const findings = scanDirectory(projectRoot, extensions);
  
  // Separate by issue type
  const deprecated = findings.filter(f => f.issue === 'deprecated');
  const unknown = findings.filter(f => f.issue === 'unknown');
  const ok = findings.filter(f => f.issue === 'ok');
  
  // Report deprecated routes
  if (deprecated.length > 0) {
    console.log('❌ DEPRECATED ROUTES FOUND:\n');
    deprecated.forEach(f => {
      console.log(`  📄 ${f.file}:${f.line}`);
      console.log(`     URL: ${f.url}`);
      console.log(`     ⚠️  Should be: ${f.suggestion}`);
      console.log('');
    });
  }
  
  // Report unknown routes
  if (unknown.length > 0) {
    console.log('⚠️  UNKNOWN ROUTES (might be incorrect):\n');
    unknown.forEach(f => {
      console.log(`  📄 ${f.file}:${f.line}`);
      console.log(`     URL: ${f.url}`);
      console.log(`     Path: ${f.path}`);
      console.log('');
    });
  }
  
  // Summary
  console.log('━'.repeat(50));
  console.log('\n📊 SUMMARY:');
  console.log(`   ✅ Valid URLs: ${ok.length}`);
  console.log(`   ❌ Deprecated: ${deprecated.length}`);
  console.log(`   ⚠️  Unknown: ${unknown.length}`);
  console.log(`   📝 Total: ${findings.length}`);
  
  if (deprecated.length > 0) {
    console.log('\n💡 Run the following to fix deprecated URLs:');
    console.log('   1. Update /projects/new to /create-project');
    console.log('   2. Update /projects/:id to /projeto/:id');
  }
  
  // Exit with error if deprecated routes found
  if (deprecated.length > 0) {
    process.exit(1);
  }
  
  console.log('\n✨ Done!');
}

main();
