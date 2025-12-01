import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { FuturesData, CompanyOpinion, BackgroundTemplate } from './DataInputForm';
import CandlestickChart from './CandlestickChart';
import OpinionTable from './OpinionTable';
import ExcelUploader from './ExcelUploader';
import MultiVarietyExcelUploader from './MultiVarietyExcelUploader';
import { calculateFuturesData } from '../services/futuresDataCalculator';

// 工具函数：获取背景图路径
const getBackgroundImage = (template: BackgroundTemplate): string => {
  return `/background_pic/${template}.png`;
};

// 工具函数：获取品种素材图片路径
const getVarietyAssetImage = (contractName: string, template: BackgroundTemplate): string => {
  const cleanName = contractName.replace(/\s+/g, '').replace(/\d+/g, '');
  return `/assets/${cleanName}-${template}.png`;
};

// 背景模板配置（从 Figma 设计稿提取）
const backgroundTemplateConfig: Record<BackgroundTemplate, {
  color: string;        // 底部颜色
  gradientAngle: string; // 渐变角度
}> = {
  '暗': {
    color: '#0A123C',           // linear-gradient(179.64deg, #020305 1.96%, #0A123C 17.5%)
    gradientAngle: '180deg'     // 竖直向下
  },
  '冷': {
    color: '#E2F0FC',           // linear-gradient(180deg, #A6D1F7 -2.79%, #E2F0FC 100%)
    gradientAngle: '180deg'     // 竖直向下
  },
  '暖': {
    color: '#F7CFA6',           // linear-gradient(166.33deg, #F7CFA6 5.72%, #FFF6E6 78.09%)
    gradientAngle: '346.33deg'  // 旋转后的角度
  }
};

interface VarietyData {
  id: string;
  futuresData: FuturesData;
  opinions: CompanyOpinion[];
}

interface MultiVarietyChartProps {
  varieties: VarietyData[];
  onVarietiesChange: (varieties: VarietyData[]) => void;
}

// ChartContainer 已被 PreviewContainer 替代

// 顶部占位区域，对应背景图的标题部分（为品种素材图片提供定位上下文）
const TopSpacer = styled.div`
  height: 365px; /* 适当增加高度以露出更多背景图内容 */
  width: 100%;
  position: relative; /* 关键：为品种素材图片提供定位上下文 */
`;

// 品种素材图片（等比例放大 1.25 倍以适配多品种模板）
const VarietyAssetImage = styled.img`
  position: absolute;
  width: 238px; /* 190px * 1.25 */
  height: 223px; /* 178px * 1.25 */
  right: 40px;
  top: 105px;
  object-fit: contain;
  z-index: 2;

  /* 如果图片加载失败，不显示 */
  &[src=""], &:not([src]) {
    display: none;
  }
`;

const VarietySection = styled.div`
  padding: 30px 50px;
`;

const VarietyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const VarietyTitle = styled.h2<{ isDarkTheme?: boolean }>`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.isDarkTheme ? '#ffffff' : '#333'};
  margin: 0;
`;

const VarietyIndex = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: none;
  margin: 0;
  align-items: flex-end;
`;

const ChartSection = styled.div`
  background: rgba(248, 249, 250, 0.6);
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  backdrop-filter: blur(4px);
`;

const OpinionSection = styled.div`
  background: rgba(248, 249, 250, 0.6);
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  backdrop-filter: blur(4px);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionIcon = styled.span`
  font-size: 20px;
`;

const NavigationTabs = styled.div`
  display: flex;
  gap: 8px;
  padding: 15px 20px;
  background: white;
  border-bottom: 2px solid #e0e0e0;
  overflow-x: auto;
  flex-shrink: 0;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }
`;

const NavTab = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0'};
  color: ${props => props.$active ? 'white' : '#666'};
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0'};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ConfigSection = styled.div`
  padding: 20px;
  background: #f8f9fa;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ConfigTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
`;

const ConfigHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CollapseControls = styled.div`
  display: flex;
  gap: 8px;
`;

const CollapseButton = styled.button`
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #007bff;
    color: #007bff;
    background: #f0f8ff;
  }
