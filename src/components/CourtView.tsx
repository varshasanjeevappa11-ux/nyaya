import React, { useState } from 'react';
import { Card, Btn } from './UI';
import { CaseRepository } from './CaseRepository';
import { MapPin, ChevronRight, Scale, Gavel, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COURTS = [
  'Supreme Court of India',
  'Delhi High Court',
  'Bombay High Court',
  'Madras High Court',
  'Calcutta High Court',
  'Allahabad High Court',
  'Karnataka High Court',
  'Gujarat High Court',
  'Rajasthan High Court',
  'Kerala High Court'
];

interface CourtViewProps {
  onSelectCourt: (court: string) => void;
}

export const CourtView: React.FC<CourtViewProps> = ({ onSelectCourt }) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-gold">Court Registry</h1>
        <p className="text-text-muted">Select a jurisdiction to view and manage active case repositories.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURTS.map((court, idx) => (
          <motion.div
            key={court}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card 
              onClick={() => onSelectCourt(court)}
              className="group cursor-pointer hover:border-gold/50 transition-all hover:-translate-y-1 bg-bg2/50 backdrop-blur-sm border-border/50"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-bg3 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-bg transition-all duration-300">
                    {idx === 0 ? <Gavel size={24} /> : <Building2 size={24} />}
                  </div>
                  <ChevronRight size={20} className="text-text-dim group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <h3 className="font-serif font-bold text-lg group-hover:text-gold transition-colors">{court}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-text-dim uppercase tracking-widest font-bold">
                    <MapPin size={10} />
                    {court.includes('High') ? 'State Jurisdiction' : 'National Jurisdiction'}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-dim uppercase font-bold">Active Cases</span>
                    <span className="text-sm font-bold text-gold">
                      {idx === 0 ? '124' : Math.floor(Math.random() * 50) + 20}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-text-dim uppercase font-bold">Registry Status</span>
                    <span className="text-[10px] text-success font-bold flex items-center gap-1 justify-end">
                      <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
