
export enum FiqhSchool {
  Hanafi = 'Hanafi',
  Shafi = 'Shafi',
  Maliki = 'Maliki',
  Hanbali = 'Hanbali',
  General = 'General'
}

export enum DeceasedGender {
  Male = 'Male',
  Female = 'Female'
}

export type HeirKey = 
  | 'son' | 'grandson' | 'father' | 'grandfather' 
  | 'fullBrother' | 'paternalBrother' | 'maternalBrother'
  | 'nephewFull' | 'nephewPaternal' 
  | 'uncleFull' | 'unclePaternal'
  | 'cousinFull' | 'cousinPaternal'
  | 'husband' | 'freedSlaveMale'
  | 'daughter' | 'granddaughter' | 'mother'
  | 'paternalGrandmother' | 'maternalGrandmother'
  | 'fullSister' | 'paternalSister' | 'maternalSister'
  | 'wife' | 'freedSlaveFemale'
  | 'governmentTreasury';

export interface HeirDefinition {
  id: HeirKey;
  nameEn: string;
  nameAr: string;
  gender: 'M' | 'F' | 'N';
}

export interface CalculationResult {
  heirId: HeirKey;
  heirName: string;
  count: number;
  shareFraction: string;
  sharePercentage: number;
  shareAmount: number;
  shareAmountPerHeir: number;
  sharePercentagePerHeir: number;
  isBlocked: boolean;
  blockedBy?: string;
  explanation: string;
  quranReference?: string;
  heirType: 'Sharer' | 'Residuary' | 'Blocked' | 'Treasury';
  fiqhNote?: string;
}

export interface InheritanceState {
  totalEstate: number;
  funeralExpenses: number;
  debts: number;
  wasiyyat: number;
  currency: string;
  deceasedGender: DeceasedGender;
  school: FiqhSchool;
  language: string;
  heirs: Record<HeirKey, number>;
}
