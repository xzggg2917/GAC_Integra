/**
 * 根据分数计算颜色（红到绿渐变，用于所有分数显示）
 * 分数越高越绿色，越低越红色
 * 0-30分：深红色 → 橙色（红色为主体）
 * 30-50分：橙色 → 黄色
 * 50-70分：黄色 → 浅绿色（黄绿色为主体）
 * 70-100分：浅绿色 → 深绿色（绿色为主）
 * @param score 当前分数（0-100）
 * @returns RGB颜色字符串
 */
export function getQuestionScoreColor(score: number): string {
  // 限制在0-100之间
  const s = Math.min(Math.max(score, 0), 100)
  
  // 定义关键颜色点（反转：分数越高越绿）
  const red = { r: 220, g: 38, b: 38 }           // 0分：深红色 #dc2626
  const orange = { r: 251, g: 146, b: 60 }       // 30分：橙色 #fb923c
  const yellow = { r: 250, g: 204, b: 21 }       // 50分：黄色 #facc15
  const lightGreen = { r: 134, g: 239, b: 172 }  // 70分：浅绿色 #86efac
  const darkGreen = { r: 22, g: 163, b: 74 }     // 100分：深绿色 #16a34a
  
  let r: number, g: number, b: number
  
  if (s <= 30) {
    // 0-30分：深红色 -> 橙色
    const t = s / 30
    r = Math.round(red.r + (orange.r - red.r) * t)
    g = Math.round(red.g + (orange.g - red.g) * t)
    b = Math.round(red.b + (orange.b - red.b) * t)
  } else if (s <= 50) {
    // 30-50分：橙色 -> 黄色
    const t = (s - 30) / 20
    r = Math.round(orange.r + (yellow.r - orange.r) * t)
    g = Math.round(orange.g + (yellow.g - orange.g) * t)
    b = Math.round(orange.b + (yellow.b - orange.b) * t)
  } else if (s <= 70) {
    // 50-70分：黄色 -> 浅绿色
    const t = (s - 50) / 20
    r = Math.round(yellow.r + (lightGreen.r - yellow.r) * t)
    g = Math.round(yellow.g + (lightGreen.g - yellow.g) * t)
    b = Math.round(yellow.b + (lightGreen.b - yellow.b) * t)
  } else {
    // 70-100分：浅绿色 -> 深绿色
    const t = (s - 70) / 30
    r = Math.round(lightGreen.r + (darkGreen.r - lightGreen.r) * t)
    g = Math.round(lightGreen.g + (darkGreen.g - lightGreen.g) * t)
    b = Math.round(lightGreen.b + (darkGreen.b - lightGreen.b) * t)
  }
  
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 根据分数计算颜色（红到绿渐变）- 保留旧函数以兼容
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
