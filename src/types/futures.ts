/**
 * 期货数据类型定义
 */

// 主力合约详情
export interface MainContractDetail {
  market: string;                    // 市场代码
  variety: string;                   // 品种代码
  varietyShortName: string;          // 品种简称
  varietyCode: string;               // 品种代码
  varietyName: string;               // 品种名称
  contractCode: string;              // 合约代码
  ifindCode: string;                 // iFindCode
  unitNum: string;                   // 单位数量
  dealUnit: string;                  // 交易单位
  minChange: string;                 // 最小变动价位
  marginRate: string;                // 保证金比率
  contractMultiple: string | null;   // 合约乘数
  placeCode: string;                 // 交易所代码
  marketCode: string;                // 市场代码名称
  startDate: string;                 // 开始日期
  endDate: string;                   // 结束日期
  newMarketId: string;               // 新市场ID
  contractName: string;              // 合约名称
}

// 主力合约列表API响应
export interface MainContractListResponse {
  code: number;
  msg: string;
  data: {
    result: MainContractDetail[];
  };
}

// K线数据点原始格式 [时间戳, 开盘价, 最高价, 最低价, 收盘价, 成交量, 成交额]
export type KlineRawDataPoint = [
  number,   // 时间戳
  number,   // 开盘价 (索引7)
  number,   // 最高价 (索引8)
  number,   // 最低价 (索引9)
  number,   // 收盘价 (索引11)
  number,   // 成交量 (索引13)
  number    // 成交额 (索引19)
];

// K线数据（Chart.js需要的格式）
export interface KlineDataPoint {
  x: number;    // 时间戳
  o: number;    // 开盘价 (Open)
  h: number;    // 最高价 (High)
  l: number;    // 最低价 (Low)
  c: number;    // 收盘价 (Close)
}

// 单个合约的K线数据
export interface QuoteData {
  market: string;
  code: string;
  data_fields: string[];
  value: KlineRawDataPoint[];
}

// K线数据API响应
export interface KlineDataResponse {
  status_code: number;
  data: {
    quote_data: QuoteData[];
  };
  status_msg: string;
}

// K线请求参数
export interface KlineRequestParams {
  code_list: Array<{
    market: string;
    codes: string[];
  }>;
  trade_date: number;
  trade_class: string;
  time_period: string;
  begin_time: string;
  end_time: string;
  adjust_type: string;
  data_fields: number[];
}

// 匹配结果
export interface ContractMatchResult {
  market: string;
  contractCode: string;
  contractName: string;
  varietyName: string;
}
