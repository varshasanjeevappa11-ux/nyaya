import React, { useState } from 'react';
import { Card, Btn, Spin, Pill } from './UI';
import { generateContentWithRetry } from '../lib/gemini';
import { Languages, Sparkles, AlertCircle, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGES = [
  'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi', 'Odia', 'Urdu', 'Assamese'
];

export const Translator: React.FC = () => {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const translate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: `You are an Indian legal translator. Translate the following English legal text into ${targetLang}. 
        Preserve all legal terminology and formal register. 
        Provide the translation in ${targetLang} script.
        
        Text: ${text}`,
        config: {
          maxOutputTokens: 800,
          temperature: 0.3
        }
      });
      setResult(response.text || "Translation completed successfully.");
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')
        ? "AI service is currently busy due to high demand. Please try again in a moment."
        : "Error translating legal text. Please try again later.";
      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-gold">Legal Translator</h1>
        <p className="text-text-muted">Translate legal documents into 12 major Indian languages while preserving legal terminology.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Globe className="text-gold" size={20} />
            <h3 className="font-serif font-bold">Source Text (English)</h3>
          </div>
          <textarea 
            rows={10}
            placeholder="Paste English legal text here..."
            className="w-full bg-bg2 border border-border rounded-lg p-4 text-sm focus:outline-none focus:border-gold transition-all resize-none font-sans leading-relaxed"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <div className="flex flex-col gap-4">
            <h4 className="text-[10px] uppercase font-bold text-text-dim">Select Target Language</h4>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang}
                  onClick={() => setTargetLang(lang)}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-semibold transition-all border
                    ${targetLang === lang ? 'bg-gold text-bg border-gold' : 'bg-bg2 text-text-muted border-border hover:border-gold/50'}
                  `}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <Btn onClick={translate} disabled={loading || !text.trim()} className="w-full py-3">
            {loading ? <Spin /> : <><Languages size={18} /> Translate to {targetLang}</>}
          </Btn>
        </Card>

        <Card className="flex flex-col gap-6 border border-gold/30 bg-gold/5 min-h-[400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-gold" size={20} />
              <h3 className="font-serif font-bold">Translation Result ({targetLang})</h3>
            </div>
            {result && <Pill bg="rgba(196,148,40,0.12)" fg="#C49428">{targetLang}</Pill>}
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24">
                <Spin />
                <p className="text-sm text-text-dim animate-pulse italic">Translating legal terminology into {targetLang}...</p>
              </div>
            ) : result ? (
              <div className="text-lg text-text-muted leading-relaxed flex flex-col gap-4 font-sans">
                {result.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-text-dim italic text-sm">
                <AlertCircle size={32} className="opacity-10" />
                <p>Select a language and click 'Translate' to begin.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
