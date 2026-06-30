export interface TeamMember {
  name: string;
  role: string;
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'in_progress' | 'completed' | 'on_hold';
  deadline: string;
  teamMembers: number;
  members: TeamMember[];
  progress: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'presentation';
  uploadDate: string;
  size: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  projectId: string;
  senderName: string;
  senderInitials: string;
  message: string;
  timestamp: string;
}

export interface Highlight {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: 'feedback' | 'reminder' | 'pointer';
  date: string;
  author: string;
}
