import React from 'react';
import styled from 'styled-components';
import { FuturesData, CompanyOpinion, BackgroundTemplate } from './DataInputForm';
import CandlestickChart from './CandlestickChart';
import OpinionTable from './OpinionTable';

interface FuturesInfoCardProps {
  data: FuturesData;
  opinions: CompanyOpinion[];
}

const getBackgroundImage = (template: BackgroundTemplate): string => {
  return `/background_pic/${template}.png`;
};

// 获取品种素材图片路径
const getVarietyAssetImage = (contractName: string, template: BackgroundTemplate): string => {
  // 去除合约名称中可能的空格和数字
  const cleanName = contractName.replace(/\s+/g, '').replace(/\d+/g, '');
  return `/assets/${cleanName}-${template}.png`;
};

const CardContainer = styled.div<{ backgroundImage: string }>`
  width: 100%;
  max-width: 600px;
  min-height: fit-content; /* 根据内容自适应高度 */
  background-image: url(${props => props.backgroundImage});
  background-size: 100% auto; /* 宽度填满，高度自适应 */
  background-position: top center; /* 从顶部开始对齐 */
  background-repeat: no-repeat;
  border-radius: 12px;
  padding: 0;
  padding-bottom: 60px; /* 底部留白，避免内容紧贴边缘 */
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

/* 顶部占位区域，对应背景图的标题部分 */
const TopSpacer = styled.div`
  height: 292px; /* 按 Figma 设计比例缩放：365 * (600/750) */
  width: 100%;
  position: relative; /* 为品种素材图片提供定位上下文 */
`;

/* 品种素材图片 */
const VarietyAssetImage = styled.img`
  position: absolute;
  width: 190px; /* 缩小至原尺寸的约80% */
  height: 178px; /* 缩小至原尺寸的约80% */
  right: 40px; /* 保持右边缘位置不变 */
  top: 55px; /* 适当下移 */
  object-fit: contain;
  z-index: 2;

  /* 如果图片加载失败，不显示 */
  &[src=""], &:not([src]) {
    display: none;
  }
`;


const ChartSection = styled.div`
  margin: 20px 20px 0 20px;
`;

const TableSection = styled.div`
  margin: 20px 20px 20px 20px;
  padding-bottom: 40px; /* 表格底部额外留白 */
`;


const FuturesInfoCard: React.FC<FuturesInfoCardProps> = ({ data, opinions }) => {
  const [backgroundLoaded, setBackgroundLoaded] = React.useState(false);
  const [assetImageError, setAssetImageError] = React.useState(false);
  const backgroundImageUrl = getBackgroundImage(data.backgroundTemplate);
  const assetImageUrl = getVarietyAssetImage(data.contractName, data.backgroundTemplate);

  // 预加载背景图
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => setBackgroundLoaded(true);
    img.onerror = () => {
      console.warn('背景图加载失败:', backgroundImageUrl);
      setBackgroundLoaded(true); // 即使失败也标记为已加载，避免无限等待
    };
    img.src = backgroundImageUrl;
  }, [backgroundImageUrl]);

  // 处理品种素材图片加载错误
  const handleAssetImageError = () => {
    console.warn('品种素材图片加载失败:', assetImageUrl);
    setAssetImageError(true);
  };

  // 重置素材图片错误状态（当品种或背景模板变化时）
  React.useEffect(() => {
    setAssetImageError(false);
  }, [assetImageUrl]);

  return (
    <CardContainer
      id="futures-info-card"
      backgroundImage={backgroundImageUrl}
      data-background-loaded={backgroundLoaded}
    >
      <TopSpacer>
        {/* 品种素材图片 - 只在图片存在且未加载失败时显示 */}
        {!assetImageError && data.contractName && (
          <VarietyAssetImage
            src={assetImageUrl}
            alt={`${data.contractName}素材图`}
            onError={handleAssetImageError}
            crossOrigin="anonymous"
          />
        )}
      </TopSpacer>

      <ChartSection>
        <CandlestickChart data={data} />
      </ChartSection>

      <TableSection>
        <OpinionTable opinions={opinions} />
      </TableSection>
    </CardContainer>
  );
};

export default FuturesInfoCard;