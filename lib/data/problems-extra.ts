import type { Problem } from "@/lib/types";

/**
 * Extended problem set — fills in the remaining Easy/Medium NeetCode 150
 * problems on top of the curated starter set in problems.ts. Content is
 * deliberately tight per entry so the dataset scales without turning the
 * app into a wall of text.
 */
export const PROBLEMS_EXTRA: Problem[] = [
  // ========== ARRAYS & HASHING (missing) ==========
  {
    id: "encode-decode-strings",
    title: "Encode and Decode Strings",
    patternId: "arrays-hashing",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Design a self-describing encoding.",
    whyItMatters:
      "Teaches you to prepend length as metadata — the core idea behind countless protocols.",
    bruteForce: "Escape a delimiter character — fragile to edge cases.",
    optimalInsight:
      "Prepend each word's length followed by '#' so decoding knows exactly how many characters to read next.",
    helperSyntax: ["len(word)", "str.find", "string slicing s[i:j]"],
    hints: [
      "What's a way to avoid ambiguity from delimiters?",
      "Store a length before each word.",
    ],
    pitfalls: ["Picking a delimiter that can appear in the input"],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def encode(strs):
    return ''.join(f"{len(s)}#{s}" for s in strs)

def decode(s):
    res, i = [], 0
    while i < len(s):
        j = s.find('#', i)
        length = int(s[i:j])
        res.append(s[j + 1 : j + 1 + length])
        i = j + 1 + length
    return res`,
    recallQuestions: ["Why encode length instead of using a delimiter?"],
    dayAssignment: 2,
    rememberThis: "Length + '#' prefix. Self-describing.",
  },
  {
    id: "valid-sudoku",
    title: "Valid Sudoku",
    patternId: "arrays-hashing",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Three sets per axis: rows, cols, boxes.",
    whyItMatters:
      "Classic 'three parallel hash sets' problem. Teaches you to encode a box index.",
    bruteForce: "Check each constraint independently three times.",
    optimalInsight:
      "One pass. For each cell, add to rows[r], cols[c], and boxes[(r//3, c//3)] — reject on duplicate.",
    helperSyntax: ["defaultdict(set)", "(r // 3, c // 3)"],
    hints: [
      "How do you index a 3×3 box from (r, c)?",
      "(r // 3, c // 3) is the canonical key.",
    ],
    pitfalls: ["Forgetting to skip '.' cells"],
    complexity: { time: "O(81)", space: "O(81)" },
    finalCode: `from collections import defaultdict

def isValidSudoku(board):
    rows = defaultdict(set)
    cols = defaultdict(set)
    boxes = defaultdict(set)
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == '.':
                continue
            box = (r // 3, c // 3)
            if v in rows[r] or v in cols[c] or v in boxes[box]:
                return False
            rows[r].add(v)
            cols[c].add(v)
            boxes[box].add(v)
    return True`,
    recallQuestions: ["How do you identify a 3x3 box from (r,c)?"],
    dayAssignment: 3,
    rememberThis: "Three sets. Box key is (r//3, c//3).",
  },
  {
    id: "longest-consecutive-sequence",
    title: "Longest Consecutive Sequence",
    patternId: "arrays-hashing",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Start-of-run detection via a set.",
    whyItMatters:
      "The 'only expand from the start of a run' trick keeps this at O(n).",
    bruteForce: "Sort then scan — O(n log n).",
    optimalInsight:
      "Put all nums in a set. A number is a run-start iff n-1 isn't in the set; from a run-start walk forward as long as n+1 is in the set.",
    helperSyntax: ["num_set = set(nums)", "while x + 1 in num_set:"],
    hints: [
      "How do you make sure you count each run once?",
      "Only expand from numbers that have no predecessor in the set.",
    ],
    pitfalls: [
      "Expanding from every number — turns it quadratic",
      "Using a list for membership",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def longestConsecutive(nums):
    num_set = set(nums)
    best = 0
    for n in num_set:
        if n - 1 not in num_set:
            length = 1
            while n + length in num_set:
                length += 1
            best = max(best, length)
    return best`,
    recallQuestions: ["Why only expand from n where n-1 isn't in the set?"],
    dayAssignment: 4,
    rememberThis: "Only expand from run-starts. Set membership is key.",
  },

  // ========== SLIDING WINDOW (missing) ==========
  {
    id: "permutation-in-string",
    title: "Permutation in String",
    patternId: "sliding-window",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Fixed-size window with Counter comparison.",
    whyItMatters:
      "Canonical fixed-size sliding window. Counter equality is the whole idea.",
    bruteForce: "Check every substring of s2 of length len(s1).",
    optimalInsight:
      "Slide a fixed-size window of size len(s1) over s2 and compare Counters each step.",
    helperSyntax: ["Counter(s1)", "window[s2[r]] += 1"],
    hints: [
      "What's the target state the window must match?",
      "Slide a fixed window of size len(s1).",
    ],
    pitfalls: ["Recomputing Counter from scratch each step"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `from collections import Counter

def checkInclusion(s1, s2):
    if len(s1) > len(s2):
        return False
    need = Counter(s1)
    window = Counter(s2[: len(s1)])
    if window == need:
        return True
    for r in range(len(s1), len(s2)):
        window[s2[r]] += 1
        window[s2[r - len(s1)]] -= 1
        if window[s2[r - len(s1)]] == 0:
            del window[s2[r - len(s1)]]
        if window == need:
            return True
    return False`,
    recallQuestions: ["Why is the window size fixed here?"],
    dayAssignment: 8,
    rememberThis: "Fixed-size window + Counter equality.",
  },

  // ========== STACK (missing) ==========
  {
    id: "eval-reverse-polish",
    title: "Evaluate Reverse Polish Notation",
    patternId: "stack",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Stack-driven expression evaluation.",
    whyItMatters:
      "One of the cleanest stack problems. Teaches order-of-operand care.",
    bruteForce: "Same as optimal; stack is already linear.",
    optimalInsight:
      "Push numbers. On an operator, pop b then a (order matters), compute, push the result.",
    helperSyntax: ["int(x)", "stack.pop()"],
    hints: [
      "What's the order you pop operands for non-commutative ops?",
    ],
    pitfalls: [
      "Popping a before b (reverses subtraction and division)",
      "Truncating division toward -inf instead of 0",
    ],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def evalRPN(tokens):
    stack = []
    for t in tokens:
        if t in "+-*/":
            b = stack.pop()
            a = stack.pop()
            if t == '+': stack.append(a + b)
            elif t == '-': stack.append(a - b)
            elif t == '*': stack.append(a * b)
            else: stack.append(int(a / b))
        else:
            stack.append(int(t))
    return stack[0]`,
    recallQuestions: ["Why int(a/b) and not a // b?"],
    dayAssignment: 10,
    rememberThis: "Pop b then a. int(a/b) for truncation.",
  },
  {
    id: "generate-parentheses",
    title: "Generate Parentheses",
    patternId: "stack",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Backtracking with balance invariants.",
    whyItMatters:
      "The canonical 'generate valid sequences' problem — shows up anywhere you need to respect nesting rules.",
    bruteForce: "Generate all 2^(2n) strings and filter.",
    optimalInsight:
      "Only emit '(' while open < n. Only emit ')' while close < open. Recurse.",
    helperSyntax: ["def dfs(open, close, cur):"],
    hints: [
      "What two counters decide which character you can append?",
      "close can only be added if close < open.",
    ],
    pitfalls: [
      "Letting close pass open (unbalanced)",
      "Using a list instead of a string for 'cur' and forgetting to pop",
    ],
    complexity: { time: "O(C_n)", space: "O(n)" },
    finalCode: `def generateParenthesis(n):
    res = []
    def dfs(open_, close_, cur):
        if len(cur) == 2 * n:
            res.append(cur)
            return
        if open_ < n:
            dfs(open_ + 1, close_, cur + '(')
        if close_ < open_:
            dfs(open_, close_ + 1, cur + ')')
    dfs(0, 0, '')
    return res`,
    recallQuestions: ["What stops us from adding too many ')'?"],
    dayAssignment: 10,
    rememberThis: "open ≤ n, close ≤ open. Recurse.",
  },
  {
    id: "car-fleet",
    title: "Car Fleet",
    patternId: "stack",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Monotonic stack on sorted starting positions.",
    whyItMatters:
      "The 'sort by position, sweep by arrival time' trick generalizes to scheduling problems.",
    bruteForce: "Simulate car by car.",
    optimalInsight:
      "Pair each car with its time-to-target. Sort by position descending. Walk backwards: a car joins the fleet ahead if its time is ≤ the fleet's time.",
    helperSyntax: ["sorted(zip(position, speed), reverse=True)"],
    hints: ["What determines whether two cars merge into one fleet?"],
    pitfalls: ["Comparing speeds instead of arrival times"],
    complexity: { time: "O(n log n)", space: "O(n)" },
    finalCode: `def carFleet(target, position, speed):
    pairs = sorted(zip(position, speed), reverse=True)
    fleets = 0
    last_time = 0
    for p, s in pairs:
        t = (target - p) / s
        if t > last_time:
            fleets += 1
            last_time = t
    return fleets`,
    recallQuestions: ["Why descending sort by position?"],
    dayAssignment: 10,
    rememberThis: "Sort by position desc. Fleet forms if t > last_time.",
  },

  // ========== BINARY SEARCH (missing) ==========
  {
    id: "search-2d-matrix",
    title: "Search a 2D Matrix",
    patternId: "binary-search",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Treat a sorted matrix as one flat array.",
    whyItMatters:
      "Shows the 'virtual flat array' trick that converts 2D problems to 1D binary search.",
    bruteForce: "Scan every cell — O(rc).",
    optimalInsight:
      "A row-sorted + first-of-next-row sorted matrix is equivalent to one sorted array of length r*c. Binary search with mid = divmod(mid, cols).",
    helperSyntax: ["mid // cols, mid % cols"],
    hints: ["Can you index a matrix as if it were a flat array?"],
    pitfalls: ["Mixing up mid // cols vs mid % cols"],
    complexity: { time: "O(log(rc))", space: "O(1)" },
    finalCode: `def searchMatrix(matrix, target):
    rows, cols = len(matrix), len(matrix[0])
    lo, hi = 0, rows * cols - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        val = matrix[mid // cols][mid % cols]
        if val == target:
            return True
        if val < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`,
    recallQuestions: ["How do you map a flat index to (row, col)?"],
    dayAssignment: 11,
    rememberThis: "Flat-index binary search with divmod(mid, cols).",
  },
  {
    id: "koko-eating-bananas",
    title: "Koko Eating Bananas",
    patternId: "binary-search",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Binary search on the answer space.",
    whyItMatters:
      "The classic 'binary search on rate' problem. First real exposure to parametric search.",
    bruteForce: "Try every speed 1..max.",
    optimalInsight:
      "Speed space is monotonic: if k works, k+1 works. Binary search lo=1, hi=max(piles) with an ok(k) predicate.",
    helperSyntax: ["math.ceil(pile / k)", "(pile + k - 1) // k"],
    hints: [
      "Is 'works' monotonic in k?",
      "Binary search on smallest k that works.",
    ],
    pitfalls: ["Using math.ceil with floats in tight loops"],
    complexity: { time: "O(n log max)", space: "O(1)" },
    finalCode: `def minEatingSpeed(piles, h):
    def hours(k):
        return sum((p + k - 1) // k for p in piles)
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours(mid) <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
    recallQuestions: ["Why is the answer space monotonic?"],
    dayAssignment: 11,
    rememberThis: "Binary search on rate. 'first true' template.",
  },
  {
    id: "time-based-kv-store",
    title: "Time Based Key-Value Store",
    patternId: "binary-search",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Binary search for largest timestamp ≤ target.",
    whyItMatters:
      "Binary search variant: find the last index where a predicate is true.",
    bruteForce: "Linear scan through timestamps.",
    optimalInsight:
      "Per-key list of (timestamp, value) is naturally sorted. Binary search for the rightmost t ≤ target.",
    helperSyntax: ["bisect.bisect_right"],
    hints: [
      "What's the largest timestamp ≤ target?",
      "That's bisect_right - 1.",
    ],
    pitfalls: ["Returning '' vs the found value on empty results"],
    complexity: { time: "O(log n)", space: "O(n)" },
    finalCode: `from collections import defaultdict
import bisect

class TimeMap:
    def __init__(self):
        self.store = defaultdict(list)  # key -> [(ts, value)]

    def set(self, key, value, timestamp):
        self.store[key].append((timestamp, value))

    def get(self, key, timestamp):
        arr = self.store[key]
        i = bisect.bisect_right(arr, (timestamp, chr(127)))
        return arr[i - 1][1] if i else ""`,
    recallQuestions: ["Why bisect_right - 1?"],
    dayAssignment: 12,
    rememberThis: "bisect_right gives insertion point. Minus 1 = largest ≤.",
  },

  // ========== LINKED LIST (missing) ==========
  {
    id: "reorder-list",
    title: "Reorder List",
    patternId: "linked-list",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Midpoint + reverse + merge.",
    whyItMatters:
      "Composes three basic linked-list ops — that composition is the real skill.",
    bruteForce: "Copy to an array and rebuild.",
    optimalInsight:
      "Find middle (fast/slow), reverse the second half, merge the two halves alternately.",
    helperSyntax: ["slow, fast = head, head", "prev, curr = None, head"],
    hints: [
      "Three steps: find middle, reverse tail, zip together.",
    ],
    pitfalls: ["Forgetting to cut the first half before reversing"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def reorderList(head):
    # 1. middle
    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None
    # 2. reverse second
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt
    # 3. merge
    first, second = head, prev
    while second:
        t1, t2 = first.next, second.next
        first.next = second
        second.next = t1
        first, second = t1, t2`,
    recallQuestions: ["What are the three sub-routines?"],
    dayAssignment: 13,
    rememberThis: "Middle, reverse, merge. Three classics in one.",
  },
  {
    id: "remove-nth-from-end",
    title: "Remove Nth Node From End of List",
    patternId: "linked-list",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Two-pointer with a fixed gap.",
    whyItMatters:
      "The 'advance fast by n, then walk together' pattern generalizes to many 'last k' problems.",
    bruteForce: "Count length first, then walk len-n steps.",
    optimalInsight:
      "Dummy head. Advance fast n+1 steps. Walk both until fast is None. Slow is at the predecessor of the target.",
    helperSyntax: ["dummy = ListNode(0, head)", "for _ in range(n+1):"],
    hints: [
      "How far ahead does fast need to be?",
      "Use a dummy head so edge cases disappear.",
    ],
    pitfalls: ["Off-by-one on the gap", "Not using a dummy head"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next
    return dummy.next`,
    recallQuestions: ["Why advance fast by n+1, not n?"],
    dayAssignment: 13,
    rememberThis: "Dummy + gap of n+1. Walk till fast is None.",
  },
  {
    id: "copy-list-random-pointer",
    title: "Copy List With Random Pointer",
    patternId: "linked-list",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Hash map from old node to new node.",
    whyItMatters:
      "Teaches the 'build the map first, wire pointers second' technique.",
    bruteForce: "Recursive clone with memoization — also fine.",
    optimalInsight:
      "Two passes. Pass 1: create clones and map old → new. Pass 2: wire next and random using the map.",
    helperSyntax: ["clones = {None: None}"],
    hints: ["Why do two passes help here?"],
    pitfalls: ["Forgetting to map None → None for dead pointers"],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def copyRandomList(head):
    clones = {None: None}
    curr = head
    while curr:
        clones[curr] = Node(curr.val)
        curr = curr.next
    curr = head
    while curr:
        clones[curr].next = clones[curr.next]
        clones[curr].random = clones[curr.random]
        curr = curr.next
    return clones[head]`,
    recallQuestions: ["Why seed the map with {None: None}?"],
    dayAssignment: 14,
    rememberThis: "Two passes. Build map, then wire.",
  },
  {
    id: "add-two-numbers",
    title: "Add Two Numbers",
    patternId: "linked-list",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Digit-by-digit addition with carry.",
    whyItMatters: "Fundamental 'schoolbook addition on pointers'.",
    bruteForce: "Convert to int, add, rebuild — fails on huge numbers.",
    optimalInsight:
      "Dummy head. Walk both lists, sum digits + carry, append a new node per step.",
    helperSyntax: ["carry, digit = divmod(total, 10)"],
    hints: ["Don't forget the trailing carry."],
    pitfalls: ["Missing the final carry node"],
    complexity: { time: "O(max(n,m))", space: "O(max(n,m))" },
    finalCode: `def addTwoNumbers(l1, l2):
    dummy = ListNode()
    tail = dummy
    carry = 0
    while l1 or l2 or carry:
        a = l1.val if l1 else 0
        b = l2.val if l2 else 0
        carry, digit = divmod(a + b + carry, 10)
        tail.next = ListNode(digit)
        tail = tail.next
        if l1: l1 = l1.next
        if l2: l2 = l2.next
    return dummy.next`,
    recallQuestions: ["Why include `or carry` in the loop condition?"],
    dayAssignment: 14,
    rememberThis: "divmod(sum, 10). Loop while any + carry.",
  },
  {
    id: "find-duplicate-number",
    title: "Find the Duplicate Number",
    patternId: "linked-list",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Floyd's cycle detection on an implicit linked list.",
    whyItMatters:
      "Mind-bending first exposure to 'the array is a linked list'.",
    bruteForce: "Set-based O(n) space — the interviewer usually forbids this.",
    optimalInsight:
      "Treat i → nums[i] as a pointer. Because a duplicate exists, the graph has a cycle; Floyd's algorithm finds its entry.",
    helperSyntax: ["slow = nums[slow]", "fast = nums[nums[fast]]"],
    hints: [
      "What if the array is a linked list in disguise?",
      "Phase 1: find the meeting point. Phase 2: walk from start and meeting at the same speed.",
    ],
    pitfalls: ["Forgetting the phase-2 reset"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def findDuplicate(nums):
    slow = fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow2 = nums[0]
    while slow != slow2:
        slow = nums[slow]
        slow2 = nums[slow2]
    return slow`,
    recallQuestions: ["Why does phase 2 find the cycle entry?"],
    dayAssignment: 14,
    rememberThis: "Array = linked list. Floyd's with reset for the entry.",
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    patternId: "linked-list",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 25,
    learningObjective: "Hash map + doubly linked list composition.",
    whyItMatters:
      "The most-asked design question. Teaches the combo that powers real caches.",
    bruteForce: "OrderedDict works in Python and is allowed.",
    optimalInsight:
      "Doubly-linked list gives O(1) move-to-front and pop-tail. Dict maps keys → nodes.",
    helperSyntax: ["OrderedDict()", "self.move_to_end(key)"],
    hints: ["What operations must be O(1)?"],
    pitfalls: ["Forgetting to update the pointer map on eviction"],
    complexity: { time: "O(1)", space: "O(capacity)" },
    finalCode: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.store = OrderedDict()

    def get(self, key):
        if key not in self.store:
            return -1
        self.store.move_to_end(key)
        return self.store[key]

    def put(self, key, value):
        if key in self.store:
            self.store.move_to_end(key)
        self.store[key] = value
        if len(self.store) > self.cap:
            self.store.popitem(last=False)`,
    recallQuestions: ["What does last=False do in popitem?"],
    dayAssignment: 14,
    rememberThis: "OrderedDict + move_to_end + popitem(last=False).",
  },

  // ========== TREES (missing) ==========
  {
    id: "diameter-binary-tree",
    title: "Diameter of Binary Tree",
    patternId: "trees",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Recursion that updates a nonlocal max.",
    whyItMatters:
      "Introduces the 'return one thing, update another' recursion shape.",
    bruteForce: "For each node compute depths — O(n²).",
    optimalInsight:
      "DFS returns height; at each node, update a running max with left_h + right_h.",
    helperSyntax: ["nonlocal best"],
    hints: ["What's the diameter at a single node in terms of its subtree heights?"],
    pitfalls: ["Confusing height with diameter"],
    complexity: { time: "O(n)", space: "O(h)" },
    finalCode: `def diameterOfBinaryTree(root):
    best = 0
    def depth(node):
        nonlocal best
        if not node:
            return 0
        l = depth(node.left)
        r = depth(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)
    depth(root)
    return best`,
    recallQuestions: ["Why is the best updated at every node?"],
    dayAssignment: 15,
    rememberThis: "Return height, update best = l + r.",
  },
  {
    id: "balanced-binary-tree",
    title: "Balanced Binary Tree",
    patternId: "trees",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Early-exit recursion with a sentinel.",
    whyItMatters:
      "Teaches the 'return -1 to mean invalid' sentinel trick.",
    bruteForce: "Compute height at every node — O(n²).",
    optimalInsight:
      "DFS returns height or -1. At each node, if either child is -1 or they differ by > 1, return -1.",
    helperSyntax: ["return -1"],
    hints: ["How do you bail out of a recursion once imbalance is found?"],
    pitfalls: ["Checking balance only at the root"],
    complexity: { time: "O(n)", space: "O(h)" },
    finalCode: `def isBalanced(root):
    def dfs(node):
        if not node:
            return 0
        l = dfs(node.left)
        r = dfs(node.right)
        if l == -1 or r == -1 or abs(l - r) > 1:
            return -1
        return 1 + max(l, r)
    return dfs(root) != -1`,
    recallQuestions: ["What does -1 signal?"],
    dayAssignment: 15,
    rememberThis: "-1 as sentinel for 'already invalid'.",
  },
  {
    id: "subtree-of-another",
    title: "Subtree of Another Tree",
    patternId: "trees",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Compose same-tree inside a DFS walk.",
    whyItMatters:
      "Teaches composition of recursive helpers — a recurring theme.",
    bruteForce: "Same as optimal for small trees.",
    optimalInsight:
      "Walk root. At each node, check isSameTree(node, sub).",
    helperSyntax: ["isSameTree helper"],
    hints: ["Reuse your isSameTree from earlier."],
    pitfalls: ["Not short-circuiting when one side matches"],
    complexity: { time: "O(n·m)", space: "O(h)" },
    finalCode: `def isSubtree(root, sub):
    def same(a, b):
        if not a and not b: return True
        if not a or not b: return False
        return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)
    if not root:
        return False
    if same(root, sub):
        return True
    return isSubtree(root.left, sub) or isSubtree(root.right, sub)`,
    recallQuestions: ["Which function calls which?"],
    dayAssignment: 15,
    rememberThis: "Walk root + same-tree compare at each node.",
  },
  {
    id: "lca-bst",
    title: "Lowest Common Ancestor of a BST",
    patternId: "trees",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Leverage the BST invariant to walk one path.",
    whyItMatters:
      "One of the simplest LCA variants thanks to BST ordering.",
    bruteForce: "General-tree LCA.",
    optimalInsight:
      "If both p,q < node, go left. If both > node, go right. Otherwise the current node is the LCA.",
    helperSyntax: ["while True:"],
    hints: ["What does 'p < node < q' mean geometrically?"],
    pitfalls: ["Treating it as a general tree"],
    complexity: { time: "O(h)", space: "O(1)" },
    finalCode: `def lowestCommonAncestor(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left
        elif p.val > root.val and q.val > root.val:
            root = root.right
        else:
            return root`,
    recallQuestions: ["Why does the BST invariant save us an O(n) DFS?"],
    dayAssignment: 15,
    rememberThis: "Split ranges. Return where the split happens.",
  },
  {
    id: "right-side-view",
    title: "Binary Tree Right Side View",
    patternId: "trees",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "BFS, keep the last node per level.",
    whyItMatters:
      "Teaches the 'last node in the level' trick on top of BFS.",
    bruteForce: "Same as optimal.",
    optimalInsight:
      "Level-order BFS; at each level, record the last popped value.",
    helperSyntax: ["for i in range(len(q)):"],
    hints: ["Which node per level should you record?"],
    pitfalls: ["Recording left child when right exists"],
    complexity: { time: "O(n)", space: "O(w)" },
    finalCode: `from collections import deque

def rightSideView(root):
    if not root:
        return []
    res, q = [], deque([root])
    while q:
        size = len(q)
        for i in range(size):
            node = q.popleft()
            if i == size - 1:
                res.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
    return res`,
    recallQuestions: ["How do you know which node is rightmost?"],
    dayAssignment: 16,
    rememberThis: "BFS, record last per level.",
  },
  {
    id: "count-good-nodes",
    title: "Count Good Nodes in Binary Tree",
    patternId: "trees",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "DFS that carries max-so-far.",
    whyItMatters:
      "Shows how to pass accumulated state through a recursion.",
    bruteForce: "Same as optimal.",
    optimalInsight:
      "DFS with max_so_far. A node is 'good' if its value ≥ max_so_far. Pass max(max_so_far, node.val) down.",
    helperSyntax: ["def dfs(node, max_so_far):"],
    hints: ["What state does each call need from its parent?"],
    pitfalls: ["Forgetting to update the max when recursing"],
    complexity: { time: "O(n)", space: "O(h)" },
    finalCode: `def goodNodes(root):
    def dfs(node, mx):
        if not node:
            return 0
        count = 1 if node.val >= mx else 0
        mx = max(mx, node.val)
        return count + dfs(node.left, mx) + dfs(node.right, mx)
    return dfs(root, float('-inf'))`,
    recallQuestions: ["What does each recursive call inherit?"],
    dayAssignment: 16,
    rememberThis: "Pass max_so_far down. Count on ≥.",
  },
  {
    id: "kth-smallest-bst",
    title: "Kth Smallest Element in a BST",
    patternId: "trees",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Iterative in-order traversal.",
    whyItMatters:
      "In-order on a BST = sorted order. Memorize the iterative template.",
    bruteForce: "Collect all values, sort, index.",
    optimalInsight:
      "Iterative in-order with an explicit stack. Stop when you've popped k elements.",
    helperSyntax: ["stack.append(node); node = node.left"],
    hints: ["What traversal order gives sorted output on a BST?"],
    pitfalls: ["Mutating k inside the loop wrong"],
    complexity: { time: "O(h + k)", space: "O(h)" },
    finalCode: `def kthSmallest(root, k):
    stack = []
    curr = root
    while stack or curr:
        while curr:
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        k -= 1
        if k == 0:
            return curr.val
        curr = curr.right`,
    recallQuestions: ["Why is in-order on a BST sorted?"],
    dayAssignment: 17,
    rememberThis: "In-order + stop at k.",
  },
  {
    id: "construct-tree-preorder-inorder",
    title: "Construct Binary Tree From Preorder and Inorder",
    patternId: "trees",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Slice preorder/inorder and recurse.",
    whyItMatters:
      "Classic 'reconstruct from traversals'. Index-map optimization is the upgrade.",
    bruteForce: "Slicing — clean but O(n²).",
    optimalInsight:
      "Preorder head is the root. Split inorder on its index. Recurse on the halves.",
    helperSyntax: ["inorder.index(root_val)"],
    hints: ["What's always true about preorder[0]?"],
    pitfalls: ["Slicing bounds off by one"],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def buildTree(preorder, inorder):
    idx = {v: i for i, v in enumerate(inorder)}
    self_i = [0]
    def build(lo, hi):
        if lo > hi:
            return None
        val = preorder[self_i[0]]
        self_i[0] += 1
        root = TreeNode(val)
        m = idx[val]
        root.left = build(lo, m - 1)
        root.right = build(m + 1, hi)
        return root
    return build(0, len(inorder) - 1)`,
    recallQuestions: ["Why precompute the value → index map?"],
    dayAssignment: 17,
    rememberThis: "Preorder picks root. Inorder splits halves.",
  },

  // ========== HEAP (missing) ==========
  {
    id: "kth-largest-stream",
    title: "Kth Largest Element in a Stream",
    patternId: "heap",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Maintain a bounded min-heap across adds.",
    whyItMatters:
      "Online variant of the bounded-heap pattern.",
    bruteForce: "Re-sort after every add.",
    optimalInsight:
      "Keep a heap of size k. On add, heappush then pop if over size. Top is the answer.",
    helperSyntax: ["heapq.heappush", "heapq.heappop"],
    hints: ["What's always at h[0] when the heap has size k?"],
    pitfalls: ["Letting the heap grow unbounded"],
    complexity: { time: "O(log k) per add", space: "O(k)" },
    finalCode: `import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.h = []
        for n in nums:
            self.add(n)

    def add(self, val):
        heapq.heappush(self.h, val)
        if len(self.h) > self.k:
            heapq.heappop(self.h)
        return self.h[0]`,
    recallQuestions: ["Why is the heap min and not max?"],
    dayAssignment: 18,
    rememberThis: "Size-k min-heap. Top is the answer.",
  },
  {
    id: "task-scheduler",
    title: "Task Scheduler",
    patternId: "heap",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Greedy with a max-heap and a cooldown queue.",
    whyItMatters:
      "Good example of combining a heap with a waiting queue.",
    bruteForce: "Simulate each tick naively.",
    optimalInsight:
      "Max-heap of remaining counts. Each tick pop, decrement, park in a cooldown queue. Release from queue back to heap when cooldown expires.",
    helperSyntax: ["heapq with negative counts", "deque of (ready_time, count)"],
    hints: [
      "What should the heap contain?",
      "Where do cooling-down tasks live?",
    ],
    pitfalls: ["Advancing time incorrectly"],
    complexity: { time: "O(n log 26)", space: "O(26)" },
    finalCode: `import heapq
from collections import Counter, deque

def leastInterval(tasks, n):
    counts = Counter(tasks)
    h = [-c for c in counts.values()]
    heapq.heapify(h)
    q = deque()  # (ready_time, count)
    time = 0
    while h or q:
        time += 1
        if h:
            c = heapq.heappop(h) + 1
            if c:
                q.append((time + n, c))
        if q and q[0][0] == time:
            heapq.heappush(h, q.popleft()[1])
    return time`,
    recallQuestions: ["Why negate counts when pushing to the heap?"],
    dayAssignment: 19,
    rememberThis: "Max-heap + cooldown deque. Time ticks per task.",
  },
  {
    id: "design-twitter",
    title: "Design Twitter",
    patternId: "heap",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 25,
    learningObjective: "Heap-merge K sorted per-user feeds.",
    whyItMatters:
      "Simplified social feed problem — real systems use the same idea.",
    bruteForce: "Global sort of all tweets from followees.",
    optimalInsight:
      "Per user, maintain a list of tweets (time, id). On getNewsFeed, heap-merge the followee lists and take top 10.",
    helperSyntax: [
      "defaultdict(list) for tweets",
      "defaultdict(set) for follows",
      "heapq.merge or size-bounded heap",
    ],
    hints: ["Each followee's tweets are already sorted by time."],
    pitfalls: [
      "Forgetting self-follow",
      "Not bounding the feed at 10",
    ],
    complexity: { time: "O(10 log F)", space: "O(n)" },
    finalCode: `from collections import defaultdict
import heapq

class Twitter:
    def __init__(self):
        self.time = 0
        self.tweets = defaultdict(list)   # uid -> list of (time, tid)
        self.follows = defaultdict(set)   # uid -> set(uids)

    def postTweet(self, uid, tid):
        self.time += 1
        self.tweets[uid].append((self.time, tid))

    def getNewsFeed(self, uid):
        self.follows[uid].add(uid)
        h = []
        for f in self.follows[uid]:
            for t, tid in self.tweets[f][-10:]:
                heapq.heappush(h, (-t, tid))
        return [heapq.heappop(h)[1] for _ in range(min(10, len(h)))]

    def follow(self, uid, target):
        self.follows[uid].add(target)

    def unfollow(self, uid, target):
        self.follows[uid].discard(target)`,
    recallQuestions: ["Why max-heap by time?"],
    dayAssignment: 19,
    rememberThis: "Merge followee feeds with a max-heap, cap at 10.",
  },

  // ========== BACKTRACKING (missing) ==========
  {
    id: "combination-sum-ii",
    title: "Combination Sum II",
    patternId: "backtracking",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Sort + skip duplicates at the same level.",
    whyItMatters:
      "First real encounter with dedupe-by-level in backtracking.",
    bruteForce: "Generate all combinations, dedupe with a set.",
    optimalInsight:
      "Sort. At each level, if candidates[i] == candidates[i-1] and i > start, skip.",
    helperSyntax: ["if i > start and c[i] == c[i-1]: continue"],
    hints: ["What differentiates 'same level' from 'deeper'?"],
    pitfalls: ["Skipping at depth instead of at level"],
    complexity: { time: "Exponential", space: "O(n)" },
    finalCode: `def combinationSum2(candidates, target):
    candidates.sort()
    res, path = [], []
    def dfs(start, remaining):
        if remaining == 0:
            res.append(path.copy())
            return
        for i in range(start, len(candidates)):
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            if candidates[i] > remaining:
                break
            path.append(candidates[i])
            dfs(i + 1, remaining - candidates[i])
            path.pop()
    dfs(0, target)
    return res`,
    recallQuestions: ["When is 'i > start' the right guard?"],
    dayAssignment: 20,
    rememberThis: "Sort. Skip dupes only when i > start.",
  },
  {
    id: "permutations",
    title: "Permutations",
    patternId: "backtracking",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Used-array or swap-in-place backtracking.",
    whyItMatters:
      "The most canonical permutation enumeration.",
    bruteForce: "itertools.permutations — forbidden, but shows the idea.",
    optimalInsight:
      "Maintain a 'used' boolean array. Recurse, pick an unused element, mark/unmark.",
    helperSyntax: ["used = [False] * n"],
    hints: ["How do you prevent reusing an element within one permutation?"],
    pitfalls: ["Forgetting to unmark used on backtrack"],
    complexity: { time: "O(n·n!)", space: "O(n)" },
    finalCode: `def permute(nums):
    res, path = [], []
    used = [False] * len(nums)
    def dfs():
        if len(path) == len(nums):
            res.append(path.copy())
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            path.append(x)
            dfs()
            path.pop()
            used[i] = False
    dfs()
    return res`,
    recallQuestions: ["Why used array instead of start index?"],
    dayAssignment: 20,
    rememberThis: "used[] array. Mark and unmark on backtrack.",
  },
  {
    id: "subsets-ii",
    title: "Subsets II",
    patternId: "backtracking",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Dedupe subsets with sorted + skip.",
    whyItMatters:
      "Variation on Subsets — tests whether the dedupe trick clicked.",
    bruteForce: "Generate all subsets, dedupe.",
    optimalInsight:
      "Sort. In the 'skip' branch, skip past all duplicates before recursing.",
    helperSyntax: ["while i + 1 < n and nums[i+1] == nums[i]: i += 1"],
    hints: ["Sort first. Then think about what makes a subset duplicate."],
    pitfalls: ["Skipping duplicates in the pick branch (wrong)"],
    complexity: { time: "O(n·2ⁿ)", space: "O(n)" },
    finalCode: `def subsetsWithDup(nums):
    nums.sort()
    res, path = [], []
    def dfs(i):
        res.append(path.copy())
        for j in range(i, len(nums)):
            if j > i and nums[j] == nums[j - 1]:
                continue
            path.append(nums[j])
            dfs(j + 1)
            path.pop()
    dfs(0)
    return res`,
    recallQuestions: ["Why sort first?"],
    dayAssignment: 20,
    rememberThis: "Sort. Skip dupes in the for-loop, not after the pick.",
  },
  {
    id: "word-search",
    title: "Word Search",
    patternId: "backtracking",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Backtracking on a grid with temporary marking.",
    whyItMatters:
      "Grid + backtracking combo — marker-and-restore is the core trick.",
    bruteForce: "Brute DFS from every cell.",
    optimalInsight:
      "DFS from each start. Temporarily overwrite the cell to block re-use, restore on return.",
    helperSyntax: ["board[r][c] = '#'", "board[r][c] = saved"],
    hints: [
      "How do you mark a cell 'used' without extra memory?",
      "Mutate and restore.",
    ],
    pitfalls: ["Forgetting to restore the cell"],
    complexity: { time: "O(mn·4^L)", space: "O(L)" },
    finalCode: `def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, i):
        if i == len(word):
            return True
        if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != word[i]:
            return False
        saved = board[r][c]
        board[r][c] = '#'
        found = any(dfs(r+dr, c+dc, i+1) for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)))
        board[r][c] = saved
        return found

    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0):
                return True
    return False`,
    recallQuestions: ["Why mutate instead of using a visited set?"],
    dayAssignment: 21,
    rememberThis: "Mark and restore. DFS from every start.",
  },
  {
    id: "palindrome-partitioning",
    title: "Palindrome Partitioning",
    patternId: "backtracking",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Backtrack with a palindrome check at each cut.",
    whyItMatters:
      "Hybrid of substring scanning and backtracking.",
    bruteForce: "Generate all partitions, filter.",
    optimalInsight:
      "At index start, for every end ≥ start, if s[start:end+1] is a palindrome, recurse with start=end+1.",
    helperSyntax: ["s[l:r+1] == s[l:r+1][::-1]"],
    hints: ["What's the recursion's boundary?"],
    pitfalls: ["Copying substrings too aggressively"],
    complexity: { time: "O(n·2ⁿ)", space: "O(n)" },
    finalCode: `def partition(s):
    res, path = [], []
    def is_pal(l, r):
        while l < r:
            if s[l] != s[r]: return False
            l += 1; r -= 1
        return True
    def dfs(start):
        if start == len(s):
            res.append(path.copy())
            return
        for end in range(start, len(s)):
            if is_pal(start, end):
                path.append(s[start : end + 1])
                dfs(end + 1)
                path.pop()
    dfs(0)
    return res`,
    recallQuestions: ["What's the base case?"],
    dayAssignment: 21,
    rememberThis: "Partition at each palindrome prefix, recurse on the rest.",
  },
  {
    id: "letter-combinations-phone",
    title: "Letter Combinations of a Phone Number",
    patternId: "backtracking",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Recursion over a mapping.",
    whyItMatters:
      "Cleanest 'cartesian product as recursion' problem.",
    bruteForce: "Nested loops with variable depth — awkward.",
    optimalInsight:
      "DFS over digits. At each level, iterate the letters for digits[i] and recurse.",
    helperSyntax: ["MAP = { '2': 'abc', ... }"],
    hints: ["What does each recursive call consume?"],
    pitfalls: ["Returning [''] vs [] for empty input"],
    complexity: { time: "O(4ⁿ)", space: "O(n)" },
    finalCode: `def letterCombinations(digits):
    if not digits:
        return []
    MAP = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}
    res = []
    def dfs(i, cur):
        if i == len(digits):
            res.append(cur)
            return
        for ch in MAP[digits[i]]:
            dfs(i + 1, cur + ch)
    dfs(0, '')
    return res`,
    recallQuestions: ["What does i represent?"],
    dayAssignment: 21,
    rememberThis: "DFS by digit index. Iterate letters at each level.",
  },

  // ========== TRIES ==========
  {
    id: "implement-trie",
    title: "Implement Trie (Prefix Tree)",
    patternId: "tries",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Build the canonical Trie data structure.",
    whyItMatters:
      "If you can't type a Trie cold, all Trie problems are out of reach.",
    bruteForce: "Store a set of words; O(n·k) per query.",
    optimalInsight:
      "Each node has a children dict and an is_word flag.",
    helperSyntax: ["self.children = {}", "self.is_word = False"],
    hints: ["Two operations: insert and search. Same walk."],
    pitfalls: ["Conflating 'prefix exists' with 'word exists'"],
    complexity: { time: "O(k) per op", space: "O(total chars)" },
    finalCode: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_word = True

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_word

    def startsWith(self, prefix):
        return self._walk(prefix) is not None

    def _walk(self, s):
        node = self.root
        for ch in s:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node`,
    recallQuestions: ["What distinguishes search from startsWith?"],
    dayAssignment: 0,
    rememberThis: "children dict + is_word flag. Same walk for everything.",
  },
  {
    id: "design-add-search-words",
    title: "Design Add and Search Words Data Structure",
    patternId: "tries",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Trie with wildcard search via DFS.",
    whyItMatters:
      "Introduces recursive search on a Trie — foundation for Word Search II.",
    bruteForce: "Regex across a word list.",
    optimalInsight:
      "Normal Trie for insertion. On search, if current char is '.', recurse into every child; otherwise descend the matching child.",
    helperSyntax: ["recursive dfs(node, i)"],
    hints: ["What changes about search when '.' appears?"],
    pitfalls: ["Returning False too early on '.' branches"],
    complexity: { time: "O(k · children^dots)", space: "O(n)" },
    finalCode: `class WordDictionary:
    def __init__(self):
        self.children = {}
        self.is_word = False

    def addWord(self, word):
        node = self
        for ch in word:
            node = node.children.setdefault(ch, WordDictionary())
        node.is_word = True

    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return node.is_word
            ch = word[i]
            if ch == '.':
                return any(dfs(c, i + 1) for c in node.children.values())
            if ch not in node.children:
                return False
            return dfs(node.children[ch], i + 1)
        return dfs(self, 0)`,
    recallQuestions: ["Why does '.' require DFS?"],
    dayAssignment: 0,
    rememberThis: "'.' = try every child. Otherwise normal walk.",
  },

  // ========== GRAPHS (missing) ==========
  {
    id: "max-area-island",
    title: "Max Area of Island",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "DFS with a return-count.",
    whyItMatters:
      "Adds 'return the size of the component' to the flood-fill template.",
    bruteForce: "Same as optimal.",
    optimalInsight:
      "DFS that returns 1 + sum of neighbor DFS results. Track running max.",
    helperSyntax: ["def dfs(r, c) -> int"],
    hints: ["How does your DFS return the size?"],
    pitfalls: ["Counting a cell twice by not marking visited"],
    complexity: { time: "O(rc)", space: "O(rc)" },
    finalCode: `def maxAreaOfIsland(grid):
    rows, cols = len(grid), len(grid[0])
    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != 1:
            return 0
        grid[r][c] = 0
        return 1 + dfs(r+1,c) + dfs(r-1,c) + dfs(r,c+1) + dfs(r,c-1)
    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                best = max(best, dfs(r, c))
    return best`,
    recallQuestions: ["Why mutate grid in place instead of a visited set?"],
    dayAssignment: 22,
    rememberThis: "DFS returns size. Track running max.",
  },
  {
    id: "walls-and-gates",
    title: "Walls and Gates",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Multi-source BFS from all gates at once.",
    whyItMatters:
      "Shows why starting BFS from sources is cheaper than DFS per empty cell.",
    bruteForce: "BFS from every empty room — O(rc·rc).",
    optimalInsight:
      "Seed the queue with every gate at distance 0. BFS outward, writing the distance into empty rooms as you go.",
    helperSyntax: ["INF = 2147483647"],
    hints: ["What goes into the queue first?"],
    pitfalls: ["Writing distances before checking for walls"],
    complexity: { time: "O(rc)", space: "O(rc)" },
    finalCode: `from collections import deque

def wallsAndGates(rooms):
    if not rooms:
        return
    rows, cols = len(rooms), len(rooms[0])
    q = deque()
    for r in range(rows):
        for c in range(cols):
            if rooms[r][c] == 0:
                q.append((r, c))
    while q:
        r, c = q.popleft()
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and rooms[nr][nc] == 2147483647:
                rooms[nr][nc] = rooms[r][c] + 1
                q.append((nr, nc))`,
    recallQuestions: ["Why multi-source BFS and not per-room BFS?"],
    dayAssignment: 22,
    rememberThis: "Seed every gate. BFS out. Write distance in place.",
  },
  {
    id: "pacific-atlantic",
    title: "Pacific Atlantic Water Flow",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "DFS from the border inward, then intersect.",
    whyItMatters:
      "The 'flip the search direction' insight is a huge generalizable trick.",
    bruteForce: "DFS from every cell — O((rc)²).",
    optimalInsight:
      "Start from Pacific and Atlantic borders, walk to cells with height ≥ current. Answer = intersection.",
    helperSyntax: ["pac, atl = set(), set()"],
    hints: ["What if you search from the ocean instead of from the land?"],
    pitfalls: ["Forgetting to flip the ≥ direction"],
    complexity: { time: "O(rc)", space: "O(rc)" },
    finalCode: `def pacificAtlantic(heights):
    rows, cols = len(heights), len(heights[0])
    pac, atl = set(), set()

    def dfs(r, c, visited, prev):
        if (r, c) in visited or r < 0 or r >= rows or c < 0 or c >= cols or heights[r][c] < prev:
            return
        visited.add((r, c))
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            dfs(r+dr, c+dc, visited, heights[r][c])

    for c in range(cols):
        dfs(0, c, pac, heights[0][c])
        dfs(rows-1, c, atl, heights[rows-1][c])
    for r in range(rows):
        dfs(r, 0, pac, heights[r][0])
        dfs(r, cols-1, atl, heights[r][cols-1])

    return list(pac & atl)`,
    recallQuestions: ["Why start from the ocean?"],
    dayAssignment: 22,
    rememberThis: "Two DFS sets from the border. Intersect at the end.",
  },
  {
    id: "surrounded-regions",
    title: "Surrounded Regions",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Mark-then-sweep: protect border, flip the rest.",
    whyItMatters:
      "Teaches the 'find what NOT to change' inversion.",
    bruteForce: "DFS from every O and check if it reaches a border — O((rc)²).",
    optimalInsight:
      "DFS from every border 'O' and mark safely. Then flip all remaining 'O' to 'X' and restore marks.",
    helperSyntax: ["board[r][c] = 'T'"],
    hints: [
      "Which Os are actually safe? Walk from the border.",
    ],
    pitfalls: ["Not restoring marked cells"],
    complexity: { time: "O(rc)", space: "O(rc)" },
    finalCode: `def solve(board):
    if not board:
        return
    rows, cols = len(board), len(board[0])
    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or board[r][c] != 'O':
            return
        board[r][c] = 'T'
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            dfs(r+dr, c+dc)
    for r in range(rows):
        dfs(r, 0); dfs(r, cols-1)
    for c in range(cols):
        dfs(0, c); dfs(rows-1, c)
    for r in range(rows):
        for c in range(cols):
            board[r][c] = 'O' if board[r][c] == 'T' else 'X'`,
    recallQuestions: ["What does 'T' stand for and why?"],
    dayAssignment: 23,
    rememberThis: "Mark safe Os, flip rest, restore marks.",
  },
  {
    id: "course-schedule",
    title: "Course Schedule",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Detect a cycle in a directed graph.",
    whyItMatters:
      "The 'can we topologically order this?' archetype.",
    bruteForce: "Repeated DFS without marking state — infinite loop on cycles.",
    optimalInsight:
      "DFS with three colors (unvisited / in-stack / done). A back edge to 'in-stack' is a cycle.",
    helperSyntax: ["state[c] = 1  # visiting"],
    hints: ["Two visited sets isn't enough — you need 'currently on stack'."],
    pitfalls: ["Using only 'visited' — can't detect back edges"],
    complexity: { time: "O(V + E)", space: "O(V + E)" },
    finalCode: `from collections import defaultdict

def canFinish(numCourses, prereqs):
    graph = defaultdict(list)
    for a, b in prereqs:
        graph[a].append(b)
    state = [0] * numCourses  # 0 unseen, 1 visiting, 2 done
    def dfs(c):
        if state[c] == 1: return False
        if state[c] == 2: return True
        state[c] = 1
        for nxt in graph[c]:
            if not dfs(nxt):
                return False
        state[c] = 2
        return True
    return all(dfs(c) for c in range(numCourses))`,
    recallQuestions: ["Why 3 states instead of 2?"],
    dayAssignment: 23,
    rememberThis: "3-color DFS. Back edge to 'visiting' = cycle.",
  },
  {
    id: "course-schedule-ii",
    title: "Course Schedule II",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Topological sort via Kahn's algorithm.",
    whyItMatters: "Classic topological sort template.",
    bruteForce: "Cycle detect + post-order stack.",
    optimalInsight:
      "Track indegrees. Queue up all zeros. Pop, append to order, decrement neighbors, enqueue new zeros.",
    helperSyntax: ["indeg = [0] * n", "deque([c for c in range(n) if indeg[c] == 0])"],
    hints: ["BFS starting from indegree-zero nodes."],
    pitfalls: ["Forgetting to compare len(order) to n for cycle detection"],
    complexity: { time: "O(V + E)", space: "O(V + E)" },
    finalCode: `from collections import defaultdict, deque

def findOrder(numCourses, prereqs):
    graph = defaultdict(list)
    indeg = [0] * numCourses
    for a, b in prereqs:
        graph[b].append(a)
        indeg[a] += 1
    q = deque(c for c in range(numCourses) if indeg[c] == 0)
    order = []
    while q:
        c = q.popleft()
        order.append(c)
        for nxt in graph[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return order if len(order) == numCourses else []`,
    recallQuestions: ["How does Kahn's detect a cycle?"],
    dayAssignment: 23,
    rememberThis: "Kahn's. Indegree zero first. Check len at end.",
  },
  {
    id: "graph-valid-tree",
    title: "Graph Valid Tree",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Tree = connected + exactly n-1 edges + no cycle.",
    whyItMatters:
      "One of the fastest 'two invariants check the whole problem' proofs.",
    bruteForce: "Full DFS with cycle detect.",
    optimalInsight:
      "A graph with n nodes is a tree iff it has n-1 edges and is connected.",
    helperSyntax: ["len(edges) == n - 1"],
    hints: [
      "Count edges vs nodes.",
      "Then do one BFS for connectivity.",
    ],
    pitfalls: ["Forgetting the edge count check"],
    complexity: { time: "O(V + E)", space: "O(V + E)" },
    finalCode: `from collections import defaultdict, deque

def validTree(n, edges):
    if len(edges) != n - 1:
        return False
    graph = defaultdict(list)
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    seen = {0}
    q = deque([0])
    while q:
        node = q.popleft()
        for nei in graph[node]:
            if nei not in seen:
                seen.add(nei)
                q.append(nei)
    return len(seen) == n`,
    recallQuestions: ["What are the two invariants?"],
    dayAssignment: 24,
    rememberThis: "n-1 edges + connected = tree.",
  },
  {
    id: "num-connected-components",
    title: "Number of Connected Components",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Union-Find primer.",
    whyItMatters:
      "Gentlest possible Union-Find intro.",
    bruteForce: "DFS over adjacency list works too.",
    optimalInsight:
      "Start with n components. Each successful union decrements. Use path compression.",
    helperSyntax: ["parent = list(range(n))", "find(x) with compression"],
    hints: ["Union-Find or adjacency DFS — both are accepted."],
    pitfalls: ["Forgetting path compression — still correct but slow"],
    complexity: { time: "O(E α(V))", space: "O(V)" },
    finalCode: `def countComponents(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    count = n
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            count -= 1
    return count`,
    recallQuestions: ["What does find's path compression do?"],
    dayAssignment: 24,
    rememberThis: "n - (successful unions) = components.",
  },
  {
    id: "redundant-connection",
    title: "Redundant Connection",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Union-Find to catch the cycle-forming edge.",
    whyItMatters:
      "The canonical use of Union-Find: detect the edge that closed a cycle.",
    bruteForce: "Remove each edge and check if still a tree — O(n²).",
    optimalInsight:
      "Walk edges in order. For each, union; if find(a) == find(b) already, this edge is the answer.",
    helperSyntax: ["if find(a) == find(b): return [a, b]"],
    hints: ["Which edge is the redundant one?"],
    pitfalls: ["Forgetting to return the edge that FAILED to union"],
    complexity: { time: "O(n α(n))", space: "O(n)" },
    finalCode: `def findRedundantConnection(edges):
    parent = list(range(len(edges) + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]
        parent[ra] = rb`,
    recallQuestions: ["Why return the edge where union fails?"],
    dayAssignment: 24,
    rememberThis: "First edge whose endpoints already share a root.",
  },
  {
    id: "network-delay-time",
    title: "Network Delay Time",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Dijkstra with a min-heap.",
    whyItMatters:
      "The canonical single-source shortest path with nonnegative weights.",
    bruteForce: "Bellman-Ford — O(VE).",
    optimalInsight:
      "Dijkstra: min-heap of (distance, node). Relax neighbors; ignore stale entries.",
    helperSyntax: ["heapq with (dist, node)"],
    hints: ["What data structure gives you the next closest unsettled node?"],
    pitfalls: ["Forgetting to check `if node in settled` on pop"],
    complexity: { time: "O(E log V)", space: "O(V + E)" },
    finalCode: `import heapq
from collections import defaultdict

def networkDelayTime(times, n, k):
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))
    dist = {}
    h = [(0, k)]
    while h:
        d, node = heapq.heappop(h)
        if node in dist:
            continue
        dist[node] = d
        for nxt, w in graph[node]:
            if nxt not in dist:
                heapq.heappush(h, (d + w, nxt))
    return max(dist.values()) if len(dist) == n else -1`,
    recallQuestions: ["Why skip nodes already in dist?"],
    dayAssignment: 24,
    rememberThis: "Dijkstra = min-heap by distance. Settle once.",
  },
  {
    id: "min-cost-connect-points",
    title: "Min Cost to Connect All Points",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Minimum spanning tree via Prim's.",
    whyItMatters:
      "MST is worth learning just for this exact problem shape.",
    bruteForce: "Build complete graph + Kruskal's.",
    optimalInsight:
      "Prim's from any starting point: repeatedly add the cheapest edge to an unvisited node.",
    helperSyntax: ["heapq with (cost, node)"],
    hints: ["Pick the cheapest edge that connects a new node."],
    pitfalls: ["Re-adding already-visited nodes"],
    complexity: { time: "O(n² log n)", space: "O(n)" },
    finalCode: `import heapq

def minCostConnectPoints(points):
    n = len(points)
    seen = set()
    h = [(0, 0)]
    total = 0
    while len(seen) < n:
        cost, i = heapq.heappop(h)
        if i in seen:
            continue
        seen.add(i)
        total += cost
        xi, yi = points[i]
        for j in range(n):
            if j not in seen:
                xj, yj = points[j]
                heapq.heappush(h, (abs(xi - xj) + abs(yi - yj), j))
    return total`,
    recallQuestions: ["Why skip if already seen?"],
    dayAssignment: 24,
    rememberThis: "Prim's: cheapest edge to unseen node.",
  },
  {
    id: "cheapest-flights-k-stops",
    title: "Cheapest Flights Within K Stops",
    patternId: "graphs",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 22,
    learningObjective: "Bellman-Ford with a k-relaxation cap.",
    whyItMatters:
      "The classic case where Dijkstra fails cleanly because of the hop constraint.",
    bruteForce: "DFS with pruning — often TLEs.",
    optimalInsight:
      "Bellman-Ford: relax edges k+1 times using a snapshot of the last distances.",
    helperSyntax: ["tmp = dist.copy()"],
    hints: ["Why doesn't naïve Dijkstra work?"],
    pitfalls: ["Relaxing on the in-progress array (off-by-one hops)"],
    complexity: { time: "O(k·E)", space: "O(V)" },
    finalCode: `def findCheapestPrice(n, flights, src, dst, k):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0
    for _ in range(k + 1):
        tmp = dist.copy()
        for u, v, w in flights:
            if dist[u] + w < tmp[v]:
                tmp[v] = dist[u] + w
        dist = tmp
    return dist[dst] if dist[dst] != INF else -1`,
    recallQuestions: ["Why relax on a snapshot?"],
    dayAssignment: 24,
    rememberThis: "Bellman-Ford, k+1 passes, snapshot relaxation.",
  },

  // ========== 1D DP (missing) ==========
  {
    id: "min-cost-climbing-stairs",
    title: "Min Cost Climbing Stairs",
    patternId: "dp-1d",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Two-state rolling DP.",
    whyItMatters: "A clean entry into 'rolling state' DP.",
    bruteForce: "Recursive, O(2ⁿ).",
    optimalInsight: "dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]).",
    helperSyntax: ["a, b = 0, 0"],
    hints: ["Only last two states matter."],
    pitfalls: ["Starting index confusion"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def minCostClimbingStairs(cost):
    a = b = 0
    for i in range(2, len(cost) + 1):
        a, b = b, min(b + cost[i - 1], a + cost[i - 2])
    return b`,
    recallQuestions: ["What does dp[i] mean here?"],
    dayAssignment: 25,
    rememberThis: "Only last two states. Rolling update.",
  },
  {
    id: "house-robber-ii",
    title: "House Robber II",
    patternId: "dp-1d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Split a circular problem into two linear subproblems.",
    whyItMatters:
      "Teaches the 'cut the cycle' trick.",
    bruteForce: "Try all subsets.",
    optimalInsight:
      "Max(rob(nums[:-1]), rob(nums[1:])). Use House Robber I as a helper.",
    helperSyntax: ["nums[:-1]"],
    hints: ["How do you avoid robbing both first and last?"],
    pitfalls: ["Handling n=1 separately"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def rob(nums):
    def helper(arr):
        a, b = 0, 0
        for n in arr:
            a, b = b, max(b, a + n)
        return b
    if len(nums) == 1:
        return nums[0]
    return max(helper(nums[:-1]), helper(nums[1:]))`,
    recallQuestions: ["Why run helper twice?"],
    dayAssignment: 25,
    rememberThis: "Circular → two linear runs. Drop first or last.",
  },
  {
    id: "longest-palindromic-substring",
    title: "Longest Palindromic Substring",
    patternId: "dp-1d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Expand around center.",
    whyItMatters:
      "Expand-around-center is more memorable and often cleaner than 2D DP.",
    bruteForce: "Check every substring — O(n³).",
    optimalInsight:
      "For each center (2n-1 of them), expand while characters match.",
    helperSyntax: ["def expand(l, r)"],
    hints: ["How many centers are there?"],
    pitfalls: ["Forgetting even-length palindromes"],
    complexity: { time: "O(n²)", space: "O(1)" },
    finalCode: `def longestPalindrome(s):
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return s[l + 1 : r]
    best = ''
    for i in range(len(s)):
        a = expand(i, i)
        b = expand(i, i + 1)
        for cand in (a, b):
            if len(cand) > len(best):
                best = cand
    return best`,
    recallQuestions: ["Why two calls per center?"],
    dayAssignment: 25,
    rememberThis: "Expand from each center. Odd + even.",
  },
  {
    id: "palindromic-substrings",
    title: "Palindromic Substrings",
    patternId: "dp-1d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Expand-from-center counting.",
    whyItMatters:
      "Same template as longest palindrome with a counter instead of best.",
    bruteForce: "Check all substrings — O(n³).",
    optimalInsight:
      "Same expand-around-center but counting every success.",
    helperSyntax: ["count += 1 on every valid expand"],
    hints: ["How many centers?"],
    pitfalls: ["Double-counting"],
    complexity: { time: "O(n²)", space: "O(1)" },
    finalCode: `def countSubstrings(s):
    count = 0
    def expand(l, r):
        nonlocal count
        while l >= 0 and r < len(s) and s[l] == s[r]:
            count += 1
            l -= 1
            r += 1
    for i in range(len(s)):
        expand(i, i)
        expand(i, i + 1)
    return count`,
    recallQuestions: ["Is this the same template as before?"],
    dayAssignment: 25,
    rememberThis: "Count instead of best. Same expand template.",
  },
  {
    id: "decode-ways",
    title: "Decode Ways",
    patternId: "dp-1d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "1D DP with a two-digit lookback.",
    whyItMatters: "Teaches validating DP transitions carefully.",
    bruteForce: "Recursive with memo.",
    optimalInsight:
      "dp[i] = dp[i-1] if s[i-1] is a valid single + dp[i-2] if s[i-2..i-1] is a valid double.",
    helperSyntax: ["if s[i-1] != '0'", "if 10 <= int(s[i-2:i]) <= 26"],
    hints: ["Two valid predecessors: 1-digit or 2-digit."],
    pitfalls: ["Mishandling leading zeros"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def numDecodings(s):
    if not s or s[0] == '0':
        return 0
    a, b = 1, 1
    for i in range(1, len(s)):
        cur = 0
        if s[i] != '0':
            cur += b
        two = int(s[i - 1 : i + 1])
        if 10 <= two <= 26:
            cur += a
        a, b = b, cur
    return b`,
    recallQuestions: ["When does a 2-digit transition fire?"],
    dayAssignment: 26,
    rememberThis: "Two predecessors: 1-digit and 2-digit, watch zeros.",
  },
  {
    id: "coin-change",
    title: "Coin Change",
    patternId: "dp-1d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Unbounded knapsack minimum.",
    whyItMatters:
      "The clearest example of 1D unbounded knapsack.",
    bruteForce: "Recursive try-every-coin.",
    optimalInsight:
      "dp[a] = 1 + min(dp[a - c] for c in coins if c ≤ a), with dp[0] = 0.",
    helperSyntax: ["dp = [amount + 1] * (amount + 1)"],
    hints: ["What's the sentinel for 'impossible'?"],
    pitfalls: ["Using float('inf') and then comparing ints"],
    complexity: { time: "O(amount·len(coins))", space: "O(amount)" },
    finalCode: `def coinChange(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != amount + 1 else -1`,
    recallQuestions: ["Why amount+1 as sentinel?"],
    dayAssignment: 26,
    rememberThis: "dp[a] = min over coins of 1 + dp[a-c].",
  },
  {
    id: "maximum-product-subarray",
    title: "Maximum Product Subarray",
    patternId: "dp-1d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Track running min AND max.",
    whyItMatters:
      "Shows how negatives force a two-state DP.",
    bruteForce: "Check every subarray.",
    optimalInsight:
      "A big negative × current negative becomes a big positive — track both min and max.",
    helperSyntax: ["cur_max, cur_min = max(x, ...), min(x, ...)"],
    hints: ["Why isn't one running max enough?"],
    pitfalls: ["Swapping min and max after a negative"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def maxProduct(nums):
    cur_max = cur_min = best = nums[0]
    for x in nums[1:]:
        if x < 0:
            cur_max, cur_min = cur_min, cur_max
        cur_max = max(x, cur_max * x)
        cur_min = min(x, cur_min * x)
        best = max(best, cur_max)
    return best`,
    recallQuestions: ["Why swap cur_max and cur_min on negatives?"],
    dayAssignment: 26,
    rememberThis: "Track min and max together. Swap on negative.",
  },
  {
    id: "word-break",
    title: "Word Break",
    patternId: "dp-1d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Boolean DP with a dictionary of words.",
    whyItMatters:
      "Classic 'string partitioning' DP.",
    bruteForce: "Recursion that re-slices at every position.",
    optimalInsight:
      "dp[i] = True if there exists j with dp[j] and s[j:i] in wordSet.",
    helperSyntax: ["dp = [False] * (n+1); dp[0] = True"],
    hints: ["What's dp[i]?"],
    pitfalls: ["Off-by-one on the slice bounds"],
    complexity: { time: "O(n²)", space: "O(n)" },
    finalCode: `def wordBreak(s, wordDict):
    words = set(wordDict)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return dp[len(s)]`,
    recallQuestions: ["What does dp[i] mean?"],
    dayAssignment: 26,
    rememberThis: "dp[i]: can s[:i] be segmented. Break on find.",
  },
  {
    id: "partition-equal-subset-sum",
    title: "Partition Equal Subset Sum",
    patternId: "dp-1d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "0/1 knapsack with a set of reachable sums.",
    whyItMatters:
      "Cleanest intro to subset-sum DP.",
    bruteForce: "Try every subset — 2ⁿ.",
    optimalInsight:
      "Target = total // 2 (fail if odd). Maintain a set of reachable sums; for each num, add num to each.",
    helperSyntax: ["reachable = {0}", "reachable |= {s + n for s in reachable}"],
    hints: ["Half the total is the goal."],
    pitfalls: ["Updating the set in place — iterate over a copy"],
    complexity: { time: "O(n · sum/2)", space: "O(sum/2)" },
    finalCode: `def canPartition(nums):
    total = sum(nums)
    if total % 2: return False
    target = total // 2
    reachable = {0}
    for n in nums:
        reachable |= {s + n for s in reachable if s + n <= target}
    return target in reachable`,
    recallQuestions: ["Why is odd total an immediate False?"],
    dayAssignment: 26,
    rememberThis: "Target = total/2. Set of reachable sums.",
  },

  // ========== 2D DP ==========
  {
    id: "unique-paths",
    title: "Unique Paths",
    patternId: "dp-2d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Classic 2D DP with row-compression.",
    whyItMatters:
      "The intro problem to 2D DP on a grid.",
    bruteForce: "Recursive counting — O(2^(m+n)).",
    optimalInsight:
      "dp[r][c] = dp[r-1][c] + dp[r][c-1]. Use a single row for O(m) space.",
    helperSyntax: ["row = [1] * n"],
    hints: ["Each cell is the sum of top and left."],
    pitfalls: ["Forgetting to init the first row/column to 1"],
    complexity: { time: "O(mn)", space: "O(n)" },
    finalCode: `def uniquePaths(m, n):
    row = [1] * n
    for _ in range(m - 1):
        new_row = [1] * n
        for c in range(1, n):
            new_row[c] = new_row[c - 1] + row[c]
        row = new_row
    return row[-1]`,
    recallQuestions: ["Why can we compress to one row?"],
    dayAssignment: 0,
    rememberThis: "top + left. One-row rolling.",
  },
  {
    id: "longest-common-subsequence",
    title: "Longest Common Subsequence",
    patternId: "dp-2d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "The LCS template.",
    whyItMatters:
      "LCS is a prerequisite for countless string DP problems.",
    bruteForce: "Recursive with memo.",
    optimalInsight:
      "dp[i][j] = 1 + dp[i-1][j-1] if chars match, else max(dp[i-1][j], dp[i][j-1]).",
    helperSyntax: ["dp = [[0]*(m+1) for _ in range(n+1)]"],
    hints: ["What does dp[i][j] mean?"],
    pitfalls: ["Off-by-one between dp index and string index"],
    complexity: { time: "O(nm)", space: "O(nm)" },
    finalCode: `def longestCommonSubsequence(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`,
    recallQuestions: ["What's the base row/column?"],
    dayAssignment: 0,
    rememberThis: "Match → diag + 1. Else → max(up, left).",
  },
  {
    id: "buy-sell-cooldown",
    title: "Best Time to Buy and Sell Stock With Cooldown",
    patternId: "dp-2d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "State-machine DP.",
    whyItMatters:
      "Introduces the 'which state am I in?' DP style.",
    bruteForce: "Recursive with (index, state).",
    optimalInsight:
      "Three states: holding, sold, resting. Transition between them using the price.",
    helperSyntax: ["hold, sold, rest = -inf, 0, 0"],
    hints: ["What are the minimal states to track?"],
    pitfalls: ["Using yesterday's sold for today's hold → double-count"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def maxProfit(prices):
    hold, sold, rest = float('-inf'), 0, 0
    for p in prices:
        prev_sold = sold
        sold = hold + p
        hold = max(hold, rest - p)
        rest = max(rest, prev_sold)
    return max(sold, rest)`,
    recallQuestions: ["Why three states?"],
    dayAssignment: 0,
    rememberThis: "State machine: hold, sold, rest.",
  },
  {
    id: "coin-change-ii",
    title: "Coin Change II",
    patternId: "dp-2d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Unbounded knapsack count.",
    whyItMatters:
      "The 'count the ways' variant of coin change — loop order matters.",
    bruteForce: "DFS + memo.",
    optimalInsight:
      "dp[a] = sum over coins of dp[a - c]. Outer loop over coins to avoid counting permutations.",
    helperSyntax: ["for c in coins: for a in range(c, amount+1):"],
    hints: ["Why does outer loop order matter?"],
    pitfalls: ["Swapping loop order — counts permutations, not combos"],
    complexity: { time: "O(amount·len(coins))", space: "O(amount)" },
    finalCode: `def change(amount, coins):
    dp = [0] * (amount + 1)
    dp[0] = 1
    for c in coins:
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]`,
    recallQuestions: ["Why is coin the outer loop?"],
    dayAssignment: 0,
    rememberThis: "Outer: coins. Inner: amounts. Combinations.",
  },
  {
    id: "target-sum",
    title: "Target Sum",
    patternId: "dp-2d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Reduce signed-sum to subset-sum.",
    whyItMatters:
      "A satisfying algebraic reduction that simplifies the DP.",
    bruteForce: "DFS over all +/- assignments.",
    optimalInsight:
      "Let P be subset picked as +. P - (total - P) = target → P = (total + target) / 2. Count subsets summing to P.",
    helperSyntax: ["dp = [0] * (P + 1); dp[0] = 1"],
    hints: ["Can you turn +/- into subset-sum?"],
    pitfalls: ["Forgetting to check divisibility and sign"],
    complexity: { time: "O(n · P)", space: "O(P)" },
    finalCode: `def findTargetSumWays(nums, target):
    total = sum(nums)
    if (total + target) % 2 or abs(target) > total:
        return 0
    P = (total + target) // 2
    dp = [0] * (P + 1)
    dp[0] = 1
    for n in nums:
        for a in range(P, n - 1, -1):
            dp[a] += dp[a - n]
    return dp[P]`,
    recallQuestions: ["Why iterate a downward?"],
    dayAssignment: 0,
    rememberThis: "Reduce to subset-sum at P = (total + target)/2.",
  },
  {
    id: "interleaving-string",
    title: "Interleaving String",
    patternId: "dp-2d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "2D DP on (i, j) index pairs.",
    whyItMatters:
      "Tests whether the 'define dp[i][j]' habit has locked in.",
    bruteForce: "Recursive with memo.",
    optimalInsight:
      "dp[i][j] = True if s3[i+j-1] matches s1[i-1] and dp[i-1][j], or s2[j-1] and dp[i][j-1].",
    helperSyntax: ["dp[0][0] = True"],
    hints: ["What do i and j count?"],
    pitfalls: ["Off-by-one on the s3 index"],
    complexity: { time: "O(nm)", space: "O(nm)" },
    finalCode: `def isInterleave(s1, s2, s3):
    if len(s1) + len(s2) != len(s3):
        return False
    n, m = len(s1), len(s2)
    dp = [[False] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = True
    for i in range(n + 1):
        for j in range(m + 1):
            if i and s1[i-1] == s3[i+j-1]:
                dp[i][j] |= dp[i-1][j]
            if j and s2[j-1] == s3[i+j-1]:
                dp[i][j] |= dp[i][j-1]
    return dp[n][m]`,
    recallQuestions: ["What's the invariant connecting i, j, and i+j?"],
    dayAssignment: 0,
    rememberThis: "dp[i][j] uses s3[i+j-1]. Match either s1 or s2.",
  },
  {
    id: "longest-increasing-path-matrix",
    title: "Longest Increasing Path in a Matrix",
    patternId: "dp-2d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "DFS + memoization on a grid.",
    whyItMatters:
      "Shows how memoization converts exponential DFS into linear DP.",
    bruteForce: "Plain DFS — exponential.",
    optimalInsight:
      "For each cell, DFS with memo. A move is valid only to a strictly-greater neighbor, so cycles are impossible.",
    helperSyntax: ["@lru_cache or memo dict"],
    hints: ["Why is there no cycle?"],
    pitfalls: ["Forgetting to memoize"],
    complexity: { time: "O(rc)", space: "O(rc)" },
    finalCode: `def longestIncreasingPath(matrix):
    rows, cols = len(matrix), len(matrix[0])
    memo = {}
    def dfs(r, c):
        if (r, c) in memo:
            return memo[(r, c)]
        best = 1
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        memo[(r, c)] = best
        return best
    return max(dfs(r, c) for r in range(rows) for c in range(cols))`,
    recallQuestions: ["Why are strictly-increasing paths acyclic?"],
    dayAssignment: 0,
    rememberThis: "DFS + memo. Strict increase = no cycle.",
  },
  {
    id: "distinct-subsequences",
    title: "Distinct Subsequences",
    patternId: "dp-2d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Counting DP over two strings.",
    whyItMatters:
      "A harder 2D DP that sharpens the transition intuition.",
    bruteForce: "Recursion with memo.",
    optimalInsight:
      "dp[i][j] = ways s[:i] forms t[:j]. Transition: dp[i-1][j] + (dp[i-1][j-1] if match).",
    helperSyntax: ["dp[0][0] = 1"],
    hints: ["What are the base cases?"],
    pitfalls: ["Forgetting dp[i][0] = 1 for all i"],
    complexity: { time: "O(nm)", space: "O(nm)" },
    finalCode: `def numDistinct(s, t):
    n, m = len(s), len(t)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        dp[i][0] = 1
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            dp[i][j] = dp[i-1][j]
            if s[i-1] == t[j-1]:
                dp[i][j] += dp[i-1][j-1]
    return dp[n][m]`,
    recallQuestions: ["Why is dp[i][0] = 1?"],
    dayAssignment: 0,
    rememberThis: "Skip always. Take only on match.",
  },
  {
    id: "edit-distance",
    title: "Edit Distance",
    patternId: "dp-2d",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Levenshtein distance template.",
    whyItMatters:
      "If you know edit distance, you know every string alignment DP.",
    bruteForce: "Recursive — 3ⁿ.",
    optimalInsight:
      "dp[i][j] = min(insert, delete, replace) + 1, or dp[i-1][j-1] if chars match.",
    helperSyntax: ["base case: dp[i][0] = i, dp[0][j] = j"],
    hints: ["Three operations = three predecessors."],
    pitfalls: ["Missing the base row/column"],
    complexity: { time: "O(nm)", space: "O(nm)" },
    finalCode: `def minDistance(word1, word2):
    n, m = len(word1), len(word2)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n + 1): dp[i][0] = i
    for j in range(m + 1): dp[0][j] = j
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[n][m]`,
    recallQuestions: ["What do the three predecessors represent?"],
    dayAssignment: 0,
    rememberThis: "Insert/delete/replace = up/left/diag + 1.",
  },

  // ========== GREEDY ==========
  {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    patternId: "greedy",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Kadane's algorithm.",
    whyItMatters:
      "The single most cited greedy/DP problem in interviews.",
    bruteForce: "All subarrays — O(n²).",
    optimalInsight:
      "Walk once. current = max(x, current + x). Track best.",
    helperSyntax: ["current = max(x, current + x)"],
    hints: ["Should you ever keep a negative prefix?"],
    pitfalls: ["Initializing best to 0 instead of nums[0]"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def maxSubArray(nums):
    best = current = nums[0]
    for x in nums[1:]:
        current = max(x, current + x)
        best = max(best, current)
    return best`,
    recallQuestions: ["Why max(x, current + x)?"],
    dayAssignment: 0,
    rememberThis: "Drop the prefix when it's hurting you.",
  },
  {
    id: "jump-game",
    title: "Jump Game",
    patternId: "greedy",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Track the furthest reachable index.",
    whyItMatters:
      "The canonical greedy reachability problem.",
    bruteForce: "DFS / DP — slower.",
    optimalInsight:
      "Walk forward. If i > reach, fail. Update reach = max(reach, i + nums[i]).",
    helperSyntax: ["reach = 0"],
    hints: ["What state do you need to carry?"],
    pitfalls: ["Checking reach < len(nums) instead of ≥"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def canJump(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + x)
    return True`,
    recallQuestions: ["What does reach mean at step i?"],
    dayAssignment: 0,
    rememberThis: "Running max reach. Fail if i > reach.",
  },
  {
    id: "jump-game-ii",
    title: "Jump Game II",
    patternId: "greedy",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "BFS-by-jumps greedy.",
    whyItMatters:
      "The 'level-by-level jumps' trick shows up in graph BFS generalizations.",
    bruteForce: "BFS over reachable indices.",
    optimalInsight:
      "Track current jump end and farthest reachable. Increment jumps when you cross the current end.",
    helperSyntax: ["current_end, farthest, jumps = 0, 0, 0"],
    hints: ["Treat each jump as a BFS level."],
    pitfalls: ["Counting a final jump into the last index"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def jump(nums):
    jumps = current_end = farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:
            jumps += 1
            current_end = farthest
    return jumps`,
    recallQuestions: ["Why stop at len(nums) - 1?"],
    dayAssignment: 0,
    rememberThis: "BFS by levels. Increment on reaching current_end.",
  },
  {
    id: "gas-station",
    title: "Gas Station",
    patternId: "greedy",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Single-pass reset on failure.",
    whyItMatters:
      "Satisfying proof: if total gas ≥ total cost, a valid start exists.",
    bruteForce: "Try every start — O(n²).",
    optimalInsight:
      "If sum(gas) < sum(cost), impossible. Otherwise walk once and reset start whenever tank goes negative.",
    helperSyntax: ["tank = 0; start = 0"],
    hints: ["What do you do when the tank goes negative?"],
    pitfalls: ["Not short-circuiting on total < 0"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def canCompleteCircuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    tank = 0
    start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            tank = 0
            start = i + 1
    return start`,
    recallQuestions: ["Why does one pass suffice?"],
    dayAssignment: 0,
    rememberThis: "Reset start on negative. Total dictates possibility.",
  },
  {
    id: "hand-of-straights",
    title: "Hand of Straights",
    patternId: "greedy",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Greedy from the smallest card.",
    whyItMatters:
      "Greedy + counter combo — powerful for grouping problems.",
    bruteForce: "Try all groupings.",
    optimalInsight:
      "Use a Counter. Repeatedly start a group at the smallest available card and decrement all k consecutive cards.",
    helperSyntax: ["sorted(counter.keys())"],
    hints: ["What's the only legal start for the smallest group?"],
    pitfalls: ["Sorting a list and not a counter — too slow on duplicates"],
    complexity: { time: "O(n log n)", space: "O(n)" },
    finalCode: `from collections import Counter

def isNStraightHand(hand, k):
    if len(hand) % k:
        return False
    counts = Counter(hand)
    for card in sorted(counts):
        if counts[card] > 0:
            need = counts[card]
            for i in range(k):
                if counts[card + i] < need:
                    return False
                counts[card + i] -= need
    return True`,
    recallQuestions: ["Why start from the smallest?"],
    dayAssignment: 0,
    rememberThis: "Smallest-first. Counter decrements by k.",
  },
  {
    id: "merge-triplets",
    title: "Merge Triplets to Form Target Triplet",
    patternId: "greedy",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Discard then merge.",
    whyItMatters:
      "Greedy with a pre-filter — shows how filtering first simplifies the logic.",
    bruteForce: "Try every combination.",
    optimalInsight:
      "Discard any triplet with a coordinate > target. Merge remaining with element-wise max. Must equal target.",
    helperSyntax: ["any(t[i] > target[i] for i in range(3))"],
    hints: ["What triplets can you safely ignore?"],
    pitfalls: ["Forgetting to check each coordinate was actually hit"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def mergeTriplets(triplets, target):
    got = [0, 0, 0]
    for t in triplets:
        if t[0] > target[0] or t[1] > target[1] or t[2] > target[2]:
            continue
        for i in range(3):
            got[i] = max(got[i], t[i])
    return got == target`,
    recallQuestions: ["Why is max-merge safe?"],
    dayAssignment: 0,
    rememberThis: "Filter first. Element-wise max. Compare.",
  },
  {
    id: "partition-labels",
    title: "Partition Labels",
    patternId: "greedy",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Use last-seen index to extend a window.",
    whyItMatters:
      "Beautiful greedy with a last-occurrence map.",
    bruteForce: "For each window try the largest extension.",
    optimalInsight:
      "Record last occurrence of each char. Walk and keep extending end to max(end, last[ch]). Close partition at i == end.",
    helperSyntax: ["last = {c: i for i, c in enumerate(s)}"],
    hints: ["What's the farthest you must extend the window?"],
    pitfalls: ["Off-by-one on the partition length"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def partitionLabels(s):
    last = {c: i for i, c in enumerate(s)}
    res = []
    start = end = 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            res.append(end - start + 1)
            start = i + 1
    return res`,
    recallQuestions: ["When do you close a partition?"],
    dayAssignment: 0,
    rememberThis: "Extend end to last[c]. Close at i == end.",
  },
  {
    id: "valid-parenthesis-string",
    title: "Valid Parenthesis String",
    patternId: "greedy",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Track a range of possible open counts.",
    whyItMatters:
      "Classic 'don't commit early' greedy. The lo/hi range trick generalizes.",
    bruteForce: "Try all replacements for *.",
    optimalInsight:
      "Track lo/hi of possible open counts. '(' bumps both, ')' drops both, '*' expands the range.",
    helperSyntax: ["lo, hi = 0, 0"],
    hints: ["Track the range of possible balances instead of one value."],
    pitfalls: ["Letting lo go below 0 (should clamp to 0)"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def checkValidString(s):
    lo, hi = 0, 0
    for ch in s:
        if ch == '(':
            lo += 1
            hi += 1
        elif ch == ')':
            lo -= 1
            hi -= 1
        else:
            lo -= 1
            hi += 1
        if hi < 0:
            return False
        lo = max(lo, 0)
    return lo == 0`,
    recallQuestions: ["Why clamp lo at 0?"],
    dayAssignment: 0,
    rememberThis: "Open-count range. Fail when hi < 0.",
  },

  // ========== INTERVALS (missing) ==========
  {
    id: "insert-interval",
    title: "Insert Interval",
    patternId: "intervals",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Merge with a single new interval.",
    whyItMatters:
      "A clean one-pass variant where the input is already sorted.",
    bruteForce: "Append and re-run merge.",
    optimalInsight:
      "Three phases: non-overlapping before, merge span, non-overlapping after.",
    helperSyntax: ["newInterval[0] = min(...)"],
    hints: ["Split the input into three groups relative to newInterval."],
    pitfalls: ["Reversing the two directional comparisons"],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def insert(intervals, newInterval):
    res = []
    i, n = 0, len(intervals)
    while i < n and intervals[i][1] < newInterval[0]:
        res.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= newInterval[1]:
        newInterval[0] = min(newInterval[0], intervals[i][0])
        newInterval[1] = max(newInterval[1], intervals[i][1])
        i += 1
    res.append(newInterval)
    while i < n:
        res.append(intervals[i]); i += 1
    return res`,
    recallQuestions: ["What are the three phases?"],
    dayAssignment: 27,
    rememberThis: "Before / merge / after.",
  },
  {
    id: "non-overlapping-intervals",
    title: "Non Overlapping Intervals",
    patternId: "intervals",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Sort by end, count overlaps.",
    whyItMatters:
      "The 'earliest deadline first' scheduling classic.",
    bruteForce: "Try every subset.",
    optimalInsight:
      "Sort by end. Accept an interval iff it starts after the last accepted's end. Count removals.",
    helperSyntax: ["intervals.sort(key=lambda iv: iv[1])"],
    hints: ["Why sort by end?"],
    pitfalls: ["Sorting by start — gives wrong minimum"],
    complexity: { time: "O(n log n)", space: "O(1)" },
    finalCode: `def eraseOverlapIntervals(intervals):
    intervals.sort(key=lambda iv: iv[1])
    removed = 0
    end = float('-inf')
    for s, e in intervals:
        if s >= end:
            end = e
        else:
            removed += 1
    return removed`,
    recallQuestions: ["Why sort by end, not start?"],
    dayAssignment: 27,
    rememberThis: "Earliest end first. Keep the greedy choice.",
  },
  {
    id: "meeting-rooms-ii",
    title: "Meeting Rooms II",
    patternId: "intervals",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Min-heap of ongoing end times.",
    whyItMatters:
      "Real scheduling problem. Min-heap is the simplest solution.",
    bruteForce: "Event-sweep with +/- 1 counters.",
    optimalInsight:
      "Sort by start. Min-heap of current rooms' end times. If the earliest-ending room ends before the new meeting, reuse it.",
    helperSyntax: ["heapq.heappush/heappop"],
    hints: ["What defines 'room is free'?"],
    pitfalls: ["Pushing without checking the heap top first"],
    complexity: { time: "O(n log n)", space: "O(n)" },
    finalCode: `import heapq

def minMeetingRooms(intervals):
    intervals.sort(key=lambda iv: iv[0])
    h = []
    for s, e in intervals:
        if h and h[0] <= s:
            heapq.heappop(h)
        heapq.heappush(h, e)
    return len(h)`,
    recallQuestions: ["What does the heap size represent?"],
    dayAssignment: 27,
    rememberThis: "Sort by start. Min-heap of end times. Size = rooms.",
  },

  // ========== MATH & GEOMETRY ==========
  {
    id: "happy-number",
    title: "Happy Number",
    patternId: "math-geometry",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Cycle detection on a transformation.",
    whyItMatters:
      "Shows Floyd's cycle detection in a non-linked-list setting.",
    bruteForce: "Loop with a seen-set.",
    optimalInsight:
      "Either seen-set or tortoise-and-hare on the transformation.",
    helperSyntax: ["sum(int(d)**2 for d in str(n))"],
    hints: ["What's the cycle if not 1?"],
    pitfalls: ["Forgetting to terminate on n == 1"],
    complexity: { time: "O(log n)", space: "O(1)" },
    finalCode: `def isHappy(n):
    def step(x):
        return sum(int(d) ** 2 for d in str(x))
    slow = n
    fast = step(n)
    while fast != 1 and slow != fast:
        slow = step(slow)
        fast = step(step(fast))
    return fast == 1`,
    recallQuestions: ["Why fast/slow?"],
    dayAssignment: 0,
    rememberThis: "Fast/slow on the digit-square transform.",
  },
  {
    id: "plus-one",
    title: "Plus One",
    patternId: "math-geometry",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 8,
    learningObjective: "Carry propagation from the rightmost digit.",
    whyItMatters:
      "Good warm-up for schoolbook arithmetic on arrays.",
    bruteForce: "Convert to int and back — fragile for huge numbers.",
    optimalInsight:
      "Walk from the right. Each 9 becomes 0; the first non-9 increments and returns.",
    helperSyntax: ["for i in range(len(digits) - 1, -1, -1):"],
    hints: ["What happens when every digit is 9?"],
    pitfalls: ["Forgetting to insert the leading 1 when all 9s"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def plusOne(digits):
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    return [1] + digits`,
    recallQuestions: ["What's the all-nines edge case?"],
    dayAssignment: 0,
    rememberThis: "Right-to-left. Leading 1 on all-9s.",
  },
  {
    id: "rotate-image",
    title: "Rotate Image",
    patternId: "math-geometry",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Transpose then reverse each row.",
    whyItMatters:
      "The 90° rotation identity is one of the most-asked matrix questions.",
    bruteForce: "Allocate a new matrix and copy.",
    optimalInsight:
      "In-place: swap across the diagonal (transpose) then reverse each row.",
    helperSyntax: ["m[i][j], m[j][i] = m[j][i], m[i][j]"],
    hints: ["Think of rotation as two simpler operations."],
    pitfalls: ["Iterating j from 0 undoes the transpose"],
    complexity: { time: "O(n²)", space: "O(1)" },
    finalCode: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()`,
    recallQuestions: ["What's the identity for a 90° clockwise rotation?"],
    dayAssignment: 0,
    rememberThis: "Transpose + reverse rows.",
  },
  {
    id: "spiral-matrix",
    title: "Spiral Matrix",
    patternId: "math-geometry",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Shrinking-boundary layer walk.",
    whyItMatters:
      "Tests disciplined index management under four-directional traversal.",
    bruteForce: "Track visited cells with a set.",
    optimalInsight:
      "Maintain top/bottom/left/right boundaries. Walk each side and shrink the boundary. Check exhaustion after every side.",
    helperSyntax: ["top, bottom, left, right"],
    hints: ["Walk right, down, left, up. Shrink after each."],
    pitfalls: ["Walking back over already-visited cells"],
    complexity: { time: "O(rc)", space: "O(rc)" },
    finalCode: `def spiralOrder(matrix):
    res = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            res.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):
            res.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1
    return res`,
    recallQuestions: ["Why the extra if-checks after right/down?"],
    dayAssignment: 0,
    rememberThis: "Four boundaries. Walk, shrink, check exhaustion.",
  },
  {
    id: "set-matrix-zeroes",
    title: "Set Matrix Zeroes",
    patternId: "math-geometry",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 18,
    learningObjective: "Use the first row/column as marker space.",
    whyItMatters:
      "Teaches the 'reuse existing space to avoid extra memory' pattern.",
    bruteForce: "Extra arrays for zero rows/cols.",
    optimalInsight:
      "Use row 0 and col 0 as marker space. Handle their own zeroing with two boolean flags.",
    helperSyntax: ["first_row_zero, first_col_zero"],
    hints: ["Where can you store 'this row/column needs zeroing'?"],
    pitfalls: ["Forgetting the two explicit flags for the markers themselves"],
    complexity: { time: "O(rc)", space: "O(1)" },
    finalCode: `def setZeroes(matrix):
    rows, cols = len(matrix), len(matrix[0])
    first_row = any(matrix[0][c] == 0 for c in range(cols))
    first_col = any(matrix[r][0] == 0 for r in range(rows))
    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][c] == 0:
                matrix[r][0] = 0
                matrix[0][c] = 0
    for r in range(1, rows):
        for c in range(1, cols):
            if matrix[r][0] == 0 or matrix[0][c] == 0:
                matrix[r][c] = 0
    if first_row:
        for c in range(cols):
            matrix[0][c] = 0
    if first_col:
        for r in range(rows):
            matrix[r][0] = 0`,
    recallQuestions: ["Why do the first row/col need special flags?"],
    dayAssignment: 0,
    rememberThis: "Row 0 and col 0 = marker space.",
  },
  {
    id: "pow-x-n",
    title: "Pow(x, n)",
    patternId: "math-geometry",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 12,
    learningObjective: "Fast exponentiation.",
    whyItMatters:
      "The classic divide-and-conquer recursion.",
    bruteForce: "Loop n times.",
    optimalInsight:
      "Even n: (x^(n/2))². Odd n: x · x^(n-1). Negative n: 1 / pow(x, -n).",
    helperSyntax: ["half = pow(x, n // 2)"],
    hints: ["Halve the exponent each step."],
    pitfalls: ["Handling negative n"],
    complexity: { time: "O(log n)", space: "O(log n)" },
    finalCode: `def myPow(x, n):
    if n < 0:
        x = 1 / x
        n = -n
    def helper(n):
        if n == 0:
            return 1
        half = helper(n // 2)
        return half * half * (x if n % 2 else 1)
    return helper(n)`,
    recallQuestions: ["What's the recurrence?"],
    dayAssignment: 0,
    rememberThis: "Halve the exponent. Multiply odd remainder.",
  },
  {
    id: "multiply-strings",
    title: "Multiply Strings",
    patternId: "math-geometry",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Schoolbook multiplication on digit arrays.",
    whyItMatters:
      "Arbitrary precision in a language that doesn't have it for free.",
    bruteForce: "Convert to int.",
    optimalInsight:
      "Result has at most n+m digits. At (i,j) the product contributes to positions i+j and i+j+1.",
    helperSyntax: ["result = [0] * (n + m)"],
    hints: ["Where does digit[i] * digit[j] go in the result?"],
    pitfalls: ["Forgetting to strip leading zeros (except one)"],
    complexity: { time: "O(nm)", space: "O(n+m)" },
    finalCode: `def multiply(num1, num2):
    if num1 == '0' or num2 == '0':
        return '0'
    n, m = len(num1), len(num2)
    res = [0] * (n + m)
    for i in range(n - 1, -1, -1):
        for j in range(m - 1, -1, -1):
            mul = int(num1[i]) * int(num2[j])
            p1, p2 = i + j, i + j + 1
            total = mul + res[p2]
            res[p2] = total % 10
            res[p1] += total // 10
    out = ''.join(map(str, res)).lstrip('0')
    return out or '0'`,
    recallQuestions: ["Which indices receive digit[i] * digit[j]?"],
    dayAssignment: 0,
    rememberThis: "i+j and i+j+1 receive the product.",
  },
  {
    id: "detect-squares",
    title: "Detect Squares",
    patternId: "math-geometry",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 20,
    learningObjective: "Counter + geometry iteration.",
    whyItMatters:
      "Tests counter-based design + a math observation.",
    bruteForce: "Check every pair of points.",
    optimalInsight:
      "For each existing diagonal point with |dx| == |dy|, multiply counts of the two corners.",
    helperSyntax: ["counts: Counter[(x, y)]"],
    hints: ["A square's diagonal tells you the other two corners."],
    pitfalls: ["Ignoring degenerate dx == 0 case"],
    complexity: { time: "O(n) per count", space: "O(n)" },
    finalCode: `from collections import Counter

class DetectSquares:
    def __init__(self):
        self.counts = Counter()
        self.points = []

    def add(self, point):
        self.counts[tuple(point)] += 1
        self.points.append(tuple(point))

    def count(self, point):
        px, py = point
        total = 0
        for x, y in self.points:
            if abs(px - x) != abs(py - y) or x == px or y == py:
                continue
            total += self.counts[(x, py)] * self.counts[(px, y)]
        return total`,
    recallQuestions: ["What two points complete a square given a diagonal?"],
    dayAssignment: 0,
    rememberThis: "Diagonal with |dx|=|dy|. Multiply corners.",
  },

  // ========== BIT MANIPULATION ==========
  {
    id: "single-number",
    title: "Single Number",
    patternId: "bit-manipulation",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 6,
    learningObjective: "XOR cancels duplicates.",
    whyItMatters:
      "The 'aha moment' for bit manipulation.",
    bruteForce: "Counter / set.",
    optimalInsight: "Reduce with XOR. Duplicates cancel; the single value remains.",
    helperSyntax: ["reduce or a ^= x"],
    hints: ["What's x ^ x?"],
    pitfalls: ["Starting the XOR at a non-zero sentinel"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def singleNumber(nums):
    result = 0
    for x in nums:
        result ^= x
    return result`,
    recallQuestions: ["Why does XOR work?"],
    dayAssignment: 0,
    rememberThis: "XOR everything. Duplicates cancel.",
  },
  {
    id: "number-of-1-bits",
    title: "Number of 1 Bits",
    patternId: "bit-manipulation",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 6,
    learningObjective: "n &= n - 1 trick.",
    whyItMatters:
      "Memorize the clear-lowest-set-bit idiom.",
    bruteForce: "Bit-by-bit shift.",
    optimalInsight:
      "n &= n - 1 clears the lowest set bit. Count how many times that fires.",
    helperSyntax: ["while n: n &= n - 1; count += 1"],
    hints: ["There's a trick that clears exactly one bit."],
    pitfalls: ["Not masking to 32 bits when needed"],
    complexity: { time: "O(k)", space: "O(1)" },
    finalCode: `def hammingWeight(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count`,
    recallQuestions: ["What does n & (n-1) do?"],
    dayAssignment: 0,
    rememberThis: "n &= n - 1. Count iterations.",
  },
  {
    id: "counting-bits",
    title: "Counting Bits",
    patternId: "bit-manipulation",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "DP with the n & (n-1) recurrence.",
    whyItMatters:
      "One of the few problems where bit-tricks meet DP.",
    bruteForce: "Call popcount on each.",
    optimalInsight:
      "dp[i] = dp[i & (i - 1)] + 1. Each i is one set-bit above a strictly smaller number.",
    helperSyntax: ["dp[i] = dp[i & (i - 1)] + 1"],
    hints: ["Can you express bits(i) in terms of bits(smaller)?"],
    pitfalls: ["Using i >> 1 instead (still works but less elegant)"],
    complexity: { time: "O(n)", space: "O(n)" },
    finalCode: `def countBits(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i & (i - 1)] + 1
    return dp`,
    recallQuestions: ["Why +1?"],
    dayAssignment: 0,
    rememberThis: "dp[i] = dp[i & (i-1)] + 1.",
  },
  {
    id: "reverse-bits",
    title: "Reverse Bits",
    patternId: "bit-manipulation",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Build the reversed number one bit at a time.",
    whyItMatters:
      "Fundamental bit-building with shifts.",
    bruteForce: "Convert to string and reverse.",
    optimalInsight:
      "For 32 iterations: res = (res << 1) | (n & 1); n >>= 1.",
    helperSyntax: ["res = (res << 1) | (n & 1)"],
    hints: ["Walk 32 bits, emit low bit of n, shift n."],
    pitfalls: ["Forgetting to iterate exactly 32 times"],
    complexity: { time: "O(32)", space: "O(1)" },
    finalCode: `def reverseBits(n):
    res = 0
    for _ in range(32):
        res = (res << 1) | (n & 1)
        n >>= 1
    return res`,
    recallQuestions: ["What does (res << 1) | bit do?"],
    dayAssignment: 0,
    rememberThis: "Shift res left, OR in n's low bit, shift n right.",
  },
  {
    id: "missing-number",
    title: "Missing Number",
    patternId: "bit-manipulation",
    difficulty: "Easy",
    inclusion: "core",
    estimatedMinutes: 8,
    learningObjective: "XOR-or-sum to find the missing element.",
    whyItMatters:
      "Same trick that powers Single Number, dressed up as arithmetic.",
    bruteForce: "Sort or use a set.",
    optimalInsight:
      "n(n+1)/2 - sum(nums). Or XOR indices with values.",
    helperSyntax: ["n * (n + 1) // 2"],
    hints: ["What formula gives the expected sum?"],
    pitfalls: ["Integer overflow in non-Python langs"],
    complexity: { time: "O(n)", space: "O(1)" },
    finalCode: `def missingNumber(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)`,
    recallQuestions: ["What's the XOR alternative?"],
    dayAssignment: 0,
    rememberThis: "Expected sum − actual sum.",
  },
  {
    id: "sum-of-two-integers",
    title: "Sum of Two Integers",
    patternId: "bit-manipulation",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 15,
    learningObjective: "Full adder loop with XOR and AND<<1.",
    whyItMatters:
      "Classic 'add without +' exercise; foundational.",
    bruteForce: "Use +.",
    optimalInsight:
      "a^b is sum without carry; (a&b)<<1 is the carry. Repeat until carry is 0.",
    helperSyntax: ["while b:", "a, b = a ^ b, (a & b) << 1"],
    hints: ["How do you split sum and carry into two pieces?"],
    pitfalls: ["Python ints don't wrap — need a 32-bit mask"],
    complexity: { time: "O(1)", space: "O(1)" },
    finalCode: `def getSum(a, b):
    mask = 0xFFFFFFFF
    MAX = 0x7FFFFFFF
    while b & mask:
        a, b = (a ^ b) & mask, ((a & b) << 1) & mask
    return a if a <= MAX else ~(a ^ mask)`,
    recallQuestions: ["Why mask to 32 bits in Python?"],
    dayAssignment: 0,
    rememberThis: "sum = a ^ b, carry = (a & b) << 1.",
  },
  {
    id: "reverse-integer",
    title: "Reverse Integer",
    patternId: "bit-manipulation",
    difficulty: "Medium",
    inclusion: "core",
    estimatedMinutes: 10,
    learningObjective: "Digit extraction with overflow checks.",
    whyItMatters:
      "Not really bit tricks — but it pairs with them in the same section.",
    bruteForce: "String reverse.",
    optimalInsight:
      "Peel digits off with divmod. Check for 32-bit overflow before each push.",
    helperSyntax: ["divmod(n, 10)"],
    hints: ["What's the overflow bound and when do you check?"],
    pitfalls: ["Off-by-one on the ±2³¹ bounds"],
    complexity: { time: "O(log n)", space: "O(1)" },
    finalCode: `def reverse(x):
    sign = -1 if x < 0 else 1
    x = abs(x)
    res = 0
    while x:
        x, d = divmod(x, 10)
        res = res * 10 + d
    res *= sign
    return res if -2**31 <= res <= 2**31 - 1 else 0`,
    recallQuestions: ["Why check after forming res?"],
    dayAssignment: 0,
    rememberThis: "Divmod 10 loop. Check 32-bit bounds.",
  },
];
