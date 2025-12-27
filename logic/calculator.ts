
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

  // Son excludes...
  if (nSon > 0) {
    const label = t.heirs.son;
    blocked.grandson = label;
    blocked.granddaughter = label;
    ['fullBrother', 'fullSister', 'paternalBrother', 'paternalSister', 'maternalBrother', 'maternalSister', 
     'nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }

  // Grandson excludes...
  if (nGrandson > 0 && !blocked.grandson) {
    const label = t.heirs.grandson;
    ['fullBrother', 'fullSister', 'paternalBrother', 'paternalSister', 'maternalBrother', 'maternalSister', 
     'nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }

  // Father excludes...
  if (nFather > 0) {
    const label = t.heirs.father;
    blocked.grandfather = label;
    blocked.paternalGrandmother = label;
    ['fullBrother', 'fullSister', 'paternalBrother', 'paternalSister', 'maternalBrother', 'maternalSister', 
     'nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }

  // Grandfather excludes...
  if (nGrandfather > 0 && !blocked.grandfather) {
    const label = t.heirs.grandfather;
    blocked.maternalBrother = label;
    blocked.maternalSister = label;
    // Hanafi difference
    if (school === FiqhSchool.Hanafi) {
      ['fullBrother', 'fullSister', 'paternalBrother', 'paternalSister'].forEach(k => blocked[k as HeirKey] = label);
    }
    // All schools: Grandfather blocks nephews and below
    ['nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }

  // Mother excludes...
  if (nMother > 0) {
    const label = t.heirs.mother;
    blocked.paternalGrandmother = label;
    blocked.maternalGrandmother = label;
  }

  // Any descendant excludes maternal siblings
  if (hasDescendant) {
    const label = t.deceasedLabel; // Generic "Descendants exist"
    blocked.maternalBrother = label;
    blocked.maternalSister = label;
  }

  // Full Brother excludes...
  if (nFullBro > 0 && !blocked.fullBrother) {
    const label = t.heirs.fullBrother;
    ['paternalBrother', 'paternalSister', 'nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }

  // Full Sister (as Residuary with Daughter) excludes...
  if (!blocked.fullSister && nFullSis > 0 && nDaughter > 0 && nSon === 0 && nFather === 0) {
    const label = t.heirs.fullSister;
    ['paternalBrother', 'paternalSister', 'nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }

  // Paternal Brother excludes...
  if (nPatBro > 0 && !blocked.paternalBrother) {
    const label = t.heirs.paternalBrother;
    ['nephewFull', 'nephewPaternal', 'uncleFull', 'unclePaternal', 'cousinFull', 'cousinPaternal'].forEach(k => blocked[k as HeirKey] = label);
  }

  // Nephews and beyond...
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

  // --- SHARE CALCULATION (FURUD) ---
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
    // Umariyyatain rule (Special Case for Shafi'i/Hanafi/etc)
    const isUmariyyatain = (activeHeirs.husband > 0 || activeHeirs.wife > 0) && nFather > 0 && nMother > 0 && !hasDescendant && sibCount === 0;
    if (isUmariyyatain) {
       // Mother gets 1/3 of remainder
       const rem = 1 - (shares.husband || shares.wife || 0);
       shares.mother = rem / 3;
    }
    catMap.mother = 'Sharer';
    totalF += shares.mother;
  }
  if (nFather > 0 && !blocked.father) {
    if (hasMaleDescendant) {
      shares.father = 1/6;
      catMap.father = 'Sharer';
      totalF += 1/6;
    }
  }

  // Daughters
  if (nDaughter > 0 && nSon === 0) {
    shares.daughter = nDaughter === 1 ? 1/2 : 2/3;
    catMap.daughter = 'Sharer';
    totalF += shares.daughter;
  }

  // Maternal Siblings
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

  // AWAL / RADD ADJUSTMENT
  if (totalF > 1) {
    const factor = totalF;
    Object.keys(shares).forEach(k => shares[k as HeirKey]! /= factor);
    totalF = 1;
  }

  // ASABA (RESIDUE)
  let residue = 1 - totalF;
  if (residue > 1e-7) {
    const asaba: HeirKey[] = [];
    if (nSon > 0) { asaba.push('son'); if (nDaughter > 0) asaba.push('daughter'); }
    else if (nGrandson > 0 && !blocked.grandson) { asaba.push('grandson'); if (nGranddaughter > 0) asaba.push('granddaughter'); }
    else if (nFather > 0 && !blocked.father && !hasMaleDescendant) { asaba.push('father'); }
    else if (nGrandfather > 0 && !blocked.grandfather && !hasMaleDescendant) { 
      // Non-Hanafi: Grandfather shares with siblings (simplified logic here)
      if (school !== FiqhSchool.Hanafi && (nFullBro > 0 || nFullSis > 0)) {
         asaba.push('grandfather', 'fullBrother'); if (nFullSis > 0) asaba.push('fullSister');
      } else {
         asaba.push('grandfather');
      }
    }
    else if (nFullBro > 0 && !blocked.fullBrother) { asaba.push('fullBrother'); if (nFullSis > 0) asaba.push('fullSister'); }
    else if (nFullSis > 0 && !blocked.fullSister && nDaughter > 0) { asaba.push('fullSister'); } // Sis with Daughter
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

  // BUILD RESULTS
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
        explanation: getExplanation(def.id, isBlk, s > 0, catMap[def.id], hasDescendant, count, t),
        quranReference: getQuranRef(def.id),
        heirType: isBlk ? 'Blocked' : (catMap[def.id] || 'Sharer') as any
      });
    }
  });

  // Treasury if residue remains
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

const getExplanation = (id: string, blk: boolean, hasS: boolean, type: any, hasD: boolean, c: number, t: any) => {
  if (blk) return t.exp_blocked;
  if (!hasS) return t.exp_no_share;
  if (id === 'son') return t.exp_son;
  if (id === 'daughter') return type === 'Residuary' ? t.exp_daughter_3 : (c === 1 ? t.exp_daughter_1 : t.exp_daughter_2);
  return t.exp_general;
};

const getQuranRef = (id: string) => {
  const rs: any = { son: '4:11', daughter: '4:11', father: '4:11', mother: '4:11', husband: '4:12', wife: '4:12' };
  return rs[id] || '';
};
