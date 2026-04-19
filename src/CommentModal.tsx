import { useState, useRef } from 'react';
import type { Employee, Comment } from './types';
import { BOARDS } from './data';

interface Props {
  employee: Employee;
  onClose: () => void;
  onAddComment: (comment: Comment) => void;
  onDeleteComment: (commentId: string) => void;
  onDeleteEmployee: () => void;
  onUpdatePhoto: (photoUrl: string) => void;
  onUpdateEmployee: (updates: Partial<Pick<Employee, 'name' | 'title' | 'department' | 'board'>>) => void;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function avatarFallback(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c9cc0&color=fff&size=150`;
}

export default function CommentModal({
  employee, onClose, onAddComment, onDeleteComment,
  onDeleteEmployee, onUpdatePhoto, onUpdateEmployee,
}: Props) {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(employee.name);
  const [editTitle, setEditTitle] = useState(employee.title);
  const [editDept, setEditDept] = useState(employee.department);
  const [editBoard, setEditBoard] = useState(employee.board);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdatePhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function saveEdit() {
    onUpdateEmployee({ name: editName.trim() || employee.name, title: editTitle.trim(), department: editDept.trim(), board: editBoard });
    setEditing(false);
  }

  function handleAdd() {
    if (!text.trim()) return;
    onAddComment({
      id: generateId(),
      text: text.trim(),
      author: author.trim() || 'Anonym',
      createdAt: new Date().toLocaleString('nb-NO'),
    });
    setText('');
    setAuthor('');
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-employee-info">
            <div className="modal-photo-wrap" onClick={() => fileRef.current?.click()} title="Klikk for å bytte bilde">
              <img
                src={employee.photoUrl}
                alt={employee.name}
                className="modal-photo"
                onError={(e) => { (e.target as HTMLImageElement).src = avatarFallback(employee.name); }}
              />
              <div className="photo-edit-hint">📷</div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            {editing ? (
              <div className="edit-fields">
                <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Navn" className="edit-input" />
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Stilling" className="edit-input" />
                <input value={editDept} onChange={e => setEditDept(e.target.value)} placeholder="Avdeling" className="edit-input" />
                <select value={editBoard} onChange={e => setEditBoard(e.target.value as Employee['board'])} className="edit-input">
                  {BOARDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <button className="btn-primary" style={{ padding: '5px 14px', fontSize: 13 }} onClick={saveEdit}>Lagre</button>
                  <button className="btn-secondary" onClick={() => setEditing(false)}>Avbryt</button>
                </div>
              </div>
            ) : (
              <div>
                <h2>{employee.name}</h2>
                <p>{employee.title}{employee.department && ` · ${employee.department}`}</p>
                <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                  {BOARDS.find(b => b.id === employee.board)?.label}
                </p>
              </div>
            )}
          </div>

          <div className="modal-actions">
            {!editing && (
              <button className="btn-secondary" onClick={() => setEditing(true)}>✏️ Rediger</button>
            )}
            {!editing && (confirmDelete ? (
              <>
                <span className="confirm-text">Er du sikker?</span>
                <button className="btn-danger" onClick={onDeleteEmployee}>Ja, slett</button>
                <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>Avbryt</button>
              </>
            ) : (
              <button className="btn-delete" onClick={() => setConfirmDelete(true)}>Slett</button>
            ))}
            <button className="btn-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="comments-section">
          <h3>Kommentarer ({employee.comments.length})</h3>
          <div className="comments-list">
            {employee.comments.length === 0 ? (
              <p className="no-comments">Ingen kommentarer ennå.</p>
            ) : (
              employee.comments.map((c) => (
                <div key={c.id} className="comment">
                  <div className="comment-header">
                    <strong>{c.author}</strong>
                    <span className="comment-date">{c.createdAt}</span>
                    <button className="btn-delete-comment" onClick={() => onDeleteComment(c.id)}>✕</button>
                  </div>
                  <p>{c.text}</p>
                </div>
              ))
            )}
          </div>
          <div className="add-comment">
            <input placeholder="Ditt navn (valgfritt)" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <textarea
              placeholder="Skriv en kommentar…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleAdd(); }}
            />
            <button className="btn-primary" onClick={handleAdd} disabled={!text.trim()}>
              Legg til kommentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
