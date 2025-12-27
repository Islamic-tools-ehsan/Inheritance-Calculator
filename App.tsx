
import React, { useState, useMemo, useEffect } from 'react';
import { 
  InheritanceState, 
  DeceasedGender, 
  FiqhSchool, 
  HeirKey 
} from './types';
import { 
  CURRENCIES, 
  LANGUAGES, 
  MALE_HEIRS, 
  FEMALE_HEIRS, 
  i18nStrings 
} from './constants';
import { calculateInheritance } from './logic/calculator';
import { FamilyTree } from './FamilyTree';
import { ResultExplanations } from './ResultExplanations';
import { 
  Calculator, Users, Globe, Landmark, 
  ArrowRight, RotateCcw, Printer, 
  Info, Network, Coins, MinusCircle, AlertTriangle, X, RefreshCw
} from 'lucide-react';

const HEIR_LIMITS: Record<string, number> = {
  husband: 1,
  wife: 4,
  father: 1,
  mother: 1,
  grandfather: 1,
  paternalGrandmother: 1,
  maternalGrandmother: 1
};

const App: React.FC = () => {
  const [state, setState] = useState<InheritanceState>({
    totalEstate: 0, 
    funeralExpenses: 0,
    debts: 0,
    wasiyyat: 0,
    currency: 'USD',
    deceasedGender: DeceasedGender.Male,
    school: FiqhSchool.Hanafi,
    language: 'en',
    heirs: {} as Record<HeirKey, number>
  });
  
  const [isCalculated, setIsCalculated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = i18nStrings[state.language] || i18nStrings.en;

  const results = useMemo(() => {
    return calculateInheritance(state);
  }, [state]);

  const blockedHeirIds = useMemo(() => {
    return new Set(results.filter(r => r.isBlocked).map(r => r.heirId));
  }, [results]);

  const hasSelectedHeirs = useMemo(() => {
    return (Object.values(state.heirs) as number[]).some(count => count > 0);
  }, [state.heirs]);

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const resetAll = () => {
    setState({
      totalEstate: 0,
      funeralExpenses: 0,
      debts: 0,
      wasiyyat: 0,
      currency: state.currency,
      deceasedGender: state.deceasedGender,
      school: state.school,
      language: state.language,
      heirs: {} as Record<HeirKey, number>
    });
    setIsCalculated(false);
    setErrorMessage(null);
  };

  const handleHeirChange = (key: HeirKey, value: number) => {
    const max = HEIR_LIMITS[key] || 10;
    if (value > max) {
      triggerError(`Maximum limit for ${t.heirs?.[key] || key} is ${max}.`);
      return;
    }
    const val = Math.max(0, value);
    
    setState(prev => {
      const newHeirs = { ...prev.heirs, [key]: val };
      const currentlyHasHeirs = (Object.values(newHeirs) as number[]).some(c => c > 0);
      
      // Fiqh Rule: If an heir is added, check if Wasiyyat exceeds 1/3 (unless Hanafi with no heirs)
      let updatedWasiyyat = prev.wasiyyat;
      if (currentlyHasHeirs && prev.wasiyyat > prev.totalEstate / 3) {
        updatedWasiyyat = 0;
        triggerError("Wasiyyat reset to 0 because heirs are present (limit is 1/3).");
      }

      return {
        ...prev,
        heirs: newHeirs,
        wasiyyat: updatedWasiyyat
      };
    });
    setIsCalculated(false);
  };

  const handleNumericInput = (field: keyof InheritanceState, value: number) => {
    if (value < 0) return;

    // Requirement: If principal amount is cleared or zero, reset all fields
    if (field === 'totalEstate' && (value === 0 || isNaN(value))) {
      resetAll();
      return;
    }

    if (field === 'wasiyyat') {
      const isHanafi = state.school === FiqhSchool.Hanafi;
      // Special Fiqh Case: Hanafi allows up to 100% if NO heirs are selected.
      const limitFactor = (isHanafi && !hasSelectedHeirs) ? 1 : (1/3);
      const maxWasiyyat = state.totalEstate * limitFactor;

      if (value > maxWasiyyat) {
        const limitLabel = limitFactor === 1 ? "100%" : "1/3";
        triggerError(`Wasiyyat cannot exceed ${limitLabel} of estate (${maxWasiyyat.toLocaleString()} ${state.currency}).`);
        return;
      }
    }

    setState(prev => ({ ...prev, [field]: value }));
    setIsCalculated(false);
  };

  const handlePrint = () => window.print();

  const getHeirLabel = (h: any) => {
    const translatedName = t.heirs?.[h.id] || h.nameEn;
    const limit = HEIR_LIMITS[h.id] ? `(0-${HEIR_LIMITS[h.id]})` : '';
    return `${translatedName} ${limit}`;
  };

  const currentCurrencySymbol = CURRENCIES.find(c => c.code === state.currency)?.symbol || '$';

  const renderHeirInput = (h: any) => {
    const count = state.heirs[h.id] || 0;
    const isFilled = count > 0;
    const isBlocked = blockedHeirIds.has(h.id);
    const blocker = results.find(r => r.heirId === h.id)?.blockedBy;

    let containerClass = "p-4 md:p-5 rounded-[2rem] border-4 transition-all group ";
    let labelClass = "block text-[10px] font-black uppercase mb-2 md:mb-3 leading-tight ";
    let inputClass = "w-full border-none rounded-xl text-lg md:text-2xl font-black py-2 md:py-3 px-3 md:px-5 outline-none transition-all shadow-inner ";

    if (isBlocked) {
      containerClass += "bg-red-50 border-red-500 shadow-lg shadow-red-100 scale-[0.98]";
      labelClass += "text-red-700";
      inputClass += "bg-white text-red-800 focus:ring-2 focus:ring-red-500 opacity-50 cursor-not-allowed";
    } else if (isFilled) {
      containerClass += "bg-green-50 border-green-500 shadow-lg shadow-green-100";
      labelClass += "text-green-700";
      inputClass += "bg-white text-green-700";
    } else {
      containerClass += "bg-slate-50 border-slate-50 hover:border-orange-200";
      labelClass += "text-slate-500";
      inputClass += "bg-white text-slate-800 focus:ring-2 focus:ring-orange-500";
    }

    return (
      <div key={h.id} className={containerClass}>
        <label className={labelClass}>
          {getHeirLabel(h)}
          {isBlocked && blocker && <span className="block text-[8px] mt-1 font-black">({t.blockedBy} {blocker})</span>}
        </label>
        <input 
          type="number" 
          min="0" 
          value={count || ''}
          placeholder="0"
          disabled={isBlocked}
          onChange={(e) => handleHeirChange(h.id, Number(e.target.value))}
          className={inputClass}
        />
      </div>
    );
  };

  const renderDeductionInput = (label: string, value: number, field: 'funeralExpenses' | 'debts' | 'wasiyyat', subLabel?: string) => {
    const isFilled = value > 0;
    const isWasiyyat = field === 'wasiyyat';
    const isHanafiNoHeirs = isWasiyyat && state.school === FiqhSchool.Hanafi && !hasSelectedHeirs;
    
    return (
      <div className="flex-1">
        <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest leading-relaxed">
          {label} {isWasiyyat && isHanafiNoHeirs && (
            <span className="text-emerald-500 ml-1">(Up to 100%)</span>
          )}
        </label>
        <div className="relative">
          <input 
            type="number" 
            value={value || ''} 
            placeholder="0"
            onChange={(e) => handleNumericInput(field, Number(e.target.value))}
            className={`w-full border-4 rounded-[1.5rem] py-3 md:py-4 px-4 md:px-6 font-black text-lg md:text-xl outline-none transition-all placeholder-slate-300 shadow-inner ${isFilled ? 'bg-green-50 border-green-500 text-green-700' : 'bg-slate-50 border-slate-100 focus:border-red-500'}`}
          />
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 font-black text-sm opacity-60 pointer-events-none ${isFilled ? 'text-green-500' : 'text-slate-400'}`}>
            {currentCurrencySymbol}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 bg-slate-50 text-slate-900 font-black">
      {errorMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 duration-300 w-full max-w-md px-4">
          <div className="bg-red-600 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between gap-4 border-4 border-red-400">
            <div className="flex items-center gap-3">
              <AlertTriangle className="shrink-0" />
              <p className="font-black text-sm md:text-base leading-tight">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage(null)} className="hover:bg-red-700 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <header className="max-w-7xl mx-auto py-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-4 rounded-3xl shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <Landmark className="text-white w-9 h-9" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter font-arabic leading-none">{t.title}</h1>
            <p className="text-orange-600 text-[10px] font-black uppercase tracking-[0.4em] mt-1.5">{t.subtitle}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:flex items-center gap-3 no-print w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
            <Coins size={18} className="text-orange-500 shrink-0" />
            <select 
              value={state.currency} 
              onChange={(e) => setState({...state, currency: e.target.value})}
              className="bg-transparent border-none text-[10px] md:text-sm font-black focus:ring-0 w-full cursor-pointer pr-4"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} className="font-sans">
                  {c.symbol} {c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
            <Globe size={18} className="text-blue-500 shrink-0" />
            <select 
              value={state.language} 
              onChange={(e) => setState({...state, language: e.target.value})}
              className="bg-transparent border-none text-[10px] md:text-sm font-black focus:ring-0 w-full cursor-pointer pr-4"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code} className="font-sans">{l.name}</option>)}
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-5 space-y-8 no-print">
          {/* Section 1: Summary / Asset Details */}
          <section className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
              <Calculator className="text-orange-600" size={28} />
              {t.summary}
            </h2>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">{t.distributionAmount}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={state.totalEstate || ''} 
                      placeholder="0"
                      onChange={(e) => handleNumericInput('totalEstate', Number(e.target.value))}
                      className={`w-full border-4 rounded-[2rem] py-4 md:py-6 px-4 md:px-8 font-black text-xl md:text-3xl outline-none transition-all placeholder-slate-300 shadow-inner ${state.totalEstate > 0 ? 'bg-green-50 border-green-500 text-green-700' : 'bg-slate-50 border-slate-100 focus:border-orange-500'}`}
                    />
                    <div className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 font-black text-sm md:text-2xl opacity-60 pointer-events-none ${state.totalEstate > 0 ? 'text-green-500' : 'text-slate-400'}`}>
                      {currentCurrencySymbol}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">{t.fiqhSchool}</label>
                  <select 
                    value={state.school} 
                    onChange={(e) => {
                      setState({...state, school: e.target.value as FiqhSchool});
                      setIsCalculated(false);
                    }}
                    className="w-full h-[60px] md:h-[92px] bg-slate-50 border-none rounded-[2rem] px-4 md:px-8 font-black text-xs md:text-lg focus:ring-4 focus:ring-orange-500 transition-all cursor-pointer"
                  >
                    {Object.values(FiqhSchool).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">{t.deceasedGender}</label>
                <div className="flex p-2 bg-slate-100 rounded-[2.5rem] border-2 border-slate-200">
                  <button 
                    onClick={() => {
                      setState({...state, deceasedGender: DeceasedGender.Male, heirs: {} as any});
                      setIsCalculated(false);
                    }}
                    className={`flex-1 py-3 md:py-5 text-sm md:text-lg font-black rounded-[2rem] transition-all ${state.deceasedGender === DeceasedGender.Male ? 'bg-orange-600 shadow-xl text-white scale-[1.03]' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {t.male}
                  </button>
                  <button 
                    onClick={() => {
                      setState({...state, deceasedGender: DeceasedGender.Female, heirs: {} as any});
                      setIsCalculated(false);
                    }}
                    className={`flex-1 py-3 md:py-5 text-sm md:text-lg font-black rounded-[2rem] transition-all ${state.deceasedGender === DeceasedGender.Female ? 'bg-orange-600 shadow-xl text-white scale-[1.03]' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {t.female}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Heirs Selection */}
          <section className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-2xl font-black mb-10 flex items-center gap-4">
              <Users className="text-orange-600" size={28} />
              {t.heirsSelection}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {(state.deceasedGender === DeceasedGender.Male ? FEMALE_HEIRS : MALE_HEIRS)
                .filter(h => h.id === 'husband' || h.id === 'wife')
                .map(renderHeirInput)}

              {[...MALE_HEIRS, ...FEMALE_HEIRS]
                .filter(h => h.id !== 'husband' && h.id !== 'wife' && h.id !== 'freedSlaveMale' && h.id !== 'freedSlaveFemale')
                .map(renderHeirInput)}
            </div>
          </section>

          {/* Section 3: Deductions (Placed below heirs) */}
          <section className="bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-4">
              <MinusCircle className="text-red-500" size={28} />
              {t.deductions}
            </h2>
            <div className="space-y-6">
              {renderDeductionInput(t.funeralExpenses, state.funeralExpenses, 'funeralExpenses')}
              {renderDeductionInput(t.debts, state.debts, 'debts')}
              {renderDeductionInput(t.wasiyyat, state.wasiyyat, 'wasiyyat')}
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 no-print">
            <button 
              onClick={() => setIsCalculated(true)}
              className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white font-black py-5 md:py-7 px-6 md:px-10 rounded-[2.5rem] shadow-2xl shadow-orange-500/30 transition-all flex items-center justify-center gap-3 group active:scale-95"
            >
              <span className="text-md md:text-xl">{t.calculate}</span>
              <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform" />
            </button>
            
            <button 
              onClick={resetAll}
              className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-black py-5 md:py-7 px-6 md:px-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/30 transition-all flex items-center justify-center gap-3 group active:scale-95"
            >
              <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-md md:text-lg">{t.recalculate}</span>
            </button>
          </div>
        </div>

        {/* Results Pane */}
        <div className="lg:col-span-7 space-y-10">
          {!isCalculated ? (
            <div className="bg-white border-8 border-dashed border-slate-200 rounded-[4rem] p-10 md:p-24 flex flex-col items-center text-center">
              <div className="bg-orange-50 p-10 rounded-full mb-10 shadow-inner">
                <Info size={80} className="text-orange-200" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 mb-4">{t.results}</h3>
              <p className="text-slate-400 max-w-sm text-lg font-bold leading-relaxed">{t.noHeirs}</p>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-500">
              <div className="bg-white p-6 md:p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black flex items-center gap-3">
                    <span className="w-2 h-8 bg-orange-600 rounded-full block"></span>
                    {t.results}
                  </h2>
                  <button onClick={handlePrint} className="p-4 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 rounded-2xl transition-all no-print shadow-sm">
                    <Printer size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="bg-gradient-to-br from-orange-600 to-orange-500 p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-orange-500/20 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="w-full md:w-auto">
                      <p className="text-[10px] font-black uppercase mb-2 tracking-widest opacity-80">{t.distributionAmount}</p>
                      <p className="text-5xl md:text-7xl font-black flex items-baseline gap-2">
                        {state.totalEstate.toLocaleString()}
                        <span className="text-2xl font-bold opacity-70">{state.currency}</span>
                      </p>
                      {(state.funeralExpenses > 0 || state.debts > 0 || state.wasiyyat > 0) && (
                        <div className="mt-6 space-y-1 bg-white/10 p-4 rounded-2xl">
                           <p className="text-xs font-bold opacity-80">Total Deductions: {(state.funeralExpenses + state.debts + state.wasiyyat).toLocaleString()} {state.currency}</p>
                           <p className="text-sm font-black">Net Estate for Distribution: {(state.totalEstate - (state.funeralExpenses + state.debts + state.wasiyyat)).toLocaleString()} {state.currency}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-sm text-center min-w-[120px]">
                        <p className="text-[10px] font-black uppercase opacity-70 mb-1">School</p>
                        <p className="text-xl font-black">{state.school}</p>
                      </div>
                      <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-sm text-center min-w-[120px]">
                        <p className="text-[10px] font-black uppercase opacity-70 mb-1">Gender</p>
                        <p className="text-xl font-black">{state.deceasedGender}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-10 rounded-[3.5rem] shadow-2xl border border-slate-100">
                <h2 className="text-2xl font-black mb-10 flex items-center gap-4">
                  <Network className="text-blue-500" size={28} />
                  {t.familyTree}
                </h2>
                <FamilyTree results={results} deceasedGender={state.deceasedGender} currency={state.currency} />
              </div>

              <ResultExplanations results={results} t={t} />
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-12 border-t border-slate-200 text-center no-print pb-10">
        <p className="text-slate-400 text-sm font-black tracking-widest uppercase opacity-60">
          &copy; {new Date().getFullYear()} {t.title} • Al-Farā’iḍ Professional
        </p>
      </footer>
    </div>
  );
};

export default App;
