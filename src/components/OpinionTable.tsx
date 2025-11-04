import React from 'react';
import styled from 'styled-components';
import { CompanyOpinion } from './DataInputForm';

interface OpinionTableProps {
  opinions: CompanyOpinion[];
}

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const HeaderRow = styled.tr`
  border-bottom: 2px solid #dee2e6;
`;

const HeaderCell = styled.th`
  padding: 12px 15px;
  text-align: center;
  font-weight: 600;
  color: #495057;
  border-right: 1px solid #dee2e6;
  
  &:last-child {
    border-right: none;
  }
  
  &:first-child {
    width: 80px;
  }
  
  &:nth-child(2) {
    width: 80px;
  }
  
  &:nth-child(3) {
    width: 60px;
  }
  
  &:nth-child(4) {
    width: 60px;
  }
  
  &:nth-child(5) {
    width: auto;
    text-align: left;
    min-width: 200px;
  }
`;

const TableBody = styled.tbody``;

const DataRow = styled.tr`
  border-bottom: 1px solid #dee2e6;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const DataCell = styled.td`
  padding: 12px 15px;
  border-right: 1px solid #dee2e6;
  vertical-align: top;
  
  &:last-child {
    border-right: none;
  }
  
  &:first-child {
    text-align: center;
    font-weight: 500;
    color: #495057;
  }
  
  &:nth-child(2) {
    text-align: center;
  }
  
  &:nth-child(3) {
    text-align: center;
    color: #28a745;
    font-weight: 500;
  }
  
  &:nth-child(4) {
    text-align: center;
    color: #dc3545;
    font-weight: 500;
  }
  
  &:nth-child(5) {
    line-height: 1.5;
    color: #495057;
  }
`;

const DirectionBadge = styled.span<{ direction: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  white-space: nowrap;
  min-width: 60px;
  text-align: center;
  background: ${props => {
    if (props.direction.includes('多')) return '#dc3545';
    if (props.direction.includes('空')) return '#28a745';
    return '#6c757d';
  }};
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
`;

const OpinionTable: React.FC<OpinionTableProps> = ({ opinions }) => {
  if (!opinions || opinions.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          暂无期货公司观点数据
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <HeaderRow>
            <HeaderCell>期货公司</HeaderCell>
            <HeaderCell>日内方向</HeaderCell>
            <HeaderCell>支撑</HeaderCell>
            <HeaderCell>压力</HeaderCell>
            <HeaderCell>观点逻辑</HeaderCell>
          </HeaderRow>
        </TableHeader>
        <TableBody>
          {opinions.map((opinion, index) => (
            <DataRow key={index}>
              <DataCell>{opinion.company}</DataCell>
              <DataCell>
                <DirectionBadge direction={opinion.direction}>
                  {opinion.direction}
                </DirectionBadge>
              </DataCell>
              <DataCell>{opinion.support}</DataCell>
              <DataCell>{opinion.resistance}</DataCell>
              <DataCell>{opinion.logic}</DataCell>
            </DataRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// 使用 React.memo 优化，仅在 opinions 数组变化时重新渲染
export default React.memo(OpinionTable);