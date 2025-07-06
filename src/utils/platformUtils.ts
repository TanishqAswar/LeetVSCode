// src/utils/platformUtils.ts
import { ProblemInfo } from '../types'

export const detectCodingPlatform = (url: string): boolean => {
  return /leetcode\.com|geeksforgeeks\.org|codingninjas\.com|codeforces\.com|codechef\.com|hackerrank\.com|atcoder\.jp/i.test(
    url
  )
}

export const extractProblemInfo = (url: string, html: string): ProblemInfo => {
  let title = 'Coding Problem'
  let difficulty = ''
  let tags: string[] = []

  if (url.includes('leetcode.com')) {
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(' - LeetCode', '').trim()
    }

    // Extract difficulty
    const difficultyMatch = html.match(/difficulty[^>]*>([^<]*)</i)
    if (difficultyMatch) {
      difficulty = difficultyMatch[1].trim()
    }

    // Extract tags
    const tagMatches = html.matchAll(/data-cy="topic-tag"[^>]*>([^<]*)</gi)
    tags = Array.from(tagMatches)
      .map((match) => match[1].trim())
      .slice(0, 3)
  } else if (url.includes('geeksforgeeks.org')) {
    // Extract title
    const titleMatch =
      html.match(/<h1[^>]*>([^<]*)<\/h1>/i) ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(' - GeeksforGeeks', '').trim()
    }

    // Extract difficulty
    const difficultyMatch =
      html.match(/difficulty[^>]*>([^<]*)</i) ||
      html.match(/Level[^>]*>([^<]*)</i)
    if (difficultyMatch) {
      difficulty = difficultyMatch[1].trim()
    }

    // Extract tags
    const tagMatches = html.matchAll(/tag[^>]*>([^<]*)</gi)
    tags = Array.from(tagMatches)
      .map((match) => match[1].trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 3)
  } else if (url.includes('codingninjas.com')) {
    // Extract title
    const titleMatch =
      html.match(/<h1[^>]*>([^<]*)<\/h1>/i) ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(' | Coding Ninjas', '').trim()
    }

    // Extract difficulty
    const difficultyMatch =
      html.match(/difficulty[^>]*>([^<]*)</i) ||
      html.match(/level[^>]*>([^<]*)</i)
    if (difficultyMatch) {
      difficulty = difficultyMatch[1].trim()
    }

    // Extract tags
    const tagMatches = html.matchAll(/topic[^>]*>([^<]*)</gi)
    tags = Array.from(tagMatches)
      .map((match) => match[1].trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 3)
  } else if (url.includes('codeforces.com')) {
    // Extract title
    const titleMatch =
      html.match(/<div[^>]*class="title"[^>]*>([^<]*)<\/div>/i) ||
      html.match(/<h1[^>]*>([^<]*)<\/h1>/i) ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(' - Codeforces', '').trim()
    }

    // Extract difficulty (rating)
    const difficultyMatch =
      html.match(/rating[^>]*>([^<]*)</i) || html.match(/\*(\d+)/i)
    if (difficultyMatch) {
      difficulty = difficultyMatch[1].trim()
    }

    // Extract tags
    const tagMatches = html.matchAll(/tag[^>]*>([^<]*)</gi)
    tags = Array.from(tagMatches)
      .map((match) => match[1].trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 3)
  } else if (url.includes('codechef.com')) {
    // Extract title
    const titleMatch =
      html.match(/<h1[^>]*>([^<]*)<\/h1>/i) ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(' | CodeChef', '').trim()
    }

    // Extract difficulty
    const difficultyMatch =
      html.match(/difficulty[^>]*>([^<]*)</i) ||
      html.match(/level[^>]*>([^<]*)</i)
    if (difficultyMatch) {
      difficulty = difficultyMatch[1].trim()
    }

    // Extract tags
    const tagMatches = html.matchAll(/tag[^>]*>([^<]*)</gi)
    tags = Array.from(tagMatches)
      .map((match) => match[1].trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 3)
  } else if (url.includes('hackerrank.com')) {
    // Extract title
    const titleMatch =
      html.match(/<h1[^>]*>([^<]*)<\/h1>/i) ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(' | HackerRank', '').trim()
    }

    // Extract difficulty
    const difficultyMatch =
      html.match(/difficulty[^>]*>([^<]*)</i) ||
      html.match(/level[^>]*>([^<]*)</i)
    if (difficultyMatch) {
      difficulty = difficultyMatch[1].trim()
    }

    // Extract tags/domains
    const tagMatches =
      html.matchAll(/domain[^>]*>([^<]*)</gi) ||
      html.matchAll(/tag[^>]*>([^<]*)</gi)
    tags = Array.from(tagMatches)
      .map((match) => match[1].trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 3)
  } else if (url.includes('atcoder.jp')) {
    // Extract title
    const titleMatch =
      html.match(/<h1[^>]*>([^<]*)<\/h1>/i) ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].replace(' - AtCoder', '').trim()
    }

    // Extract difficulty (color/rating)
    const difficultyMatch =
      html.match(/color[^>]*>([^<]*)</i) || html.match(/rating[^>]*>([^<]*)</i)
    if (difficultyMatch) {
      difficulty = difficultyMatch[1].trim()
    }

    // Extract tags
    const tagMatches = html.matchAll(/tag[^>]*>([^<]*)</gi)
    tags = Array.from(tagMatches)
      .map((match) => match[1].trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 3)
  }

  return { title, difficulty, tags }
}

