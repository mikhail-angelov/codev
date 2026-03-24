import { loadProblemRecords, type ProblemRecord } from "./problem-schema.js";

const problemSeedData: ProblemRecord[] = [
  {
    id: 1,
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "easy",
    topic: "Arrays",
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume there is exactly one solution and you may not use the same element twice.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        note: "nums[0] + nums[1] = 2 + 7 = 9",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "Exactly one valid answer exists",
    ],
    starterTemplate: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i += 1) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }

  return [];
}`,
    hints: [
      "Try storing numbers you have already seen in a hash map.",
      "For each value, check whether target - value already exists.",
      "You can solve this in one pass with O(n) time.",
    ],
    referenceSolution: `function twoSum(nums, target) {
  const seen = new Map();

  for (let i = 0; i < nums.length; i += 1) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }

  return [];
}`,
    sampleTests: [
      {
        input: "nums = [2,7,11,15], target = 9",
        expectedOutput: "[0,1]",
        description: "The first and second elements add up to the target.",
      },
      {
        input: "nums = [3,2,4], target = 6",
        expectedOutput: "[1,2]",
      },
    ],
  },
  {
    id: 15,
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "medium",
    topic: "Strings",
    description:
      "Given a string s, return the length of the longest substring without repeating characters.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        note: 'The answer is "abc".',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
      },
      {
        input: 's = "pwwkew"',
        output: "3",
        note: 'The answer is "wke".',
      },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of printable ASCII characters",
    ],
    starterTemplate: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right += 1) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left += 1;
    }
    seen.add(s[right]);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`,
    hints: [
      "Use a sliding window to keep track of the current unique substring.",
      "When you see a duplicate, shrink the window from the left.",
      "Track the characters currently inside the window with a set or map.",
    ],
    referenceSolution: `function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let left = 0;
  let best = 0;

  for (let right = 0; right < s.length; right += 1) {
    while (seen.has(s[right])) {
      seen.delete(s[left]);
      left += 1;
    }
    seen.add(s[right]);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`,
    sampleTests: [
      {
        input: 's = "abcabcbb"',
        expectedOutput: "3",
      },
      {
        input: 's = "pwwkew"',
        expectedOutput: "3",
      },
    ],
  },
  {
    id: 23,
    slug: "maximum-depth-of-binary-tree",
    title: "Maximum Depth of Binary Tree",
    difficulty: "easy",
    topic: "Trees",
    description:
      "Given the root of a binary tree, return its maximum depth. The maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "3",
      },
      {
        input: "root = [1,null,2]",
        output: "2",
      },
    ],
    constraints: [
      "0 <= number of nodes <= 10^4",
      "-100 <= Node.val <= 100",
    ],
    starterTemplate: `/**
 * @param {TreeNode} root
 * @return {number}
 */
function maxDepth(root) {
  if (!root) {
    return 0;
  }

  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
    hints: [
      "Think recursively about the depth of the left and right subtree.",
      "A null node has depth 0.",
      "The answer for a node is 1 + max(leftDepth, rightDepth).",
    ],
    referenceSolution: `function maxDepth(root) {
  if (!root) {
    return 0;
  }

  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
    sampleTests: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        expectedOutput: "3",
      },
      {
        input: "root = [1,null,2]",
        expectedOutput: "2",
      },
    ],
  },
  {
    id: 42,
    slug: "number-of-islands",
    title: "Number of Islands",
    difficulty: "medium",
    topic: "Graphs",
    description:
      "Given an m x n 2D binary grid where '1' represents land and '0' represents water, return the number of islands. An island is formed by connecting adjacent lands horizontally or vertically.",
    examples: [
      {
        input: 'grid = [["1","1","0"],["0","1","0"],["0","0","1"]]',
        output: "2",
      },
      {
        input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]',
        output: "1",
      },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'",
    ],
    starterTemplate: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  let count = 0;

  function dfs(row, col) {
    if (
      row < 0 ||
      row >= grid.length ||
      col < 0 ||
      col >= grid[0].length ||
      grid[row][col] !== "1"
    ) {
      return;
    }

    grid[row][col] = "0";
    dfs(row + 1, col);
    dfs(row - 1, col);
    dfs(row, col + 1);
    dfs(row, col - 1);
  }

  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[0].length; col += 1) {
      if (grid[row][col] === "1") {
        count += 1;
        dfs(row, col);
      }
    }
  }

  return count;
}`,
    hints: [
      "Use DFS or BFS to traverse each island.",
      "Whenever you discover a new land cell, increment the island count.",
      "Mark visited cells so they are not counted again.",
    ],
    referenceSolution: `function numIslands(grid) {
  let count = 0;

  function dfs(row, col) {
    if (
      row < 0 ||
      row >= grid.length ||
      col < 0 ||
      col >= grid[0].length ||
      grid[row][col] !== "1"
    ) {
      return;
    }

    grid[row][col] = "0";
    dfs(row + 1, col);
    dfs(row - 1, col);
    dfs(row, col + 1);
    dfs(row, col - 1);
  }

  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[0].length; col += 1) {
      if (grid[row][col] === "1") {
        count += 1;
        dfs(row, col);
      }
    }
  }

  return count;
}`,
    sampleTests: [
      {
        input: 'grid = [["1","1","0"],["0","1","0"],["0","0","1"]]',
        expectedOutput: "2",
      },
      {
        input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]',
        expectedOutput: "1",
      },
    ],
  },
  {
    id: 57,
    slug: "merge-k-sorted-lists",
    title: "Merge K Sorted Lists",
    difficulty: "hard",
    topic: "Linked Lists",
    description:
      "You are given an array of k linked-lists, each sorted in ascending order. Merge all linked-lists into one sorted linked-list and return it.",
    examples: [
      {
        input: "lists = [[1,4,5],[1,3,4],[2,6]]",
        output: "[1,1,2,3,4,4,5,6]",
      },
      {
        input: "lists = []",
        output: "[]",
      },
    ],
    constraints: [
      "0 <= k <= 10^4",
      "0 <= lists[i].length <= 500",
      "Lists are sorted in ascending order",
    ],
    starterTemplate: `/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
