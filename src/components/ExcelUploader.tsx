import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import { CompanyOpinion } from './DataInputForm';

interface ExcelUploaderProps {
  onDataImport: (opinions: CompanyOpinion[]) => void;
  onError: (error: string) => void;
}

const UploaderContainer = styled.div`
  margin: 15px 0;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  background: #fafafa;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #007bff;
    background: #f0f8ff;
  }
  
  &.dragover {
    border-color: #007bff;
    background: #e6f3ff;
  }
`;

const UploadArea = styled.div`
  text-align: center;
  padding: 20px;
  cursor: pointer;
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: #007bff;
  margin-bottom: 10px;
`;

const UploadText = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 5px;
`;

const UploadHint = styled.div`
  font-size: 12px;
  color: #999;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #007bff;
    color: white;
    &:hover {
      background: #0056b3;
    }
  ` : `
    background: #6c757d;
    color: white;
    &:hover {
      background: #545b62;
    }
  `}
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'error':
        return 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      case 'info':
        return 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
      default:
        return '';
    }
  }}
`;

const PreviewTable = styled.table`
  width: 100%;
  margin-top: 15px;
  border-collapse: collapse;
  font-size: 12px;
  
  th, td {
    border: 1px solid #ddd;
    padding: 6px 8px;
    text-align: left;
  }
  
  th {
    background: #f8f9fa;
    font-weight: bold;
  }
  
  tr:nth-child(even) {
    background: #f9f9f9;
  }
`;

