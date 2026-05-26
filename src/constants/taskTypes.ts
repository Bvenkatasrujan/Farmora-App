import { TaskCategory } from '../types/calendar';

export interface TaskTypeConfig {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const TASK_TYPES: Record<TaskCategory, TaskTypeConfig> = {
  irrigation: {
    label: 'Irrigation',
    emoji: '🌱',
    color: '#2E7D32', // Emerald green
    bgColor: '#E8F5E9',
  },
  fertilizer: {
    label: 'Fertilizer',
    emoji: '🧪',
    color: '#1565C0', // Blue
    bgColor: '#E3F2FD',
  },
  pesticide: {
    label: 'Pesticide',
    emoji: '🛡️',
    color: '#C62828', // Red
    bgColor: '#FFEBEE',
  },
  harvest: {
    label: 'Harvest',
    emoji: '🌾',
    color: '#E65100', // Amber/Orange
    bgColor: '#FFF3E0',
  },
  market: {
    label: 'Market Visit',
    emoji: '🚜',
    color: '#6A1B9A', // Purple
    bgColor: '#F3E5F5',
  },
  livestock: {
    label: 'Livestock',
    emoji: '🐄',
    color: '#4E342E', // Brown
    bgColor: '#EFEBE9',
  },
  weather: {
    label: 'Weather Alert',
    emoji: '☁',
    color: '#F9A825', // Warning Yellow
    bgColor: '#FFFDE7',
  },
};
