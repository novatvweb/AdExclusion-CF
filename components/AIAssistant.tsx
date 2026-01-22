
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { BlacklistRule, Operator, TargetingKey } from '../types';

interface AIAssistantProps {
  onSuggest: (rule: Partial<BlacklistRule>) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onSuggest }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given this request: "${prompt}", generate a sponsorship exclusion rule. 
        Available keys: site, keywords, description_url, ads_enabled, page_type, content_id, domain, section, top_section, ab_test.
        Available operators: equals, contains.
        Common selectors: .bg-branding-main, #promo-box-general, .footer-sponsor-logo.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              targetKey: { 
                type: Type.STRING, 
                enum: ['site', 'keywords', 'description_url', 'ads_enabled', 'page_type', 'content_id', 'domain', 'section', 'top_section', 'ab_test'] 
              },
              operator: { type: Type.STRING, enum: ['equals', 'contains'] },
              value: { type: Type.STRING },
              targetElementSelector: { type: Type.STRING }
            },
            required: ["name", "targetKey", "operator", "value", "targetElementSelector"]
          }
        }
      });

      // Fix: Access response.text property directly, following @google/genai guidelines.
      const suggestion = JSON.parse(response.text || '{}');
      onSuggest(suggestion);
      setPrompt('');
    } catch (error) {
      console.error("AI Error:", error);
      alert("Došlo je do greške prilikom generiranja pravila.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
        </svg>
      </div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <span className="text-indigo-300">✨</span> AI Asistent za pravila
        </h3>
        <p className="text-indigo-200 text-sm mb-4">
          Opišite što želite sakriti (npr. "Sakrij branding na svim člancima u rubrici nogomet") i pustite AI da kreira pravilo.
        </p>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Opišite pravilo..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            disabled={loading}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="bg-white text-indigo-900 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-indigo-900/30 border-t-indigo-900 rounded-full animate-spin" />
            ) : 'Generiraj'}
          </button>
        </div>
      </div>
    </div>
  );
};