`;

// VarietyConfigGrid 已被 VarietyConfigList 替代

const VarietyConfigList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const MainContainer = styled.div`
  display: grid;
  grid-template-columns: 550px 1fr;
  gap: 30px;
  height: 100vh;
  max-width: 1800px;
  margin: 0 auto;

  @media (max-width: 1400px) {
    grid-template-columns: 480px 1fr;
    gap: 25px;
  }

  @media (max-width: 1200px) {
    grid-template-columns: 420px 1fr;
    gap: 20px;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
  max-height: 90vh;
  
  @media (max-width: 1024px) {
    max-height: none;
    margin-bottom: 20px;
  }
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 90vh;
  overflow: hidden;
  
  @media (max-width: 1024px) {
    height: auto;
  }
`;

const PreviewContainer = styled.div<{
  backgroundImage?: string;
  template?: BackgroundTemplate;
}>`
  width: 100%;

  /* 多层背景：原背景图 + 渐变层 */
  background-image:
    ${props => props.backgroundImage ? `url(${props.backgroundImage})` : 'none'},
    ${props => props.template ?
      `linear-gradient(${backgroundTemplateConfig[props.template].gradientAngle},
        transparent 0%,
        transparent 60%,
        ${backgroundTemplateConfig[props.template].color}20 70%,
        ${backgroundTemplateConfig[props.template].color}40 78%,
        ${backgroundTemplateConfig[props.template].color}70 86%,
        ${backgroundTemplateConfig[props.template].color}90 93%,
        ${backgroundTemplateConfig[props.template].color} 100%)`
      : 'none'
    };

  /* 背景尺寸：原背景图保持原样，渐变覆盖全部 */
  background-size:
    100% auto,    // 原背景图尺寸
    100% 100%;    // 渐变覆盖全部

  /* 背景位置 */
  background-position:
    top center,   // 原背景图位置
    top center;   // 渐变位置

  /* 背景重复 */
  background-repeat:
    no-repeat,    // 原背景图不重复
    no-repeat;    // 渐变不重复

  /* 底部纯色背景（当内容超出渐变范围时显示） */
  background-color: ${props =>
    props.template ? backgroundTemplateConfig[props.template].color : 'white'
  };
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow-y: auto;
  height: 100%;
  position: relative;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  @media (max-width: 1024px) {
    height: auto;
    max-height: 80vh;
  }
`;

const VarietyConfigCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ConfigCardTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardCollapseButton = styled.button`
  padding: 2px 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  background: white;
  color: #666;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
  margin-right: 8px;

  &:hover {
    border-color: #007bff;
    color: #007bff;
    background: #f0f8ff;
  }
`;

const CardContent = styled.div<{ collapsed: boolean }>`
  display: ${props => props.collapsed ? 'none' : 'block'};
`;

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
`;

const InputField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #0056b3;
  }
`;

const RemoveButton = styled.button`
  padding: 4px 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #c82333;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 15px;
`;

// 背景模板选择器
const TemplateSelector = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const TemplateOption = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid ${props => props.selected ? '#007bff' : '#ddd'};
  border-radius: 6px;
  background: ${props => props.selected ? '#e7f3ff' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};

  &:hover {
    border-color: #007bff;
    background: #f0f8ff;
  }

  input[type="radio"] {
    cursor: pointer;
  }
`;

// 默认品种数据 - 只包含合约名称，其他数据将在页面加载时自动获取
const defaultVarieties: VarietyData[] = [
  {
    id: '1',
    futuresData: {
      contractName: '玻璃',
      contractCode: '',
      currentPrice: 0,
      changePercent: 0,
      changeAmount: 0,
      date: '',
      backgroundTemplate: '暖'
    },
    opinions: []
  },
  {
    id: '2',
    futuresData: {
      contractName: '螺纹钢',
      contractCode: '',
      currentPrice: 0,
      changePercent: 0,
      changeAmount: 0,
      date: '',
      backgroundTemplate: '暖'
    },
    opinions: []
  },
  {
    id: '3',
    futuresData: {
      contractName: '沪铜',
      contractCode: '',
      currentPrice: 0,
      changePercent: 0,
      changeAmount: 0,
      date: '',
      backgroundTemplate: '暖'
    },
    opinions: []
  },
  {
    id: '4',
    futuresData: {
      contractName: '原油',
      contractCode: '',
      currentPrice: 0,
      changePercent: 0,
      changeAmount: 0,
      date: '',
      backgroundTemplate: '暖'
    },
    opinions: []
  },
  {
    id: '5',
    futuresData: {
      contractName: '沪金',
      contractCode: '',
      currentPrice: 0,
      changePercent: 0,
      changeAmount: 0,
      date: '',
      backgroundTemplate: '暖'
    },
    opinions: []
  }
];

