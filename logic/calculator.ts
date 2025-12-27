
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
  const hasGrandfather = (activeHeirs.grandfather || 0) > 0;
  const hasMother = (activeHeirs.mother || 0) > 0;
  
  const sibCount = (activeHeirs.fullBrother || 0) + (activeHeirs.fullSister || 0) +
                   (activeHeirs.paternalBrother || 0) + (activeHeirs.paternalSister || 0) +
                   (activeHeirs.maternalBrother || 0) + (activeHeirs.maternalSister || 0);

  const blocked: Partial<Record<HeirKey, string>> = {};

  if (hasFather) {
    blocked.grandfather = 'Father';
    blocked.paternalGrandmother = 'Father';
    blocked.fullBrother = 'Father';
    blocked.fullSister = 'Father';
    blocked.paternalBrother = 'Father';
    blocked.paternalSister = 'Father';
    blocked.maternalBrother = 'Father';
    blocked.maternalSister = 'Father';
  }
  if (hasMother) {
    blocked.paternalGrandmother = 'Mother';
    blocked.maternalGrandmother = 'Mother';
  }
  
  if (hasSon) {
    blocked.grandson = 'Son';
    blocked.granddaughter = 'Son';
    blocked.fullBrother = 'Son';
    blocked.fullSister = 'Son';
    blocked.paternalBrother = 'Son';
    blocked.paternalSister = 'Son';
    blocked.maternalBrother = 'Son';
    blocked.maternalSister = 'Son';
  } else if (hasGrandson) {
    blocked.maternalBrother = 'Grandson';
    blocked.maternalSister = 'Grandson';
    blocked.fullBrother = 'Grandson';
    blocked.fullSister = 'Grandson';
    blocked.paternalBrother = 'Grandson';
    blocked.paternalSister = 'Grandson';
  }

  if (hasDaughter || hasGranddaughter) {
    blocked.maternalBrother = 'Direct Descendant';
    blocked.maternalSister = 'Direct Descendant';
  }

  if (hasGrandfather && !hasFather) {
    if (school === FiqhSchool.Hanafi) {
      blocked.fullBrother = 'Grandfather (Hanafi School)';
      blocked.fullSister = 'Grandfather (Hanafi School)';
      blocked.paternalBrother = 'Grandfather (Hanafi School)';
      blocked.paternalSister = 'Grandfather (Hanafi School)';
    } else {
      blocked.maternalBrother = 'Grandfather';
      blocked.maternalSister = 'Grandfather';
    }
  }

  const hasAnyBrother = (activeHeirs.fullBrother || 0) > 0 || (activeHeirs.paternalBrother || 0) > 0;
  if (hasAnyBrother || hasMaleDescendant || hasFather || (hasGrandfather && school === FiqhSchool.Hanafi)) {
    blocked.nephewFull = 'Closer Male Relative';
    blocked.nephewPaternal = 'Closer Male Relative';
    blocked.uncleFull = 'Closer Male Relative';
    blocked.unclePaternal = 'Closer Male Relative';
    blocked.cousinFull = 'Closer Male Relative';
    blocked.cousinPaternal = 'Closer Male Relative';
  }

  let shares: Partial<Record<HeirKey, number>> = {};
  const categoryMap: Partial<Record<HeirKey, 'Sharer' | 'Residuary' | 'Treasury'>> = {};
  let totalFurud = 0;

  if (activeHeirs.husband > 0 && !blocked.husband) {
    shares.husband = hasDescendant ? 1/4 : 1/2;
    categoryMap.husband = 'Sharer';
    totalFurud += shares.husband;
  }
  if (activeHeirs.wife > 0 && !blocked.wife) {
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
    if (!hasDescendant && sibCount === 0 && hasFather) {
       if (activeHeirs.husband > 0 || activeHeirs.wife > 0) {
          const spouseShare = shares.husband || shares.wife || 0;
          shares.mother = (1 - spouseShare) / 3;
       }
    }
    categoryMap.mother = 'Sharer';
    totalFurud += shares.mother;
  }

  if (hasDaughter && !hasSon) {
    shares.daughter = activeHeirs.daughter === 1 ? 1/2 : 2/3;
    categoryMap.daughter = 'Sharer';
    totalFurud += shares.daughter;
  }
  if (hasGranddaughter && !hasSon && !hasGrandson) {
    if (!hasDaughter) {
      shares.granddaughter = activeHeirs.granddaughter === 1 ? 1/2 : 2/3;
      totalFurud += shares.granddaughter;
    } else if (activeHeirs.daughter === 1) {
      shares.granddaughter = 1/6;
      totalFurud += 1/6;
    }
    categoryMap.granddaughter = 'Sharer';
  }

  if (activeHeirs.maternalBrother + activeHeirs.maternalSister > 0 && !blocked.maternalBrother) {
    const totalMaternals = activeHeirs.maternalBrother + activeHeirs.maternalSister;
    const s = totalMaternals === 1 ? 1/6 : 1/3;
    shares.maternalBrother = (activeHeirs.maternalBrother / totalMaternals) * s;
    shares.maternalSister = (activeHeirs.maternalSister / totalMaternals) * s;
    totalFurud += s;
  }

  let isMushtaraka = false;
  if ((school === FiqhSchool.Shafi || school === FiqhSchool.Maliki) &&
      activeHeirs.husband > 0 && hasMother && 
      (activeHeirs.maternalBrother + activeHeirs.maternalSister >= 2) &&
      (activeHeirs.fullBrother > 0) && !hasDescendant && !hasFather) {
      isMushtaraka = true;
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
    } else if (hasGrandson) {
      asabaList.push('grandson');
      if (hasGranddaughter) asabaList.push('granddaughter');
    } else if (hasFather) {
      asabaList.push('father'); 
    } else if (hasGrandfather && !blocked.grandfather) {
      if (school !== FiqhSchool.Hanafi && (activeHeirs.fullBrother + activeHeirs.fullSister + activeHeirs.paternalBrother + activeHeirs.paternalSister > 0)) {
         asabaList.push('grandfather');
         if (activeHeirs.fullBrother > 0) asabaList.push('fullBrother');
         if (activeHeirs.fullSister > 0) asabaList.push('fullSister');
         if (activeHeirs.paternalBrother > 0 && activeHeirs.fullBrother === 0) asabaList.push('paternalBrother');
         if (activeHeirs.paternalSister > 0 && activeHeirs.fullBrother === 0) asabaList.push('paternalSister');
      } else {
         asabaList.push('grandfather');
      }
    } else if (activeHeirs.fullBrother > 0) {
      asabaList.push('fullBrother');
      if (activeHeirs.fullSister > 0) asabaList.push('fullSister');
    } else if (activeHeirs.fullSister > 0 && (hasDaughter || hasGranddaughter)) {
      asabaList.push('fullSister');
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

  if (residue > 1e-6) {
    const raddRecipients = Object.keys(shares).filter(k => k !== 'husband' && k !== 'wife');
    if (raddRecipients.length > 0) {
      const raddTotal = raddRecipients.reduce((sum, k) => sum + (shares[k as HeirKey] || 0), 0);
      raddRecipients.forEach(k => {
        shares[k as HeirKey]! += (shares[k as HeirKey]! / raddTotal) * residue;
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
        heirName: `${t.heirs?.[def.id] || def.nameEn} (${def.nameAr})`,
        count,
        shareFraction: formatFraction(share),
        sharePercentage: share * 100,
        shareAmount: share * netEstate,
        shareAmountPerHeir: count > 0 ? (share * netEstate) / count : 0,
        sharePercentagePerHeir: count > 0 ? (share * 100) / count : 0,
        isBlocked: isHeirBlocked,
        blockedBy: blocked[def.id],
        explanation: getDetailedExplanation(def.id, isHeirBlocked, blocked[def.id], share > 0, categoryMap[def.id], school, isMushtaraka),
        quranReference: getQuranRef(def.id),
        heirType: isHeirBlocked ? 'Blocked' : (categoryMap[def.id] as any || 'Sharer'),
        fiqhNote: getFiqhNote(def.id, school, activeHeirs)
      });
    }
  });

  const totalDistributed = results.reduce((sum, r) => sum + r.sharePercentage, 0);
  
  if (totalDistributed < 99.9 && netEstate > 0) {
    const remainingShare = 100 - totalDistributed;
    const remainingRatio = remainingShare / 100;

    results.push({
      heirId: 'governmentTreasury',
      heirName: t.heirs?.governmentTreasury || 'Government Treasury (Bait-ul-Maal)',
      count: 1,
      shareFraction: formatFraction(remainingRatio),
      sharePercentage: remainingShare,
      shareAmount: remainingRatio * netEstate,
      shareAmountPerHeir: remainingRatio * netEstate,
      sharePercentagePerHeir: remainingShare,
      isBlocked: false,
      explanation: getTreasuryExplanation(school),
      heirType: 'Treasury'
    });
  }

  return results;
};

