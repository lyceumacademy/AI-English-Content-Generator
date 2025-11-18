
export interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
}

export interface ExpandedVocabularyItem extends VocabularyItem {
  definition: string;
  synonym: string;
  antonym: string;
}

export interface TranslatedSentence {
  id: string;
  korean: string;
  english: string;
}

export interface MultipleChoiceQuestion {
  id: string;
  sentence: string;
  answer: string;
}

export interface SentenceScrambleItem {
  id: string;
  scrambled: string[];
  correct: string;
}

export interface ParagraphScrambleItem {
  id: string;
  scrambledParagraphs: string[];
  correctOrder: number[];
}

export interface GeneratedContent {
  vocabulary: VocabularyItem[];
  expandedVocabulary: ExpandedVocabularyItem[];
  translatedSentences: TranslatedSentence[];
  multipleChoiceWorksheet: MultipleChoiceQuestion[];
  sentenceScrambleWorksheet: SentenceScrambleItem[];
  paragraphScrambleWorksheet: ParagraphScrambleItem;
  koreanTopic: string;
  englishTitle: string;
  koreanSummary: string;
  textFlow: string[];
}

export type ContentType = keyof GeneratedContent;

export interface PassageInput {
    id: string;
    english: string;
    korean: string;
}

export interface PassageResult {
    passage: PassageInput;
    content: GeneratedContent;
}

export interface StoredMaterial {
    docId: string;
    title: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
    results: PassageResult[];
}