import React, { useState } from 'react';
import { Card, Pill, Btn } from './UI';
import { HEARINGS, CASES } from '../constants';
import { ChevronLeft, ChevronRight, Clock, MapPin, Scale, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Hearing } from '../types';

export const HearingCalendar: React.FC = () => {
  const [allHearings, setAllHearings] = useState<Hearing[]>(HEARINGS);
  const [viewDate, setViewDate] = useState(new Date(2025, 3, 1)); // April 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHearing, setNewHearing] = useState<Partial<Hearing>>({
    time: '10:00 AM',
    type: 'Hearing'
  });

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const getHearingsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allHearings.filter(h => h.date === dateStr);
  };

  const allUpcoming = [...allHearings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAddHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHearing.date || !newHearing.caseId) return;

    const hearingToAdd: Hearing = {
      ...newHearing as Hearing,
      court: newHearing.court || 'District Court'
    };

    setAllHearings([...allHearings, hearingToAdd]);
    setShowAddModal(false);
    setNewHearing({ time: '10:00 AM', type: 'Hearing' });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-serif font-bold text-gold">Hearing Calendar</h1>
          <p className="text-text-muted">Interactive schedule of upcoming court sessions and legal deadlines.</p>
        </div>
        <Btn onClick={() => setShowAddModal(true)} className="shrink-0">
          <Plus size={18} /> Schedule Hearing
        </Btn>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Calendar Grid */}
        <Card className="xl:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold">{monthName} {year}</h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-bg2 rounded-lg border border-border transition-colors"><ChevronLeft size={18} /></button>
              <button onClick={nextMonth} className="p-2 hover:bg-bg2 rounded-lg border border-border transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-bg2 p-3 text-center text-[10px] uppercase font-bold text-text-dim">{d}</div>
            ))}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-bg p-4 min-h-[100px]" />
            ))}
            {Array.from({ length: numDays }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayHearings = getHearingsForDate(day);
              const isSelected = selectedDate === dateStr;

              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    bg-bg p-2 min-h-[100px] cursor-pointer hover:bg-bg3 transition-colors flex flex-col gap-1
                    ${isSelected ? 'ring-2 ring-gold ring-inset bg-gold/5' : ''}
                  `}
                >
                  <span className={`text-sm font-semibold ${isSelected ? 'text-gold' : 'text-text-muted'}`}>{day}</span>
                  <div className="flex flex-wrap gap-1">
                    {dayHearings.map((h, idx) => {
                      const caseData = CASES.find(c => c.id === h.caseId);
                      const color = caseData?.type === 'Criminal' ? '#FC8181' : caseData?.type === 'Civil' ? '#63B3ED' : '#B794F4';
                      return (
                        <div key={idx} className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} title={h.caseId} />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Details Panel */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h3 className="text-lg font-serif font-bold">
              {selectedDate ? `Hearings for ${selectedDate}` : 'Select a date'}
            </h3>
            <div className="flex flex-col gap-4">
              {selectedDate ? (
                getHearingsForDate(parseInt(selectedDate.split('-')[2])).length > 0 ? (
                  getHearingsForDate(parseInt(selectedDate.split('-')[2])).map((h, idx) => {
                    const caseData = CASES.find(c => c.id === h.caseId);
                    return (
                      <div key={idx} className="p-4 bg-bg2 border border-border rounded-lg flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-bold text-gold">{h.caseId}</span>
                          <Pill bg="rgba(99,179,237,0.1)" fg="#63B3ED">{caseData?.type}</Pill>
                        </div>
                        <p className="text-sm font-serif font-semibold">{caseData?.title}</p>
                        <div className="flex flex-col gap-1 text-xs text-text-muted">
                          <div className="flex items-center gap-2"><Clock size={12} /> {h.time}</div>
                          <div className="flex items-center gap-2"><MapPin size={12} /> {h.court}</div>
                          <div className="flex items-center gap-2"><Scale size={12} /> {h.type}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-text-dim italic text-sm">No hearings scheduled for this date.</div>
                )
              ) : (
                <div className="p-8 text-center text-text-dim italic text-sm">Select a date on the calendar to view details.</div>
              )}
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <h3 className="text-lg font-serif font-bold">All Upcoming</h3>
            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
              {allUpcoming.map((h, idx) => (
                <div key={idx} className="p-3 bg-bg2 border border-border rounded-lg flex items-center justify-between group hover:border-gold transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-gold">{h.date}</span>
                    <span className="text-sm font-serif">{h.caseId}</span>
                  </div>
                  <div className="text-right flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-dim">{h.time}</span>
                    <span className="text-[10px] text-text-muted">{h.court}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Hearing Modal */}
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
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border bg-bg2 flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold">Schedule Hearing</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-bg3 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddHearing} className="p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-text-dim">Case ID</label>
                  <select 
                    required
                    className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                    value={newHearing.caseId || ''}
                    onChange={(e) => setNewHearing({...newHearing, caseId: e.target.value})}
                  >
                    <option value="">Select a Case</option>
                    {CASES.map(c => (
                      <option key={c.id} value={c.id}>{c.id} - {c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-text-dim">Hearing Date</label>
                  <input 
                    required
                    type="date" 
                    className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                    value={newHearing.date || ''}
                    onChange={(e) => setNewHearing({...newHearing, date: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-text-dim">Time</label>
                  <input 
                    required
                    type="text" 
                    className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                    placeholder="e.g. 10:30 AM"
                    value={newHearing.time || ''}
                    onChange={(e) => setNewHearing({...newHearing, time: e.target.value})}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-bold text-text-dim">Hearing Type</label>
                  <input 
                    required
                    type="text" 
                    className="bg-bg2 border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold transition-all"
                    placeholder="e.g. Final Arguments"
                    value={newHearing.type || ''}
                    onChange={(e) => setNewHearing({...newHearing, type: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Btn variant="ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</Btn>
                  <Btn type="submit">Schedule</Btn>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
