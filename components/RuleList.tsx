
import React from 'react';
import { BlacklistRule, Operator } from '../types';
import { TARGETING_KEYS } from '../constants';

interface RuleListProps {
  rules: BlacklistRule[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const RuleList: React.FC<RuleListProps> = ({ rules, onDelete, onToggle }) => {
  if (rules.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-slate-900 font-medium">Nema aktivnih pravila</h3>
        <p className="text-slate-500 text-sm mt-1">Dodajte prvo pravilo kako biste započeli s blokiranjem.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Kampanja</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pravilo</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Akcija</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Element</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Akcije</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {rules.map((rule) => {
            // Fix: Access targetKey from the first condition in the conditions array (line 41 error fix)
            const firstCond = rule.conditions?.[0] || { targetKey: 'section', operator: Operator.EQUALS, value: '' };
            const keyLabel = TARGETING_KEYS.find(k => k.value === firstCond.targetKey)?.label || firstCond.targetKey;
            
            return (
              <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => onToggle(rule.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 ${rule.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-slate-900">{rule.name}</div>
                  <div className="text-xs text-slate-500">Kreirano: {new Date(rule.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">{keyLabel}</span>
                    <span className="text-sm text-slate-400">
                      {/* Fix: Access operator and value from the first condition (line 59-60 errors fix) */}
                      {firstCond.operator === Operator.EQUALS ? '==' : 'sadrži'}
                    </span>
                    <span className="text-sm font-medium text-indigo-600">"{firstCond.value}"</span>
                    {rule.conditions && rule.conditions.length > 1 && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded font-bold">+{rule.conditions.length - 1}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${rule.action === 'show' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}>
                    {rule.action === 'show' ? 'Prikaži' : 'Sakrij'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs border border-amber-100">
                    {rule.targetElementSelector}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onDelete(rule.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Obriši pravilo"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
