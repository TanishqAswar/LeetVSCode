// src/components/MarkdownRenderer.tsx
import React from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip empty lines but add spacing
      if (line.trim() === '') {
        elements.push(<div key={key++} className='h-2' />)
        continue
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className='text-lg font-bold text-gray-800 mt-4 mb-2'>
            {parseInlineFormatting(line.slice(4))}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className='text-xl font-bold text-gray-800 mt-4 mb-2'>
            {parseInlineFormatting(line.slice(3))}
          </h2>
        )
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={key++}
            className='text-2xl font-bold text-gray-800 mt-4 mb-2'
          >
            {parseInlineFormatting(line.slice(2))}
          </h1>
        )
      }
      // Horizontal rule
      else if (line.trim() === '---') {
        elements.push(<hr key={key++} className='border-gray-300 my-4' />)
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={key++}
            className='border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 my-2 italic'
          >
            {parseInlineFormatting(line.slice(2))}
          </blockquote>
        )
      }
      // Unordered lists
      else if (line.match(/^[\s]*[-\*\+]\s/)) {
        const listItems: React.ReactNode[] = []
        let j = i

        while (j < lines.length && lines[j].match(/^[\s]*[-\*\+]\s/)) {
          const item = lines[j].replace(/^[\s]*[-\*\+]\s/, '')
          listItems.push(
            <li key={key++} className='mb-1'>
              {parseInlineFormatting(item)}
            </li>
          )
          j++
        }

        elements.push(
          <ul key={key++} className='list-disc ml-6 mb-4'>
            {listItems}
          </ul>
        )
        i = j - 1 // Adjust loop counter
      }
      // Ordered lists
      else if (line.match(/^[\s]*\d+\.\s/)) {
        const listItems: React.ReactNode[] = []
        let j = i

        while (j < lines.length && lines[j].match(/^[\s]*\d+\.\s/)) {
          const item = lines[j].replace(/^[\s]*\d+\.\s/, '')
          listItems.push(
            <li key={key++} className='mb-1'>
              {parseInlineFormatting(item)}
            </li>
          )
          j++
        }

        elements.push(
          <ol key={key++} className='list-decimal ml-6 mb-4'>
            {listItems}
          </ol>
        )
        i = j - 1 // Adjust loop counter
      }
      // Code blocks (simple version)
      else if (line.startsWith('```')) {
        const codeLines: string[] = []
        let j = i + 1

        while (j < lines.length && !lines[j].startsWith('```')) {
          codeLines.push(lines[j])
          j++
        }

        elements.push(
          <pre
            key={key++}
            className='bg-gray-100 border rounded p-3 my-3 overflow-x-auto text-sm'
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        )
        i = j // Skip to end of code block
      }
      // Regular paragraphs
      else {
        elements.push(
          <p key={key++} className='mb-3 leading-relaxed'>
            {parseInlineFormatting(line)}
          </p>
        )
      }
    }

    return elements
  }

  // Parse inline formatting (bold, italic, code, links)
  const parseInlineFormatting = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = []
    let remainingText = text
    let key = 0

    // Process text with multiple formatting patterns
    while (remainingText.length > 0) {
      let matched = false

      // Bold text (**text**)
      const boldMatch = remainingText.match(/^(.*?)\*\*(.*?)\*\*(.*)/s)
      if (boldMatch) {
        const [, before, content, after] = boldMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <strong key={key++} className='font-bold'>
            {content}
          </strong>
        )
        remainingText = after
        matched = true
        continue
      }

      // Italic text (*text*)
      const italicMatch = remainingText.match(/^(.*?)\*(.*?)\*(.*)/s)
      if (italicMatch) {
        const [, before, content, after] = italicMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <em key={key++} className='italic'>
            {content}
          </em>
        )
        remainingText = after
        matched = true
        continue
      }

      // Inline code (`code`)
      const codeMatch = remainingText.match(/^(.*?)`(.*?)`(.*)/s)
      if (codeMatch) {
        const [, before, content, after] = codeMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <code
            key={key++}
            className='bg-gray-200 px-1 py-0.5 rounded text-sm font-mono'
          >
            {content}
          </code>
        )
        remainingText = after
        matched = true
        continue
      }

      // Links [text](url)
      const linkMatch = remainingText.match(/^(.*?)\[(.*?)\]\((.*?)\)(.*)/s)
      if (linkMatch) {
        const [, before, linkText, url, after] = linkMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <a
            key={key++}
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-800 underline'
          >
            {linkText}
          </a>
        )
        remainingText = after
        matched = true
        continue
      }

      // If no patterns matched, add the remaining text
      if (!matched) {
        elements.push(<span key={key++}>{remainingText}</span>)
        break
      }
    }

    return elements
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {parseMarkdown(content)}
    </div>
  )
}

