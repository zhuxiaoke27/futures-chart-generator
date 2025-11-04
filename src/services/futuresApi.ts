/**
 * 期货数据API服务
 * 封装同花顺期货API调用
 */

import {
  MainContractListResponse,
  MainContractDetail,
  KlineDataResponse,
  KlineDataPoint,
  KlineRequestParams,
  ContractMatchResult
} from '../types/futures';

// API基础URL
const MAIN_CONTRACT_API = 'https://ftapi.10jqka.com.cn/futgwapi/api/market/v1/contract/getMainContractDetailList';
const KLINE_API = 'https://quota-h.10jqka.com.cn/fuyao/futures_common_hq/quote/v1/single_kline';

/**
 * Step 1: 获取所有主力合约列表
 */
export async function getMainContractList(): Promise<MainContractDetail[]> {
  try {
    const response = await fetch(MAIN_CONTRACT_API, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const data: MainContractListResponse = await response.json();

    if (data.code !== 0) {
      throw new Error(`API错误: ${data.msg}`);
    }

    return data.data.result;
  } catch (error) {
    console.error('获取主力合约列表失败:', error);
    throw new Error(`无法获取主力合约列表: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * Step 2: 根据合约名称匹配对应的合约信息
 * @param contractName 合约名称（如：玻璃、螺纹钢、铜等）
 * @param contractList 主力合约列表
 */
export function matchContract(
  contractName: string,
  contractList: MainContractDetail[]
): ContractMatchResult | null {
  // 去除空格并转换为小写进行模糊匹配
  const searchName = contractName.trim().toLowerCase();

  // 优先精确匹配
  let matched = contractList.find(
    contract =>
      contract.varietyShortName.toLowerCase() === searchName ||
      contract.varietyName.toLowerCase() === searchName ||
      contract.variety.toLowerCase() === searchName
  );

  // 如果精确匹配失败，尝试模糊匹配
  if (!matched) {
    matched = contractList.find(
      contract =>
        contract.varietyShortName.toLowerCase().includes(searchName) ||
        contract.varietyName.toLowerCase().includes(searchName)
    );
  }

  if (!matched) {
    console.warn(`未找到匹配的合约: ${contractName}`);
    return null;
  }

  return {
    market: matched.market,
    contractCode: matched.contractCode,
    contractName: matched.contractName,
    varietyName: matched.varietyName
  };
}

/**
 * Step 3 & 4: 构建请求参数并获取K线数据
 * @param market 市场代码
 * @param contractCode 合约代码
 * @param beginTime 开始时间（如："-30" 表示30天前）
 * @param endTime 结束时间（如："0" 表示今天）
 */
export async function fetchKlineData(
  market: string,
  contractCode: string,
  beginTime: string = '-30',
  endTime: string = '0'
): Promise<KlineDataPoint[]> {
  try {
    // 转换市场代码：如果是 "-127" 则替换为 "129"
    const actualMarket = market === '-127' ? '129' : market;

    // Step 3: 构建请求参数
    const requestParams: KlineRequestParams = {
      code_list: [
        {
          market: actualMarket,
          codes: [contractCode]
        }
      ],
      trade_date: -1,
      trade_class: 'intraday',
      time_period: 'day_1',
      begin_time: beginTime,
      end_time: endTime,
      adjust_type: 'forward',
      data_fields: [8]  // 请求所有字段
    };

    // Step 4: 发送POST请求
    const response = await fetch(KLINE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Fuyao-Auth': 'basecomponent'
      },
      body: JSON.stringify(requestParams)
    });

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }

    const data: KlineDataResponse = await response.json();

    if (data.status_code !== 0) {
      throw new Error(`API错误: ${data.status_msg}`);
    }

    // Step 5: 转换数据格式
    return transformKlineData(data);
  } catch (error) {
    console.error('获取K线数据失败:', error);
    throw new Error(`无法获取K线数据: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * Step 5: 转换K线数据为Chart.js需要的格式
 * 数据格式说明：
 * - 索引0: 时间戳
 * - 索引1: 开盘价 (对应data_fields中的"7")
 * - 索引2: 最高价 (对应data_fields中的"8")
 * - 索引3: 最低价 (对应data_fields中的"9")
 * - 索引4: 收盘价 (对应data_fields中的"11")
 * - 索引5: 成交量 (对应data_fields中的"13")
 * - 索引6: 成交额 (对应data_fields中的"19")
 */
function transformKlineData(response: KlineDataResponse): KlineDataPoint[] {
  if (!response.data.quote_data || response.data.quote_data.length === 0) {
    throw new Error('返回的K线数据为空');
  }

  const quoteData = response.data.quote_data[0];

  if (!quoteData.value || quoteData.value.length === 0) {
    throw new Error('K线数据值为空');
  }

  // 转换数据格式
  return quoteData.value.map((item) => {
    // 根据data_fields的顺序解析数据
    // 通常顺序为: [时间戳, 开盘, 最高, 最低, 收盘, 成交量, 成交额]
    const [timestamp, open, high, low, close] = item;

    return {
      x: timestamp,       // 时间戳（毫秒）
      o: open,           // 开盘价
      h: high,           // 最高价
      l: low,            // 最低价
      c: close           // 收盘价
    };
  });
}

/**
 * 完整流程：根据合约名称获取K线数据（包含合约信息）
 * @param contractName 合约名称
 */
export async function getKlineDataByContractName(
  contractName: string
): Promise<KlineDataPoint[]> {
  try {
    // Step 1: 获取主力合约列表
    const contractList = await getMainContractList();

    // Step 2: 匹配合约
    const matchResult = matchContract(contractName, contractList);

    if (!matchResult) {
      throw new Error(`未找到合约"${contractName}"，请检查合约名称是否正确`);
    }

    console.log('匹配到合约:', matchResult);

    // Step 3 & 4 & 5: 获取并转换K线数据
    const klineData = await fetchKlineData(
      matchResult.market,
      matchResult.contractCode
    );

    console.log(`成功获取${klineData.length}条K线数据`);

    return klineData;
  } catch (error) {
    console.error('获取K线数据流程失败:', error);
    throw error;
  }
}

/**
 * 完整流程：根据合约名称获取K线数据和合约信息
 * @param contractName 合约名称
 * @returns K线数据和合约信息
 */
export async function getKlineDataWithContractInfo(
  contractName: string
): Promise<{ klineData: KlineDataPoint[]; contractInfo: ContractMatchResult }> {
  try {
    // Step 1: 获取主力合约列表
    const contractList = await getMainContractList();

    // Step 2: 匹配合约
    const matchResult = matchContract(contractName, contractList);

    if (!matchResult) {
      throw new Error(`未找到合约"${contractName}"，请检查合约名称是否正确`);
    }

    console.log('匹配到合约:', matchResult);

    // Step 3 & 4 & 5: 获取并转换K线数据
    const klineData = await fetchKlineData(
      matchResult.market,
      matchResult.contractCode
    );

    console.log(`成功获取${klineData.length}条K线数据`);

    return {
      klineData,
      contractInfo: matchResult
    };
  } catch (error) {
    console.error('获取K线数据流程失败:', error);
    throw error;
  }
}

/**
 * 检查API是否可用
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    await getMainContractList();
    return true;
  } catch (error) {
    console.error('API健康检查失败:', error);
    return false;
  }
}
