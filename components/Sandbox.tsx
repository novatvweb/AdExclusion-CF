
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

  const activeMatches = useMemo(() => {
    return rules.filter(rule => {
      if (!rule.isActive) return false;
      const actual = mockData[rule.targetKey as keyof TargetingData];
      
      // Handle boolean for ads_enabled
      const stringifiedValue = String(actual);
      
      if (rule.operator === Operator.EQUALS) {
        return stringifiedValue === rule.value;
      } else {
        if (Array.isArray(actual)) {
          return actual.some(item => item.includes(rule.value));
        } else if (typeof actual === 'string') {
          return actual.includes(rule.value);
        }
      }
      return false;
    });
  }, [rules, mockData]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="font-semibold text-slate-800">Simulator (Testiranje)</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(mockData).map(([key, val]) => (
            <div key={key}>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{key}</label>
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
                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 mb-2">Rezultat simulacije:</h3>
          {activeMatches.length > 0 ? (
            <div className="space-y-2">
              {activeMatches.map(m => (
                <div key={m.id} className="flex items-center justify-between text-xs p-2 bg-green-50 text-green-700 rounded border border-green-100">
                  <span className="font-medium">✅ {m.name}</span>
                  <span className="opacity-70">Skriva: {m.targetElementSelector}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded border border-dashed border-slate-200 text-center">
              Nema podudaranja s trenutnim podacima.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
