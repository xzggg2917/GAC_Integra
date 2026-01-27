# 无限循环修复方案

## 问题根源
所有QuestionPage组件中的`handleAnswerChange`函数都使用了多个useState，并且这些state被作为useCallback的依赖项，导致：
1. 每次状态更新 → 函数重新创建
2. 函数重新创建 → 触发依赖该函数的组件重新渲染  
3. 重新渲染 → 再次更新状态
4. 形成无限循环

## 解决方案
**使用函数式setState + 空依赖数组**

### 关键修改点：

#### 1. useCallback使用空依赖数组
```typescript
const handleAnswerChange = React.useCallback((questionId: string, value: string | string[]) => {
  // ...
}, []) // 空依赖数组，函数永不重新创建
```

#### 2. 使用函数式setState获取最新状态
```typescript
setAnswers(prevAnswers => {
  const newAnswers = { ...prevAnswers, [questionId]: value }
  // 使用newAnswers做其他操作
  return newAnswers
})
```

#### 3. 嵌套setState确保状态同步
```typescript
setAnswers(prevAnswers => {
  const newAnswers = {...}
  
  setQuestionScores(prevScores => {
    const newScores = {...}
    
    setWeights(prevWeights => {
      // 计算总分，使用最新的三个状态
      setScore('dimension-id', total)
      return prevWeights // 返回不变的权重
    })
    
    return newScores
  })
  
  return newAnswers
})
```

## 需要修复的文件
- [x] QuestionPageGreen.tsx ✅ 已修复
- [ ] QuestionPageRed.tsx
- [ ] QuestionPageBlue.tsx
- [ ] QuestionPageViolet.tsx
- [ ] QuestionPageYellow.tsx
- [ ] QuestionPageCyan.tsx
- [ ] QuestionPageOrange.tsx
- [ ] QuestionPageWhite.tsx

## 每个文件需要修复3个函数
1. `handleAnswerChange` - 处理答案变化
2. `handleWeightChange` - 处理权重变化
3. `normalizeWeights` - 归一化权重
