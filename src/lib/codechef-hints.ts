// CodeChef has no official per-problem hints API (it's a competitive-
// programming judge, not an interview-prep site — editorials exist but are
// full solutions, not graduated hints). Rather than fabricate specific
// algorithmic claims about 100+ individual problems we have no verified
// knowledge of, these are genuine, general pattern-hints per topic — honest
// about being a nudge toward the approach, not a spoiler for the exact problem.
export const CODECHEF_TOPIC_HINTS: Record<string, string[]> = {
  "arrays-hashing": [
    "Before reaching for nested loops, ask whether a hash map/set lets you answer 'have I seen this before?' in O(1).",
    "If the problem involves ranges or counts over a subarray, a prefix-sum array often turns repeated recomputation into O(1) lookups.",
  ],
  "two-pointers": [
    "Check whether sorting the input first makes a two-pointer scan possible — many O(n^2) pair/triplet problems drop to O(n log n) this way.",
    "Watch for the pointers needing to move in the same direction (fast/slow) vs. opposite ends closing inward — they solve different problem shapes.",
  ],
  "sliding-window": [
    "Define precisely what makes the current window 'valid' — that condition is what you check on every expand and shrink.",
    "Most sliding-window problems only ever grow the right edge and shrink the left edge — never restart the window from scratch.",
  ],
  "binary-search": [
    "If a brute-force check for one candidate answer is fast, binary search over the answer itself, not just over the input array.",
    "Be explicit about whether your search space is inclusive or exclusive at each end — that's where off-by-one bugs live.",
  ],
  "linked-list": [
    "A dummy head node removes most of the special-casing around modifying the first real node.",
    "Fast/slow pointers solve cycle detection, finding the middle, and 'nth from the end' with no extra memory.",
  ],
  "stacks-queues": [
    "If you need 'the most recent unmatched thing,' that's a stack — think brackets, nested structures, or undo operations.",
    "A monotonic stack (only increasing or only decreasing) is the standard trick for 'next greater/smaller element' style problems.",
  ],
  "trees": [
    "Decide whether you need pre-order, in-order, post-order, or level-order traversal before writing any code — the order usually falls out of what you need to compute.",
    "For a BST, remember in-order traversal always yields sorted output — a lot of BST problems reduce to using that fact.",
  ],
  "heaps-priority-queues": [
    "If you only ever need the current min or max 'so far,' a heap keeps that available in O(log n) per update instead of re-scanning.",
    "'Kth largest/smallest at any point' is almost always a heap sized to k, not a full sort.",
  ],
  "graphs": [
    "If the grid/graph is unweighted, BFS gives you shortest paths for free; DFS is usually the right tool for connectivity or cycle questions instead.",
    "A 2D grid is just a graph where each cell has up to 4 (or 8) neighbors — model it that way before reaching for anything fancier.",
  ],
  "backtracking": [
    "Write the 'choose, recurse, un-choose' skeleton first, then add pruning — don't try to prune before the basic recursion is correct.",
    "If the same partial state can be reached multiple ways, consider whether sorting input or tracking 'used' indices avoids duplicate branches.",
  ],
  "dynamic-programming": [
    "Write down the recurrence in words before code: 'the answer for state X depends on the answer for states Y and Z how, exactly?'",
    "If a recursive brute force is correct but slow, check whether the same (state) arguments repeat — that's exactly what memoization fixes.",
  ],
  "greedy": [
    "Greedy only works when a locally-best choice can never be undone by a better global option — try to find (or disprove) that property before coding.",
    "Sorting the input by the right key is often the entire 'trick' in a greedy problem — the loop after that is usually simple.",
  ],
  "bit-manipulation": [
    "XOR-ing a number with itself cancels to 0 — that's the core idea behind most 'find the unique element' bit tricks.",
    "`n & (n - 1)` clears the lowest set bit — useful for counting set bits or checking powers of two in O(1).",
  ],
  "math-number-theory": [
    "Precompute primes with a sieve rather than checking primality one number at a time if you'll need many of them.",
    "Watch for integer overflow and whether the problem wants an answer modulo some number — both change how you write the arithmetic.",
  ],
};
