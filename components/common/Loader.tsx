
import React from 'react';

interface LoaderProps {
  progress: { current: number; total: number };
}

export const Loader: React.FC<LoaderProps> = ({ progress }) => {
  const percentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  
  const messages = [
    "영어 지문을 분석하고 있습니다...",
    "학년 수준에 맞는 어휘를 추출하는 중...",
    "워크시트를 디자인하고 있습니다...",
    "거의 다 됐습니다! 잠시만 기다려주세요..."
  ];
  
  const message = progress.current <= progress.total 
    ? `총 ${progress.total}개 중 ${progress.current}번째 지문 처리 중...`
    : "마무리 중입니다...";

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex flex-col justify-center items-center z-50 transition-opacity duration-300">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-5 h-5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-5 h-5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-5 h-5 rounded-full bg-purple-400 animate-bounce"></div>
      </div>
      <div className="mt-8 text-center w-full max-w-lg px-4">
        <p className="text-white text-2xl font-bold tracking-wide">{message}</p>
        <p className="text-gray-300 mt-2">AI가 열심히 학습 자료를 만들고 있습니다. 잠시만 기다려 주세요.</p>
        <div className="w-full bg-gray-600 rounded-full h-4 mt-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};