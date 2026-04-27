import React, { useState, useRef } from 'react';
import { Card, Btn, Spin } from './UI';
import { generateContentWithRetry } from '../lib/gemini';
import { FileText, Sparkles, AlertCircle, Upload, X, Image as ImageIcon, File } from 'lucide-react';

export const AISummarizer: React.FC = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ name: string; type: string; data: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        setFiles(prev => [...prev, { 
          name: file.name, 
          type: file.type, 
          data: base64Data.split(',')[1] // Get base64 part
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const summarize = async () => {
    if (!text.trim() && files.length === 0) return;
    setLoading(true);
    setSummary(null);

    try {
      const contents: any[] = [];
      if (text.trim()) {
        contents.push({ text: `Please summarize the following legal text: ${text}` });
      }
      
      files.forEach(file => {
        contents.push({
          inlineData: {
            data: file.data,
            mimeType: file.type
          }
        });
      });

      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: `You are a Senior Indian Legal Analyst with 30 years of experience in the Supreme Court of India. 
            Your task is to provide a high-precision, structured legal summary of the provided content. 
            
            CRITICAL INSTRUCTIONS:
            - Do NOT provide a generic summary. Focus on the specific legal nuances.
            - Use formal Indian legal terminology (e.g., 'Petitioner', 'Respondent', 'Ld. Counsel', 'Impugned Order').
            - If the content is an image, perform OCR and analyze the legal text within.
            
            STRUCTURE YOUR RESPONSE AS FOLLOWS:
            1. **Case Identification**: Title, Court, Case Number, and Date of Filing/Judgment.
            2. **Parties & Representation**: Identify all parties and their respective legal counsels.
            3. **Factual Matrix**: A concise, chronological account of the facts leading to the litigation.
            4. **Substantive Legal Issues**: Clearly state the core questions of law and fact to be determined.
            5. **Statutory Provisions & Precedents**: List specific Acts, Articles of the Constitution, and landmark Judgments (with citations if possible) relied upon.
            6. **Arguments of the Parties**: Summarize the primary contentions of the Petitioner and the Respondent.
            7. **Judicial Reasoning & Conclusion**: If a judgment is provided, explain the court's ratio decidendi and the final order. If it's a petition, state the specific reliefs sought.` },
            ...contents.map(c => c.text ? { text: c.text } : c)
          ]
        },
        config: {
          maxOutputTokens: 1200,
          temperature: 0.3
        }
      });
      setSummary(response.text || "Summary generated successfully.");
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')
        ? "AI service is currently busy due to high demand. Please try again in a moment."
        : "Error generating summary. Please try again later.";
      setSummary(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-gold">AI Legal Summarizer</h1>
        <p className="text-text-muted">Instantly extract key points and legal insights from complex documents, photos, and text.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="text-gold" size={20} />
              <h3 className="font-serif font-bold">Input Legal Content</h3>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs text-gold hover:underline"
            >
              <Upload size={14} /> Upload Files/Photos
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
            />
          </div>

          <textarea 
            rows={8}
            placeholder="Paste legal text, judgments, or petitions here..."
            className="w-full bg-bg2 border border-border rounded-lg p-4 text-sm focus:outline-none focus:border-gold transition-all resize-none font-sans leading-relaxed"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-bg2 border border-border rounded-lg">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-bg3 border border-border px-3 py-1.5 rounded-md group relative">
                  {file.type.startsWith('image/') ? <ImageIcon size={14} className="text-info" /> : <File size={14} className="text-warn" />}
                  <span className="text-[10px] font-medium truncate max-w-[100px]">{file.name}</span>
                  <button 
                    onClick={() => removeFile(idx)}
                    className="text-text-dim hover:text-danger"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-[10px] text-text-dim uppercase font-bold">
              {text.length} chars | {files.length} files
            </span>
            <Btn onClick={summarize} disabled={loading || (!text.trim() && files.length === 0)} className="px-8">
              {loading ? <Spin /> : <><Sparkles size={16} /> Summarize with AI</>}
            </Btn>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 border border-gold/30 bg-gold/5 min-h-[400px]">
          <div className="flex items-center gap-2">
            <Sparkles className="text-gold" size={20} />
            <h3 className="font-serif font-bold">AI Summary Result</h3>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24">
                <Spin />
                <p className="text-sm text-text-dim animate-pulse italic">Analyzing legal terminology and precedents...</p>
              </div>
            ) : summary ? (
              <div className="text-sm text-text-muted leading-relaxed flex flex-col gap-4">
                {summary.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-24 text-text-dim italic text-sm">
                <AlertCircle size={32} className="opacity-10" />
                <p>Paste text or upload files and click 'Summarize' to begin.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
