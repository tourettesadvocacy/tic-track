# Contributing to Tic Track

Thank you for your interest in contributing to Tic Track! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions. We're building this app to help people manage Tourette's syndrome, so sensitivity and empathy are important.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tic-track.git
   cd tic-track
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes in your feature branch
2. Test your changes thoroughly (see TESTING.md)
3. Run TypeScript checks:
   ```bash
   npx tsc --noEmit
   ```
4. Commit your changes with clear messages:
   ```bash
   git commit -m "Add feature: description of what you did"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a Pull Request on GitHub

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows existing style and conventions
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] All new code has appropriate type annotations
- [ ] No console.log statements (use console.error for errors only)
- [ ] README.md updated if adding new features
- [ ] TESTING.md updated if adding testable features

### PR Description

Include in your PR description:
- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How does it work?
- **Testing**: How did you test it?
- **Screenshots**: If UI changes, include screenshots

Example:
```markdown
## What
Adds export to CSV feature for events

## Why
Users requested ability to export their event data for analysis

## How
- Added export button to EventViewer
- Implemented CSV generation from event data
- Added file download using expo-sharing

## Testing
- Tested with 0, 1, 10, and 100 events
- Verified CSV format opens in Excel
- Tested on iOS and Android

## Screenshots
[Add screenshots here]
```

## Code Style

### TypeScript

- **Use strict types**: No `any` types
- **Explicit return types**: Always specify function return types
- **Null safety**: Use `| null` for nullable values
- **Interfaces over types**: Prefer interfaces for object shapes

```typescript
// ✅ Good
export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString();
};

// ❌ Bad
export const formatDate = (isoString: any) => {
  return new Date(isoString).toLocaleDateString();
};
```

### React

- **Functional components**: Use hooks, not class components
- **Props interfaces**: Always type component props

```typescript
// ✅ Good
interface MyComponentProps {
  title: string;
  onPress: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  return <TouchableOpacity onPress={onPress}><Text>{title}</Text></TouchableOpacity>;
};

// ❌ Bad
export const MyComponent = (props) => {
  return <TouchableOpacity onPress={props.onPress}><Text>{props.title}</Text></TouchableOpacity>;
};
```

### Naming Conventions

- **Files**: 
  - Components: `PascalCase.tsx` (e.g., `EventLogger.tsx`)
  - Utilities: `camelCase.ts` (e.g., `datetime.ts`)
  - Services: `camelCase.ts` (e.g., `localStorage.ts`)
- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

### Comments

```typescript
// ✅ Good - explains why, not what
// Use exponential backoff to avoid overwhelming the server
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

// ❌ Bad - states the obvious
// Set delay variable
const delay = 1000;
```

## What to Contribute

### High Priority

- 🐛 Bug fixes
- 📱 Platform-specific improvements (iOS/Android/Web)
- ♿ Accessibility enhancements
- 🌍 Internationalization (i18n)
- 📊 Data visualization features
- 🔐 Security improvements

### Medium Priority

- ✨ New event types or fields
- 🎨 UI/UX improvements
- 📝 Documentation improvements
- 🧪 Tests (unit, integration, e2e)
- ⚡ Performance optimizations

### Ideas Welcome

- 🔔 Push notifications
- 📤 Export/import functionality
- 📈 Analytics dashboard
- 👥 Multi-user support
- 🏥 Health app integration

## Testing

All contributions should be tested. See TESTING.md for:
- Manual testing checklist
- How to test offline mode
- How to test cloud sync
- Edge cases to consider

## Documentation

When adding features, update:
- **README.md**: User-facing documentation
- **DEVELOPMENT.md**: Developer documentation
- **TESTING.md**: Testing procedures
- **Code comments**: Explain complex logic

## Commit Messages

Use clear, descriptive commit messages:

```bash
# ✅ Good
git commit -m "Add CSV export feature to EventViewer"
git commit -m "Fix duration calculation for events spanning midnight"
git commit -m "Update README with Azure setup instructions"

# ❌ Bad
git commit -m "fix bug"
git commit -m "update"
git commit -m "wip"
```

Format: `<type>: <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

## Issue Reports

When reporting issues, include:

1. **Description**: Clear description of the problem
2. **Steps to reproduce**: Exact steps to trigger the issue
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Environment**:
   - Device/OS (iOS 17, Android 13, etc.)
   - App version
   - Expo Go version or built app
6. **Screenshots**: If applicable
7. **Logs**: Console errors or warnings

## Feature Requests

When requesting features, include:

1. **Problem**: What problem does this solve?
2. **Proposed solution**: How would you solve it?
3. **Alternatives**: Other solutions you've considered
4. **Additional context**: Any other relevant information

## Questions?

- Check existing issues and pull requests
- Review DEVELOPMENT.md for technical details
- Review TESTING.md for testing procedures
- Open a discussion on GitHub

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Every contribution helps make Tic Track better for the Tourette's syndrome community. Thank you for your time and effort! 💙
