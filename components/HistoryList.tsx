import React from 'react';
import { StoredMaterial } from '../types';
import { Card } from './common/Card';

interface HistoryListProps {
  materials: StoredMaterial[];
  onLoad: (material: StoredMaterial) => void;
  onDelete: (docId: string) => void;
  onBack: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ materials, onLoad, onDelete, onBack }) => {
  const formatDate = (timestamp: { seconds: number }) => {
    if (!timestamp?.seconds) return '날짜 정보 없음';
    return new Date(timestamp.seconds * 1000).toLocaleString('ko-KR');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">학습 자료 히스토리</h1>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-transform transform hover:-translate-y-0.5"
        >
          &larr; 돌아가기
        </button>
      </header>

      {materials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <h2 className="mt-4 text-2xl font-bold text-gray-800">저장된 자료가 없습니다.</h2>
            <p className="mt-2 text-gray-600">새로운 학습 자료를 생성하고 저장해보세요!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {materials.map((material) => (
            <Card key={material.docId} title={material.title}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <p className="text-sm text-gray-500">
                            생성일: {formatDate(material.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500">
                            지문 개수: {material.results.length}개
                        </p>
                    </div>
                    <div className="flex space-x-2 mt-4 sm:mt-0">
                        <button 
                            onClick={() => onLoad(material)}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            불러오기
                        </button>
                        <button 
                            onClick={() => onDelete(material.docId)}
                            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors"
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
