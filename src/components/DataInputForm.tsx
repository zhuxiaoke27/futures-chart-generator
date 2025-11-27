import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import ExcelUploader from './ExcelUploader';
import { calculateFuturesData } from '../services/futuresDataCalculator';

export type BackgroundTemplate = '暗' | '冷' | '暖';

interface FuturesData {
  contractName: string;      // 用户输入的合约名称
  contractCode: string;       // 从API获取
  currentPrice: number;       // 从K线数据计算
  changePercent: number;      // 从K线数据计算
  changeAmount: number;       // 从K线数据计算
  date: string;              // 当天日期
  backgroundTemplate: BackgroundTemplate; // 背景模板选择
}

interface CompanyOpinion {
  company: string;
  direction: string;
  support: string;
  resistance: string;
  logic: string;
}

interface DataInputFormProps {
  futuresData: FuturesData;
  opinions: CompanyOpinion[];
  onDataChange: (data: FuturesData, opinions: CompanyOpinion[]) => void;
}

const FormContainer = styled.div`
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const FormSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
  font-size: 16px;
`;

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
`;

const InputField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 60px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const OpinionRow = styled.div`
  display: grid;
  grid-template-columns: 120px 80px 100px 100px 1fr 80px;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background: white;
  border-radius: 4px;
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

const TemplateSelector = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
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

