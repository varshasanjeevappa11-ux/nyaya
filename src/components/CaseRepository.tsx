import React, { useState } from 'react';
import { Case, CaseStatus, User as UserType } from '../types';
import { CASES, STATUS_COLORS } from '../constants';
import { Card, Pill, Btn, Spin } from './UI';
import { Search, Filter, ChevronRight, Calendar, MapPin, Scale, X, Info, User, Briefcase, Plus, Key, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

interface CaseRepositoryProps {
  initialCourt?: string;
  currentUser: UserType;
}

export const CaseRepository: React.FC<CaseRepositoryProps> = ({ initialCourt, currentUser }) => {
  const [allCases, setAllCases] = useState<Case[]>(CASES);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CaseStatus | 'All'>('All');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCase, setNewCase] = useState<Partial<Case>>({
    status: 'Filed',
    complexity: 'Medium',
    keyArguments: [],
    lawyer: currentUser.role === 'Lawyer' ? currentUser.name : ''
  });

  const filteredCases = allCases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || c.status === filter;
    const matchesCourt = !initialCourt || c.court === initialCourt;
    return matchesSearch && matchesFilter && matchesCourt;
  });

  const filters: (CaseStatus | 'All')[] = ['All', 'Hearing', 'Filed', 'Judgment Pending', 'Closed'];

  const handleAddCase = (e: React.FormEvent) => {
    e.preventDefault();
    const caseToAdd: Case = {
      ...newCase as Case,
      id: newCase.id || `NS-2025-${String(allCases.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      next: newCase.next || '—',
      keyArguments: newCase.keyArguments || ['Standard legal procedure', 'Evidence review'],
      lawyerWins: 0,
      lawyerTotal: 0,
      lawyerYears: 0,
      defLawyerWins: 0,
      defLawyerTotal: 0,
      defLawyerYears: 0,
    };
    setAllCases([caseToAdd, ...allCases]);
    setShowAddModal(false);
    setNewCase({ status: 'Filed', complexity: 'Medium', keyArguments: [] });
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use a secondary app to create the user without logging out the lawyer
      const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, clientEmail, clientPassword);
      const newClient: UserType = {
        uid: userCredential.user.uid,
        email: clientEmail,
        role: 'Client',
        name: clientName,
        lawyerId: currentUser.uid
      };

      await setDoc(doc(db, 'users', newClient.uid), newClient);
      await signOut(secondaryAuth); // Clean up secondary auth
      
      setShowClientModal(false);
      setClientEmail('');
      setClientPassword('');
      setClientName('');
      alert(`Client account created successfully!\nEmail: ${clientEmail}\nPassword: ${clientPassword}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (c: Case) => {
    const content = `
NYAYASETU - CASE FILE
---------------------
Case ID: ${c.id}
Title: ${c.title}
Type: ${c.type}
Status: ${c.status}
Complexity: ${c.complexity}
Court: ${c.court}
Filed Date: ${c.date}
Next Hearing: ${c.next}

PROSECUTION:
Name: ${currentUser.role === 'Lawyer' ? currentUser.name : c.lawyer}
Bio: ${c.lawyerBio}

DEFENCE:
Name: ${c.defLawyer}
Bio: ${c.defLawyerBio}

JUDGE:
Name: ${c.judge}

KEY ARGUMENTS:
${c.keyArguments.map((arg, i) => `${i + 1}. ${arg}`).join('\n')}

---------------------
Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${c.id}_${c.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-serif font-bold text-gold">Case Repository</h1>
          <p className="text-text-muted">Search and filter through all legal cases on the platform.</p>
        </div>
        <div className="flex gap-3">
          {currentUser.role === 'Lawyer' && (
            <Btn variant="ghost" onClick={() => setShowClientModal(true)} className="shrink-0">
              <Key size={18} /> Create Client ID
            </Btn>
          )}
          <Btn onClick={() => setShowAddModal(true)} className="shrink-0">
            <Plus size={18} /> Add New Case
          </Btn>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-gold transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by Case ID or Title..." 
            className="w-full bg-bg2 border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter size={16} className="text-text-dim shrink-0" />
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                ${filter === f ? 'bg-gold text-bg' : 'bg-bg2 text-text-muted hover:bg-bg3 hover:text-text border border-border'}
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-bg2 text-text-muted text-[10px] uppercase tracking-widest font-bold">
                <th className="p-4 border-b border-border">Case ID</th>
                <th className="p-4 border-b border-border">Type</th>
                <th className="p-4 border-b border-border">Status</th>
                <th className="p-4 border-b border-border">Title</th>
                <th className="p-4 border-b border-border">Managing Team</th>
                <th className="p-4 border-b border-border">Court</th>
                <th className="p-4 border-b border-border">Filed Date</th>
                <th className="p-4 border-b border-border">Next Hearing</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => setSelectedCase(c)}
                  className="hover:bg-bg3 transition-colors border-b border-border last:border-0 group cursor-pointer"
                >
                  <td className="p-4">
                    <Pill bg="rgba(99,179,237,0.1)" fg="#63B3ED">
                      {c.id}
                    </Pill>
                  </td>
                  <td className="p-4">
                    <Pill bg="rgba(110,138,158,0.1)" fg="#6E8A9E">
                      {c.type}
                    </Pill>
                  </td>
                  <td className="p-4">
                    <Pill bg={`${STATUS_COLORS[c.status].bg}33`} fg={STATUS_COLORS[c.status].fg}>
                      {c.status}
                    </Pill>
                  </td>
                  <td className="p-4 font-serif font-semibold text-sm group-hover:text-gold transition-colors">
                    {c.title}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[10px] text-info font-bold">
                        <User size={10} /> {currentUser.role === 'Lawyer' ? currentUser.name : c.lawyer}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-danger font-bold">
                        <User size={10} /> {c.defLawyer}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-text-muted flex items-center gap-1">
                    <MapPin size={12} />
                    {c.court}
                  </td>
                  <td className="p-4 text-xs text-text-dim">
                    {c.date}
                  </td>
                  <td className="p-4 text-xs font-medium text-warn">
                    {c.next}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCases.length === 0 && (
          <div className="p-12 text-center text-text-dim italic">No cases found matching your criteria.</div>
        )}
      </Card>

      {/* Add Case Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border bg-bg2 flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold">Add New Case</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-bg3 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddCase} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-text-dim">Case Title</label>
                    <input 
                      required
                      type="text" 
                      className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                      placeholder="e.g. State vs. John Doe"
                      value={newCase.title || ''}
                      onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-text-dim">Court Name</label>
                    <input 
                      required
                      type="text" 
                      className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                      placeholder="e.g. Delhi High Court"
                      value={newCase.court || ''}
                      onChange={(e) => setNewCase({...newCase, court: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-text-dim">Case Type</label>
                    <select 
                      className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                      value={newCase.type}
                      onChange={(e) => setNewCase({...newCase, type: e.target.value as any})}
                    >
                      <option value="Criminal">Criminal</option>
                      <option value="Civil">Civil</option>
                      <option value="Family">Family</option>
                      <option value="Constitutional">Constitutional</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-text-dim">Status</label>
                    <select 
                      className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                      value={newCase.status}
                      onChange={(e) => setNewCase({...newCase, status: e.target.value as any})}
                    >
                      <option value="Filed">Filed</option>
                      <option value="Hearing">Hearing</option>
                      <option value="Judgment Pending">Judgment Pending</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-text-dim">Petitioner Lawyer</label>
                    <input 
                      required
                      type="text" 
                      className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                      placeholder="Advocate Name"
                      value={newCase.lawyer || ''}
                      onChange={(e) => setNewCase({...newCase, lawyer: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-text-dim">Defence Lawyer</label>
                    <input 
                      required
                      type="text" 
                      className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                      placeholder="Advocate Name"
                      value={newCase.defLawyer || ''}
                      onChange={(e) => setNewCase({...newCase, defLawyer: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-text-dim">Next Hearing Date</label>
                    <input 
                      type="date" 
                      className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                      value={newCase.next || ''}
                      onChange={(e) => setNewCase({...newCase, next: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-text-dim">Complexity</label>
                    <select 
                      className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                      value={newCase.complexity}
                      onChange={(e) => setNewCase({...newCase, complexity: e.target.value as any})}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Very High">Very High</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-text-dim">Defendant Name</label>
                  <input 
                    required
                    type="text" 
                    className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                    placeholder="Full Name"
                    value={newCase.defendant || ''}
                    onChange={(e) => setNewCase({...newCase, defendant: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Btn variant="ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</Btn>
                  <Btn type="submit">Create Case</Btn>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Client Modal */}
      <AnimatePresence>
        {showClientModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClientModal(false)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border bg-bg2 flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold">Create Client ID</h2>
                <button onClick={() => setShowClientModal(false)} className="p-2 hover:bg-bg3 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="p-8 flex flex-col gap-6">
                <p className="text-xs text-text-muted italic">
                  Generate credentials for your client. They will use these to sign in and view their case.
                </p>

                {error && (
                  <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-text-dim">Client Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-bg2 border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
                      placeholder="e.g. Vikram Malhotra"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-text-dim">Client Email (Login ID)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
                    <input 
                      required
                      type="email" 
                      className="w-full bg-bg2 border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
                      placeholder="client@example.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-text-dim">Temporary Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-bg2 border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
                      placeholder="e.g. Client123!"
                      value={clientPassword}
                      onChange={(e) => setClientPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Btn variant="ghost" type="button" onClick={() => setShowClientModal(false)}>Cancel</Btn>
                  <Btn type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Generate & Save'}
                  </Btn>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Case Summary Modal */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCase(null)}
              className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border bg-bg2 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Pill bg="rgba(196,148,40,0.1)" fg="#C49428">{selectedCase.id}</Pill>
                  <h2 className="text-2xl font-serif font-bold">{selectedCase.title}</h2>
                </div>
                <button onClick={() => setSelectedCase(null)} className="p-2 hover:bg-bg3 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-dim">Case Type</span>
                    <span className="text-sm font-semibold">{selectedCase.type}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-dim">Status</span>
                    <Pill bg={`${STATUS_COLORS[selectedCase.status].bg}33`} fg={STATUS_COLORS[selectedCase.status].fg}>
                      {selectedCase.status}
                    </Pill>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-dim">Complexity</span>
                    <span className="text-sm font-semibold text-warn">{selectedCase.complexity}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                    <Info size={18} className="text-gold" /> Case Summary & Analysis
                  </h3>
                  <div className="p-6 bg-bg2 border border-border rounded-xl flex flex-col gap-4">
                    <p className="text-sm text-text-muted leading-relaxed">
                      This {selectedCase.type.toLowerCase()} matter, titled <span className="text-gold font-semibold">"{selectedCase.title}"</span>, 
                      is currently under the jurisdiction of the <span className="text-gold font-semibold">{selectedCase.court}</span>. 
                      The case was filed on {selectedCase.date} and is presently in the <span className="text-gold font-semibold">{selectedCase.status}</span> stage.
                    </p>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-bold uppercase text-text-dim">Key Legal Arguments</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedCase.keyArguments.map((arg, i) => (
                          <li key={i} className="text-xs text-text-muted flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1 shrink-0" />
                            {arg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4">
                    <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                      <User size={18} className="text-info" /> Prosecution
                    </h3>
                    <div className="p-4 bg-bg2 border border-border rounded-xl">
                      <p className="font-bold text-sm">{currentUser.role === 'Lawyer' ? currentUser.name : selectedCase.lawyer}</p>
                      <p className="text-xs text-text-dim italic mt-1">{selectedCase.lawyerBio}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                      <User size={18} className="text-danger" /> Defence
                    </h3>
                    <div className="p-4 bg-bg2 border border-border rounded-xl">
                      <p className="font-bold text-sm">{selectedCase.defLawyer}</p>
                      <p className="text-xs text-text-dim italic mt-1">{selectedCase.defLawyerBio}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-bg2 flex justify-end gap-3">
                <Btn variant="ghost" onClick={() => setSelectedCase(null)}>Close</Btn>
                <Btn onClick={() => handleDownload(selectedCase)}>Download Full File</Btn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
