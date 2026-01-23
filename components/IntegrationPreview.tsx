import React, { useState } from 'react';
  import { BlacklistRule } from '../types';
  
  interface IntegrationPreviewProps {
    rules: BlacklistRule[];
  }
  
  export const IntegrationPreview: React.FC<IntegrationPreviewProps> = ({ rules }) => {
    const [activeTab, setActiveTab] = useState<'json' | 'script'>('json');
    
    const configJson = JSON.stringify(rules.map(r => ({
      key: r.targetKey,
      op: r.operator,
      val: r.value,
      sel: r.targetElementSelector,
      act: r.action || 'hide'
    })), null, 2);
  
    const scriptCode = `(function() {
    const rules = ${configJson.replace(/\n/g, '\n  ')};
    const meta = page_meta?.third_party_apps?.ntAds?.targeting;
    if (!meta) return;
  
    rules.forEach(rule => {
      let match = false;
      const actual = meta[rule.key];
      
      if (rule.op === 'equals') {
        match = String(actual) === rule.val;
      } else if (rule.op === 'contains') {
        if (Array.isArray(actual)) {
          match = actual.includes(rule.val);
        } else if (typeof actual === 'string') {
          match = actual.indexOf(rule.val) > -1;
        }
      }
  
      if (match) {
        const el = document.querySelector(rule.sel);
        if (el) {
          if (rule.act === 'show') {
            el.style.display = 'block';
            el.style.visibility = 'visible';
            el.style.pointerEvents = 'auto';
          } else {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.pointerEvents = 'none';
          }
        }
      }
    });
  })();`;
  
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert('Kopirano!');
    };
  
    return (
      <div className="space-y-4">
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'json' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
            }`}
          >
            JSON
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'script' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
            }`}
          >
            JS Kod
          </button>
        </div>
  
        <div className="relative group">
          <pre className="bg-slate-900 text-indigo-300 p-4 rounded-lg text-[11px] font-mono h-48 overflow-y-auto custom-scrollbar">
            <code>{activeTab === 'json' ? configJson : scriptCode}</code>
          </pre>
          <button
            onClick={() => copyToClipboard(activeTab === 'json' ? configJson : scriptCode)}
            className="absolute top-2 right-2 p-2 bg-slate-800 text-slate-300 rounded hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 3h4" />
            </svg>
          </button>
        </div>
  
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lokalna putanja</h4>
          <p className="text-[11px] text-slate-700 break-all font-mono">
            /exclusions/sponsorship_exclusions.js
          </p>
        </div>
      </div>
    );
  };