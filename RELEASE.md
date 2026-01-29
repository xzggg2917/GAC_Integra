# 📦 如何发布到 GitHub Releases

## 方式 1：自动发布（推荐）

使用 Git 标签自动触发 GitHub Actions 构建和发布：

### 步骤：

1. **确保代码已提交到 GitHub**
   ```bash
   git add .
   git commit -m "feat: Release version 1.0.0"
   git push origin main
   ```

2. **创建版本标签并推送**
   ```bash
   # 创建标签（v开头，如 v1.0.0）
   git tag v1.0.0
   
   # 推送标签到 GitHub
   git push origin v1.0.0
   ```

3. **GitHub Actions 自动构建**
   - 访问你的 GitHub 仓库
   - 点击 "Actions" 标签
   - 查看构建进度
   - 构建成功后，自动创建 Release

4. **查看发布**
   - 进入仓库的 "Releases" 页面
   - 可以看到新创建的 release，包含安装程序下载

## 方式 2：手动发布

如果你想手动上传安装程序：

### 步骤：

1. **本地构建**
   ```bash
   npm run build
   npm run build:electron
   ```

2. **查找安装程序**
   - 位置：`release\GAC Integra Setup 1.0.0.exe`

3. **在 GitHub 创建 Release**
   - 访问：`https://github.com/你的用户名/你的仓库名/releases/new`
   - Tag version: `v1.0.0`
   - Release title: `GAC Integra v1.0.0`
   - 描述：复制下面的模板
   - 拖拽上传 `GAC Integra Setup 1.0.0.exe`
   - 点击 "Publish release"

### Release 描述模板：

```markdown
## GAC Integra v1.0.0

### Green Analytical Chemistry Integration Platform

**New Release Available!**

Download the installer below to get started with comprehensive multi-dimensional assessment for green analytical chemistry.

### Installation
1. Download `GAC Integra Setup 1.0.0.exe`
2. Run the installer
3. Follow the setup wizard
4. Launch GAC Integra from your desktop or start menu

### Features
- 🌱 9-dimensional green chemistry assessment
- 📊 Interactive visualization (Treemap & Sunburst)
- 💾 Project save and load functionality
- ⚖️ Customizable dimension weights
- 📈 Real-time score calculation

### System Requirements
- Windows 10 or later (64-bit)
- 100 MB free disk space

---
For issues or questions, please visit the [Issues](https://github.com/YOUR_USERNAME/YOUR_REPO/issues) page.
```

## 版本号规范

遵循语义化版本（Semantic Versioning）：

- **主版本号**：不兼容的 API 修改（如 1.0.0 → 2.0.0）
- **次版本号**：向下兼容的功能性新增（如 1.0.0 → 1.1.0）
- **修订号**：向下兼容的问题修正（如 1.0.0 → 1.0.1）

例如：
- `v1.0.0` - 首次发布
- `v1.0.1` - Bug 修复
- `v1.1.0` - 新增功能
- `v2.0.0` - 重大更新

## 更新版本号

编辑 `package.json` 的 version 字段：

```json
{
  "version": "1.0.1"
}
```

然后重新构建和发布。

## 常见问题

### Q: GitHub Actions 没有运行？
A: 检查：
- 标签是否以 `v` 开头（如 `v1.0.0`）
- 是否已推送标签到远程：`git push origin v1.0.0`
- Actions 是否已启用：Settings → Actions → Allow all actions

### Q: 构建失败？
A: 查看 Actions 日志，常见问题：
- Node.js 版本不匹配
- 依赖安装失败
- icon.png 文件缺失

### Q: 需要更新 Release 描述？
A: 在 GitHub Releases 页面，点击 "Edit" 按钮编辑。

## 本地测试

在发布前，建议本地测试安装程序：

```bash
# 构建
npm run build
npm run build:electron

# 测试安装程序
cd release
.\GAC Integra Setup 1.0.0.exe
```

---

**当前构建状态：**
- ✅ React 应用构建成功
- ✅ Electron 打包完成
- ✅ 安装程序已生成：`release\GAC Integra Setup 1.0.0.exe`
- ✅ GitHub Actions 工作流已配置
- ⏳ 等待推送到 GitHub 并创建标签
