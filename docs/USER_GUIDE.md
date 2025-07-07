# LeetVSCode User Guide

Welcome to the comprehensive user guide for LeetVSCode! This guide will walk you through everything you need to know to maximize your productivity with this extension.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Core Features](#core-features)
3. [Advanced Usage](#advanced-usage)
4. [Language-Specific Tips](#language-specific-tips)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)
7. [FAQ](#faq)

## Getting Started

### First-Time Setup

After installing the extension, you'll need to configure it:

1. **Open the Extension**
   - Click the LeetVSCode icon in your browser toolbar
   - Or use the keyboard shortcut `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (Mac)

2. **Configure API Key**
   - Enter your Gemini API key
   - The key is stored securely in your browser's local storage
   - You can change it anytime in the settings

3. **Set Up Templates** (Optional)
   - Configure custom boilerplate templates
   - Set preferences for each programming language
   - Save commonly used imports and headers

## Core Features

### 1. Generate Driver Code

Transform any competitive programming problem into a complete, testable solution template.

#### How It Works:
1. **Navigate** to a competitive programming problem
2. **Click** the extension icon
3. **Select** "Generate Code"
4. **Choose** your programming language
5. **Copy** the generated code to your IDE

#### Example Output:
```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    // TODO: Implement your solution here
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
    }
};

int main() {
    Solution solution;
    
    // Test case 1
    vector<int> nums1 = {2, 7, 11, 15};
    int target1 = 9;
    vector<int> result1 = solution.twoSum(nums1, target1);
    
    cout << "Test 1: [";
    for (int i = 0; i < result1.size(); i++) {
        cout << result1[i];
        if (i < result1.size() - 1) cout << ", ";
    }
    cout << "]" << endl;
    
    return 0;
}
```

### 2. Extract Submittable Function

Clean up your complete solution and extract only the submittable function.

#### How It Works:
1. **Write** your complete solution in your IDE
2. **Copy** your entire code (including main function, test cases, etc.)
3. **Click** the extension icon
4. **Select** "Extract Function"
5. **Paste** your code in the input field
6. **Get** the clean, submittable function

#### Example:
**Input** (Your complete solution):
```cpp
#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) {
                    return {i, j};
                }
            }
        }
        return {};
    }
};

int main() {
    Solution s;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = s.twoSum(nums, target);
    for (int x : result) {
        cout << x << " ";
    }
    return 0;
}
```

**Output** (Clean function):
```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) {
                    return {i, j};
                }
            }
        }
        return {};
    }
};
```

## Advanced Usage

### Custom Templates

Create personalized boilerplate templates for different scenarios:

#### Template Variables
- `{FUNCTION_NAME}` - Problem function name
- `{RETURN_TYPE}` - Expected return type
- `{PARAMETERS}` - Function parameters
- `{CLASS_NAME}` - Solution class name

#### Example Custom Template:
```cpp
#include <bits/stdc++.h>
using namespace std;

class {CLASS_NAME} {
public:
    {RETURN_TYPE} {FUNCTION_NAME}({PARAMETERS}) {
        // Your solution here
    }
};

// Helper functions
void printVector(const vector<int>& v) {
    for (int x : v) cout << x << " ";
    cout << endl;
}

int main() {
    {CLASS_NAME} sol;
    // Test cases
    return 0;
}
```

### Keyboard Shortcuts

- `Ctrl+Shift+L` (Windows/Linux) or `Cmd+Shift+L` (Mac): Open extension
- `Ctrl+G`: Quick generate code
- `Ctrl+E`: Quick extract function
- `Escape`: Close extension popup

### Batch Processing

Process multiple problems at once:

1. Open multiple problem tabs
2. Use the "Batch Generate" feature
3. Select all tabs you want to process
4. Generate code for all problems simultaneously

## Language-Specific Tips

### C++
- Use `#include <bits/stdc++.h>` for competitive programming
- Include common namespace `using namespace std;`
- Add helper functions for common operations
- Use `ios_base::sync_with_stdio(false);` for faster I/O

### Python
- Use type hints for better code clarity
- Include common imports: `from typing import List, Dict, Set`
- Add helper functions for common patterns
- Use list comprehensions and built-in functions

### JavaScript
- Use arrow functions for concise code
- Include common utility functions
- Use modern ES6+ features
- Add console.log for debugging

### Java
- Include proper class structure
- Add common imports: `java.util.*`
- Use proper naming conventions
- Include static helper methods

### C
- Include necessary headers
- Use proper memory management
- Add common utility functions
- Include proper error handling

## Troubleshooting

### Common Issues

#### Extension Not Working
**Problem**: Extension icon is greyed out or not responding
**Solution**:
- Refresh the page
- Check if the problem page is supported
- Ensure the extension is enabled in browser settings
- Try reloading the extension

#### API Key Issues
**Problem**: "Invalid API Key" error
**Solution**:
- Verify your API key is correct
- Check if you have remaining quota
- Ensure internet connection is stable
- Try generating a new API key

#### Code Generation Fails
**Problem**: Generated code is incomplete or incorrect
**Solution**:
- Check if the problem format is supported
- Try refreshing the page
- Verify the problem has clear function signatures
- Report the issue with problem URL

#### Function Extraction Issues
**Problem**: Extracted function is incomplete
**Solution**:
- Ensure your code is properly formatted
- Check that class and function names are clear
- Verify the programming language is correctly detected
- Try simplifying your code structure

### Debug Mode

Enable debug mode to see detailed logs:

1. Open extension popup
2. Click "Settings"
3. Enable "Debug Mode"
4. Check browser console for detailed logs

## Best Practices

### For Competitive Programming
- **Test Thoroughly**: Always test with provided examples
- **Edge Cases**: Consider edge cases in your solutions
- **Time Complexity**: Analyze and optimize time complexity
- **Clean Code**: Write readable, maintainable code

### For Learning
- **Understand First**: Read and understand the problem completely
- **Plan Approach**: Think about the algorithm before coding
- **Multiple Solutions**: Try different approaches
- **Review Solutions**: Study optimal solutions after solving

### Code Organization
- **Consistent Naming**: Use consistent variable and function names
- **Comments**: Add comments for complex logic
- **Modular Code**: Break down complex problems into smaller functions
- **Version Control**: Use git to track your progress

## FAQ

### General Questions

**Q: Is LeetVSCode free to use?**
A: Yes, LeetVSCode is completely free. You only need a free Gemini API key.

**Q: Does it work offline?**
A: The extension works offline for cached templates, but requires internet for API calls.

**Q: Can I use it on mobile?**
A: Currently, LeetVSCode is designed for desktop browsers only.

### Technical Questions

**Q: How is my data handled?**
A: All data is stored locally in your browser. Only your code is sent to Google's Gemini API for processing.

**Q: Can I contribute to the project?**
A: Yes! Check our [Contributing Guide](./CONTRIBUTING.md) for details.

**Q: How do I report a bug?**
A: Create an issue on our [GitHub repository](https://github.com/TanishqAswar/LeetVSCode/issues).

### Usage Questions

**Q: Can I customize the generated code?**
A: Yes, you can create custom templates in the settings.

**Q: What if my preferred programming language isn't supported?**
A: Open an issue on GitHub requesting support for your language.

**Q: Can I use it with other coding platforms?**
A: Yes, it works with most competitive programming platforms.

## Getting Help

If you need additional help:

1. **Check this guide** for common solutions
2. **Search existing issues** on GitHub
3. **Ask in discussions** for community help
4. **Create a new issue** for bugs or feature requests

---

*Happy coding and good luck with your competitive programming journey! Hare Krishna🚀*