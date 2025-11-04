# K线图颜色问题解决方案

## 问题描述

在使用 `chartjs-chart-financial` 库时，发现K线图的颜色显示与中国市场习惯相反：
- **实际显示**：阳线（涨）显示绿色，阴线（跌）显示红色
- **预期显示**：阳线（涨）应显示红色，阴线（跌）应显示绿色

## 根本原因

`chartjs-chart-financial` 库采用的是**西方市场习惯**：
- `up` (收盘价 > 开盘价) = 涨 = 绿色
- `down` (收盘价 < 开盘价) = 跌 = 红色

而**中国市场习惯**正好相反：
- 阳线（涨）= 红色
- 阴线（跌）= 绿色

## 解决方案

### 方案说明

由于库的颜色逻辑无法直接修改，采用了**数据交换**的巧妙方法：

1. **数据转换阶段**：交换开盘价和收盘价
2. **颜色配置阶段**：反向配置颜色
3. **Tooltip显示**：使用原始值确保正确显示

### 实现细节

#### 1. 数据转换（CandlestickChart.tsx）

```typescript
const indexedData = candleData.map((item, index) => {
  return {
    x: index,
    // 交换开盘价和收盘价
    o: item.c,  // 用收盘价作为开盘价
    c: item.o,  // 用开盘价作为收盘价
    h: item.h,  // 最高价不变
    l: item.l,  // 最低价不变
    timestamp: item.x,
    // 保存原始值用于tooltip
    originalO: item.o,
    originalC: item.c
  };
});
```

#### 2. 交换效果

| 原始数据 | 实际情况 | 交换后数据 | 库的判断 |
|---------|---------|-----------|---------|
| 开1222, 收1237 | 阳线（涨） | 开1237, 收1222 | down（跌） |
| 开1122, 收1091 | 阴线（跌） | 开1091, 收1122 | up（涨） |

#### 3. 颜色配置

```typescript
color: {
  up: '#28a745',      // 交换后的up = 原阴线 → 绿色
  down: '#dc3545',    // 交换后的down = 原阳线 → 红色
  unchanged: '#999999'
},
backgroundColor: {
  up: '#28a745',      // 原阴线：绿色实心
  down: 'transparent', // 原阳线：红色空心
  unchanged: '#999999'
}
```

#### 4. Tooltip修正

```typescript
label: function(context: any) {
  const point = context.raw;
  return [
    `开盘: ${point.originalO?.toFixed(2) || point.c?.toFixed(2)}`,
    `最高: ${point.h?.toFixed(2)}`,
    `最低: ${point.l?.toFixed(2)}`,
    `收盘: ${point.originalC?.toFixed(2) || point.o?.toFixed(2)}`
  ];
}
```

## 最终效果

✅ **阳线（收盘 > 开盘）**：红色空心边框
✅ **阴线（收盘 < 开盘）**：绿色实心填充
✅ **Tooltip显示**：正确显示原始开盘/收盘价

## 相关文件

- `src/components/CandlestickChart.tsx` - K线图组件（包含完整注释）
- `src/services/futuresApi.ts` - K线数据获取和解析

## 优化项

### 网格线配置

- **竖向网格线**：虚线样式 `borderDash: [5, 5]`
- **横向网格线**：隐藏 `display: false`

```typescript
scales: {
  x: {
    grid: {
      display: true,
      borderDash: [5, 5],  // 虚线
    }
  },
  y: {
    grid: {
      display: false,  // 隐藏横向网格线
    }
  }
}
```

## 注意事项

1. **数据完整性**：交换后的数据仍然保持最高价和最低价不变，确保K线形态正确
2. **Tooltip准确性**：必须使用 `originalO` 和 `originalC` 来显示真实的开盘/收盘价
3. **代码维护性**：在关键位置添加了详细注释，方便后续维护

## 提交记录

- Commit: `e576ba4` - fix: 修复K线图颜色显示错误
- Branch: `feature/kline-color-fix`
