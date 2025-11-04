import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import {
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement,
} from 'chartjs-chart-financial';
import styled from 'styled-components';
import { FuturesData } from './DataInputForm';
import { getKlineDataByContractName } from '../services/futuresApi';
import { KlineDataPoint } from '../types/futures';

ChartJS.register(
  CategoryScale,
  LinearScale,
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

// K线数据已从API获取，不再需要生成模拟数据

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
  const chartRef = useRef<any>(null);
  const [chartReady, setChartReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 新增状态：K线数据、加载状态、错误信息
  const [candleData, setCandleData] = useState<KlineDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 转换K线数据：从时间戳格式转为索引格式（去除时间间隙）
  const { indexedData, labels } = useMemo(() => {
    const indexedData = candleData.map((item, index) => {
      // chartjs-chart-financial库的颜色逻辑与中国市场相反
      // 需要交换开盘价和收盘价来得到正确的颜色显示
      return {
        x: index,  // 使用索引代替时间戳
        // 交换开盘价和收盘价，保持最高最低价不变
        o: item.c,  // 用收盘价作为开盘价
        h: item.h,  // 最高价不变
        l: item.l,  // 最低价不变
        c: item.o,  // 用开盘价作为收盘价
        timestamp: item.x,  // 保留原始时间戳用于tooltip显示
        // 保存原始值用于tooltip显示
        originalO: item.o,
        originalC: item.c
      };
    });

    // 生成日期标签
    const labels = candleData.map(item => {
      const date = new Date(item.x);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    return { indexedData, labels };
  }, [candleData]);

  // 使用 useMemo 缓存图表数据配置，避免不必要的重新渲染
  // 必须在所有条件判断之前调用所有Hooks
  const chartData: any = useMemo(() => ({
    labels: labels,  // 添加labels用于X轴显示
    datasets: [
      {
        label: 'K线图',
        data: indexedData,
        /**
         * K线颜色配置说明：
         *
         * 问题：chartjs-chart-financial库的颜色逻辑与中国市场习惯相反
         * - 库的默认：up=涨=绿色, down=跌=红色（西方习惯）
         * - 中国习惯：阳线=涨=红色, 阴线=跌=绿色
         *
         * 解决方案：
         * 1. 在数据转换时交换开盘价和收盘价（见上方indexedData的map函数）
         * 2. 交换后，库判断的up/down与实际相反：
         *    - 原阳线(收>开) → 交换后(开>收) → 库判定为down
         *    - 原阴线(收<开) → 交换后(开<收) → 库判定为up
         * 3. 因此颜色配置也要反向：
         *    - down配置红色 → 显示原阳线为红色 ✓
         *    - up配置绿色 → 显示原阴线为绿色 ✓
         * 4. 阳线用空心（无填充），阴线用实心（有填充）
         */
        borderColor: {
          up: '#28a745',      // 交换后的up = 原阴线，绿色边框
          down: '#dc3545',    // 交换后的down = 原阳线，红色边框
          unchanged: '#999999'
        },
        backgroundColor: {
          up: '#28a745',      // 交换后的up = 原阴线，绿色填充（实心）
          down: 'transparent', // 交换后的down = 原阳线，透明填充（空心）
          unchanged: '#999999'
        },
      }
    ],
  }), [indexedData, labels]);

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
          title: function(context: any) {
            // 显示日期而不是索引
            const point = context[0].raw;
            if (point.timestamp) {
              const date = new Date(point.timestamp);
              return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
            }
            return context[0].label;
          },
          label: function(context: any) {
            const point = context.raw;
            // 由于我们交换了开盘收盘价来修正颜色，这里需要显示原始值
            return [
              `开盘: ${point.originalO?.toFixed(2) || point.c?.toFixed(2) || 'N/A'}`,
              `最高: ${point.h?.toFixed(2) || 'N/A'}`,
              `最低: ${point.l?.toFixed(2) || 'N/A'}`,
              `收盘: ${point.originalC?.toFixed(2) || point.o?.toFixed(2) || 'N/A'}`
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
        type: 'category',  // 使用category类型，基于索引显示
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          borderDash: [5, 5],  // 虚线样式 [实线长度, 间隙长度]
          drawOnChartArea: true,
          drawTicks: true,
        },
        ticks: {
          color: '#666',
          maxRotation: 0,  // 防止标签旋转
          autoSkip: true,  // 自动跳过标签以避免拥挤
          autoSkipPadding: 10,
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
          display: false,  // 不显示横向网格线
          drawBorder: true,
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

  // useEffect: 获取K线数据
  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('开始获取K线数据，合约名称:', data.contractName);

        // 调用API获取真实K线数据
        const klineData = await getKlineDataByContractName(data.contractName);

        if (!isCancelled) {
          setCandleData(klineData);
          console.log('K线数据获取成功，数据点数量:', klineData.length);
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMsg = err instanceof Error ? err.message : '未知错误';
          setError(errorMsg);
          console.error('获取K线数据失败:', errorMsg);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [data.contractName]); // 仅在合约名称变化时重新获取

  // useEffect: 管理图表就绪状态
  useEffect(() => {
    // 延迟标记图表为准备就绪，确保DOM完全渲染
    const timer = setTimeout(() => {
      if (containerRef.current && candleData.length > 0) {
        setChartReady(true);
      }
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, [candleData]);

  const isPositive = data.changePercent >= 0;

  // 渲染加载状态
  if (isLoading) {
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
        <div style={{
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          ⏳ 正在加载K线数据...
        </div>
      </ChartContainer>
    );
  }

  // 渲染错误状态
  if (error) {
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
        <div style={{
          height: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc3545',
          fontSize: '14px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>❌</div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>无法获取K线数据</div>
          <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>{error}</div>
        </div>
      </ChartContainer>
    );
  }

  // 如果数据为空
  if (candleData.length === 0) {
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
        <div style={{
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px'
        }}>
          暂无K线数据
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