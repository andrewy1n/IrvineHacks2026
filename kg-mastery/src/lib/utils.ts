import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ConceptNode } from '@/types';
import { confidenceToNodeFill } from './colors';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusFromConfidence = (confidence: number): ConceptNode['status'] => {
  if (confidence >= 0.8) return 'mastered';
  if (confidence >= 0.6) return 'on_track';
  if (confidence >= 0.4) return 'building';
  if (confidence > 0) return 'developing';
  return 'not_started';
};

export const STATUS_COLORS: Record<ConceptNode['status'], string> = {
  not_started: '#e2e8f0', // slate-200
  developing: '#fed7aa', // orange-200
  building: '#fef08a', // yellow-200
  on_track: '#d9f99d', // lime-200
  mastered: '#bbf7d0', // green-200
};

export const STATUS_LABELS: Record<ConceptNode['status'], string> = {
  not_started: 'Not Started',
  developing: 'Developing',
  building: 'Building',
  on_track: 'On Track',
  mastered: 'Mastered',
};
