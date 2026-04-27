import React from 'react';
import { Card } from './UI';
import { CASES } from '../constants';

export const CaseGraph: React.FC = () => {
  // Data processing
  const types = ['Criminal', 'Civil', 'Constitutional', 'Family'];
  const typeCounts = types.map(t => CASES.filter(c => c.type === t).length);
  const totalCases = CASES.length;

  const statuses = ['Hearing', 'Filed', 'Judgment Pending', 'Closed'];
  const statusCounts = statuses.map(s => CASES.filter(c => c.status === s).length);

  // Donut Chart logic
  let cumulativePercent = 0;
  const donutColors = ['#C49428', '#63B3ED', '#B794F4', '#48BB78'];
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // Bar Chart logic (Filed vs Resolved - Mock data for 6 months)
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const filed = [12, 18, 15, 22, 19, 25];
  const resolved = [8, 14, 12, 18, 15, 20];
  const maxVal = Math.max(...filed, ...resolved);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-gold">Case Analytics</h1>
        <p className="text-text-muted">Visual representation of case distribution and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horizontal Progress Bars: Cases by Status */}
        <Card className="flex flex-col gap-6">
          <h3 className="text-lg font-serif font-bold">Active Cases by Status</h3>
          <div className="flex flex-col gap-6">
            {statuses.map((s, i) => {
              const percent = (statusCounts[i] / totalCases) * 100;
              return (
                <div key={s} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">{s}</span>
                    <span className="font-bold">{statusCounts[i]}</span>
                  </div>
                  <div className="h-2 w-full bg-bg2 rounded-full overflow-hidden border border-border">
                    <div 
                      className="h-full bg-gold transition-all duration-1000" 
                      style={{ width: `${percent}%`, backgroundColor: donutColors[i] }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Court Distribution (Moved up) */}
        <Card className="flex flex-col gap-6">
          <h3 className="text-lg font-serif font-bold">Court Distribution</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Supreme Court', count: 12, trend: '+2' },
              { name: 'Delhi High Court', count: 45, trend: '+5' },
              { name: 'District Courts', count: 128, trend: '+12' },
              { name: 'Tribunals', count: 34, trend: '-3' }
            ].map(court => (
              <div key={court.name} className="p-4 bg-bg2 border border-border rounded-lg flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-text-dim">{court.name}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-serif font-bold text-gold">{court.count}</span>
                  <span className={`text-[10px] ${court.trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>{court.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Bar Chart: Filed vs Resolved */}
        <Card className="lg:col-span-2 flex flex-col gap-6">
          <h3 className="text-lg font-serif font-bold">Filed vs Resolved (Last 6 Months)</h3>
          <div className="h-[300px] w-full relative pt-8">
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                <line 
                  key={i} 
                  x1="0" 
                  y1={`${(1 - p) * 100}%`} 
                  x2="100%" 
                  y2={`${(1 - p) * 100}%`} 
                  stroke="#1C2F45" 
                  strokeDasharray="4 4" 
                />
              ))}
              
              {months.map((m, i) => {
                const x = (i / (months.length - 1)) * 90 + 5;
                const filedH = (filed[i] / maxVal) * 80;
                const resolvedH = (resolved[i] / maxVal) * 80;
                return (
                  <g key={m}>
                    <rect 
                      x={`${x - 2}%`} 
                      y={`${100 - filedH}%`} 
                      width="1.5%" 
                      height={`${filedH}%`} 
                      fill="#C49428" 
                      rx="2" 
                      className="transition-all duration-1000"
                    />
                    <rect 
                      x={`${x + 0.5}%`} 
                      y={`${100 - resolvedH}%`} 
                      width="1.5%" 
                      height={`${resolvedH}%`} 
                      fill="#63B3ED" 
                      rx="2" 
                      className="transition-all duration-1000"
                    />
                    <text x={`${x}%`} y="110%" fill="#6E8A9E" textAnchor="middle" className="text-[10px] uppercase font-bold">
                      {m}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute top-0 right-0 flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gold rounded" />
                <span className="text-text-muted">Filed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-info rounded" />
                <span className="text-text-muted">Resolved</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
