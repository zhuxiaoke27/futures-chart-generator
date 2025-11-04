import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import { CompanyOpinion, FuturesData } from './DataInputForm';
import { calculateFuturesData } from '../services/futuresDataCalculator';

interface VarietyData {
  id: string;
  futuresData: FuturesData;
  opinions: CompanyOpinion[];
}

interface MultiVarietyExcelUploaderProps {
  onDataImport: (varieties: VarietyData[]) => void;
  onError: (error: string) => void;
}

interface ParsedVarietyData {
  varietyName: string;
  opinions: CompanyOpinion[];
}

const UploaderContainer = styled.div`
  margin: 10px 0 15px 0;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #ffffff;
`;

const HiddenInput = styled.input`
  display: none;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const Title = styled.div`
  font-size: 13px;
  font-weight: bold;
  color: #333;
  flex: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'small' }>`
  padding: ${props => props.variant === 'small' ? '4px 10px' : '6px 12px'};
  border: none;
  border-radius: 4px;
  font-size: ${props => props.variant === 'small' ? '12px' : '13px'};
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  ${props => props.variant === 'primary' ? `
    background: #007bff;
    color: white;
    &:hover {
      background: #0056b3;
    }
  ` : props.variant === 'small' ? `
    background: #f8f9fa;
    color: #666;
    border: 1px solid #ddd;
    &:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }
  ` : `
    background: #6c757d;
    color: white;
    &:hover {
      background: #545b62;
    }
  `}

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' | 'warning' }>`
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;

  ${props => {
    switch (props.type) {
      case 'success':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'error':
        return 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      case 'info':
        return 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
      case 'warning':
        return 'background: #fff3cd; color: #856404; border: 1px solid #ffeeba;';
      default:
        return '';
    }
  }}
`;

const PreviewSection = styled.div`
  margin-top: 15px;
`;

const VarietyPreview = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
`;

const VarietyTitle = styled.div`
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #007bff;
`;