const DataInputForm: React.FC<DataInputFormProps> = ({ futuresData, opinions, onDataChange }) => {
  const [uploadError, setUploadError] = useState<string>('');
  const [justImported, setJustImported] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string>('');

  // 手动输入区域的ref，用于滚动定位
  const manualInputRef = useRef<HTMLDivElement>(null);

  // 用于防抖的timer
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 当导入数据后，自动滚动到手动输入区域
  useEffect(() => {
    if (justImported && manualInputRef.current) {
      manualInputRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      // 重置标记
      setTimeout(() => setJustImported(false), 1000);
    }
  }, [justImported]);

  // 自动获取期货数据
  const fetchFuturesData = useCallback(async (contractName: string) => {
    // 清除之前的timer
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }

    // 如果合约名称为空，不执行
    if (!contractName || contractName.trim() === '') {
      return;
    }

    // 防抖：延迟1秒后再执行
    fetchTimerRef.current = setTimeout(async () => {
      setIsLoadingData(true);
      setDataError('');

      try {
        console.log('开始获取期货数据:', contractName);
        const calculatedData = await calculateFuturesData(contractName);

        // 更新期货数据，保留背景模板选择
        onDataChange({
          ...calculatedData,
          backgroundTemplate: futuresData.backgroundTemplate
        }, opinions);
        console.log('期货数据获取成功');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '获取数据失败';
        setDataError(errorMsg);
        console.error('获取期货数据失败:', errorMsg);
      } finally {
        setIsLoadingData(false);
      }
    }, 1000);
  }, [opinions, onDataChange]);

  // 处理合约名称变化
  const handleContractNameChange = useCallback((value: string) => {
    // 立即更新合约名称（其他字段保持不变）
    const updatedData = { ...futuresData, contractName: value };
    onDataChange(updatedData, opinions);

    // 触发自动获取数据
    fetchFuturesData(value);
  }, [futuresData, opinions, onDataChange, fetchFuturesData]);

  // 处理观点变化
  const handleOpinionChange = useCallback((index: number, field: keyof CompanyOpinion, value: string) => {
    const updatedOpinions = [...opinions];
    updatedOpinions[index] = { ...updatedOpinions[index], [field]: value };
    onDataChange(futuresData, updatedOpinions);
  }, [futuresData, opinions, onDataChange]);

  const addOpinion = useCallback(() => {
    const newOpinion: CompanyOpinion = {
      company: '',
      direction: '',
      support: '',
      resistance: '',
      logic: ''
    };
    const updatedOpinions = [...opinions, newOpinion];
    onDataChange(futuresData, updatedOpinions);
  }, [futuresData, opinions, onDataChange]);

  const removeOpinion = useCallback((index: number) => {
    const updatedOpinions = opinions.filter((_, i) => i !== index);
    onDataChange(futuresData, updatedOpinions);
  }, [futuresData, opinions, onDataChange]);

  // 处理背景模板切换
  const handleTemplateChange = useCallback((template: BackgroundTemplate) => {
    const updatedData = { ...futuresData, backgroundTemplate: template };
    onDataChange(updatedData, opinions);
  }, [futuresData, opinions, onDataChange]);

  // 处理Excel批量导入
  const handleExcelImport = useCallback((importedOpinions: CompanyOpinion[]) => {
    onDataChange(futuresData, importedOpinions);
    setUploadError('');
    // 标记刚刚导入，触发滚动效果
    setJustImported(true);
  }, [futuresData, onDataChange]);

  // 处理上传错误
  const handleUploadError = useCallback((error: string) => {
    setUploadError(error);
  }, []);

  return (
    <FormContainer>
      <FormSection>
        <SectionTitle>期货基本信息</SectionTitle>

        {/* 用户输入区域 */}
        <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px' }}>
          <InputField>
            <Label style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
              合约名称
              {isLoadingData && <span style={{ marginLeft: '10px', color: '#007bff', fontSize: '14px' }}>⏳ 正在获取数据...</span>}
            </Label>
            <Input
              type="text"
              placeholder="请输入合约名称，例如：玻璃、螺纹钢、棉花"
              value={futuresData.contractName}
              onChange={(e) => handleContractNameChange(e.target.value)}
              style={{ fontSize: '16px', padding: '12px' }}
            />
            {dataError && (
              <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '8px' }}>
                ❌ {dataError}
              </div>
            )}
          </InputField>
        </div>

        {/* 自动获取的数据展示区域 */}
        <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: 'bold' }}>
            📊 自动获取的数据：
          </div>
          <InputGroup>
            <InputField>
              <Label>合约代码</Label>
              <Input
                type="text"
                value={futuresData.contractCode}
                disabled
                style={{ background: '#e9ecef', cursor: 'not-allowed' }}
              />
            </InputField>
            <InputField>
              <Label>当前价格</Label>
              <Input
                type="text"
                value={futuresData.currentPrice || '-'}
                disabled
                style={{ background: '#e9ecef', cursor: 'not-allowed' }}
              />
            </InputField>
            <InputField>
              <Label>涨跌幅(%)</Label>
              <Input
                type="text"
                value={futuresData.changePercent || '-'}
                disabled
                style={{
                  background: '#e9ecef',
                  cursor: 'not-allowed',
                  color: futuresData.changePercent >= 0 ? '#ff4444' : '#00aa00',
                  fontWeight: 'bold'
                }}
              />
            </InputField>
            <InputField>
              <Label>涨跌额</Label>
              <Input
                type="text"
                value={futuresData.changeAmount || '-'}
                disabled
                style={{
                  background: '#e9ecef',
                  cursor: 'not-allowed',
                  color: futuresData.changeAmount >= 0 ? '#ff4444' : '#00aa00',
                  fontWeight: 'bold'
                }}
              />
            </InputField>
            <InputField>
              <Label>日期</Label>
              <Input
                type="text"
                value={futuresData.date}
                disabled
                style={{ background: '#e9ecef', cursor: 'not-allowed' }}
              />
            </InputField>
          </InputGroup>
        </div>
      </FormSection>

      <FormSection>
        <SectionTitle>背景模板选择</SectionTitle>
        <TemplateSelector>
          <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>选择背景配色：</span>
          <TemplateOption selected={futuresData.backgroundTemplate === '暗'}>
            <input
              type="radio"
              name="backgroundTemplate"
              value="暗"
              checked={futuresData.backgroundTemplate === '暗'}
              onChange={() => handleTemplateChange('暗')}
            />
            <span>暗色系</span>
          </TemplateOption>
          <TemplateOption selected={futuresData.backgroundTemplate === '冷'}>
            <input
              type="radio"
              name="backgroundTemplate"
              value="冷"
              checked={futuresData.backgroundTemplate === '冷'}
              onChange={() => handleTemplateChange('冷')}
            />
            <span>冷色系</span>
          </TemplateOption>
          <TemplateOption selected={futuresData.backgroundTemplate === '暖'}>
            <input
              type="radio"
              name="backgroundTemplate"
              value="暖"
              checked={futuresData.backgroundTemplate === '暖'}
              onChange={() => handleTemplateChange('暖')}
            />
            <span>暖色系</span>
          </TemplateOption>
        </TemplateSelector>
      </FormSection>

      <FormSection>
        <SectionTitle>期货公司观点</SectionTitle>
        
        {/* Excel批量上传组件 */}
        <ExcelUploader
          onDataImport={handleExcelImport}
          onError={handleUploadError}
        />
        {uploadError && (
          <div style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
            {uploadError}
          </div>
        )}
        
        {/* 手动输入区域 */}
        <div ref={manualInputRef} style={{ marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', fontWeight: 'bold' }}>
            手动输入：
            {justImported && (
              <span style={{ color: '#28a745', fontSize: '12px', marginLeft: '10px' }}>
                ✓ 已导入，可以编辑
              </span>
            )}
          </h4>
          {opinions.map((opinion, index) => (
            <OpinionRow key={index}>
              <Input
                type="text"
                placeholder="期货公司"
                value={opinion.company}
                onChange={(e) => handleOpinionChange(index, 'company', e.target.value)}
              />
              <Input
                type="text"
                placeholder="方向"
                value={opinion.direction}
                onChange={(e) => handleOpinionChange(index, 'direction', e.target.value)}
              />
              <Input
                type="text"
                placeholder="支撑"
                value={opinion.support}
                onChange={(e) => handleOpinionChange(index, 'support', e.target.value)}
              />
              <Input
                type="text"
                placeholder="压力"
                value={opinion.resistance}
                onChange={(e) => handleOpinionChange(index, 'resistance', e.target.value)}
              />
              <TextArea
                placeholder="观点逻辑"
                value={opinion.logic}
                onChange={(e) => handleOpinionChange(index, 'logic', e.target.value)}
              />
              <RemoveButton onClick={() => removeOpinion(index)}>删除</RemoveButton>
            </OpinionRow>
          ))}
          <Button onClick={addOpinion}>添加观点</Button>
        </div>
      </FormSection>
    </FormContainer>
  );
};

export default DataInputForm;
export type { FuturesData, CompanyOpinion };