const MultiVarietyChart: React.FC<MultiVarietyChartProps> = ({ varieties, onVarietiesChange }) => {
  const [localVarieties, setLocalVarieties] = useState<VarietyData[]>(varieties.length > 0 ? varieties : defaultVarieties);
  const [justImportedId, setJustImportedId] = useState<string | null>(null);
  const [loadingVarietyId, setLoadingVarietyId] = useState<string | null>(null);
  const [errorVarietyId, setErrorVarietyId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [globalBackgroundTemplate, setGlobalBackgroundTemplate] = useState<BackgroundTemplate>('暖');
  const [assetImageError, setAssetImageError] = useState(false);
  const [collapsedVarieties, setCollapsedVarieties] = useState<Set<string>>(new Set());
  const fetchTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const configCardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const previewSectionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const configListRef = useRef<HTMLDivElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // 处理导航tab点击，滚动到对应的品种
  const handleTabClick = useCallback((varietyId: string) => {
    setActiveTabId(varietyId);

    // 滚动左侧配置区域
    const configCard = configCardRefs.current.get(varietyId);
    if (configCard && configListRef.current) {
      const containerTop = configListRef.current.offsetTop;
      const cardTop = configCard.offsetTop;
      configListRef.current.scrollTo({
        top: cardTop - containerTop - 20,
        behavior: 'smooth'
      });
    }

    // 滚动右侧预览区域
    const previewSection = previewSectionRefs.current.get(varietyId);
    if (previewSection && previewContainerRef.current) {
      const containerTop = previewContainerRef.current.offsetTop;
      const sectionTop = previewSection.offsetTop;
      previewContainerRef.current.scrollTo({
        top: sectionTop - containerTop,
        behavior: 'smooth'
      });
    }
  }, []);

  // 立即获取期货数据（用于初始化，不使用防抖）
  const fetchFuturesDataImmediately = useCallback(async (varietyId: string, contractName: string) => {
    // 如果合约名称为空，不执行
    if (!contractName || contractName.trim() === '') {
      return;
    }

    setLoadingVarietyId(varietyId);
    setErrorVarietyId(null);

    try {
      console.log('开始获取期货数据:', contractName, 'for variety:', varietyId);
      const calculatedData = await calculateFuturesData(contractName);

      // 更新品种数据 - 使用函数式更新确保获取最新状态，保留背景模板设置
      setLocalVarieties(prev => prev.map(variety => {
        if (variety.id === varietyId) {
          return {
            ...variety,
            futuresData: {
              ...calculatedData,
              backgroundTemplate: variety.futuresData.backgroundTemplate
            }
          };
        }
        return variety;
      }));

      console.log('期货数据获取成功');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '获取数据失败';
      setErrorVarietyId(varietyId);
      console.error('获取期货数据失败:', errorMsg);
    } finally {
      setLoadingVarietyId(null);
    }
  }, []);

  // 自动获取期货数据（带防抖，用于用户输入时）
  const fetchFuturesData = useCallback(async (varietyId: string, contractName: string) => {
    // 清除之前的timer
    const existingTimer = fetchTimers.current.get(varietyId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 如果合约名称为空，不执行
    if (!contractName || contractName.trim() === '') {
      return;
    }

    // 防抖：延迟1秒后再执行
    const timer = setTimeout(async () => {
      await fetchFuturesDataImmediately(varietyId, contractName);
    }, 1000);

    fetchTimers.current.set(varietyId, timer);
  }, [fetchFuturesDataImmediately]);

  const handleVarietyDataChange = useCallback((varietyId: string, field: keyof FuturesData, value: string | number) => {
    setLocalVarieties(prev => prev.map(variety => {
      if (variety.id === varietyId) {
        return {
          ...variety,
          futuresData: {
            ...variety.futuresData,
            [field]: value
          }
        };
      }
      return variety;
    }));

    // 如果修改的是合约名称，触发自动获取数据
    if (field === 'contractName' && typeof value === 'string') {
      fetchFuturesData(varietyId, value);
    }
  }, [fetchFuturesData]);

  const handleOpinionImport = useCallback((varietyId: string, opinions: CompanyOpinion[]) => {
    setLocalVarieties(prev => prev.map(variety => {
      if (variety.id === varietyId) {
        return {
          ...variety,
          opinions
        };
      }
      return variety;
    }));
    // 标记刚导入的品种，显示提示
    setJustImportedId(varietyId);
    setTimeout(() => setJustImportedId(null), 3000);
  }, []);

  // 处理观点编辑
  const handleOpinionEdit = useCallback((varietyId: string, opinionIndex: number, field: keyof CompanyOpinion, value: string) => {
    setLocalVarieties(prev => prev.map(variety => {
      if (variety.id === varietyId) {
        const updatedOpinions = [...variety.opinions];
        updatedOpinions[opinionIndex] = {
          ...updatedOpinions[opinionIndex],
          [field]: value
        };
        return {
          ...variety,
          opinions: updatedOpinions
        };
      }
      return variety;
    }));
  }, []);

  // 添加观点
  const handleAddOpinion = useCallback((varietyId: string) => {
    setLocalVarieties(prev => prev.map(variety => {
      if (variety.id === varietyId) {
        return {
          ...variety,
          opinions: [
            ...variety.opinions,
            {
              company: '',
              direction: '',
              support: '',
              resistance: '',
              logic: ''
            }
          ]
        };
      }
      return variety;
    }));
  }, []);

  // 删除观点
  const handleRemoveOpinion = useCallback((varietyId: string, opinionIndex: number) => {
    setLocalVarieties(prev => prev.map(variety => {
      if (variety.id === varietyId) {
        return {
          ...variety,
          opinions: variety.opinions.filter((_, index) => index !== opinionIndex)
        };
      }
      return variety;
    }));
  }, []);

  const addVariety = useCallback(() => {
    const newVariety: VarietyData = {
      id: Date.now().toString(),
      futuresData: {
        contractName: '新品种',
        contractCode: '2505',
        currentPrice: 0,
        changePercent: 0,
        changeAmount: 0,
        date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/'),
        backgroundTemplate: '暖'
      },
      opinions: []
    };
    setLocalVarieties(prev => [...prev, newVariety]);
  }, []);

  const removeVariety = useCallback((varietyId: string) => {
    setLocalVarieties(prev => prev.filter(variety => variety.id !== varietyId));
  }, []);

  // 处理多品种批量导入
  const handleMultiVarietyImport = useCallback((varieties: VarietyData[]) => {
    // 限制最多5个品种
    const limitedVarieties = varieties.slice(0, 5);
    setLocalVarieties(limitedVarieties);

    // 设置第一个品种为活动Tab
    if (limitedVarieties.length > 0) {
      setActiveTabId(limitedVarieties[0].id);
    }
  }, []);

  const applyChanges = useCallback(() => {
    onVarietiesChange(localVarieties);
  }, [localVarieties, onVarietiesChange]);

  const cancelChanges = useCallback(() => {
    setLocalVarieties(varieties.length > 0 ? varieties : defaultVarieties);
  }, [varieties]);

  // 背景模板切换处理
  const handleTemplateChange = useCallback((template: BackgroundTemplate) => {
    setGlobalBackgroundTemplate(template);
    setAssetImageError(false);
  }, []);

  // 素材图片加载失败处理
  const handleAssetImageError = useCallback(() => {
    console.warn('品种素材图片加载失败');
    setAssetImageError(true);
  }, []);

  // 切换单个品种的折叠状态
  const toggleVarietyCollapse = useCallback((varietyId: string) => {
    setCollapsedVarieties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(varietyId)) {
        newSet.delete(varietyId);
      } else {
        newSet.add(varietyId);
      }
      return newSet;
    });
  }, []);

  // 全部展开
  const expandAll = useCallback(() => {
    setCollapsedVarieties(new Set());
  }, []);

  // 全部收起
  const collapseAll = useCallback(() => {
    setCollapsedVarieties(new Set(localVarieties.map(v => v.id)));
  }, [localVarieties]);

  // 在组件首次加载时，自动获取所有默认品种的数据
  useEffect(() => {
    if (isInitialLoad && varieties.length === 0) {
      // 只在首次加载且使用默认品种时才自动获取数据
      console.log('开始自动获取所有默认品种的期货数据...');

      // 批量获取所有品种的数据
      localVarieties.forEach((variety) => {
        if (variety.futuresData.contractName) {
          // 使用立即执行函数，不使用防抖
          fetchFuturesDataImmediately(variety.id, variety.futuresData.contractName);
        }
      });

      setIsInitialLoad(false);
    }
  }, [isInitialLoad, varieties.length, localVarieties, fetchFuturesDataImmediately]);

  // 重置素材图片错误状态（当素材图片URL变化时）
  const backgroundImageUrl = getBackgroundImage(globalBackgroundTemplate);
  const firstVariety = localVarieties[0];
  const assetImageUrl = firstVariety
    ? getVarietyAssetImage(firstVariety.futuresData.contractName, globalBackgroundTemplate)
    : '';

  useEffect(() => {
    setAssetImageError(false);
  }, [assetImageUrl]);

  // 配置区域组件 - 使用 useMemo 缓存，避免不必要的重新渲染
  const ConfigPanel = useMemo(() => (
    <>
      <NavigationTabs>
        {localVarieties.map((variety, index) => (
          <NavTab
            key={variety.id}
            $active={activeTabId === variety.id}
            onClick={() => handleTabClick(variety.id)}
          >
            {variety.futuresData.contractName || `品种${index + 1}`}
          </NavTab>
        ))}
      </NavigationTabs>
      <ConfigSection>
        {/* 背景模板选择器 */}
        <TemplateSelector>
          <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>背景模板：</span>
          <TemplateOption selected={globalBackgroundTemplate === '暗'}>
            <input
              type="radio"
              name="globalBackgroundTemplate"
              value="暗"
              checked={globalBackgroundTemplate === '暗'}
              onChange={() => handleTemplateChange('暗')}
            />
            <span>暗色系</span>
          </TemplateOption>
          <TemplateOption selected={globalBackgroundTemplate === '冷'}>
            <input
              type="radio"
              name="globalBackgroundTemplate"
              value="冷"
              checked={globalBackgroundTemplate === '冷'}
              onChange={() => handleTemplateChange('冷')}
            />
            <span>冷色系</span>
          </TemplateOption>
          <TemplateOption selected={globalBackgroundTemplate === '暖'}>
            <input
              type="radio"
              name="globalBackgroundTemplate"
              value="暖"
              checked={globalBackgroundTemplate === '暖'}
              onChange={() => handleTemplateChange('暖')}
            />
            <span>暖色系</span>
          </TemplateOption>
        </TemplateSelector>

        <ConfigHeader>
          <ConfigTitle style={{ margin: 0 }}>品种配置 ({localVarieties.length}/5)</ConfigTitle>
          <CollapseControls>
            <CollapseButton onClick={expandAll}>全部展开</CollapseButton>
            <CollapseButton onClick={collapseAll}>全部收起</CollapseButton>
          </CollapseControls>
        </ConfigHeader>

        {/* 多品种批量导入 */}
        <MultiVarietyExcelUploader
          onDataImport={handleMultiVarietyImport}
          onError={(error) => console.error('批量导入错误:', error)}
        />

        <VarietyConfigList ref={configListRef}>
        {localVarieties.map((variety, index) => (
          <VarietyConfigCard
            key={variety.id}
            ref={(el) => {
              configCardRefs.current.set(variety.id, el);
            }}
          >
            <ConfigCardTitle>
              <span>品种 {index + 1}</span>
              <CardCollapseButton onClick={() => toggleVarietyCollapse(variety.id)}>
                {collapsedVarieties.has(variety.id) ? '展开 ▼' : '收起 ▲'}
              </CardCollapseButton>
              <RemoveButton
                onClick={() => removeVariety(variety.id)}
              >
                删除
              </RemoveButton>
            </ConfigCardTitle>

            <CardContent collapsed={collapsedVarieties.has(variety.id)}>
            {/* 用户输入区域 */}
            <div style={{ marginBottom: '15px', padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
              <InputField>
                <Label style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                  合约名称
                  {loadingVarietyId === variety.id && (
                    <span style={{ marginLeft: '8px', color: '#007bff', fontSize: '12px' }}>⏳ 正在获取数据...</span>
                  )}
                  {errorVarietyId === variety.id && (
                    <span style={{ marginLeft: '8px', color: '#dc3545', fontSize: '12px' }}>❌ 获取失败</span>
                  )}
                </Label>
                <Input
                  placeholder="请输入合约名称，例如：玻璃、螺纹钢、棉花"
                  value={variety.futuresData.contractName}
                  onChange={(e) => handleVarietyDataChange(variety.id, 'contractName', e.target.value)}
                  style={{ fontSize: '14px', padding: '8px' }}
                />
              </InputField>
            </div>

            {/* 自动获取的数据展示区域 */}
            <div style={{ padding: '12px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e0e0e0', marginBottom: '15px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>
                📊 自动获取的数据：
              </div>
              <InputGroup>
                <InputField>
                  <Label>合约代码</Label>
                  <Input
                    value={variety.futuresData.contractCode || '-'}
                    disabled
                    style={{ background: '#f8f9fa', cursor: 'not-allowed', fontSize: '11px' }}
                  />
                </InputField>
                <InputField>
                  <Label>当前价格</Label>
                  <Input
                    value={variety.futuresData.currentPrice || '-'}
                    disabled
                    style={{ background: '#f8f9fa', cursor: 'not-allowed', fontSize: '11px' }}
                  />
                </InputField>
                <InputField>
                  <Label>涨跌幅(%)</Label>
                  <Input
                    value={variety.futuresData.changePercent || '-'}
                    disabled
                    style={{
                      background: '#f8f9fa',
                      cursor: 'not-allowed',
                      fontSize: '11px',
                      color: (variety.futuresData.changePercent || 0) >= 0 ? '#ff4444' : '#00aa00',
                      fontWeight: 'bold'
                    }}
                  />
                </InputField>
                <InputField>
                  <Label>涨跌额</Label>
                  <Input
                    value={variety.futuresData.changeAmount || '-'}
                    disabled
                    style={{
                      background: '#f8f9fa',
                      cursor: 'not-allowed',
                      fontSize: '11px',
                      color: (variety.futuresData.changeAmount || 0) >= 0 ? '#ff4444' : '#00aa00',
                      fontWeight: 'bold'
                    }}
                  />
                </InputField>
                <InputField>
                  <Label>日期</Label>
                  <Input
                    value={variety.futuresData.date || '-'}
                    disabled
                    style={{ background: '#f8f9fa', cursor: 'not-allowed', fontSize: '11px' }}
                  />
                </InputField>
              </InputGroup>
            </div>
            
            <ExcelUploader
              onDataImport={(opinions) => handleOpinionImport(variety.id, opinions)}
              onError={(error) => console.error('导入错误:', error)}
            />

            {/* 观点列表区域 */}
            <div style={{ marginTop: '15px', borderTop: '1px solid #e0e0e0', paddingTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h5 style={{ margin: 0, fontSize: '13px', color: '#666', fontWeight: 'bold' }}>
                  观点列表 ({variety.opinions.length})
                  {justImportedId === variety.id && (
                    <span style={{ color: '#28a745', fontSize: '11px', marginLeft: '8px' }}>
                      ✓ 已导入
                    </span>
                  )}
                </h5>
                <Button
                  onClick={() => handleAddOpinion(variety.id)}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  + 添加
                </Button>
              </div>

              {variety.opinions.length === 0 ? (
                <div style={{
                  padding: '15px',
                  background: '#f9f9f9',
                  borderRadius: '4px',
                  textAlign: 'center',
                  color: '#999',
                  fontSize: '12px'
                }}>
                  暂无观点数据，请导入Excel或手动添加
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {variety.opinions.map((opinion, opIndex) => (
                    <div
                      key={opIndex}
                      style={{
                        padding: '10px',
                        background: '#f9f9f9',
                        borderRadius: '4px',
                        marginBottom: '10px',
                        position: 'relative'
                      }}
                    >
                      <RemoveButton
                        onClick={() => handleRemoveOpinion(variety.id, opIndex)}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          padding: '2px 6px',
                          fontSize: '11px'
                        }}
                      >
                        删除
                      </RemoveButton>

                      <InputGroup style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <InputField>
                          <Label>期货公司</Label>
                          <Input
                            value={opinion.company}
                            onChange={(e) => handleOpinionEdit(variety.id, opIndex, 'company', e.target.value)}
                            style={{ fontSize: '12px', padding: '5px 8px' }}
                          />
                        </InputField>
                        <InputField>
                          <Label>方向</Label>
                          <Input
                            value={opinion.direction}
                            onChange={(e) => handleOpinionEdit(variety.id, opIndex, 'direction', e.target.value)}
                            style={{ fontSize: '12px', padding: '5px 8px' }}
                          />
                        </InputField>
                        <InputField>
                          <Label>支撑</Label>
                          <Input
                            value={opinion.support}
                            onChange={(e) => handleOpinionEdit(variety.id, opIndex, 'support', e.target.value)}
                            style={{ fontSize: '12px', padding: '5px 8px' }}
                          />
                        </InputField>
                        <InputField>
                          <Label>压力</Label>
                          <Input
                            value={opinion.resistance}
                            onChange={(e) => handleOpinionEdit(variety.id, opIndex, 'resistance', e.target.value)}
                            style={{ fontSize: '12px', padding: '5px 8px' }}
                          />
                        </InputField>
                      </InputGroup>
                      <InputField style={{ marginTop: '8px' }}>
                        <Label>观点逻辑</Label>
                        <Input
                          value={opinion.logic}
                          onChange={(e) => handleOpinionEdit(variety.id, opIndex, 'logic', e.target.value)}
                          style={{ fontSize: '12px', padding: '5px 8px' }}
                        />
                      </InputField>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </CardContent>
          </VarietyConfigCard>
        ))}
      </VarietyConfigList>
      
      <ButtonGroup>
        {localVarieties.length < 5 && (
          <Button onClick={addVariety}>添加品种</Button>
        )}
        <Button onClick={applyChanges}>应用更改</Button>
        <RemoveButton onClick={cancelChanges}>取消</RemoveButton>
      </ButtonGroup>
    </ConfigSection>
    </>
  ), [localVarieties, loadingVarietyId, errorVarietyId, justImportedId, activeTabId, globalBackgroundTemplate, collapsedVarieties, handleTabClick, handleVarietyDataChange, handleOpinionImport, handleOpinionEdit, handleAddOpinion, handleRemoveOpinion, removeVariety, addVariety, applyChanges, cancelChanges, handleMultiVarietyImport, handleTemplateChange, toggleVarietyCollapse, expandAll, collapseAll]);

  // 预览区域组件 - 使用 useMemo 缓存，避免不必要的重新渲染
  const PreviewPanel = useMemo(() => (
    <PreviewContainer
      id="multi-variety-chart"
      ref={previewContainerRef}
      backgroundImage={backgroundImageUrl}
      template={globalBackgroundTemplate}
    >
      {/* 顶部占位区域 - 露出背景图的标题和装饰 */}
      <TopSpacer>
        {/* 品种素材图片 - 定位在TopSpacer内，与单品种模板保持一致 */}
        {!assetImageError && firstVariety && firstVariety.futuresData.contractName && (
          <VarietyAssetImage
            src={assetImageUrl}
            alt={`${firstVariety.futuresData.contractName}素材图`}
            onError={handleAssetImageError}
            crossOrigin="anonymous"
          />
        )}
      </TopSpacer>

      {localVarieties.map((variety, index) => (
        <VarietySection
          key={variety.id}
          ref={(el) => {
            previewSectionRefs.current.set(variety.id, el);
          }}
        >
          <VarietyHeader>
            <VarietyTitle isDarkTheme={globalBackgroundTemplate === '暗'}>
              {variety.futuresData.contractName} {variety.futuresData.contractCode}
            </VarietyTitle>
            <VarietyIndex>品种 {index + 1}</VarietyIndex>
          </VarietyHeader>

          <ContentGrid>
            <ChartSection>
              <SectionTitle>
                <SectionIcon>📊</SectionIcon>
                价格走势图
              </SectionTitle>
              <CandlestickChart data={variety.futuresData} />
            </ChartSection>

            <OpinionSection>
              <SectionTitle>
                <SectionIcon>💡</SectionIcon>
                机构观点
              </SectionTitle>
              <OpinionTable opinions={variety.opinions} />
            </OpinionSection>
          </ContentGrid>
        </VarietySection>
      ))}
    </PreviewContainer>
  ), [localVarieties, backgroundImageUrl, assetImageUrl, assetImageError, firstVariety, handleAssetImageError, globalBackgroundTemplate]);

  return (
    <MainContainer>
      <LeftPanel>
        {ConfigPanel}
      </LeftPanel>

      <RightPanel>
        {PreviewPanel}
      </RightPanel>
    </MainContainer>
  );
};

export default MultiVarietyChart;
export type { VarietyData };