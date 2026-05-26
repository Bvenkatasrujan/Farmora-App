import { DailyTasks } from '../types/calendar';

// Helper to build a date string for relative days from today
const dateStr = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const mockTasks: DailyTasks = {
  // Today
  [dateStr(0)]: [
    {
      id: 't_today_1',
      title: 'Morning Irrigation',
      time: '06:00 AM',
      type: 'irrigation',
      notes: 'Drip system — Field 1 & 2 (30 mins)',
      completed: false,
    },
    {
      id: 't_today_2',
      title: 'NPK Fertilizer Spray',
      time: '10:00 AM',
      type: 'fertilizer',
      notes: 'Apply to paddy rows — Field 3',
      completed: false,
    },
  ],

  // Yesterday
  [dateStr(-1)]: [
    {
      id: 't_y_1',
      title: 'Weed Removal',
      time: '08:00 AM',
      type: 'pesticide',
      notes: 'Remove weeds in chilli rows',
      completed: true,
    },
    {
      id: 't_y_2',
      title: 'Livestock Check',
      time: '05:00 PM',
      type: 'livestock',
      notes: 'Monthly calf health inspection',
      completed: true,
    },
  ],

  // Day before yesterday
  [dateStr(-2)]: [
    {
      id: 't_2d_1',
      title: 'Market Delivery',
      time: '07:30 AM',
      type: 'market',
      notes: 'Deliver tomatoes to Mandal market',
      completed: true,
    },
  ],

  // Tomorrow
  [dateStr(1)]: [
    {
      id: 't_tom_1',
      title: 'Pesticide Spray',
      time: '07:00 AM',
      type: 'pesticide',
      notes: 'Neem oil spray on cotton field',
      completed: false,
    },
    {
      id: 't_tom_2',
      title: 'Harvest Planning',
      time: '11:00 AM',
      type: 'harvest',
      notes: 'Estimate sugarcane cutting labour needed',
      completed: false,
    },
    {
      id: 't_tom_3',
      title: 'Rain Alert',
      time: '04:00 PM',
      type: 'weather',
      notes: 'Heavy rain expected — secure field equipment',
      completed: false,
    },
  ],

  // Day after tomorrow
  [dateStr(2)]: [
    {
      id: 't_2tom_1',
      title: 'Irrigation',
      time: '06:30 AM',
      type: 'irrigation',
      notes: 'Field 4 watering (sprinkler)',
      completed: false,
    },
    {
      id: 't_2tom_2',
      title: 'Market Visit',
      time: '03:00 PM',
      type: 'market',
      notes: 'Check buyer rates at Kisan Mandi',
      completed: false,
    },
  ],

  // 3 days later
  [dateStr(3)]: [
    {
      id: 't_3d_1',
      title: 'Harvest Sugarcane',
      time: '08:00 AM',
      type: 'harvest',
      notes: 'Start harvesting Field 3 sugarcane bundle',
      completed: false,
    },
  ],
};