// Enhanced version with more features
export const AdvancedMarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  // Enhanced markdown parser with more features
  const parseAdvancedMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n')
    const elements: React.ReactNode[] = []
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Skip empty lines but add spacing
      if (line.trim() === '') {
        elements.push(<div key={key++} className='h-3' />)
        continue
      }

      // Headers with different styling
      if (line.startsWith('#### ')) {
        elements.push(
          <h4
            key={key++}
            className='text-base font-semibold text-gray-800 mt-3 mb-2 border-b border-gray-200 pb-1'
          >
            {parseAdvancedInlineFormatting(line.slice(5))}
          </h4>
        )
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={key++}
            className='text-lg font-bold text-gray-800 mt-4 mb-2 text-blue-700'
          >
            {parseAdvancedInlineFormatting(line.slice(4))}
          </h3>
        )
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={key++}
            className='text-xl font-bold text-gray-800 mt-5 mb-3 border-b-2 border-blue-500 pb-1'
          >
            {parseAdvancedInlineFormatting(line.slice(3))}
          </h2>
        )
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={key++}
            className='text-2xl font-bold text-gray-900 mt-6 mb-4 border-b-2 border-gray-300 pb-2'
          >
            {parseAdvancedInlineFormatting(line.slice(2))}
          </h1>
        )
      }
      // Enhanced horizontal rule
      else if (line.trim() === '---') {
        elements.push(
          <hr key={key++} className='border-gray-300 my-6 border-t-2' />
        )
      }
      // Enhanced blockquotes with different colors
      else if (line.startsWith('> ')) {
        const quoteContent = line.slice(2)
        let bgColor = 'bg-blue-50 border-blue-500'

        // Different colors for different types of quotes
        if (
          quoteContent.includes('💡') ||
          quoteContent.toLowerCase().includes('tip')
        ) {
          bgColor = 'bg-yellow-50 border-yellow-500'
        } else if (
          quoteContent.includes('⚠️') ||
          quoteContent.toLowerCase().includes('warning')
        ) {
          bgColor = 'bg-red-50 border-red-500'
        } else if (
          quoteContent.includes('✅') ||
          quoteContent.toLowerCase().includes('success')
        ) {
          bgColor = 'bg-green-50 border-green-500'
        }

        elements.push(
          <blockquote
            key={key++}
            className={`border-l-4 ${bgColor} pl-4 py-3 my-3 italic rounded-r`}
          >
            {parseAdvancedInlineFormatting(quoteContent)}
          </blockquote>
        )
      }
      // Task lists (- [ ] and - [x])
      else if (line.match(/^[\s]*-\s\[([ x])\]\s/)) {
        const isChecked = line.includes('[x]')
        const taskText = line.replace(/^[\s]*-\s\[([ x])\]\s/, '')

        elements.push(
          <div key={key++} className='flex items-center mb-2'>
            <input
              type='checkbox'
              checked={isChecked}
              readOnly
              className='mr-2 rounded'
            />
            <span className={isChecked ? 'line-through text-gray-500' : ''}>
              {parseAdvancedInlineFormatting(taskText)}
            </span>
          </div>
        )
      }
      // Regular unordered lists with better styling
      else if (line.match(/^[\s]*[-\*\+]\s/)) {
        const listItems: React.ReactNode[] = []
        let j = i

        while (j < lines.length && lines[j].match(/^[\s]*[-\*\+]\s/)) {
          const item = lines[j].replace(/^[\s]*[-\*\+]\s/, '')
          listItems.push(
            <li key={key++} className='mb-2 pl-1'>
              {parseAdvancedInlineFormatting(item)}
            </li>
          )
          j++
        }

        elements.push(
          <ul key={key++} className='list-disc ml-6 mb-4 space-y-1'>
            {listItems}
          </ul>
        )
        i = j - 1
      }
      // Enhanced ordered lists
      else if (line.match(/^[\s]*\d+\.\s/)) {
        const listItems: React.ReactNode[] = []
        let j = i

        while (j < lines.length && lines[j].match(/^[\s]*\d+\.\s/)) {
          const item = lines[j].replace(/^[\s]*\d+\.\s/, '')
          listItems.push(
            <li key={key++} className='mb-2 pl-1'>
              {parseAdvancedInlineFormatting(item)}
            </li>
          )
          j++
        }

        elements.push(
          <ol key={key++} className='list-decimal ml-6 mb-4 space-y-1'>
            {listItems}
          </ol>
        )
        i = j - 1
      }
      // Enhanced code blocks with syntax highlighting placeholders
      else if (line.startsWith('```')) {
        const language = line.slice(3).trim()
        const codeLines: string[] = []
        let j = i + 1

        while (j < lines.length && !lines[j].startsWith('```')) {
          codeLines.push(lines[j])
          j++
        }

        elements.push(
          <div key={key++} className='my-4'>
            {language && (
              <div className='bg-gray-200 px-3 py-1 text-xs font-mono text-gray-600 rounded-t'>
                {language}
              </div>
            )}
            <pre
              className={`bg-gray-900 text-green-400 ${
                language ? 'rounded-b' : 'rounded'
              } p-4 overflow-x-auto text-sm font-mono`}
            >
              <code>{codeLines.join('\n')}</code>
            </pre>
          </div>
        )
        i = j
      }
      // Tables (basic support)
      else if (line.includes('|')) {
        const tableRows: React.ReactNode[] = []
        let j = i
        let isFirstRow = true

        while (j < lines.length && lines[j].includes('|')) {
          const row = lines[j].trim()
          if (row.startsWith('|') && row.endsWith('|')) {
            const cells = row
              .slice(1, -1)
              .split('|')
              .map((cell) => cell.trim())

            if (isFirstRow) {
              tableRows.push(
                <tr key={key++} className='bg-gray-100'>
                  {cells.map((cell, idx) => (
                    <th
                      key={idx}
                      className='border px-4 py-2 font-semibold text-left'
                    >
                      {parseAdvancedInlineFormatting(cell)}
                    </th>
                  ))}
                </tr>
              )
              isFirstRow = false
            } else if (!cells.every((cell) => cell.match(/^:?-+:?$/))) {
              // Skip separator rows (like |---|---|)
              tableRows.push(
                <tr key={key++} className='odd:bg-gray-50'>
                  {cells.map((cell, idx) => (
                    <td key={idx} className='border px-4 py-2'>
                      {parseAdvancedInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              )
            }
          }
          j++
        }

        if (tableRows.length > 0) {
          elements.push(
            <table
              key={key++}
              className='border-collapse border border-gray-300 my-4 w-full'
            >
              <tbody>{tableRows}</tbody>
            </table>
          )
        }
        i = j - 1
      }
      // Regular paragraphs with enhanced styling
      else {
        elements.push(
          <p key={key++} className='mb-4 leading-relaxed text-gray-800'>
            {parseAdvancedInlineFormatting(line)}
          </p>
        )
      }
    }

    return elements
  }

  // Enhanced inline formatting with more patterns
  const parseAdvancedInlineFormatting = (text: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = []
    let remainingText = text
    let key = 0

    while (remainingText.length > 0) {
      let matched = false

      // Strikethrough (~~text~~)
      const strikeMatch = remainingText.match(/^(.*?)~~(.*?)~~(.*)/s)
      if (strikeMatch) {
        const [, before, content, after] = strikeMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <del key={key++} className='line-through text-gray-500'>
            {content}
          </del>
        )
        remainingText = after
        matched = true
        continue
      }

      // Bold text (**text** or __text__)
      const boldMatch = remainingText.match(/^(.*?)(\*\*|__)(.*?)\2(.*)/s)
      if (boldMatch) {
        const [, before, , content, after] = boldMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <strong key={key++} className='font-bold text-gray-900'>
            {content}
          </strong>
        )
        remainingText = after
        matched = true
        continue
      }

      // Italic text (*text* or _text_)
      const italicMatch = remainingText.match(/^(.*?)(\*|_)(.*?)\2(.*)/s)
      if (italicMatch) {
        const [, before, , content, after] = italicMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <em key={key++} className='italic text-gray-700'>
            {content}
          </em>
        )
        remainingText = after
        matched = true
        continue
      }

      // Highlighted text (==text==)
      const highlightMatch = remainingText.match(/^(.*?)==(.*?)==(.*)/s)
      if (highlightMatch) {
        const [, before, content, after] = highlightMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <mark key={key++} className='bg-yellow-200 px-1 rounded'>
            {content}
          </mark>
        )
        remainingText = after
        matched = true
        continue
      }

      // Inline code (`code`)
      const codeMatch = remainingText.match(/^(.*?)`(.*?)`(.*)/s)
      if (codeMatch) {
        const [, before, content, after] = codeMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <code
            key={key++}
            className='bg-gray-800 text-green-400 px-2 py-1 rounded text-sm font-mono'
          >
            {content}
          </code>
        )
        remainingText = after
        matched = true
        continue
      }

      // Links [text](url "title")
      const linkMatch = remainingText.match(
        /^(.*?)\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)(.*)/s
      )
      if (linkMatch) {
        const [, before, linkText, url, title, after] = linkMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <a
            key={key++}
            href={url}
            title={title}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-800 underline hover:bg-blue-50 px-1 rounded transition-colors'
          >
            {linkText}
          </a>
        )
        remainingText = after
        matched = true
        continue
      }

      // Auto-links (https://example.com)
      const urlMatch = remainingText.match(
        /^(.*?)(https?:\/\/[^\s<>"\[\]]+)(.*)/s
      )
      if (urlMatch) {
        const [, before, url, after] = urlMatch
        if (before) elements.push(<span key={key++}>{before}</span>)
        elements.push(
          <a
            key={key++}
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-600 hover:text-blue-800 underline break-all'
          >
            {url}
          </a>
        )
        remainingText = after
        matched = true
        continue
      }

      // If no patterns matched, add the remaining text
      if (!matched) {
        elements.push(<span key={key++}>{remainingText}</span>)
        break
      }
    }

    return elements
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {parseAdvancedMarkdown(content)}
    </div>
  )
}

export default MarkdownRenderer