function mergeKLists(lists) {
  if (lists.length === 0) {
    return null;
  }

  function merge(left, right) {
    const dummy = new ListNode(0);
    let tail = dummy;

    while (left && right) {
      if (left.val <= right.val) {
        tail.next = left;
        left = left.next;
      } else {
        tail.next = right;
        right = right.next;
      }
      tail = tail.next;
    }

    tail.next = left || right;
    return dummy.next;
  }

  while (lists.length > 1) {
    const merged = [];

    for (let i = 0; i < lists.length; i += 2) {
      merged.push(merge(lists[i], lists[i + 1] ?? null));
    }

    lists = merged;
  }

  return lists[0];
}`,
    hints: [
      "Merge lists in pairs instead of one by one.",
      "Merging two sorted linked lists is a reusable building block.",
      "A divide-and-conquer approach gives O(N log k) complexity.",
    ],
    referenceSolution: `function mergeKLists(lists) {
  if (lists.length === 0) {
    return null;
  }

  function merge(left, right) {
    const dummy = new ListNode(0);
    let tail = dummy;

    while (left && right) {
      if (left.val <= right.val) {
        tail.next = left;
        left = left.next;
      } else {
        tail.next = right;
        right = right.next;
      }
      tail = tail.next;
    }

    tail.next = left || right;
    return dummy.next;
  }

  while (lists.length > 1) {
    const merged = [];

    for (let i = 0; i < lists.length; i += 2) {
      merged.push(merge(lists[i], lists[i + 1] ?? null));
    }

    lists = merged;
  }

  return lists[0];
}`,
    sampleTests: [
      {
        input: "lists = [[1,4,5],[1,3,4],[2,6]]",
        expectedOutput: "[1,1,2,3,4,4,5,6]",
      },
      {
        input: "lists = []",
        expectedOutput: "[]",
      },
    ],
  },
  {
    id: 63,
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "easy",
    topic: "Arrays",
    description:
      "You are given an array prices where prices[i] is the price of a stock on the ith day. Choose one day to buy and a different future day to sell to maximize profit. Return the maximum profit you can achieve.",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        note: "Buy on day 2 at price 1 and sell on day 5 at price 6.",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
      },
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4",
    ],
    starterTemplate: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  let minPrice = Infinity;
  let bestProfit = 0;

  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    bestProfit = Math.max(bestProfit, price - minPrice);
  }

  return bestProfit;
}`,
    hints: [
      "Track the lowest price you have seen so far as you scan left to right.",
      "At each day, compute the profit from selling today after buying at the lowest earlier price.",
      "You only need one pass and constant extra space.",
    ],
    referenceSolution: `function maxProfit(prices) {
  let minPrice = Infinity;
  let bestProfit = 0;

  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    bestProfit = Math.max(bestProfit, price - minPrice);
  }

  return bestProfit;
}`,
    sampleTests: [
      {
        input: "prices = [7,1,5,3,6,4]",
        expectedOutput: "5",
      },
      {
        input: "prices = [7,6,4,3,1]",
        expectedOutput: "0",
      },
    ],
  },
  {
    id: 68,
    slug: "valid-anagram",
    title: "Valid Anagram",
    difficulty: "easy",
    topic: "Strings",
    description:
      "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: "true",
      },
      {
        input: 's = "rat", t = "car"',
        output: "false",
      },
    ],
    constraints: [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters",
    ],
    starterTemplate: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {
  if (s.length !== t.length) {
    return false;
  }

  const counts = new Map();

  for (const char of s) {
    counts.set(char, (counts.get(char) ?? 0) + 1);
  }

  for (const char of t) {
    if (!counts.has(char)) {
      return false;
    }

    const nextCount = counts.get(char) - 1;
    if (nextCount === 0) {
      counts.delete(char);
    } else {
      counts.set(char, nextCount);
    }
  }

  return counts.size === 0;
}`,
    hints: [
      "If the strings have different lengths, they cannot be anagrams.",
      "Count how many times each character appears in one string, then subtract using the other.",
      "A frequency map gives linear time without sorting.",
    ],
    referenceSolution: `function isAnagram(s, t) {
  if (s.length !== t.length) {
    return false;
  }

  const counts = new Map();

  for (const char of s) {
    counts.set(char, (counts.get(char) ?? 0) + 1);
  }

  for (const char of t) {
    if (!counts.has(char)) {
      return false;
    }

    const nextCount = counts.get(char) - 1;
    if (nextCount === 0) {
      counts.delete(char);
    } else {
      counts.set(char, nextCount);
    }
  }

  return counts.size === 0;
}`,
    sampleTests: [
      {
        input: 's = "anagram", t = "nagaram"',
        expectedOutput: "true",
      },
      {
        input: 's = "rat", t = "car"',
        expectedOutput: "false",
      },
    ],
  },
  {
    id: 74,
    slug: "binary-tree-level-order-traversal",
    title: "Binary Tree Level Order Traversal",
    difficulty: "medium",
    topic: "Trees",
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values from left to right, level by level.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
      },
      {
        input: "root = [1]",
        output: "[[1]]",
      },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 2000]",
      "-1000 <= Node.val <= 1000",
    ],
    starterTemplate: `/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
