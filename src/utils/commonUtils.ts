// src/utils/commonUtils.ts

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
    alert('✅ Copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy:', err)
    alert('❌ Failed to copy to clipboard')
  }
}
