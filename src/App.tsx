import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import styled from 'styled-components';
import DataInputForm, { FuturesData, CompanyOpinion } from './components/DataInputForm';
import FuturesInfoCard from './components/FuturesInfoCard';
import ExportButton from './components/ExportButton';
import OverviewPage from './components/OverviewPage';
import MultiVarietyChart, { VarietyData } from './components/MultiVarietyChart';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
  color: white;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: minmax(500px, 1fr) minmax(400px, 600px);
  gap: 30px;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 15px;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const ExportSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
`;

// 单品种页面组件
interface SingleVarietyPageProps {
  futuresData: FuturesData;
  opinions: CompanyOpinion[];
  onDataChange: (data: FuturesData, opinions: CompanyOpinion[]) => void;
}

const SingleVarietyPage: React.FC<SingleVarietyPageProps> = React.memo(({
  futuresData,
  opinions,
  onDataChange
}) => (
  <AppContainer>
    <Header>
      <Title>期货策略长图生成器</Title>
      <Subtitle>自动化生成专业的期货分析图表</Subtitle>
    </Header>

    <ContentContainer>
      <LeftPanel>
        <DataInputForm
          futuresData={futuresData}
          opinions={opinions}
          onDataChange={onDataChange}
        />
        <ExportSection>
          <ExportButton
            targetId="futures-info-card"
            filename="futures-strategy-chart"
          />
        </ExportSection>
      </LeftPanel>

      <RightPanel>
        <FuturesInfoCard data={futuresData} opinions={opinions} />
      </RightPanel>
    </ContentContainer>
  </AppContainer>
));
SingleVarietyPage.displayName = 'SingleVarietyPage';

// 多品种页面组件
interface MultiVarietyPageProps {
  varieties: VarietyData[];
  onVarietiesChange: (varieties: VarietyData[]) => void;
}

const MultiVarietyPage: React.FC<MultiVarietyPageProps> = React.memo(({
  varieties,
  onVarietiesChange
}) => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif'
  }}>
    <div style={{
      textAlign: 'center',
      marginBottom: '20px',
      color: 'white'
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 0 10px 0',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
      }}>多品种期货分析</h1>
      <p style={{
        fontSize: '16px',
        margin: '0 0 20px 0',
        opacity: 0.9
      }}>同时分析多个期货品种的投资机会</p>
    </div>

    <MultiVarietyChart
      varieties={varieties}
      onVarietiesChange={onVarietiesChange}
    />

    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)',
      marginTop: '20px',
      maxWidth: '1600px',
      margin: '20px auto 0'
    }}>
      <ExportButton
        targetId="multi-variety-chart"
        filename="multi-variety-analysis"
      />
    </div>
  </div>
));
MultiVarietyPage.displayName = 'MultiVarietyPage';

function App() {
  const [futuresData, setFuturesData] = useState<FuturesData>({
    contractName: '玻璃',
    contractCode: '2505',
    currentPrice: 1163,
    changePercent: 1.22,
    changeAmount: 14,
    date: '2025/03/14',
    mainPrice: 1163
  });

  const [opinions, setOpinions] = useState<CompanyOpinion[]>([
    {
      company: '平安期货',
      direction: '偏多',
      support: '665',
      resistance: '690',
      logic: '特朗普关税政策提振，黄金避险需求上升'
    },
    {
      company: '紫金天风',
      direction: '偏多',
      support: '674-678',
      resistance: '690-694',
      logic: '基本面：黄金短期调整，黄金中长期多头逻辑未变'
    }
  ]);

  const [varieties, setVarieties] = useState<VarietyData[]>([]);
  // const [selectedTemplate, setSelectedTemplate] = useState<'single' | 'multi' | null>(null);

  const handleDataChange = useCallback((newData: FuturesData, newOpinions: CompanyOpinion[]) => {
    setFuturesData(newData);
    setOpinions(newOpinions);
  }, []);

  const handleTemplateSelect = useCallback((template: 'single' | 'multi') => {
    // setSelectedTemplate(template);
    console.log('Template selected:', template);
  }, []);

  const handleVarietiesChange = useCallback((newVarieties: VarietyData[]) => {
    setVarieties(newVarieties);
  }, []);

  return (
    <Router>
        <Routes>
          <Route path="/" element={<OverviewPage onTemplateSelect={handleTemplateSelect} />} />
          <Route
            path="/single"
            element={
              <SingleVarietyPage
                futuresData={futuresData}
                opinions={opinions}
                onDataChange={handleDataChange}
              />
            }
          />
          <Route
            path="/multi"
            element={
              <MultiVarietyPage
                varieties={varieties}
                onVarietiesChange={handleVarietiesChange}
              />
            }
          />
        </Routes>
      </Router>
  );
}

export default App;
