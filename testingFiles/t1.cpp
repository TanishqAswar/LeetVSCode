#include <iostream>
#include <vector>
#include <string>
#include <sstream>

using namespace std;

class Solution
{
public:
    string longestCommonPrefix(vector<string> S)
    {
        
    }
};
vector<string> parseStringArray(const string &str)
{
    vector<string> result;
    string currentString;
    bool insideQuotes = false;
    for (char c : str)
    {
        if (c == '"')
        {
            insideQuotes = !insideQuotes;
            if (!insideQuotes)
            {
                result.push_back(currentString);
                currentString = "";
            }
        }
        else if (insideQuotes)
        {
            currentString += c;
        }
    }
    return result;
}

signed main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
    int t = 1;

    while (t--)
    {
        string line;
        getline(cin, line);

        vector<string> strs = parseStringArray(line);
        Solution sol;
        cout << "\"" << sol.longestCommonPrefix(strs) << "\"" << endl;
    }
    return 0;
}