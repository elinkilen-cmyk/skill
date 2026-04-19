import { useState, useEffect } from 'react';
import type { Employee, Comment, Board } from './types';
import { INITIAL_EMPLOYEES, PERFORMANCE_LABELS, POTENTIAL_LABELS, CELL_COLORS, BOARDS } from './data';
import CommentModal from './CommentModal';
import AddEmployeeModal from './AddEmployeeModal';
import CommentsView from './CommentsView';
import './index.css';

const STORAGE_KEY = 'succession-employees';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function avatarFallback(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c9cc0&color=fff&size=150`;
}

function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_EMPLOYEES;
    // Migration: add default board if missing
    return (JSON.parse(raw) as Employee[]).map(e => ({ ...e, board: e.board ?? ('konsulent' as Board) }));
  } catch {
    return INITIAL_EMPLOYEES;
  }
}

type View = 'grid' | 'comments';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);
  const [currentBoard, setCurrentBoard] = useState<Board>('konsulent');
  const [view, setView] = useState<View>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(employees)); }, [employees]);

  const selectedEmployee = employees.find((e) => e.id === selectedId) ?? null;
  const boardEmployees = employees.filter(e => e.board === currentBoard);

  function update(id: string, patch: Partial<Employee>) {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }

  function addEmployee(data: Omit<Employee, 'id' | 'comments' | 'gridPosition'>) {
    setEmployees(prev => [...prev, { ...data, id: generateId(), comments: [], gridPosition: null }]);
    setShowAdd(false);
  }

  function deleteEmployee(id: string) {
    setEmployees(prev => prev.filter(e => e.id !== id));
    setSelectedId(null);
  }

  function addComment(employeeId: string, comment: Comment) {
    update(employeeId, { comments: [...(employees.find(e => e.id === employeeId)?.comments ?? []), comment] });
  }

  function deleteComment(employeeId: string, commentId: string) {
    const emp = employees.find(e => e.id === employeeId);
    if (emp) update(employeeId, { comments: emp.comments.filter(c => c.id !== commentId) });
  }

  function onDropCell(row: number, col: number) {
    if (draggingId) update(draggingId, { gridPosition: { row, col } });
    setDraggingId(null);
    setDragOver(null);
  }

  function onDropSidebar() {
    if (draggingId) update(draggingId, { gridPosition: null });
    setDraggingId(null);
    setDragOver(null);
  }

  const unplaced = boardEmployees.filter(e => !e.gridPosition);

  function cellEmployees(row: number, col: number) {
    return boardEmployees.filter(e => e.gridPosition?.row === row && e.gridPosition?.col === col);
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="board-tabs">
          {BOARDS.map(b => (
            <button
              key={b.id}
              className={`board-tab${currentBoard === b.id && view === 'grid' ? ' active' : ''}`}
              onClick={() => { setCurrentBoard(b.id); setView('grid'); }}
            >
              {b.label}
              <span className="board-count">{employees.filter(e => e.board === b.id).length}</span>
            </button>
          ))}
        </div>
        <div className="header-right">
          <div className="view-toggle">
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>Rutenett</button>
            <button className={view === 'comments' ? 'active' : ''} onClick={() => setView('comments')}>
              Kommentarer
              {employees.reduce((n, e) => n + e.comments.length, 0) > 0 && (
                <span className="board-count">{employees.reduce((n, e) => n + e.comments.length, 0)}</span>
              )}
            </button>
          </div>
          <button className="btn-add" onClick={() => setShowAdd(true)}>+ Legg til person</button>
        </div>
      </div>

      {/* Comments view */}
      {view === 'comments' && (
        <CommentsView
          employees={employees}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
          onSelectEmployee={(id) => { setSelectedId(id); setView('grid'); setCurrentBoard(employees.find(e => e.id === id)?.board ?? currentBoard); }}
        />
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="main-layout">
          <div className="grid-wrapper">
            <div className="y-axis-label">POTENSIALE</div>
            <div className="grid-area">
              {[2, 1, 0].map((row) => (
                <div key={row} className="grid-row">
                  <div className="row-label">{POTENTIAL_LABELS[row]}</div>
                  {[0, 1, 2, 3, 4].map((col) => {
                    const key = `${row}-${col}`;
                    const isOver = dragOver === key;
                    return (
                      <div
                        key={col}
                        className={`cell${isOver ? ' cell-over' : ''}`}
                        style={{ backgroundColor: CELL_COLORS[row][col] }}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(key); }}
                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
                        onDrop={() => onDropCell(row, col)}
                      >
                        {cellEmployees(row, col).map(emp => (
                          <Avatar key={emp.id} employee={emp} onDragStart={() => setDraggingId(emp.id)} onClick={() => setSelectedId(emp.id)} />
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="col-labels-row">
                <div className="row-label-spacer" />
                {PERFORMANCE_LABELS.map((label, i) => (
                  <div key={i} className="col-label">
                    {label.split('\n').map((line, j, arr) => (
                      <span key={j}>{line}{j < arr.length - 1 && <br />}</span>
                    ))}
                    {i === 2 && <div className="x-axis-label">PRESTASJON →</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className={`sidebar${dragOver === 'sidebar' ? ' cell-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver('sidebar'); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
            onDrop={onDropSidebar}
          >
            <div className="sidebar-title">Ikke plassert</div>
            {unplaced.map(emp => (
              <Avatar key={emp.id} employee={emp} onDragStart={() => setDraggingId(emp.id)} onClick={() => setSelectedId(emp.id)} />
            ))}
            {unplaced.length === 0 && <p className="sidebar-empty">Alle plassert ✓</p>}
          </div>
        </div>
      )}

      {selectedEmployee && (
        <CommentModal
          employee={selectedEmployee}
          onClose={() => setSelectedId(null)}
          onAddComment={(comment) => addComment(selectedEmployee.id, comment)}
          onDeleteComment={(commentId) => deleteComment(selectedEmployee.id, commentId)}
          onDeleteEmployee={() => deleteEmployee(selectedEmployee.id)}
          onUpdatePhoto={(photoUrl) => update(selectedEmployee.id, { photoUrl })}
          onUpdateEmployee={(updates) => update(selectedEmployee.id, updates)}
        />
      )}

      {showAdd && (
        <AddEmployeeModal
          onClose={() => setShowAdd(false)}
          onAdd={addEmployee}
          defaultBoard={currentBoard}
        />
      )}
    </div>
  );
}

interface AvatarProps { employee: Employee; onDragStart: () => void; onClick: () => void; }

function Avatar({ employee, onDragStart, onClick }: AvatarProps) {
  return (
    <div className="avatar-wrapper" draggable onDragStart={onDragStart} onClick={onClick}
      title={`${employee.name}${employee.title ? ' – ' + employee.title : ''}`}>
      <img src={employee.photoUrl} alt={employee.name} className="avatar-img"
        onError={(e) => { (e.target as HTMLImageElement).src = avatarFallback(employee.name); }} />
      {employee.comments.length > 0 && <span className="comment-badge">{employee.comments.length}</span>}
    </div>
  );
}
