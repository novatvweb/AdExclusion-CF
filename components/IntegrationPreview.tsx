
import React, { useState } from 'react';
import { BlacklistRule } from '../types';

interface IntegrationPreviewProps {
  rules: BlacklistRule[];
}

export const IntegrationPreview: React.FC<IntegrationPreviewProps> = ({ rules }) => {
  const [activeTab, setActiveTab] = useState<'json' | 'script'>('json');
  
  const configJson = JSON.stringify(rules.map(r => ({
    name: r.name,
    conds: r.conditions,
    lOp: r.logicalOperator,
    sel: r.targetElementSelector,
    act: r.action || 'hide',
    rae: !!r.respectAdsEnabled,
    js: r.customJs ? r.customJs : undefined
  })), null, 2);

  const scriptCode = `
/**
 * AdExclusion Engine v2.5
 * Generated: ${new Date().toISOString()}
 * Mode: Production (Un-minified for Debugging)
 */
!function() {
  try {
    // Configuration Payload
    const rules = ${configJson.replace(/\n/g, '\n    ')};
    
    // Get Page Context
    const targeting = page_meta?.third_party_apps?.ntAds?.targeting;
    
    if (!targeting) {
      console.warn("AdEx: Targeting object missing.");
      return;
    }

    // Helper: CSS Injection
    const inject = (sel, action) => {
       const s = document.createElement("style");
       // If action is SHOW, we force display block/visible
       // If action is HIDE, we force display none/hidden
       const disp = action === "show" ? "block" : "none";
       const vis = action === "show" ? "visible" : "hidden";
       
       s.innerHTML = sel + " { display: " + disp + " !important; visibility: " + vis + " !important; }";
       document.head.appendChild(s);
       console.log("AdEx Action Applied:", action, "on", sel);
    };
    
    // Helper: JS Injection
    const runJs = (code, ctx, sel) => {
       try { 
         new Function("ctx", "selector", code)(ctx, sel); 
       } catch(err) { 
         console.warn("AdEx JS Error:", err); 
       }
    };

    // Main Logic Loop
    rules.forEach(rule => {
       console.debug("AdEx Checking Rule:", rule.name);

       // 1. Check Global Ads Enabled requirement
       if (rule.rae && targeting.ads_enabled !== true) {
         console.debug("AdEx Skipped: Ads disabled globally");
         return;
       }

       // 2. Evaluate all conditions against page targeting
       const results = rule.conds.map(cond => {
          const pageValRaw = targeting[cond.targetKey];
          
          // Normalize page values to array of lowercased strings
          const pageVals = Array.isArray(pageValRaw) 
            ? pageValRaw.map(v => String(v).toLowerCase().trim()) 
            : [String(pageValRaw || "").toLowerCase().trim()];
          
          // Normalize rule values
          const ruleVals = cond.value.split(",").map(v => v.trim().toLowerCase());

          let isCondMet = false;
          switch (cond.operator) {
            case "equals": 
              // True if ANY rule val matches ANY page val
              isCondMet = ruleVals.some(rv => pageVals.includes(rv));
              break;
            case "not_equals": 
              // True if ALL rule vals are NOT in page vals
              isCondMet = ruleVals.every(rv => !pageVals.includes(rv));
              break;
            case "contains": 
              isCondMet = ruleVals.some(rv => pageVals.some(pv => pv.indexOf(rv) > -1));
              break;
            case "not_contains": 
              isCondMet = ruleVals.every(rv => pageVals.every(pv => pv.indexOf(rv) === -1));
              break;
          }
          return isCondMet;
       });

       // 3. Apply Logical Operator (AND vs OR)
       let isMatch = false;
       if (rule.lOp === "OR") {
          // OR: True if AT LEAST ONE condition is true
          isMatch = results.some(r => r === true);
       } else {
          // AND: True only if ALL conditions are true
          isMatch = results.every(r => r === true);
       }

       // 4. Execute Action if matched
       if (isMatch) {
          console.log("AdEx MATCH FOUND:", rule.name);
          inject(rule.sel, rule.act);
          
          if (rule.js) {
             const exec = () => runJs(rule.js, targeting, rule.sel);
             if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", exec);
             else exec();
          }
       }
    });

  } catch (err) {
    console.error("AdExclusion Engine Critical Error:", err);
  }
}();`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Kopirano!');
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex p-1 bg-slate-100 rounded-lg max-w-xs">
        <button
          onClick={() => setActiveTab('json')}
          className={`flex-1 py-1 text-[10px] font-black uppercase rounded transition-all ${
            activeTab === 'json' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
          }`}
        >
          JSON Payload
        </button>
        <button
          onClick={() => setActiveTab('script')}
          className={`flex-1 py-1 text-[10px] font-black uppercase rounded transition-all ${
            activeTab === 'script' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'
          }`}
        >
          Logic Preview
        </button>
      </div>

      <div className="relative group w-full">
        <pre className="bg-slate-900 text-indigo-300 p-6 rounded-2xl text-[10px] font-mono h-[550px] overflow-y-auto custom-scrollbar border border-slate-800 w-full">
          <code>{activeTab === 'json' ? configJson : scriptCode}</code>
        </pre>
        <button
          onClick={() => copyToClipboard(activeTab === 'json' ? configJson : scriptCode)}
          className="absolute top-4 right-6 p-2 bg-slate-800 text-slate-300 rounded hover:text-white hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 3h4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