const PreviewTable = styled.table`
  width: 100%;
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
  varietyName: '品种名称',
  company: '期货公司',
  direction: '日内方向',
  support: '支撑位',
  resistance: '压力位',
  logic: '观点逻辑'
};

const MultiVarietyExcelUploader: React.FC<MultiVarietyExcelUploaderProps> = ({ onDataImport, onError }) => {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | 'warning' | null; message: string }>({ type: null, message: '' });
  const [previewData, setPreviewData] = useState<ParsedVarietyData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 生成Excel模板
  const downloadTemplate = () => {
    const templateData = [
      {
        [EXCEL_COLUMNS.varietyName]: '玻璃',
        [EXCEL_COLUMNS.company]: '平安期货',
        [EXCEL_COLUMNS.direction]: '偏多',
        [EXCEL_COLUMNS.support]: '665',
        [EXCEL_COLUMNS.resistance]: '690',
        [EXCEL_COLUMNS.logic]: '特朗普关税政策提振，黄金避险需求上升'
      },
      {
        [EXCEL_COLUMNS.varietyName]: '玻璃',
        [EXCEL_COLUMNS.company]: '紫金天风',
        [EXCEL_COLUMNS.direction]: '偏多',
        [EXCEL_COLUMNS.support]: '674-678',
        [EXCEL_COLUMNS.resistance]: '690-694',
        [EXCEL_COLUMNS.logic]: '基本面：黄金短期调整，黄金中长期多头逻辑未变'
      },
      {
        [EXCEL_COLUMNS.varietyName]: '螺纹钢',
        [EXCEL_COLUMNS.company]: '平安期货',
        [EXCEL_COLUMNS.direction]: '偏空',
        [EXCEL_COLUMNS.support]: '3400',
        [EXCEL_COLUMNS.resistance]: '3500',
        [EXCEL_COLUMNS.logic]: '基本面偏弱，供应压力较大'
      },
      {
        [EXCEL_COLUMNS.varietyName]: '沪铜',
        [EXCEL_COLUMNS.company]: '国泰君安',
        [EXCEL_COLUMNS.direction]: '震荡',
        [EXCEL_COLUMNS.support]: '68000',
        [EXCEL_COLUMNS.resistance]: '70000',
        [EXCEL_COLUMNS.logic]: '宏观预期改善，但需求恢复缓慢'
      },
      {
        [EXCEL_COLUMNS.varietyName]: '原油',
        [EXCEL_COLUMNS.company]: '中信期货',
        [EXCEL_COLUMNS.direction]: '偏多',
        [EXCEL_COLUMNS.support]: '490',
        [EXCEL_COLUMNS.resistance]: '510',
        [EXCEL_COLUMNS.logic]: 'OPEC+减产预期支撑油价'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '多品种观点数据');

    // 设置列宽
    const colWidths = [
      { wch: 12 }, // 品种名称
      { wch: 15 }, // 期货公司
      { wch: 10 }, // 日内方向
      { wch: 12 }, // 支撑位
      { wch: 12 }, // 压力位
      { wch: 35 }  // 观点逻辑
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, '多品种一键导入模板.xlsx');
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
          varietyName: headers.findIndex(h => h?.includes('品种') || h?.includes('合约')),
          company: headers.findIndex(h => h?.includes('期货公司') || h?.includes('公司')),
          direction: headers.findIndex(h => h?.includes('方向') || h?.includes('日内')),
          support: headers.findIndex(h => h?.includes('支撑')),
          resistance: headers.findIndex(h => h?.includes('压力') || h?.includes('阻力')),
          logic: headers.findIndex(h => h?.includes('逻辑') || h?.includes('观点'))
        };

        // 验证必要列是否存在
        const missingColumns: string[] = [];
        if (columnIndexes.varietyName === -1) missingColumns.push(EXCEL_COLUMNS.varietyName);
        if (columnIndexes.company === -1) missingColumns.push(EXCEL_COLUMNS.company);

        if (missingColumns.length > 0) {
          throw new Error(`缺少必要列：${missingColumns.join('、')}`);
        }

        // 解析数据并按品种分组
        const varietyMap = new Map<string, CompanyOpinion[]>();

        rows.forEach((row, index) => {
          // 跳过空行
          if (!row.some(cell => cell !== undefined && cell !== null && cell !== '')) {
            return;
          }

          const varietyName = String(row[columnIndexes.varietyName] || '').trim();

          // 验证必填字段
          if (!varietyName) {
            throw new Error(`第${index + 2}行：品种名称不能为空`);
          }

          const opinion: CompanyOpinion = {
            company: String(row[columnIndexes.company] || '').trim(),
            direction: String(row[columnIndexes.direction] || '').trim(),
            support: String(row[columnIndexes.support] || '').trim(),
            resistance: String(row[columnIndexes.resistance] || '').trim(),
            logic: String(row[columnIndexes.logic] || '').trim()
          };

          if (!opinion.company) {
            throw new Error(`第${index + 2}行：期货公司名称不能为空`);
          }

          // 添加到品种分组
          if (!varietyMap.has(varietyName)) {
            varietyMap.set(varietyName, []);
          }
          varietyMap.get(varietyName)!.push(opinion);
        });

        if (varietyMap.size === 0) {
          throw new Error('没有找到有效的数据行');
        }

        // 转换为数组格式
        const parsedData: ParsedVarietyData[] = Array.from(varietyMap.entries()).map(([varietyName, opinions]) => ({
          varietyName,
          opinions
        }));

        setPreviewData(parsedData);
        setStatus({
          type: 'success',
          message: `成功解析 ${parsedData.length} 个品种，共 ${parsedData.reduce((sum, v) => sum + v.opinions.length, 0)} 条观点数据`
        });

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

  // 点击选择文件
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // 确认导入 - 获取期货数据并组装完整数据
  const handleConfirmImport = async () => {
    if (previewData.length === 0) return;

    setIsProcessing(true);
    setStatus({ type: 'info', message: '正在获取期货数据，请稍候...' });

    try {
      const varieties: VarietyData[] = [];
      const errors: string[] = [];

      // 并行获取所有品种的期货数据
      const results = await Promise.allSettled(
        previewData.map(async (parsed) => {
          try {
            const futuresData = await calculateFuturesData(parsed.varietyName);
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              futuresData,
              opinions: parsed.opinions
            };
          } catch (error) {
            const errorMsg = `${parsed.varietyName}: ${error instanceof Error ? error.message : '获取数据失败'}`;
            errors.push(errorMsg);
            throw new Error(errorMsg);
          }
        })
      );

      // 收集成功的数据
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          varieties.push(result.value);
        }
      });

      if (varieties.length === 0) {
        throw new Error('所有品种数据获取失败：\n' + errors.join('\n'));
      }

      // 显示警告（如果有部分失败）
      if (errors.length > 0) {
        setStatus({
          type: 'warning',
          message: `部分品种导入失败：\n${errors.join('\n')}\n\n成功导入 ${varieties.length} 个品种`
        });
      } else {
        setStatus({ type: 'success', message: `成功导入 ${varieties.length} 个品种的完整数据！` });
      }

      onDataImport(varieties);

      // 延迟清除预览数据
      setTimeout(() => {
        setPreviewData([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '数据导入失败';
      setStatus({ type: 'error', message: errorMessage });
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
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
    <UploaderContainer>
      <TopRow>
        <Title>📊 多品种一键导入</Title>
        <ButtonGroup>
          <Button variant="small" onClick={downloadTemplate}>
            下载模板
          </Button>
          <Button variant="small" onClick={handleClick}>
            选择文件
          </Button>
          {previewData.length > 0 && (
            <>
              <Button
                variant="primary"
                onClick={handleConfirmImport}
                disabled={isProcessing}
              >
                {isProcessing ? '处理中...' : '确认导入'}
              </Button>
              <Button
                variant="small"
                onClick={handleClearPreview}
                disabled={isProcessing}
              >
                清除
              </Button>
            </>
          )}
        </ButtonGroup>
      </TopRow>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />

      {status.type && (
        <StatusMessage type={status.type}>
          {status.message}
        </StatusMessage>
      )}

      {previewData.length > 0 && (
        <PreviewSection>
          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '8px', color: '#666' }}>
            预览：{previewData.length} 个品种，共 {previewData.reduce((sum, v) => sum + v.opinions.length, 0)} 条观点
          </div>
          {previewData.map((variety, index) => (
            <VarietyPreview key={index}>
              <VarietyTitle>
                {variety.varietyName} （{variety.opinions.length} 条观点）
              </VarietyTitle>
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
                  {variety.opinions.slice(0, 3).map((opinion, opIndex) => (
                    <tr key={opIndex}>
                      <td>{opinion.company}</td>
                      <td>{opinion.direction}</td>
                      <td>{opinion.support}</td>
                      <td>{opinion.resistance}</td>
                      <td>{opinion.logic}</td>
                    </tr>
                  ))}
                  {variety.opinions.length > 3 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                        ... 还有 {variety.opinions.length - 3} 条观点
                      </td>
                    </tr>
                  )}
                </tbody>
              </PreviewTable>
            </VarietyPreview>
          ))}
        </PreviewSection>
      )}
    </UploaderContainer>
  );
};

export default MultiVarietyExcelUploader;
