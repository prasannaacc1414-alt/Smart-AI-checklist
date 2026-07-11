export interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // HH:MM:SS
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  lastUpdated: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  error?: boolean;
}
