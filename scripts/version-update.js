#!/usr/bin/env node

/**
 * Version Update Script
 * 
 * This script helps update the version number and changelog
 * Usage: node scripts/version-update.js [patch|minor|major] [description]
 * 
 * Example: node scripts/version-update.js patch "Fixed dialog import error"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');

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
      
      const newEntry = `## [${newVersion}] - ${today}

### ${type.charAt(0).toUpperCase() + type.slice(1)}
- **${description}**: ${description}

### Technical
- Version bump for ${type} release

`;
      
      const updatedChangelog = changelog.replace('# Changelog', `# Changelog\n\n${newEntry}`);
      fs.writeFileSync(changelogPath, updatedChangelog);
      
      console.log(`✅ Updated CHANGELOG.md with new entry`);
    }
    
    console.log(`\n🎉 Version ${newVersion} is ready!`);
    console.log(`📝 Don't forget to commit your changes:`);
    console.log(`   git add . && git commit -m "chore: bump version to ${newVersion}"`);
    
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

updateVersion(type, description); 