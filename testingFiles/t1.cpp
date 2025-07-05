// # Hare Krishna

#include <bits/stdc++.h>
using namespace std;

#define ll long long
#define int long long
#define vi vector<int>
#define vpi vector<pair<int, int>>
#define fr(i, a, b) for (size_t i = a; i < b; ++i)
#define pb push_back
#define cout std::cout
#define cin std::cin
#define FAST_IO              \
    ios::sync_with_stdio(0); \
    cin.tie(0);              \
    cout.tie(0);
#define sorta(arr) sort(arr.begin(), arr.end())
#define sortd(arr) sort(arr.rbegin(), arr.rend())
#define yes cout << "YES" << endl;
#define no cout << "NO" << endl;
const int M = 1e9 + 7;
#define print(arr, sizeofarray)           \
    for (int i = 0; i < sizeofarray; ++i) \
        cout << arr[i] << " ";            \
    cout << endl;

#define minEl(arr) (min_element((arr).begin(), (arr).end()))
#define maxEl(arr) (max_element((arr).begin(), (arr).end()))
#define sumArr(arr) (accumulate((arr).begin(), (arr).end(), 0LL))
bool iseven(int x) { return x % 2 == 0; }

bool isodd(int x) { return x % 2 != 0; }

#define ceil(a, b) ((a + b - 1) / b)

vector<string> letterCombinations(string digits)
{
    if (digits.empty())
        return {};

    vector<string> ans;

    dfs(digits, 0, "", ans);
    return ans;
}
const vector<string> digitToLetters{"", "", "abc", "def", "ghi",
                                    "jkl", "mno", "pqrs", "tuv", "wxyz"};

void dfs(const string &digits, int i, string &&path, vector<string> &ans)
{
    if (i == digits.length())
    {
        ans.push_back(path);
        return;
    }

    for (const char letter : digitToLetters[digits[i] - '0'])
    {
        path.push_back(letter);
        dfs(digits, i + 1, std::move(path), ans);
        path.pop_back();
    }
}
void solve()
{
    string digits;
    cin >> digits;

    vector<string> result = letterCombinations(digits);

    cout << "[";
    for (size_t i = 0; i < result.size(); ++i)
    {
        cout << "\"" << result[i] << "\"";
        if (i < result.size() - 1)
        {
            cout << ",";
        }
    }
    cout << "]" << endl;
}

signed main()
{
    FAST_IO
    int t = 1;
    cin >> t;

    while (t--)
    {
        solve();
    }

    return 0;
}