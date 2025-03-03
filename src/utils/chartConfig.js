import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartJSTooltip,
  Legend as ChartJSLegend,
  Filler
} from 'chart.js';
import { log, logError } from './logger';

// Chart theme colors
export const chartColors = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
  dark: '#111827',
  light: '#f3f4f6',
  // Pastel variations
  pastelBlue: '#93c5fd',
  pastelPurple: '#c4b5fd',
  pastelGreen: '#a7f3d0',
  pastelRed: '#fca5a5',
  pastelYellow: '#fde68a',
  pastelTeal: '#a5f3fc',
  // Gradient stops
  blueGradient: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.2)'],
  purpleGradient: ['rgba(99, 102, 241, 0.8)', 'rgba(99, 102, 241, 0.2)'],
  greenGradient: ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.2)'],
  redGradient: ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.2)']
};

let isInitialized = false;

// Initialize ChartJS with all required components
const initializeChartJS = () => {
  if (isInitialized) {
    return;
  }

  try {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      ArcElement,
      RadialLinearScale,
      Title,
      ChartJSTooltip,
      ChartJSLegend,
      Filler
    );
    isInitialized = true;
    log('ChartJS', 'Components registered successfully');
  } catch (error) {
    logError('ChartJS', 'Error during registration:', error);
    throw error;
  }
};

// Export initialized instance
export const getChartInstance = () => {
  if (!isInitialized) {
    initializeChartJS();
  }
  return ChartJS;
};

// Initialize on import
initializeChartJS(); 