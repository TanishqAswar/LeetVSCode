# Contributing to LeetVSCode

First off, thank you for considering contributing to LeetVSCode! 🎉

This document provides guidelines and instructions for contributing to the project. By participating in this project, you agree to abide by its terms.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Setup](#development-setup)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Issue Guidelines](#issue-guidelines)
9. [Testing](#testing)
10. [Documentation](#documentation)

## Code of Conduct

This project follows a Code of Conduct that we expect all contributors to adhere to. Please read it before contributing.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Git**
- **Chrome/Edge/Brave** browser for testing

### Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/LeetVSCode.git
   cd LeetVSCode
   ```

3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/TanishqAswar/LeetVSCode.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Start development**:
   ```bash
   npm run dev
   ```

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Suggest new features or improvements
- 📝 **Documentation**: Improve or add documentation
- 🔧 **Code Contributions**: Fix bugs or implement new features
- 🎨 **UI/UX Improvements**: Enhance the user interface
- 🌐 **Translations**: Add support for new languages
- 📊 **Testing**: Add or improve test coverage

### What We're Looking For

Priority areas for contributions:

1. **Platform Support**: Adding support for new competitive programming platforms
2. **Language Support**: Adding support for new programming languages
3. **Performance**: Optimizing code generation and extraction
4. **UI/UX**: Improving the extension's user interface
5. **Documentation**: Expanding guides and tutorials
6. **Testing**: Adding comprehensive test coverage

## Development Setup

### Project Structure

```
LeetVSCode/
├── src/
│   ├── background/          # Background scripts
│   ├── content/            # Content scripts
│   ├── popup/              # Extension popup
│   ├── options/            # Options page
│   └── utils/              # Utility functions
├── public/
│   ├── icons/              # Extension icons
│   └── manifest.json       # Extension manifest
├── docs/                   # Documentation
├── tests/                  # Test files
├── scripts/                # Build scripts
├── package.json
└── README.md
```

### Available Scripts

```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check

# Package extension for distribution
npm run package
```

### Loading the Extension for Development

1. Run `npm run dev` to start the development build
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder
5. The extension will reload automatically as you make changes

## Coding Standards

### JavaScript/TypeScript

- Use **ES6+** features
- Follow **ESLint** configuration
- Use **TypeScript** for type safety
- Use **Prettier** for code formatting

### Code Style

```javascript
// Good
const generateCode = async (problemData) => {
  const { language, template } = problemData;
  
  if (!language || !template) {
    throw new Error('Missing required parameters');
  }
  
  return await processTemplate(template, language);
};

// Bad
function generateCode(problemData) {
  var language = problemData.language;
  var template = problemData.template;
  if (!language || !template) {
    throw new Error('Missing required parameters');
  }
  return processTemplate(template, language);
}
```

### CSS/Styling

- Use **CSS variables** for theming
- Follow **BEM** methodology for class naming
- Use **Flexbox** or **Grid** for layouts
- Ensure **responsive design**

### File Naming

- Use **kebab-case** for files and directories
- Use **PascalCase** for components
- Use **camelCase** for variables and functions

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Good commit messages
feat(popup): add dark mode toggle
fix(content): resolve issue with code extraction
docs(readme): update installation instructions
style(popup): improve button styling
refactor(utils): optimize template processing
test(extraction): add unit tests for function extraction
chore(deps): update dependencies

# Bad commit messages
fix bug
update code
changes
```

## Pull Request Process

### Before Submitting

1. **Update your fork**:
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and test thoroughly

4. **Run tests and linting**:
   ```bash
   npm test
   npm run lint
   ```

5. **Commit your changes** following the commit guidelines

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Template

When creating a pull request, use this template:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] All existing tests pass
- [ ] New tests added (if applicable)
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented where necessary
- [ ] Documentation updated (if needed)
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** must pass (CI/CD, tests, linting)
2. **At least one maintainer** must approve
3. **All conversations** must be resolved
4. **No conflicts** with the main branch

## Issue Guidelines

### Bug Reports

Use the bug report template and include:

- **Clear description** of the bug
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Environment details** (browser, OS, extension version)
- **Screenshots** or **error messages**

### Feature Requests

Use the feature request template and include:

- **Clear description** of the feature
- **Use case** and **motivation**
- **Proposed solution** (if you have one)
- **Alternatives considered**
- **Additional context**

### Labels

We use these labels to categorize issues:

- **bug**: Something isn't working
- **enhancement**: New feature or request
- **documentation**: Improvements to documentation
- **good first issue**: Good for newcomers
- **help wanted**: Extra attention needed
- **question**: Further information requested
- **wontfix**: This will not be worked on

## Testing

### Writing Tests

- Write **unit tests** for utility functions
- Write **integration tests** for main features
- Use **Jest** as the testing framework
- Aim for **good test coverage**

### Test Structure

```javascript
describe('Code Generation', () => {
  test('should generate C++ code correctly', () => {
    const input = {
      language: 'cpp',
      functionName: 'twoSum',
      parameters: 'vector<int>& nums, int target'
    };
    
    const result = generateCode(input);
    
    expect(result).toContain('class Solution');
    expect(result).toContain('vector<int> twoSum');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- code-generation.test.js
```

## Documentation

### Types of Documentation

1. **Code Documentation**: Inline comments and JSDoc
2. **User Documentation**: User guides and tutorials
3. **API Documentation**: Technical API reference
4. **Contributing Documentation**: This file and related guides

### Writing Documentation

- Use **clear, concise language**
- Include **examples** where helpful
- Keep documentation **up-to-date**
- Use **proper markdown formatting**

### JSDoc Comments

```javascript
/**
 * Generates driver code for a competitive programming problem
 * @param {Object} problemData - The problem data
 * @param {string} problemData.language - Programming language
 * @param {string} problemData.template - Code template
 * @param {string} problemData.functionName - Function name
 * @returns {Promise<string>} Generated code
 * @throws {Error} When required parameters are missing
 */
async function generateCode(problemData) {
  // Implementation
}
```

## Recognition

Contributors are recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** graph
- **Special mentions** in project updates

## Getting Help

If you need help with contributing:

1. **Check existing issues** and documentation
2. **Ask in discussions** for general questions
3. **Create a new issue** for specific problems
4. **Join our community** chat

## License

By contributing to LeetVSCode, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to LeetVSCode! Your efforts help make DSA and competitive programming more accessible to everyone. 🚀