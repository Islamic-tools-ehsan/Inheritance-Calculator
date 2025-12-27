
import React from 'react';
import { CalculationResult } from './types';
import { CheckCircle2, AlertCircle, HelpCircle, BookOpen, Scale, List, Ban } from 'lucide-react';

interface ResultExplanationsProps {
  results: CalculationResult[];
  t: any;
}

export const ResultExplanations: React.FC<ResultExplanationsProps> = ({ results, t }) => {
  const sharers = results.filter(r => !r.isBlocked && r.shareAmount > 0);
  const blockedHeirs = results.filter(r => r.isBlocked);

  return (
    <div className="space-y-10">
      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center gap-4">
          <List className="text-orange-500" size={28} />
          <h2 className="text-2xl font-black">{t.shareTable}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">
              <tr>
                <th className="px-10 py-7">Heir</th>
                <th className="px-10 py-7">Total Share</th>
                <th className="px-10 py-7">Individual Share</th>
                <th className="px-10 py-7 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-black text-slate-900">
              {results.filter(r => r.count > 0 || r.isBlocked).map((r, i) => (
                <tr key={i} className={`hover:bg-orange-50/50 transition-colors ${r.isBlocked ? 'opacity-30 grayscale' : ''}`}>
                  <td className="px-10 py-8">
                    <div>
                      <p className="font-black text-xl font-arabic">{r.heirName}</p>
                      <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1">Count: {r.count}</p>
                      {r.isBlocked && <span className="text-[11px] font-black text-red-500 uppercase tracking-widest mt-1 block">{t.blockedBy} {r.blockedBy}</span>}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="font-black text-2xl text-slate-800">{r.sharePercentage.toFixed(2)}%</p>
                    <p className="text-sm text-orange-600 font-mono">{r.shareFraction}</p>
                  </td>
                  <td className="px-10 py-8">
                    {r.count > 1 && !r.isBlocked ? (
                      <div className="flex flex-col">
                        <span className="text-lg text-emerald-600 font-black">{r.sharePercentagePerHeir.toFixed(2)}% <span className="text-[10px] uppercase opacity-70">Each</span></span>
                        <span className="text-sm opacity-60">Per Person Share</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-10 py-8 text-right font-black">
                    <p className="text-2xl">{r.shareAmount.toLocaleString()}</p>
                    {r.count > 1 && !r.isBlocked && (
                       <p className="text-[11px] text-emerald-600 uppercase tracking-widest font-black mt-1">
                         Each: {r.shareAmountPerHeir.toLocaleString()}
                       </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-4 mb-8 px-6">
          <BookOpen className="text-orange-600" size={32} />
          <h2 className="text-3xl font-black tracking-tight">{t.explanation}</h2>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {sharers.map((r, i) => (
            <div 
              key={`sharer-${i}`} 
              className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 transition-all hover:scale-[1.01] hover:border-orange-500/30"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                  <div className="bg-orange-100 p-4 rounded-[1.5rem] shadow-inner">
                    <CheckCircle2 className="text-orange-600" size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl font-arabic text-slate-900">{r.heirName}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[11px] font-black uppercase bg-slate-100 px-4 py-1.5 rounded-full text-slate-500 tracking-widest shadow-sm">
                        {r.heirType}
                      </span>
                      {r.count > 1 && (
                        <span className="text-[11px] font-black uppercase bg-emerald-50 px-4 py-1.5 rounded-full text-emerald-600 tracking-widest shadow-sm">
                          Divided among {r.count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-lg text-slate-600 font-bold mb-8 leading-relaxed">
                {r.explanation}
              </p>

              {r.fiqhNote && (
                <div className="mb-8 bg-orange-500 p-8 rounded-[2rem] shadow-xl shadow-orange-500/20 text-white flex items-start gap-6">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    <Scale size={24} className="text-white" />
                  </div>
                  <p className="text-sm font-black leading-normal uppercase tracking-wider">
                    {r.fiqhNote}
                  </p>
                </div>
              )}

              {r.quranReference && (
                <div className="bg-slate-50 p-6 rounded-[1.5rem] border-2 border-slate-100 flex items-start gap-4">
                  <HelpCircle size={20} className="text-slate-400 mt-1" />
                  <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                    Refer to Quran verse {r.quranReference} regarding the share of {r.heirName}.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {blockedHeirs.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center gap-4 mb-8 px-6">
            <Ban className="text-red-600" size={32} />
            <h2 className="text-3xl font-black tracking-tight text-red-600 uppercase">Excluded Heirs (Hajb)</h2>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {blockedHeirs.map((r, i) => (
              <div 
                key={`blocked-${i}`} 
                className="bg-red-50/50 p-10 rounded-[3rem] shadow-2xl shadow-red-100/40 border border-red-100 transition-all hover:border-red-500/30"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-6">
                    <div className="bg-red-100 p-4 rounded-[1.5rem] shadow-inner">
                      <AlertCircle className="text-red-600" size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl font-arabic text-red-900">{r.heirName}</h3>
                      <p className="text-[11px] font-black uppercase text-red-500 tracking-widest mt-1">
                        Status: Fully Excluded
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border-2 border-red-100 mb-6">
                  <p className="text-lg text-red-800 font-bold leading-relaxed">
                    <span className="text-red-600 underline">Reason:</span> {r.explanation}
                  </p>
                </div>

                <div className="flex items-center gap-3 px-2">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  <p className="text-xs font-black text-red-400 uppercase tracking-widest">
                    Based on Inheritance Principles (Hajb Al-Hirman)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
