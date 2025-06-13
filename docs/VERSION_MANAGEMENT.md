# Version Management Guide

## Overview

This document outlines the version management workflow for the Delivery Scheduler project. All changes must follow this process to maintain proper version history and changelog documentation.

## Current Version: v1.0.13

## Version Update Workflow

### 1. **Before Making Changes**
- Check current version in `package.json`
- Review recent changes in `CHANGELOG.md`
- Create a feature branch if working on a new feature

### 2. **Making Changes**
- Make your code changes
- Test thoroughly
- Ensure all TypeScript/ESLint errors are resolved

### 3. **Version Update Process**

#### **Option A: Using the Automated Script (Recommended)**
```bash
# For bug fixes and minor improvements
node scripts/version-update.js patch "Description of the fix"

# For new features
node scripts/version-update.js minor "Description of the new feature"

# For breaking changes
node scripts/version-update.js major "Description of the breaking change"
```

#### **Option B: Manual Update**
1. Update version in `package.json`
2. Add entry to `CHANGELOG.md` following the format:
   ```markdown
   ## [X.Y.Z] - YYYY-MM-DD
   
   ### Added
   - New features
   
   ### Changed
   - Changes to existing functionality
   
   ### Fixed
   - Bug fixes
   
   ### Removed
   - Removed features
   ```

### 4. **Commit and Push**
```bash
git add .
git commit -m "type: description of changes"
git push
```

## Version Numbering Rules

### Semantic Versioning (SemVer)
- **MAJOR (X.0.0)**: Breaking changes, incompatible API changes
- **MINOR (0.X.0)**: New features, backward compatible
- **PATCH (0.0.X)**: Bug fixes, backward compatible

### Examples
- `1.0.13` → `1.0.14` (patch: bug fix)
- `1.0.13` → `1.1.0` (minor: new feature)
- `1.0.13` → `2.0.0` (major: breaking change)

## Changelog Format

Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format:

```markdown
## [1.0.13] - 2025-06-13

### Fixed
- **DialogFooter Import Error**: Added missing `DialogFooter` import to fix undefined component error
- **Timeslot Property Error**: Fixed incorrect `slot.time` references to use `slot.name` property
- **Date Handling in Bulk Dates**: Fixed `getValidBulkDates()` function to return Date objects instead of strings
- **Syntax Error**: Resolved unterminated template literal error in AvailabilityCalendar component

### Technical
- Improved TypeScript type safety for date handling
- Enhanced error handling for date parsing
```

## Commit Message Format

Use conventional commit format:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks, version updates

## Automated Tools

### Version Update Script
```bash
# Location: scripts/version-update.js
# Usage: node scripts/version-update.js [patch|minor|major] [description]
```

### NPM Scripts
```bash
npm run version:patch  # Bump patch version
npm run version:minor  # Bump minor version
npm run version:major  # Bump major version
```

## Quality Assurance

### Before Version Update
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code is properly formatted
- [ ] Documentation is updated

### After Version Update
- [ ] Version number is updated in `package.json`
- [ ] Changelog entry is added
- [ ] Changes are committed with proper message
- [ ] Changes are pushed to GitHub
- [ ] Application runs without errors

## Emergency Fixes

For critical production issues:
1. Create hotfix branch
2. Make minimal required changes
3. Update version with patch increment
4. Test thoroughly
5. Merge to main and deploy immediately
6. Document in changelog

## Release Process

### Pre-release Checklist
- [ ] All features are complete
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Changelog is current
- [ ] Version is bumped appropriately

### Release Steps
1. Update version to release version
2. Update changelog with release date
3. Create git tag: `git tag v1.0.13`
4. Push tag: `git push origin v1.0.13`
5. Create GitHub release with changelog notes

## Monitoring and Maintenance

### Regular Tasks
- Review changelog for accuracy
- Clean up old branches
- Update dependencies
- Review version history

### Tools and Resources
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Remember**: Every change, no matter how small, should result in a version update and changelog entry. This ensures proper tracking and documentation of all project evolution. 