const formatFraction = (val: number): string => {
  if (val < 1e-6) return '0';
  if (val > 0.999) return '1/1';
  const denominators = [2, 3, 4, 6, 8, 12, 13, 15, 17, 24, 27, 32, 48];
  for (const d of denominators) {
    const n = Math.round(val * d);
    if (Math.abs(val - n / d) < 1e-3) return `${n}/${d}`;
  }
  return val.toFixed(3);
};

const getDetailedExplanation = (id: HeirKey, isBlocked: boolean, blockedBy: string | undefined, hasShare: boolean, type: string | undefined, school: FiqhSchool, isMushtaraka: boolean): string => {
  if (isBlocked) return `Excluded (Hajb) due to the presence of: ${blockedBy}.`;
  if (!hasShare) return `Received no share as the estate was fully distributed to higher priority heirs.`;
  if (isMushtaraka && id === 'fullBrother') return "Case of Al-Mushtaraka: Full Brother shares the 1/3 with maternal siblings (Shafi'i/Maliki view).";

  const base: Partial<Record<HeirKey, string>> = {
    husband: "Primary Sharer: 1/2 if no descendants, 1/4 if descendants exist.",
    wife: "Primary Sharer: 1/4 if no descendants, 1/8 if descendants exist.",
    son: "Residuary (Asaba): Takes the remaining estate after sharers, 2:1 ratio with daughters.",
    daughter: type === 'Residuary' ? "Residuary (Asaba Bil-Ghayr): Inherits with her brother(s) at 1:2 ratio." : "Sharer: 1/2 if alone, 2/3 if multiple (no brothers).",
    father: type === 'Residuary' ? "Residuary: Takes remaining estate since no male descendant exists." : "Sharer: Fixed 1/6 because male descendants exist.",
    mother: "Sharer: 1/6 due to descendants or multiple siblings, otherwise 1/3.",
    grandfather: school === FiqhSchool.Hanafi ? "Acts like the Father in his absence." : "Shares with full/paternal siblings in the majority view.",
  };

  return base[id] || `Receives share according to ${school} Fiqh rules for ${id}.`;
};

