/**
 * 期货数据自动计算服务
 * 根据合约名称自动获取并计算所有数据
 */

import { getKlineDataWithContractInfo } from './futuresApi';

export interface CalculatedFuturesData {
  contractName: string;      // 合约名称
  contractCode: string;       // 合约代码（数字部分，如：2601）
  currentPrice: number;       // 当前价格（最新收盘价）
  changePercent: number;      // 涨跌幅 %
  changeAmount: number;       // 涨跌额
  date: string;              // 当天日期
}

/**
 * 提取合约代码的数字部分（用于显示）
 * 例如：FG2601 → 2601
 */
function extractContractCode(fullCode: string): string {
  // 提取数字部分（合约月份）
  const match = fullCode.match(/\d+$/);
  return match ? match[0] : fullCode;
}

/**
 * 根据合约名称自动获取并计算所有期货数据
 * @param contractName 合约名称（如：玻璃、螺纹钢、棉花等）
 */
export async function calculateFuturesData(
  contractName: string
): Promise<CalculatedFuturesData> {
  try {
    // 1. 获取K线数据和合约信息
    const { klineData, contractInfo } = await getKlineDataWithContractInfo(contractName);

    if (!klineData || klineData.length < 2) {
      throw new Error('K线数据不足，至少需要2个数据点才能计算涨跌幅');
    }

    // 2. 获取最新和前一日数据
    const latestData = klineData[klineData.length - 1];  // 最新一根K线
    const previousData = klineData[klineData.length - 2]; // 前一根K线

    // 3. 计算当前价格（最新收盘价）
    const currentPrice = latestData.c;

    // 4. 计算涨跌额 = 最新收盘价 - 前一日收盘价
    const changeAmount = currentPrice - previousData.c;

    // 5. 计算涨跌幅 = (涨跌额 / 前一日收盘价) × 100
    const changePercent = (changeAmount / previousData.c) * 100;

    // 6. 获取当天日期（格式：YYYY/MM/DD）
    const today = new Date(latestData.x);
    const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    // 7. 从API返回的合约信息中提取合约代码的数字部分（如：FG2601 → 2601）
    const contractCode = extractContractCode(contractInfo.contractCode);

    console.log('计算完成:', {
      contractName,
      contractCode,
      currentPrice,
      changeAmount,
      changePercent,
      date
    });

    return {
      contractName,
      contractCode,
      currentPrice: parseFloat(currentPrice.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      changeAmount: parseFloat(changeAmount.toFixed(2)),
      date
    };
  } catch (error) {
    console.error('计算期货数据失败:', error);
    throw error;
  }
}

/**
 * 格式化价格显示
 */
export function formatPrice(price: number, decimals: number = 2): string {
  return price.toFixed(decimals);
}

/**
 * 格式化涨跌幅显示
 */
export function formatChangePercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * 格式化涨跌额显示
 */
export function formatChangeAmount(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${amount.toFixed(2)}`;
}
