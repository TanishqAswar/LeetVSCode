  # Changelog

All notable changes to LeetVSCode will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Batch processing for multiple problems
- Dark mode support
- Keyboard shortcuts for quick access
- Template variables system
- Debug mode for troubleshooting

### Changed
- Improved UI/UX design
- Better error handling
- Enhanced code generation accuracy

### Fixed
- Function extraction for complex nested structures
- API key validation issues
- Browser compatibility problems

## [1.0.0] - 2025-07-06

### Added
- Initial release of LeetVSCode
- Core driver code generation functionality
- Function extraction from complete solutions
- Support for C++, Python, JavaScript, Java, and C
- Integration with Google Gemini API
- Support for major competitive programming platforms:
  - LeetCode
  - GeeksforGeeks
  - Codeforces
  - HackerRank
  - CodeChef
  - AtCoder
- Browser extension support for:
  - Google Chrome
  - Microsoft Edge
  - Brave Browser
- Basic settings and configuration
- Local API key storage
- Custom boilerplate templates
- Cross-platform IDE support

### Features
- **Code Generation**: Automatically generate test harnesses and driver code
- **Function Extraction**: Extract clean, submittable functions from complete solutions
- **Multi-Language Support**: Support for 5 major programming languages
- **Platform Integration**: Works with 6+ competitive programming platforms
- **Browser Compatibility**: Works across all major Chromium-based browsers
- **Security**: Local data storage with secure API key handling
- **Customization**: Custom templates and boilerplate support

### Technical Details
- Manifest V3 compliance
- Efficient content script injection
- Optimized API calls to reduce latency
- Robust error handling and user feedback
- Cross-browser compatibility layer

## [0.9.0] - 2025-06-20 (Beta)

### Added
- Beta release for testing
- Core functionality implementation
- Basic UI components
- API integration testing
- Platform detection algorithms

### Changed
- Refactored code architecture
- Improved parsing algorithms
- Enhanced error handling

### Fixed
- Multiple parsing edge cases
- API timeout issues
- UI responsiveness problems

## [0.8.0] - 2025-06-01 (Alpha)

### Added
- Alpha release for early testing
- Basic code generation functionality
- Simple function extraction
- Initial UI design
- Chrome extension framework

### Known Issues
- Limited platform support
- Basic error handling
- UI/UX needs improvement
- Performance optimization required

## [0.7.0] - 2025-05-15 (Pre-Alpha)

### Added
- Project initialization
- Basic extension structure
- Proof of concept for code generation
- Initial API integration
- Basic manifest.json setup

### Development Notes
- First working prototype
- Core concept validation
- Initial development environment setup

---

## Release Notes

### Version 1.0.0 Highlights

This is the first stable release of LeetVSCode! 🎉

**Key Features:**
- Complete driver code generation for competitive programming
- Smart function extraction from full solutions
- Support for 5 programming languages
- Integration with 6+ major platforms
- Secure local data storage
- Customizable templates

**What's New:**
- Professional UI/UX design
- Comprehensive error handling
- Detailed documentation
- Community contribution guidelines
- Extensive testing and validation

