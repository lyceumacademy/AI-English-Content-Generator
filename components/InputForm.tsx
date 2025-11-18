
import React, { useState } from 'react';

interface Passage {
    id: number;
    english: string;
    korean: string;
}

interface InputFormProps {
  onGenerate: (
    passages: { english: string; korean: string }[],
    title: string,
    school: string,
    grade: string
  ) => void;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate }) => {
  const [title, setTitle] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [passages, setPassages] = useState<Passage[]>([{ id: Date.now(), english: '', korean: '' }]);
  const [error, setError] = useState('');
  
  const samplePassage1 = {
      english: `Most times a foreign language is spoken in film, subtitles are used to translate the dialogue for the viewer.
However, there are occasions when foreign dialogue is left unsubtitled (and thus incomprehensible to most of the target audience).
This is often done if the movie is seen mainly from the viewpoint of a particular character who does not speak the language.
Such absence of subtitles allows the audience to feel a similar sense of incomprehension and alienation that the character feels.
An example of this is seen in Not Without My Daughter.
The Persian language dialogue spoken by the Iranian characters is not subtitled because the main character Betty Mahmoody does not speak Persian and the audience is seeing the film from her viewpoint.`,
      korean: `영화에서 외국어가 사용되는 대부분의 경우 관객을 위해 대화를 통역하려고 자막이 사용된다.
하지만 외국어 대화가 자막 없이 (그리하여 대부분의 주요 대상 관객이 이해하지 못하게) 처리되는 경우가 있다.
영화가 그 언어를 할 줄 모르는 특정 한 등장인물의 관점에서 주로 보여지는 경우에 흔히 이렇게 처리된다.
그러한 자막의 부재는 관객이 그 등장인물이 느끼는 것과 비슷한 몰이해와 소외의 감정을 느끼게 한다.
이것의 한 예를 Not Without My Daughter에서 볼 수 있다.
주인공 Betty Mahmoody가 페르시아어를 하지 못하기 때문에 이란인 등장인물들이 하는 페르시아어 대화에는 자막이 없으며, 관객은 그녀의 시각에서 영화를 보고 있게 된다.`
  };

  const handlePassageChange = (id: number, field: 'english' | 'korean', value: string) => {
    setPassages(passages.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addPassage = () => {
    setPassages([...passages, { id: Date.now(), english: '', korean: '' }]);
  };

  const removePassage = (id: number) => {
    setPassages(passages.filter(p => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAnyPassageEmpty = passages.some(p => !p.english.trim() || !p.korean.trim());

    if (!title || !school || !grade || isAnyPassageEmpty) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setError('');
    const passagesData = passages.map(p => ({ english: p.english.trim(), korean: p.korean.trim() }));
    onGenerate(passagesData, title, school, grade);
  };

  const fillSampleData = () => {
    setTitle("Chapter 02 학력평가 본문 정리");
    setSchool("리체움영어학원");
    setGrade("고등학교 1학년");
    setPassages([{id: Date.now(), ...samplePassage1}]);
    setError("");
  };
  
  const inputStyles = "w-full p-4 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-300";
  const textareaStyles = `${inputStyles} min-h-[200px] resize-y`;


  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12 space-y-8 animate-fade-in-up">
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tighter">AI 영어 학습자료 생성기</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">영어 지문과 한글 해석을 입력하여 어휘, 해석, 워크시트 등 풍부한 학습 콘텐츠를 즉시 생성하세요.</p>
        </header>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="grid grid-cols-1 md:grid-cols-5 gap-6">
             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="콘텐츠 제목" className={`${inputStyles} md:col-span-5`}/>
             <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} placeholder="학교" className={`${inputStyles} md:col-span-3`}/>
             <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="학년 (예: 고등학교 1학년)" className={`${inputStyles} md:col-span-2`}/>
          </fieldset>

          <div className="space-y-6">
            {passages.map((passage, index) => (
                <div key={passage.id} className="p-4 border border-gray-200 rounded-xl relative">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <textarea value={passage.english} onChange={(e) => handlePassageChange(passage.id, 'english', e.target.value)} placeholder={`영어 지문 #${index + 1}`} className={textareaStyles}></textarea>
                        <textarea value={passage.korean} onChange={(e) => handlePassageChange(passage.id, 'korean', e.target.value)} placeholder={`한글 해석 #${index + 1}`} className={textareaStyles}></textarea>
                    </fieldset>
                    {passages.length > 1 && (
                        <button 
                            type="button" 
                            onClick={() => removePassage(passage.id)}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                            aria-label="Remove passage"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                            </svg>
                        </button>
                    )}
                </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button type="button" onClick={addPassage} className="px-6 py-2 bg-gray-100 text-gray-600 font-semibold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                지문 추가하기
            </button>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center font-medium animate-shake">{error}</p>}
          
          <footer className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all transform hover:-translate-y-1 duration-300">
                ✨ 콘텐츠 생성하기
             </button>
             <button type="button" onClick={fillSampleData} className="w-full sm:w-auto px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-colors">
                샘플 데이터 채우기
             </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
