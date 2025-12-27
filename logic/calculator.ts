
import { HeirKey, CalculationResult, DeceasedGender, InheritanceState, FiqhSchool } from '../types';
import { ALL_HEIRS, i18nStrings } from '../constants';

export const calculateInheritance = (state: InheritanceState): CalculationResult[] => {
  const { 
    totalEstate, 
    funeralExpenses, 
    debts, 
    wasiyyat, 
    deceasedGender, 
    heirs, 
    school,
    language
  } = state;
  
  const t = i18nStrings[language] || i18nStrings.en;
  let results: CalculationResult[] = [];

  const deductions = (funeralExpenses || 0) + (debts || 0) + (wasiyyat || 0);
  const netEstate = Math.max(0, totalEstate - deductions);

  const activeHeirs = { ...heirs };
  if (deceasedGender === DeceasedGender.Male) activeHeirs.husband = 0;
  if (deceasedGender === DeceasedGender.Female) activeHeirs.wife = 0;

  const hasSon = (activeHeirs.son || 0) > 0;
  const hasGrandson = (activeHeirs.grandson || 0) > 0;
  const hasMaleDescendant = hasSon || hasGrandson;
  const hasDaughter = (activeHeirs.daughter || 0) > 0;
  const hasGranddaughter = (activeHeirs.granddaughter || 0) > 0;
  const hasDescendant = hasMaleDescendant || hasDaughter || hasGranddaughter;
  
  const hasFather = (activeHeirs.father || 0) > 0;
  const hasMother = (activeHeirs.mother || 0) > 0;
  
  const sibCount = (activeHeirs.fullBrother || 0) + (activeHeirs.fullSister || 0) +
                   (activeHeirs.paternalBrother || 0) + (activeHeirs.paternalSister || 0) +
                   (activeHeirs.maternalBrother || 0) + (activeHeirs.maternalSister || 0);

  const blocked: Partial<Record<HeirKey, string>> = {};

  if (hasFather) {
    blocked.grandfather = t.heirs.father;
    blocked.paternalGrandmother = t.heirs.father;
    blocked.fullBrother = t.heirs.father;
    blocked.fullSister = t.heirs.father;
    blocked.paternalBrother = t.heirs.father;
    blocked.paternalSister = t.heirs.father;
    blocked.maternalBrother = t.heirs.father;
    blocked.maternalSister = t.heirs.father;
  }
  if (hasMother) {
    blocked.paternalGrandmother = t.heirs.mother;
    blocked.maternalGrandmother = t.heirs.mother;
  }
  
  if (hasSon) {
    blocked.grandson = t.heirs.son;
    blocked.granddaughter = t.heirs.son;
    blocked.fullBrother = t.heirs.son;
    blocked.fullSister = t.heirs.son;
    blocked.paternalBrother = t.heirs.son;
    blocked.paternalSister = t.heirs.son;
    blocked.maternalBrother = t.heirs.son;
    blocked.maternalSister = t.heirs.son;
  }

  let shares: Partial<Record<HeirKey, number>> = {};
  const categoryMap: Partial<Record<HeirKey, 'Sharer' | 'Residuary' | 'Treasury'>> = {};
  let totalFurud = 0;

  if (activeHeirs.husband > 0) {
    shares.husband = hasDescendant ? 1/4 : 1/2;
    categoryMap.husband = 'Sharer';
    totalFurud += shares.husband;
  }
  if (activeHeirs.wife > 0) {
    shares.wife = hasDescendant ? 1/8 : 1/4;
    categoryMap.wife = 'Sharer';
    totalFurud += shares.wife;
  }

  if (hasFather && !blocked.father) {
    if (hasMaleDescendant) {
      shares.father = 1/6;
      categoryMap.father = 'Sharer';
      totalFurud += 1/6;
    }
  }
  if (hasMother && !blocked.mother) {
    shares.mother = (hasDescendant || sibCount >= 2) ? 1/6 : 1/3;
    categoryMap.mother = 'Sharer';
    totalFurud += shares.mother;
  }

  if (hasDaughter && !hasSon) {
    shares.daughter = activeHeirs.daughter === 1 ? 1/2 : 2/3;
    categoryMap.daughter = 'Sharer';
    totalFurud += shares.daughter;
  }

  if (totalFurud > 1) {
    const factor = totalFurud;
    Object.keys(shares).forEach(k => { shares[k as HeirKey]! /= factor; });
    totalFurud = 1;
  }

  let residue = 1 - totalFurud;
  if (residue > 1e-6) {
    const asabaList: HeirKey[] = [];
    if (hasSon) {
      asabaList.push('son');
      if (hasDaughter) asabaList.push('daughter');
    } else if (hasFather) {
      asabaList.push('father');
    }

    if (asabaList.length > 0) {
      let totalWeight = 0;
      asabaList.forEach(k => {
        const weight = ALL_HEIRS.find(h => h.id === k)?.gender === 'M' ? 2 : 1;
        totalWeight += weight * (activeHeirs[k] || 1);
      });
      asabaList.forEach(k => {
        const weight = ALL_HEIRS.find(h => h.id === k)?.gender === 'M' ? 2 : 1;
        const s = (residue * weight * (activeHeirs[k] || 1)) / totalWeight;
        shares[k] = (shares[k] || 0) + s;
        categoryMap[k] = 'Residuary';
      });
      residue = 0;
    }
  }

  ALL_HEIRS.forEach(def => {
    const count = activeHeirs[def.id] || 0;
    const isHeirBlocked = !!blocked[def.id];
    if (count > 0 || isHeirBlocked) {
      const share = shares[def.id] || 0;
      results.push({
        heirId: def.id,
        heirName: t.heirs[def.id],
        count,
        shareFraction: formatFraction(share),
        sharePercentage: share * 100,
        shareAmount: share * netEstate,
        shareAmountPerHeir: count > 0 ? (share * netEstate) / count : 0,
        sharePercentagePerHeir: count > 0 ? (share * 100) / count : 0,
        isBlocked: isHeirBlocked,
        blockedBy: blocked[def.id],
        explanation: getDetailedExplanation(def.id, isHeirBlocked, share > 0, categoryMap[def.id], hasDescendant, activeHeirs[def.id], t),
        quranReference: getQuranRef(def.id),
        heirType: isHeirBlocked ? 'Blocked' : (categoryMap[def.id] as any || 'Sharer'),
        fiqhNote: undefined
      });
    }
  });

  const totalDistributed = results.reduce((sum, r) => sum + r.sharePercentage, 0);
  if (totalDistributed < 99.9 && netEstate > 0) {
    const remainingRatio = (100 - totalDistributed) / 100;
    results.push({
      heirId: 'governmentTreasury',
      heirName: t.heirs.governmentTreasury,
      count: 1,
      shareFraction: formatFraction(remainingRatio),
      sharePercentage: remainingRatio * 100,
      shareAmount: remainingRatio * netEstate,
      shareAmountPerHeir: remainingRatio * netEstate,
      sharePercentagePerHeir: remainingRatio * 100,
      isBlocked: false,
      explanation: t.exp_treasury,
      heirType: 'Treasury'
    });
  }

  return results;
};

