import { Injectable } from '@angular/core';
import { Question, QuestionOption } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ShuffleService {
  
  /**
   * Fisher-Yates Shuffle Algorithmus (in-place)
   * Zeitkomplexität: O(n), Speicherkomplexität: O(1)
   */
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Seed-basierte Mischung für reproduzierbare Tests
   * Verwendet einen einfachen Pseudo-Random-Generator
   */
  shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    const random = this.seededRandom(seed);
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Fragen mischen mit verschiedenen Optionen
   */
  shuffleQuestions(questions: Question[], options: {
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    seed?: number;
  } = {}): Question[] {
    const {
      shuffleQuestions = true,
      shuffleOptions = true,
      seed
    } = options;

    let shuffledQuestions = questions;

    // Fragen mischen
    if (shuffleQuestions) {
      shuffledQuestions = seed !== undefined 
        ? this.shuffleArrayWithSeed(questions, seed)
        : this.shuffleArray(questions);
    }

    // Optionen mischen (nur für Single/Multiple Choice)
    if (shuffleOptions) {
      shuffledQuestions = shuffledQuestions.map(question => {
        if (question.type === 'single' || question.type === 'multi') {
          return {
            ...question,
            options: seed !== undefined
              ? this.shuffleArrayWithSeed(question.options, seed + question.id)
              : this.shuffleArray(question.options)
          };
        }
        return question;
      });
    }

    return shuffledQuestions;
  }

  /**
   * Nur Optionen mischen (für bestehende Fragen)
   */
  shuffleQuestionOptions(question: Question, seed?: number): Question {
    if (question.type === 'single' || question.type === 'multi') {
      return {
        ...question,
        options: seed !== undefined
          ? this.shuffleArrayWithSeed(question.options, seed + question.id)
          : this.shuffleArray(question.options)
      };
    }
    return question;
  }

  /**
   * Seed-basierter Pseudo-Random-Generator
   * Linear Congruential Generator (LCG)
   */
  private seededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  /**
   * Generiere einen zufälligen Seed basierend auf aktueller Zeit
   */
  generateRandomSeed(): number {
    return Date.now() % 1000000;
  }

  /**
   * Generiere einen Seed basierend auf Benutzer-ID und Zeit
   */
  generateUserSeed(userId?: string): number {
    const time = Date.now();
    const userHash = userId ? this.hashString(userId) : 0;
    return (time + userHash) % 1000000;
  }

  /**
   * Einfacher String-Hash für Benutzer-ID
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Überprüfe ob zwei Arrays die gleiche Reihenfolge haben
   */
  isSameOrder<T>(array1: T[], array2: T[]): boolean {
    if (array1.length !== array2.length) return false;
    return array1.every((item, index) => item === array2[index]);
  }

  /**
   * Mische nur einen Teil der Fragen (für große Kataloge)
   */
  shuffleQuestionsPartial(
    questions: Question[], 
    count: number,
    options: { seed?: number; shuffleOptions?: boolean } = {}
  ): Question[] {
    const { seed, shuffleOptions = true } = options;
    
    // Wähle zufällige Fragen aus
    const selectedQuestions = this.selectRandomQuestions(questions, count, seed);
    
    // Mische die ausgewählten Fragen
    return this.shuffleQuestions(selectedQuestions, {
      shuffleQuestions: true,
      shuffleOptions,
      seed
    });
  }

  /**
   * Wähle zufällige Fragen aus (ohne Duplikate)
   */
  private selectRandomQuestions(questions: Question[], count: number, seed?: number): Question[] {
    if (count >= questions.length) return questions;
    
    const random = seed !== undefined ? this.seededRandom(seed) : Math.random;
    const selected: Question[] = [];
    const available = [...questions];
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const randomIndex = Math.floor(random() * available.length);
      selected.push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }
    
    return selected;
  }

  /**
   * Mische Fragen basierend auf Schwierigkeitsgrad (falls verfügbar)
   */
  shuffleQuestionsByDifficulty(
    questions: Question[],
    options: { 
      shuffleQuestions?: boolean;
      shuffleOptions?: boolean;
      seed?: number;
      difficultyWeight?: number; // 0 = zufällig, 1 = nach Schwierigkeit
    } = {}
  ): Question[] {
    const {
      shuffleQuestions = true,
      shuffleOptions = true,
      seed,
      difficultyWeight = 0
    } = options;

    let shuffledQuestions = questions;

    if (shuffleQuestions) {
      if (difficultyWeight > 0 && this.hasDifficultyInfo(questions)) {
        // Mische mit Schwierigkeitsgewichtung
        shuffledQuestions = this.shuffleWithDifficultyWeight(questions, difficultyWeight, seed);
      } else {
        // Normale Mischung
        shuffledQuestions = seed !== undefined 
          ? this.shuffleArrayWithSeed(questions, seed)
          : this.shuffleArray(questions);
      }
    }

    // Optionen mischen
    if (shuffleOptions) {
      shuffledQuestions = shuffledQuestions.map(question => 
        this.shuffleQuestionOptions(question, seed)
      );
    }

    return shuffledQuestions;
  }

  /**
   * Prüfe ob Fragen Schwierigkeitsinformationen haben
   */
  private hasDifficultyInfo(questions: Question[]): boolean {
    // Hier könnten wir nach difficulty, level, oder ähnlichen Feldern suchen
    // Für jetzt geben wir false zurück
    return false;
  }

  /**
   * Mische mit Schwierigkeitsgewichtung
   */
  private shuffleWithDifficultyWeight(
    questions: Question[], 
    weight: number, 
    seed?: number
  ): Question[] {
    // Implementierung für Schwierigkeitsgewichtung
    // Für jetzt normale Mischung
    return seed !== undefined 
      ? this.shuffleArrayWithSeed(questions, seed)
      : this.shuffleArray(questions);
  }
}
