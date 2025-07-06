// src/utils/boilerplateUtils.ts
import { Language } from '../types'

export const getDefaultBoilerplate = (language: Language): string => {
  const boilerplates: Record<Language, string> = {
    'C++': `#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    // Your solution function here
    
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    Solution sol;
    // Driver code will be generated here
    
    return 0;
}`,
    Python: `class Solution:
    def solution_function(self):
        # Your solution here
        pass

if __name__ == "__main__":
    sol = Solution()
    # Driver code will be generated here`,
    JavaScript: `class Solution {
    solutionFunction() {
        // Your solution here
    }
}

// Driver code will be generated here
const sol = new Solution();`,
    Java: `import java.util.*;
import java.io.*;

class Solution {
    public void solutionFunction() {
        // Your solution here
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Solution sol = new Solution();
        // Driver code will be generated here
    }
}`,
    C: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Your solution function here

int main() {
    // Driver code will be generated here
    return 0;
}`,
    Go: `package main

import (
    "fmt"
)

// Your solution function here

func main() {
    // Driver code will be generated here
}`,
    Rust: `use std::io;

// Your solution function here

fn main() {
    // Driver code will be generated here
}`,
  }

  return boilerplates[language] || ''
}