const formatFraction = (val: number): string => {
  if (val < 1e-6) return '0';
  const denominators = [2, 3, 4, 6, 8, 12, 13, 15, 17, 24, 27, 32, 48];
  for (const d of denominators) {
    const n = Math.round(val * d);
    if (Math.abs(val - n / d) < 1e-3) return `${n}/${d}`;
  }
  return val.toFixed(3);
};

const getDetailedExplanation = (id: HeirKey, isBlocked: boolean, hasShare: boolean, type: string | undefined, hasDesc: boolean, count: number, t: any): string => {
  if (isBlocked) return t.exp_blocked;
  if (!hasShare) return t.exp_no_share;

  switch (id) {
    case 'husband': return hasDesc ? t.exp_husband_2 : t.exp_husband_1;
    case 'wife': return hasDesc ? t.exp_wife_2 : t.exp_wife_1;
    case 'son': return t.exp_son;
    case 'daughter':
      if (type === 'Residuary') return t.exp_daughter_3;
      return count === 1 ? t.exp_daughter_1 : t.exp_daughter_2;
    case 'father': return type === 'Sharer' ? t.exp_father_1 : t.exp_father_2;
    case 'mother': return t.mother_1 ? (hasDesc ? t.exp_mother_1 : t.exp_mother_2) : t.exp_mother_2;
    default: return t.exp_general;
  }
};

const getQuranRef = (id: HeirKey): string => {
  const refs: Partial<Record<HeirKey, string>> = {
    son: '4:11', daughter: '4:11', father: '4:11', mother: '4:11',
    husband: '4:12', wife: '4:12', maternalBrother: '4:12', maternalSister: '4:12',
    fullSister: '4:176', paternalSister: '4:176'
  };
  return refs[id] || '';
};
