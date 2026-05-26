export type TaskCategory = 
  | 'irrigation'
  | 'fertilizer'
  | 'pesticide'
  | 'harvest'
  | 'market'
  | 'livestock'
  | 'weather';

export interface FarmingTask {
  id: string;
  title: string;
  time: string;
  type: TaskCategory;
  notes?: string;
  completed?: boolean;
}

export type DailyTasks = Record<string, FarmingTask[]>;
