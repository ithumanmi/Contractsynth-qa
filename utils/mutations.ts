import { MUTATIONS } from '../constants';
import { MutationCode, MutationDef } from '../types';

export const groupMutationsByCategory = (): Record<string, MutationDef[]> => {
  console.log('[groupMutationsByCategory] Grouping mutations');
  console.log('[groupMutationsByCategory] Total mutations:', MUTATIONS.length);
  
  const result = MUTATIONS.reduce((acc, mutation) => {
    if (!acc[mutation.category]) {
      acc[mutation.category] = [];
    }
    acc[mutation.category].push(mutation);
    return acc;
  }, {} as Record<string, MutationDef[]>);
  
  console.log('[groupMutationsByCategory] Categories:', Object.keys(result));
  console.log('[groupMutationsByCategory] Mutations per category:', Object.entries(result).map(([cat, muts]) => `${cat}: ${muts.length}`).join(', '));
  
  return result;
};

export const toggleMutation = (
  code: MutationCode,
  activeMutations: MutationCode[]
): MutationCode[] => {
  const isActive = activeMutations.includes(code);
  console.log('[toggleMutation] Toggling mutation:', code, 'currently active:', isActive);
  
  const result = isActive
    ? activeMutations.filter(c => c !== code)
    : [...activeMutations, code];
  
  console.log('[toggleMutation] Mutation toggled, new active count:', result.length);
  console.log('[toggleMutation] Active mutations:', result);
  
  return result;
};