const getTreasuryExplanation = (school: FiqhSchool): string => {
  const schoolNotes: Record<string, string> = {
    [FiqhSchool.Hanafi]: "The estate goes to the Bait-ul-Maal (Treasury) as the ultimate fallback. In Hanafi Fiqh, this occurs only if no Sharers, Residuaries, or Distant Kindred (Dhawu al-Arham) exist.",
    [FiqhSchool.Shafi]: "Classical Shafi'i view transfers assets to the Bait-ul-Maal if no heirs are present. Later scholars preferred 'Radd' to relatives if the Treasury is not managed according to Sharia.",
    [FiqhSchool.Maliki]: "In the Maliki school, the Bait-ul-Maal is considered the final heir for agnatic relatives in the absence of other inheritors.",
    [FiqhSchool.Hanbali]: "The estate goes to the Bait-ul-Maal as a final resort after exhausting all possible relatives including distant kindred.",
    [FiqhSchool.General]: "No eligible heirs were found. The remaining estate is transferred to the Government Treasury (Bait-ul-Maal) as per Islamic Law."
  };
  return schoolNotes[school] || schoolNotes[FiqhSchool.General];
};

const getFiqhNote = (id: HeirKey, school: FiqhSchool, activeHeirs: Record<HeirKey, number>): string | undefined => {
  if (id === 'grandfather' && school !== FiqhSchool.Hanafi) {
      return `Majority view (${school}): Grandfather shares with siblings rather than blocking them.`;
  }
  if (id === 'fullBrother' && school === FiqhSchool.Hanafi && activeHeirs.grandfather > 0) {
      return "Hanafi school: Grandfather blocks all siblings.";
  }
  return undefined;
};

const getQuranRef = (id: HeirKey): string => {
  const refs: Partial<Record<HeirKey, string>> = {
    son: '4:11', daughter: '4:11', father: '4:11', mother: '4:11',
    husband: '4:12', wife: '4:12', maternalBrother: '4:12', maternalSister: '4:12',
    fullSister: '4:176', paternalSister: '4:176'
  };
  return refs[id] || 'Sunnah/Ijma';
};
