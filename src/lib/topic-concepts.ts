// The "learn this before you practice" article per topic — separate from the
// short one-line description used in list previews. Original writing (not
// sourced from any single external article): standard CS curriculum material
// — recurrences, complexities, and code templates — expressed in our own
// words and our own minimal code, not quoted from anywhere.
export type TopicPattern = {
  name: string;
  description: string;
  code?: string;
};

export type TopicConcept = {
  // One or two sentences — why this topic is worth the time, surfaced above
  // the fold.
  whyItMatters: string;
  // The one idea that, once it clicks, makes most problems in this topic
  // fall into place.
  coreIdea: string;
  patterns: TopicPattern[];
  // Short bullet points, not prose — meant to be scanned.
  complexity: string[];
  mentalModel: { question: string; answer: string };
  // A single, memorable, actionable callout.
  tip: string;
};

export const TOPIC_CONCEPTS: Record<string, TopicConcept> = {
  "arrays-hashing": {
    whyItMatters:
      "Hash maps turn \"have I seen this?\" and \"how many times?\" questions from O(n) rescans into O(1) lookups — the single highest-leverage idea in early DSA.",
    coreIdea:
      "An array gives O(1) access by index but O(n) search. A hash map (or set) trades a little memory for O(1) average lookup, at the cost of losing order. Recognizing when a problem is secretly asking \"have I seen this value before?\" or \"how many times does this appear?\" — instead of \"compare every pair\" — is the entire skill.",
    patterns: [
      {
        name: "Complement / seen-before check",
        description:
          "Store what you'd need to complete the answer, not just what you have — so the second half of a pair check becomes a single lookup.",
        code: `seen = {}
for i, num in enumerate(nums):
    if target - num in seen:
        return [seen[target - num], i]
    seen[num] = i`,
      },
      {
        name: "Frequency count",
        description: "Count occurrences in one pass instead of re-scanning for each value.",
        code: `freq = {}
for x in arr:
    freq[x] = freq.get(x, 0) + 1`,
      },
      {
        name: "Prefix sum",
        description:
          "Precompute running totals once so the sum of any range becomes a single subtraction.",
        code: `prefix = [0] * (len(nums) + 1)
for i, num in enumerate(nums):
    prefix[i + 1] = prefix[i] + num
# sum(l, r) = prefix[r + 1] - prefix[l]`,
      },
    ],
    complexity: [
      "Hash map insert/lookup: O(1) average, O(n) worst case",
      "Space: O(n) — trading memory for speed",
      "Prefix sum: O(n) to build once, O(1) per range query after",
    ],
    mentalModel: {
      question: "Am I about to write a nested loop just to check membership?",
      answer: "If yes, a hash set or map almost always turns it into a single pass.",
    },
    tip: "The two-sum pattern — store what you need, not what you have — appears in a large share of array problems. Master this one first.",
  },

  "two-pointers": {
    whyItMatters:
      "Replaces O(n²) pairwise comparison with a single O(n) pass, by moving two indices with certainty about which one has to move next.",
    coreIdea:
      "Two distinct shapes: opposite-ends pointers start at both ends of a sorted array and move inward (pair-sum, palindrome checks); fast/slow pointers start together and move at different speeds (in-place dedup, cycle detection). What makes both O(n) instead of O(n²) is that at every step you can decide, with certainty, which pointer has to move.",
    patterns: [
      {
        name: "Opposite ends (sorted array)",
        description: "At each step, the comparison tells you exactly which side to move.",
        code: `left, right = 0, len(nums) - 1
while left < right:
    s = nums[left] + nums[right]
    if s == target:
        return [left, right]
    elif s < target:
        left += 1
    else:
        right -= 1`,
      },
      {
        name: "Fast/slow, same direction",
        description: "The slow pointer marks the boundary of the answer being built; fast does the scanning.",
        code: `slow = 0
for fast in range(len(nums)):
    if nums[fast] != val:
        nums[slow] = nums[fast]
        slow += 1`,
      },
    ],
    complexity: [
      "O(n) time — each pointer moves forward at most n times total",
      "O(1) extra space",
    ],
    mentalModel: {
      question: "Is the input sorted (or sortable without losing what I need), and is this about pairs, triplets, or a boundary?",
      answer: "That combination is the two-pointers tell.",
    },
    tip: "At opposite ends, always ask which pointer *must* move given the current comparison — that certainty is the whole trick.",
  },

  "sliding-window": {
    whyItMatters:
      "Turns \"check every subarray\" into a single pass that grows and shrinks a window, reusing work instead of recomputing from scratch.",
    coreIdea:
      "A sliding window is a contiguous range [left, right] that you expand and shrink instead of rescanning for every start index. The entire difficulty is usually just defining \"valid\" precisely — once that's nailed down, the expand/shrink loop is almost always the same shape.",
    patterns: [
      {
        name: "Variable-size window",
        description: "Expand right to include more; shrink left while the window is invalid.",
        code: `left = 0
for right in range(len(arr)):
    include(arr[right])
    while window_invalid():
        exclude(arr[left])
        left += 1
    update_answer(left, right)`,
      },
      {
        name: "Fixed-size window (size k)",
        description: "No inner while loop — add one element and remove one on every step.",
        code: `window_sum = sum(arr[:k])
best = window_sum
for right in range(k, len(arr)):
    window_sum += arr[right] - arr[right - k]
    best = max(best, window_sum)`,
      },
    ],
    complexity: [
      "O(n) time — left and right each move forward at most n times total",
      "O(1) to O(k) space depending on what the window tracks",
    ],
    mentalModel: {
      question: "Is the answer about a contiguous run, and can \"valid\" be checked as a simple running condition?",
      answer: "If yes, expand right and shrink left as needed — contiguous is the keyword that rules out most other approaches.",
    },
    tip: "Write the invalid-window condition in words before touching code — the loop is almost always the same shape once that's precise.",
  },

  "binary-search": {
    whyItMatters:
      "Collapses a monotonic search space in half every step, and generalizes to \"binary search on the answer\" even when there's no array in sight.",
    coreIdea:
      "Binary search isn't really about arrays — it's about any yes/no question whose answer flips exactly once across a range. The classic form (search a sorted array) is the same loop as \"binary search on the answer\", just with a different yes/no condition.",
    patterns: [
      {
        name: "Classic search",
        description: "Halve the range based on comparing the midpoint to the target.",
        code: `lo, hi = 0, len(arr) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1`,
      },
      {
        name: "Binary search on the answer",
        description: "Search the space of possible answers using a feasibility check, not the array itself.",
        code: `lo, hi = min_possible, max_possible
while lo < hi:
    mid = (lo + hi) // 2
    if feasible(mid):
        hi = mid
    else:
        lo = mid + 1
# lo is the smallest feasible answer`,
      },
    ],
    complexity: ["O(log n) time per search", "O(1) space (iterative)"],
    mentalModel: {
      question: "Does a brute-force check exist that's fast per-candidate, but scanning all candidates is slow?",
      answer: "Binary search the candidate space instead of scanning it.",
    },
    tip: "Decide up front whether your range is inclusive or exclusive at each end, and stay consistent with <= or < — mixing conventions is where most binary-search bugs come from.",
  },

  "linked-list": {
    whyItMatters:
      "Trades an array's O(1) random access for O(1) insertion/deletion at a known position — most problems here are pointer bookkeeping, not algorithmic cleverness.",
    coreIdea:
      "A dummy head node removes almost all special-casing around modifying or removing the first real node. Fast/slow pointers (one step vs. two) find the middle in one pass and detect a cycle without extra memory.",
    patterns: [
      {
        name: "Dummy head",
        description: "A throwaway node before the real head means there's always a real node before whichever one you're changing.",
        code: `dummy = ListNode(0, head)
prev = dummy
# ... modify the list using prev / curr ...
return dummy.next`,
      },
      {
        name: "Reverse a list",
        description: "Save next, reverse the link, advance — in that order, every time.",
        code: `prev, curr = None, head
while curr:
    nxt = curr.next
    curr.next = prev
    prev, curr = curr, nxt
return prev`,
      },
      {
        name: "Fast/slow (middle / cycle)",
        description: "Fast moves twice as far; where it ends up tells you the middle, or whether there's a loop.",
        code: `slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
# slow is the middle; if fast meets slow again later, there's a cycle`,
      },
    ],
    complexity: ["O(n) time for a single pass", "O(1) extra space for pointer-only techniques"],
    mentalModel: {
      question: "Am I about to special-case \"what if this is the first node\"?",
      answer: "Add a dummy head and that special case disappears.",
    },
    tip: "Before overwriting .next, always save it to a temp variable first — save, reverse, advance is the entire reversal algorithm.",
  },

  "stacks-queues": {
    whyItMatters:
      "A stack remembers \"the most recent unresolved thing\" in O(1) push/pop — the natural fit for matching, nesting, and undo.",
    coreIdea:
      "Push when you encounter something that might need to be matched later; pop when you find its match. A monotonic stack (kept strictly increasing or decreasing) is the same idea specialized for \"next greater/smaller element\" problems — each element is pushed and popped at most once, so it's still O(n).",
    patterns: [
      {
        name: "Bracket matching",
        description: "Push openers; a closer must match the most recent unmatched opener.",
        code: `stack = []
pairs = {')': '(', ']': '[', '}': '{'}
for c in s:
    if c in pairs.values():
        stack.append(c)
    elif not stack or stack.pop() != pairs[c]:
        return False
return not stack`,
      },
      {
        name: "Monotonic stack (next greater element)",
        description: "Pop everything smaller than the current value before pushing it — each pop resolves one answer.",
        code: `stack = []  # indices, values decreasing bottom to top
result = [-1] * len(nums)
for i, x in enumerate(nums):
    while stack and nums[stack[-1]] < x:
        result[stack.pop()] = x
    stack.append(i)`,
      },
    ],
    complexity: [
      "O(n) time — monotonic stack: each element pushed/popped at most once",
      "O(n) space worst case",
    ],
    mentalModel: {
      question: "Does the problem talk about matching, nesting, or \"the next bigger/smaller thing\"?",
      answer: "Stack — and monotonic stack specifically for \"next greater/smaller\" phrasing.",
    },
    tip: "A queue is what makes BFS \"process in the order discovered\" — reach for it there, not for direct matching problems.",
  },

  trees: {
    whyItMatters:
      "Nearly every tree problem is a traversal — decide the visiting order you need, then write the recursion for it.",
    coreIdea:
      "Pre-order when a node must be processed before its children; in-order when order matters (a BST's in-order traversal is always sorted); post-order when a node's answer depends on its children's answers first; level-order when you need to go row by row. The recursive skeleton is almost always: solve left, solve right, combine at the current node.",
    patterns: [
      {
        name: "Generic recursive skeleton",
        description: "Decide what the function returns and how two children's results combine before writing any code.",
        code: `def solve(node):
    if not node:
        return BASE_CASE
    left = solve(node.left)
    right = solve(node.right)
    return combine(left, right, node.val)`,
      },
      {
        name: "BST in-order = sorted",
        description: "Walking left, node, right on a BST visits every value in sorted order.",
        code: `def inorder(node, out):
    if not node:
        return
    inorder(node.left, out)
    out.append(node.val)
    inorder(node.right, out)`,
      },
      {
        name: "Level-order (BFS)",
        description: "A queue processes the tree row by row.",
        code: `queue = deque([root])
while queue:
    node = queue.popleft()
    for child in (node.left, node.right):
        if child:
            queue.append(child)`,
      },
    ],
    complexity: [
      "O(n) time to visit every node once",
      "O(h) recursion space (tree height h); O(n) queue space worst case for level-order",
    ],
    mentalModel: {
      question: "What does this function return, and how do I combine two children's results?",
      answer: "Answering that before coding resolves most of the design difficulty.",
    },
    tip: "Make the null-node base case consistent with \"no contribution\" — 0 for sums, negative infinity for max-path problems, true for validity checks.",
  },

  tries: {
    whyItMatters:
      "Stores a set of strings so that checking \"does this prefix exist?\" costs O(word length), not O(number of words × length).",
    coreIdea:
      "Each node is one character step; its children map to the next possible character, and a flag marks \"a word ends here.\" Walking the trie character by character is both the insert and the search algorithm.",
    patterns: [
      {
        name: "Insert",
        description: "Walk the word, creating a child node for each character that doesn't exist yet.",
        code: `def insert(root, word):
    node = root
    for ch in word:
        node = node.children.setdefault(ch, TrieNode())
    node.is_word = True`,
      },
      {
        name: "Search / prefix check",
        description: "Walk the word; fail the moment a required character edge is missing.",
        code: `def search(root, word):
    node = root
    for ch in word:
        if ch not in node.children:
            return False
        node = node.children[ch]
    return node.is_word`,
      },
    ],
    complexity: [
      "Insert/search: O(L) where L is the word length — independent of how many words are stored",
      "Space: O(total characters across all inserted words) worst case",
    ],
    mentalModel: {
      question: "Does the problem repeatedly ask \"does any word start with this prefix\"?",
      answer: "A trie answers that in O(prefix length), where scanning every stored word would be far slower.",
    },
    tip: "The is_word flag is easy to forget — without it you can't tell a stored prefix from a stored full word.",
  },

  "heaps-priority-queues": {
    whyItMatters:
      "Keeps \"the current min or max so far\" available in O(log n) per update, instead of an O(n) rescan every time the set changes.",
    coreIdea:
      "Two recurring shapes: top-k streaming, where a size-k heap keeps only the k best values seen so far; and merge/scheduling, where a heap holds \"the next available item from each source\" so you can always pull the globally-next item in O(log k).",
    patterns: [
      {
        name: "Top-k with a size-k heap",
        description: "For \"k largest\", use a min-heap of size k — anything smaller than the heap's minimum can't be in the top k.",
        code: `import heapq
heap = []
for x in stream:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)
# heap[0] is the kth largest`,
      },
      {
        name: "Merge k sorted lists",
        description: "Keep the next unconsumed element from every list in the heap.",
        code: `heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
heapq.heapify(heap)
while heap:
    val, i, j = heapq.heappop(heap)
    # use val
    if j + 1 < len(lists[i]):
        heapq.heappush(heap, (lists[i][j + 1], i, j + 1))`,
      },
    ],
    complexity: [
      "Push/pop: O(log n)",
      "Build-heap from an existing list: O(n)",
      "Top-k with a size-k heap: O(n log k) total — better than a full O(n log n) sort when k is small",
    ],
    mentalModel: {
      question: "Does the problem ask for \"kth largest/smallest\", \"top k\", or \"the current min so far as items arrive\"?",
      answer: "Any of those three phrasings means heap before anything else.",
    },
    tip: "For \"k largest\", use a min-heap of size k, not a max-heap — the smallest element in your heap is what new items get compared against.",
  },

  "graphs-traversal": {
    whyItMatters:
      "Most graph problems are answered by a single BFS or DFS pass plus careful bookkeeping — check that before reaching for a named algorithm.",
    coreIdea:
      "BFS explores level by level, the right choice for distance or \"fewest steps\"; DFS goes as deep as possible before backtracking, the right choice for connectivity, cycles, or exploring all paths. A graph doesn't have to look like one — grids, word ladders, and dependency lists are all graphs in disguise.",
    patterns: [
      {
        name: "BFS",
        description: "Explore in layers using a queue — the first time you reach a node is via the shortest path.",
        code: `from collections import deque
visited = {start}
queue = deque([start])
while queue:
    node = queue.popleft()
    for nxt in neighbors(node):
        if nxt not in visited:
            visited.add(nxt)
            queue.append(nxt)`,
      },
      {
        name: "DFS (recursive)",
        description: "Go as deep as possible, then backtrack.",
        code: `def dfs(node, visited):
    visited.add(node)
    for nxt in neighbors(node):
        if nxt not in visited:
            dfs(nxt, visited)`,
      },
    ],
    complexity: [
      "O(V + E) time for a full traversal",
      "O(V) space for the visited set, plus the recursion stack or queue",
    ],
    mentalModel: {
      question: "Do I care about distance or fewest steps, or just reachability/structure?",
      answer: "Distance → BFS. Reachability, cycles, all-paths → DFS.",
    },
    tip: "Mark a node visited the moment you enqueue or recurse into it, not when you finally process it — marking late lets the same node queue up twice.",
  },

  "graphs-grid": {
    whyItMatters:
      "A 2D grid is a graph where each cell connects to its neighbors — every traversal tool applies directly once seen that way.",
    coreIdea:
      "BFS for shortest distance across the grid, DFS for flood-filling connected regions of the same type. The practical pattern is identical to general graph traversal, with one extra bookkeeping step: bounds checking before the visited check.",
    patterns: [
      {
        name: "Flood fill / island counting",
        description: "Mark visited on entry, then recurse into the four (or eight) neighbors.",
        code: `def dfs(r, c):
    if r < 0 or c < 0 or r >= rows or c >= cols:
        return
    if visited[r][c] or grid[r][c] == 0:
        return
    visited[r][c] = True
    for dr, dc in [(1, 0), (-1, 0), (0, 1), (0, -1)]:
        dfs(r + dr, c + dc)`,
      },
    ],
    complexity: [
      "O(rows × cols) time — each cell visited once",
      "O(rows × cols) space for the visited grid, plus recursion/queue",
    ],
    mentalModel: {
      question: "Is this a matrix where the question is about regions, connectivity, or shortest distance?",
      answer: "Treat each cell as a node and each neighbor relationship as an edge, then run BFS/DFS.",
    },
    tip: "Check bounds before checking \"already visited\" — checking visited on an out-of-bounds index can crash.",
  },

  "graphs-union-find": {
    whyItMatters:
      "Answers \"same group?\" and \"merge these groups\" in near-constant time — far faster than re-traversing every time an edge is added.",
    coreIdea:
      "Each node points to a parent; a group's representative is whatever you reach by following parents to the top. Path compression (flatten the chain on every find) and union by size (attach the smaller tree under the bigger one) together keep both operations fast in practice.",
    patterns: [
      {
        name: "Find with path compression",
        description: "While finding a node's root, point every node along the way directly at it.",
        code: `def find(x):
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]`,
      },
      {
        name: "Union by size",
        description: "Always attach the smaller tree under the bigger one, keeping both shallow.",
        code: `def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb:
        return False
    if size[ra] < size[rb]:
        ra, rb = rb, ra
    parent[rb] = ra
    size[ra] += size[rb]
    return True`,
      },
    ],
    complexity: [
      "Find/union: amortized O(α(n)) — effectively constant for any input size in practice",
      "Space: O(n) for the parent/size arrays",
    ],
    mentalModel: {
      question: "Is the graph built incrementally, with connectivity needing to be tracked as edges arrive?",
      answer: "Union-find, not a fresh traversal per edge.",
    },
    tip: "Path compression and union by size are both one-line additions to a naive DSU — always include both.",
  },

  "graphs-topo-sort": {
    whyItMatters:
      "Orders tasks so every prerequisite comes before what depends on it, and doubles as a cycle detector for free.",
    coreIdea:
      "Kahn's algorithm is BFS by indegree: start from nodes with no incoming edges, process them, and decrement their neighbors' indegree, adding any neighbor that just reaches zero. If fewer nodes get processed than exist in the graph, a cycle is blocking the rest.",
    patterns: [
      {
        name: "Kahn's algorithm",
        description: "Process nodes with no remaining prerequisites first.",
        code: `from collections import deque
queue = deque([n for n in nodes if indegree[n] == 0])
order = []
while queue:
    node = queue.popleft()
    order.append(node)
    for nxt in graph[node]:
        indegree[nxt] -= 1
        if indegree[nxt] == 0:
            queue.append(nxt)
# len(order) < len(nodes) means there's a cycle`,
      },
    ],
    complexity: ["O(V + E) time", "O(V) space for indegree counts and the queue"],
    mentalModel: {
      question: "Do I need to order items given prerequisite/dependency pairs?",
      answer: "Topological sort — and if it can't fully order everything, that's exactly how you detect a cycle.",
    },
    tip: "Processing fewer nodes than exist in the graph is itself the cycle check — no separate detection pass needed.",
  },

  "graphs-shortest-path": {
    whyItMatters:
      "Generalizes BFS's free shortest-path property to weighted edges.",
    coreIdea:
      "Dijkstra greedily expands the closest not-yet-finalized node using a min-heap, and works as long as edge weights are non-negative. Bellman-Ford relaxes every edge up to n-1 times, trading speed for the ability to handle negative weights and detect negative cycles.",
    patterns: [
      {
        name: "Dijkstra",
        description: "Always expand the currently-closest unfinalized node next.",
        code: `import heapq
dist = {start: 0}
heap = [(0, start)]
while heap:
    d, node = heapq.heappop(heap)
    if d > dist.get(node, float('inf')):
        continue
    for nxt, w in graph[node]:
        if d + w < dist.get(nxt, float('inf')):
            dist[nxt] = d + w
            heapq.heappush(heap, (d + w, nxt))`,
      },
    ],
    complexity: [
      "Dijkstra: O((V + E) log V) with a binary heap",
      "Bellman-Ford: O(V × E) — slower, but handles negative edges",
    ],
    mentalModel: {
      question: "Are all edge weights non-negative?",
      answer: "Yes → Dijkstra. No, or I need to detect negative cycles → Bellman-Ford.",
    },
    tip: "\"Cheapest way to connect everything\" is a minimum spanning tree problem (Kruskal's), not shortest path — don't force it into the Dijkstra template.",
  },

  backtracking: {
    whyItMatters:
      "Systematically explores a decision tree and undoes a choice the moment it's known invalid — the only way to generate all valid combinations without missing or duplicating any.",
    coreIdea:
      "\"Choose, recurse, un-choose\" is the entire skeleton. Write it correctly as plain brute force first; pruning (skipping a branch the instant it can't lead to a valid answer) is what makes it fast, and is much easier to add once the base recursion already works.",
    patterns: [
      {
        name: "Skeleton",
        description: "Every backtracking solution is this shape, regardless of the specific problem.",
        code: `def backtrack(path, choices):
    if is_complete(path):
        results.append(path[:])
        return
    for choice in choices:
        path.append(choice)
        backtrack(path, remaining(choices, choice))
        path.pop()  # undo — this line is backtracking`,
      },
      {
        name: "Skip duplicates",
        description: "Sort first, then skip a choice identical to the one just tried at the same depth.",
        code: `for i, choice in enumerate(sorted_choices):
    if i > 0 and choice == sorted_choices[i - 1]:
        continue  # skip identical choice at this depth`,
      },
    ],
    complexity: [
      "Worst case exponential in the branching factor — pruning reduces practical runtime, not the theoretical worst case",
      "O(depth) extra space for the recursion stack / path",
    ],
    mentalModel: {
      question: "Am I generating all valid combinations, permutations, or subsets?",
      answer: "Write the plain choose-recurse-undo skeleton first; add pruning only after it's correct.",
    },
    tip: "If input elements can repeat, sort first and skip an element identical to one just tried at the same depth — that's what prevents duplicate combinations.",
  },

  "dp-1d": {
    whyItMatters:
      "The answer at position i depends on a small, fixed set of earlier positions — the simplest and most common DP shape.",
    coreIdea:
      "Climbing Stairs and House Robber are the canonical templates. Write the recurrence in words first (\"the answer for state X depends on states Y and Z how, exactly?\"), then translate directly to code — usually one array, or two rolling variables once you notice it only needs the last couple of values.",
    patterns: [
      {
        name: "Climbing stairs",
        description: "Ways to reach step i is ways to reach i-1 plus ways to reach i-2.",
        code: `prev2, prev1 = 1, 1
for _ in range(2, n + 1):
    prev2, prev1 = prev1, prev1 + prev2
# prev1 is the answer`,
      },
      {
        name: "House robber",
        description: "Best score at house i is max of skipping it or taking it plus the best through i-2.",
        code: `skip, take = 0, 0
for val in nums:
    skip, take = max(skip, take), skip + val
# max(skip, take) is the answer`,
      },
    ],
    complexity: ["O(n) time, one pass", "O(1) space once rolled from a full array to a few variables"],
    mentalModel: {
      question: "Does the answer at i obviously build on the answer at i-1 and/or i-2?",
      answer: "Write the recurrence in words first, then translate directly to code.",
    },
    tip: "If dp[i] only ever needs dp[i-1] and dp[i-2], you don't need the whole array — two variables sliding forward are enough.",
  },

  "dp-knapsack": {
    whyItMatters:
      "\"Include or skip each item, subject to a budget\" is one of the most common DP shapes in interviews and contests alike.",
    coreIdea:
      "0/1 knapsack: each item used at most once. Unbounded knapsack (coin change): an item can repeat. Before writing the recurrence for a new problem, explicitly name what plays \"item\", \"capacity\", and \"value\" — that mapping is usually the entire difficulty.",
    patterns: [
      {
        name: "0/1 knapsack",
        description: "Iterate capacity backwards so each item is only considered once per state.",
        code: `dp = [0] * (capacity + 1)
for weight, value in items:
    for cap in range(capacity, weight - 1, -1):
        dp[cap] = max(dp[cap], dp[cap - weight] + value)`,
      },
      {
        name: "Unbounded (coin change)",
        description: "Iterate capacity forwards so a coin can be reused within the same pass.",
        code: `dp = [float('inf')] * (target + 1)
dp[0] = 0
for coin in coins:
    for amt in range(coin, target + 1):
        dp[amt] = min(dp[amt], dp[amt - coin] + 1)`,
      },
    ],
    complexity: ["O(items × capacity) time", "O(capacity) space once rolled down to a 1D array"],
    mentalModel: {
      question: "Can each item be used more than once?",
      answer: "No → 0/1 knapsack, iterate capacity backwards. Yes → unbounded, iterate forwards.",
    },
    tip: "Name what plays \"item\", \"capacity\", and \"value\" in the new problem before writing the recurrence — that mapping is usually the entire difficulty.",
  },

  "dp-lcs": {
    whyItMatters:
      "Two strings walked index by index is one of the most reused DP shapes — edit distance, LCS, and palindrome problems all share the same backbone.",
    coreIdea:
      "The state is almost always a pair of positions (i, j). If the characters at i and j match, extend both pointers and carry the diagonal answer forward; if not, branch into whatever options the problem allows and take the best.",
    patterns: [
      {
        name: "Longest common subsequence",
        description: "dp[i][j] is the LCS length of the first i characters of a and first j of b.",
        code: `dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
for i in range(1, len(a) + 1):
    for j in range(1, len(b) + 1):
        if a[i - 1] == b[j - 1]:
            dp[i][j] = dp[i - 1][j - 1] + 1
        else:
            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])`,
      },
    ],
    complexity: [
      "O(len(a) × len(b)) time and space for the table",
      "Often reducible to O(min(len(a), len(b))) space by keeping only two rows",
    ],
    mentalModel: {
      question: "What does dp[i][j] mean in plain English?",
      answer: "\"The answer considering the first i characters of A and the first j of B\" — say that sentence before writing the transition.",
    },
    tip: "Draw a small 4x4 grid by hand for two short example strings — it makes the fill order and base cases far easier to get right than reasoning purely in code.",
  },

  "dp-lis": {
    whyItMatters:
      "The state is \"the best subsequence ending at index i\" — a shape that shows up any time order matters but elements can be skipped, from stock-span problems to envelope-nesting puzzles.",
    coreIdea:
      "dp[i] = length of the longest increasing subsequence ending exactly at i, built by scanning every earlier index j and taking dp[j] + 1 wherever nums[j] < nums[i]. That's O(n^2). The O(n log n) version keeps a separate array of \"smallest tail for each subsequence length\" and binary-searches it per element — it computes the right length without ever materializing the actual subsequence, which is the part people find counterintuitive the first time.",
    patterns: [
      {
        name: "O(n^2) — ending-here DP",
        description: "dp[i] looks back at every earlier compatible index.",
        code: `dp = [1] * n
for i in range(n):
    for j in range(i):
        if nums[j] < nums[i]:
            dp[i] = max(dp[i], dp[j] + 1)
# max(dp) is the answer`,
      },
      {
        name: "O(n log n) — patience sorting",
        description: "tails[k] is the smallest possible tail value of an increasing subsequence of length k+1.",
        code: `tails = []
for x in nums:
    pos = bisect_left(tails, x)
    if pos == len(tails):
        tails.append(x)
    else:
        tails[pos] = x
# len(tails) is the answer`,
      },
    ],
    complexity: [
      "O(n^2) time for the straightforward ending-here DP",
      "O(n log n) time, O(n) space for the patience-sorting / binary-search version",
    ],
    mentalModel: {
      question: "Am I asking for the actual subsequence, or just its length?",
      answer: "Just the length → the O(n log n) tails trick works directly. Need to reconstruct it, or the comparison isn't a simple '<' → fall back to the O(n^2) ending-here DP.",
    },
    tip: "The 'tails' array in the fast version is NOT the answer subsequence — it's a scratch structure that only happens to have the right length. Don't try to read the actual LIS off of it.",
  },

  "dp-stocks": {
    whyItMatters:
      "Every stock problem is the same state machine — holding or not — with extra states layered on for limits, cooldowns, or fees.",
    coreIdea:
      "Define dp[day][holding state][any extra state] = max profit. Transitions are always do nothing, or (buy, if not holding), or (sell, if holding). Solve the base case — one unlimited transaction, no cooldown, no fee — then add one dimension per variant.",
    patterns: [
      {
        name: "One unlimited transaction, O(1) space",
        description: "Track only the best profit while holding and while not holding.",
        code: `hold, free = float('-inf'), 0
for price in prices:
    hold, free = max(hold, free - price), max(free, hold + price)
# free is the answer`,
      },
    ],
    complexity: [
      "O(n) time, one pass over the days",
      "O(1) to O(k) space depending on how many extra states (cooldown, k transactions, fee) are tracked",
    ],
    mentalModel: {
      question: "On this day, am I holding or not, and what are my options?",
      answer: "Do nothing, or buy (if not holding), or sell (if holding) — every variant adds one more dimension to this same table.",
    },
    tip: "Solve the plain unlimited-transaction version first; every other variant here is the same transitions plus one more state.",
  },

  "dp-grids-trees": {
    whyItMatters:
      "DP where the state is a position — a grid cell, a tree node, a sub-range — rather than a prefix, so the recurrence looks outward instead of back along one line.",
    coreIdea:
      "Grid DP fills row by row, left to right, so every dependency is already computed. Tree DP is naturally a post-order traversal — a node's answer depends on its children's, computed first. Interval DP fills by increasing sub-range length, which is the detail most likely to trip people up.",
    patterns: [
      {
        name: "Grid DP (unique paths)",
        description: "Each cell builds from the cell above and the cell to the left.",
        code: `dp = [[1] * cols for _ in range(rows)]
for r in range(1, rows):
    for c in range(1, cols):
        dp[r][c] = dp[r - 1][c] + dp[r][c - 1]`,
      },
      {
        name: "Tree DP (post-order)",
        description: "A node's answer combines its children's answers, computed first.",
        code: `def solve(node):
    if not node:
        return (0, 0)  # (best including node, best excluding node)
    left = solve(node.left)
    right = solve(node.right)
    including = node.val + left[1] + right[1]
    excluding = max(left) + max(right)
    return (including, excluding)`,
      },
    ],
    complexity: [
      "Grid DP: O(rows × cols) time and space",
      "Tree DP: O(n) time, O(h) recursion space",
      "Interval DP: O(n²) to O(n³) depending on the transition",
    ],
    mentalModel: {
      question: "Does this cell/node's answer depend on neighbors, children, or sub-ranges rather than a single earlier index?",
      answer: "Fill order matters more here than in 1D DP — row by row for grids, post-order for trees, increasing length for intervals.",
    },
    tip: "Interval DP fills by increasing sub-range length, not row/column order — that's the detail most likely to trip you up coming from grid DP.",
  },

  "dp-interval": {
    whyItMatters:
      "The state is a sub-range [i, j] rather than a single index — the shape behind 'split this range at some point and combine the two halves optimally,' which covers everything from matrix-chain-style problems to two-player games played on a range.",
    coreIdea:
      "dp[i][j] = the best answer for the sub-range from i to j, built by trying every split point k between i and j and combining dp[i][k] with dp[k+1][j] (plus whatever cost the split itself adds). Because dp[i][j] depends on strictly smaller sub-ranges, you must fill the table by increasing length — not row-by-row or column-by-column like grid DP. Game-theory problems (Stone Game, Predict the Winner) use the exact same shape: dp[i][j] is 'the best score the current player can guarantee on this sub-range,' and the recurrence subtracts the opponent's best response.",
    patterns: [
      {
        name: "Interval DP by increasing length",
        description: "Outer loop is sub-range length, inner loop is the start index — this ordering is the whole trick.",
        code: `for length in range(2, n + 1):
    for i in range(n - length + 1):
        j = i + length - 1
        for k in range(i, j):
            dp[i][j] = best(dp[i][j], combine(dp[i][k], dp[k + 1][j]))`,
      },
      {
        name: "Game on a range (minimax)",
        description: "The current player's best score is their pick minus the best the opponent can then force.",
        code: `def solve(i, j):
    if i > j:
        return 0
    pick_left = nums[i] - solve(i + 1, j)
    pick_right = nums[j] - solve(i, j - 1)
    return max(pick_left, pick_right)
# solve(0, n-1) >= 0 means the first player can guarantee a win`,
      },
    ],
    complexity: [
      "O(n^3) time for most split-point interval DP (O(n^2) states × O(n) split choices)",
      "O(n^2) time for the minimax game-on-a-range variant (no separate split loop)",
      "O(n^2) space for the table",
    ],
    mentalModel: {
      question: "Does the answer for [i, j] depend on smaller sub-ranges strictly inside it, not just one neighbor?",
      answer: "Fill by increasing sub-range length, trying every split point k inside (i, j) and combining the two resulting halves.",
    },
    tip: "If you're filling the table in the wrong order, you'll read a dp[i][k] or dp[k+1][j] that hasn't been computed yet and silently get garbage — always loop by length first when in doubt.",
  },

  "dp-advanced": {
    whyItMatters:
      "The hardest DP shapes: a bitmask tracking exactly which of a small set of items have been used, or DP layered on top of another technique entirely (scheduling, matching, string construction). These are rare in easy/medium interviews but common in the hardest rounds and in competitive programming.",
    coreIdea:
      "Bitmask DP works because n is small (typically n <= 20) — the state 'which subset of items have I used' fits in an integer, and dp[mask] or dp[i][mask] is the best answer having used exactly that subset. The recurrence tries adding one more unused item (checking `mask & (1 << j) == 0`) and transitions to `mask | (1 << j)`. Problems that combine DP with another idea (shortest superstring, job scheduling, matching two groups) usually reduce to this same bitmask shape once you identify what the 'items' are.",
    patterns: [
      {
        name: "Bitmask DP template",
        description: "dp[mask] is the best answer having used exactly the items set in mask.",
        code: `dp = {0: 0}
for mask in range(1 << n):
    if mask not in dp:
        continue
    for j in range(n):
        if mask & (1 << j):
            continue
        new_mask = mask | (1 << j)
        candidate = dp[mask] + cost(mask, j)
        dp[new_mask] = min(dp.get(new_mask, float('inf')), candidate)
# dp[(1 << n) - 1] is the answer`,
      },
    ],
    complexity: [
      "O(2^n × n) or O(2^n × n^2) time depending on the transition — this is why n is capped around 15-20",
      "O(2^n) space for the mask-indexed table",
    ],
    mentalModel: {
      question: "Is n small (<= ~20) and does the answer depend on exactly which subset of items has been used so far, not just how many?",
      answer: "Yes → bitmask DP. The state is the mask itself; figure out what one bit represents before writing any code.",
    },
    tip: "Before coding, write one sentence: 'bit j of the mask means ___.' If you can't fill that blank precisely, the recurrence will be wrong no matter how carefully you code it.",
  },

  greedy: {
    whyItMatters:
      "Commits to the locally-best choice and never revisits it — correct only when the problem has a specific structure, which is the real skill to develop here.",
    coreIdea:
      "A strong signal greedy will work: sorting the input by the right key turns the rest of the problem into a simple single pass. The sort does almost all the conceptual work; the loop afterward is nearly mechanical.",
    patterns: [
      {
        name: "Interval scheduling (sort by end time)",
        description: "Always keep the interval that frees up the earliest.",
        code: `intervals.sort(key=lambda iv: iv[1])
count, last_end = 0, float('-inf')
for start, end in intervals:
    if start >= last_end:
        count += 1
        last_end = end`,
      },
    ],
    complexity: ["O(n log n) time — dominated by the sort", "O(1) extra space beyond the sort"],
    mentalModel: {
      question: "If I sort by the right key, does a single forward pass solve the rest?",
      answer: "That's the strongest signal greedy applies.",
    },
    tip: "Try to construct a counterexample by hand before trusting a greedy idea — if you genuinely can't build one, that's reasonable (though not airtight) evidence it's correct.",
  },

  "bit-manipulation": {
    whyItMatters:
      "A small set of bit tricks solve problems in O(1) extra space, where a hash set would cost memory proportional to the input.",
    coreIdea:
      "XOR cancels a number with itself and is identity with zero — the entire idea behind \"every number appears twice except one\". n & (n - 1) clears the lowest set bit, useful for counting bits or checking powers of two.",
    patterns: [
      {
        name: "Find the unique number (XOR)",
        description: "XOR every value together — duplicated pairs cancel out, leaving the unique one.",
        code: `result = 0
for x in nums:
    result ^= x
# result is the number that appears once`,
      },
      {
        name: "Count set bits / check power of two",
        description: "n & (n - 1) clears the lowest set bit — apply it repeatedly to count, or once to test for zero.",
        code: `def count_set_bits(n):
    count = 0
    while n:
        n &= n - 1
        count += 1
    return count

def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0`,
      },
    ],
    complexity: [
      "O(1) space for all of these tricks",
      "O(number of set bits) or O(32/64) time depending on the trick",
    ],
    mentalModel: {
      question: "Does the problem mention \"without extra space\", or involve uniqueness/parity across many numbers?",
      answer: "That phrasing is the hint that a bit trick, not a hash set, is the intended solution.",
    },
    tip: "x ^ x = 0 and x ^ 0 = x together are the entire idea behind \"every number appears twice except one\" — XOR everything and the pairs cancel.",
  },

  "math-number-theory": {
    whyItMatters:
      "Primality, GCD/LCM, and modular arithmetic underlie problems that don't look mathematical at first glance — especially common on CodeChef.",
    coreIdea:
      "Checking a single number's primality is O(√n); if many numbers need checking, precompute a sieve once instead. Euclid's algorithm computes GCD in O(log(min(a, b))). When a problem asks for an answer modulo some large number, it's telling you the true answer is too large to fit normally — take the modulus at every step, not just the end.",
    patterns: [
      {
        name: "Sieve of Eratosthenes",
        description: "Mark multiples of each prime as composite — far cheaper than checking every number independently.",
        code: `is_prime = [True] * (n + 1)
is_prime[0] = is_prime[1] = False
for i in range(2, int(n ** 0.5) + 1):
    if is_prime[i]:
        for multiple in range(i * i, n + 1, i):
            is_prime[multiple] = False`,
      },
      {
        name: "Euclid's algorithm (GCD)",
        description: "GCD(a, b) equals GCD(b, a mod b) — LCM follows directly from it.",
        code: `def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
# lcm(a, b) = a * b // gcd(a, b)`,
      },
    ],
    complexity: [
      "Single primality check: O(√n)",
      "Sieve for all primes up to n: O(n log log n) total — use when checking many numbers, not repeated √n checks",
      "GCD: O(log(min(a, b)))",
    ],
    mentalModel: {
      question: "Do I need to check primality/factor once, or many times?",
      answer: "Once → a direct O(√n) check. Many times → precompute a sieve first.",
    },
    tip: "When a problem asks for an answer \"modulo 10^9 + 7\", take the modulus after every multiplication/addition along the way — taking it only at the end lets silent overflow corrupt the result.",
  },
};
