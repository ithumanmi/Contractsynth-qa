import { MUTATIONS } from '../constants';
import { MutationCode, MutationDef } from '../types';

export const groupMutationsByCategory = (): Record<string, MutationDef[]> => {
  return MUTATIONS.reduce((acc, mutation) => {
    if (!acc[mutation.category]) {
      acc[mutation.category] = [];
    }
    acc[mutation.category].push(mutation);
    return acc;
  }, {} as Record<string, MutationDef[]>);
};

export const toggleMutation = (
  code: MutationCode,
  activeMutations: MutationCode[]
): MutationCode[] => {
  return activeMutations.includes(code)
    ? activeMutations.filter(c => c !== code)
    : [...activeMutations, code];
};

