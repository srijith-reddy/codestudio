import type { Pattern } from "@/lib/types";

export const PATTERNS: Pattern[] = [
  {
    id: "arrays-hashing",
    name: "Arrays & Hashing",
    tagline: "Count, lookup, dedupe.",
    summary:
      "Hash maps and sets turn O(n²) scans into O(n) lookups. The first pattern to reach for when you hear 'count', 'duplicate', 'group', 'frequency', or 'seen before'.",
    triggers: [
      "count occurrences",
      "find duplicate",
      "group by something",
      "check membership",
      "frequency map",
      "anagram / permutation check",
    ],
    coreIdea:
      "Trade space for time. Use a dict or set to remember what you've seen so each lookup is O(1) instead of rescanning the array.",
    skeletonCode: `from collections import Counter, defaultdict

def solve(nums):
    seen = {}              # value -> index
    counts = Counter(nums) # value -> freq
    groups = defaultdict(list)

    for i, x in enumerate(nums):
        if x in seen:
            return [seen[x], i]
        seen[x] = i
    return []`,
    skeletonLines: [
      { code: "def solve(nums):", indent: 0, explain: "Start the function. nums is the list we're scanning." },
      { code: "seen = {}", indent: 1, explain: "Empty dict — our memory of what we've already seen." },
      { code: "for i, x in enumerate(nums):", indent: 1, explain: "Walk the list. i = position, x = value at that position." },
      { code: "if x in seen:", indent: 2, explain: "Have we seen this value before? Dict lookup is O(1)." },
      { code: "return [seen[x], i]", indent: 3, explain: "Yes — return the earlier index we stashed, plus the current one." },
      { code: "seen[x] = i", indent: 2, explain: "No — remember this value and where we found it." },
      { code: "return []", indent: 1, explain: "Fell off the end without a match." },
    ],
    helperSyntax: [
      "Counter(iterable)",
      "defaultdict(list) / defaultdict(int)",
      "dict.get(key, default)",
      "set() for O(1) membership",
      "enumerate(nums)",
    ],
    commonMistakes: [
      "Forgetting to record the current element before moving on",
      "Using a list for membership (O(n)) instead of a set",
      "Storing the value when you need the index (or vice versa)",
    ],
    difficultyFocus: ["Easy", "Medium"],
    masteryThreshold: 5,
    accent: "from-indigo-500/20 to-indigo-500/0",
    icon: "Hash",
    order: 1,
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    tagline: "Converge or chase.",
    summary:
      "Walk two indices through a (usually sorted) array to squeeze out O(n) answers without nested loops. Great for sum problems, palindromes, and in-place mutation.",
    triggers: [
      "sorted array",
      "pair with target sum",
      "palindrome check",
      "remove duplicates in place",
      "compare from both ends",
    ],
    coreIdea:
      "Two indices move towards each other (or in the same direction) based on a comparison, shrinking the search space by one every step.",
    skeletonCode: `def two_sum_sorted(nums, target):
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l, r]
        if s < target:
            l += 1
        else:
            r -= 1
    return []`,
    skeletonLines: [
      { code: "def two_sum_sorted(nums, target):", indent: 0, explain: "The input is already sorted — that's the whole reason this works." },
      { code: "l, r = 0, len(nums) - 1", indent: 1, explain: "Put one pointer at the start, one at the end." },
      { code: "while l < r:", indent: 1, explain: "Keep squeezing until the pointers meet." },
      { code: "s = nums[l] + nums[r]", indent: 2, explain: "Sum of the two current ends — our candidate." },
      { code: "if s == target:", indent: 2, explain: "Bullseye. Hand back the indices." },
      { code: "return [l, r]", indent: 3, explain: "Answer found — we're done." },
      { code: "if s < target:", indent: 2, explain: "Sum too small → need a bigger number → push l right." },
      { code: "l += 1", indent: 3, explain: "Move the left pointer one step right. Sorted array = larger value." },
      { code: "else:", indent: 2, explain: "Sum too big → need a smaller number → pull r left." },
      { code: "r -= 1", indent: 3, explain: "Move the right pointer one step left." },
      { code: "return []", indent: 1, explain: "Pointers met with no match. No pair exists." },
    ],
    helperSyntax: [
      "l, r = 0, len(nums) - 1",
      "while l < r:",
      "nums.sort() when input isn't sorted",
      "skip duplicates: while l < r and nums[l] == nums[l+1]: l += 1",
    ],
    commonMistakes: [
      "Forgetting to sort when the problem allows it",
      "Off-by-one on the while condition",
      "Not handling duplicates in 3-sum style problems",
    ],
    difficultyFocus: ["Easy", "Medium"],
    masteryThreshold: 4,
    accent: "from-sky-500/20 to-sky-500/0",
    icon: "ArrowLeftRight",
    order: 2,
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    tagline: "A subarray that breathes.",
    summary:
      "Maintain a window [l..r] that expands on the right and shrinks on the left while a condition holds. Turns 'longest/shortest subarray with property X' into O(n).",
    triggers: [
      "longest / shortest subarray",
      "contiguous elements",
      "at most K distinct",
      "fixed window of size k",
      "minimum window containing",
    ],
    coreIdea:
      "Right pointer adds elements. While the window is invalid, left pointer removes elements. Track the best answer on each valid step.",
    skeletonCode: `def longest_valid(s):
    l = 0
    best = 0
    state = {}  # whatever we track inside the window
    for r, ch in enumerate(s):
        # expand: include s[r]
        state[ch] = state.get(ch, 0) + 1

        while not_valid(state):
            # shrink: exclude s[l]
            state[s[l]] -= 1
            if state[s[l]] == 0:
                del state[s[l]]
            l += 1

        best = max(best, r - l + 1)
    return best`,
    skeletonLines: [
      { code: "def longest_valid(s):", indent: 0, explain: "Find the longest stretch of s that satisfies some rule." },
      { code: "l = 0", indent: 1, explain: "Left edge of the window starts at position 0." },
      { code: "best = 0", indent: 1, explain: "Best window length we've seen so far." },
      { code: "state = {}", indent: 1, explain: "Whatever we track INSIDE the window (e.g., char counts)." },
      { code: "for r, ch in enumerate(s):", indent: 1, explain: "Slide the right edge forward one character at a time." },
      { code: "state[ch] = state.get(ch, 0) + 1", indent: 2, explain: "Add the new character to our window state." },
      { code: "while not_valid(state):", indent: 2, explain: "If the window broke our rule, shrink from the left until it's valid." },
      { code: "state[s[l]] -= 1", indent: 3, explain: "Remove the leftmost character from our state." },
      { code: "if state[s[l]] == 0:", indent: 3, explain: "Count hit zero — that char is now fully out of the window." },
      { code: "del state[s[l]]", indent: 4, explain: "Delete the key so len(state) reflects reality." },
      { code: "l += 1", indent: 3, explain: "Advance the left edge by one." },
      { code: "best = max(best, r - l + 1)", indent: 2, explain: "Window is valid now — record its length if it's the new best." },
      { code: "return best", indent: 1, explain: "Longest valid window we ever saw." },
    ],
    helperSyntax: [
      "for r, ch in enumerate(s):",
      "state.get(ch, 0) + 1",
      "window length = r - l + 1",
      "while not_valid: shrink from l",
    ],
    commonMistakes: [
      "Shrinking with an if instead of a while",
      "Forgetting to delete a key when its count hits 0",
      "Updating best outside the valid branch",
    ],
    difficultyFocus: ["Easy", "Medium"],
    masteryThreshold: 4,
    accent: "from-emerald-500/20 to-emerald-500/0",
    icon: "Move",
    order: 3,
  },
  {
    id: "stack",
    name: "Stack",
    tagline: "Last-in, first-out logic.",
    summary:
      "Push what you might need to revisit, pop when you resolve it. The go-to for matching brackets, monotonic comparisons, and 'next greater' problems.",
    triggers: [
      "matching parentheses",
      "next greater / smaller element",
      "evaluate expression",
      "undo / redo order",
      "monotonic sequence",
    ],
    coreIdea:
      "A stack remembers the most-recent unresolved item. Monotonic stacks keep it sorted so each element is pushed and popped at most once → O(n).",
    skeletonCode: `def next_greater(nums):
    res = [-1] * len(nums)
    stack = []  # indices with decreasing values
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            j = stack.pop()
            res[j] = x
        stack.append(i)
    return res`,
    skeletonLines: [
      { code: "def next_greater(nums):", indent: 0, explain: "For each number, find the nearest bigger number to its right." },
      { code: "res = [-1] * len(nums)", indent: 1, explain: "Start with -1 — that's the default if nothing bigger is found." },
      { code: "stack = []", indent: 1, explain: "Stack holds indices that are STILL waiting for their answer." },
      { code: "for i, x in enumerate(nums):", indent: 1, explain: "Walk the array left to right." },
      { code: "while stack and nums[stack[-1]] < x:", indent: 2, explain: "While the top of the stack has a smaller value than x, x is its answer." },
      { code: "j = stack.pop()", indent: 3, explain: "Pop the unanswered index." },
      { code: "res[j] = x", indent: 3, explain: "Record x as j's 'next greater'." },
      { code: "stack.append(i)", indent: 2, explain: "Now x joins the stack waiting for its own answer." },
      { code: "return res", indent: 1, explain: "Anyone still on the stack had no greater element — they keep their -1." },
    ],
    helperSyntax: [
      "stack = []",
      "stack.append(x) / stack.pop()",
      "stack[-1] to peek",
      "while stack and <condition>:",
    ],
    commonMistakes: [
      "Forgetting the `stack and` guard before indexing stack[-1]",
      "Pushing values when you actually need indices",
      "Breaking monotonic invariant by pushing too eagerly",
    ],
    difficultyFocus: ["Easy", "Medium"],
    masteryThreshold: 3,
    accent: "from-amber-500/20 to-amber-500/0",
    icon: "Layers",
    order: 4,
  },
  {
    id: "binary-search",
    name: "Binary Search",
    tagline: "Halve the problem.",
    summary:
      "Not just for sorted lookups — binary search on the answer space is the real superpower. Whenever a predicate flips from False → True over a range, binary search applies.",
    triggers: [
      "sorted array",
      "O(log n) requirement",
      "find minimum value such that ...",
      "monotonic predicate",
      "rotated / partitioned array",
    ],
    coreIdea:
      "Maintain an invariant where the answer is always in [l, r]. Each iteration halves the range. Write with the 'first true' template to avoid off-by-ones.",
    skeletonCode: `def first_true(lo, hi, ok):
    # find the smallest x in [lo, hi] with ok(x) == True
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo  # == hi`,
    skeletonLines: [
      { code: "def first_true(lo, hi, ok):", indent: 0, explain: "Find the smallest x where ok(x) is True. The answer exists somewhere in [lo, hi]." },
      { code: "while lo < hi:", indent: 1, explain: "Shrink the range until it collapses to a single point." },
      { code: "mid = (lo + hi) // 2", indent: 2, explain: "Pick the middle. Integer division biases low — mid is never hi." },
      { code: "if ok(mid):", indent: 2, explain: "mid already satisfies the condition." },
      { code: "hi = mid", indent: 3, explain: "Answer is at mid OR earlier. Keep mid in play — set hi = mid (not mid - 1)." },
      { code: "else:", indent: 2, explain: "mid does not satisfy — answer is strictly after mid." },
      { code: "lo = mid + 1", indent: 3, explain: "Rule out mid and everything before it." },
      { code: "return lo", indent: 1, explain: "lo and hi have met — that's the first True." },
    ],
    helperSyntax: [
      "mid = (lo + hi) // 2",
      "while lo < hi:",
      "hi = mid  # when condition holds",
      "lo = mid + 1  # when it doesn't",
    ],
    commonMistakes: [
      "Mixing <= and < in the while condition",
      "Off-by-one on hi vs hi - 1",
      "Forgetting that mid is biased low with // 2",
    ],
    difficultyFocus: ["Easy", "Medium"],
    masteryThreshold: 3,
    accent: "from-fuchsia-500/20 to-fuchsia-500/0",
    icon: "SearchCode",
    order: 5,
  },
  {
    id: "linked-list",
    name: "Linked List",
    tagline: "Rewire, don't rebuild.",
    summary:
      "Most linked-list problems reduce to carefully moving two or three pointers and using a dummy head. Draw it on paper; resist rebuilding the list.",
    triggers: [
      "reverse a list",
      "detect cycle",
      "middle of list",
      "merge two lists",
      "remove nth from end",
    ],
    coreIdea:
      "Use a dummy node to avoid special-casing the head. Use fast/slow pointers for cycle + midpoint. Always save next before rewiring.",
    skeletonCode: `def reverse(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
    skeletonLines: [
      { code: "def reverse(head):", indent: 0, explain: "Flip all the next-pointers so the list runs the other way." },
      { code: "prev, curr = None, head", indent: 1, explain: "prev is what goes BEFORE curr in the new order. Starts as None." },
      { code: "while curr:", indent: 1, explain: "Walk until we fall off the end of the original list." },
      { code: "nxt = curr.next", indent: 2, explain: "SAVE next first — we're about to overwrite curr.next and can't lose the link." },
      { code: "curr.next = prev", indent: 2, explain: "Flip curr's pointer to point backwards." },
      { code: "prev = curr", indent: 2, explain: "Advance prev to curr." },
      { code: "curr = nxt", indent: 2, explain: "Advance curr to the saved next." },
      { code: "return prev", indent: 1, explain: "When curr is None, prev is the new head." },
    ],
    helperSyntax: [
      "dummy = ListNode(0, head)",
      "slow, fast = head, head",
      "while fast and fast.next:",
      "nxt = curr.next  # save before overwrite",
    ],
    commonMistakes: [
      "Losing the next pointer when rewiring",
      "Returning head when the new head is prev",
      "Forgetting the dummy node for merge-style problems",
    ],
    difficultyFocus: ["Easy", "Medium"],
    masteryThreshold: 3,
    accent: "from-rose-500/20 to-rose-500/0",
    icon: "Link2",
    order: 6,
  },
  {
    id: "trees",
    name: "Trees (DFS / BFS)",
    tagline: "Recurse or queue.",
    summary:
      "Most tree problems reduce to a traversal plus a recurrence. DFS with recursion handles depth/path questions; BFS with a deque handles level-order and shortest path.",
    triggers: [
      "traverse the tree",
      "depth / height",
      "path from root to leaf",
      "level-order",
      "lowest common ancestor",
    ],
    coreIdea:
      "Define what each recursive call returns (often the local answer). Combine children's answers into the parent's answer.",
    skeletonCode: `def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

from collections import deque
def level_order(root):
    res, q = [], deque([root] if root else [])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        res.append(level)
    return res`,
    skeletonLines: [
      { code: "def max_depth(root):", indent: 0, explain: "How deep is this tree?" },
      { code: "if not root:", indent: 1, explain: "Base case — an empty subtree has zero depth." },
      { code: "return 0", indent: 2, explain: "Return 0 so the parent call adds 1 for itself." },
      { code: "return 1 + max(max_depth(root.left), max_depth(root.right))", indent: 1, explain: "Depth here = 1 + depth of the deeper child." },
      { code: "", indent: 0, explain: "" },
      { code: "def level_order(root):", indent: 0, explain: "Return the values grouped by depth — that's BFS." },
      { code: "res, q = [], deque([root] if root else [])", indent: 1, explain: "Output list + a queue seeded with root (or empty if root is None)." },
      { code: "while q:", indent: 1, explain: "Keep processing until the queue dries up." },
      { code: "level = []", indent: 2, explain: "Collect this level's values here." },
      { code: "for _ in range(len(q)):", indent: 2, explain: "FREEZE the current level size — new pushes shouldn't leak into this loop." },
      { code: "node = q.popleft()", indent: 3, explain: "Pop from the front. FIFO = BFS." },
      { code: "level.append(node.val)", indent: 3, explain: "Record the node's value." },
      { code: "if node.left: q.append(node.left)", indent: 3, explain: "Enqueue the left child if it exists." },
      { code: "if node.right: q.append(node.right)", indent: 3, explain: "Same for the right child." },
      { code: "res.append(level)", indent: 2, explain: "One full level captured — stash it." },
      { code: "return res", indent: 1, explain: "List of lists, grouped by depth." },
    ],
    helperSyntax: [
      "if not root: return ...",
      "deque([root])",
      "for _ in range(len(q)):  # freeze level size",
      "return (answer_from_left, answer_from_right)",
    ],
    commonMistakes: [
      "Forgetting the base case for None",
      "Not freezing the level size in BFS",
      "Returning the wrong tuple shape from recursion",
    ],
    difficultyFocus: ["Easy", "Medium"],
    masteryThreshold: 5,
    accent: "from-green-500/20 to-green-500/0",
    icon: "GitBranch",
    order: 7,
  },
  {
    id: "heap",
    name: "Heap / Priority Queue",
    tagline: "Top-K without sorting.",
    summary:
      "When you need the k smallest/largest, a running median, or a scheduler, reach for heapq. Heaps give O(log n) push/pop with almost zero ceremony.",
    triggers: [
      "top K",
      "kth largest / smallest",
      "merge K sorted",
      "running median",
      "scheduling by earliest/largest",
    ],
    coreIdea:
      "Python's heapq is a min-heap. For max-heap, negate the key. Keep the heap bounded at k for O(n log k) top-K.",
    skeletonCode: `import heapq

def k_largest(nums, k):
    h = []
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)
    return sorted(h, reverse=True)`,
    skeletonLines: [
      { code: "import heapq", indent: 0, explain: "Python's heap library — operates on a list, treated as a min-heap." },
      { code: "", indent: 0, explain: "" },
      { code: "def k_largest(nums, k):", indent: 0, explain: "Return the k biggest numbers — without sorting the whole array." },
      { code: "h = []", indent: 1, explain: "Our heap lives in a plain list." },
      { code: "for x in nums:", indent: 1, explain: "Stream through every number." },
      { code: "heapq.heappush(h, x)", indent: 2, explain: "Add x. The smallest element bubbles to h[0]." },
      { code: "if len(h) > k:", indent: 2, explain: "Heap is over budget — we only want the top k." },
      { code: "heapq.heappop(h)", indent: 3, explain: "Throw out the smallest. What remains is still the top k so far." },
      { code: "return sorted(h, reverse=True)", indent: 1, explain: "At the end, h IS the k largest. Sort for a clean output." },
    ],
    helperSyntax: [
      "import heapq",
      "heapq.heappush(h, (priority, value))",
      "heapq.heappop(h)",
      "heapq.heapify(list)",
      "negate for max-heap: heappush(h, -x)",
    ],
    commonMistakes: [
      "Forgetting heapq is min-only",
      "Letting the heap grow unbounded when you only need top-K",
      "Pushing non-comparable tuples (strings vs ints)",
    ],
    difficultyFocus: ["Medium"],
    masteryThreshold: 3,
    accent: "from-orange-500/20 to-orange-500/0",
    icon: "Mountain",
    order: 8,
  },
  {
    id: "backtracking",
    name: "Backtracking",
    tagline: "Try, record, undo.",
    summary:
      "DFS over a decision tree. At each node you pick, recurse, then un-pick. Covers subsets, permutations, combinations, and word-search style problems.",
    triggers: [
      "all subsets / combinations",
      "permutations",
      "word search",
      "partition into groups",
      "N-queens / Sudoku",
    ],
    coreIdea:
      "Build the current state incrementally. When you hit a goal, record a copy. Always undo the last choice before returning so siblings see a clean state.",
    skeletonCode: `def subsets(nums):
    res, path = [], []
    def dfs(i):
        if i == len(nums):
            res.append(path.copy())
            return
        # pick nums[i]
        path.append(nums[i])
        dfs(i + 1)
        path.pop()
        # skip nums[i]
        dfs(i + 1)
    dfs(0)
    return res`,
    skeletonLines: [
      { code: "def subsets(nums):", indent: 0, explain: "Return every possible subset of nums." },
      { code: "res, path = [], []", indent: 1, explain: "res = final answers. path = the subset we're currently building." },
      { code: "def dfs(i):", indent: 1, explain: "Recursive helper. i = which element we're deciding about right now." },
      { code: "if i == len(nums):", indent: 2, explain: "Base case — we've made a decision for every element." },
      { code: "res.append(path.copy())", indent: 3, explain: "Snapshot the path. COPY — otherwise all results share one list and mutate together." },
      { code: "return", indent: 3, explain: "Back up one frame." },
      { code: "path.append(nums[i])", indent: 2, explain: "Choice 1: include nums[i] in the subset." },
      { code: "dfs(i + 1)", indent: 2, explain: "Recurse with the inclusion in place." },
      { code: "path.pop()", indent: 2, explain: "UNDO — restore path so the 'exclude' branch sees a clean state." },
      { code: "dfs(i + 1)", indent: 2, explain: "Choice 2: recurse WITHOUT nums[i]." },
      { code: "dfs(0)", indent: 1, explain: "Kick off the recursion at index 0." },
      { code: "return res", indent: 1, explain: "All 2^n subsets collected." },
    ],
    helperSyntax: [
      "res.append(path.copy())  # copy, not reference",
      "path.append(x) / path.pop()",
      "dfs(i + 1)",
      "used = [False] * n for permutations",
    ],
    commonMistakes: [
      "Appending path without copying — every result mutates together",
      "Forgetting to undo the last choice",
      "Recursing past the end of the input",
    ],
    difficultyFocus: ["Medium"],
    masteryThreshold: 3,
    accent: "from-purple-500/20 to-purple-500/0",
    icon: "Shuffle",
    order: 9,
  },
  {
    id: "graphs",
    name: "Graphs",
    tagline: "Islands, components, paths.",
    summary:
      "Grids are implicit graphs. Build an adjacency list for real graphs. BFS finds shortest unweighted paths; DFS finds components and cycles.",
    triggers: [
      "grid with connected cells",
      "number of islands / components",
      "shortest path in an unweighted graph",
      "clone / copy a graph",
      "detect cycle",
    ],
    coreIdea:
      "Mark visited. Explore neighbors. For grids, use 4-directional offsets and bounds checks. Convert edge lists to adjacency dicts.",
    skeletonCode: `from collections import defaultdict, deque

def num_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = set()
    def bfs(r, c):
        q = deque([(r, c)])
        seen.add((r, c))
        while q:
            x, y = q.popleft()
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
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
    skeletonLines: [
      { code: "from collections import defaultdict, deque", indent: 0, explain: "deque for BFS. defaultdict if we were building an adjacency list." },
      { code: "", indent: 0, explain: "" },
      { code: "def num_islands(grid):", indent: 0, explain: "Count connected groups of '1' cells in a 2D grid." },
      { code: "rows, cols = len(grid), len(grid[0])", indent: 1, explain: "Grab the grid dimensions once." },
      { code: "seen = set()", indent: 1, explain: "Track which cells we've already visited." },
      { code: "def bfs(r, c):", indent: 1, explain: "Flood-fill one island starting from (r, c)." },
      { code: "q = deque([(r, c)])", indent: 2, explain: "Queue seeded with the start cell." },
      { code: "seen.add((r, c))", indent: 2, explain: "Mark seen on PUSH, not pop — avoids duplicates in the queue." },
      { code: "while q:", indent: 2, explain: "Process until the queue is empty." },
      { code: "x, y = q.popleft()", indent: 3, explain: "Pop the next cell to expand." },
      { code: "for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):", indent: 3, explain: "Four neighbors: down, up, right, left." },
      { code: "nx, ny = x + dx, y + dy", indent: 4, explain: "Coordinates of the candidate neighbor." },
      { code: "if 0 <= nx < rows and 0 <= ny < cols and (nx,ny) not in seen and grid[nx][ny] == '1':", indent: 4, explain: "In bounds, unseen, and still land." },
      { code: "seen.add((nx, ny))", indent: 5, explain: "Mark before enqueuing." },
      { code: "q.append((nx, ny))", indent: 5, explain: "Add to the BFS frontier." },
      { code: "count = 0", indent: 1, explain: "Count of islands found." },
      { code: "for r in range(rows):", indent: 1, explain: "Sweep every cell of the grid." },
      { code: "for c in range(cols):", indent: 2, explain: "" },
      { code: "if grid[r][c] == '1' and (r, c) not in seen:", indent: 3, explain: "Land cell we haven't touched — that's a new island." },
      { code: "bfs(r, c)", indent: 4, explain: "Flood-fill the whole island." },
      { code: "count += 1", indent: 4, explain: "One more island bagged." },
      { code: "return count", indent: 1, explain: "Total connected components." },
    ],
    helperSyntax: [
      "defaultdict(list) for adjacency",
      "seen = set()",
      "deque([start])",
      "DIRS = ((1,0),(-1,0),(0,1),(0,-1))",
    ],
    commonMistakes: [
      "Marking visited on pop instead of push (leads to dupes in the queue)",
      "Skipping bounds check before grid access",
      "Using a list for visited instead of a set",
    ],
    difficultyFocus: ["Medium"],
    masteryThreshold: 4,
    accent: "from-cyan-500/20 to-cyan-500/0",
    icon: "Network",
    order: 10,
  },
  {
    id: "dp-1d",
    name: "1D Dynamic Programming",
    tagline: "Solve smaller, cache, climb.",
    summary:
      "When the answer at position i depends on a constant number of earlier positions, 1D DP collapses exponential recursion into an O(n) sweep.",
    triggers: [
      "count the ways to ...",
      "minimum cost to reach",
      "longest increasing / valid ...",
      "decision at each step",
      "fib-like recurrence",
    ],
    coreIdea:
      "Define dp[i] in one clear sentence. Write the recurrence. Handle base cases. Often you only need two variables instead of a full array.",
    skeletonCode: `def climb_stairs(n):
    # dp[i] = ways to reach step i
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
    skeletonLines: [
      { code: "def climb_stairs(n):", indent: 0, explain: "How many distinct ways to climb n stairs if each step is 1 or 2?" },
      { code: "a, b = 1, 1", indent: 1, explain: "a = ways to reach the previous step. b = ways to reach the current step. Both start at 1." },
      { code: "for _ in range(n):", indent: 1, explain: "Take n steps forward." },
      { code: "a, b = b, a + b", indent: 2, explain: "Shift the window: new 'previous' = old 'current'. New 'current' = sum of the two." },
      { code: "return a", indent: 1, explain: "After n iterations, a holds the answer." },
    ],
    helperSyntax: [
      "dp = [0] * (n + 1)",
      "dp[0], dp[1] = ...",
      "for i in range(2, n+1):",
      "a, b = b, a + b  # rolling",
    ],
    commonMistakes: [
      "Unclear dp[i] definition — always write it in English first",
      "Wrong base case",
      "Using O(n) space when O(1) rolling works",
    ],
    difficultyFocus: ["Easy", "Medium"],
    masteryThreshold: 3,
    accent: "from-violet-500/20 to-violet-500/0",
    icon: "TrendingUp",
    order: 11,
  },
  {
    id: "tries",
    name: "Tries",
    tagline: "Prefix tree power.",
    summary:
      "Tries are how you turn 'find all words with prefix X' from O(n·k) into O(k). The whole pattern is a TrieNode with a children dict and an isWord flag.",
    triggers: [
      "prefix matching",
      "autocomplete",
      "word dictionary",
      "many lookups by shared prefix",
      "word search across a board",
    ],
    coreIdea:
      "Each node stores children keyed by the next character and a flag for 'a word ends here'. Insert/search walk the same shape: descend by character, end on the flag.",
    skeletonCode: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_word = True

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_word`,
    skeletonLines: [
      { code: "class TrieNode:", indent: 0, explain: "One node in the prefix tree." },
      { code: "def __init__(self):", indent: 1, explain: "Constructor." },
      { code: "self.children = {}", indent: 2, explain: "Map from next character → child TrieNode." },
      { code: "self.is_word = False", indent: 2, explain: "Flag: does a complete word end at this node?" },
      { code: "", indent: 0, explain: "" },
      { code: "class Trie:", indent: 0, explain: "The trie itself — just holds the root." },
      { code: "def __init__(self):", indent: 1, explain: "" },
      { code: "self.root = TrieNode()", indent: 2, explain: "Empty root. Every word will hang off here." },
      { code: "", indent: 0, explain: "" },
      { code: "def insert(self, word):", indent: 1, explain: "Add a word to the trie." },
      { code: "node = self.root", indent: 2, explain: "Start walking from the root." },
      { code: "for ch in word:", indent: 2, explain: "Descend character by character." },
      { code: "if ch not in node.children:", indent: 3, explain: "No branch for this character yet." },
      { code: "node.children[ch] = TrieNode()", indent: 4, explain: "Create it." },
      { code: "node = node.children[ch]", indent: 3, explain: "Step into the child — it becomes the new 'current' node." },
      { code: "node.is_word = True", indent: 2, explain: "Mark the last node — 'a word ends here'." },
      { code: "", indent: 0, explain: "" },
      { code: "def search(self, word):", indent: 1, explain: "Is this word stored?" },
      { code: "node = self.root", indent: 2, explain: "Walk from the root again." },
      { code: "for ch in word:", indent: 2, explain: "Descend one character at a time." },
      { code: "if ch not in node.children:", indent: 3, explain: "Path doesn't exist — word isn't stored." },
      { code: "return False", indent: 4, explain: "" },
      { code: "node = node.children[ch]", indent: 3, explain: "Continue descent." },
      { code: "return node.is_word", indent: 2, explain: "Path exists — but it's a word only if the flag is set." },
    ],
    helperSyntax: [
      "TrieNode { children: dict, is_word: bool }",
      "node.children[ch] = TrieNode()",
      "for ch in word:",
    ],
    commonMistakes: [
      "Forgetting to set is_word = True at the leaf",
      "Treating prefix-found as word-found (they're different)",
      "Re-creating children when a key already exists",
    ],
    difficultyFocus: ["Medium"],
    masteryThreshold: 3,
    accent: "from-pink-500/20 to-pink-500/0",
    icon: "Type",
    order: 12,
  },
  {
    id: "intervals",
    name: "Intervals",
    tagline: "Sort, then sweep.",
    summary:
      "Almost every interval problem starts with sorting by start time and sweeping left→right, merging or counting as you go.",
    triggers: [
      "merge overlapping",
      "insert a new interval",
      "meeting rooms",
      "min conference rooms",
      "non-overlapping intervals",
    ],
    coreIdea:
      "Sort by start. Track the current merged interval (or a heap of end times for room counting). One pass is enough.",
    skeletonCode: `def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
    skeletonLines: [
      { code: "def merge(intervals):", indent: 0, explain: "Merge overlapping intervals into the fewest possible." },
      { code: "intervals.sort(key=lambda iv: iv[0])", indent: 1, explain: "Sort by start time — this is what makes the sweep work." },
      { code: "out = []", indent: 1, explain: "Result list we'll build up as we go." },
      { code: "for s, e in intervals:", indent: 1, explain: "Walk the sorted intervals one at a time." },
      { code: "if out and s <= out[-1][1]:", indent: 2, explain: "The current interval overlaps the last merged one." },
      { code: "out[-1][1] = max(out[-1][1], e)", indent: 3, explain: "Extend the last interval to cover both." },
      { code: "else:", indent: 2, explain: "No overlap — start a fresh interval." },
      { code: "out.append([s, e])", indent: 3, explain: "Add it to the output as-is." },
      { code: "return out", indent: 1, explain: "All intervals merged. Non-overlapping, sorted." },
    ],
    helperSyntax: [
      "intervals.sort(key=lambda iv: iv[0])",
      "out[-1][1] = max(out[-1][1], e)",
      "heapq for room counting",
    ],
    commonMistakes: [
      "Forgetting to sort",
      "Using < instead of <= when deciding overlap",
      "Mutating the input when the judge checks it",
    ],
    difficultyFocus: ["Medium"],
    masteryThreshold: 3,
    accent: "from-teal-500/20 to-teal-500/0",
    icon: "BarChart3",
    order: 13,
  }, // intervals
  {
    id: "dp-2d",
    name: "2D Dynamic Programming",
    tagline: "Grids, edits, subsequences.",
    summary:
      "When state depends on two dimensions — i and j over two strings, or row and column on a grid — the table is 2D. Same recipe: define dp[i][j] in plain English, write the recurrence, fill the table.",
    triggers: [
      "two strings, longest common ...",
      "edit distance",
      "grid path counting",
      "knapsack with capacity",
      "matching with backtracking",
    ],
    coreIdea:
      "dp[i][j] usually means 'best answer considering first i of A and first j of B'. Most recurrences look at dp[i-1][j], dp[i][j-1], and dp[i-1][j-1].",
    skeletonCode: `def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`,
    skeletonLines: [
      { code: "def lcs(a, b):", indent: 0, explain: "Longest common subsequence between two strings." },
      { code: "n, m = len(a), len(b)", indent: 1, explain: "Sizes of the two inputs." },
      { code: "dp = [[0] * (m + 1) for _ in range(n + 1)]", indent: 1, explain: "(n+1) × (m+1) table. dp[i][j] = LCS of first i of a and first j of b. Extra row/col for empty-prefix base case." },
      { code: "for i in range(1, n + 1):", indent: 1, explain: "Fill the table row by row." },
      { code: "for j in range(1, m + 1):", indent: 2, explain: "Column by column." },
      { code: "if a[i - 1] == b[j - 1]:", indent: 3, explain: "Characters match — extend the diagonal LCS by one." },
      { code: "dp[i][j] = 1 + dp[i - 1][j - 1]", indent: 4, explain: "Take the LCS of the prefixes BEFORE these chars and add 1." },
      { code: "else:", indent: 3, explain: "Characters don't match — skip one char from either string." },
      { code: "dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])", indent: 4, explain: "Best of 'drop a[i-1]' or 'drop b[j-1]'." },
      { code: "return dp[n][m]", indent: 1, explain: "Bottom-right cell holds the answer for the full strings." },
    ],
    helperSyntax: [
      "dp = [[0] * (m + 1) for _ in range(n + 1)]",
      "indices i-1, j-1 to access strings",
      "two-row rolling for O(m) space",
    ],
    commonMistakes: [
      "Off-by-one between dp index and string index",
      "Using `dp = [[0] * m] * n` (shared row references)",
      "Missing a base row/column",
    ],
    difficultyFocus: ["Medium"],
    masteryThreshold: 3,
    accent: "from-violet-500/20 to-violet-500/0",
    icon: "Grid3x3",
    order: 14,
  },
  {
    id: "greedy",
    name: "Greedy",
    tagline: "Local choice, global win.",
    summary:
      "Pick the locally-best option at each step and prove it can't make things worse later. Greedy beats DP when a clean exchange argument exists.",
    triggers: [
      "max sum / min cost in one pass",
      "schedule with deadlines",
      "jump / reach problems",
      "interval coverage",
      "split into groups by frontier",
    ],
    coreIdea:
      "Walk the input once, keep a frontier (max so far, current end, etc.), and update by a simple rule. Justify the rule before you trust it.",
    skeletonCode: `def jump_game(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach:
            return False
        reach = max(reach, i + x)
    return True`,
    skeletonLines: [
      { code: "def jump_game(nums):", indent: 0, explain: "Can you reach the last index? Each nums[i] is the max step you can take from i." },
      { code: "reach = 0", indent: 1, explain: "Furthest index we can currently reach. Starts at 0." },
      { code: "for i, x in enumerate(nums):", indent: 1, explain: "Walk through every position." },
      { code: "if i > reach:", indent: 2, explain: "We needed to arrive at i, but couldn't reach it — dead end." },
      { code: "return False", indent: 3, explain: "Can't get to the end from here." },
      { code: "reach = max(reach, i + x)", indent: 2, explain: "Update the frontier — from i we can jump up to i + x." },
      { code: "return True", indent: 1, explain: "Made it through every position — the end is reachable." },
    ],
    helperSyntax: [
      "running max / running min",
      "for i, x in enumerate(...):",
      "early return when reach >= len - 1",
    ],
    commonMistakes: [
      "Reaching for greedy when DP is actually required",
      "Greedy without an exchange argument — get burned on edge cases",
      "Forgetting the 'unreachable' early exit",
    ],
    difficultyFocus: ["Medium"],
    masteryThreshold: 3,
    accent: "from-lime-500/20 to-lime-500/0",
    icon: "Zap",
    order: 15,
  },
  {
    id: "math-geometry",
    name: "Math & Geometry",
    tagline: "Index gymnastics.",
    summary:
      "Matrix rotation, spirals, in-place row/column zeros, modular arithmetic. Almost zero algorithmic depth — the points are awarded for not getting indices wrong.",
    triggers: [
      "rotate / transpose a matrix",
      "spiral traversal",
      "in-place mark-and-sweep on a grid",
      "fast power / pow(x, n)",
      "happy number / digit manipulation",
    ],
    coreIdea:
      "Walk the indices carefully. Use the first row/column as marker space when O(1) auxiliary memory is required. For rotation, transpose then reverse rows.",
    skeletonCode: `def rotate(matrix):
    n = len(matrix)
    # transpose
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # reverse each row
    for row in row_iter(matrix):
        row.reverse()`,
    skeletonLines: [
      { code: "def rotate(matrix):", indent: 0, explain: "Rotate an n×n matrix 90° clockwise, in place." },
      { code: "n = len(matrix)", indent: 1, explain: "Side length." },
      { code: "for i in range(n):", indent: 1, explain: "First phase: transpose across the main diagonal." },
      { code: "for j in range(i + 1, n):", indent: 2, explain: "j starts at i+1 so we only swap each pair once." },
      { code: "matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]", indent: 3, explain: "Swap the mirrored cells." },
      { code: "for row in matrix:", indent: 1, explain: "Second phase: reverse every row." },
      { code: "row.reverse()", indent: 2, explain: "Transpose + row-reverse = 90° clockwise rotation." },
    ],
    helperSyntax: [
      "matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]",
      "for row in matrix: row.reverse()",
      "(r + dr) % n",
    ],
    commonMistakes: [
      "Iterating j from 0 instead of i + 1 in transpose (undoes itself)",
      "Mutating while iterating",
      "Off-by-one on layer-by-layer spiral",
    ],
    difficultyFocus: ["Easy", "Medium"],
    masteryThreshold: 3,
    accent: "from-yellow-500/20 to-yellow-500/0",
    icon: "Compass",
    order: 16,
  },
  {
    id: "bit-manipulation",
    name: "Bit Manipulation",
    tagline: "Speak to the silicon.",
    summary:
      "XOR, AND-with-(n-1), shifts. A small bag of tricks that turn O(n log n) counting problems into O(n) one-liners.",
    triggers: [
      "find the unique number",
      "count set bits",
      "swap without temp",
      "subset enumeration via masks",
      "bitmask DP",
    ],
    coreIdea:
      "XOR cancels duplicates. n & (n - 1) clears the lowest set bit. Shift to multiply/divide by 2.",
    skeletonCode: `def hamming_weight(n):
    count = 0
    while n:
        n &= n - 1   # clear lowest set bit
        count += 1
    return count`,
    skeletonLines: [
      { code: "def hamming_weight(n):", indent: 0, explain: "Count how many bits in n are set to 1." },
      { code: "count = 0", indent: 1, explain: "Running tally of set bits." },
      { code: "while n:", indent: 1, explain: "Loop until all bits are cleared." },
      { code: "n &= n - 1", indent: 2, explain: "Clever trick: n & (n-1) flips the LOWEST set bit to 0. So each iteration kills exactly one 1-bit." },
      { code: "count += 1", indent: 2, explain: "We just removed one set bit — bump the count." },
      { code: "return count", indent: 1, explain: "Total 1-bits seen before n became 0." },
    ],
    helperSyntax: [
      "n & (n - 1)  # clear lowest set bit",
      "n & 1        # parity",
      "n >> 1       # divide by 2",
      "a ^ b        # xor",
    ],
    commonMistakes: [
      "Forgetting Python ints are unbounded — masking with 0xFFFFFFFF",
      "Confusing & with && (Python doesn't have &&)",
      "Treating XOR as addition",
    ],
    difficultyFocus: ["Easy", "Medium"],
    masteryThreshold: 3,
    accent: "from-blue-500/20 to-blue-500/0",
    icon: "Binary",
    order: 17,
  },
];

export const PATTERN_MAP: Record<string, Pattern> = Object.fromEntries(
  PATTERNS.map((p) => [p.id, p]),
);
