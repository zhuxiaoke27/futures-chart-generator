import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import styled from 'styled-components';

interface ExportButtonProps {
  targetId: string;
  filename?: string;
  varietyName?: string;
  isMultiVariety?: boolean;
}

const ExportContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 20px 0;
`;

const ExportBtn = styled.button<{ $loading: boolean }>`
  padding: 12px 24px;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: ${props => props.$loading ? 0.7 : 1};
  
  &:hover {
    transform: ${props => props.$loading ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.$loading ? 'none' : '0 8px 25px rgba(102, 126, 234, 0.3)'};
  }
  
  &:active {
    transform: ${props => props.$loading ? 'none' : 'translateY(0)'};
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#d4edda';
      case 'error': return '#f8d7da';
      case 'info': return '#d1ecf1';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'info': return '#0c5460';
      default: return '#495057';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#c3e6cb';
      case 'error': return '#f5c6cb';
      case 'info': return '#bee5eb';
      default: return '#dee2e6';
    }
  }};
`;

const ExportButton: React.FC<ExportButtonProps> = ({
  targetId,
  filename = 'futures-strategy-chart',
  varietyName,
  isMultiVariety = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // 等待所有图片加载完成
  const waitForImages = (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img');
    console.log('等待图片加载，图片总数:', images.length);

    const promises = Array.from(images).map((img, index) => {
      console.log(`图片 ${index + 1}: ${img.src}, 已加载: ${img.complete}`);

      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          console.log(`图片 ${index + 1} 加载成功`);
          resolve();
        };
        img.onerror = () => {
          console.warn('图片加载失败:', img.src);
          resolve(); // 即使图片加载失败也继续
        };
        // 设置超时，避免无限等待
        setTimeout(() => {
          console.warn(`图片 ${index + 1} 加载超时`);
          resolve();
        }, 5000);
      });
    });
    return Promise.all(promises).then(() => {
      console.log('所有图片加载完成');
    });
  };

  // 等待Canvas图表渲染完成并处理Chart.js兼容性
  const waitForCharts = (): Promise<void> => {
    return new Promise(resolve => {
      // 等待Chart.js渲染完成
      setTimeout(() => {
        const canvases = document.querySelectorAll('canvas');
        let allReady = true;
        canvases.forEach(canvas => {
          const ctx = canvas.getContext('2d');
          if (ctx && (ctx.canvas.width === 0 || ctx.canvas.height === 0)) {
            allReady = false;
          }
        });
        if (allReady) {
          resolve();
        } else {
          // 如果图表还没准备好，再等待一下
          setTimeout(resolve, 1500);
        }
      }, 800);
    });
  };

  // 处理Chart.js canvas元素的特殊方法
  const prepareChartsForExport = async (): Promise<void> => {
    const canvases = document.querySelectorAll('canvas');
    
    Array.from(canvases).forEach(canvas => {
      try {
        // 确保canvas有内容
        const ctx = canvas.getContext('2d');
        if (!ctx || canvas.width === 0 || canvas.height === 0) {
          return;
        }

        // 为canvas添加特殊属性以便html2canvas正确处理
        canvas.style.imageRendering = 'pixelated';
        canvas.style.imageRendering = '-moz-crisp-edges';
        canvas.style.imageRendering = 'crisp-edges';
        
        // 强制重绘
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);
        
      } catch (error) {
        console.warn('处理canvas时出错:', error);
      }
    });
  };

  const exportToImage = async () => {
    setIsExporting(true);
    setStatus({ type: 'info', message: '正在准备导出...' });

    try {
      const element = document.getElementById(targetId);
      if (!element) {
        throw new Error('未找到目标元素');
      }

      setStatus({ type: 'info', message: '等待图片加载...' });
      // 等待所有图片加载完成
      await waitForImages(element);

      setStatus({ type: 'info', message: '等待图表渲染...' });
      // 等待图表渲染完成
      await waitForCharts();

      setStatus({ type: 'info', message: '准备图表导出...' });
      // 处理Chart.js canvas元素
      await prepareChartsForExport();
      
      setStatus({ type: 'info', message: '正在生成图片...' });
      // 额外等待确保所有内容都已渲染
      await new Promise(resolve => setTimeout(resolve, 1200));

      // 使用元素的实际宽度（600px），通过 html2canvas 的 scale 参数放大到 750px
      const originalRect = element.getBoundingClientRect();
      const fixedWidth = originalRect.width;

      // 保存元素原始样式
      const originalOverflow = element.style.overflow;
      const originalOverflowY = element.style.overflowY;
      const originalHeight = element.style.height;
      const originalMaxHeight = element.style.maxHeight;
      const originalPosition = element.style.position;
      const originalWidth = element.style.width;

      // 保存父容器原始样式
      const parentElement = element.parentElement;
      const parentOriginalHeight = parentElement?.style.height || '';
      const parentOriginalMaxHeight = parentElement?.style.maxHeight || '';

      // 强制滚动到顶部
      element.scrollTop = 0;
      if (parentElement) {
        parentElement.scrollTop = 0;
      }

      // 固定宽度，避免布局变化
      element.style.width = `${fixedWidth}px`;

      // 临时移除元素的滚动和高度限制
      element.style.overflow = 'visible';
      element.style.overflowY = 'visible';
      element.style.height = 'auto';
      element.style.maxHeight = 'none';
      element.style.position = 'static';

      // 临时移除父容器的高度限制（但不修改overflow，避免影响布局）
      if (parentElement) {
        parentElement.style.height = 'auto';
        parentElement.style.maxHeight = 'none';
      }

      // 等待DOM完全重新计算和重排
      await new Promise(resolve => setTimeout(resolve, 500));

      // 再次等待所有图片加载（特别是底部图片）
      await waitForImages(element);

      // 额外等待，确保图片完全渲染到 DOM
      await new Promise(resolve => setTimeout(resolve, 800));

      // 获取元素的实际尺寸
      const actualWidth = fixedWidth;
      const actualHeight = element.scrollHeight;
      const currentRect = element.getBoundingClientRect();

      // 详细日志用于调试
      console.log('导出尺寸详情:', {
        actualWidth,
        actualHeight,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
        offsetHeight: element.offsetHeight,
        boundingHeight: currentRect.height
      });

      const canvas = await html2canvas(element, {
        scale: 2, // 使用2倍放大以提升清晰度
        useCORS: true, // 允许跨域图片
        allowTaint: true, // 允许本地图片
        backgroundColor: '#ffffff', // 设置白色背景
        logging: false, // 关闭日志
        foreignObjectRendering: false, // 禁用外部对象渲染以提高兼容性
        imageTimeout: 20000, // 增加图片加载超时时间
        removeContainer: false, // 不移除容器，保留完整DOM
        onclone: (clonedDoc) => {
          // 确保克隆文档中的样式正确应用
          const clonedElement = clonedDoc.getElementById(targetId);
          if (clonedElement) {
            // 处理元素本身
            clonedElement.style.position = 'static';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.height = 'auto';
            clonedElement.style.maxHeight = 'none';
            clonedElement.style.borderRadius = '0'; // 移除圆角，避免截断

            // 处理父容器
            const clonedParent = clonedElement.parentElement;
            if (clonedParent) {
              clonedParent.style.overflow = 'visible';
              clonedParent.style.height = 'auto';
              clonedParent.style.maxHeight = 'none';
            }

            // 不使用 CSS transform，让 html2canvas 的 scale 参数自然放大
            // 这样可以避免图片变形问题
            clonedElement.style.transform = 'none';

            // 确保所有图片可见且保留原始样式
            const clonedImages = clonedElement.querySelectorAll('img');
            const originalImages = element.querySelectorAll('img');
            console.log('克隆文档中的图片数量:', clonedImages.length);

            Array.from(clonedImages).forEach((img, index) => {
              const originalImg = originalImages[index];
              if (originalImg) {
                const computedStyle = window.getComputedStyle(originalImg);

                // 确保图片可见
                img.style.display = 'block';
                img.style.visibility = 'visible';
                img.style.opacity = '1';

                // 保留定位信息
                img.style.position = computedStyle.position;
                if (computedStyle.position === 'absolute') {
                  img.style.top = computedStyle.top;
                  img.style.right = computedStyle.right;
                  img.style.bottom = computedStyle.bottom;
                  img.style.left = computedStyle.left;

                  // 关键修复：手动计算容器尺寸以匹配图片比例
                  // 这样不需要 object-fit 也能保持图片不变形
                  const containerWidth = parseFloat(computedStyle.width);
                  const containerHeight = parseFloat(computedStyle.height);

                  if (img.naturalWidth && img.naturalHeight) {
                    const imageRatio = img.naturalWidth / img.naturalHeight;
                    const containerRatio = containerWidth / containerHeight;

                    let finalWidth = containerWidth;
                    let finalHeight = containerHeight;

                    // 计算在容器内保持比例的最大尺寸
                    if (imageRatio > containerRatio) {
                      // 图片更宽，以宽度为准
                      finalHeight = containerWidth / imageRatio;

                      // 调整top位置以保持垂直居中
                      const heightDiff = containerHeight - finalHeight;
                      const currentTop = parseFloat(computedStyle.top);
                      img.style.top = `${currentTop + (heightDiff / 2)}px`;
                    } else {
                      // 图片更高，以高度为准
                      finalWidth = containerHeight * imageRatio;

                      // 调整right位置以保持水平居中
                      const widthDiff = containerWidth - finalWidth;
                      const currentRight = parseFloat(computedStyle.right);
                      img.style.right = `${currentRight + (widthDiff / 2)}px`;
                    }

                    // 设置容器为计算后的尺寸
                    img.style.width = `${finalWidth}px`;
                    img.style.height = `${finalHeight}px`;

                    // 不使用 object-fit，让图片自然填充
                    img.style.objectFit = 'fill';

                    console.log(`图片 ${index + 1} (absolute):`, {
                      src: img.src.split('/').pop(),
                      naturalSize: `${img.naturalWidth}x${img.naturalHeight}`,
                      naturalRatio: imageRatio.toFixed(2),
                      originalContainer: `${containerWidth}x${containerHeight}`,
                      finalContainer: `${finalWidth.toFixed(1)}x${finalHeight.toFixed(1)}`,
                      finalRatio: (finalWidth / finalHeight).toFixed(2),
                      adjustedPosition: {
                        top: img.style.top,
                        right: img.style.right
                      }
                    });
                  } else {
                    // 如果无法获取自然尺寸，保持原样
                    img.style.width = computedStyle.width;
                    img.style.height = computedStyle.height;
                    img.style.objectFit = 'contain';
                  }
                } else {
                  // 非 absolute 定位的图片，保持原样
                  img.style.width = computedStyle.width;
                  img.style.height = computedStyle.height;
                  img.style.objectFit = computedStyle.objectFit;
                }
              }
            });

            // 特别处理canvas元素
            const clonedCanvases = clonedElement.querySelectorAll('canvas');
            Array.from(clonedCanvases).forEach(clonedCanvas => {
              clonedCanvas.style.imageRendering = 'auto';
              clonedCanvas.style.display = 'block';
              clonedCanvas.style.visibility = 'visible';
            });
          }
        }
      });

      // 恢复元素原始样式
      element.style.overflow = originalOverflow;
      element.style.overflowY = originalOverflowY;
      element.style.height = originalHeight;
      element.style.maxHeight = originalMaxHeight;
      element.style.position = originalPosition;
      element.style.width = originalWidth;

      // 恢复父容器原始样式
      if (parentElement) {
        parentElement.style.height = parentOriginalHeight;
        parentElement.style.maxHeight = parentOriginalMaxHeight;
      }

      console.log('Canvas尺寸:', { width: canvas.width, height: canvas.height });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('生成的图片尺寸为0，请检查目标元素是否可见');
      }

      // 生成文件名
      const generateFilename = () => {
        // 如果传入了 varietyName 或 isMultiVariety，使用新的命名规则
        if (varietyName || isMultiVariety) {
          const today = new Date();
          const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          if (isMultiVariety) {
            return `${dateStr}盘前策略汇总`;
          } else if (varietyName) {
            return `${dateStr}${varietyName}盘前策略`;
          }
        }

        // 回退到原有逻辑（向后兼容）
        return `${filename}-${new Date().toISOString().slice(0, 10)}`;
      };

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `${generateFilename()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatus({ type: 'success', message: '图片导出成功！' });
    } catch (error) {
      console.error('导出失败:', error);
      setStatus({ 
        type: 'error', 
        message: `导出失败: ${error instanceof Error ? error.message : '未知错误'}` 
      });
    } finally {
      setIsExporting(false);
      // 3秒后清除状态消息
      setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 3000);
    }
  };

  return (
    <ExportContainer>
      <ExportBtn 
        onClick={exportToImage} 
        disabled={isExporting}
        $loading={isExporting}
      >
        {isExporting ? (
          <>
            <LoadingSpinner />
            生成中...
          </>
        ) : (
          <>
            📸 导出图片
          </>
        )}
      </ExportBtn>
      
      {status.type && (
        <StatusMessage type={status.type}>
          {status.message}
        </StatusMessage>
      )}
    </ExportContainer>
  );
};

export default ExportButton;