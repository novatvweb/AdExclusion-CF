import React, { useState, useMemo } from 'react';
import { BlacklistRule, TargetingData, Operator } from '../types';

interface SandboxProps {
  rules: BlacklistRule[];
}

export const Sandbox: React.FC<SandboxProps> = ({ rules }) => {
  const [mockData, setMockData] = useState<TargetingData>({
    site: 'gol',
    keywords: ['Rukomet 2026', 'Hrvatska rukometna reprezentacija. Švedska'],
    description_url: 'https://gol.dnevnik.hr/clanak/rubrika/ostali_sportovi/legendarni-svedjanin-hrvati-su-veliki-i-tromi-svedska-mi-moze-zahvaliti---958381.html',
    ads_enabled: true,
    page_type: 'article',
    content_id: 'article:958381',
    domain: 'gol.dnevnik.hr',
    section: 'ostali-sportovi',
    top_section: 'ostali-sportovi',
    ab_test: 'a_version'
  });

  const checkCondition = (cond: any, data: TargetingData) => {
    const isCS = !!cond.caseSensitive;
    const processVal = (v: any) => isCS ? String(v || '').trim() : String(v || '').toLowerCase().trim();
    
    const inputValues = (cond.value || '').split(',').map(v => processVal(v));
    const actualRaw = data[cond.targetKey as keyof TargetingData];
    const isArrayField = Array.isArray(actualRaw);
    
    const actualItems = isArrayField 
      ? (actualRaw as string[]).map(v => processVal(v))
      : [processVal(actualRaw)];
    
    let matchedValues: string[] = [];

    if (cond.operator === Operator.EQUALS) {
      matchedValues = inputValues.filter(iv => actualItems.some(ai => ai === iv));
      return { success: matchedValues.length > 0, matches: matchedValues };
    } else if (cond.operator === Operator.NOT_EQUALS) {
      const failsEquality = inputValues.filter(iv => actualItems.some(ai => ai === iv));
      return { success: failsEquality.length === 0, matches: failsEquality.length === 0 ? [] : failsEquality };
    } else if (cond.operator === Operator.CONTAINS) {
      if (isArrayField) {
        matchedValues = inputValues.filter(iv => actualItems.some(ai => ai === iv));
      } else {
        matchedValues = inputValues.filter(iv => actualItems.some(ai => ai.includes(iv)));
      }
      return { success: matchedValues.length > 0, matches: matchedValues };
    } else if (cond.operator === Operator.NOT_CONTAINS) {
      let containsAny;
      if (isArrayField) {
        containsAny = inputValues.filter(iv => actualItems.some(ai => ai === iv));
      } else {
        containsAny = inputValues.filter(iv => actualItems.some(ai => ai.includes(iv)));
      }
      return { success: containsAny.length === 0, matches: containsAny.length === 0 ? [] : containsAny };
    }
    return { success: false, matches: [] };
  };

  const activeMatches = useMemo(() => {
    return rules.filter(rule => {
      if (!rule.isActive) return false;
      
      const conditionResults = (rule.conditions || []).map(cond => checkCondition(cond, mockData));

      if (conditionResults.length === 0) return false;
      
      const isSuccess = rule.logicalOperator === 'OR' 
        ? conditionResults.some(r => r.success) 
        : conditionResults.every(r => r.success);

      if (isSuccess) {
        (rule as any)._matchedValues = conditionResults.filter(r => r.success).flatMap(r => r.matches);
        (rule as any)._detailedResults = conditionResults;
        return true;
      }
      return false;
    });
  }, [rules, mockData]);

  const renderInputField = (key: keyof TargetingData) => {
    const val = mockData[key];
    return (
      <div key={key} className={key === 'description_url' ? 'col-span-full' : ''}>
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{key.replace('_', ' ')}</label>
        <input
          type="text"
          value={Array.isArray(val) ? val.join(', ') : String(val)}
          onChange={(e) => {
            let newVal: any = e.target.value;
            if (key === 'keywords') {
              newVal = e.target.value.split(',').map(s => s.trim());
            } else if (key === 'ads_enabled') {
              newVal = e.target.value === 'true';
            }
            setMockData({ ...mockData, [key]: newVal });
          }}
          className="w-full text-xs px-4 py-2.5 border border-slate-100 bg-slate-50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold transition-all"
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
        <h2 className="font-black text-slate-800 uppercase tracking-tight text-lg">Simulator (Edge Testing)</h2>
      </div>
      <div className="p-10 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {renderInputField('site')}
          {renderInputField('keywords')}
          {renderInputField('section')}
          {renderInputField('top_section')}
          {renderInputField('page_type')}
          {renderInputField('content_id')}
          {renderInputField('domain')}
          {renderInputField('ads_enabled')}
          {renderInputField('description_url')}
        </div>

        <div className="pt-8 border-t border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Analiza rezultata:</h3>
          {activeMatches.length > 0 ? (
            <div className="space-y-4">
              {activeMatches.map(m => (
                <div key={m.id} className="p-6 bg-slate-900 text-white rounded-[2rem] border border-slate-800 shadow-xl animate-in slide-in-from-left-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <svg className="w-16 h-16" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white">{m.name}</h4>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aktivirano putem {m.logicalOperator} logike</p>
                    </div>
                    <code className="text-[9px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg">
                      {m.targetElementSelector}
                    </code>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(m as any)._matchedValues && (m as any)._matchedValues.length > 0 ? (m as any)._matchedValues.map((val: string, i: number) => (
                        <div key={i} className="flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-[9px] font-black uppercase tracking-wider">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                          Match: {val}
                        </div>
                      )) : (
                        <div className="text-[9px] font-bold text-slate-500 uppercase italic">Zadovoljeno isključivanjem (NOT operacija)</div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                      {m.conditions.map((c, i) => {
                        const res = (m as any)._detailedResults[i];
                        return (
                          <div key={i} className={`p-3 rounded-xl border ${res.success ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10 opacity-50'}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{c.targetKey}</span>
                              <span className={`text-[8px] font-black uppercase ${res.success ? 'text-green-500' : 'text-red-500'}`}>{res.success ? 'VERIFICIRANO' : 'NEUSPJELO'}</span>
                            </div>
                            <div className="text-[9px] font-bold text-slate-300">"{c.value}" ({c.operator}) {c.caseSensitive && <span className="text-[7px] text-indigo-400 font-black ml-1">CS</span>}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-1 italic">Nema aktivnih pogodaka</p>
              <p className="text-[11px] text-slate-300 font-medium">Promijenite podatke u simulatoru iznad za testiranje logike.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};