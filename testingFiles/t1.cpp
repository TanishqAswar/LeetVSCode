#include <bits/stdc++.h>
using namespace std;

class Solution
{
public:
    int findLucky(vector<int> &arr)
    {
        vector<int> count(arr.size() + 1);

        for (const int a : arr)
            if (a <= arr.size())
                ++count[a];

        for (int i = arr.size(); i >= 1; --i)
            if (count[i] == i)
                return i;

        return -1;
    }
};

int main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    Solution sol;

    int n;
    cin >> n;

    vector<int> arr(n);
    for (int i = 0; i < n; ++i)
    {
        cin >> arr[i];
    }

    cout << sol.findLucky(arr) << endl;

    return 0;
}