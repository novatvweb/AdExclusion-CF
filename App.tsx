import React, { useState, useEffect, useRef } from 'react';
import { authService } from './services/authService.ts';
import { dataService } from './services/dataService.ts';
import { RuleForm } from './components/RuleForm.tsx';
import { RuleList } from './components/RuleList.tsx';
import { IntegrationPreview } from './components/IntegrationPreview.tsx';
import { Sandbox } from './components/Sandbox.tsx';
import { BlacklistRule } from './types.ts';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [rules, setRules] = useState<BlacklistRule[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingRule, setEditingRule] = useState<BlacklistRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      dataService.getRules().then(data => {
        setRules(data.rules || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if ((isAdding || editingRule) && formRef.current) {
      const headerOffset = 100;
      const elementPosition = formRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [isAdding, editingRule]);

  const saveRules = async (newRules: BlacklistRule[]) => {
    setRules(newRules);
    try { await dataService.saveRules(newRules); } catch (e) { console.error(e); }
  };

  const publish = async () => {
    setIsPublishing(true);
    const script = `/* Auto-generated AdExclusion Script */\n(function(){ /* prod logic */ })();`;
    try {
      await dataService.saveRules(rules, script);
      await dataService.purgeCache();
      alert('🚀 USPJEH! Pravila su objavljena na Edge.');
    } catch (e) { alert('Greška pri objavljivanju.'); } 
    finally { setIsPublishing(false); }
  };

  const handleFormSubmit = (ruleData: any) => {
    if (editingRule) {
      const updatedRules = rules.map(r => r.id === editingRule.id ? { ...r, ...ruleData } : r);
      saveRules(updatedRules);
    } else {
      const newRule: BlacklistRule = { 
        ...ruleData, 
        id: Math.random().toString(36).substr(2, 9), 
        createdAt: Date.now(), 
        isActive: true 
      };
      saveRules([newRule, ...rules]);
    }
    setIsAdding(false);
    setEditingRule(null);
  };

  if (!isAuthenticated) return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-16">
      <header className="bg-white border-b border-slate-100 h-16 px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-[#b71918] text-white p-2 px-4 font-black uppercase text-base italic rounded-sm tracking-tighter">
            DNEVNIK.hr
          </div>
          <div className="h-5 w-px bg-slate-100"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Ad Exclusion Engine</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={publish} disabled={isPublishing} className="bg-[#24b45d] text-white px-5 py-2.5 font-black text-[9px] uppercase tracking-widest transition-all hover:bg-green-700 disabled:opacity-50 rounded-lg flex items-center gap-2">
            🚀 {isPublishing ? 'PUBLISHING...' : 'OBJAVI NA EDGE'}
          </button>
          <button onClick={() => { setEditingRule(null); setIsAdding(true); }} className="bg-[#0f172a] text-white px-5 py-2.5 font-black text-[9px] uppercase tracking-widest transition-all hover:bg-slate-800 rounded-lg">
            + NOVO PRAVILO
          </button>
          <button onClick={() => { authService.logout(); setIsAuthenticated(false); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-8 space-y-4">
        {/* Forma (Novo/Edit) */}
        {(isAdding || editingRule) && (
          <div ref={formRef} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
            <RuleForm 
              initialData={editingRule || {}}
              onSubmit={handleFormSubmit}
              onCancel={() => { setIsAdding(false); setEditingRule(null); }}
            />
          </div>
        )}

        {/* Lista Pravila */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <RuleList 
            rules={rules} 
            onEdit={(rule) => { setEditingRule(rule); setIsAdding(true); }}
            onToggle={(id) => saveRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r))}
            onDelete={(id) => { if(confirm('Jeste li sigurni?')) saveRules(rules.filter(r => r.id !== id)); }}
          />
        </div>

        {/* Sandbox (Edge Simulator) - Always Visible */}
        <Sandbox rules={rules} />

        {/* Dev Tools - Full Width JS Code */}
        <div className="pt-4">
          <button 
            onClick={() => setShowDevTools(!showDevTools)}
            className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 tracking-widest hover:text-indigo-600 transition-all mb-3"
          >
            <div className={`w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center transition-transform ${showDevTools ? 'rotate-180' : ''}`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            Integracijski Detalji
          </button>

          {showDevTools && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 animate-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4 px-2">JS Integracijski Kod (Full-view)</h3>
              <IntegrationPreview rules={rules} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const LoginForm = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    try {
      const result = await authService.login(user, pass);
      if (result.success) onLogin();
      else setError(result.message || 'Neispravni podaci.');
    } catch (err) {
      setError('Greška pri povezivanju.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#b71918]"></div>
        <div className="flex justify-center mb-8">
          <div className="bg-[#b71918] p-3 px-5 inline-block rounded-sm">
             <span className="text-white font-black text-lg tracking-tighter italic">DNEVNIK.hr</span>
          </div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Korisnik</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} disabled={isLoggingIn} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-red-600" />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 mb-1 block">Lozinka</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} disabled={isLoggingIn} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-red-600" />
          </div>
          <button type="submit" disabled={isLoggingIn} className="w-full bg-[#0f172a] text-white p-4 rounded-lg font-black text-[9px] uppercase tracking-widest mt-4">
            {isLoggingIn ? 'PROVJERA...' : 'PRIJAVI SE'}
          </button>
          {error && <p className="text-center text-red-600 text-[9px] font-black uppercase mt-4 tracking-widest">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default App;