function levelOrder(root) {
  if (!root) {
    return [];
  }

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];

    for (let i = 0; i < levelSize; i += 1) {
      const node = queue.shift();
      level.push(node.val);

      if (node.left) {
        queue.push(node.left);
      }

      if (node.right) {
        queue.push(node.right);
      }
    }

    result.push(level);
  }

  return result;
}`,
    hints: [
      "Breadth-first search naturally processes the tree one level at a time.",
      "Use the current queue length to know how many nodes belong to the same level.",
      "Collect each level into its own array before pushing children for the next level.",
    ],
    referenceSolution: `function levelOrder(root) {
  if (!root) {
    return [];
  }

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const level = [];

    for (let i = 0; i < levelSize; i += 1) {
      const node = queue.shift();
      level.push(node.val);

      if (node.left) {
        queue.push(node.left);
      }

      if (node.right) {
        queue.push(node.right);
      }
    }

    result.push(level);
  }

  return result;
}`,
    sampleTests: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        expectedOutput: "[[3],[9,20],[15,7]]",
      },
      {
        input: "root = [1]",
        expectedOutput: "[[1]]",
      },
    ],
  },
  {
    id: 81,
    slug: "rotting-oranges",
    title: "Rotting Oranges",
    difficulty: "medium",
    topic: "Graphs",
    description:
      "You are given an m x n grid where 0 is empty, 1 is a fresh orange, and 2 is a rotten orange. Every minute, any fresh orange adjacent up, down, left, or right to a rotten orange becomes rotten. Return the minimum number of minutes needed so that no fresh orange remains, or -1 if this is impossible.",
    examples: [
      {
        input: "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        output: "4",
      },
      {
        input: "grid = [[2,1,1],[0,1,1],[1,0,1]]",
        output: "-1",
      },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 10",
      "grid[i][j] is 0, 1, or 2",
    ],
    starterTemplate: `/**
 * @param {number[][]} grid
 * @return {number}
 */
