
import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { ContentDisplay } from './components/ContentDisplay';
import { Loader } from './components/common/Loader';
import { generateAllContent } from './services/geminiService';
import { GeneratedContent, ContentType, PassageResult } from './types';

type AppStep = 'input' | 'generating' | 'display';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('input');
  const [results, setResults] = useState<PassageResult[] | null>(null);
  const [title, setTitle] = useState('');

  const handleGenerate = async (
    passages: { english: string; korean: string }[],
    title: string,
    school: string,
    grade: string
  ) => {
    setStep('generating');
    setTitle(title);
    try {
      const generatedResults = await generateAllContent(passages, grade);
      setResults(generatedResults);
      setStep('display');
    } catch (error) {
      console.error("Failed to generate content:", error);
      alert("콘텐츠 생성에 실패했습니다. 다시 시도해주세요.");
      setStep('input');
    }
  };

  const handleContentChange = (passageId: string, type: ContentType, data: GeneratedContent[ContentType]) => {
    setResults(prevResults => {
        if (!prevResults) return null;
        return prevResults.map(result => {
            if (result.passage.id === passageId) {
                return {
                    ...result,
                    content: { ...result.content, [type]: data }
                };
            }
            return result;
        });
    });
  };

  const handleBack = () => {
    setResults(null);
    setTitle('');
    setStep('input');
  }

  const renderStep = () => {
    switch (step) {
      case 'input':
        return <InputForm onGenerate={handleGenerate} />;
      case 'generating':
        return <Loader />;
      case 'display':
        return results ? <ContentDisplay results={results} title={title} onContentChange={handleContentChange} onBack={handleBack}/> : <p>No content generated.</p>;
      default:
        return <p>Error</p>;
    }
  };

  return <div className="bg-gray-50 min-h-screen">{renderStep()}</div>;
};

export default App;
