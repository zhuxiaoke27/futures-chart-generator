import React, { useRef, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import {
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement,
} from 'chartjs-chart-financial';
import 'chartjs-adapter-luxon';
import styled from 'styled-components';
import { FuturesData } from './DataInputForm';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement
);

interface CandlestickChartProps {
  data: FuturesData;
}

const ChartContainer = styled.div`
  width: 100%;
  height: 280px;
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  overflow: hidden;
  
  /* 确保导出时的可见性 */
  opacity: 1;
  visibility: visible;
  transform: none;
  position: relative;
  
  /* 确保canvas正确渲染 */
  canvas {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 1 !important;
    image-rendering: auto !important;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;



const ContractInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ContractName = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;



const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CurrentPrice = styled.span`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const ChangeInfo = styled.span<{ $isPositive: boolean }>`
  font-size: 14px;
  color: ${props => props.$isPositive ? '#ff4444' : '#00aa00'};
  font-weight: 500;
`;

const DateInfo = styled.span`
  font-size: 12px;
  color: #999;
`;

// 生成模拟K线数据
const generateCandlestickData = (currentPrice: number) => {
  const data = [];
  const baseDate = new Date('2024-12-25');
  
  // 生成30天的数据
  for (let i = 29; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // 生成价格数据，围绕当前价格波动
    const variation = (Math.random() - 0.5) * currentPrice * 0.1;
    const basePrice = currentPrice + variation;
    const volatility = currentPrice * 0.02;
    
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = basePrice + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    data.push({
      x: date.getTime(),
      o: open,
      h: high,
      l: low,
      c: close
    });
  }
  
  // 最后一个数据点设为当前价格
  const lastData = data[data.length - 1];
  lastData.c = currentPrice;
  lastData.o = currentPrice + (Math.random() - 0.5) * 10;
  lastData.h = Math.max(lastData.o, lastData.c) + Math.random() * 5;
  lastData.l = Math.min(lastData.o, lastData.c) - Math.random() * 5;
  
  return data;
};

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const chartRef = useRef<any>(null);
  const [chartReady, setChartReady] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  // 使用 useMemo 缓存生成的K线数据，仅在价格变化时重新计算
  const candleData = useMemo(() => generateCandlestickData(data.currentPrice), [data.currentPrice]);

  // 使用 useMemo 缓存图表数据配置，避免不必要的重新渲染
  // 必须在所有条件判断之前调用所有Hooks
  const chartData: any = useMemo(() => ({
    datasets: [
      {
        label: 'K线图',
        data: candleData,
        color: {
          up: '#ff4444',
          down: '#00aa00',
          unchanged: '#999999'
        },
      }
    ],
  }), [candleData]);

  // 使用 useMemo 缓存图表选项配置
  const options: any = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // 禁用动画以提高导出兼容性
      resize: {
        duration: 0 // 禁用resize动画
      },
      onComplete: () => {
        // 动画完成后标记图表准备就绪
        setChartReady(true);
      }
    },
    devicePixelRatio: window.devicePixelRatio || 1, // 使用设备像素比
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#ddd',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const point = context.raw;
            return [
              `开盘: ${point.o?.toFixed(2) || 'N/A'}`,
              `最高: ${point.h?.toFixed(2) || 'N/A'}`,
              `最低: ${point.l?.toFixed(2) || 'N/A'}`,
              `收盘: ${point.c?.toFixed(2) || 'N/A'}`
            ];
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MM/dd'
          }
        },
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 11,
          },
          maxTicksLimit: 6,
          padding: 5,
        },
      },
      y: {
        display: true,
        position: 'right',
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return typeof value === 'number' ? value.toFixed(0) : value;
          },
        },
      },
    },
  }), [setChartReady]); // options 依赖 setChartReady 函数

  // useEffect 必须在所有条件判断之前调用
  useEffect(() => {
    // 确保组件已挂载
    setIsMounted(true);

    // 延迟标记图表为准备就绪，确保DOM完全渲染
    const timer = setTimeout(() => {
      if (containerRef.current) {
        setChartReady(true);
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, [data]);

  const isPositive = data.changePercent >= 0;

  // 如果组件未挂载，显示加载状态
  if (!isMounted) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ContractInfo>
            <ContractName>{data.contractName}{data.contractCode}</ContractName>
            <DateInfo>{data.date} 日线</DateInfo>
          </ContractInfo>
          <PriceInfo>
            <CurrentPrice>{data.currentPrice}</CurrentPrice>
            <ChangeInfo $isPositive={isPositive}>
              {isPositive ? '+' : ''}{data.changeAmount} {data.changePercent}%
            </ChangeInfo>
          </PriceInfo>
        </ChartHeader>
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          加载中...
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer data-chart-ready={chartReady}>
      <ChartHeader>
        <ContractInfo>
          <ContractName>{data.contractName}{data.contractCode}</ContractName>
          <DateInfo>{data.date} 日线</DateInfo>
        </ContractInfo>
        <PriceInfo>
          <CurrentPrice>{data.currentPrice}</CurrentPrice>
          <ChangeInfo $isPositive={isPositive}>
            {isPositive ? '+' : ''}{data.changeAmount} {data.changePercent}%
          </ChangeInfo>
        </PriceInfo>
      </ChartHeader>
      <div 
         ref={containerRef}
         style={{ 
           height: '200px', 
           width: '100%', 
           position: 'relative', 
           padding: '0 5px 10px 5px',
           overflow: 'hidden',
           minHeight: '200px',
           maxHeight: '200px'
         }}>
         {chartReady && containerRef.current ? (
           <Chart 
             ref={chartRef}
             type='candlestick'
             data={chartData} 
             options={options}
             width={400}
             height={180}
           />
         ) : (
           <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
             图表加载中...
           </div>
         )}
       </div>
    </ChartContainer>
  );
};

export default CandlestickChart;