// Excel模板列定义
const EXCEL_COLUMNS = {
  company: '期货公司',
  direction: '日内方向',
  support: '支撑位',
  resistance: '压力位',
  logic: '观点逻辑'
};

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onDataImport, onError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });
  const [previewData, setPreviewData] = useState<CompanyOpinion[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 生成Excel模板
  const downloadTemplate = () => {
    const templateData = [
      {
        [EXCEL_COLUMNS.company]: '示例期货公司',
        [EXCEL_COLUMNS.direction]: '偏多',
        [EXCEL_COLUMNS.support]: '3800',
        [EXCEL_COLUMNS.resistance]: '4000',
        [EXCEL_COLUMNS.logic]: '技术面支撑较强，基本面利好因素增多'
      },
      {
        [EXCEL_COLUMNS.company]: '另一期货公司',
        [EXCEL_COLUMNS.direction]: '震荡',
        [EXCEL_COLUMNS.support]: '3750',
        [EXCEL_COLUMNS.resistance]: '3950',
        [EXCEL_COLUMNS.logic]: '短期内预计维持区间震荡'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '期货公司观点');
    
    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 期货公司
      { wch: 10 }, // 日内方向
      { wch: 10 }, // 支撑位
      { wch: 10 }, // 压力位
      { wch: 30 }  // 观点逻辑
    ];
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, '期货公司观点模板.xlsx');
    setStatus({ type: 'success', message: '模板下载成功！' });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  // 解析Excel文件
  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('Excel文件至少需要包含表头和一行数据');
        }
        
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];
        
        // 查找列索引
        const columnIndexes = {
          company: headers.findIndex(h => h?.includes('期货公司') || h?.includes('公司')),
          direction: headers.findIndex(h => h?.includes('方向') || h?.includes('日内')),
          support: headers.findIndex(h => h?.includes('支撑')),
          resistance: headers.findIndex(h => h?.includes('压力') || h?.includes('阻力')),
          logic: headers.findIndex(h => h?.includes('逻辑') || h?.includes('观点'))
        };
        
        // 验证必要列是否存在
        const missingColumns = Object.entries(columnIndexes)
          .filter(([_, index]) => index === -1)
          .map(([key, _]) => EXCEL_COLUMNS[key as keyof typeof EXCEL_COLUMNS]);
        
        if (missingColumns.length > 0) {
          throw new Error(`缺少必要列：${missingColumns.join('、')}`);
        }
        
        // 解析数据
        const opinions: CompanyOpinion[] = rows
          .filter(row => row.some(cell => cell !== undefined && cell !== null && cell !== ''))
          .map((row, index) => {
            const opinion: CompanyOpinion = {
              company: String(row[columnIndexes.company] || '').trim(),
              direction: String(row[columnIndexes.direction] || '').trim(),
              support: String(row[columnIndexes.support] || '').trim(),
              resistance: String(row[columnIndexes.resistance] || '').trim(),
              logic: String(row[columnIndexes.logic] || '').trim()
            };
            
            // 验证必填字段
            if (!opinion.company) {
              throw new Error(`第${index + 2}行：期货公司名称不能为空`);
            }
            
            return opinion;
          });
        
        if (opinions.length === 0) {
          throw new Error('没有找到有效的数据行');
        }
        
        setPreviewData(opinions);
        setStatus({ type: 'success', message: `成功解析 ${opinions.length} 条观点数据` });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '文件解析失败';
        setStatus({ type: 'error', message: errorMessage });
        onError(errorMessage);
        setPreviewData([]);
      }
    };
    
    reader.onerror = () => {
      const errorMessage = '文件读取失败';
      setStatus({ type: 'error', message: errorMessage });
      onError(errorMessage);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    if (!file) return;
    
    // 验证文件类型
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      const errorMessage = '请选择有效的Excel文件（.xlsx或.xls）';
      setStatus({ type: 'error', message: errorMessage });
      onError(errorMessage);
      return;
    }
    
    setStatus({ type: 'info', message: '正在解析文件...' });
    parseExcelFile(file);
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // 点击上传
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 确认导入
  const handleConfirmImport = () => {
    if (previewData.length > 0) {
      onDataImport(previewData);
      setStatus({ type: 'success', message: `成功导入 ${previewData.length} 条数据！数据已更新到下方手动输入区域，可以继续编辑` });
      // 立即清除预览数据，让用户看到手动输入区域
      setPreviewData([]);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // 延迟清除状态消息
      setTimeout(() => setStatus({ type: null, message: '' }), 5000);
    }
  };

  // 清除预览
  const handleClearPreview = () => {
    setPreviewData([]);
    setStatus({ type: null, message: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <UploaderContainer 
      className={isDragOver ? 'dragover' : ''}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <UploadArea onClick={handleClick}>
        <UploadIcon>📊</UploadIcon>
        <UploadText>点击或拖拽Excel文件到此处</UploadText>
        <UploadHint>支持 .xlsx 和 .xls 格式</UploadHint>
      </UploadArea>
      
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
      
      <ButtonGroup>
        <Button variant="secondary" onClick={downloadTemplate}>
          📥 下载模板
        </Button>
        {previewData.length > 0 && (
          <>
            <Button variant="primary" onClick={handleConfirmImport}>
              ✅ 确认导入
            </Button>
            <Button variant="secondary" onClick={handleClearPreview}>
              🗑️ 清除
            </Button>
          </>
        )}
      </ButtonGroup>
      
      {status.type && (
        <StatusMessage type={status.type}>
          {status.message}
        </StatusMessage>
      )}
      
      {previewData.length > 0 && (
        <>
          <div style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '14px' }}>
            预览数据（共 {previewData.length} 条）：
          </div>
          <PreviewTable>
            <thead>
              <tr>
                <th>期货公司</th>
                <th>日内方向</th>
                <th>支撑位</th>
                <th>压力位</th>
                <th>观点逻辑</th>
              </tr>
            </thead>
            <tbody>
              {previewData.slice(0, 5).map((opinion, index) => (
                <tr key={index}>
                  <td>{opinion.company}</td>
                  <td>{opinion.direction}</td>
                  <td>{opinion.support}</td>
                  <td>{opinion.resistance}</td>
                  <td>{opinion.logic}</td>
                </tr>
              ))}
              {previewData.length > 5 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                    ... 还有 {previewData.length - 5} 条数据
                  </td>
                </tr>
              )}
            </tbody>
          </PreviewTable>
        </>
      )}
    </UploaderContainer>
  );
};

export default ExcelUploader;