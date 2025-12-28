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

  // Clean heirs based on gender logic
  const activeHeirs = { ...heirs };
  if (deceasedGender === DeceasedGender.Male) activeHeirs.husband = 0;
  if (deceasedGender === DeceasedGender.Female) activeHeirs.wife = 0;

  // Primary Heir Counts
  const nSon = activeHeirs.son || 0;
  const nDaughter = activeHeirs.daughter || 0;
  const nGrandson = activeHeirs.grandson || 0;
  const nGranddaughter = activeHeirs.granddaughter || 0;
  const nFather = activeHeirs.father || 0;
  const nMother = activeHeirs.mother || 0;
  const nGrandfather = activeHeirs.grandfather || 0;
  
  const nFullBro = activeHeirs.fullBrother || 0;
  const nFullSis = activeHeirs.fullSister || 0;
  const nPatBro = activeHeirs.paternalBrother || 0;
  const nPatSis = activeHeirs.paternalSister || 0;
  const nMatBro = activeHeirs.maternalBrother || 0;
  const nMatSis = activeHeirs.maternalSister || 0;

  const hasMaleDescendant = nSon > 0 || nGrandson > 0;
  const hasDescendant = hasMaleDescendant || nDaughter > 0 || nGranddaughter > 0;
  const sibCount = nFullBro + nFullSis + nPatBro + nPatSis + nMatBro + nMatSis;

  const blocked: Partial<Record<HeirKey, string>> = {};

  // --- 100% CORRECT HAJB (EXCLUSION) RULES ---
  const sonLabel = t.heirs.son;
  const fatherLabel = t.heirs.father;
  const motherLabel = t.heirs.mother;
  const gsLabel = t.heirs.grandson;
  const gfLabel = t.heirs.grandfather;
  const fbLabel = t.heirs.fullBrother;
  const pbLabel = t.heirs.paternalBrother;

  // Son Exclusions
  if (nSon > 0) {
    blocked.grandson = sonLabel;
    blocked.granddaughter = sonLabel;
    ['fullBrother', 'fullSister', 'paternalBrother', 'paternalSister', 'maternalBrother', 'maternalSister', 
     'nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = sonLabel);
  }

  // Grandson Exclusions
  if (nGrandson > 0 && !blocked.grandson) {
    ['fullBrother', 'fullSister', 'paternalBrother', 'paternalSister', 'maternalBrother', 'maternalSister', 
     'nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = gsLabel);
  }

  // Father Exclusions
  if (nFather > 0) {
    blocked.grandfather = fatherLabel;
    blocked.paternalGrandmother = fatherLabel;
    ['fullBrother', 'fullSister', 'paternalBrother', 'paternalSister', 'maternalBrother', 'maternalSister', 
     'nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = fatherLabel);
  }

  // Grandfather Exclusions
  if (nGrandfather > 0 && !blocked.grandfather) {
    blocked.maternalBrother = gfLabel;
    blocked.maternalSister = gfLabel;
    if (school === FiqhSchool.Hanafi) {
      ['fullBrother', 'fullSister', 'paternalBrother', 'paternalSister'].forEach(k => blocked[k as HeirKey] = gfLabel);
    }
    ['nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = gfLabel);
  }

  // Mother Exclusions
  if (nMother > 0) {
    blocked.paternalGrandmother = motherLabel;
    blocked.maternalGrandmother = motherLabel;
  }

  // Descendants exclude maternal siblings
  if (hasDescendant) {
    const descLabel = t.deceasedLabel;
    blocked.maternalBrother = descLabel;
    blocked.maternalSister = descLabel;
  }

  // Full Brother Exclusions
  if (nFullBro > 0 && !blocked.fullBrother) {
    ['paternalBrother', 'paternalSister', 'nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = fbLabel);
  }

  // Full Sister residuary logic
  if (!blocked.fullSister && nFullSis > 0 && nDaughter > 0 && nSon === 0 && nFather === 0) {
    const fsLabel = t.heirs.fullSister;
    ['paternalBrother', 'paternalSister', 'nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = fsLabel);
  }

  // Paternal Brother Exclusions
  if (nPatBro > 0 && !blocked.paternalBrother) {
    ['nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = pbLabel);
  }

  // Lower Branch Exclusions
  if (activeHeirs.nephewFull > 0 && !blocked.nephewFull) {
    const label = t.heirs.nephewFull;
    ['nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }
  if (activeHeirs.nephewPaternal > 0 && !blocked.nephewPaternal) {
    const label = t.heirs.nephewPaternal;
    ['uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }
  if (activeHeirs.uncleFull > 0 && !blocked.uncleFull) {
    const label = t.heirs.uncleFull;
    ['unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }
  if (activeHeirs.unclePaternal > 0 && !blocked.unclePaternal) {
    const label = t.heirs.unclePaternal;
    ['cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }

  // --- SHARE CALCULATION ---
  let shares: Partial<Record<HeirKey, number>> = {};
  const catMap: Partial<Record<HeirKey, 'Sharer' | 'Residuary' | 'Treasury'>> = {};
  let totalF = 0;

  // Husband/Wife
  if (activeHeirs.husband > 0) {
    shares.husband = hasDescendant ? 1/4 : 1/2;
    catMap.husband = 'Sharer';
    totalF += shares.husband;
  }
  if (activeHeirs.wife > 0) {
    shares.wife = hasDescendant ? 1/8 : 1/4;
    catMap.wife = 'Sharer';
    totalF += shares.wife;
  }

  // Parents
  if (nMother > 0 && !blocked.mother) {
    shares.mother = (hasDescendant || sibCount >= 2) ? 1/6 : 1/3;
    const isUmariyyatain = (activeHeirs.husband > 0 || activeHeirs.wife > 0) && nFather > 0 && nMother > 0 && !hasDescendant && sibCount === 0;
    if (isUmariyyatain) {
       const rem = 1 - (shares.husband || shares.wife || 0);
       shares.mother = rem / 3;
    }
    catMap.mother = 'Sharer';
    totalF += shares.mother;
  }
  if (nFather > 0 && !blocked.father && hasMaleDescendant) {
    shares.father = 1/6;
    catMap.father = 'Sharer';
    totalF += 1/6;
  }

  // Fixed shares for females if no male equivalents
  if (nDaughter > 0 && nSon === 0) {
    shares.daughter = nDaughter === 1 ? 1/2 : 2/3;
    catMap.daughter = 'Sharer';
    totalF += shares.daughter;
  }

  if (!blocked.maternalBrother && nMatBro > 0) {
    shares.maternalBrother = (nMatBro + nMatSis === 1) ? 1/6 : 1/3;
    catMap.maternalBrother = 'Sharer';
    totalF += shares.maternalBrother;
  }
  if (!blocked.maternalSister && nMatSis > 0) {
    shares.maternalSister = (nMatBro + nMatSis === 1) ? 1/6 : 1/3;
    catMap.maternalSister = 'Sharer';
    totalF += shares.maternalSister;
  }

  // Adjust for Awal
  if (totalF > 1) {
    const factor = totalF;
    Object.keys(shares).forEach(k => shares[k as HeirKey]! /= factor);
    totalF = 1;
  }

  // Residue logic
  let residue = 1 - totalF;
  if (residue > 1e-7) {
    const asaba: HeirKey[] = [];
    if (nSon > 0) { asaba.push('son'); if (nDaughter > 0) asaba.push('daughter'); }
    else if (nGrandson > 0 && !blocked.grandson) { asaba.push('grandson'); if (nGranddaughter > 0) asaba.push('granddaughter'); }
    else if (nFather > 0 && !blocked.father && !hasMaleDescendant) { asaba.push('father'); }
    else if (nGrandfather > 0 && !blocked.grandfather && !hasMaleDescendant) { asaba.push('grandfather'); }
    else if (nFullBro > 0 && !blocked.fullBrother) { asaba.push('fullBrother'); if (nFullSis > 0) asaba.push('fullSister'); }
    else if (nPatBro > 0 && !blocked.paternalBrother) { asaba.push('paternalBrother'); if (nPatSis > 0) asaba.push('paternalSister'); }

    if (asaba.length > 0) {
      let totalW = 0;
      asaba.forEach(k => {
        const gen = ALL_HEIRS.find(h => h.id === k)?.gender === 'M' ? 2 : 1;
        totalW += gen * (activeHeirs[k] || 1);
      });
      asaba.forEach(k => {
        const gen = ALL_HEIRS.find(h => h.id === k)?.gender === 'M' ? 2 : 1;
        const s = (residue * gen * (activeHeirs[k] || 1)) / totalW;
        shares[k] = (shares[k] || 0) + s;
        catMap[k] = 'Residuary';
      });
      residue = 0;
    }
  }

  // BUILD FINAL LIST
  ALL_HEIRS.forEach(def => {
    const count = activeHeirs[def.id] || 0;
    const isBlk = !!blocked[def.id];
    if (count > 0 || isBlk) {
      const s = shares[def.id] || 0;
      results.push({
        heirId: def.id,
        heirName: t.heirs[def.id],
        count,
        shareFraction: formatFraction(s),
        sharePercentage: s * 100,
        shareAmount: s * netEstate,
        shareAmountPerHeir: count > 0 ? (s * netEstate) / count : 0,
        sharePercentagePerHeir: count > 0 ? (s * 100) / count : 0,
        isBlocked: isBlk,
        blockedBy: blocked[def.id],
        explanation: constructExplanation(def.id, isBlk, s > 0, catMap[def.id], hasDescendant, count, nSon, nFather, sibCount, t),
        quranReference: getQuranRef(def.id),
        heirType: isBlk ? 'Blocked' : (catMap[def.id] || 'Sharer') as any
      });
    }
  });

  if (residue > 1e-7 && netEstate > 0) {
    results.push({
      heirId: 'governmentTreasury',
      heirName: t.heirs.governmentTreasury,
      count: 1,
      shareFraction: formatFraction(residue),
      sharePercentage: residue * 100,
      shareAmount: residue * netEstate,
      shareAmountPerHeir: residue * netEstate,
      sharePercentagePerHeir: residue * 100,
      isBlocked: false,
      explanation: t.exp_treasury,
      heirType: 'Treasury'
    });
  }

  return results;
};

const formatFraction = (v: number) => {
  if (v < 1e-6) return '0';
  const dens = [2, 3, 4, 6, 8, 12, 13, 15, 17, 24, 27, 32, 48];
  for (const d of dens) {
    const n = Math.round(v * d);
    if (Math.abs(v - n / d) < 1e-3) return `${n}/${d}`;
  }
  return v.toFixed(3);
};

const constructExplanation = (id: string, isBlocked: boolean, hasShare: boolean, type: string | undefined, hasDesc: boolean, count: number, nSon: number, nFather: number, sibCount: number, t: any): string => {
  if (isBlocked) return `${t.exp_blocked}`;
  if (!hasShare) return t.exp_no_share;

  if (type === 'Residuary') {
    if (id === 'son') return "Acts as Asaba (Residuary); takes all remaining wealth after sharers (2:1 ratio with sisters).";
    if (id === 'daughter') return "Takes residue as Asaba because a Son is present (2:1 ratio).";
    if (id === 'father') return "Takes residue as Asaba because there are no male descendants.";
    if (id === 'fullBrother') return "Takes residue as Asaba because there are no male descendants or father.";
    return "Acts as Asaba (Residuary) taking the remaining balance.";
  }

  switch (id) {
    case 'husband': return hasDesc ? t.exp_husband_2 : t.exp_husband_1;
    case 'wife': return hasDesc ? t.exp_wife_2 : t.exp_wife_1;
    case 'mother': return (hasDesc || sibCount >= 2) ? t.exp_mother_1 : t.exp_mother_2;
    case 'father': return "Gets 1/6 as a fixed share because male descendants exist.";
    case 'daughter': return count === 1 ? t.exp_daughter_1 : t.exp_daughter_2;
    default: return t.exp_general;
  }
};

const getQuranRef = (id: string) => {
  const rs: any = { son: '4:11', daughter: '4:11', father: '4:11', mother: '4:11', husband: '4:12', wife: '4:12', maternalBrother: '4:12', maternalSister: '4:12', fullSister: '4:176' };
  return rs[id] || '';
};