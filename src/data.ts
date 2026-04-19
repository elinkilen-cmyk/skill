import type { Employee, Board } from './types';

export const BOARDS: { id: Board; label: string }[] = [
  { id: 'konsulent',       label: 'Konsulent' },
  { id: 'seniorkonsulent', label: 'Seniorkonsulent' },
  { id: 'rådgiver',        label: 'Rådgiver' },
  { id: 'seniorrådgiver',  label: 'Seniorrådgiver' },
];

export const PERFORMANCE_LABELS = [
  'Godt under\nforventning',
  'Litt under\nforventning',
  'På\nforventning',
  'Litt over\nforventning',
  'Godt over\nforventning',
];

export const POTENTIAL_LABELS = ['Lite', 'Mellom', 'Stort'];

export const CELL_COLORS: string[][] = [
  ['#ffb8b8', '#fdd8c0', '#feeacc', '#fef8c8', '#fef8bc'],
  ['#ffc8c8', '#ffe4c8', '#fff4c0', '#d8edc8', '#c4e4b0'],
  ['#e4f0e4', '#cee8ca', '#b4ddb4', '#8ed08e', '#6abc6a'],
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: '1', name: 'Erik Andersen', title: 'Senior Konsulent', department: 'Strategi',
    photoUrl: 'https://i.pravatar.cc/150?u=erik.andersen',
    board: 'seniorkonsulent', gridPosition: { row: 2, col: 4 }, comments: [],
  },
  {
    id: '2', name: 'Magnus Olsen', title: 'Konsulent', department: 'Teknologi',
    photoUrl: 'https://i.pravatar.cc/150?u=magnus.olsen',
    board: 'konsulent', gridPosition: { row: 1, col: 1 }, comments: [],
  },
  {
    id: '3', name: 'Lars Pettersen', title: 'Junior Konsulent', department: 'Finans',
    photoUrl: 'https://i.pravatar.cc/150?u=lars.pettersen',
    board: 'konsulent', gridPosition: { row: 0, col: 0 }, comments: [],
  },
  {
    id: '4', name: 'Ingrid Larsen', title: 'Partner', department: 'Ledelse',
    photoUrl: 'https://i.pravatar.cc/150?u=ingrid.larsen',
    board: 'seniorrådgiver', gridPosition: null, comments: [],
  },
  {
    id: '5', name: 'Sofia Kristiansen', title: 'Konsulent', department: 'HR',
    photoUrl: 'https://i.pravatar.cc/150?u=sofia.kristiansen',
    board: 'rådgiver', gridPosition: null, comments: [],
  },
  {
    id: '6', name: 'Bjørn Nilsen', title: 'Senior Konsulent', department: 'Marked',
    photoUrl: 'https://i.pravatar.cc/150?u=bjorn.nilsen',
    board: 'seniorkonsulent', gridPosition: null, comments: [],
  },
];
