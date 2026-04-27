export type Role = 'Client' | 'Lawyer' | 'Judge' | 'Court' | 'Builder';

export interface User {
  uid: string;
  email: string;
  role: Role;
  name: string;
  lawyerId?: string;
}

export type CaseStatus = 'Hearing' | 'Filed' | 'Judgment Pending' | 'Closed';
export type CaseType = 'Criminal' | 'Civil' | 'Constitutional' | 'Family';
export type Complexity = 'Low' | 'Medium' | 'High' | 'Very High';

export interface Case {
  id: string;
  title: string;
  type: CaseType;
  court: string;
  date: string;
  status: CaseStatus;
  next: string;
  judge: string;
  lawyer: string;
  lawyerBio: string;
  lawyerWins: number;
  lawyerTotal: number;
  lawyerYears: number;
  defLawyer: string;
  defLawyerBio: string;
  defLawyerWins: number;
  defLawyerTotal: number;
  defLawyerYears: number;
  defendant: string;
  keyArguments: string[];
  complexity: Complexity;
}

export interface Hearing {
  date: string;
  caseId: string;
  court: string;
  time: string;
  type: string;
}

export interface Notification {
  id: string;
  title: string;
  msg: string;
  time: string;
  type: 'warn' | 'info' | 'success' | 'danger' | 'purple';
  read: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface LoginLog {
  id: string;
  uid: string;
  email: string;
  role: Role;
  loginTime: string;
  lastActive: string;
  duration: number; // in minutes
}