// Helper function to get platform name from URL
export const getPlatformName = (url: string): string => {
  if (url.includes('leetcode.com')) return 'LeetCode'
  if (url.includes('geeksforgeeks.org')) return 'GeeksforGeeks'
  if (url.includes('codingninjas.com')) return 'Coding Ninjas'
  if (url.includes('codeforces.com')) return 'Codeforces'
  if (url.includes('codechef.com')) return 'CodeChef'
  if (url.includes('hackerrank.com')) return 'HackerRank'
  if (url.includes('atcoder.jp')) return 'AtCoder'
  return 'Unknown Platform'
}

// Helper function to get platform-specific selectors for more robust extraction
export const getPlatformSelectors = (url: string) => {
  const selectors = {
    title: [] as string[],
    difficulty: [] as string[],
    tags: [] as string[],
  }

  if (url.includes('leetcode.com')) {
    selectors.title = ['h1', '.css-v3d350', '[data-cy="question-title"]']
    selectors.difficulty = ['[diff]', '.css-10o4wqw', '[data-difficulty]']
    selectors.tags = ['[data-cy="topic-tag"]', '.topic-tag']
  } else if (url.includes('geeksforgeeks.org')) {
    selectors.title = ['h1', '.entry-title', '.problem-title']
    selectors.difficulty = ['.difficulty', '.level', '[data-difficulty]']
    selectors.tags = ['.tag', '.topic', '.category']
  } else if (url.includes('codingninjas.com')) {
    selectors.title = ['h1', '.problem-title', '.question-title']
    selectors.difficulty = ['.difficulty', '.level', '[data-level]']
    selectors.tags = ['.topic', '.tag', '.category']
  } else if (url.includes('codeforces.com')) {
    selectors.title = ['.title', 'h1', '.problem-title']
    selectors.difficulty = ['.tag-box', '.rating', '[data-rating]']
    selectors.tags = ['.tag', '.topic', '.category']
  } else if (url.includes('codechef.com')) {
    selectors.title = ['h1', '.problem-title', '.title']
    selectors.difficulty = ['.difficulty', '.level', '[data-difficulty]']
    selectors.tags = ['.tag', '.topic', '.category']
  } else if (url.includes('hackerrank.com')) {
    selectors.title = ['h1', '.problem-title', '.challenge-title']
    selectors.difficulty = ['.difficulty', '.level', '[data-difficulty]']
    selectors.tags = ['.tag', '.domain', '.topic']
  } else if (url.includes('atcoder.jp')) {
    selectors.title = ['h1', '.problem-title', '.title']
    selectors.difficulty = ['.difficulty', '.color', '[data-difficulty]']
    selectors.tags = ['.tag', '.topic', '.category']
  }

  return selectors
}
