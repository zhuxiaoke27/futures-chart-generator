import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import styled from 'styled-components';

interface ExportButtonProps {
  targetId: string;
  filename?: string;
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
  filename = 'futures-strategy-chart' 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // 等待所有图片加载完成
  const waitForImages = (element: HTMLElement): Promise<void> => {
    const images = element.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => {
          console.warn('图片加载失败:', img.src);
          resolve(); // 即使图片加载失败也继续
        };
        // 设置超时，避免无限等待
        setTimeout(() => resolve(), 5000);
      });
    });
    return Promise.all(promises).then(() => {});
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

      // 获取元素的实际尺寸
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      const actualWidth = parseInt(computedStyle.width) || rect.width;
      const actualHeight = element.scrollHeight || rect.height;

      console.log('导出尺寸:', { actualWidth, actualHeight });

      const canvas = await html2canvas(element, {
        scale: 2, // 提高图片质量
        useCORS: true, // 允许跨域图片
        allowTaint: true,
        backgroundColor: '#ffffff', // 设置白色背景
        logging: true, // 开启日志用于调试
        width: actualWidth,
        height: actualHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        x: 0,
        y: 0,
        foreignObjectRendering: false, // 禁用外部对象渲染以提高兼容性
        imageTimeout: 15000, // 增加图片加载超时时间
        removeContainer: true, // 移除容器
        onclone: (clonedDoc) => {
          // 确保克隆文档中的样式正确应用
          const clonedElement = clonedDoc.getElementById(targetId);
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.position = 'static';
            clonedElement.style.overflow = 'visible';
            
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

      console.log('Canvas尺寸:', { width: canvas.width, height: canvas.height });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('生成的图片尺寸为0，请检查目标元素是否可见');
      }

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
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