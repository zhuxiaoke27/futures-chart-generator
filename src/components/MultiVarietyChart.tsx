import React, { useState } from 'react';
import styled from 'styled-components';
import { FuturesData, CompanyOpinion } from './DataInputForm';
import CandlestickChart from './CandlestickChart';
import OpinionTable from './OpinionTable';
import ExcelUploader from './ExcelUploader';

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

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  text-align: center;
`;

const HeaderTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const HeaderSubtitle = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
`;

const TopImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  background-color: #f0f0f0;
`;

const VarietySection = styled.div`
  padding: 30px 50px;
  border-bottom: 2px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const VarietyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const VarietyTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #333;
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
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
`;

const OpinionSection = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
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

const BottomImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  background-color: #f0f0f0;
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
  grid-template-columns: 400px 1fr;
  gap: 30px;
  height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
  
  @media (max-width: 1200px) {
    grid-template-columns: 350px 1fr;
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

const PreviewContainer = styled.div`
  width: 100%;
  background: white;
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

// 默认品种数据
const defaultVarieties: VarietyData[] = [
  {
    id: '1',
    futuresData: {
      contractName: '玻璃',
      contractCode: '2505',
      currentPrice: 1163,
      changePercent: 1.22,
      changeAmount: 14,
      date: '2025/03/14'
    },
    opinions: [
      {
        company: '平安期货',
        direction: '偏多',
        support: '1150',
        resistance: '1200',
        logic: '基本面支撑较强，技术面突破在即'
      }
    ]
  },
  {
    id: '2',
    futuresData: {
      contractName: '螺纹钢',
      contractCode: '2505',
      currentPrice: 3850,
      changePercent: -0.85,
      changeAmount: -33,
      date: '2025/03/14'
    },
    opinions: [
      {
        company: '紫金天风',
        direction: '震荡',
        support: '3800',
        resistance: '3900',
        logic: '供需平衡，短期维持区间震荡'
      }
    ]
  },
  {
    id: '3',
    futuresData: {
      contractName: '铜',
      contractCode: '2505',
      currentPrice: 74500,
      changePercent: 2.15,
      changeAmount: 1570,
      date: '2025/03/14'
    },
    opinions: [
      {
        company: '国泰君安',
        direction: '偏多',
        support: '73000',
        resistance: '76000',
        logic: '全球经济复苏预期，铜需求增长'
      }
    ]
  },
  {
    id: '4',
    futuresData: {
      contractName: '原油',
      contractCode: '2505',
      currentPrice: 520,
      changePercent: -1.25,
      changeAmount: -6.6,
      date: '2025/03/14'
    },
    opinions: [
      {
        company: '中信期货',
        direction: '偏空',
        support: '510',
        resistance: '530',
        logic: '供应增加，需求疲软，价格承压'
      }
    ]
  },
  {
    id: '5',
    futuresData: {
      contractName: '黄金',
      contractCode: '2506',
      currentPrice: 680,
      changePercent: 0.75,
      changeAmount: 5.1,
      date: '2025/03/14'
    },
    opinions: [
      {
        company: '海通期货',
        direction: '偏多',
        support: '675',
        resistance: '690',
        logic: '避险情绪升温，黄金配置价值凸显'
      }
    ]
  }
];

