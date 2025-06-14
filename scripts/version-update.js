#!/usr/bin/env node

/**
 * Enhanced Version Update Script
 * 
 * This script helps update the version number and changelog with proper formatting
 * Usage: node scripts/version-update.js [patch|minor|major] [description] [--type=feature|fix|breaking|docs|style|refactor|test|chore]
 * 
 * Examples: 
 *   node scripts/version-update.js patch "Fixed dialog import error" --type=fix
 *   node scripts/version-update.js minor "Added new Shopify integration" --type=feature
 *   node scripts/version-update.js major "Breaking changes to API" --type=breaking
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');

// Change type emojis and descriptions
const CHANGE_TYPES = {
  feature: { emoji: '✨', label: 'Added' },
  fix: { emoji: '🐛', label: 'Fixed' },
  breaking: { emoji: '💥', label: 'Breaking Changes' },
  docs: { emoji: '📚', label: 'Documentation' },
  style: { emoji: '💄', label: 'Styling' },
  refactor: { emoji: '♻️', label: 'Refactored' },
  test: { emoji: '🧪', label: 'Tests' },
  chore: { emoji: '🔧', label: 'Chores' },
  perf: { emoji: '⚡', label: 'Performance' },
  security: { emoji: '🔒', label: 'Security' }
};

function getChangeType() {
  const typeArg = process.argv.find(arg => arg.startsWith('--type='));
  if (typeArg) {
    const type = typeArg.split('=')[1];
    if (CHANGE_TYPES[type]) {
      return type;
    }
  }
  return 'chore'; // default
}

function updateVersion(type, description) {
  try {
    // Read current package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;
    
    // Parse current version
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    // Calculate new version
    let newVersion;
    switch (type) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }
    
    // Update package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`✅ Updated version from ${currentVersion} to ${newVersion}`);
    
    // Update changelog
    if (fs.existsSync(changelogPath)) {
      const changelog = fs.readFileSync(changelogPath, 'utf8');
      const today = new Date().toISOString().split('T')[0];
      const changeType = getChangeType();
      const { emoji, label } = CHANGE_TYPES[changeType];
      
      const newEntry = `## [${newVersion}] - ${today}

### ${label} ${emoji}
- **${description}**

### Technical
- Version bump for ${type} release
- Automated changelog update

`;
      
      const updatedChangelog = changelog.replace('# Changelog', `# Changelog\n\n${newEntry}`);
      fs.writeFileSync(changelogPath, updatedChangelog);
      
      console.log(`✅ Updated CHANGELOG.md with new entry (${changeType})`);
    }
    
    console.log(`\n🎉 Version ${newVersion} is ready!`);
    console.log(`📝 Next steps:`);
    console.log(`   1. Review the changes:`);
    console.log(`      git diff`);
    console.log(`   2. Stage and commit:`);
    console.log(`      git add . && git commit -m "chore: bump version to ${newVersion} - ${description}"`);
    console.log(`   3. Tag the release:`);
    console.log(`      git tag v${newVersion}`);
    console.log(`   4. Push changes:`);
    console.log(`      git push && git push --tags`);
    
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const type = process.argv[2] || 'patch';
const description = process.argv[3] || 'General improvements and bug fixes';

if (!['patch', 'minor', 'major'].includes(type)) {
  console.error('❌ Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

if (!description || description.trim() === '') {
  console.error('❌ Description is required');
  console.error('Usage: node scripts/version-update.js [patch|minor|major] "Description" [--type=feature|fix|breaking|docs|style|refactor|test|chore]');
  process.exit(1);
}

console.log(`🚀 Starting version update...`);
console.log(`📋 Type: ${type}`);
console.log(`📝 Description: ${description}`);
console.log(`🏷️  Change Type: ${getChangeType()}\n`);

updateVersion(type, description); 