function orangesRotting(grid) {
  const queue = [];
  let fresh = 0;

  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[0].length; col += 1) {
      if (grid[row][col] === 2) {
        queue.push([row, col]);
      } else if (grid[row][col] === 1) {
        fresh += 1;
      }
    }
  }

  let minutes = 0;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length > 0 && fresh > 0) {
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i += 1) {
      const [row, col] = queue.shift();

      for (const [dr, dc] of directions) {
        const nextRow = row + dr;
        const nextCol = col + dc;

        if (
          nextRow < 0 ||
          nextRow >= grid.length ||
          nextCol < 0 ||
          nextCol >= grid[0].length ||
          grid[nextRow][nextCol] !== 1
        ) {
          continue;
        }

        grid[nextRow][nextCol] = 2;
        fresh -= 1;
        queue.push([nextRow, nextCol]);
      }
    }

    minutes += 1;
  }

  return fresh === 0 ? minutes : -1;
}`,
    hints: [
      "This is a multi-source BFS because every rotten orange spreads at the same time.",
      "Start by pushing every rotten orange into the queue and counting fresh ones.",
      "Each BFS layer corresponds to one minute.",
    ],
    referenceSolution: `function orangesRotting(grid) {
  const queue = [];
  let fresh = 0;

  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[0].length; col += 1) {
      if (grid[row][col] === 2) {
        queue.push([row, col]);
      } else if (grid[row][col] === 1) {
        fresh += 1;
      }
    }
  }

  let minutes = 0;
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (queue.length > 0 && fresh > 0) {
    const levelSize = queue.length;

    for (let i = 0; i < levelSize; i += 1) {
      const [row, col] = queue.shift();

      for (const [dr, dc] of directions) {
        const nextRow = row + dr;
        const nextCol = col + dc;

        if (
          nextRow < 0 ||
          nextRow >= grid.length ||
          nextCol < 0 ||
          nextCol >= grid[0].length ||
          grid[nextRow][nextCol] !== 1
        ) {
          continue;
        }

        grid[nextRow][nextCol] = 2;
        fresh -= 1;
        queue.push([nextRow, nextCol]);
      }
    }

    minutes += 1;
  }

  return fresh === 0 ? minutes : -1;
}`,
    sampleTests: [
      {
        input: "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        expectedOutput: "4",
      },
      {
        input: "grid = [[2,1,1],[0,1,1],[1,0,1]]",
        expectedOutput: "-1",
      },
    ],
  },
  {
    id: 88,
    slug: "course-schedule",
    title: "Course Schedule",
    difficulty: "medium",
    topic: "Graphs",
    description:
      "There are numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given prerequisites where prerequisites[i] = [ai, bi] means you must take course bi before course ai. Return true if you can finish all courses.",
    examples: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        output: "true",
      },
      {
        input: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        output: "false",
      },
    ],
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= 5000",
      "prerequisites[i].length == 2",
    ],
    starterTemplate: `/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);

  for (const [course, prerequisite] of prerequisites) {
    graph[prerequisite].push(course);
    indegree[course] += 1;
  }

  const queue = [];
  for (let course = 0; course < numCourses; course += 1) {
    if (indegree[course] === 0) {
      queue.push(course);
    }
  }

  let completed = 0;

  while (queue.length > 0) {
    const course = queue.shift();
    completed += 1;

    for (const nextCourse of graph[course]) {
      indegree[nextCourse] -= 1;
      if (indegree[nextCourse] === 0) {
        queue.push(nextCourse);
      }
    }
  }

  return completed === numCourses;
}`,
    hints: [
      "A cycle in the prerequisite graph means you cannot finish all courses.",
      "Topological sort with indegree counts can detect whether every node becomes available.",
      "If you process fewer than numCourses nodes, at least one cycle exists.",
    ],
    referenceSolution: `function canFinish(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);

  for (const [course, prerequisite] of prerequisites) {
    graph[prerequisite].push(course);
    indegree[course] += 1;
  }

  const queue = [];
  for (let course = 0; course < numCourses; course += 1) {
    if (indegree[course] === 0) {
      queue.push(course);
    }
  }

  let completed = 0;

  while (queue.length > 0) {
    const course = queue.shift();
    completed += 1;

    for (const nextCourse of graph[course]) {
      indegree[nextCourse] -= 1;
      if (indegree[nextCourse] === 0) {
        queue.push(nextCourse);
      }
    }
  }

  return completed === numCourses;
}`,
    sampleTests: [
      {
        input: "numCourses = 2, prerequisites = [[1,0]]",
        expectedOutput: "true",
      },
      {
        input: "numCourses = 2, prerequisites = [[1,0],[0,1]]",
        expectedOutput: "false",
      },
    ],
  },
  {
    id: 93,
    slug: "generate-parentheses",
    title: "Generate Parentheses",
    difficulty: "medium",
    topic: "Recursion",
    description:
      "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
    examples: [
      {
        input: "n = 3",
        output: '["((()))","(()())","(())()","()(())","()()()"]',
      },
      {
        input: "n = 1",
        output: '["()"]',
      },
    ],
    constraints: [
      "1 <= n <= 8",
    ],
    starterTemplate: `/**
 * @param {number} n
 * @return {string[]}
 */
