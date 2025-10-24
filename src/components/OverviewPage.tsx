import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

interface OverviewPageProps {
  onTemplateSelect: (template: 'single' | 'multi') => void;
}

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 60px;
  color: white;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  font-size: 20px;
  margin: 0 0 10px 0;
  opacity: 0.9;
`;

const Description = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
`;

const TemplateCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  }
`;

const CardImage = styled.div<{ $bgColor: string }>`
  height: 200px;
  background: ${props => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  }
`;

const CardContent = styled.div`
  padding: 30px;
`;

const CardTitle = styled.h3`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 15px 0;
`;

const CardDescription = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 20px 0;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 25px 0;
`;

const FeatureItem = styled.li`
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  padding-left: 20px;
  position: relative;
  
  &::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #28a745;
    font-weight: bold;
  }
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FeaturesSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px;
  backdrop-filter: blur(10px);
  color: white;
  text-align: center;
`;

const FeaturesTitle = styled.h2`
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 30px 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled.div`
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 15px;
`;

const FeatureTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px 0;
`;

const FeatureDescription = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
`;

const OverviewPage: React.FC<OverviewPageProps> = ({ onTemplateSelect }) => {
  const navigate = useNavigate();

  const handleTemplateSelect = (template: 'single' | 'multi') => {
    onTemplateSelect(template);
    navigate(`/${template}`);
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Title>期货策略长图生成器</Title>
          <Subtitle>专业的期货分析图表制作工具</Subtitle>
          <Description>
            选择适合您需求的模板，快速生成专业的期货分析图表。
            支持单品种深度分析和多品种对比分析两种模式。
          </Description>
        </Header>
        
        <TemplateGrid>
          <TemplateCard onClick={() => handleTemplateSelect('single')}>
            <CardImage $bgColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
              📊
            </CardImage>
            <CardContent>
              <CardTitle>单品种分析模板</CardTitle>
              <CardDescription>
                专注于单一期货品种的深度分析，提供详细的价格走势图和机构观点汇总。
              </CardDescription>
              <FeatureList>
                <FeatureItem>K线图表展示</FeatureItem>
                <FeatureItem>机构观点汇总</FeatureItem>
                <FeatureItem>支撑阻力分析</FeatureItem>
                <FeatureItem>Excel数据导入</FeatureItem>
                <FeatureItem>一键导出图片</FeatureItem>
              </FeatureList>
              <SelectButton>
                选择单品种模板
              </SelectButton>
            </CardContent>
          </TemplateCard>
          
          <TemplateCard onClick={() => handleTemplateSelect('multi')}>
            <CardImage $bgColor="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
              📈
            </CardImage>
            <CardContent>
              <CardTitle>多品种对比模板</CardTitle>
              <CardDescription>
                同时展示多个期货品种的分析结果，便于横向对比和投资组合分析。
              </CardDescription>
              <FeatureList>
                <FeatureItem>最多5个品种对比</FeatureItem>
                <FeatureItem>统一格式展示</FeatureItem>
                <FeatureItem>批量数据导入</FeatureItem>
                <FeatureItem>长图一键生成</FeatureItem>
                <FeatureItem>专业排版设计</FeatureItem>
              </FeatureList>
              <SelectButton>
                选择多品种模板
              </SelectButton>
            </CardContent>
          </TemplateCard>
        </TemplateGrid>
        
        <FeaturesSection>
          <FeaturesTitle>核心功能特性</FeaturesTitle>
          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>🎨</FeatureIcon>
              <FeatureTitle>专业设计</FeatureTitle>
              <FeatureDescription>
                精美的视觉设计，符合金融行业标准，提升报告专业度
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>📋</FeatureIcon>
              <FeatureTitle>数据导入</FeatureTitle>
              <FeatureDescription>
                支持Excel文件导入，快速批量录入机构观点数据
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>⚡</FeatureIcon>
              <FeatureTitle>快速生成</FeatureTitle>
              <FeatureDescription>
                一键生成高质量图表，大幅提升工作效率
              </FeatureDescription>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>💾</FeatureIcon>
              <FeatureTitle>多格式导出</FeatureTitle>
              <FeatureDescription>
                支持PNG、JPG等多种格式导出，满足不同使用场景
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesSection>
      </ContentContainer>
    </PageContainer>
  );
};

export default OverviewPage;