'use client';

import { Calculator, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { LIBRARY_RULES } from '../core/constants/libraryRules';
import { UserType } from '../core/types/enums';

export function StrategySimulator() {
  const [selectedType, setSelectedType] = useState<UserType>(UserType.STUDENT);
  const [overdueDays, setOverdueDays] = useState<number>(5);

  const rates: Record<UserType, { rate: number; strategyClass: string; desc: string }> = {
    [UserType.STUDENT]: {
      rate: LIBRARY_RULES.FINE_RATES.STUDENT,
      strategyClass: 'StudentFineStrategy',
      desc: 'Öğrenci bütçesi için sübvansiyonlu günlük 5.00 TL tarife.',
    },
    [UserType.ACADEMIC]: {
      rate: LIBRARY_RULES.FINE_RATES.ACADEMIC,
      strategyClass: 'AcademicFineStrategy',
      desc: 'Araştırma esnekliği ve toleransı için günlük 2.00 TL tarife.',
    },
    [UserType.STANDARD]: {
      rate: LIBRARY_RULES.FINE_RATES.STANDARD,
      strategyClass: 'StandardFineStrategy',
      desc: 'Standart sivil üyeler için tam tarife günlük 10.00 TL ceza.',
    },
  };

  const currentStrategy = rates[selectedType];
  const calculatedFine = overdueDays * currentStrategy.rate;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Dinamik Ceza Simülatörü</h3>
            <p className="text-xs text-indigo-400 font-mono">Strategy Pattern (IFineCalculationStrategy)</p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Runtime Polymorphism
        </span>
      </div>

      {/* Üyelik Tipi Seçimi */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {(Object.keys(rates) as UserType[]).map((type) => {
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wide">{type}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
              <div className="text-xs font-semibold text-slate-300 mt-1">
                {rates[type].rate.toFixed(2)} TL / gün
              </div>
            </button>
          );
        })}
      </div>

      {/* Gecikme Günü Kaydırıcı (Slider) */}
      <div className="space-y-2 mb-5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 font-medium">Gecikme Süresi:</span>
          <span className="text-indigo-400 font-bold">{overdueDays} Gün</span>
        </div>
        <input
          type="range"
          min="1"
          max="30"
          value={overdueDays}
          onChange={(e) => setOverdueDays(Number(e.target.value))}
          className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer h-2"
        />
      </div>

      {/* Hesaplama Sonucu Kartı */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Çalıştırılan Strateji:</span>
          <code className="text-xs font-mono font-semibold text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/40">
            {currentStrategy.strategyClass}
          </code>
        </div>

        <p className="text-xs text-slate-400">{currentStrategy.desc}</p>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">Hesaplanan Toplam Ceza:</span>
          <span className="text-xl font-extrabold text-emerald-400">
            {calculatedFine.toFixed(2)} TL
          </span>
        </div>
      </div>
    </div>
  );
}
