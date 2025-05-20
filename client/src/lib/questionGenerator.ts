// Question generator for Compatibility Game
// This file contains functions to generate personalized couple questions
// that change daily based on the current date

import { format } from 'date-fns';

// Topic categories for relationship questions
const QUESTION_CATEGORIES = [
  'deep connection',
  'future plans',
  'relationship compatibility',
  'love languages',
  'shared memories',
  'communication styles',
  'goals and dreams',
  'values and beliefs',
  'likes and preferences',
  'childhood memories',
  'travel and adventure',
  'family and friends',
  'daily habits',
  'hypothetical scenarios'
];

// Question templates to be filled in
const QUESTION_TEMPLATES = [
  'What is {partner}\'s favorite way to spend a weekend?',
  'How would {partner} react if {scenario}?',
  'What do you think {partner} values most in your relationship?',
  'What was {partner}\'s most memorable childhood experience?',
  'Where would {partner} most like to travel together?',
  'What does {partner} appreciate most about your communication style?',
  'What is {partner}\'s biggest relationship fear?',
  'How would {partner} describe their perfect date night?',
  'What movie/book/song does {partner} think best represents your relationship?',
  'What food would {partner} choose to eat for the rest of their life?',
  'Which of {partner}\'s habits do you find most endearing?',
  'How does {partner} prefer to resolve conflicts?',
  'What is something {partner} would like to learn or improve about themselves?',
  'What is {partner}\'s love language?',
  'What small gesture from {partner} makes you feel most loved?',
  'What shared memory with {partner} do you cherish most?',
  'How does {partner} like to be comforted when they\'re sad?',
  'What is {partner}\'s idea of a perfect vacation?',
  'What topic could {partner} talk about for hours?',
  'What hidden talent or skill does {partner} have?',
  'What is a goal {partner} has for the next five years?',
  'What was {partner}\'s first impression of you?',
  'What breakfast food best describes {partner}\'s personality?',
  'Which of {partner}\'s qualities do you admire most?',
  'What is something {partner} has taught you?',
  'What fictional character reminds you of {partner}?',
  'What is {partner}\'s most treasured possession?',
  'What makes {partner} laugh the hardest?',
  'What does {partner} do to relax after a stressful day?',
  'What is {partner}\'s favorite way to show affection?'
];

// Scenarios for hypothetical questions
const SCENARIOS = [
  'you won a million dollars together',
  'you could live anywhere in the world',
  'you had to choose between career success and relationship stability',
  'you could travel back in time to any period',
  'you suddenly had to move to another country',
  'you could have dinner with any historical figure',
  'you had to change careers completely',
  'you saw a celebrity you both admire in public',
  'you found a stray puppy on your doorstep',
  'you had to live without technology for a month',
  'you discovered a hidden talent you never knew you had',
  'you had to choose between never being cold again or never being hot again',
  'you could only eat one cuisine for the rest of your life',
  'you could have any superpower',
  'your house was on fire and you could save only three items'
];

/**
 * Generate a deterministic seed based on date to ensure same questions on same day
 * but different questions on different days
 */
function getDateSeed(): number {
  const today = new Date();
  const dateString = format(today, 'yyyyMMdd');
  
  // Create a simple hash from the date string
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator
 */
function seededRandom(seed: number, index: number = 0): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

/**
 * Get a random item from an array using the seeded random generator
 */
function getRandomItemFromArray<T>(array: T[], seed: number, index: number = 0): T {
  const randomIndex = Math.floor(seededRandom(seed, index) * array.length);
  return array[randomIndex];
}

/**
 * Fill in a template question with relevant information
 */
function fillTemplate(template: string, partnerName: string, seed: number): string {
  // Replace {partner} with the partner's name
  let filledQuestion = template.replace(/\{partner\}/g, partnerName);
  
  // Replace {scenario} with a random scenario if the template contains it
  if (filledQuestion.includes('{scenario}')) {
    const scenario = getRandomItemFromArray(SCENARIOS, seed, 2);
    filledQuestion = filledQuestion.replace(/\{scenario\}/g, scenario);
  }
  
  return filledQuestion;
}

/**
 * Generate a set of compatibility questions for today
 */
export function generateDailyQuestions(partnerName: string, count: number = 5): string[] {
  const seed = getDateSeed();
  const questions: string[] = [];
  
  // Use a set to ensure unique questions
  const selectedTemplateIndices = new Set<number>();
  
  // Generate 'count' number of unique questions
  while (questions.length < count) {
    const templateIndex = Math.floor(seededRandom(seed, questions.length) * QUESTION_TEMPLATES.length);
    
    // Ensure we don't use the same template twice
    if (!selectedTemplateIndices.has(templateIndex)) {
      selectedTemplateIndices.add(templateIndex);
      
      const template = QUESTION_TEMPLATES[templateIndex];
      const question = fillTemplate(template, partnerName, seed + templateIndex);
      questions.push(question);
    }
  }
  
  return questions;
}

/**
 * Get today's date in a readable format (for display purposes)
 */
export function getTodayFormatted(): string {
  return format(new Date(), 'MMMM d, yyyy');
}

/**
 * Get a unique identifier for today (for storage/tracking purposes)
 */
export function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Generate a game title based on today's date
 */
export function generateGameTitle(): string {
  const seed = getDateSeed();
  const category = getRandomItemFromArray(QUESTION_CATEGORIES, seed);
  
  // Generate varied title formats
  const titleTemplates = [
    `Daily ${category.charAt(0).toUpperCase() + category.slice(1)} Connection`,
    `Today's ${category.charAt(0).toUpperCase() + category.slice(1)} Challenge`,
    `${category.charAt(0).toUpperCase() + category.slice(1)} Quiz of the Day`,
    `Daily ${category.charAt(0).toUpperCase() + category.slice(1)} Compatibility Test`,
    `Today's ${category.charAt(0).toUpperCase() + category.slice(1)} Questions`
  ];
  
  return getRandomItemFromArray(titleTemplates, seed, 1);
}