# 期货策略长图生成器

这是一个基于 React 的期货策略长图生成器项目，使用 [Create React App](https://github.com/facebook/create-react-app) 创建。

## 项目简介

本项目用于生成期货盘前策略长图，包含以下功能：
- 期货数据输入表单
- K线图表展示
- 期货公司观点表格
- 图片导出功能

## 可用脚本

在项目目录中，您可以运行以下命令：

### `npm start`

在开发模式下运行应用程序。\
在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看。

当您进行编辑时，页面会重新加载。\
您还可以在控制台中看到任何 lint 错误。

### `npm test`

在交互式监视模式下启动测试运行器。\
有关更多信息，请参阅 [运行测试](https://facebook.github.io/create-react-app/docs/running-tests) 部分。

### `npm run build`

将应用程序构建到 `build` 文件夹以用于生产环境。\
它在生产模式下正确地打包 React，并优化构建以获得最佳性能。

构建被压缩，文件名包含哈希值。\
您的应用程序已准备好部署！

有关更多信息，请参阅 [部署](https://facebook.github.io/create-react-app/docs/deployment) 部分。

### `npm run eject`

**注意：这是一个单向操作。一旦您 `eject`，就无法回退！**

如果您对构建工具和配置选择不满意，可以随时 `eject`。此命令将从您的项目中删除单个构建依赖项。

相反，它会将所有配置文件和传递依赖项（webpack、Babel、ESLint 等）复制到您的项目中，以便您完全控制它们。除了 `eject` 之外的所有命令仍然有效，但它们将指向复制的脚本，以便您可以调整它们。此时您需要自己维护。

您不必使用 `eject`。精选的功能集适用于中小型部署，您不应该觉得有义务使用此功能。但是，我们理解如果您无法在准备好时自定义它，此工具将无用。

## 项目结构

```
src/
├── components/
│   ├── DataInputForm.tsx      # 数据输入表单组件
│   ├── CandlestickChart.tsx    # K线图表组件
│   ├── OpinionTable.tsx       # 观点表格组件
│   ├── FuturesInfoCard.tsx    # 主要信息卡片组件
│   └── ExportButton.tsx       # 导出按钮组件
├── App.tsx                     # 主应用组件
└── index.tsx                   # 应用入口点
```

## 组件说明

### 1. DataInputForm.tsx - 数据输入表单
**位置**: `src/components/DataInputForm.tsx`

**功能**: 提供期货数据输入界面，包含期货基本信息和公司观点两个部分

**核心数据结构**:
```typescript
interface FuturesData {
  contractName: string;     // 合约名称
  contractCode: string;     // 合约代码
  currentPrice: number;     // 当前价格
  changePercent: number;    // 涨跌幅
  changeAmount: number;     // 涨跌额
  date: string;            // 日期
  supportLevel: number;     // 支撑位
  resistanceLevel: number;  // 压力位
  mainPrice: number;       // 主力最新价
}

interface CompanyOpinion {
  company: string;     // 期货公司名称
  direction: string;   // 日内方向
  support: string;     // 支撑位
  resistance: string;  // 压力位
  logic: string;       // 观点逻辑
}
```

**主要逻辑**:
- **状态管理**: 使用 `useState` 管理 `futuresData` 和 `opinions` 两个状态
- **数据同步**: 通过 `onDataChange` 回调函数实时将数据变更传递给父组件
- **动态表单**: 支持动态添加/删除期货公司观点行
- **表单布局**: 使用 CSS Grid 实现响应式布局

**关键函数**:
- `handleFuturesDataChange`: 处理期货基本信息的变更
- `handleOpinionChange`: 处理公司观点的变更
- `addOpinion`: 添加新的公司观点
- `removeOpinion`: 删除指定的公司观点

**修改方法**:
- **添加新字段**: 在 `FuturesData` 或 `CompanyOpinion` 接口中添加新属性，在对应的 `InputGroup` 中添加输入框
- **修改样式**: 调整 styled-components 中的样式定义（如 `FormContainer`、`InputGroup` 等）
- **修改默认值**: 在 `useState` 初始化时修改默认数据
- **添加验证**: 在 `handleFuturesDataChange` 或 `handleOpinionChange` 中添加数据验证逻辑

### 2. CandlestickChart.tsx - K线图表
**位置**: `src/components/CandlestickChart.tsx`

**功能**: 使用 Chart.js 展示期货价格走势，包含价格线、支撑位、压力位

**技术栈**: 
- `react-chartjs-2`: React 的 Chart.js 封装
- `chart.js`: 图表库
- `styled-components`: 样式组件

**主要逻辑**:
- **数据生成**: `generateCandlestickData` 函数基于当前价格、支撑位、压力位生成模拟的价格走势数据
- **图表配置**: 创建包含三个数据集的图表：
  - 主价格线：根据涨跌情况显示红色或绿色
  - 支撑位：绿色虚线
  - 压力位：红色虚线
- **样式控制**: 根据涨跌幅动态调整颜色主题
- **响应式设计**: 图表自适应容器大小

**关键配置**:
- **图表选项**: `options` 对象配置坐标轴、工具提示、图例等
- **数据集**: 三条线分别表示价格走势、支撑位、压力位
- **颜色逻辑**: 根据 `data.changePercent >= 0` 判断涨跌，动态设置颜色

**布局结构**:
- `ChartHeader`: 显示合约信息、当前价格、涨跌幅
- `Line` 组件: 渲染实际图表

**修改方法**:
- **修改图表样式**: 调整 `options` 中的 `scales`、`plugins` 配置
- **添加新数据线**: 在 `datasets` 数组中添加新的数据集
- **修改颜色主题**: 调整 `borderColor`、`backgroundColor` 等颜色配置
- **修改数据生成**: 调整 `generateCandlestickData` 函数的算法
- **修改图表类型**: 将 `Line` 组件替换为其他图表类型（如 `Bar`、`Scatter` 等）

### 3. OpinionTable.tsx - 观点表格
**位置**: `src/components/OpinionTable.tsx`

**功能**: 以表格形式展示各期货公司的观点和分析，包含公司名称、方向、支撑压力位、观点逻辑

**主要逻辑**:
- **数据接收**: 接收 `CompanyOpinion[]` 类型的观点数据
- **空状态处理**: 当没有数据时显示 "暂无期货公司观点数据"
- **表格渲染**: 使用 HTML table 元素构建表格结构
- **方向标识**: 通过 `DirectionBadge` 组件为不同方向添加颜色标识

**表格结构**:
- **表头**: 期货公司、日内方向、支撑、压力、观点逻辑
- **数据行**: 动态渲染每个公司的观点信息
- **样式特性**: 悬停效果、边框分隔、颜色区分

**样式组件**:
- `TableContainer`: 表格外层容器，提供圆角和阴影
- `Table`: 表格主体，设置边框合并
- `HeaderCell`: 表头单元格，固定宽度和样式
- `DataCell`: 数据单元格，不同列有不同的对齐和颜色
- `DirectionBadge`: 方向标识组件，根据方向类型显示不同颜色

**颜色逻辑**:
- 支撑位：绿色 (`#28a745`)
- 压力位：红色 (`#dc3545`)
- 方向标识：根据 "偏多"、"偏空"、"震荡" 等显示不同背景色

**修改方法**:
- **添加新列**: 在 `CompanyOpinion` 接口中添加属性，在 `HeaderRow` 和 `DataRow` 中添加对应的 `HeaderCell` 和 `DataCell`
- **修改表格样式**: 调整 styled-components 中的表格相关样式
- **添加排序功能**: 在组件中添加排序状态和排序函数，修改数据渲染逻辑
- **修改颜色主题**: 调整 `DirectionBadge` 和单元格的颜色配置
- **添加筛选功能**: 添加筛选输入框和筛选逻辑

### 4. FuturesInfoCard.tsx - 主信息卡片
**位置**: `src/components/FuturesInfoCard.tsx`

**功能**: 整合所有组件，生成完整的策略长图，作为最终导出图片的容器

**组件结构**:
```
CardContainer (id="futures-info-card")
├── TopImage (顶部图片)
├── PriceHighlight (价格突出显示)
├── ChartSection (图表区域)
│   └── CandlestickChart
├── TableSection (表格区域)
│   └── OpinionTable
└── BottomImage (底部图片)
```

**主要逻辑**:
- **布局管理**: 使用 flexbox 垂直排列各个区域
- **数据传递**: 将接收到的 `data` 和 `opinions` 分别传递给子组件
- **导出容器**: 通过 `id="futures-info-card"` 为 html2canvas 提供导出目标
- **图片集成**: 集成顶部和底部装饰图片

**样式特性**:
- **卡片设计**: 白色背景、圆角、阴影效果
- **响应式布局**: 适应不同屏幕尺寸
- **间距控制**: 各区域间合理的间距分布
- **图片处理**: 顶部和底部图片的尺寸和位置控制

**关键样式组件**:
- `CardContainer`: 主容器，设置整体布局和样式
- `TopImage`/`BottomImage`: 顶部和底部装饰图片
- `PriceHighlight`: 价格突出显示区域
- `ChartSection`/`TableSection`: 图表和表格的容器区域

**修改方法**:
- **调整布局**: 修改 `CardContainer` 的 flexbox 属性或添加 CSS Grid
- **添加新区域**: 在 JSX 中添加新的 section，并创建对应的 styled-component
- **修改图片**: 替换 `src` 属性中的图片路径，或调整图片样式
- **调整间距**: 修改各 section 的 margin、padding 属性
- **修改整体主题**: 调整 `CardContainer` 的背景色、边框、阴影等属性

### 5. App.tsx - 主应用组件
**位置**: `src/App.tsx`

**功能**: 应用程序的根组件，负责整体布局、状态管理和组件协调

**主要逻辑**:
- **状态管理**: 管理全局的 `futuresData` 和 `opinions` 状态
- **数据流控制**: 接收来自 `DataInputForm` 的数据变更，传递给 `FuturesInfoCard`
- **布局设计**: 实现左右分栏布局（输入区域 + 预览区域）
- **响应式设计**: 在小屏幕设备上切换为单列布局

**组件结构**:
```
AppContainer
├── Header (标题区域)
│   ├── Title: "期货策略长图生成器"
│   └── Subtitle: "自动化生成专业的期货分析图表"
└── ContentContainer (主内容区域)
    ├── LeftPanel (左侧面板)
    │   ├── DataInputForm (数据输入表单)
    │   └── ExportSection (导出按钮区域)
    │       └── ExportButton
    └── RightPanel (右侧面板)
        └── FuturesInfoCard (策略长图预览)
```

**样式特性**:
- **渐变背景**: 使用 CSS 线性渐变创建专业的视觉效果
- **毛玻璃效果**: 导出区域使用 `backdrop-filter: blur(10px)` 实现毛玻璃效果
- **响应式网格**: 使用 CSS Grid 实现自适应布局
- **中文字体**: 优先使用 'PingFang SC'、'Microsoft YaHei' 等中文字体

**关键函数**:
- `handleDataChange`: 处理来自 `DataInputForm` 的数据变更，同步更新状态

**数据流**:
1. 用户在 `DataInputForm` 中输入数据
2. 通过 `onDataChange` 回调传递到 `App` 组件
3. `App` 组件更新状态并传递给 `FuturesInfoCard`
4. `FuturesInfoCard` 渲染更新后的策略长图
5. 用户点击 `ExportButton` 导出最终图片

**修改方法**:
- **调整布局**: 修改 `ContentContainer` 的 grid 配置
- **修改主题**: 调整背景渐变色、字体、间距等
- **添加新功能**: 在 `LeftPanel` 或 `RightPanel` 中添加新组件
- **修改响应式**: 调整 `@media` 查询的断点和布局

### 6. ExportButton.tsx - 导出按钮
**位置**: `src/components/ExportButton.tsx`

**功能**: 将策略长图导出为 PNG 图片文件，提供完整的导出流程和状态反馈

**核心依赖**: `html2canvas` - 将 DOM 元素转换为 Canvas 图片

**主要逻辑**:
- **目标定位**: 通过 `targetId` 找到要导出的 DOM 元素
- **图片生成**: 使用 html2canvas 将 DOM 转换为高质量图片
- **文件下载**: 创建下载链接并自动触发下载
- **状态管理**: 提供加载状态和结果反馈

**导出配置**:
```javascript
const canvas = await html2canvas(element, {
  scale: 2,              // 2倍分辨率提高图片质量
  useCORS: true,         // 允许跨域图片
  allowTaint: true,      // 允许污染的 canvas
  backgroundColor: null,  // 透明背景
  logging: false,        // 关闭调试日志
  // ... 其他尺寸配置
});
```

**状态管理**:
- `isExporting`: 控制导出进行状态
- `status`: 包含状态类型和消息的对象
  - `type`: 'success' | 'error' | 'info' | null
  - `message`: 状态描述文本

**用户体验**:
- **加载动画**: 导出时显示旋转加载图标
- **状态反馈**: 不同颜色的状态消息提示
- **按钮禁用**: 导出期间禁用按钮防止重复操作
- **自动清除**: 3秒后自动清除状态消息

**文件命名**: `${filename}-${日期}.png` 格式

**修改方法**:
- **修改导出质量**: 调整 `scale` 参数（1-3 之间）
- **修改导出格式**: 将 `canvas.toDataURL('image/png', 1.0)` 改为 'image/jpeg' 等
- **添加导出选项**: 添加尺寸选择、格式选择等 UI 控件
- **修改文件名**: 调整 `link.download` 的命名规则
- **优化性能**: 调整 html2canvas 的配置参数
- **添加预览**: 在下载前显示生成的图片预览

## 技术架构

### 核心技术栈
- **React 19.1.1**: 前端框架
- **TypeScript 4.9.5**: 类型安全的 JavaScript
- **Styled-Components 6.1.19**: CSS-in-JS 样式解决方案
- **Chart.js 4.5.0 + react-chartjs-2 5.3.0**: 图表库
- **html2canvas 1.4.1**: DOM 转图片库

### 项目特点
- **类型安全**: 全面使用 TypeScript 确保代码质量
- **组件化设计**: 高度模块化的组件架构
- **响应式布局**: 适配不同屏幕尺寸
- **实时预览**: 输入数据即时反映在预览图中
- **高质量导出**: 2倍分辨率的图片导出

### 数据流架构
```
用户输入 → DataInputForm → App (状态管理) → FuturesInfoCard → 子组件渲染
                                ↓
                           ExportButton → html2canvas → 图片下载
```

## 开发指南

### 本地开发
1. 克隆项目到本地
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm start`
4. 在浏览器中打开 http://localhost:3000

### 代码规范
- 使用 TypeScript 进行类型定义
- 组件使用函数式组件 + Hooks
- 样式使用 styled-components
- 遵循 React 最佳实践

### 添加新功能
1. **添加新的数据字段**:
   - 在 `DataInputForm.tsx` 中更新接口定义
   - 添加对应的输入控件
   - 在使用该数据的组件中添加渲染逻辑

2. **添加新的图表类型**:
   - 在 `CandlestickChart.tsx` 中添加新的数据集
   - 配置相应的 Chart.js 选项
   - 调整图表布局和样式

3. **修改导出功能**:
   - 在 `ExportButton.tsx` 中调整 html2canvas 配置
   - 可以添加多种导出格式支持
   - 优化导出性能和质量

### 部署
1. 构建生产版本：`npm run build`
2. 部署 `build` 文件夹到静态文件服务器
3. 确保服务器支持 SPA 路由（如需要）

## 常见问题

### Q: 图片导出失败怎么办？
A: 检查以下几点：
- 确保所有图片资源都在 `public` 文件夹中
- 检查浏览器控制台是否有 CORS 错误
- 尝试刷新页面后重新导出

### Q: 如何修改图表的颜色主题？
A: 在 `CandlestickChart.tsx` 中修改 `borderColor` 和 `backgroundColor` 配置

### Q: 如何添加新的期货公司观点？
A: 在数据输入表单的"期货公司观点"部分点击"添加观点"按钮

### Q: 导出的图片质量不够清晰？
A: 在 `ExportButton.tsx` 中将 `scale` 参数调整为更高的值（如 3 或 4）

## 了解更多

您可以在 [Create React App 文档](https://facebook.github.io/create-react-app/docs/getting-started) 中了解更多信息。

要学习 React，请查看 [React 文档](https://reactjs.org/)。

要了解 Chart.js，请查看 [Chart.js 文档](https://www.chartjs.org/docs/latest/)。
