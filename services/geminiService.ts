
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, PassageResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateWithSchema = async <T,>(prompt: string, schema: any): Promise<T> => {
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
    console.error("Error generating content with schema:", error);
    throw new Error("Failed to generate content from AI.");
  }
};

const generateContentForSinglePassage = async (
  englishText: string,
  koreanText: string,
  grade: string
): Promise<GeneratedContent> => {

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

  const vocabularyPromise = generateWithSchema<{word: string, meaning: string}[]>(vocabularyPrompt, vocabSchema).then(items => items.map(item => ({...item, id: crypto.randomUUID()})));

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
  const translatedSentencesPromise = generateWithSchema<{english: string, korean: string}[]>(translationPrompt, translationSchema).then(items => items.map(item => ({...item, id: crypto.randomUUID()})));

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
  const multipleChoicePromise = generateWithSchema<{sentence: string, answer: string}[]>(multipleChoicePrompt, mcqSchema).then(items => items.map(item => ({...item, id: crypto.randomUUID()})));
  
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
  const sentenceScramblePromise = generateWithSchema<{scrambled: string[], correct: string}[]>(sentenceScramblePrompt, scrambleSchema).then(items => items.map(item => ({...item, id: crypto.randomUUID()})));

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
  const paragraphScramblePromise = generateWithSchema<{scrambledParagraphs: string[], correctOrder: number[]}>(paragraphScramblePrompt, paraScrambleSchema).then(item => ({...item, id: crypto.randomUUID()}));
  
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
    const analysisPromise = generateWithSchema<{koreanTopic: string, englishTitle: string, koreanSummary: string, textFlow: string[]}>(analysisPrompt, analysisSchema);


  const [vocabulary, translatedSentences, multipleChoiceWorksheet, sentenceScrambleWorksheet, paragraphScrambleWorksheet, analysisResult] = await Promise.all([
      vocabularyPromise,
      translatedSentencesPromise,
      multipleChoicePromise,
      sentenceScramblePromise,
      paragraphScramblePromise,
      analysisPromise
  ]);

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

  const expandedVocabData = await generateWithSchema<{word: string, definition: string, synonym: string, antonym: string}[]>(expandedVocabPrompt, expVocabSchema);

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
  grade: string
): Promise<PassageResult[]> => {
    const promises = passages.map(passage => 
        generateContentForSinglePassage(passage.english, passage.korean, grade)
    );

    const allGeneratedContents = await Promise.all(promises);

    return passages.map((passage, index) => ({
        passage: { ...passage, id: crypto.randomUUID() },
        content: allGeneratedContents[index],
    }));
};