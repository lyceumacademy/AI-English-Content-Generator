import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, PassageInput, PassageResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper function with exponential backoff retry logic
const generateWithRetry = async <T,>(prompt: string, schema: any, maxRetries = 5): Promise<T> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as T;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        console.error(`Failed after ${maxRetries} attempts.`, error);
        throw error; // Re-throw the error after all retries have failed
      }
      const backoffTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // Exponential backoff with jitter
      console.warn(`Attempt ${attempt} failed. Retrying in ${backoffTime.toFixed(0)}ms...`, error);
      await delay(backoffTime);
    }
  }
  // This line should theoretically not be reached, but it's here for type safety.
  throw new Error("Exhausted all retries and failed to generate content.");
};


const generateContentForSinglePassage = async (
  englishText: string,
  koreanText: string,
  grade: string
): Promise<GeneratedContent> => {

  // --- Prompts and Schemas Definition ---
  const vocabularyPrompt = `From the following English text, extract key vocabulary suitable for a ${grade} student. Provide the Korean translation for each word.
  
  English Text: "${englishText}"`;
  const vocabSchema = {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
              word: { type: Type.STRING },
              meaning: { type: Type.STRING }
          },
          required: ['word', 'meaning']
      }
  };

  const translationPrompt = `Align the following English text and its Korean translation sentence by sentence.
  
  English: "${englishText}"
  Korean: "${koreanText}"`;
  const translationSchema = {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
              english: { type: Type.STRING },
              korean: { type: Type.STRING }
          },
          required: ['english', 'korean']
      }
  };

  const multipleChoicePrompt = `From the following English text, create a worksheet with multiple-choice questions focusing on key vocabulary and grammar. For each question, provide a sentence with two options in the format "[option1/option2]". Also provide the correct option as the answer.
  
  English Text: "${englishText}"`;
  const mcqSchema = {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
              sentence: { type: Type.STRING, description: "The sentence containing choices like '[choiceA/choiceB]'." },
              answer: { type: Type.STRING }
          },
          required: ['sentence', 'answer']
      }
  };
  
  const sentenceScramblePrompt = `For each sentence in the provided English text, scramble the words or phrases.
  
  English Text: "${englishText}"`;
  const scrambleSchema = {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
              scrambled: { type: Type.ARRAY, items: { type: Type.STRING } },
              correct: { type: Type.STRING }
          },
          required: ['scrambled', 'correct']
      }
  };

  const paragraphScramblePrompt = `Divide the following English text into four logical paragraphs. Then, present them in a scrambled order and provide the correct sequence.
  
  English Text: "${englishText}"`;
  const paraScrambleSchema = {
      type: Type.OBJECT,
      properties: {
          scrambledParagraphs: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctOrder: { type: Type.ARRAY, items: { type: Type.INTEGER } }
      },
      required: ['scrambledParagraphs', 'correctOrder']
  };
  
  const analysisPrompt = `Analyze the following English text for a ${grade} student. Provide:
1. A concise topic in Korean.
2. A suitable title in English.
3. A summary in Korean.
4. A step-by-step breakdown of the text's flow in Korean.

English Text: "${englishText}"`;
    const analysisSchema = {
        type: Type.OBJECT,
        properties: {
            koreanTopic: { type: Type.STRING },
            englishTitle: { type: Type.STRING },
            koreanSummary: { type: Type.STRING },
            textFlow: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['koreanTopic', 'englishTitle', 'koreanSummary', 'textFlow']
    };
    
  // --- Sequential Generation with Retries ---
  
  const vocabularyData = await generateWithRetry<{word: string, meaning: string}[]>(vocabularyPrompt, vocabSchema);
  const vocabulary = vocabularyData.map(item => ({...item, id: crypto.randomUUID()}));
  
  const translatedSentencesData = await generateWithRetry<{english: string, korean: string}[]>(translationPrompt, translationSchema);
  const translatedSentences = translatedSentencesData.map(item => ({...item, id: crypto.randomUUID()}));

  const multipleChoiceWorksheetData = await generateWithRetry<{sentence: string, answer: string}[]>(multipleChoicePrompt, mcqSchema);
  const multipleChoiceWorksheet = multipleChoiceWorksheetData.map(item => ({...item, id: crypto.randomUUID()}));

  const sentenceScrambleWorksheetData = await generateWithRetry<{scrambled: string[], correct: string}[]>(sentenceScramblePrompt, scrambleSchema);
  const sentenceScrambleWorksheet = sentenceScrambleWorksheetData.map(item => ({...item, id: crypto.randomUUID()}));

  const paragraphScrambleWorksheet = await generateWithRetry<{scrambledParagraphs: string[], correctOrder: number[]}>(paragraphScramblePrompt, paraScrambleSchema).then(item => ({...item, id: crypto.randomUUID()}));
  
  const analysisResult = await generateWithRetry<{koreanTopic: string, englishTitle: string, koreanSummary: string, textFlow: string[]}>(analysisPrompt, analysisSchema);
  
  // Expanded vocabulary depends on the initial vocabulary list
  const expandedVocabPrompt = `For the following vocabulary list, provide an English definition (영영풀이), a synonym (동의어), and an antonym (반의어) for each word, suitable for a ${grade} student.
  
  Vocabulary: ${vocabulary.map(v => v.word).join(', ')}`;
  const expVocabSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            word: { type: Type.STRING },
            definition: { type: Type.STRING },
            synonym: { type: Type.STRING },
            antonym: { type: Type.STRING }
        },
        required: ['word', 'definition', 'synonym', 'antonym']
    }
  };

  const expandedVocabData = await generateWithRetry<{word: string, definition: string, synonym: string, antonym: string}[]>(expandedVocabPrompt, expVocabSchema);

  const expandedVocabulary = vocabulary.map(v => {
      const expansion = expandedVocabData.find(e => e.word.toLowerCase() === v.word.toLowerCase());
      return {
          ...v,
          definition: expansion?.definition || 'N/A',
          synonym: expansion?.synonym || 'N/A',
          antonym: expansion?.antonym || 'N/A',
      };
  });

  return {
    vocabulary,
    expandedVocabulary,
    translatedSentences,
    multipleChoiceWorksheet,
    sentenceScrambleWorksheet,
    paragraphScrambleWorksheet,
    ...analysisResult,
  };
};

export const generateAllContent = async (
  passages: { english: string; korean: string }[],
  grade: string,
  onProgress: (progress: { current: number; total: number }) => void
): Promise<PassageResult[]> => {
    const allResults: PassageResult[] = [];
    const totalPassages = passages.length;

    for (const [index, passage] of passages.entries()) {
        try {
            onProgress({ current: index + 1, total: totalPassages });
            const content = await generateContentForSinglePassage(passage.english, passage.korean, grade);
            allResults.push({
                passage: { ...passage, id: crypto.randomUUID() },
                content: content,
            });
        } catch (error) {
            console.error(`Error processing passage ${index + 1}:`, error);
            // Skip this passage and continue with the next ones.
            // A more advanced implementation could push an error state to the results array.
            alert(`지문 #${index + 1} 처리 중 오류가 발생하여 건너뛰었습니다. 나머지 지문은 계속 처리됩니다.`);
        }
    }

    if (allResults.length === 0 && passages.length > 0) {
        throw new Error("모든 지문 처리 중 오류가 발생했습니다. 입력 내용을 확인하거나 잠시 후 다시 시도해주세요.");
    }
    
    return allResults;
};