const MultiVarietyChart: React.FC<MultiVarietyChartProps> = ({ varieties, onVarietiesChange }) => {
  const [localVarieties, setLocalVarieties] = useState<VarietyData[]>(varieties.length > 0 ? varieties : defaultVarieties);
  const [justImportedId, setJustImportedId] = useState<string | null>(null);

  const handleVarietyDataChange = (varietyId: string, field: keyof FuturesData, value: string | number) => {
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
  };

  const handleOpinionImport = (varietyId: string, opinions: CompanyOpinion[]) => {
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
  };

  // 处理观点编辑
  const handleOpinionEdit = (varietyId: string, opinionIndex: number, field: keyof CompanyOpinion, value: string) => {
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
  };

  // 添加观点
  const handleAddOpinion = (varietyId: string) => {
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
  };

  // 删除观点
  const handleRemoveOpinion = (varietyId: string, opinionIndex: number) => {
    setLocalVarieties(prev => prev.map(variety => {
      if (variety.id === varietyId) {
        return {
          ...variety,
          opinions: variety.opinions.filter((_, index) => index !== opinionIndex)
        };
      }
      return variety;
    }));
  };

  const addVariety = () => {
    const newVariety: VarietyData = {
      id: Date.now().toString(),
      futuresData: {
        contractName: '新品种',
        contractCode: '2505',
        currentPrice: 0,
        changePercent: 0,
        changeAmount: 0,
        date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')
      },
      opinions: []
    };
    setLocalVarieties(prev => [...prev, newVariety]);
  };

  const removeVariety = (varietyId: string) => {
    setLocalVarieties(prev => prev.filter(variety => variety.id !== varietyId));
  };

  const applyChanges = () => {
    onVarietiesChange(localVarieties);
  };

  const cancelChanges = () => {
    setLocalVarieties(varieties.length > 0 ? varieties : defaultVarieties);
  };

  // 配置区域组件
  const ConfigPanel = () => (
    <ConfigSection>
      <ConfigTitle>品种配置 ({localVarieties.length}/5)</ConfigTitle>
      
      <VarietyConfigList>
        {localVarieties.map((variety, index) => (
          <VarietyConfigCard key={variety.id}>
            <ConfigCardTitle>
              品种 {index + 1}
              <RemoveButton 
                onClick={() => removeVariety(variety.id)}
                style={{ float: 'right' }}
              >
                删除
              </RemoveButton>
            </ConfigCardTitle>
            
            <InputGroup>
              <InputField>
                <Label>品种名称</Label>
                <Input
                  value={variety.futuresData.contractName}
                  onChange={(e) => handleVarietyDataChange(variety.id, 'contractName', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>合约代码</Label>
                <Input
                  value={variety.futuresData.contractCode}
                  onChange={(e) => handleVarietyDataChange(variety.id, 'contractCode', e.target.value)}
                />
              </InputField>
              <InputField>
                <Label>当前价格</Label>
                <Input
                  type="number"
                  value={variety.futuresData.currentPrice}
                  onChange={(e) => handleVarietyDataChange(variety.id, 'currentPrice', parseFloat(e.target.value) || 0)}
                />
              </InputField>
              <InputField>
                <Label>涨跌幅(%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variety.futuresData.changePercent}
                  onChange={(e) => handleVarietyDataChange(variety.id, 'changePercent', parseFloat(e.target.value) || 0)}
                />
              </InputField>
              <InputField>
                <Label>涨跌额</Label>
                <Input
                  type="number"
                  value={variety.futuresData.changeAmount}
                  onChange={(e) => handleVarietyDataChange(variety.id, 'changeAmount', parseFloat(e.target.value) || 0)}
                />
              </InputField>
              <InputField>
                <Label>日期</Label>
                <Input
                  value={variety.futuresData.date}
                  onChange={(e) => handleVarietyDataChange(variety.id, 'date', e.target.value)}
                />
              </InputField>
            </InputGroup>
            
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
  );

  // 预览区域组件
  const PreviewPanel = () => (
    <PreviewContainer id="multi-variety-chart">
      <TopImage src="/top.png" alt="顶部装饰图" />
      
      <Header>
        <HeaderTitle>期货市场多品种分析报告</HeaderTitle>
        <HeaderSubtitle>专业的期货分析与投资建议</HeaderSubtitle>
      </Header>
      
      {localVarieties.map((variety, index) => (
        <VarietySection key={variety.id}>
          <VarietyHeader>
            <VarietyTitle>{variety.futuresData.contractName} {variety.futuresData.contractCode}</VarietyTitle>
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
      
      <BottomImage src="/button.png" alt="底部装饰图" />
    </PreviewContainer>
  );

  return (
    <MainContainer>
      <LeftPanel>
        <ConfigPanel />
      </LeftPanel>
      
      <RightPanel>
        <PreviewPanel />
      </RightPanel>
    </MainContainer>
  );
};

export default MultiVarietyChart;
export type { VarietyData };