function generateParenthesis(n) {
  const result = [];

  function backtrack(current, open, close) {
    if (current.length === n * 2) {
      result.push(current);
      return;
    }

    if (open < n) {
      backtrack(current + "(", open + 1, close);
    }

    if (close < open) {
      backtrack(current + ")", open, close + 1);
    }
  }

  backtrack("", 0, 0);
  return result;
}`,
    hints: [
      "Build the answer incrementally and stop when the string reaches length 2 * n.",
      "You can only add an opening parenthesis if you still have some left to place.",
      "You can only add a closing parenthesis if it will not make the prefix invalid.",
    ],
    referenceSolution: `function generateParenthesis(n) {
  const result = [];

  function backtrack(current, open, close) {
    if (current.length === n * 2) {
      result.push(current);
      return;
    }

    if (open < n) {
      backtrack(current + "(", open + 1, close);
    }

    if (close < open) {
      backtrack(current + ")", open, close + 1);
    }
  }

  backtrack("", 0, 0);
  return result;
}`,
    sampleTests: [
      {
        input: "n = 3",
        expectedOutput: '["((()))","(()())","(())()","()(())","()()()"]',
      },
      {
        input: "n = 1",
        expectedOutput: '["()"]',
      },
    ],
  },
  {
    id: 101,
    slug: "permutations",
    title: "Permutations",
    difficulty: "medium",
    topic: "Recursion",
    description:
      "Given an array nums of distinct integers, return all the possible permutations. You may return the answer in any order.",
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
      },
      {
        input: "nums = [0,1]",
        output: "[[0,1],[1,0]]",
      },
    ],
    constraints: [
      "1 <= nums.length <= 6",
      "-10 <= nums[i] <= 10",
      "All the integers of nums are unique",
    ],
    starterTemplate: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function permute(nums) {
  const result = [];
  const used = new Array(nums.length).fill(false);
  const path = [];

  function backtrack() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    for (let i = 0; i < nums.length; i += 1) {
      if (used[i]) {
        continue;
      }

      used[i] = true;
      path.push(nums[i]);
      backtrack();
      path.pop();
      used[i] = false;
    }
  }

  backtrack();
  return result;
}`,
    hints: [
      "This is a choose-next-element recursion problem.",
      "Track which numbers are already in the current permutation so you do not reuse them.",
      "Push a copy of the current path when its length reaches nums.length.",
    ],
    referenceSolution: `function permute(nums) {
  const result = [];
  const used = new Array(nums.length).fill(false);
  const path = [];

  function backtrack() {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    for (let i = 0; i < nums.length; i += 1) {
      if (used[i]) {
        continue;
      }

      used[i] = true;
      path.push(nums[i]);
      backtrack();
      path.pop();
      used[i] = false;
    }
  }

  backtrack();
  return result;
}`,
    sampleTests: [
      {
        input: "nums = [1,2,3]",
        expectedOutput: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
      },
      {
        input: "nums = [0,1]",
        expectedOutput: "[[0,1],[1,0]]",
      },
    ],
  },
  {
    id: 109,
    slug: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "easy",
    topic: "Dynamic Programming",
    description:
      "You are climbing a staircase. It takes n steps to reach the top. Each time you can climb either 1 or 2 steps. Return how many distinct ways you can climb to the top.",
    examples: [
      {
        input: "n = 2",
        output: "2",
      },
      {
        input: "n = 3",
        output: "3",
      },
    ],
    constraints: [
      "1 <= n <= 45",
    ],
    starterTemplate: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  if (n <= 2) {
    return n;
  }

  let oneStepBefore = 2;
  let twoStepsBefore = 1;

  for (let step = 3; step <= n; step += 1) {
    const current = oneStepBefore + twoStepsBefore;
    twoStepsBefore = oneStepBefore;
    oneStepBefore = current;
  }

  return oneStepBefore;
}`,
    hints: [
      "Think about the last move: it was either a single step or a double step.",
      "That gives the recurrence ways(n) = ways(n - 1) + ways(n - 2).",
      "You only need the two previous values, not a full array.",
    ],
    referenceSolution: `function climbStairs(n) {
  if (n <= 2) {
    return n;
  }

  let oneStepBefore = 2;
  let twoStepsBefore = 1;

  for (let step = 3; step <= n; step += 1) {
    const current = oneStepBefore + twoStepsBefore;
    twoStepsBefore = oneStepBefore;
    oneStepBefore = current;
  }

  return oneStepBefore;
}`,
    sampleTests: [
      {
        input: "n = 2",
        expectedOutput: "2",
      },
      {
        input: "n = 5",
        expectedOutput: "8",
      },
    ],
  },
  {
    id: 117,
    slug: "house-robber",
    title: "House Robber",
    difficulty: "medium",
    topic: "Dynamic Programming",
    description:
      "You are a professional robber planning to rob houses along a street. Each house has some amount of money stashed, but adjacent houses have security systems connected. Return the maximum amount you can rob tonight without alerting the police.",
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "4",
      },
      {
        input: "nums = [2,7,9,3,1]",
        output: "12",
      },
    ],
    constraints: [
      "1 <= nums.length <= 100",
      "0 <= nums[i] <= 400",
    ],
    starterTemplate: `/**
 * @param {number[]} nums
 * @return {number}
 */
