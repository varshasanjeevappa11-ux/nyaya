import React, { useState } from 'react';
import { Card, Btn, Pill, Spin } from './UI';
import { CASES } from '../constants';
import { Case } from '../types';
import { generateContentWithRetry } from '../lib/gemini';
import { Scale, TrendingUp, Award, Briefcase, ChevronRight, Info } from 'lucide-react';

export const LawyerVsDefence: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeCases = CASES.filter(c => c.status !== 'Closed');

  const generateAnalysis = async () => {
    if (!selectedCase) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: `You are a Senior Judicial AI Analyst with 35 years of experience in the Indian Judiciary, specializing in Constitutional and Civil Law. 
        Provide a high-precision, deep-dive judicial analysis for the following case:
        
        CASE DETAILS:
        - Title: ${selectedCase.title}
        - ID: ${selectedCase.id}
        - Type: ${selectedCase.type}
        - Court: ${selectedCase.court}
        - Complexity: ${selectedCase.complexity}
        - Status: ${selectedCase.status}
        - Judge: ${selectedCase.judge}
        - Defendant: ${selectedCase.defendant}
        
        LEGAL REPRESENTATION:
        - Prosecution: ${selectedCase.lawyer} (Bio: ${selectedCase.lawyerBio})
        - Defence: ${selectedCase.defLawyer} (Bio: ${selectedCase.defLawyerBio})
        
        KEY ARGUMENTS:
        ${selectedCase.keyArguments.map((arg, i) => `${i + 1}. ${arg}`).join('\n')}
        
        STRUCTURE YOUR ANALYSIS AS FOLLOWS:
        1. **Judicial Case Brief**: A formal summary of the legal matter, identifying the core dispute and its significance in the context of Indian Jurisprudence.
        2. **Prosecution Strategy Analysis**: Evaluate ${selectedCase.lawyer}'s likely approach, focusing on how they might leverage the key arguments within the framework of relevant Indian Statutes (e.g., IPC, CrPC, CPC, or specific Acts).
        3. **Defence Strategy Analysis**: Evaluate ${selectedCase.defLawyer}'s likely counter-strategy, identifying potential legal loopholes or procedural defenses common in Indian courts.
        4. **Comparative Performance & Bench Strength**: Analyze the counsels' relative experience and win rates. Assess how their specific expertise aligns with the nature of this case.
        5. **Judicial Outlook & Ratio Decidendi**: A neutral, objective assessment of the case's likely trajectory. Identify landmark Supreme Court or High Court precedents that would be pivotal in determining the outcome.
        
        Maintain a highly professional, authoritative, and objective judicial tone. Use formal Indian legal terminology.`,
        config: {
          maxOutputTokens: 1500,
          temperature: 0.3
        }
      });
      setAnalysis(response.text || "Analysis generated successfully.");
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')
        ? "AI service is currently busy due to high demand. Please try again in a moment."
        : "Error generating judicial analysis. Please try again later.";
      setAnalysis(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-gold">Lawyer vs Defence Analysis</h1>
        <p className="text-text-muted">Judicial tool for comparing legal representation and case complexity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Selection */}
        <Card className="flex flex-col gap-6">
          <h3 className="text-lg font-serif font-bold">Select Active Case</h3>
          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
            {activeCases.map(c => (
              <div 
                key={c.id} 
                onClick={() => {
                  setSelectedCase(c);
                  setAnalysis(null);
                }}
                className={`
                  p-4 bg-bg2 border border-border rounded-lg cursor-pointer transition-all flex items-center justify-between group
                  ${selectedCase?.id === c.id ? 'ring-2 ring-gold ring-inset bg-gold/5' : 'hover:border-gold/50'}
                `}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gold">{c.id}</span>
                  <span className="text-sm font-serif font-semibold">{c.title}</span>
                  <span className="text-[10px] text-text-dim uppercase tracking-widest">{c.type}</span>
                </div>
                <ChevronRight size={18} className={`${selectedCase?.id === c.id ? 'text-gold' : 'text-text-dim'} group-hover:translate-x-1 transition-transform`} />
              </div>
            ))}
          </div>
        </Card>

        {/* VS Panel */}
        {selectedCase ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Prosecution */}
              <Card className="flex flex-col gap-4 border-l-4 border-l-info">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-info">Prosecution</span>
                  <h4 className="text-lg font-serif font-bold">{selectedCase.lawyer}</h4>
                </div>
                <p className="text-xs text-text-muted leading-relaxed italic">"{selectedCase.lawyerBio}"</p>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-text-dim">
                    <span>Win Rate</span>
                    <span>{Math.round((selectedCase.lawyerWins / selectedCase.lawyerTotal) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-bg2 rounded-full overflow-hidden">
                    <div className="h-full bg-info transition-all duration-1000" style={{ width: `${(selectedCase.lawyerWins / selectedCase.lawyerTotal) * 100}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-text-muted"><Award size={10} /> {selectedCase.lawyerYears}y exp</div>
                    <div className="flex items-center gap-1 text-[10px] text-text-muted"><Briefcase size={10} /> {selectedCase.lawyerTotal} cases</div>
                  </div>
                </div>
              </Card>

              {/* Defence */}
              <Card className="flex flex-col gap-4 border-l-4 border-l-danger">
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[10px] uppercase font-bold text-danger">Defence</span>
                  <h4 className="text-lg font-serif font-bold">{selectedCase.defLawyer}</h4>
                </div>
                <p className="text-xs text-text-muted leading-relaxed italic text-right">"{selectedCase.defLawyerBio}"</p>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-text-dim">
                    <span>Win Rate</span>
                    <span>{Math.round((selectedCase.defLawyerWins / selectedCase.defLawyerTotal) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-bg2 rounded-full overflow-hidden">
                    <div className="h-full bg-danger transition-all duration-1000" style={{ width: `${(selectedCase.defLawyerWins / selectedCase.defLawyerTotal) * 100}%` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-text-muted"><Award size={10} /> {selectedCase.defLawyerYears}y exp</div>
                    <div className="flex items-center gap-1 text-[10px] text-text-muted"><Briefcase size={10} /> {selectedCase.defLawyerTotal} cases</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* VS Badge */}
            <div className="flex items-center justify-center -my-10 z-10">
              <div className="w-16 h-16 rounded-full bg-card border-4 border-border flex flex-col items-center justify-center shadow-2xl">
                <span className="text-gold font-bold text-xl">VS</span>
                <span className="text-[8px] uppercase font-bold text-text-dim">{selectedCase.complexity}</span>
              </div>
            </div>

            {/* AI Analysis */}
            <Card className="mt-4 border border-gold/30 bg-gold/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="text-gold" size={20} />
                  <h3 className="font-serif font-bold">Judicial AI Analysis</h3>
                </div>
                <Btn onClick={generateAnalysis} disabled={loading} className="text-xs py-1.5">
                  {loading ? <Spin /> : 'Generate Analysis'}
                </Btn>
              </div>

              <div className="min-h-[150px] flex flex-col gap-4">
                {loading ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <Spin />
                    <p className="text-sm text-text-dim animate-pulse italic">Consulting judicial precedents and lawyer histories...</p>
                  </div>
                ) : analysis ? (
                  <div className="text-sm text-text-muted leading-relaxed flex flex-col gap-4">
                    {analysis.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-12 text-text-dim italic text-sm">
                    <Info size={24} className="opacity-20" />
                    <p>Click 'Generate Analysis' to receive a judicial briefing.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-bg2 border border-border border-dashed rounded-xl text-text-dim italic">
            <Scale size={48} className="mb-4 opacity-10" />
            <p>Select a case from the list to begin analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
};
