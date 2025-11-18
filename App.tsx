
import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { ContentDisplay } from './components/ContentDisplay';
import { Loader } from './components/common/Loader';
import { HistoryList } from './components/HistoryList';
import { generateAllContent } from './services/geminiService';
import { saveMaterial, getMaterials, deleteMaterial } from './services/firebaseService';
import { GeneratedContent, ContentType, PassageResult, StoredMaterial } from './types';

type AppStep = 'input' | 'generating' | 'display' | 'history';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('input');
  const [results, setResults] = useState<PassageResult[] | null>(null);
  const [title, setTitle] = useState('');
  const [storedMaterials, setStoredMaterials] = useState<StoredMaterial[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

  const handleSave = async () => {
    if (!results || !title) return;
    try {
      await saveMaterial(title, results);
      alert('성공적으로 저장되었습니다!');
    } catch (error) {
      console.error("Failed to save content:", error);
      alert("콘텐츠 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleShowHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const materials = await getMaterials();
      setStoredMaterials(materials);
      setStep('history');
    } catch (error) {
      console.error("Failed to fetch history:", error);
      alert("히스토리를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteMaterial = async (docId: string) => {
    if (!confirm('정말로 이 자료를 삭제하시겠습니까?')) return;
    try {
      await deleteMaterial(docId);
      setStoredMaterials(prev => prev.filter(m => m.docId !== docId));
      alert('삭제되었습니다.');
    } catch (error) {
      console.error("Failed to delete material:", error);
      alert("삭제에 실패했습니다.");
    }
  };
  
  const handleLoadMaterial = (material: StoredMaterial) => {
    setTitle(material.title);
    setResults(material.results);
    setStep('display');
  };

  const handleBackToInput = () => {
    setResults(null);
    setTitle('');
    setStep('input');
  }

  const renderStep = () => {
    switch (step) {
      case 'input':
        return <InputForm onGenerate={handleGenerate} onShowHistory={handleShowHistory} isHistoryLoading={isLoadingHistory} />;
      case 'generating':
        return <Loader />;
      case 'display':
        return results ? <ContentDisplay results={results} title={title} onContentChange={handleContentChange} onBack={handleBackToInput} onSave={handleSave}/> : <p>No content generated.</p>;
      case 'history':
        return <HistoryList materials={storedMaterials} onLoad={handleLoadMaterial} onDelete={handleDeleteMaterial} onBack={() => setStep('input')} />;
      default:
        return <p>Error</p>;
    }
  };

  return <div className="bg-gray-50 min-h-screen">{renderStep()}</div>;
};

export default App;
