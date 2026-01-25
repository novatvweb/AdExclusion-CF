import React, { useState, useEffect } from 'react';
import { Operator, BlacklistRule, TargetingKey, ActionType, Condition, LogicalOperator } from '../types';
import { TARGETING_KEYS, OPERATORS } from '../constants';

interface RuleFormProps {
  onSubmit: (rule: Omit<BlacklistRule, 'id' | 'createdAt' | 'isActive'>) => void;
  onCancel: () => void;
  initialData?: Partial<BlacklistRule>;
}

export const RuleForm: React.FC<RuleFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [logicalOperator, setLogicalOperator] = useState<LogicalOperator>(initialData?.logicalOperator || 'AND');
  const [conditions, setConditions] = useState<Condition[]>(
    initialData?.conditions || [{ targetKey: 'keywords', operator: Operator.CONTAINS, value: '', caseSensitive: false }]
  );
  const [selector, setSelector] = useState(initialData?.targetElementSelector || '');
  const [action, setAction] = useState<ActionType>(initialData?.action || 'hide');
  const [respectAdsEnabled, setRespectAdsEnabled] = useState(initialData?.respectAdsEnabled ?? true);

  const addCondition = () => {
    setConditions([...conditions, { targetKey: 'section', operator: Operator.EQUALS, value: '', caseSensitive: false }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index));
    }
  };

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setConditions(newConditions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || conditions.some(c => !c.value) || !selector) {
      alert("Molimo popunite sva obavezna polja.");
      return;
    }
    onSubmit({
      name,
      conditions,
      logicalOperator,
      targetElementSelector: selector,
      action,
      respectAdsEnabled
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-100 pb-4 gap-3">
        <div>
          <h2 className="text-[17px] font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-indigo-600 rounded-full"></span>
            {initialData?.id ? 'Konfiguracija Pravila' : 'Novo Izuzeće'}
          </h2>
          <p className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-widest md:hidden">
            Context: page_meta.ntAds
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Targeting Context: page_meta.ntAds</span>
        </div>
      </div>

      {/* Campaign Name & Action Type */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Naziv Kampanje / Klijenta</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="npr. Heineken Euro 2024"
            className="w-full h-12 bg-slate-50 border border-slate-200 px-4 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Tip Akcije</label>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 h-12">
            <button 
              type="button" 
              onClick={() => setAction('hide')} 
              className={`flex-1 flex items-center justify-center text-[10px] font-black uppercase rounded-lg transition-all ${action === 'hide' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >Sakrij</button>
            <button 
              type="button" 
              onClick={() => setAction('show')} 
              className={`flex-1 flex items-center justify-center text-[10px] font-black uppercase rounded-lg transition-all ${action === 'show' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >Prikaži</button>
          </div>
        </div>
      </div>

      {/* Logical Configuration Area */}
      <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 md:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-slate-200/50">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logika</label>
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm h-10 flex-1 sm:flex-none">
              <button type="button" onClick={() => setLogicalOperator('AND')} className={`flex-1 sm:px-4 flex items-center justify-center text-[9px] font-black rounded-lg transition-all ${logicalOperator === 'AND' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}>AND</button>
              <button type="button" onClick={() => setLogicalOperator('OR')} className={`flex-1 sm:px-4 flex items-center justify-center text-[9px] font-black rounded-lg transition-all ${logicalOperator === 'OR' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}>OR</button>
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Respect Ads</span>
            <button 
              type="button"
              onClick={() => setRespectAdsEnabled(!respectAdsEnabled)}
              className={`w-11 h-6 rounded-full relative transition-all duration-300 shadow-inner ${
                respectAdsEnabled ? 'bg-emerald-500 shadow-emerald-100' : 'bg-slate-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 shadow-md transform ${
                respectAdsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Condition Rows */}
        <div className="space-y-6 md:space-y-3">
          {conditions.map((cond, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-2 md:items-center animate-in fade-in slide-in-from-left-2 duration-200 bg-white md:bg-transparent p-3 md:p-0 rounded-xl border border-slate-200 md:border-none shadow-sm md:shadow-none">
              
              {/* Key & Op Selection Group */}
              <div className="flex gap-2 w-full md:flex-[2.2]">
                <div className="flex-1 relative h-11">
                  <select
                    value={cond.targetKey}
                    onChange={(e) => updateCondition(index, { targetKey: e.target.value as TargetingKey })}
                    className="w-full h-full bg-slate-50 md:bg-white border border-slate-200 px-3 rounded-lg text-[11px] font-bold outline-none appearance-none cursor-pointer pr-8 focus:border-indigo-400"
                  >
                    {TARGETING_KEYS.map(k => <option key={k.value} value={k.value}>{k.label.split(' ')[0]}</option>)}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                </div>
                <div className="flex-1 relative h-11">
                  <select
                    value={cond.operator}
                    onChange={(e) => updateCondition(index, { operator: e.target.value as Operator })}
                    className="w-full h-full bg-slate-50 md:bg-white border border-slate-200 px-3 rounded-lg text-[11px] font-bold text-indigo-600 outline-none appearance-none cursor-pointer pr-8 focus:border-indigo-400"
                  >
                    {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-200"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                </div>
              </div>

              {/* Value Input Group */}
              <div className="flex gap-2 w-full md:flex-[2.5]">
                <div className="flex-1 relative flex items-center h-11">
                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    placeholder="Vrijednost parametra..."
                    className="w-full h-full bg-slate-50 md:bg-white border border-slate-200 px-4 pr-16 md:pr-10 rounded-lg text-[11px] font-bold outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                  <div className="absolute right-1 flex items-center gap-1">
                    <button 
                      type="button" 
                      onClick={() => updateCondition(index, { caseSensitive: !cond.caseSensitive })} 
                      className={`w-7 h-7 flex items-center justify-center rounded-md text-[9px] font-black transition-all ${cond.caseSensitive ? 'bg-slate-800 text-white shadow-md' : 'text-slate-300 bg-slate-50 hover:text-slate-500'}`}
                      title="Case Sensitive"
                    >Aa</button>
                    {/* Delete button integrated on mobile inside row, or next to it on desktop */}
                    <button 
                      type="button" 
                      onClick={() => removeCondition(index)} 
                      className="md:hidden w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                {/* Desktop Delete Button */}
                <button 
                  type="button" 
                  onClick={() => removeCondition(index)} 
                  className="hidden md:flex w-10 h-11 items-center justify-center text-slate-300 hover:text-red-500 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-all active:scale-90"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addCondition} className="mt-5 w-full md:w-auto flex items-center justify-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:text-indigo-800 transition-all bg-white px-4 h-11 rounded-xl border border-slate-200 shadow-sm active:scale-95 group">
           <span className="text-sm">+</span> Dodaj novi parametar
        </button>
      </div>

      {/* Target Element & Footer Buttons */}
      <div className="grid grid-cols-1 gap-4 pt-2">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Target Element (CSS Selektor)</label>
          <input
            type="text"
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder="npr. .bg-branding-main ili #ad-banner"
            className="w-full h-12 bg-slate-50 border border-slate-200 px-4 rounded-xl text-sm font-bold font-mono outline-none shadow-inner focus:border-indigo-500"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 pt-2">
          <button type="submit" className="w-full md:flex-[2] h-14 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all order-1 md:order-2">
            {initialData?.id ? 'Spremi Konfiguraciju' : 'Kreiraj Izuzeće'}
          </button>
          <button type="button" onClick={onCancel} className="w-full md:flex-1 h-14 text-[11px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-600 transition-colors order-2 md:order-1">
            Odustani
          </button>
        </div>
      </div>
    </form>
  );
};