**Getting Started:**
1. Install from our [GitHub repository](https://github.com/TanishqAswar/LeetVSCode)
2. Get your free Gemini API key
3. Start generating code instantly!

### Upgrade Notes

#### From Beta (0.9.0) to Stable (1.0.0)
- **API Key**: You may need to re-enter your API key due to security improvements
- **Templates**: Custom templates from beta will be preserved
- **Settings**: All settings will be migrated automatically

#### Breaking Changes
- None - this is the first stable release

### Platform Support Matrix

| Platform | Code Generation | Function Extraction | Status |
|----------|----------------|-------------------|---------|
| LeetCode | ✅ | ✅ | Full Support |
| GeeksforGeeks | ✅ | ✅ | Full Support |
| Codeforces | ✅ | ✅ | Full Support |
| HackerRank | ✅ | ✅ | Full Support |
| CodeChef | ✅ | ✅ | Full Support |
| AtCoder | ✅ | ✅ | Full Support |
| TopCoder | ⚠️ | ⚠️ | Limited Support |
| HackerEarth | ⚠️ | ⚠️ | Limited Support |

### Language Support Matrix

| Language | Code Generation | Function Extraction | Template Support |
|----------|----------------|-------------------|------------------|
| C++ | ✅ | ✅ | ✅ |
| Python | ✅ | ✅ | ✅ |
| JavaScript | ✅ | ✅ | ✅ |
| Java | ✅ | ✅ | ✅ |
| C | ✅ | ✅ | ✅ |
| Go | 🚧 | 🚧 | Planned |
| Rust | 🚧 | 🚧 | Planned |
| Kotlin | 🚧 | 🚧 | Planned |

**Legend:**
- ✅ Full Support
- ⚠️ Limited Support
- 🚧 In Development
- ❌ Not Supported

### Browser Compatibility

| Browser | Version | Status | Notes |
|---------|---------|---------|-------|
| Chrome | 88+ | ✅ Fully Supported | Recommended |
| Edge | 88+ | ✅ Fully Supported | Recommended |
| Brave | 1.20+ | ✅ Fully Supported | Recommended |
| Opera | 74+ | ⚠️ Limited Testing | Should work |
| Firefox | - | ❌ Not Supported | Manifest V3 required |
| Safari | - | ❌ Not Supported | Chrome extension only |

### Performance Metrics

- **Average Code Generation Time**: < 3 seconds
- **Function Extraction Time**: < 1 second
- **Extension Load Time**: < 500ms
- **Memory Usage**: < 10MB
- **API Rate Limits**: 60 requests/minute

### Security Features

- **Local Data Storage**: All user data stays on device
- **Secure API Key Handling**: Encrypted storage in browser
- **No Data Collection**: Zero telemetry or tracking
- **Privacy First**: No external data transmission except to Google AI API
- **Content Security Policy**: Strict CSP implementation

### Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast Mode**: Support for accessibility themes
- **Font Size Options**: Customizable text sizes
- **Color Blind Friendly**: Accessible color schemes

### Known Limitations

1. **Rate Limits**: Subject to Google Gemini API rate limits
2. **Internet Required**: Online connection needed for code generation
3. **Platform Detection**: May not work on heavily customized contest platforms
4. **Complex Code**: Very complex nested structures may need manual adjustment
5. **Language Detection**: Occasionally may misidentify programming language

### Roadmap

#### Version 1.1.0 (Q3 2025)
- **New Languages**: Go, Rust, Kotlin support
- **Batch Processing**: Process multiple problems simultaneously
- **Enhanced Templates**: More sophisticated template system
- **Performance**: Faster code generation and extraction
- **UI/UX**: Improved user interface

#### Version 1.2.0 (Q4 2025)
- **Offline Mode**: Basic functionality without internet
- **Code Analysis**: Static analysis and optimization suggestions
- **Team Features**: Shared templates and configurations
- **Advanced Parsing**: Better handling of complex code structures

#### Version 2.0.0 (2026)
- **AI Improvements**: Enhanced AI models for better code generation
- **IDE Integration**: Direct IDE plugins
- **Contest Mode**: Special features for live contests
- **Mobile Support**: Mobile browser compatibility

### Migration Guide

#### From Beta Versions
1. **Backup Settings**: Export your custom templates
2. **Uninstall Old Version**: Remove beta version from browser
3. **Install Stable**: Install version 1.0.0
4. **Restore Settings**: Import your templates
5. **Re-enter API Key**: Add your Gemini API key

#### From Alpha Versions
- **Clean Installation Required**: Alpha versions are not compatible
- **Manual Migration**: Copy custom templates manually
- **New Setup**: Complete fresh setup required

### Support and Feedback

- **Bug Reports**: [GitHub Issues](https://github.com/TanishqAswar/LeetVSCode/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/TanishqAswar/LeetVSCode/discussions)
- **Documentation**: [User Guide](docs/USER_GUIDE.md)
- **Community**: [Discord Server](https://discord.gg/leetvscode) (Coming Soon)

### Contributors

Special thanks to all contributors who made this release possible:

- **[@TanishqAswar](https://github.com/TanishqAswar)** - Project Creator & Lead Developer
- **Community Contributors** - Beta testers and feedback providers
- **Open Source Community** - Libraries and tools used

### Acknowledgments

- **Google Gemini API** - For powerful AI capabilities
- **Chrome Extensions Team** - For excellent platform documentation
- **Competitive Programming Community** - For inspiration and feedback
- **Open Source Projects** - For libraries and tools used

---

*For the complete version history and detailed technical changes, see the [commit history](https://github.com/TanishqAswar/LeetVSCode/commits/main) on GitHub.*