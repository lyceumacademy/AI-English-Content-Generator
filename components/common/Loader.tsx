
import React, { useState, useEffect } from 'react';

const messages = [
  "영어 지문을 분석하고 있습니다...",
  "학년 수준에 맞는 어휘를 추출하는 중...",
  "어휘 확장을 위한 데이터를 생성하고 있습니다...",
  "한줄 해석 자료를 만드는 중...",
  "학생들을 위한 워크시트를 디자인하고 있습니다...",
  "거의 다 됐습니다! 잠시만 기다려주세요..."
];

export const Loader: React.FC = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex flex-col justify-center items-center z-50 transition-opacity duration-300">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-5 h-5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-5 h-5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-5 h-5 rounded-full bg-purple-400 animate-bounce"></div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-white text-2xl font-bold tracking-wide">{messages[currentMessageIndex]}</p>
        <p className="text-gray-300 mt-2">AI가 열심히 학습 자료를 만들고 있습니다.</p>
      </div>
    </div>
  );
};