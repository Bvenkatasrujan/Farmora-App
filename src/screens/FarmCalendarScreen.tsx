import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Droplet,
  FlaskConical,
  Sprout,
  ShoppingCart,
  Beef,
  CloudRain,
  Calendar as CalendarIcon,
  Plus,
  X,
  Check,
  Trash2,
  Clock,
} from 'lucide-react-native';
import { Card } from '../components/ui/Card';
import { FarmoraColors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';
import { mockTasks } from '../data/mockTasks';
import { DailyTasks, FarmingTask, TaskCategory } from '../types/calendar';
import { scheduleLocalReminderNotification, cancelScheduledNotification } from '../utils/notifications';
import { HomeHeader } from '../components/HomeHeader';

const { width } = Dimensions.get('window');

// ── Today helper ─────────────────────────────────────────────────────────────
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

interface ExtendedTask extends FarmingTask {
  priority?: TaskPriority;
  notificationId?: string;
}
type ExtendedDailyTasks = Record<string, ExtendedTask[]>;

const TASK_TYPES: { key: TaskCategory; label: string; color: string }[] = [
  { key: 'irrigation', label: 'Irrigation', color: '#3b82f6' },
  { key: 'fertilizer', label: 'Fertilizer', color: '#15803d' },
  { key: 'pesticide', label: 'Pesticide', color: '#f97316' },
  { key: 'harvest', label: 'Harvest', color: '#d97706' },
  { key: 'market', label: 'Market', color: '#8b5cf6' },
  { key: 'livestock', label: 'Livestock', color: '#ec4899' },
  { key: 'weather', label: 'Weather', color: '#0891b2' },
];

const PRIORITY_LEVELS: { key: TaskPriority; label: string; bg: string; text: string }[] = [
  { key: 'low', label: 'Low', bg: '#f1f5f9', text: '#64748b' },
  { key: 'normal', label: 'Normal', bg: '#dcfce7', text: '#15803d' },
  { key: 'high', label: 'High', bg: '#fef3c7', text: '#b45309' },
  { key: 'urgent', label: 'Urgent', bg: '#fee2e2', text: '#dc2626' },
];

function getTaskTypeIcon(type: TaskCategory, color: string, size = 16) {
  switch (type) {
    case 'irrigation': return <Droplet size={size} color={color} />;
    case 'fertilizer': return <FlaskConical size={size} color={color} />;
    case 'pesticide': return <Sprout size={size} color={color} />;
    case 'harvest': return <Sprout size={size} color={color} />;
    case 'market': return <ShoppingCart size={size} color={color} />;
    case 'livestock': return <Beef size={size} color={color} />;
    case 'weather': return <CloudRain size={size} color={color} />;
    default: return <CalendarIcon size={size} color={color} />;
  }
}

function getTypeColor(type: TaskCategory): string {
  return TASK_TYPES.find(t => t.key === type)?.color ?? '#15803d';
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FarmCalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, unreadNotificationsCount, createNotification } = useAppStore();

  const displayName = profile?.full_name || 'Farmer';
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150';

  // ── State ─────────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [tasks, setTasks] = useState<ExtendedDailyTasks>(mockTasks as ExtendedDailyTasks);

  // Add Task Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newType, setNewType] = useState<TaskCategory>('irrigation');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('normal');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // ── Calendar Grid ─────────────────────────────────────────────────────────
  const daysInGrid = useMemo(() => {
    const days: { dayNum: number; isCurrentMonth: boolean; dateString: string }[] = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDayNum = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 12 : month;
      const prevYear = month === 0 ? year - 1 : year;
      days.push({
        dayNum: prevDayNum,
        isCurrentMonth: false,
        dateString: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevDayNum).padStart(2, '0')}`,
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: true,
        dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    const totalCells = days.length > 35 ? 42 : 35;
    const nextMonth = month === 11 ? 1 : month + 2;
    const nextYear = month === 11 ? year + 1 : year;
    for (let i = 1; i <= totalCells - days.length; i++) {
      days.push({
        dayNum: i,
        isCurrentMonth: false,
        dateString: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      });
    }

    return days;
  }, [year, month]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const jumpToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayStr);
  };

  // ── Dot Indicators ────────────────────────────────────────────────────────
  const getDayDots = useCallback((dateStr: string): string[] => {
    const dayTasks = tasks[dateStr];
    if (!dayTasks || dayTasks.length === 0) return [];
    const colors = new Set<string>();
    dayTasks.forEach(t => colors.add(getTypeColor(t.type)));
    return Array.from(colors).slice(0, 3);
  }, [tasks]);

  // ── Task Actions ──────────────────────────────────────────────────────────
  const handleToggleTask = (taskId: string) => {
    setTasks(prev => {
      const updated = { ...prev };
      const dayList = updated[selectedDate] || [];
      updated[selectedDate] = dayList.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return updated;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = dayTasks.find(t => t.id === taskId);
    Alert.alert('Delete Task', 'Remove this task from your calendar?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (taskToDelete?.notificationId) {
            await cancelScheduledNotification(taskToDelete.notificationId);
          }
          setTasks(prev => {
            const updated = { ...prev };
            updated[selectedDate] = (updated[selectedDate] || []).filter(t => t.id !== taskId);
            return updated;
          });
        },
      },
    ]);
  };

  const parseDateTime = (dateStr: string, timeStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    let hours = 8;
    let minutes = 0;
    
    const matches = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
    if (matches) {
      hours = parseInt(matches[1], 10);
      minutes = parseInt(matches[2], 10);
      const ampm = matches[3];
      if (ampm) {
        if (ampm.toUpperCase() === 'PM' && hours < 12) {
          hours += 12;
        } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
      }
    }
    
    return new Date(year, month - 1, day, hours, minutes, 0);
  };

  const handleAddTask = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }
    const newTask: ExtendedTask = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      time: newTime,
      type: newType,
      notes: newNotes.trim() || undefined,
      priority: newPriority,
      completed: false,
    };

    const scheduledDate = parseDateTime(selectedDate, newTime);
    const now = new Date();
    
    if (scheduledDate > now) {
      try {
        const id = await scheduleLocalReminderNotification(
          newTask.title,
          newTask.notes || `Farming Task: ${newTask.title}`,
          scheduledDate,
          { screen: '/(tabs)/calendar' }
        );
        if (id) {
          newTask.notificationId = id;
        }
      } catch (err) {
        console.warn('[CalendarScreen] Failed to schedule notification:', err);
      }
    }

    // Add to notifications center dynamically
    try {
      const dateObj = new Date(selectedDate);
      const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      createNotification(
        `Reminder Set: ${newTask.title}`,
        `Task (${newType}) scheduled for ${newTime} on ${dateStr}.`,
        'system'
      );
    } catch (err) {
      console.warn('[CalendarScreen] Failed to add notification center entry:', err);
    }

    setTasks(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newTask],
    }));
    // Reset form
    setNewTitle('');
    setNewTime('08:00 AM');
    setNewType('irrigation');
    setNewNotes('');
    setNewPriority('normal');
    setShowAddModal(false);
  };

  const dayTasks = useMemo(() => tasks[selectedDate] || [], [tasks, selectedDate]);

  const selectedDateDisplay = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  }, [selectedDate]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: FarmoraColors.background }}>
      <HomeHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Green Header */}
        <View style={styles.greenHeader}>
          <View>
            <Text style={styles.greetingText}>Good Morning, {displayName} 🌱</Text>
            <Text style={styles.greetingSubtext}>{monthNames[today.getMonth()]} {today.getFullYear()}</Text>
          </View>
          <TouchableOpacity onPress={jumpToToday} style={styles.todayBadge}>
            <CalendarIcon size={12} color="#fff" />
            <Text style={styles.todayBadgeText}>Today</Text>
          </TouchableOpacity>
        </View>

        {/* ── Calendar Widget ── */}
        <View style={{ paddingHorizontal: 20, marginTop: -36 }}>
          <Card variant="white" style={styles.calendarCard}>
            {/* Month Header */}
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 4 }}>
                  <ChevronLeft size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNextMonth} style={{ padding: 4 }}>
                  <ChevronRight size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Day Labels */}
            <View style={styles.dayLabelsRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                <Text key={i} style={styles.dayLabel}>{d}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {daysInGrid.map((dayItem, index) => {
                const isSelected = dayItem.dateString === selectedDate;
                const isToday = dayItem.dateString === todayStr;
                const dots = getDayDots(dayItem.dateString);

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedDate(dayItem.dateString);
                      if (!dayItem.isCurrentMonth) {
                        setCurrentMonth(new Date(
                          parseInt(dayItem.dateString.split('-')[0]),
                          parseInt(dayItem.dateString.split('-')[1]) - 1,
                          1
                        ));
                      }
                    }}
                    style={styles.dayCell}
                  >
                    <View style={[
                      styles.dayCircle,
                      isSelected && styles.dayCircleSelected,
                      isToday && !isSelected && styles.dayCircleToday,
                    ]}>
                      <Text style={[
                        styles.dayNumber,
                        isSelected && styles.dayNumberSelected,
                        isToday && !isSelected && styles.dayNumberToday,
                        !dayItem.isCurrentMonth && styles.dayNumberFaded,
                      ]}>
                        {dayItem.dayNum}
                      </Text>
                    </View>
                    {/* Task dots */}
                    <View style={styles.dotsRow}>
                      {dots.map((color, di) => (
                        <View key={di} style={[styles.dot, { backgroundColor: color }]} />
                      ))}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend */}
            <View style={styles.legendRow}>
              {[
                { label: 'Irrigation', color: '#3b82f6' },
                { label: 'Fertilizer', color: '#15803d' },
                { label: 'Harvest', color: '#d97706' },
                { label: 'Market', color: '#8b5cf6' },
                { label: 'Weather', color: '#0891b2' },
              ].map((leg, i) => (
                <View key={i} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: leg.color }]} />
                  <Text style={styles.legendText}>{leg.label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* ── Daily Tasks Section ── */}
        <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Tasks</Text>
              <Text style={styles.sectionSubtitle} numberOfLines={1}>{selectedDateDisplay}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={styles.addTaskBtn}
            >
              <Plus size={16} color="#fff" />
              <Text style={styles.addTaskBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>

          {dayTasks.length > 0 ? (
            <View style={{ gap: 12 }}>
              {dayTasks.map((task, idx) => {
                const isCompleted = !!task.completed;
                const typeColor = getTypeColor(task.type);
                const priorityInfo = PRIORITY_LEVELS.find(p => p.key === (task as ExtendedTask).priority) ?? PRIORITY_LEVELS[1];

                return (
                  <View key={task.id} style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                    {/* Timeline */}
                    <View style={{ alignItems: 'center', width: 40 }}>
                      <View style={[styles.timelineNode, { backgroundColor: typeColor + '20' }]}>
                        {getTaskTypeIcon(task.type, typeColor, 16)}
                      </View>
                      {idx < dayTasks.length - 1 && <View style={styles.timelineLine} />}
                    </View>

                    {/* Card */}
                    <View style={[styles.taskCard, isCompleted && { opacity: 0.7 }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          {/* Time */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                            <Clock size={10} color="#94a3b8" />
                            <Text style={styles.taskTime}>{task.time}</Text>
                          </View>
                          {/* Title */}
                          <Text style={[
                            styles.taskTitle,
                            isCompleted && { textDecorationLine: 'line-through', color: '#94a3b8' },
                          ]}>
                            {task.title}
                          </Text>
                          {/* Notes */}
                          {task.notes ? (
                            <Text style={styles.taskNotes}>{task.notes}</Text>
                          ) : null}
                          {/* Priority badge */}
                          <View style={[styles.priorityBadge, { backgroundColor: priorityInfo.bg }]}>
                            <Text style={[styles.priorityText, { color: priorityInfo.text }]}>
                              {priorityInfo.label.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        {/* Actions */}
                        <View style={{ alignItems: 'center', gap: 8 }}>
                          {/* Toggle */}
                          <TouchableOpacity
                            onPress={() => handleToggleTask(task.id)}
                            style={[styles.checkbox, isCompleted && { backgroundColor: FarmoraColors.primary, borderColor: FarmoraColors.primary }]}
                          >
                            {isCompleted && <Check size={12} color="#fff" />}
                          </TouchableOpacity>
                          {/* Delete */}
                          <TouchableOpacity onPress={() => handleDeleteTask(task.id)}>
                            <Trash2 size={14} color="#f87171" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={styles.emptyState}
            >
              <View style={styles.emptyIcon}>
                <Plus size={22} color={FarmoraColors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No tasks for this day</Text>
              <Text style={styles.emptySubtitle}>Tap to add your first task for {selectedDateDisplay}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── Add Task Modal ─────────────────────────────────────────────────── */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
            style={{ flex: 1 }}
          />
          <View style={styles.modalSheet}>
            {/* Handle bar */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Task</Text>
                <Text style={styles.modalSubtitle}>{selectedDateDisplay}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalClose}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Task Title */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Task Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Irrigate Field 2"
                  placeholderTextColor="#94a3b8"
                  value={newTitle}
                  onChangeText={setNewTitle}
                  autoFocus
                />
              </View>

              {/* Time */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Time</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 08:00 AM"
                  placeholderTextColor="#94a3b8"
                  value={newTime}
                  onChangeText={setNewTime}
                />
              </View>

              {/* Task Type */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Task Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                    {TASK_TYPES.map(type => (
                      <TouchableOpacity
                        key={type.key}
                        onPress={() => setNewType(type.key)}
                        style={[
                          styles.typeChip,
                          newType === type.key && { backgroundColor: type.color, borderColor: type.color },
                        ]}
                      >
                        {getTaskTypeIcon(type.key, newType === type.key ? '#fff' : type.color, 13)}
                        <Text style={[
                          styles.typeChipText,
                          { color: newType === type.key ? '#fff' : type.color },
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Priority */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Priority</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {PRIORITY_LEVELS.map(p => (
                    <TouchableOpacity
                      key={p.key}
                      onPress={() => setNewPriority(p.key)}
                      style={[
                        styles.priorityChip,
                        { backgroundColor: newPriority === p.key ? p.bg : '#f8fafc' },
                        { borderColor: newPriority === p.key ? p.text : '#e2e8f0' },
                      ]}
                    >
                      <Text style={[styles.priorityChipText, { color: newPriority === p.key ? p.text : '#94a3b8' }]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Notes (optional)</Text>
                <TextInput
                  style={[styles.textInput, { height: 72, textAlignVertical: 'top', paddingTop: 12 }]}
                  placeholder="Add any details or location..."
                  placeholderTextColor="#94a3b8"
                  value={newNotes}
                  onChangeText={setNewNotes}
                  multiline
                />
              </View>

              {/* Submit */}
              <TouchableOpacity onPress={handleAddTask} style={styles.submitBtn}>
                <Plus size={16} color="#fff" />
                <Text style={styles.submitBtnText}>Add Task to Calendar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f8ee',
  },
  topBarTitle: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '800',
    color: FarmoraColors.primary,
  },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e8f0e4',
  },

  // Green header
  greenHeader: {
    backgroundColor: FarmoraColors.primary,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greetingSubtext: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#a7f3d0',
    marginTop: 3,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  todayBadgeText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Calendar Card
  calendarCard: {
    borderRadius: 28,
    padding: 16,
    shadowColor: '#166534',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '800',
    color: FarmoraColors.textDark,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    width: 34,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: 6,
  },
  dayCell: {
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: FarmoraColors.primary,
  },
  dayCircleToday: {
    backgroundColor: '#dcfce7',
    borderWidth: 2,
    borderColor: FarmoraColors.primary,
  },
  dayNumber: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: FarmoraColors.textDark,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayNumberToday: {
    color: FarmoraColors.primary,
    fontWeight: '800',
  },
  dayNumberFaded: {
    color: '#cbd5e1',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 5,
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 14,
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: 'Inter',
    fontSize: 8,
    fontWeight: '700',
    color: '#94a3b8',
  },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeader2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '800',
    color: FarmoraColors.textDark,
  },
  sectionSubtitle: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
    maxWidth: width * 0.55,
  },
  seeAllText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '700',
    color: FarmoraColors.primary,
  },
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: FarmoraColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addTaskBtnText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Task cards
  timelineNode: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 36,
    bottom: -12,
    width: 2,
    backgroundColor: '#e2e8f0',
    zIndex: 1,
  },
  taskCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#f1f8ee',
    borderRadius: 20,
    padding: 14,
    marginLeft: 12,
  },
  taskTime: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  taskTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
    color: FarmoraColors.textDark,
    marginTop: 2,
  },
  taskNotes: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 3,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 8,
  },
  priorityText: {
    fontFamily: 'Inter',
    fontSize: 8,
    fontWeight: '800',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty state
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#f1f8ee',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
    color: FarmoraColors.textDark,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
  },


  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '92%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '800',
    color: FarmoraColors.textDark,
  },
  modalSubtitle: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: FarmoraColors.textDark,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  typeChipText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
  },
  priorityChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  priorityChipText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FarmoraColors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 8,
    marginBottom: 8,
  },
  submitBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
