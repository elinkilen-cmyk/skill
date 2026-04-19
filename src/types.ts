export type Board = 'konsulent' | 'seniorkonsulent' | 'rådgiver' | 'seniorrådgiver';

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  photoUrl: string;
  board: Board;
  gridPosition: { row: number; col: number } | null;
  comments: Comment[];
}
