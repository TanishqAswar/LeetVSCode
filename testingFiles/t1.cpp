#include <bits/stdc++.h>
using namespace std;

class Solution
{
public:
    string longestCommonPrefix(vector<string> S)
    {
        if (S.size() == 0)
            return "";
        for (int i = 0; i < S[0].length(); i++)
        {
            char c = S[0][i];
            for (int j = 1; j < S.size(); j++)
            {
                if (i == S[j].length() || S[j][i] != c)
                    return S[0].substr(0, i);
            }
        }
        return S[0];
    }
};

int main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    Solution sol;
    string line;

    getline(cin, line);

    vector<string> strs;
    size_t pos = 0;
    string token;

    while ((pos = line.find("\"")) != string::npos)
    {
        line.erase(0, pos + 1);
        pos = line.find("\"");
        token = line.substr(0, pos);
        strs.push_back(token);
        line.erase(0, pos + 1);
        if (line.find(",") == string::npos)
            break;
        line.erase(0, 1);
    }

    cout << "\"" << sol.longestCommonPrefix(strs) << "\"" << endl;

    return 0;
}