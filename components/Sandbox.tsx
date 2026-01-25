
import React, { useState, useMemo } from 'react';
import { BlacklistRule, TargetingData, Operator } from '../types';
import { dataService } from '../services/dataService.ts';

interface SandboxProps {
  rules: BlacklistRule[];
}

export const Sandbox: React.FC<SandboxProps> = ({ rules }) => {
  const [importUrl, setImportUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [mockData, setMockData] = useState<TargetingData>({
    site: 'gol',
    keywords: ['Rukomet 2026', 'Hrvatska'],
    description_url: 'https://gol.dnevnik.hr/clanak/primjer.html',
    ads_enabled: true,
    page_type: 'article',
    content_id: 'article:958381',
    domain: 'gol.dnevnik.hr',
    section: 'ostali-sportovi',
    top_section: 'ostali-sportovi',
    ab_test: 'a_version'
  });

  const handleImport = async () => {
    if (!importUrl || !importUrl.startsWith('http')) {
      alert("Unesite ispravan URL (mora početi s http)");
      return;
    }

    setIsScraping(true);
    try {
      const result = await dataService.scrapeUrl(importUrl);
      if (result.success && result.data) {
        setMockData(result.data);
        setImportUrl('');
      } else {
        alert(`Uvoz nije uspio: ${result.message || "Nepoznata greška na serveru"}`);
      }
    } catch (e: any) {
      alert(`Greška u simulatoru: ${e.message}`);
    } finally {
      setIsScraping(false);
    }
  };

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
      return { success: failsEquality.length === 0, matches: [] };
    } else if (cond.operator === Operator.CONTAINS) {
      if (isArrayField) {
        matchedValues = inputValues.filter(iv => actualItems.some(ai => ai === iv));
      } else {
        matchedValues = inputValues.filter(iv => actualItems.some(ai => ai.includes(iv)));
      }
      return { success: matchedValues.length > 0, matches: matchedValues };
    } else if (cond.operator === Operator.NOT_CONTAINS) {
      const containsAny = inputValues.filter(iv => isArrayField ? actualItems.some(ai => ai === iv) : actualItems.some(ai => ai.includes(iv)));
      return { success: containsAny.length === 0, matches: [] };
    }
    return { success: false, matches: [] };
  };

  const activeMatches = useMemo(() => {
    return rules.filter(rule => {
      if (!rule.isActive) return false;
      const conditionResults = (rule.conditions || []).map(cond => checkCondition(cond, mockData));
      if (conditionResults.length === 0) return false;
      const isSuccess = rule.logicalOperator === 'OR' ? conditionResults.some(r => r.success) : conditionResults.every(r => r.success);
      if (isSuccess) {
        (rule as any)._matchedValues = conditionResults.filter(r => r.success).flatMap(r => r.matches);
        return true;
      }
      return false;
    });
  }, [rules, mockData]);

  const renderInputField = (key: keyof TargetingData) => {
    const val = mockData[key];
    return (
      <div key={key} className="flex flex-col group">
        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">{key.replace('_', ' ')}</label>
        <input
          type="text"
          value={Array.isArray(val) ? val.join(', ') : String(val)}
          onChange={(e) => {
            let newVal: any = e.target.value;
            if (key === 'keywords') newVal = e.target.value.split(',').map(s => s.trim());
            else if (key === 'ads_enabled') newVal = e.target.value === 'true';
            setMockData({ ...mockData, [key]: newVal });
          }}
          className="w-full text-sm h-12 px-4 border border-slate-200 bg-slate-50/50 rounded-xl outline-none font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner"
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.4)]"></div>
          <h2 className="font-black text-slate-800 uppercase tracking-tight text-[12px]">Edge Preview Engine (Simulation)</h2>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 pl-3 border border-slate-200 rounded-xl shadow-sm max-w-md w-full">
          <input 
            type="url"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleImport()}
            placeholder="Zalijepi URL članka..."
            className="flex-1 text-[11px] font-bold outline-none bg-transparent"
            disabled={isScraping}
          />
          <button 
            onClick={handleImport}
            disabled={isScraping || !importUrl}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isScraping ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            )}
            Učitaj
          </button>
        </div>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderInputField('site')}
          {renderInputField('keywords')}
          {renderInputField('section')}
          {renderInputField('top_section')}
          {renderInputField('page_type')}
          {renderInputField('content_id')}
          {renderInputField('domain')}
          {renderInputField('ads_enabled')}
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex flex-col group">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1 group-focus-within:text-indigo-600 transition-colors">Description URL (Full Path)</label>
            <input
              type="text"
              value={mockData.description_url}
              onChange={(e) => setMockData({ ...mockData, description_url: e.target.value })}
              className="w-full text-sm h-12 px-4 border border-slate-200 bg-slate-50/50 rounded-xl outline-none font-bold font-mono focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivni Filteri u ovom kontekstu:</h3>
            <span className="h-px bg-slate-100 flex-1"></span>
          </div>
          
          {activeMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMatches.map(m => (
                <div key={m.id} className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 relative shadow-2xl group transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.6)]"></span>
                      <h4 className="text-[11px] font-black uppercase tracking-widest truncate max-w-[150px]">{m.name}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${m.action === 'hide' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {m.action}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(m as any)._matchedValues?.map((val: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 text-indigo-300 rounded-md text-[9px] font-bold">MATCH: {val}</span>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <code className="text-[10px] font-mono text-slate-400 block bg-black/40 p-3 rounded-xl border border-white/5 truncate group-hover:text-indigo-200 transition-colors">
                      {m.targetElementSelector}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-4">
                 <svg className="w-6 h-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-[11px] text-slate-300 font-black uppercase tracking-[0.2em] italic">Svi oglasni sustavi su trenutno dozvoljeni • Nema poklapanja</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
