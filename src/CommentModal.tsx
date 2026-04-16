import { useState } from 'react';
import type { Employee, Comment } from './types';

interface Props {
  employee: Employee;
  onClose: () => void;
  onAddComment: (comment: Comment) => void;
  onDeleteComment: (commentId: string) => void;
  onDeleteEmployee: () => void;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function avatarFallback(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=150`;
}

export default function CommentModal({ employee, onClose, onAddComment, onDeleteComment, onDeleteEmployee }: Props) {
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

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
            <img
              src={employee.photoUrl}
              alt={employee.name}
              className="modal-photo"
              onError={(e) => { (e.target as HTMLImageElement).src = avatarFallback(employee.name); }}
            />
            <div>
              <h2>{employee.name}</h2>
              <p>
                {employee.title}
                {employee.department && <span> · {employee.department}</span>}
              </p>
              {employee.gridPosition && (
                <p className="position-info">
                  Plassert i grid
                </p>
              )}
            </div>
          </div>
          <div className="modal-actions">
            {confirmDelete ? (
              <>
                <span className="confirm-text">Er du sikker?</span>
                <button className="btn-danger" onClick={onDeleteEmployee}>Ja, slett</button>
                <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>Avbryt</button>
              </>
            ) : (
              <button className="btn-delete" onClick={() => setConfirmDelete(true)}>Slett</button>
            )}
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
                    <button className="btn-delete-comment" onClick={() => onDeleteComment(c.id)} title="Slett kommentar">✕</button>
                  </div>
                  <p>{c.text}</p>
                </div>
              ))
            )}
          </div>

          <div className="add-comment">
            <input
              placeholder="Ditt navn (valgfritt)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <textarea
              placeholder="Skriv en kommentar om denne personen…"
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
