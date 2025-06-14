# Version Management Workflow

This document outlines the standardized workflow for version management and changelog updates in the Delivery Scheduler project.

## 🎯 Overview

Every change to the codebase should be accompanied by a version bump and changelog update. This ensures:
- Clear tracking of all changes
- Proper semantic versioning
- Automated deployment triggers
- Professional release documentation

## 📋 Version Types

### Semantic Versioning (SemVer)
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, incompatible API changes
- **MINOR** (1.1.0 → 1.2.0): New features, backward compatible
- **PATCH** (1.1.1 → 1.1.2): Bug fixes, backward compatible

### Change Categories
- **✨ Feature** (`--type=feature`): New functionality
- **🐛 Fix** (`--type=fix`): Bug fixes
- **💥 Breaking** (`--type=breaking`): Breaking changes
- **📚 Docs** (`--type=docs`): Documentation updates
- **💄 Style** (`--type=style`): UI/UX improvements
- **♻️ Refactor** (`--type=refactor`): Code restructuring
- **🧪 Test** (`--type=test`): Test additions/updates
- **🔧 Chore** (`--type=chore`): Maintenance tasks
- **⚡ Performance** (`--type=perf`): Performance improvements
- **🔒 Security** (`--type=security`): Security updates

## 🚀 Quick Commands

### For Bug Fixes
```bash
pnpm version:fix "Fixed dialog import error"
```

### For New Features
```bash
pnpm version:feature "Added Shopify webhook integration"
```

### For Breaking Changes
```bash
pnpm version:breaking "Updated API authentication method"
```

### For Documentation
```bash
pnpm version:docs "Updated deployment guide"
```

## 📝 Detailed Workflow

### 1. Before Making Changes
```bash
# Ensure you're on the latest version
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes
- Write your code
- Test thoroughly
- Update documentation if needed

### 3. Version Update (Choose One)

#### Option A: Quick Commands
```bash
# For bug fixes
pnpm version:fix "Description of the fix"

# For new features
pnpm version:feature "Description of the feature"

# For breaking changes
pnpm version:breaking "Description of breaking changes"
```

#### Option B: Manual Commands
```bash
# Patch version (bug fixes)
node scripts/version-update.js patch "Fixed dialog import error" --type=fix

# Minor version (new features)
node scripts/version-update.js minor "Added Shopify integration" --type=feature

# Major version (breaking changes)
node scripts/version-update.js major "Updated API structure" --type=breaking
```

### 4. Review Changes
```bash
# Check what files were modified
git status

# Review the changes
git diff

# Check the changelog
cat CHANGELOG.md
```

### 5. Commit and Push
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: add Shopify webhook integration

- Added webhook registration functionality
- Implemented HMAC signature verification
- Added user-friendly webhook management UI
- Version bump to 1.3.0"

# Push to remote
git push origin feature/your-feature-name
```

### 6. Create Pull Request
- Go to GitHub/GitLab
- Create a pull request
- Include version number in PR title: `[v1.3.0] Add Shopify webhook integration`
- Add changelog entry to PR description

### 7. Merge and Deploy
```bash
# After PR is merged, switch to main
git checkout main
git pull origin main

# Create and push git tag
git tag v$(node -p "require('./package.json').version")
git push --tags

# Deploy (if automated deployment is set up)
pnpm deploy:all
```

## 🔄 Automated Release Commands

For quick releases with automatic git operations:

```bash
# Patch release (bug fixes)
pnpm release:patch

# Minor release (new features)
pnpm release:minor

# Major release (breaking changes)
pnpm release:major
```

## 📊 Changelog Format

The changelog follows the [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.3.0] - 2025-01-15

### Added ✨
- **Shopify Webhook Integration**: Added comprehensive webhook management system
- **HMAC Signature Verification**: Implemented secure webhook validation
- **User-Friendly Settings**: Added intuitive webhook configuration UI

### Fixed 🐛
- **Dialog Import Error**: Resolved undefined DialogFooter component issue
- **API Authentication**: Fixed token validation in Shopify API calls

### Technical 🔧
- Version bump for minor release
- Automated changelog update
- Enhanced error handling for webhook processing
```

## 🎯 Best Practices

### Commit Messages
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(shopify): add webhook integration`
- `fix(ui): resolve dialog import error`
- `docs(deployment): update railway setup guide`

### Version Descriptions
- Be specific and descriptive
- Use present tense ("Adds" not "Added")
- Include the main benefit or fix
- Keep under 100 characters for the main description

### When to Version
- **Always** after completing a feature
- **Always** after fixing a bug
- **Always** after updating documentation
- **Always** before deploying to production

## 🚨 Important Notes

1. **Never skip version updates** - Every change should be versioned
2. **Use descriptive messages** - Future you will thank you
3. **Test before versioning** - Ensure changes work as expected
4. **Update documentation** - Keep guides and README current
5. **Tag releases** - Always create git tags for releases

## 🔧 Troubleshooting

### Version Script Issues
```bash
# Check script permissions
chmod +x scripts/version-update.js

# Run with explicit node
node scripts/version-update.js patch "Test fix" --type=fix
```

### Git Tag Issues
```bash
# List existing tags
git tag

# Delete local tag if needed
git tag -d v1.2.1

# Force push tag deletion
git push origin :refs/tags/v1.2.1
```

### Changelog Issues
```bash
# Manually edit changelog if needed
nano CHANGELOG.md

# Check changelog format
node -e "console.log(require('fs').readFileSync('CHANGELOG.md', 'utf8'))"
```

## 📞 Support

If you encounter issues with version management:
1. Check this guide first
2. Review the `scripts/version-update.js` file
3. Check recent commits for examples
4. Ask the team for guidance

---

**Remember**: Consistent versioning is key to maintaining a professional and reliable project! 🎉 