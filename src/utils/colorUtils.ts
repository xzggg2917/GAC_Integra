/**
 * 根据分数计算颜色（红到绿渐变）
 * @param score 当前分数
 * @param maxScore 最大分数
 * @returns RGB颜色字符串
 */
export function getScoreColor(score: number, maxScore: number): string {
  if (maxScore === 0) return 'rgb(107, 114, 128)' // 灰色，无数据
  
  const percentage = Math.min(Math.max(score / maxScore, 0), 1) // 限制在0-1之间
  
  // 定义颜色点：红色(0%) -> 黄色(50%) -> 绿色(100%)
  const red = { r: 239, g: 68, b: 68 }      // #ef4444
  const yellow = { r: 234, g: 179, b: 8 }   // #eab308
  const green = { r: 16, g: 185, b: 129 }   // #10b981
  
  let r: number, g: number, b: number
  
  if (percentage < 0.5) {
    // 0-50%: 红色到黄色
    const localPercent = percentage * 2 // 转换为0-1
    r = Math.round(red.r + (yellow.r - red.r) * localPercent)
    g = Math.round(red.g + (yellow.g - red.g) * localPercent)
    b = Math.round(red.b + (yellow.b - red.b) * localPercent)
  } else {
    // 50-100%: 黄色到绿色
    const localPercent = (percentage - 0.5) * 2 // 转换为0-1
    r = Math.round(yellow.r + (green.r - yellow.r) * localPercent)
    g = Math.round(yellow.g + (green.g - yellow.g) * localPercent)
    b = Math.round(yellow.b + (green.b - yellow.b) * localPercent)
  }
  
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 根据分数计算带透明度的颜色
 */
export function getScoreColorWithAlpha(score: number, maxScore: number, alpha: number): string {
  const rgb = getScoreColor(score, maxScore)
  const matches = rgb.match(/\d+/g)
  if (!matches) return `rgba(107, 114, 128, ${alpha})`
  return `rgba(${matches[0]}, ${matches[1]}, ${matches[2]}, ${alpha})`
}
