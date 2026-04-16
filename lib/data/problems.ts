import type { Problem } from "@/lib/types";
import { PROBLEMS_EXTRA } from "./problems-extra";

/**
 * Curated Easy/Medium-first roadmap inspired by NeetCode 150.
 * Explanations, pitfalls, and "remember this" lines are written originally
 * for this product — we reference rather than reproduce problem statements.
 */
const PROBLEMS_BASE: Problem[] = [
  // ---------- ARRAYS & HASHING ----------
  {
    id: "contains-duplicate",
    title: "Contains Duplicate",
    patternId: "arrays-hashing",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 8,
    learningObjective: "Use a set for O(1) membership checks.",
    whyItMatters:
      "The cleanest possible introduction to hashing. If you can't write this in 45 seconds, the muscle memory isn't there yet.",
    bruteForce:
      "Nested loops comparing every pair. O(n²) time, O(1) space — works but a waste of time.",
    optimalInsight:
      "Track values you've already seen in a set. The first repeat is the answer.",
    helperSyntax: ["set()", "in / not in", "for x in nums:"],
    hints: [
      "What's the fastest way to answer 'have I seen x before'?",
      "A set gives O(1) membership. What do you add to it, and when?",
      "Iterate once. If x is in the set, return True, else add it.",
    ],
    pitfalls: [
      "Using a list instead of a set (O(n) membership — kills the whole point)",
      "Adding to the set before checking — every element looks like a duplicate",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def containsDuplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False`,
    recallQuestions: [
      "What pattern was this?",
      "Why a set and not a list?",
      "What's the order: check first or add first?",
    ],
    dayAssignment: 1,
    rememberThis:
      "Check membership first, then add. Set > list for 'have I seen this?'.",
  },
  {
    id: "valid-anagram",
    title: "Valid Anagram",
    patternId: "arrays-hashing",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Compare two Counters or two frequency dicts.",
    whyItMatters:
      "Counter comparison is an interview staple. It sets up every 'group anagrams' / 'permutation in string' problem.",
    bruteForce:
      "Sort both strings and compare — O(n log n). Perfectly acceptable but misses the point of the pattern.",
    optimalInsight:
      "Build a frequency map for each string and compare. Or just Counter(s) == Counter(t).",
    helperSyntax: ["Counter(s)", "defaultdict(int)", "dict equality with =="],
    hints: [
      "Two strings are anagrams iff they have the same multiset of characters.",
      "Can you represent a multiset with a single line of Python?",
      "Counter(s) == Counter(t).",
    ],
    pitfalls: [
      "Forgetting the length-mismatch early return (not wrong, just slower)",
      "Using sorted() and calling it 'optimal'",
    ],
    complexity: { time: "O(n)", space: "O(1) — fixed alphabet" },
    finalCode: `from collections import Counter

def isAnagram(s, t):
    if len(s) != len(t):
        return False
    return Counter(s) == Counter(t)`,
    recallQuestions: [
      "Which stdlib import gives you a one-liner?",
      "What's the early-return guard?",
    ],
    dayAssignment: 1,
    rememberThis: "Counter(s) == Counter(t) is the whole solution.",
  },
  {
    id: "two-sum",
    title: "Two Sum",
    patternId: "arrays-hashing",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Use a hash map to look up complements in one pass.",
    whyItMatters:
      "The most-asked interview question in history. Owning the one-pass solution is non-negotiable.",
    bruteForce:
      "Two nested loops over all pairs. O(n²) — the obvious starting point.",
    optimalInsight:
      "As you walk the array, the complement you need is target - nums[i]. Store {value: index} so you can ask 'have I seen the complement?' in O(1).",
    helperSyntax: ["dict() or {}", "for i, x in enumerate(nums):", "dict.get"],
    hints: [
      "Can you turn 'does target - x exist in the array?' into a hash lookup?",
      "Map value → index as you go.",
      "Check complement first, then write the current value.",
    ],
    pitfalls: [
      "Writing the current value before checking — you'll match yourself",
      "Returning values instead of indices",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def twoSum(nums, target):
    seen = {}  # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i`,
    recallQuestions: [
      "What do you store as the key and value?",
      "Check first or write first? Why?",
    ],
    dayAssignment: 1,
    rememberThis: "Hash the complement. Check, then store.",
  },
  {
    id: "group-anagrams",
    title: "Group Anagrams",
    patternId: "arrays-hashing",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Group items by a canonical key in a defaultdict.",
    whyItMatters:
      "Teaches the 'canonical form as key' idea that reappears in a dozen other problems.",
    bruteForce: "Compare every pair of strings with anagram check — O(n² · k).",
    optimalInsight:
      "Each anagram group has the same sorted string (or same frequency tuple). Use that as a dict key.",
    helperSyntax: [
      "defaultdict(list)",
      "tuple(sorted(s)) or ''.join(sorted(s))",
      "groups.values()",
    ],
    hints: [
      "What single value would be identical for every string in a group?",
      "Sorted characters or a frequency tuple — both work as dict keys.",
      "defaultdict(list) lets you append without a KeyError.",
    ],
    pitfalls: [
      "Using a list as a dict key (unhashable)",
      "Sorting in place and mutating inputs",
    ],
    complexity: { time: "O(n · k log k)", space: "O(n · k)" },
    finalCode: `from collections import defaultdict

def groupAnagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = tuple(sorted(s))
        groups[key].append(s)
    return list(groups.values())`,
    recallQuestions: [
      "What's the canonical key?",
      "Why tuple() and not list()?",
    ],
    dayAssignment: 2,
    rememberThis: "Canonical key → defaultdict(list). Return groups.values().",
  },
  {
    id: "top-k-frequent",
    title: "Top K Frequent Elements",
    patternId: "arrays-hashing",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Count, then bucket sort or heap the top K.",
    whyItMatters:
      "Bridges the hashing and heap patterns. Bucket sort trick is a teachable aha moment.",
    bruteForce: "Counter then sort by frequency. O(n log n). Totally fine.",
    optimalInsight:
      "Frequencies are bounded by len(nums), so an array of buckets indexed by frequency gives O(n).",
    helperSyntax: [
      "Counter(nums)",
      "buckets = [[] for _ in range(n+1)]",
      "range(len(buckets)-1, -1, -1)",
    ],
    hints: [
      "Start by counting.",
      "Frequencies live in [1..n]. What if you indexed a list by frequency?",
      "Walk buckets right-to-left, collect K values.",
    ],
    pitfalls: [
      "Creating shared list references with [[]] * n",
      "Forgetting to stop once you've collected k items",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `from collections import Counter

def topKFrequent(nums, k):
    counts = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for val, freq in counts.items():
        buckets[freq].append(val)
    res = []
    for freq in range(len(buckets) - 1, -1, -1):
        for val in buckets[freq]:
            res.append(val)
            if len(res) == k:
                return res`,
    recallQuestions: [
      "Why does bucket sort work here?",
      "What's the max possible frequency?",
    ],
    dayAssignment: 3,
    rememberThis: "Frequency → bucket index. Walk right to left.",
  },
  {
    id: "product-except-self",
    title: "Product of Array Except Self",
    patternId: "arrays-hashing",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Prefix/suffix products without division.",
    whyItMatters:
      "Classic 'two passes, no division' trick. Shows how to trade clever loops for space.",
    bruteForce: "For each i, multiply everything else. O(n²).",
    optimalInsight:
      "res[i] = (product of everything left of i) * (product of everything right of i). Compute in two sweeps.",
    helperSyntax: ["res = [1] * n", "two passes", "suffix running product"],
    hints: [
      "Can you split the answer into a left piece and a right piece?",
      "First pass fills res[i] = left product. Second pass multiplies by the right running product.",
    ],
    pitfalls: [
      "Using division (fails on zeros)",
      "Allocating extra left/right arrays when the output array can hold both",
    ],
    complexity: { time: "O(n)", space: "O(1) — output not counted" },
    finalCode: `def productExceptSelf(nums):
    n = len(nums)
    res = [1] * n
    left = 1
    for i in range(n):
        res[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        res[i] *= right
        right *= nums[i]
    return res`,
    recallQuestions: [
      "Why can't we just divide the total product?",
      "What does res[i] hold after the first pass?",
    ],
    dayAssignment: 4,
    rememberThis: "Two sweeps: left prefix, then right suffix. No division.",
  },

  // ---------- TWO POINTERS ----------
  {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    patternId: "two-pointers",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Walk two pointers inward while filtering characters.",
    whyItMatters: "The cleanest two-pointer intro. Builds the l/r reflex.",
    bruteForce: "Filter to a cleaned string, then check s == s[::-1].",
    optimalInsight:
      "No extra string needed — walk l and r inward, skip non-alphanumerics, compare lowercased.",
    helperSyntax: ["str.isalnum()", "str.lower()", "l, r = 0, len(s) - 1"],
    hints: [
      "Two pointers at the ends, moving inward.",
      "Skip anything that isn't alphanumeric.",
      "Compare the lowercased characters.",
    ],
    pitfalls: [
      "Forgetting to skip non-alphanumerics on both sides",
      "Using == without lowercasing",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def isPalindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1
        while l < r and not s[r].isalnum():
            r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l += 1
        r -= 1
    return True`,
    recallQuestions: [
      "What's the skip condition?",
      "Why guard both inner whiles with l < r?",
    ],
    dayAssignment: 5,
    rememberThis: "Two pointers + skip non-alnum + lowercase compare.",
  },
  {
    id: "two-sum-ii",
    title: "Two Sum II — Sorted Input",
    patternId: "two-pointers",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Use sortedness to avoid a hash map.",
    whyItMatters:
      "The sorted version of Two Sum teaches the converging-pointer move.",
    bruteForce: "Re-use the hash-map approach — works but ignores the sort.",
    optimalInsight:
      "Sum too small → move l right. Sum too big → move r left. Exactly one pair works for this problem.",
    helperSyntax: ["l, r = 0, len(nums) - 1", "while l < r"],
    hints: [
      "The array is sorted — that's the whole hint.",
      "If the sum is too small, which side do you move?",
    ],
    pitfalls: ["1-indexed return in the original problem — watch for that"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        if s < target:
            l += 1
        else:
            r -= 1`,
    recallQuestions: [
      "Why does two-pointer work here but not on unsorted Two Sum?",
    ],
    dayAssignment: 5,
    rememberThis: "Sorted + pair sum → converging pointers.",
  },
  {
    id: "three-sum",
    title: "3Sum",
    patternId: "two-pointers",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective:
      "Fix one index, two-pointer the rest, skip duplicates carefully.",
    whyItMatters:
      "The canonical 'reduce to two pointers' problem. Duplicate handling is where most people slip.",
    bruteForce: "Triple nested loop with a set of sorted triples. O(n³).",
    optimalInsight:
      "Sort, then for each i run two pointers on the suffix. Skip duplicates at every level.",
    helperSyntax: [
      "nums.sort()",
      "while l < r and nums[l] == nums[l+1]: l += 1",
      "continue when nums[i] == nums[i-1]",
    ],
    hints: [
      "Sort the array first.",
      "Fix i. What's the target for the remaining pair?",
      "Skip duplicates for i, l, and r independently.",
    ],
    pitfalls: [
      "Skipping duplicates only once — each pointer needs its own skip",
      "Moving l and r after matching without skipping dupes",
    ],
    complexity: { time: "O(n²)", space: "O(1) ignoring output" },
    finalCode: `def threeSum(nums):
    nums.sort()
    res = []
    n = len(nums)
    for i in range(n - 2):
        if nums[i] > 0:
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, n - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
                while l < r and nums[r] == nums[r + 1]:
                    r -= 1
    return res`,
    recallQuestions: [
      "How many independent 'skip duplicates' loops are there?",
      "Why does `break` work when nums[i] > 0?",
    ],
    dayAssignment: 6,
    rememberThis: "Sort. Fix i. Two pointers. Skip dupes at i, l, and r.",
  },
  {
    id: "container-with-most-water",
    title: "Container With Most Water",
    patternId: "two-pointers",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Pointer-movement by 'which side is the bottleneck?'.",
    whyItMatters:
      "Teaches the 'move the weaker side' heuristic that shows up in harder two-pointer problems.",
    bruteForce: "Try every pair. O(n²).",
    optimalInsight:
      "Area is limited by min(h[l], h[r]). Moving the taller side can never help; move the shorter side.",
    helperSyntax: ["area = min(h[l], h[r]) * (r - l)"],
    hints: [
      "Which side of the pair limits the area?",
      "If you move the taller side, does the area ever improve?",
    ],
    pitfalls: ["Moving the wrong side — the classic off-by-heuristic bug"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def maxArea(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        area = min(height[l], height[r]) * (r - l)
        best = max(best, area)
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best`,
    recallQuestions: ["Why do you move the shorter side?"],
    dayAssignment: 6,
    rememberThis: "Move the shorter wall. Always.",
  },

  // ---------- SLIDING WINDOW ----------
  {
    id: "best-time-buy-sell",
    title: "Best Time to Buy and Sell Stock",
    patternId: "sliding-window",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Track a running minimum while sweeping.",
    whyItMatters: "Smallest sliding window there is — one-variable state.",
    bruteForce: "Try every buy day vs every sell day. O(n²).",
    optimalInsight:
      "Sweep once, keep the running minimum price so far, update the best profit at each step.",
    helperSyntax: ["min_price = float('inf')", "profit = max(profit, p - min_price)"],
    hints: [
      "You want max(p[j] - p[i]) for j > i. Can you avoid the j > i pairing?",
      "If you already knew the cheapest day so far, today's best sell is trivial.",
    ],
    pitfalls: ["Initializing min_price to 0 instead of +infinity"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def maxProfit(prices):
    min_price = float('inf')
    profit = 0
    for p in prices:
        min_price = min(min_price, p)
        profit = max(profit, p - min_price)
    return profit`,
    recallQuestions: ["What's the loop invariant at step i?"],
    dayAssignment: 7,
    rememberThis: "Running min + running profit, one pass.",
  },
  {
    id: "longest-substring-no-repeat",
    title: "Longest Substring Without Repeating Characters",
    patternId: "sliding-window",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Shrink a window until a constraint holds.",
    whyItMatters: "The archetypal variable-size sliding window.",
    bruteForce: "Try every substring. O(n²) or worse.",
    optimalInsight:
      "Expand r, add s[r] to a set. While s[r] is already in the set, shrink from l until it isn't.",
    helperSyntax: ["seen = set()", "while s[r] in seen: seen.remove(s[l]); l += 1"],
    hints: [
      "What goes in the window, and what invariant must hold?",
      "When the invariant breaks, what do you remove and from which side?",
    ],
    pitfalls: ["Removing the wrong end of the window", "Updating `best` outside the valid branch"],
    complexity: { time: "O(n)", space: "O(min(n, alphabet))" },
    finalCode: `def lengthOfLongestSubstring(s):
    seen = set()
    l = 0
    best = 0
    for r, ch in enumerate(s):
        while ch in seen:
            seen.remove(s[l])
            l += 1
        seen.add(ch)
        best = max(best, r - l + 1)
    return best`,
    recallQuestions: [
      "Why is the shrink loop a while, not an if?",
    ],
    dayAssignment: 7,
    rememberThis: "Expand right, shrink while invalid, update best once valid.",
  },
  {
    id: "longest-repeating-replacement",
    title: "Longest Repeating Character Replacement",
    patternId: "sliding-window",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Track window_size - max_freq as the replacement cost.",
    whyItMatters:
      "Shows the subtle sliding window where the invariant isn't obvious until you name it.",
    bruteForce: "Try every substring and count replacements.",
    optimalInsight:
      "A window is valid iff (size - count of most frequent char) <= k. Shrink when it's not.",
    helperSyntax: ["Counter()", "counts[s[r]] += 1", "max(counts.values())"],
    hints: [
      "What's the minimum number of replacements to make a window all one letter?",
      "It's (window size) minus (count of most frequent letter in the window).",
    ],
    pitfalls: [
      "Recomputing max on every iteration (slow but OK) vs. tracking a running max",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def characterReplacement(s, k):
    counts = {}
    l = 0
    best = 0
    max_freq = 0
    for r, ch in enumerate(s):
        counts[ch] = counts.get(ch, 0) + 1
        max_freq = max(max_freq, counts[ch])
        while (r - l + 1) - max_freq > k:
            counts[s[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best`,
    recallQuestions: ["What is the invariant that defines a valid window?"],
    dayAssignment: 8,
    rememberThis: "Valid when window_size - max_freq <= k.",
  },

  // ---------- STACK ----------
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    patternId: "stack",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 8,
    learningObjective: "Match pairs with a stack.",
    whyItMatters: "The canonical stack warmup.",
    bruteForce: "Repeatedly strip matched pairs from the string.",
    optimalInsight:
      "Push openers. On a closer, check the top matches; otherwise fail fast.",
    helperSyntax: ["pairs = {')': '(', ']': '[', '}': '{'}", "stack[-1]"],
    hints: [
      "How do you know which opener each closer should match?",
      "Build a dict of closer → opener.",
    ],
    pitfalls: [
      "Forgetting to check that the stack isn't empty before peeking",
      "Returning True without checking that the stack is empty at the end",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def isValid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack[-1] != pairs[ch]:
                return False
            stack.pop()
        else:
            stack.append(ch)
    return not stack`,
    recallQuestions: ["Why must the final stack be empty?"],
    dayAssignment: 9,
    rememberThis: "Openers push. Closers must match top. Stack empty at end.",
  },
  {
    id: "min-stack",
    title: "Min Stack",
    patternId: "stack",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Augment each stack frame with the running minimum.",
    whyItMatters:
      "Classic interview design question. Shows the 'carry extra info per frame' trick.",
    bruteForce: "Scan the whole stack on getMin. O(n) per call.",
    optimalInsight:
      "Store pairs (value, current_min). Min is always top[-1][1] → O(1).",
    helperSyntax: ["stack.append((x, min(x, stack[-1][1]) if stack else x))"],
    hints: [
      "What if each frame remembered the min at the moment it was pushed?",
    ],
    pitfalls: ["Tracking one global min that gets wrong on pop"],
    complexity: { time: "O(1) per op", space: "O(n)" },
    finalCode: `class MinStack:
    def __init__(self):
        self.stack = []  # (val, min_so_far)

    def push(self, val):
        cur_min = val if not self.stack else min(val, self.stack[-1][1])
        self.stack.append((val, cur_min))

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1][0]

    def getMin(self):
        return self.stack[-1][1]`,
    recallQuestions: ["Why can't we just keep one min variable?"],
    dayAssignment: 9,
    rememberThis: "Push (value, min_so_far). getMin is free.",
  },
  {
    id: "daily-temperatures",
    title: "Daily Temperatures",
    patternId: "stack",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Use a monotonic-decreasing stack for next-greater.",
    whyItMatters: "The prototypical monotonic stack problem.",
    bruteForce: "For each day, scan forward. O(n²).",
    optimalInsight:
      "Keep a stack of indices with decreasing temperatures. When today beats the top, pop and record the gap.",
    helperSyntax: [
      "stack of indices, not values",
      "while stack and temps[stack[-1]] < t:",
      "res[j] = i - j",
    ],
    hints: [
      "Store indices so you can compute the distance.",
      "Pop while today beats the top — that's the 'next greater' moment.",
    ],
    pitfalls: ["Storing values instead of indices"],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def dailyTemperatures(temps):
    res = [0] * len(temps)
    stack = []  # indices, decreasing temps
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            res[j] = i - j
        stack.append(i)
    return res`,
    recallQuestions: [
      "Why indices on the stack instead of values?",
      "Why does each index get pushed and popped at most once?",
    ],
    dayAssignment: 10,
    rememberThis: "Monotonic stack of indices. Pop when today is bigger.",
  },

  // ---------- BINARY SEARCH ----------
  {
    id: "binary-search",
    title: "Binary Search",
    patternId: "binary-search",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Own one binary search template cold.",
    whyItMatters:
      "If you can't write binary search without bugs, all binary-search-on-answer problems are out of reach.",
    bruteForce: "Linear scan. O(n).",
    optimalInsight:
      "Maintain [lo, hi] as 'might contain the answer'. Halve each step.",
    helperSyntax: ["lo, hi = 0, len(nums) - 1", "mid = (lo + hi) // 2"],
    hints: [
      "Pick one template and stick with it — stop mixing `<` and `<=`.",
    ],
    pitfalls: ["Off-by-one forever if you don't commit to one template"],
    complexity: { time: "O(log n)", space: "O(1)" },
    finalCode: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    recallQuestions: ["What are the three branches of the if/elif/else?"],
    dayAssignment: 11,
    rememberThis: "Commit to one template. Don't free-style bounds.",
  },
  {
    id: "search-rotated",
    title: "Search in Rotated Sorted Array",
    patternId: "binary-search",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Decide which half is sorted, then branch.",
    whyItMatters:
      "Shows how binary search generalizes beyond 'is it sorted?'.",
    bruteForce: "Linear scan. O(n).",
    optimalInsight:
      "At each mid, exactly one half is sorted. Check if target lies in that sorted half; otherwise search the other half.",
    helperSyntax: ["nums[lo] <= nums[mid]  # left half is sorted"],
    hints: [
      "Compare nums[lo] and nums[mid]. Which half is guaranteed sorted?",
      "If target is in that sorted range, go there. Otherwise, go the other way.",
    ],
    pitfalls: [
      "Using `<` instead of `<=` when the array has length 1",
      "Not handling duplicates (different problem)",
    ],
    complexity: { time: "O(log n)", space: "O(1)" },
    finalCode: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            # left half sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            # right half sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
    recallQuestions: ["How do you tell which half is sorted?"],
    dayAssignment: 12,
    rememberThis: "One half is always sorted. Target in that half? Go there.",
  },
  {
    id: "find-min-rotated",
    title: "Find Minimum in Rotated Sorted Array",
    patternId: "binary-search",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Binary search on the rotation point.",
    whyItMatters:
      "A second pass at rotation — shorter, cleaner template.",
    bruteForce: "Linear min. O(n).",
    optimalInsight:
      "If nums[mid] > nums[hi], the min is to the right of mid. Otherwise it's at mid or to the left.",
    helperSyntax: ["while lo < hi:", "nums[mid] > nums[hi]"],
    hints: ["Compare mid to hi, not mid to lo. It's cleaner."],
    pitfalls: ["Comparing against lo — it breaks on rotated corner cases"],
    complexity: { time: "O(log n)", space: "O(1)" },
    finalCode: `def findMin(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`,
    recallQuestions: ["Why compare mid to hi instead of mid to lo?"],
    dayAssignment: 12,
    rememberThis: "Compare to hi. Min lives on the unsorted side.",
  },

  // ---------- LINKED LIST ----------
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    patternId: "linked-list",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Own the prev/curr/next reverse template.",
    whyItMatters:
      "You must be able to type this in under 30 seconds, blindfolded.",
    bruteForce: "Copy values into a list, reverse, rebuild. O(n) space.",
    optimalInsight:
      "Walk curr, saving next, rewiring curr.next = prev, sliding prev/curr forward.",
    helperSyntax: ["prev, curr = None, head", "nxt = curr.next"],
    hints: ["Three pointers. Save next before overwriting."],
    pitfalls: ["Forgetting to save next → you lose the rest of the list"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def reverseList(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
    recallQuestions: ["What do you return at the end, and why?"],
    dayAssignment: 13,
    rememberThis: "prev, curr, nxt. Save nxt. Rewire. Slide.",
  },
  {
    id: "merge-two-sorted-lists",
    title: "Merge Two Sorted Lists",
    patternId: "linked-list",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Use a dummy head to avoid head-case special handling.",
    whyItMatters: "The dummy-head trick used everywhere in linked-list land.",
    bruteForce: "Collect values, sort, rebuild.",
    optimalInsight:
      "Dummy head + tail pointer. Attach the smaller of the two heads each step.",
    helperSyntax: ["dummy = ListNode()", "tail = dummy", "tail.next = ..."],
    hints: ["Use a dummy head. Really."],
    pitfalls: ["Forgetting to attach the remainder at the end"],
    complexity: { time: "O(n + m)", space: "O(1)" },
    finalCode: `def mergeTwoLists(list1, list2):
    dummy = ListNode()
    tail = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 or list2
    return dummy.next`,
    recallQuestions: ["What does `list1 or list2` do at the end?"],
    dayAssignment: 13,
    rememberThis: "Dummy head. Advance the smaller. Attach remainder.",
  },
  {
    id: "linked-list-cycle",
    title: "Linked List Cycle",
    patternId: "linked-list",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 8,
    learningObjective: "Floyd's tortoise and hare.",
    whyItMatters:
      "The fast/slow pattern shows up in midpoint, cycle, and palindrome problems.",
    bruteForce: "Hash set of visited nodes. O(n) space.",
    optimalInsight: "Fast moves two, slow moves one. If they meet, cycle.",
    helperSyntax: ["slow, fast = head, head", "while fast and fast.next:"],
    hints: ["One moves twice as fast. Do they ever meet?"],
    pitfalls: [
      "Using `while fast:` instead of `while fast and fast.next:`",
    ],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def hasCycle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
    recallQuestions: ["Why `fast and fast.next` in the guard?"],
    dayAssignment: 14,
    rememberThis: "Fast/slow. Guard both fast and fast.next.",
  },

  // ---------- TREES ----------
  {
    id: "invert-binary-tree",
    title: "Invert Binary Tree",
    patternId: "trees",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 8,
    learningObjective: "Swap children via recursion.",
    whyItMatters: "The one-liner that got Max Howell ejected from Google.",
    bruteForce: "Same as optimal — it's a tiny problem.",
    optimalInsight: "Swap left and right, recurse on both.",
    helperSyntax: ["root.left, root.right = root.right, root.left"],
    hints: ["Swap, then recurse — order doesn't matter."],
    pitfalls: ["Forgetting the None base case"],
    complexity: { time: "O(n)", space: "O(h)" },
    finalCode: `def invertTree(root):
    if not root:
        return None
    root.left, root.right = root.right, root.left
    invertTree(root.left)
    invertTree(root.right)
    return root`,
    recallQuestions: ["Can you write this iteratively with a queue?"],
    dayAssignment: 15,
    rememberThis: "Tuple swap + recurse. Base case first.",
  },
  {
    id: "max-depth-tree",
    title: "Maximum Depth of Binary Tree",
    patternId: "trees",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 8,
    learningObjective: "Recursive height.",
    whyItMatters: "Teaches the 'recursion returns the local answer' habit.",
    bruteForce: "Same as optimal.",
    optimalInsight: "Height = 1 + max(left height, right height).",
    helperSyntax: ["if not root: return 0"],
    hints: ["What does each recursive call return?"],
    pitfalls: ["Returning 0 for non-null root"],
    complexity: { time: "O(n)", space: "O(h)" },
    finalCode: `def maxDepth(root):
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))`,
    recallQuestions: ["What does the base case return?"],
    dayAssignment: 15,
    rememberThis: "1 + max(left, right). None returns 0.",
  },
  {
    id: "same-tree",
    title: "Same Tree",
    patternId: "trees",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 8,
    learningObjective: "Structural recursion with two trees.",
    whyItMatters: "The recursive-comparison skeleton reappears everywhere.",
    bruteForce: "Serialize both trees and compare strings.",
    optimalInsight:
      "Both None → equal. One None → not. Values equal and subtrees equal → equal.",
    helperSyntax: ["if not p and not q: return True"],
    hints: ["Enumerate the four null/non-null cases."],
    pitfalls: ["Short-circuiting before checking subtrees"],
    complexity: { time: "O(n)", space: "O(h)" },
    finalCode: `def isSameTree(p, q):
    if not p and not q:
        return True
    if not p or not q:
        return False
    if p.val != q.val:
        return False
    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)`,
    recallQuestions: ["What are the four base cases?"],
    dayAssignment: 16,
    rememberThis: "Both None → True. One None → False. Then recurse.",
  },
  {
    id: "level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    patternId: "trees",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "BFS with level-size freeze.",
    whyItMatters:
      "The canonical BFS template. Level freeze trick is essential.",
    bruteForce: "Two queues or (node, depth) tuples.",
    optimalInsight:
      "Freeze len(queue) at the start of each level to know where that level ends.",
    helperSyntax: ["deque([root])", "for _ in range(len(q)):"],
    hints: [
      "How do you know where one level ends and the next begins?",
      "Freeze the queue size at the start of each level.",
    ],
    pitfalls: ["Iterating over len(q) while modifying q — freeze it into a variable"],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `from collections import deque

def levelOrder(root):
    if not root:
        return []
    res = []
    q = deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res`,
    recallQuestions: ["Why freeze len(q) into a local first?"],
    dayAssignment: 16,
    rememberThis: "BFS + level-size freeze.",
  },
  {
    id: "validate-bst",
    title: "Validate Binary Search Tree",
    patternId: "trees",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Pass lo/hi bounds down the recursion.",
    whyItMatters:
      "The classic 'only checking immediate children fails' lesson.",
    bruteForce: "In-order traversal and check it's strictly increasing.",
    optimalInsight:
      "Recurse with (lo, hi). Each node must satisfy lo < val < hi. Left subtree gets hi=val, right gets lo=val.",
    helperSyntax: ["def dfs(node, lo, hi):"],
    hints: [
      "Why isn't 'val > left.val and val < right.val' enough?",
      "You need bounds inherited from ancestors.",
    ],
    pitfalls: [
      "Using <= instead of < (depends on problem's equality rule)",
      "Forgetting to update only one bound per side",
    ],
    complexity: { time: "O(n)", space: "O(h)" },
    finalCode: `def isValidBST(root):
    def dfs(node, lo, hi):
        if not node:
            return True
        if not (lo < node.val < hi):
            return False
        return dfs(node.left, lo, node.val) and dfs(node.right, node.val, hi)
    return dfs(root, float('-inf'), float('inf'))`,
    recallQuestions: ["Why aren't local parent checks enough?"],
    dayAssignment: 17,
    rememberThis: "Pass (lo, hi) down. Only one bound tightens per side.",
  },

  // ---------- HEAP ----------
  {
    id: "kth-largest-element",
    title: "Kth Largest Element in an Array",
    patternId: "heap",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Bounded min-heap of size k.",
    whyItMatters:
      "The heap-pattern baseline you should be able to type instantly.",
    bruteForce: "Sort and index. O(n log n).",
    optimalInsight:
      "Keep a min-heap of size k. Push each element; when size > k, pop. The top is the k-th largest.",
    helperSyntax: ["heapq.heappush", "heapq.heappop", "h[0] to peek"],
    hints: ["Why is the min of a size-k max-set equal to the k-th largest?"],
    pitfalls: ["Letting the heap grow to size n"],
    complexity: { time: "O(n log k)", space: "O(k)" },
    finalCode: `import heapq

def findKthLargest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)
    return h[0]`,
    recallQuestions: ["Why bounded heap and not full sort?"],
    dayAssignment: 18,
    rememberThis: "Size-k min-heap. Top is the answer.",
  },
  {
    id: "last-stone-weight",
    title: "Last Stone Weight",
    patternId: "heap",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Max-heap simulated by negation.",
    whyItMatters:
      "Forces you to remember heapq has no max-heap — you negate.",
    bruteForce: "Sort repeatedly. O(n² log n).",
    optimalInsight: "Push negatives so heapq acts like a max-heap.",
    helperSyntax: ["heapq.heapify([-x for x in stones])"],
    hints: ["How do you fake a max-heap in Python?"],
    pitfalls: ["Forgetting to negate on pop as well as push"],
    complexity: { time: "O(n log n)", space: "O(n)" },
    finalCode: `import heapq

def lastStoneWeight(stones):
    h = [-s for s in stones]
    heapq.heapify(h)
    while len(h) > 1:
        a = -heapq.heappop(h)
        b = -heapq.heappop(h)
        if a != b:
            heapq.heappush(h, -(a - b))
    return -h[0] if h else 0`,
    recallQuestions: ["What's Python's max-heap trick?"],
    dayAssignment: 18,
    rememberThis: "Negate to max-heap. heapify in one call.",
  },
  {
    id: "k-closest-points",
    title: "K Closest Points to Origin",
    patternId: "heap",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Heap of tuples (key, value).",
    whyItMatters:
      "Teaches heapifying compound keys — the second real heap pattern.",
    bruteForce: "Sort by distance² — O(n log n).",
    optimalInsight:
      "Max-heap of size k over negative distance². Keep only the k nearest.",
    helperSyntax: ["heapq.heappush(h, (-d, [x, y]))"],
    hints: [
      "Don't take sqrt — squared distance is enough for comparison.",
    ],
    pitfalls: ["Taking sqrt and wasting cycles"],
    complexity: { time: "O(n log k)", space: "O(k)" },
    finalCode: `import heapq

def kClosest(points, k):
    h = []
    for x, y in points:
        d = -(x * x + y * y)
        heapq.heappush(h, (d, [x, y]))
        if len(h) > k:
            heapq.heappop(h)
    return [p for _, p in h]`,
    recallQuestions: ["Why squared distance?"],
    dayAssignment: 19,
    rememberThis: "Max-heap of size k, squared distance, no sqrt.",
  },

  // ---------- BACKTRACKING ----------
  {
    id: "subsets",
    title: "Subsets",
    patternId: "backtracking",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Pick/skip DFS.",
    whyItMatters: "The pick/skip template powers every subset problem.",
    bruteForce: "Same as optimal.",
    optimalInsight:
      "At index i, branch on pick vs skip. Leaf (i == n) appends a copy of path.",
    helperSyntax: ["res.append(path.copy())"],
    hints: ["Two branches per index: take it or don't."],
    pitfalls: ["Appending path without .copy() — every subset ends up identical"],
    complexity: { time: "O(n · 2ⁿ)", space: "O(n)" },
    finalCode: `def subsets(nums):
    res, path = [], []
    def dfs(i):
        if i == len(nums):
            res.append(path.copy())
            return
        path.append(nums[i])
        dfs(i + 1)
        path.pop()
        dfs(i + 1)
    dfs(0)
    return res`,
    recallQuestions: ["Why .copy()?"],
    dayAssignment: 20,
    rememberThis: "Pick / skip. Copy at the leaf. Always pop.",
  },
  {
    id: "combination-sum",
    title: "Combination Sum",
    patternId: "backtracking",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "DFS with an index to prevent duplicate combinations.",
    whyItMatters:
      "Shows the 'start index' trick for generating unique combinations.",
    bruteForce: "Pure recursion over all sequences then dedupe — explodes.",
    optimalInsight:
      "Recurse with start = i (not i+1) so you can re-use the same candidate.",
    helperSyntax: ["def dfs(start, remaining):"],
    hints: [
      "How do you prevent [2,2,3] and [2,3,2] both appearing?",
      "Pass `start` so each recursive call only considers later indices.",
    ],
    pitfalls: ["Passing i+1 when unlimited reuse is allowed"],
    complexity: { time: "Exponential", space: "O(target)" },
    finalCode: `def combinationSum(candidates, target):
    res, path = [], []
    def dfs(start, remaining):
        if remaining == 0:
            res.append(path.copy())
            return
        if remaining < 0:
            return
        for i in range(start, len(candidates)):
            path.append(candidates[i])
            dfs(i, remaining - candidates[i])
            path.pop()
    dfs(0, target)
    return res`,
    recallQuestions: ["Why dfs(i, ...) instead of dfs(i + 1, ...)?"],
    dayAssignment: 21,
    rememberThis: "Start index prevents dupes. Pass i for reuse.",
  },

  // ---------- GRAPHS ----------
  {
    id: "number-of-islands",
    title: "Number of Islands",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "DFS/BFS over a grid with visited tracking.",
    whyItMatters: "The first grid traversal. Sets up every connected-components problem.",
    bruteForce: "Union-Find also works but overkill here.",
    optimalInsight:
      "Scan the grid. On each unvisited '1', flood-fill it and increment the count.",
    helperSyntax: [
      "DIRS = ((1,0),(-1,0),(0,1),(0,-1))",
      "seen = set()",
      "deque([(r,c)])",
    ],
    hints: [
      "How do you avoid counting the same island twice?",
      "Mark visited on enqueue, not on dequeue.",
    ],
    pitfalls: [
      "Marking on pop (leads to queue duplication)",
      "Missing a bounds check before indexing grid[nr][nc]",
    ],
    complexity: { time: "O(rc)", space: "O(rc)" },
    finalCode: `from collections import deque

def numIslands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()
    DIRS = ((1,0),(-1,0),(0,1),(0,-1))

    def bfs(r, c):
        q = deque([(r, c)])
        seen.add((r, c))
        while q:
            x, y = q.popleft()
            for dx, dy in DIRS:
                nx, ny = x + dx, y + dy
                if (0 <= nx < rows and 0 <= ny < cols
                        and (nx, ny) not in seen
                        and grid[nx][ny] == "1"):
                    seen.add((nx, ny))
                    q.append((nx, ny))

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in seen:
                bfs(r, c)
                count += 1
    return count`,
    recallQuestions: ["Why mark visited on push and not on pop?"],
    dayAssignment: 22,
    rememberThis: "Scan grid. Flood-fill unvisited land. Mark on push.",
  },
  {
    id: "clone-graph",
    title: "Clone Graph",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "DFS with a hash map from original to clone.",
    whyItMatters:
      "The standard 'cache as you go' recursion trick for graphs.",
    bruteForce: "BFS with the same mapping dict — also clean.",
    optimalInsight:
      "Memoize old → new. On visit, create the clone, then recurse over neighbors and append their clones.",
    helperSyntax: ["clones = {}"],
    hints: ["What should `clones[original]` be before recursing to neighbors?"],
    pitfalls: ["Creating the clone *after* recursing → infinite loop"],
    complexity: { time: "O(V + E)", space: "O(V)" },
    finalCode: `def cloneGraph(node):
    if not node:
        return None
    clones = {}
    def dfs(n):
        if n in clones:
            return clones[n]
        copy = Node(n.val)
        clones[n] = copy
        for nei in n.neighbors:
            copy.neighbors.append(dfs(nei))
        return copy
    return dfs(node)`,
    recallQuestions: [
      "Why must you insert into the map before recursing?",
    ],
    dayAssignment: 23,
    rememberThis: "Memoize first, then recurse neighbors.",
  },
  {
    id: "rotting-oranges",
    title: "Rotting Oranges",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Multi-source BFS over a grid.",
    whyItMatters:
      "Teaches the 'seed the queue with every source at once' trick.",
    bruteForce: "Simulate one rot at a time.",
    optimalInsight:
      "Enqueue all initially-rotten cells at t=0. BFS layer by layer. Each layer = 1 minute.",
    helperSyntax: ["deque of (r, c, minute)"],
    hints: ["Seed the queue with *every* rotten orange up front."],
    pitfalls: [
      "Forgetting to check for any remaining fresh at the end (return -1)",
    ],
    complexity: { time: "O(rc)", space: "O(rc)" },
    finalCode: `from collections import deque

def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                q.append((r, c, 0))
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    DIRS = ((1,0),(-1,0),(0,1),(0,-1))
    while q:
        r, c, t = q.popleft()
        minutes = t
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                fresh -= 1
                q.append((nr, nc, t + 1))
    return minutes if fresh == 0 else -1`,
    recallQuestions: ["What does seeding the queue with all sources buy you?"],
    dayAssignment: 24,
    rememberThis: "Multi-source BFS. Seed every source at t=0.",
  },

  // ---------- DP ----------
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    patternId: "dp-1d",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Write a recurrence from a verbal description.",
    whyItMatters:
      "Your first DP. Doubles as a Fibonacci confidence check.",
    bruteForce: "Recursion with repeated subproblems.",
    optimalInsight: "dp[i] = dp[i-1] + dp[i-2]. Use rolling variables.",
    helperSyntax: ["a, b = 1, 1"],
    hints: ["At step i, how did you get here?"],
    pitfalls: ["Off-by-one on base cases"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def climbStairs(n):
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
    recallQuestions: ["What is dp[i] in plain English?"],
    dayAssignment: 25,
    rememberThis: "Fib with rolling a, b. Say dp[i] out loud first.",
  },
  {
    id: "house-robber",
    title: "House Robber",
    patternId: "dp-1d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Take-vs-skip recurrence.",
    whyItMatters: "Sets up the 'two-choice DP' template used in stock problems.",
    bruteForce: "Recursive pick/skip.",
    optimalInsight: "dp[i] = max(dp[i-1], dp[i-2] + nums[i]).",
    helperSyntax: ["rob1, rob2 = 0, 0"],
    hints: ["At house i, you either rob it or skip it. Pick the better one."],
    pitfalls: ["Updating variables in the wrong order"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def rob(nums):
    rob1, rob2 = 0, 0
    for n in nums:
        rob1, rob2 = rob2, max(rob2, rob1 + n)
    return rob2`,
    recallQuestions: ["Why does order matter in the rolling update?"],
    dayAssignment: 25,
    rememberThis: "Two-choice DP. Tuple-swap the roll.",
  },
  {
    id: "longest-increasing-subseq",
    title: "Longest Increasing Subsequence",
    patternId: "dp-1d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Inner loop over earlier indices.",
    whyItMatters:
      "The O(n²) version is the foundation for the O(n log n) patience sorting version.",
    bruteForce: "Exponential subsequence enumeration.",
    optimalInsight:
      "dp[i] = 1 + max(dp[j] for j < i if nums[j] < nums[i]), else 1.",
    helperSyntax: ["dp = [1] * n"],
    hints: ["What's dp[i] mean here? (longest LIS ending at i)"],
    pitfalls: ["Forgetting the 'ending at i' constraint — the answer is max(dp), not dp[-1]"],
    complexity: { time: "O(n²)", space: "O(n)" },
    finalCode: `def lengthOfLIS(nums):
    n = len(nums)
    dp = [1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
    recallQuestions: ["Why is the answer max(dp), not dp[-1]?"],
    dayAssignment: 26,
    rememberThis: "dp[i] = LIS ending at i. Answer is max(dp).",
  },

  // ---------- INTERVALS ----------
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    patternId: "intervals",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Sort + sweep.",
    whyItMatters: "Every interval problem starts with this sort-and-sweep.",
    bruteForce: "All-pairs overlap check — O(n²).",
    optimalInsight:
      "Sort by start. Walk intervals; if current overlaps the last merged, extend the end. Otherwise append.",
    helperSyntax: ["intervals.sort(key=lambda iv: iv[0])"],
    hints: ["What do you need to sort by?"],
    pitfalls: ["Forgetting < vs <= when deciding overlap (touch = merge here)"],
    complexity: { time: "O(n log n)", space: "O(n)" },
    finalCode: `def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
    recallQuestions: ["Why max(out[-1][1], e) and not just e?"],
    dayAssignment: 27,
    rememberThis: "Sort by start. Extend the tail or append.",
  },
  {
    id: "meeting-rooms",
    title: "Meeting Rooms",
    patternId: "intervals",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Check adjacency for overlap after sorting.",
    whyItMatters: "The trivial version of the rooms problem — muscle memory.",
    bruteForce: "All pairs.",
    optimalInsight:
      "Sort by start. If any neighbor overlaps the previous, fail.",
    helperSyntax: ["for i in range(1, n):"],
    hints: ["After sorting, you only need to compare adjacent pairs."],
    pitfalls: ["Using < vs <= depending on whether touching is allowed"],
    complexity: { time: "O(n log n)", space: "O(1)" },
    finalCode: `def canAttendMeetings(intervals):
    intervals.sort(key=lambda iv: iv[0])
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]:
            return False
    return True`,
    recallQuestions: ["Why is comparing adjacent pairs enough after sorting?"],
    dayAssignment: 27,
    rememberThis: "Sort by start. Adjacent overlap = fail.",
  },
];

export const PROBLEMS: Problem[] = [...PROBLEMS_BASE, ...PROBLEMS_EXTRA];

export const PROBLEM_MAP: Record<string, Problem> = Object.fromEntries(
  PROBLEMS.map((p) => [p.id, p]),
);

export const PROBLEMS_BY_PATTERN: Record<string, Problem[]> = PROBLEMS.reduce(
  (acc, p) => {
    (acc[p.patternId] ||= []).push(p);
    return acc;
  },
  {} as Record<string, Problem[]>,
);
