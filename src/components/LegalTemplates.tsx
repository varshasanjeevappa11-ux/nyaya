import React, { useState } from 'react';
import { Card, Btn, Spin, Pill } from './UI';
import { generateContentWithRetry } from '../lib/gemini';
import { FileText, Download, Sparkles, AlertCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TEMPLATES = [
  { 
    id: 'bail', 
    name: 'Bail Application', 
    category: 'Criminal', 
    icon: '⚖️',
    fields: [
      { id: 'court', label: 'Court Name', placeholder: 'e.g. In the Court of Sessions Judge, Delhi' },
      { id: 'district', label: 'District/State', placeholder: 'e.g. New Delhi' },
      { id: 'petitioner', label: 'Petitioner Name', placeholder: 'Full Name of Applicant' },
      { id: 'respondent', label: 'Respondent Name', placeholder: 'State of ...' },
      { id: 'fir_no', label: 'FIR Number', placeholder: 'FIR No. / Year' },
      { id: 'police_station', label: 'Police Station', placeholder: 'Name of PS' },
      { id: 'offence', label: 'Offence(s)', placeholder: 'Sections of IPC/CrPC/BNS' },
      { id: 'arrest_date', label: 'Date of Arrest', placeholder: 'DD/MM/YYYY' },
      { id: 'facts', label: 'Grounds for Bail', placeholder: 'Why should bail be granted? (e.g. false implication, no recovery, etc.)', type: 'textarea' }
    ]
  },
  { 
    id: 'fir', 
    name: 'FIR Draft', 
    category: 'Criminal', 
    icon: '📝',
    fields: [
      { id: 'ps_name', label: 'Police Station Name', placeholder: 'To the SHO, Police Station...' },
      { id: 'district', label: 'District', placeholder: 'District Name' },
      { id: 'informant', label: 'Informant Details', placeholder: 'Name, Age, Father\'s Name, Address' },
      { id: 'incident_time', label: 'Date & Time of Incident', placeholder: 'DD/MM/YYYY at HH:MM AM/PM' },
      { id: 'incident_place', label: 'Place of Incident', placeholder: 'Specific Location' },
      { id: 'accused', label: 'Accused Details', placeholder: 'Name/Description of Accused (if known)' },
      { id: 'facts', label: 'Description of Incident', placeholder: 'Detailed account of what happened...', type: 'textarea' }
    ]
  },
  { 
    id: 'vakalatnama', 
    name: 'Vakalatnama', 
    category: 'General', 
    icon: '📜',
    fields: [
      { id: 'court', label: 'Court Name', placeholder: 'e.g. In the Court of...' },
      { id: 'case_no', label: 'Case Number', placeholder: 'Case No. / Year' },
      { id: 'petitioner', label: 'Petitioner/Plaintiff', placeholder: 'Full Name' },
      { id: 'respondent', label: 'Respondent/Defendant', placeholder: 'Full Name' },
      { id: 'advocate', label: 'Advocate Details', placeholder: 'Name, Enrollment No., Address' }
    ]
  },
  { 
    id: 'affidavit', 
    name: 'Affidavit', 
    category: 'General', 
    icon: '✍️',
    fields: [
      { id: 'deponent', label: 'Deponent Name', placeholder: 'Your Full Name' },
      { id: 'father_name', label: 'Father/Husband Name', placeholder: 'S/o or D/o or W/o' },
      { id: 'age', label: 'Age', placeholder: 'Your Age' },
      { id: 'address', label: 'Address', placeholder: 'Full Residential Address' },
      { id: 'purpose', label: 'Purpose of Affidavit', placeholder: 'e.g. Name correction, Address proof' },
      { id: 'facts', label: 'Statements/Facts', placeholder: 'List the facts being sworn (Point-wise)...', type: 'textarea' }
    ]
  },
  { 
    id: 'pil', 
    name: 'PIL Draft', 
    category: 'Constitutional', 
    icon: '🌍',
    fields: [
      { id: 'court', label: 'Court', placeholder: 'High Court of ... / Supreme Court of India' },
      { id: 'petitioner', label: 'Petitioner', placeholder: 'Name of Individual/NGO & Address' },
      { id: 'respondent', label: 'Respondent', placeholder: 'Union of India / State Govt / Authority' },
      { id: 'issue', label: 'Public Issue', placeholder: 'The matter of public interest involved' },
      { id: 'facts', label: 'Facts & Grievances', placeholder: 'Detailed facts, legal grounds, and violation of rights...', type: 'textarea' }
    ]
  },
  { 
    id: 'rti', 
    name: 'RTI Application', 
    category: 'Administrative', 
    icon: '🔍',
    fields: [
      { id: 'pio', label: 'Public Information Officer', placeholder: 'PIO, Department of...' },
      { id: 'address', label: 'Department Address', placeholder: 'Full Address of the Office' },
      { id: 'applicant', label: 'Applicant Details', placeholder: 'Name, Father\'s Name, Address' },
      { id: 'info_needed', label: 'Information Required', placeholder: 'Specific details of info requested (Point-wise)', type: 'textarea' },
      { id: 'period', label: 'Period of Info', placeholder: 'e.g. From 01/01/2020 to 31/12/2023' }
    ]
  },
  { 
    id: 'legal_notice', 
    name: 'Legal Notice', 
    category: 'Civil', 
    icon: '📬',
    fields: [
      { id: 'sender', label: 'Sender Details', placeholder: 'Name and Address of Sender' },
      { id: 'receiver', label: 'Receiver Details', placeholder: 'Name and Address of Receiver' },
      { id: 'subject', label: 'Subject', placeholder: 'e.g. Notice for Recovery of Money / Breach of Contract' },
      { id: 'facts', label: 'Facts of Dispute', placeholder: 'Detailed account of the dispute and prior communication...', type: 'textarea' },
      { id: 'demand', label: 'Legal Demand', placeholder: 'What do you want the receiver to do? (e.g. Pay ₹X within 15 days)', type: 'textarea' }
    ]
  },
  { 
    id: 'stay_order', 
    name: 'Stay Order Application', 
    category: 'Civil', 
    icon: '🛑',
    fields: [
      { id: 'court', label: 'Court Name', placeholder: 'e.g. In the Court of Civil Judge...' },
      { id: 'case_no', label: 'Main Case Number', placeholder: 'Case No. / Year' },
      { id: 'applicant', label: 'Applicant', placeholder: 'Full Name' },
      { id: 'respondent', label: 'Respondent', placeholder: 'Opposite Party Name' },
      { id: 'stay_reason', label: 'Reason for Stay', placeholder: 'Why is an immediate stay required? (Irreparable loss, etc.)', type: 'textarea' },
      { id: 'relief', label: 'Specific Relief', placeholder: 'What exactly should be stayed?', type: 'textarea' }
    ]
  }
];

export const LegalTemplates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEMPLATES[0] | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateTemplate = async () => {
    if (!selectedTemplate) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: `You are an expert Indian legal document drafter with 30 years of experience in High Courts and the Supreme Court.
        Draft a professional, court-ready ${selectedTemplate.name} in English.
        
        USER PROVIDED DETAILS:
        ${Object.entries(formData).map(([k, v]) => `${k.toUpperCase()}: ${v}`).join('\n')}
        
        CRITICAL DRAFTING INSTRUCTIONS:
        1. LANGUAGE: Use formal, archaic Indian legal English (e.g., 'Humbly Sheweth', 'Most Respectfully', 'The Petitioner begs to state as under').
        2. STRUCTURE: Follow the standard format:
           - Court Heading (In the Court of...)
           - Case Number/Year (Leave blank if not provided)
           - Parties (Petitioner vs Respondent)
           - Subject/Title of the Application
           - Preamble/Intro
           - Point-wise Facts and Grounds
           - Prayer (The specific relief sought)
           - Verification/Affidavit section
        3. PLACEHOLDERS: 
           - DO NOT leave placeholders for information provided in the "USER PROVIDED DETAILS" above.
           - For missing information that is MANDATORY for a legal document (like Date, Place, Advocate Signature), use clear placeholders like [DATE], [PLACE], [ADVOCATE SIGNATURE].
           - If a field is missing but not strictly mandatory for the draft's structure, omit the placeholder and draft around it professionally.
        4. LEGAL ACCURACY: Mention relevant sections of IPC, CrPC, CPC, or BNS/BNSS as applicable to the ${selectedTemplate.name}.
        
        Provide ONLY the drafted document text. No conversational filler.`,
        config: {
          maxOutputTokens: 1500,
          temperature: 0.4
        }
      });
      setResult(response.text || "Template generated successfully.");
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')
        ? "AI service is currently busy due to high demand. Please try again in a moment."
        : "Error generating legal document. Please try again later.";
      setResult(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const downloadDocument = () => {
    if (!result || !selectedTemplate) return;
    const element = document.createElement("a");
    const file = new Blob([result], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${selectedTemplate.name.replace(/\s+/g, '_')}_Draft.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-gold">Legal Templates</h1>
        <p className="text-text-muted">Draft professional legal documents instantly with AI assistance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template Selection Grid */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h3 className="text-lg font-serif font-bold">Select Template</h3>
          <div className="grid grid-cols-1 gap-3">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTemplate(t);
                  setResult(null);
                  setFormData({});
                }}
                className={`
                  p-4 bg-bg2 border border-border rounded-xl flex items-center gap-4 transition-all group
                  ${selectedTemplate?.id === t.id ? 'ring-2 ring-gold ring-inset bg-gold/5' : 'hover:border-gold/50'}
                `}
              >
                <div className="w-10 h-10 rounded-full bg-bg3 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  {t.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-sm">{t.name}</span>
                  <span className="text-[10px] text-text-dim uppercase font-bold tracking-widest">{t.category}</span>
                </div>
                <ChevronRight size={16} className={`ml-auto ${selectedTemplate?.id === t.id ? 'text-gold' : 'text-text-dim opacity-0 group-hover:opacity-100'} transition-all`} />
              </button>
            ))}
          </div>
        </div>

        {/* Form and Result */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {selectedTemplate ? (
              <motion.div 
                key={selectedTemplate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col gap-6"
              >
                <Card className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <FileText size={20} />
                      </div>
                      <h3 className="text-xl font-serif font-bold">{selectedTemplate.name} Details</h3>
                    </div>
                    <Pill bg="rgba(196,148,40,0.12)" fg="#C49428">{selectedTemplate.category}</Pill>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTemplate.fields.map(field => (
                      <div key={field.id} className={`flex flex-col gap-2 ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
                        <label className="text-[10px] uppercase font-bold text-text-dim">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea 
                            rows={4}
                            className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all resize-none text-text"
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                          />
                        ) : (
                          <input 
                            type="text" 
                            className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all text-text"
                            placeholder={field.placeholder}
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Btn 
                      onClick={() => {
                        setFormData({});
                        setResult(null);
                      }} 
                      variant="ghost" 
                      className="flex-1"
                    >
                      Clear Form
                    </Btn>
                    <Btn 
                      onClick={generateTemplate} 
                      disabled={loading || Object.keys(formData).length === 0} 
                      className="flex-[2] py-3"
                    >
                      {loading ? <Spin /> : <><Sparkles size={18} /> Generate Document</>}
                    </Btn>
                  </div>
                </Card>

                {result && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-4"
                  >
                    <Card className="border border-gold/30 bg-gold/5 flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-success" size={20} />
                          <h3 className="font-serif font-bold">Generated Document</h3>
                        </div>
                        <Btn onClick={downloadDocument} variant="ghost" className="text-xs py-1.5 px-3 border border-gold/30 text-gold hover:bg-gold hover:text-bg">
                          <Download size={14} /> Download .txt
                        </Btn>
                      </div>
                      <div className="bg-bg2 p-8 rounded-lg border border-border shadow-inner max-h-[600px] overflow-y-auto font-serif text-sm leading-relaxed whitespace-pre-wrap text-text-muted">
                        {result}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center p-24 bg-bg2 border border-border border-dashed rounded-xl text-text-dim italic">
                <FileText size={64} className="mb-4 opacity-10" />
                <p>Select a template from the left to begin drafting.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
