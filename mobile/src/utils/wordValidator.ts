import { normalizeTurkish } from './turkish';

export const validateWord = (input: string, target: string): boolean => {
  return normalizeTurkish(input.trim()) === normalizeTurkish(target.trim());
};

export const getLetterFeedback = (input: string, target: string) => {
  const result = [];
  const normalizedInput = normalizeTurkish(input);
  const normalizedTarget = normalizeTurkish(target);

  for (let i = 0; i < normalizedInput.length; i++) {
    if (normalizedInput[i] === normalizedTarget[i]) {
      result.push('correct');
    } else if (normalizedTarget.includes(normalizedInput[i])) {
      result.push('misplaced');
    } else {
      result.push('incorrect');
    }
  }
  return result;
};
