
import React, { useState, useRef, useEffect } from 'react';
import { GeneratedContent, ContentType, MultipleChoiceQuestion, SentenceScrambleItem, ParagraphScrambleItem, PassageResult } from '../types';
import { Card } from './common/Card';

declare const html2canvas: any;
declare const jspdf: any;

// Sub-component for editable items
const EditableItem: React.FC<{
    children: React.ReactNode;
    onDelete: () => void;
}> = ({ children, onDelete }) => {
    return (
        <div className="group relative flex items-start justify-between p-4 border-b last:border-b-0 hover:bg-purple-50/50 transition-colors duration-200">
            <div className="flex-1 pr-10">{children}</div>
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button className="text-gray-400 hover:text-indigo-600" aria-label="Edit item">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                </button>
                <button
                    onClick={onDelete}
                    className="text-gray-400 hover:text-red-600"
                    aria-label="Delete item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// Interactive Components for Worksheets

const InteractiveMCQ: React.FC<{ item: MultipleChoiceQuestion }> = ({ item }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const parts = item.sentence.split(/(\[.*?\])/);
    const optionsMatch = item.sentence.match(/\[(.*?)\/(.*?)\]/);
    if (!optionsMatch) return <p>{item.sentence}</p>;

    const [option1, option2] = [optionsMatch[1], optionsMatch[2]];

    const handleSelect = (option: string) => {
        if (selected) return;
        setSelected(option);
        setIsCorrect(option.trim().toLowerCase() === item.answer.trim().toLowerCase());
    };

    return (
        <div className="leading-relaxed">
            {parts.map((part, i) => {
                if (part.startsWith('[')) {
                    return (
                        <span key={i} className="inline-flex items-center gap-2 bg-gray-100 p-1 rounded-md mx-1">
                            <button
                                onClick={() => handleSelect(option1)}
                                disabled={selected !== null}
                                className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                                    selected === null ? 'bg-white hover:bg-purple-100' :
                                    selected === option1 && isCorrect ? 'bg-green-200 text-green-800 ring-2 ring-green-400' :
                                    selected === option1 && !isCorrect ? 'bg-red-200 text-red-800 ring-2 ring-red-400' : 'bg-white text-gray-500'
                                }`}
                            >{option1}</button>
                            <span className="text-gray-400">/</span>
                             <button
                                onClick={() => handleSelect(option2)}
                                disabled={selected !== null}
                                className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                                    selected === null ? 'bg-white hover:bg-purple-100' :
                                    selected === option2 && isCorrect ? 'bg-green-200 text-green-800 ring-2 ring-green-400' :
                                    selected === option2 && !isCorrect ? 'bg-red-200 text-red-800 ring-2 ring-red-400' : 'bg-white text-gray-500'
                                }`}
                            >{option2}</button>
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
            {isCorrect === false && <span className="ml-4 text-sm text-red-600 font-medium">(정답: {item.answer})</span>}
        </div>
    );
};

const InteractiveSentenceScramble: React.FC<{ item: SentenceScrambleItem }> = ({ item }) => {
    const [userInput, setUserInput] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);

    const checkAnswer = () => {
        const format = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim();
        setIsCorrect(format(userInput) === format(item.correct));
    };

    return (
        <div className="space-y-3">
            <div>
                <p className="font-semibold text-gray-800">다음 단어들을 배열하여 문장을 완성하세요.</p>
                <p className="bg-gray-100 p-3 rounded-md font-mono text-sm tracking-wider">{item.scrambled.join(' / ')}</p>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => {
                        setUserInput(e.target.value);
                        setIsCorrect(null);
                    }}
                    placeholder="여기에 문장을 입력하세요..."
                    className={`flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 transition-all ${
                        isCorrect === true ? 'border-green-500 ring-green-200' : 
                        isCorrect === false ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-purple-300'
                    }`}
                />
                <button onClick={checkAnswer} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">확인</button>
            </div>
            {isCorrect === false && (
                <p className="text-sm text-red-500">
                    아쉽네요. 다시 시도해보세요. 
                    <button onClick={() => setShowAnswer(true)} className="ml-2 text-indigo-600 hover:underline font-bold">정답 보기</button>
                </p>
            )}
            {isCorrect === true && <p className="text-sm text-green-600 font-bold">정답입니다!</p>}
            {showAnswer && <p className="text-sm text-green-600 bg-green-50 p-2 rounded-md mt-2">정답: {item.correct}</p>}
        </div>
    );
};

const InteractiveParagraphScramble: React.FC<{ worksheet: ParagraphScrambleItem }> = ({ worksheet }) => {
    const [paragraphs, setParagraphs] = useState(worksheet.scrambledParagraphs);
    const [feedback, setFeedback] = useState<string | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    useEffect(() => {
        setParagraphs(worksheet.scrambledParagraphs);
        setFeedback(null);
    }, [worksheet]);

    const handleDragStart = (_: React.DragEvent<HTMLDivElement>, position: number) => {
        dragItem.current = position;
    };

    const handleDragEnter = (_: React.DragEvent<HTMLDivElement>, position: number) => {
        dragOverItem.current = position;
    };

    const handleDrop = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newParagraphs = [...paragraphs];
        const dragItemContent = newParagraphs[dragItem.current];
        newParagraphs.splice(dragItem.current, 1);
        newParagraphs.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        setParagraphs(newParagraphs);
        setFeedback(null);
    };

    const checkOrder = () => {
        const currentOrderMap = paragraphs.map(p => worksheet.scrambledParagraphs.indexOf(p));
        const isCorrect = JSON.stringify(currentOrderMap) === JSON.stringify(worksheet.correctOrder);
        setFeedback(isCorrect ? "정답입니다! 순서가 완벽해요." : "아쉽네요. 순서가 맞지 않아요.");
    };

    return (
        <div className="space-y-4 p-4">
            <p className="font-bold text-lg text-gray-800 text-center mb-4">아래 문단들을 올바른 순서로 배열하세요. (드래그 앤 드롭)</p>
            <div className="space-y-3">
                {paragraphs.map((p, index) => (
                    <div
                        key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border p-4 rounded-lg bg-gray-50 flex items-start gap-3 cursor-grab active:cursor-grabbing active:bg-purple-100 transition-all duration-200 shadow-sm"
                    >
                        <span className="font-bold text-lg text-purple-600 select-none">({String.fromCharCode(65 + index)})</span>
                        <p className="select-none">{p}</p>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-center gap-4 pt-4">
                <button onClick={checkOrder} className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                    순서 확인하기
                </button>
            </div>
            {feedback && (
                <p className={`text-center font-bold text-lg p-3 rounded-md ${feedback.includes('정답') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {feedback}
                </p>
            )}
             <details className="text-center cursor-pointer text-gray-600 hover:text-indigo-600">
                <summary className="font-semibold">정답 순서 보기</summary>
                <p className="bg-gray-100 text-gray-800 p-3 rounded-md font-mono text-lg font-semibold tracking-widest text-center mt-2">
                    {worksheet.correctOrder.map(i => String.fromCharCode(65 + worksheet.scrambledParagraphs.findIndex(p => worksheet.scrambledParagraphs.indexOf(p) === i))).join(' → ')}
                </p>
            </details>
        </div>
    );
};

// Printable Content component for PDF generation
const PrintableContent: React.FC<{ results: PassageResult[], title: string }> = ({ results, title }) => {
    return (
        <div id="printable-content" className="p-8 bg-white" style={{ width: '1200px' }}>
             <h1 className="text-4xl font-bold mb-8 text-center">{title}</h1>
             {results.map((result, index) => {
                const { content } = result;
                return (
                    <div key={result.passage.id} className="mb-12 break-after-page">
                        <h2 className="text-3xl font-bold mb-6 text-center bg-gray-100 p-4 rounded-lg">--- 지문 #{index + 1} ---</h2>
                        
                        <section className="mb-8 break-inside-avoid">
                            <h3 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">글의 분석</h3>
                            <div className="space-y-3">
                                <p><span className="font-semibold">한글 주제:</span> {content.koreanTopic}</p>
                                <p><span className="font-semibold">영어 제목:</span> {content.englishTitle}</p>
                                <p><span className="font-semibold">내용 요약 (한글):</span> {content.koreanSummary}</p>
                                <div>
                                    <span className="font-semibold">글의 흐름:</span>
                                    <ul className="list-decimal list-inside ml-4">
                                        {content.textFlow.map((flow, idx) => <li key={idx}>{flow}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </section>
                        
                        <section className="mb-8 break-inside-avoid">
                            <h3 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">어휘 정리</h3>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meaning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {content.vocabulary.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold">{item.word}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.meaning}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>

                        <section className="mb-8 break-inside-avoid">
                            <h3 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">어휘 확장</h3>
                            {content.expandedVocabulary.map(item => (
                                <div key={item.id} className="mb-4">
                                    <p className="font-bold text-lg">{item.word}</p>
                                    <ul className="list-disc list-inside ml-4">
                                        <li><span className="font-semibold">Korean Meaning:</span> {item.meaning}</li>
                                        <li><span className="font-semibold">English Meaning:</span> {item.definition}</li>
                                        <li><span className="font-semibold">Synonym:</span> {item.synonym}</li>
                                        <li><span className="font-semibold">Antonym:</span> {item.antonym}</li>
                                    </ul>
                                </div>
                            ))}
                        </section>

                        <section className="mb-8 break-inside-avoid">
                            <h3 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">한줄 해석</h3>
                            {content.translatedSentences.map(item => (
                                <div key={item.id} className="mb-3">
                                    <p>{item.korean}</p>
                                    <p className="text-gray-600">{item.english}</p>
                                </div>
                            ))}
                        </section>
                        
                        <h3 className="text-2xl font-bold mb-4 border-b-2 border-gray-300 pb-2">워크시트</h3>

                        <section className="mb-8 break-inside-avoid">
                            <h4 className="text-xl font-semibold mb-3">어휘 및 어법 선택</h4>
                            {content.multipleChoiceWorksheet.map((item, idx) => (
                                <p key={item.id} className="mb-2">{idx + 1}. {item.sentence} (정답: {item.answer})</p>
                            ))}
                        </section>

                        <section className="mb-8 break-inside-avoid">
                            <h4 className="text-xl font-semibold mb-3">문장 배열</h4>
                            {content.sentenceScrambleWorksheet.map((item, idx) => (
                                <div key={item.id} className="mb-3">
                                    <p>{idx + 1}. {item.scrambled.join(' / ')}</p>
                                    <p className="text-gray-600">정답: {item.correct}</p>
                                </div>
                            ))}
                        </section>

                        <section className="break-inside-avoid">
                            <h4 className="text-xl font-semibold mb-3">문단 배열</h4>
                            <p className="mb-2 font-semibold">정답 순서: {content.paragraphScrambleWorksheet.correctOrder.map(i => String.fromCharCode(65 + i)).join(' → ')}</p>
                            {content.paragraphScrambleWorksheet.scrambledParagraphs.map((p, idx) => (
                                <div key={idx} className="mb-2">
                                    <p><span className="font-semibold">({String.fromCharCode(65 + idx)})</span> {p}</p>
                                </div>
                            ))}
                        </section>
                    </div>
                );
             })}
        </div>
    );
};


// Main Display Component
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-3 font-semibold text-lg rounded-t-lg transition-all duration-300 transform focus:outline-none ${
                active 
                ? 'bg-white text-purple-700 shadow-md scale-105' 
                : 'bg-transparent text-gray-500 hover:text-purple-600'
            }`}
        >
            {children}
        </button>
    );
}

const PassageTabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className={`px-5 py-2 text-base font-semibold rounded-full transition-all duration-200 focus:outline-none ${
                active 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-purple-100 hover:text-purple-700'
            }`}
        >
            {children}
        </button>
    );
}

interface ContentDisplayProps {
  results: PassageResult[];
  title: string;
  onContentChange: (passageId: string, type: ContentType, data: GeneratedContent[ContentType]) => void;
  onBack: () => void;
}

export const ContentDisplay: React.FC<ContentDisplayProps> = ({ results, title, onContentChange, onBack }) => {
    const [activePassageIndex, setActivePassageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('vocabulary');
    const [isDownloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement>(null);

    const activeResult = results[activePassageIndex];
    const content = activeResult.content;
    const passageId = activeResult.passage.id;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
                setDownloadMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDelete = <T extends ContentType, I>(type: T, itemId: string) => {
        const currentData = content[type];
        if (Array.isArray(currentData)) {
            const newData = currentData.filter((item: I & { id: string }) => item.id !== itemId);
            onContentChange(passageId, type, newData as GeneratedContent[T]);
        }
    };
    
    const generateTextContent = () => {
        let text = `AI 생성 영어 학습자료: ${title}\n\n`;
        
        results.forEach((result, index) => {
            text += `\n==================\n`;
            text += `    지문 #${index + 1}\n`;
            text += `==================\n\n`;

            const currentContent = result.content;
            
            text += "--- 글의 분석 ---\n";
            text += `한글 주제: ${currentContent.koreanTopic}\n`;
            text += `영어 제목: ${currentContent.englishTitle}\n`;
            text += `내용 요약 (한글): ${currentContent.koreanSummary}\n`;
            text += `글의 흐름:\n${currentContent.textFlow.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n`;
            
            text += "\n--- 어휘 정리 ---\n";
            currentContent.vocabulary.forEach(v => { text += `${v.word}: ${v.meaning}\n`; });

            text += "\n--- 어휘 확장 ---\n";
            currentContent.expandedVocabulary.forEach(v => {
                text += `\n[${v.word}]\n`;
                text += `Korean Meaning: ${v.meaning}\n`;
                text += `English Meaning: ${v.definition}\n`;
                text += `Synonym: ${v.synonym}\n`;
                text += `Antonym: ${v.antonym}\n`;
            });

            text += "\n--- 한줄 해석 ---\n";
            currentContent.translatedSentences.forEach(s => {
                text += `\n${s.korean}\n`;
                text += `${s.english}\n`;
            });

            text += "\n--- 워크시트 ---\n";
            text += "\n[어휘 및 어법 선택]\n";
            currentContent.multipleChoiceWorksheet.forEach((q, i) => {
                text += `${i + 1}. ${q.sentence} (정답: ${q.answer})\n`;
            });

            text += "\n[문장 배열]\n";
            currentContent.sentenceScrambleWorksheet.forEach((q, i) => {
                text += `${i + 1}. ${q.scrambled.join(' / ')}\n정답: ${q.correct}\n`;
            });

            text += "\n[문단 배열]\n";
            text += `정답 순서: ${currentContent.paragraphScrambleWorksheet.correctOrder.map(i => String.fromCharCode(65 + i)).join(' -> ')}\n`;
            currentContent.paragraphScrambleWorksheet.scrambledParagraphs.forEach((p, i) => {
                text += `(${String.fromCharCode(65 + i)}) ${p}\n`;
            });
        });

        return text;
    };

    const handleDownloadText = () => {
        const textContent = generateTextContent();
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/ /g, '_')}_학습자료.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloadMenuOpen(false);
    };

    const handleDownloadPdf = async () => {
        setDownloadMenuOpen(false);
        setIsDownloadingPdf(true);
    
        const printableElement = document.createElement('div');
        printableElement.style.position = 'absolute';
        printableElement.style.left = '-9999px';
        document.body.appendChild(printableElement);

        const tempRoot = document.createElement('div');
        printableElement.appendChild(tempRoot);
        const { createRoot } = await import('react-dom/client');
        createRoot(tempRoot).render(<PrintableContent results={results} title={title} />);
        
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const canvas = await html2canvas(tempRoot.querySelector('#printable-content'), {
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${title.replace(/ /g, '_')}_학습자료.pdf`);

        } catch (error) {
            console.error("PDF 생성 중 오류 발생:", error);
            alert("PDF를 생성하는 데 실패했습니다.");
        } finally {
            document.body.removeChild(printableElement);
            setIsDownloadingPdf(false);
        }
    };
    
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">생성된 학습 콘텐츠</h1>
        <div className="flex items-center gap-4">
            <button
                onClick={onBack}
                className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-transform transform hover:-translate-y-0.5"
            >
                &larr; 새로 만들기
            </button>
             <div className="relative" ref={downloadMenuRef}>
                <button
                    onClick={() => setDownloadMenuOpen(prev => !prev)}
                    className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition-transform transform hover:-translate-y-0.5 flex items-center gap-2"
                    disabled={isDownloadingPdf}
                >
                    {isDownloadingPdf ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            생성 중...
                        </>
                    ) : (
                       <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            다운로드
                       </>
                    )}
                </button>
                {isDownloadMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 animate-fade-in">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <button onClick={handleDownloadText} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                텍스트 파일 (.txt)
                            </button>
                            <button onClick={handleDownloadPdf} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                PDF 파일 (.pdf)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </header>

      <nav className="mb-6 p-2 bg-gray-100 rounded-full flex justify-center items-center gap-2 shadow-inner">
            {results.map((_, index) => (
                <PassageTabButton
                    key={index}
                    active={activePassageIndex === index}
                    onClick={() => setActivePassageIndex(index)}
                >
                    지문 #{index + 1}
                </PassageTabButton>
            ))}
        </nav>
      
      <nav className="border-b border-gray-200 mb-8">
        <div className="-mb-px flex space-x-4">
          <TabButton active={activeTab === 'vocabulary'} onClick={() => setActiveTab('vocabulary')}>어휘 학습</TabButton>
          <TabButton active={activeTab === 'sentences'} onClick={() => setActiveTab('sentences')}>문장 연습</TabButton>
          <TabButton active={activeTab === 'worksheets'} onClick={() => setActiveTab('worksheets')}>워크시트</TabButton>
        </div>
      </nav>

      <main>
        {activeTab === 'vocabulary' && (
            <div className="space-y-8 animate-fade-in-up">
                <Card title="어휘 정리">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Word</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/5">Meaning</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {content.vocabulary.map((item) => (
                                    <tr key={item.id} className="group hover:bg-purple-50/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-bold text-lg text-purple-700">{item.word}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-gray-800">{item.meaning}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button className="text-gray-400 hover:text-indigo-600" aria-label="Edit item">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('vocabulary', item.id)}
                                                    className="text-gray-400 hover:text-red-600"
                                                    aria-label="Delete item"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <Card title="어휘 확장">
                    <div className="divide-y divide-gray-100">
                        {content.expandedVocabulary.map((item) => (
                            <EditableItem key={item.id} onDelete={() => handleDelete('expandedVocabulary', item.id)}>
                                <div className="space-y-2">
                                    <p className="font-bold text-xl text-purple-700">{item.word}</p>
                                    <p><span className="font-semibold text-gray-500 w-40 inline-block">Korean Meaning:</span> {item.meaning}</p>
                                    <p><span className="font-semibold text-gray-500 w-40 inline-block">English Meaning:</span> {item.definition}</p>
                                    <p><span className="font-semibold text-gray-500 w-40 inline-block">Synonym:</span> {item.synonym}</p>
                                    <p><span className="font-semibold text-gray-500 w-40 inline-block">Antonym:</span> {item.antonym}</p>
                                </div>
                            </EditableItem>
                        ))}
                    </div>
                </Card>
            </div>
        )}

        {activeTab === 'sentences' && (
             <div className="space-y-8 animate-fade-in-up">
                <Card title="글의 분석">
                    <div className="space-y-6 p-4">
                        <div>
                            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">한글 주제</h3>
                            <p className="text-lg text-gray-800 mt-1">{content.koreanTopic}</p>
                        </div>
                         <div className="border-t border-gray-200"></div>
                        <div>
                            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">영어 제목</h3>
                            <p className="text-lg text-gray-800 mt-1">{content.englishTitle}</p>
                        </div>
                         <div className="border-t border-gray-200"></div>
                        <div>
                            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">내용 요약 (한글)</h3>
                            <p className="leading-relaxed mt-1">{content.koreanSummary}</p>
                        </div>
                         <div className="border-t border-gray-200"></div>
                        <div>
                            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">글의 흐름</h3>
                             <ul className="space-y-3 mt-2">
                                {content.textFlow.map((flowItem, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 bg-purple-100 text-purple-700 font-bold rounded-full h-7 w-7 flex items-center justify-center">{index + 1}</span>
                                        <p className="flex-1 pt-0.5">{flowItem}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Card>
                <Card title="한줄 해석">
                    <div className="divide-y divide-gray-100">
                        {content.translatedSentences.map((item) => (
                            <EditableItem key={item.id} onDelete={() => handleDelete('translatedSentences', item.id)}>
                                <div className="space-y-2">
                                    <p className="text-gray-800 font-medium">{item.korean}</p>
                                    <p className="text-indigo-700">{item.english}</p>
                                </div>
                            </EditableItem>
                        ))}
                    </div>
                </Card>
            </div>
        )}

        {activeTab === 'worksheets' && (
            <div className="space-y-8 animate-fade-in-up">
                <Card title="워크시트: 어휘 및 어법 선택">
                    <div className="divide-y divide-gray-100">
                        {content.multipleChoiceWorksheet.map((item, index) => (
                            <EditableItem key={item.id} onDelete={() => handleDelete('multipleChoiceWorksheet', item.id)}>
                                 <div className="flex items-start gap-3">
                                    <span className="font-semibold pt-1">{index + 1}.</span>
                                    <InteractiveMCQ item={item} />
                                </div>
                            </EditableItem>
                        ))}
                    </div>
                </Card>
                <Card title="워크시트: 문장 배열">
                    <div className="divide-y divide-gray-100">
                        {content.sentenceScrambleWorksheet.map((item) => (
                            <EditableItem key={item.id} onDelete={() => handleDelete('sentenceScrambleWorksheet', item.id)}>
                                <InteractiveSentenceScramble item={item} />
                            </EditableItem>
                        ))}
                    </div>
                </Card>
                <Card title="워크시트: 문단 배열">
                    <InteractiveParagraphScramble worksheet={content.paragraphScrambleWorksheet} />
                </Card>
            </div>
        )}
      </main>
    </div>
  );
};
