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
    const titleMatch = html.match(/<h1[^>]*>([^<]*)<\/h1>/i)
    if (titleMatch) {
      title = titleMatch[1].trim()
    }
  } else if (url.includes('codeforces.com')) {
    const titleMatch = html.match(/<div[^>]*class="title"[^>]*>([^<]*)<\/div>/i)
    if (titleMatch) {
      title = titleMatch[1].trim()
    }
  }

  return { title, difficulty, tags }
}
