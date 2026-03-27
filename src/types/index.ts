export interface Topic {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Task {
  id: string;
  content: string;
  extractedDatetime?: string;
  extractedEntities?: string[];
  event?: string;
  tags?: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  updatedAt: string;
  reason?: string;
  topicId?: string;
}

export interface CreateTaskPayload {
  content: string;
  extractedDatetime?: string;
  extractedEntities?: string[];
  event?: string;
  topicId?: string;
}

export interface TaskDraft {
  content: string;
  extractedDatetime?: string;
  extractedEntities?: string[];
  event?: string;
  tags?: string[];
  subtasks?: string[];
  confidence: number;
  topicId?: string;
}

export interface ParsedIntent {
  datetime: string;
  entities: string[];
  event: string;
  confidence: number;
  subtasks?: string[];
  conflictWarning?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
}

export interface CreateTopicPayload {
  name: string;
  color?: string;
}

export interface UpdateTopicPayload {
  id: string;
  name?: string;
  color?: string;
}
