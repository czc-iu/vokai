export function estimateTokens(text: string): number {
  if (!text) return 0
  
  let tokens = 0
  let chineseChars = 0
  let englishChars = 0
  let otherChars = 0
  
  for (const char of text) {
    const code = char.charCodeAt(0)
    if (code >= 0x4e00 && code <= 0x9fff) {
      chineseChars++
    } else if (/[a-zA-Z0-9]/.test(char)) {
      englishChars++
    } else {
      otherChars++
    }
  }
  
  tokens = Math.ceil(chineseChars * 1.5 + englishChars * 0.25 + otherChars * 0.5)
  
  return Math.max(1, tokens)
}

export function calculateMessageTokens(
  userMessage: string,
  assistantMessage: string
): { inputTokens: number; outputTokens: number; totalTokens: number } {
  const inputTokens = estimateTokens(userMessage)
  const outputTokens = estimateTokens(assistantMessage)
  
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens
  }
}
