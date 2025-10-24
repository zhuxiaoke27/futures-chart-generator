import React from 'react';
import styled from 'styled-components';
import { FuturesData, CompanyOpinion } from './DataInputForm';
import CandlestickChart from './CandlestickChart';
import OpinionTable from './OpinionTable';

interface FuturesInfoCardProps {
  data: FuturesData;
  opinions: CompanyOpinion[];
}

const CardContainer = styled.div`
  width: 600px;
  min-height: fit-content;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 12px;
  padding: 0;
  margin: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
  position: relative;
  
  /* 确保导出时的可见性 */
  opacity: 1;
  visibility: visible;
  transform: none;
  z-index: 1;
`;

const TopImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 12px 12px 0 0;
  margin: 0;
  display: block;
  
  /* 确保图片正确加载 */
  object-fit: cover;
  background-color: #f0f0f0;
  
  /* 如果图片加载失败，显示占位符 */
  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 60px;
    background: #f0f0f0;
  }
`;









const ChartSection = styled.div`
  margin: 20px 20px 0 20px;
`;

const TableSection = styled.div`
  margin: 20px 20px 20px 20px;
`;

const BottomImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 0 0 12px 12px;
  margin: 0;
  display: block;
  
  /* 确保图片正确加载 */
  object-fit: cover;
  background-color: #f0f0f0;
  
  /* 如果图片加载失败，显示占位符 */
  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 60px;
    background: #f0f0f0;
  }
`;



const FuturesInfoCard: React.FC<FuturesInfoCardProps> = ({ data, opinions }) => {
  const [imagesLoaded, setImagesLoaded] = React.useState(false);
  // const [loadedCount, setLoadedCount] = React.useState(0);
  
  const handleImageLoad = () => {
    // setLoadedCount(prev => {
    //   const newCount = prev + 1;
    //   if (newCount >= 2) { // 两张图片都加载完成
    //     setImagesLoaded(true);
    //   }
    //   return newCount;
    // });
    setImagesLoaded(true);
  };
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('图片加载失败:', e.currentTarget.src);
    handleImageLoad(); // 即使失败也计数，避免无限等待
  };

  return (
    <CardContainer id="futures-info-card" data-images-loaded={imagesLoaded}>
      <TopImage 
        src="/top.png" 
        alt="期货策略顶部图片" 
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
      />

      <ChartSection>
        <CandlestickChart data={data} />
      </ChartSection>

      <TableSection>
        <OpinionTable opinions={opinions} />
      </TableSection>

      <BottomImage 
        src="/button.png" 
        alt="期货策略底部图片" 
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
      />
    </CardContainer>
  );
};

export default FuturesInfoCard;