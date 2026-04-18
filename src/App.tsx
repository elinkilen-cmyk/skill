import { useState, useEffect } from 'react';
import type { Employee, Comment } from './types';
import { INITIAL_EMPLOYEES, PERFORMANCE_LABELS, POTENTIAL_LABELS, CELL_COLORS } from './data';
import CommentModal from './CommentModal';
import AddEmployeeModal from './AddEmployeeModal';
import './index.css';

const STORAGE_KEY = 'succession-employees';
const TITLE_KEY = 'succession-title';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function avatarFallback(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c9cc0&color=fff&size=150`;
}

function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_EMPLOYEES;
  } catch {
    return INITIAL_EMPLOYEES;
  }
}

export default function App() {
  const [title, setTitle] = useState(() => localStorage.getItem(TITLE_KEY) || 'Eksempel - Konsulent');
  const [editingTitle, setEditingTitle] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem(TITLE_KEY, title); }, [title]);

  const selectedEmployee = employees.find((e) => e.id === selectedId) ?? null;

  function moveEmployee(id: string, row: number, col: number) {
    setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, gridPosition: { row, col } } : e));
  }

  function unplaceEmployee(id: string) {
    setEmployees((prev) => prev.map((e) => e.id === id ? { ...e, gridPosition: null } : e));
  }

  function addEmployee(data: Omit<Employee, 'id' | 'comments' | 'gridPosition'>) {
    const employee: Employee = { ...data, id: generateId(), comments: [], gridPosition: null };
    setEmployees((prev) => [...prev, employee]);
    setShowAdd(false);
  }

  function deleteEmployee(id: string) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setSelectedId(null);
  }

  function addComment(comment: Comment) {
    setEmployees((prev) => prev.map((e) =>
      e.id === selectedId ? { ...e, comments: [...e.comments, comment] } : e
    ));
  }

  function deleteComment(commentId: string) {
    setEmployees((prev) => prev.map((e) =>
      e.id === selectedId ? { ...e, comments: e.comments.filter((c) => c.id !== commentId) } : e
    ));
  }

  function updatePhoto(photoUrl: string) {
    setEmployees((prev) => prev.map((e) =>
      e.id === selectedId ? { ...e, photoUrl } : e
    ));
  }

  function onDropCell(row: number, col: number) {
    if (draggingId) moveEmployee(draggingId, row, col);
    setDraggingId(null);
    setDragOver(null);
  }

  function onDropSidebar() {
    if (draggingId) unplaceEmployee(draggingId);
    setDraggingId(null);
    setDragOver(null);
  }

  const unplaced = employees.filter((e) => !e.gridPosition);

  function cellEmployees(row: number, col: number) {
    return employees.filter((e) => e.gridPosition?.row === row && e.gridPosition?.col === col);
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          {editingTitle ? (
            <input
              className="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
              autoFocus
            />
          ) : (
            <h1 className="app-title" onClick={() => setEditingTitle(true)} title="Klikk for å redigere">
              {title}
            </h1>
          )}
          <p className="app-subtitle">Klikk på en person for kommentarer · Dra for å flytte</p>
        </div>
        <button className="btn-add" onClick={() => setShowAdd(true)}>+ Legg til person</button>
      </div>

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
                  const emps = cellEmployees(row, col);
                  return (
                    <div
                      key={col}
                      className={`cell${isOver ? ' cell-over' : ''}`}
                      style={{ backgroundColor: CELL_COLORS[row][col] }}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(key); }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
                      }}
                      onDrop={() => onDropCell(row, col)}
                    >
                      {emps.map((emp) => (
                        <Avatar
                          key={emp.id}
                          employee={emp}
                          onDragStart={() => setDraggingId(emp.id)}
                          onClick={() => setSelectedId(emp.id)}
                        />
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
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null);
          }}
          onDrop={onDropSidebar}
        >
          <div className="sidebar-title">Ikke plassert</div>
          {unplaced.map((emp) => (
            <Avatar
              key={emp.id}
              employee={emp}
              onDragStart={() => setDraggingId(emp.id)}
              onClick={() => setSelectedId(emp.id)}
            />
          ))}
          {unplaced.length === 0 && <p className="sidebar-empty">Alle plassert ✓</p>}
        </div>
      </div>

      {selectedEmployee && (
        <CommentModal
          employee={selectedEmployee}
          onClose={() => setSelectedId(null)}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
          onDeleteEmployee={() => deleteEmployee(selectedEmployee.id)}
          onUpdatePhoto={updatePhoto}
        />
      )}

      {showAdd && (
        <AddEmployeeModal
          onClose={() => setShowAdd(false)}
          onAdd={addEmployee}
        />
      )}
    </div>
  );
}

interface AvatarProps {
  employee: Employee;
  onDragStart: () => void;
  onClick: () => void;
}

function Avatar({ employee, onDragStart, onClick }: AvatarProps) {
  return (
    <div
      className="avatar-wrapper"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      title={`${employee.name}${employee.title ? ' – ' + employee.title : ''}`}
    >
      <img
        src={employee.photoUrl}
        alt={employee.name}
        className="avatar-img"
        onError={(e) => { (e.target as HTMLImageElement).src = avatarFallback(employee.name); }}
      />
      {employee.comments.length > 0 && (
        <span className="comment-badge">{employee.comments.length}</span>
      )}
    </div>
  );
}
