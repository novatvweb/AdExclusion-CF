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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-black uppercase tracking-tight text-slate-800">
          {initialData?.id ? 'Uredi Pravilo' : 'Novo Pravilo'}
        </h2>
        <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
          <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Poštuj "Ads Enabled"</span>
          <button 
            type="button"
            onClick={() => setRespectAdsEnabled(!respectAdsEnabled)}
            className={`w-9 h-4.5 rounded-full relative transition-all ${respectAdsEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <div className={`w-3 h-3 bg-white rounded-full absolute top-[3px] transition-all ${respectAdsEnabled ? 'left-5' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Naziv Kampanje</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="npr. Test pravilo"
          className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 relative">
        <div className="flex justify-between items-center mb-4">
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Uvjeti Targetiranja</label>
          <div className="flex bg-white border border-slate-200 rounded-md p-0.5">
            <button type="button" onClick={() => setLogicalOperator('AND')} className={`px-2 py-0.5 text-[8px] font-black rounded transition-all ${logicalOperator === 'AND' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>AND</button>
            <button type="button" onClick={() => setLogicalOperator('OR')} className={`px-2 py-0.5 text-[8px] font-black rounded transition-all ${logicalOperator === 'OR' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>OR</button>
          </div>
        </div>

        <div className="space-y-2">
          {conditions.map((cond, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={cond.targetKey}
                onChange={(e) => updateCondition(index, { targetKey: e.target.value as TargetingKey })}
                className="flex-[1.5] bg-white border border-slate-200 p-2 rounded text-xs font-bold outline-none appearance-none"
              >
                {TARGETING_KEYS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
              <select
                value={cond.operator}
                onChange={(e) => updateCondition(index, { operator: e.target.value as Operator })}
                className="flex-1 bg-white border border-slate-200 p-2 rounded text-xs font-bold text-indigo-600 outline-none appearance-none"
              >
                {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <div className="flex-[2] relative flex items-center">
                <input
                  type="text"
                  value={cond.value}
                  onChange={(e) => updateCondition(index, { value: e.target.value })}
                  placeholder="Vrijednost"
                  className="w-full bg-white border border-slate-200 p-2 pr-8 rounded text-xs font-bold outline-none"
                />
                <button type="button" onClick={() => updateCondition(index, { caseSensitive: !cond.caseSensitive })} className={`absolute right-1.5 w-5 h-5 flex items-center justify-center rounded text-[8px] font-black ${cond.caseSensitive ? 'bg-indigo-600 text-white' : 'text-slate-200 bg-slate-50'}`}>Aa</button>
              </div>
              <button type="button" onClick={() => removeCondition(index)} className="p-1.5 text-slate-300 hover:text-red-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addCondition} className="mt-3 flex items-center gap-1.5 text-[8px] font-black uppercase text-indigo-600 tracking-widest">+ Dodaj Uvjet</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="md:col-span-2">
          <label className="block text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">CSS Selektor</label>
          <input
            type="text"
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder=".klasa ili #id"
            className="w-full bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-xs font-bold outline-none"
          />
        </div>
        <div>
          <label className="block text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">Akcija</label>
          <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100 gap-1">
            <button 
              type="button" 
              onClick={() => setAction('hide')} 
              className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded transition-all ${action === 'hide' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >Sakrij</button>
            <button 
              type="button" 
              onClick={() => setAction('show')} 
              className={`flex-1 py-1.5 text-[8px] font-black uppercase rounded transition-all ${action === 'show' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >Prikaži</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-50">
        <button type="button" onClick={onCancel} className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Odustani</button>
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest shadow shadow-indigo-100 hover:bg-indigo-700">
          {initialData?.id ? 'Spremi Izmjene' : 'Spremi Pravilo'}
        </button>
      </div>
    </form>
  );
};