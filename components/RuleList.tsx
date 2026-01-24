import React from 'react';
import { BlacklistRule, Operator } from '../types';
import { TARGETING_KEYS, OPERATORS } from '../constants';

interface RuleListProps {
  rules: BlacklistRule[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (rule: BlacklistRule) => void;
}

export const RuleList: React.FC<RuleListProps> = ({ rules, onDelete, onToggle, onEdit }) => {
  if (rules.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50/20">
        <h3 className="text-slate-400 font-black uppercase text-[9px] tracking-widest">Nema pravila u bazi</h3>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/50">
          <tr>
            <th className="px-6 py-3 text-left text-[8px] font-black text-slate-400 uppercase tracking-widest w-16">Status</th>
            <th className="px-6 py-3 text-left text-[8px] font-black text-slate-400 uppercase tracking-widest">Kampanja</th>
            <th className="px-6 py-3 text-left text-[8px] font-black text-slate-400 uppercase tracking-widest">Targeting</th>
            <th className="px-6 py-3 text-left text-[8px] font-black text-slate-400 uppercase tracking-widest">Selektor</th>
            <th className="px-6 py-3 text-right text-[8px] font-black text-slate-400 uppercase tracking-widest">Akcije</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-slate-50/30 transition-all group">
              <td className="px-6 py-3">
                <button 
                  onClick={() => onToggle(rule.id)}
                  className={`w-8 h-4 rounded-full relative transition-all ${rule.isActive ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-2.5 h-2.5 bg-white rounded-full absolute top-[3px] transition-all ${rule.isActive ? 'left-5' : 'left-0.5'}`} />
                </button>
              </td>
              <td className="px-6 py-3">
                <div className="text-[11px] font-black text-slate-900 tracking-tight">{rule.name}</div>
                <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                  {rule.action === 'hide' ? '🚫 SAKRIJ' : '✅ PRIKAŽI'}
                </div>
              </td>
              <td className="px-6 py-3">
                <div className="flex flex-col gap-0.5">
                  {rule.conditions.slice(0, 2).map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-[7px] font-black text-indigo-500 uppercase">{TARGETING_KEYS.find(k => k.value === c.targetKey)?.label.split(' ')[0] || c.targetKey}</span>
                      <span className="text-[9px] font-bold text-slate-600 truncate max-w-[150px]">"{c.value}"</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-3">
                <code className="text-[8px] font-mono bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">{rule.targetElementSelector}</code>
              </td>
              <td className="px-6 py-3 text-right space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => onEdit(rule)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => onDelete(rule.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};