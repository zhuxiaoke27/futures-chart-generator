import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import ExcelUploader from './ExcelUploader';

interface FuturesData {
  contractName: string;
  contractCode: string;
  currentPrice: number;
  changePercent: number;
  changeAmount: number;
  date: string;
  mainPrice: number;
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

const DataInputForm: React.FC<DataInputFormProps> = ({ futuresData, opinions, onDataChange }) => {
  const [uploadError, setUploadError] = useState<string>('');
  const [justImported, setJustImported] = useState<boolean>(false);

  // 手动输入区域的ref，用于滚动定位
  const manualInputRef = useRef<HTMLDivElement>(null);

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

  // 使用 useCallback 缓存事件处理函数，避免子组件不必要的重新渲染
  const handleFuturesDataChange = useCallback((field: keyof FuturesData, value: string | number) => {
    const updatedData = { ...futuresData, [field]: value };
    onDataChange(updatedData, opinions);
  }, [futuresData, opinions, onDataChange]);

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
        <InputGroup>
          <InputField>
            <Label>合约名称</Label>
            <Input
              type="text"
              value={futuresData.contractName}
              onChange={(e) => handleFuturesDataChange('contractName', e.target.value)}
            />
          </InputField>
          <InputField>
            <Label>合约代码</Label>
            <Input
              type="text"
              value={futuresData.contractCode}
              onChange={(e) => handleFuturesDataChange('contractCode', e.target.value)}
            />
          </InputField>
          <InputField>
            <Label>当前价格</Label>
            <Input
              type="number"
              step="0.01"
              value={futuresData.currentPrice}
              onChange={(e) => handleFuturesDataChange('currentPrice', parseFloat(e.target.value))}
            />
          </InputField>
          <InputField>
            <Label>涨跌幅(%)</Label>
            <Input
              type="number"
              step="0.01"
              value={futuresData.changePercent}
              onChange={(e) => handleFuturesDataChange('changePercent', parseFloat(e.target.value))}
            />
          </InputField>
          <InputField>
            <Label>涨跌额</Label>
            <Input
              type="number"
              step="0.01"
              value={futuresData.changeAmount}
              onChange={(e) => handleFuturesDataChange('changeAmount', parseFloat(e.target.value))}
            />
          </InputField>
          <InputField>
            <Label>日期</Label>
            <Input
              type="text"
              value={futuresData.date}
              onChange={(e) => handleFuturesDataChange('date', e.target.value)}
            />
          </InputField>

          <InputField>
            <Label>主力最新价</Label>
            <Input
              type="number"
              step="0.01"
              value={futuresData.mainPrice}
              onChange={(e) => handleFuturesDataChange('mainPrice', parseFloat(e.target.value))}
            />
          </InputField>
        </InputGroup>
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