function rob(nums) {
  let robPrevious = 0;
  let skipPrevious = 0;

  for (const amount of nums) {
    const nextRob = skipPrevious + amount;
    skipPrevious = Math.max(skipPrevious, robPrevious);
    robPrevious = nextRob;
  }

  return Math.max(robPrevious, skipPrevious);
}`,
    hints: [
      "At each house, decide whether to rob it or skip it based on the best result up to the previous houses.",
      "You can track two states: best total if you rob this house and best total if you skip it.",
      "This is a linear DP that can be done in O(1) extra space.",
    ],
    referenceSolution: `function rob(nums) {
  let robPrevious = 0;
  let skipPrevious = 0;

  for (const amount of nums) {
    const nextRob = skipPrevious + amount;
    skipPrevious = Math.max(skipPrevious, robPrevious);
    robPrevious = nextRob;
  }

  return Math.max(robPrevious, skipPrevious);
}`,
    sampleTests: [
      {
        input: "nums = [1,2,3,1]",
        expectedOutput: "4",
      },
      {
        input: "nums = [2,7,9,3,1]",
        expectedOutput: "12",
      },
    ],
  },
  {
    id: 124,
    slug: "coin-change",
    title: "Coin Change",
    difficulty: "medium",
    topic: "Dynamic Programming",
    description:
      "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins needed to make up that amount, or -1 if that amount cannot be made up.",
    examples: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        note: "11 = 5 + 5 + 1",
      },
      {
        input: "coins = [2], amount = 3",
        output: "-1",
      },
    ],
    constraints: [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4",
    ],
    starterTemplate: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let currentAmount = 1; currentAmount <= amount; currentAmount += 1) {
    for (const coin of coins) {
      if (coin <= currentAmount) {
        dp[currentAmount] = Math.min(dp[currentAmount], dp[currentAmount - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    hints: [
      "Define dp[x] as the minimum number of coins needed to make amount x.",
      "For each amount, try taking each coin and transition from dp[x - coin].",
      "Initialize unreachable states with Infinity and convert that back to -1 at the end.",
    ],
    referenceSolution: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let currentAmount = 1; currentAmount <= amount; currentAmount += 1) {
    for (const coin of coins) {
      if (coin <= currentAmount) {
        dp[currentAmount] = Math.min(dp[currentAmount], dp[currentAmount - coin] + 1);
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    sampleTests: [
      {
        input: "coins = [1,2,5], amount = 11",
        expectedOutput: "3",
      },
      {
        input: "coins = [2], amount = 3",
        expectedOutput: "-1",
      },
    ],
  },
];

export const problemSeeds = loadProblemRecords(problemSeedData);
