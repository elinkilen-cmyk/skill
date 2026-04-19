import type { Employee, Comment, Board } from './types';
import { BOARDS, POTENTIAL_LABELS, PERFORMANCE_LABELS } from './data';
import { useState, useRef } from 'react';

interface Props {
  employees: Employee[];
  onAddComment: (employeeId: string, comment: Comment) => void;
  onDeleteComment: (employeeId: string, commentId: string) => void;
  onSelectEmployee: (id: string) => void;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function avatarFallback(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c9cc0&color=fff&size=150`;
}

function positionLabel(pos: { row: number; col: number } | null) {
  if (!pos) return 'Ikke plassert';
  return `${POTENTIAL_LABELS[pos.row]} · ${PERFORMANCE_LABELS[pos.col].replace('\n', ' ')}`;
}

export default function CommentsView({ employees, onAddComment, onDeleteComment, onSelectEmployee }: Props) {
  const [filterBoard, setFilterBoard] = useState<Board | 'alle'>('alle');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newText, setNewText] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filtered = employees
    .filter(e => filterBoard === 'alle' || e.board === filterBoard)
    .filter(e => e.comments.length > 0 || expandedId === e.id)
    .sort((a, b) => {
      const aLast = a.comments.at(-1)?.createdAt ?? '';
      const bLast = b.comments.at(-1)?.createdAt ?? '';
      return bLast.localeCompare(aLast);
    });

  const all = employees.filter(e => filterBoard === 'alle' || e.board === filterBoard);
  const withComments = all.filter(e => e.comments.length > 0);
  const totalComments = all.reduce((sum, e) => sum + e.comments.length, 0);

  function handleAdd(emp: Employee) {
    if (!newText.trim()) return;
    onAddComment(emp.id, {
      id: generateId(),
      text: newText.trim(),
      author: newAuthor.trim() || 'Anonym',
      createdAt: new Date().toLocaleString('nb-NO'),
    });
    setNewText('');
    setNewAuthor('');
    setExpandedId(null);
  }

  return (
    <div className="comments-view">
      <div className="cv-header">
        <div>
          <h2 className="cv-title">Alle kommentarer</h2>
          <p className="cv-meta">{withComments.length} personer · {totalComments} kommentarer</p>
        </div>
        <div className="cv-filter">
          <button
            className={`board-tab${filterBoard === 'alle' ? ' active' : ''}`}
            onClick={() => setFilterBoard('alle')}
          >Alle</button>
          {BOARDS.map(b => (
            <button
              key={b.id}
              className={`board-tab${filterBoard === b.id ? ' active' : ''}`}
              onClick={() => setFilterBoard(b.id)}
            >{b.label}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="cv-empty">
          <p>Ingen kommentarer ennå.</p>
          <p style={{ fontSize: 13, color: '#bbb', marginTop: 6 }}>
            Klikk på en person i rutenettet for å legge til en kommentar.
          </p>
        </div>
      )}

      <div className="cv-list">
        {filtered.map(emp => (
          <div key={emp.id} className="cv-card">
            <div className="cv-card-header">
              <img
                src={emp.photoUrl}
                alt={emp.name}
                className="cv-avatar"
                onError={(e) => { (e.target as HTMLImageElement).src = avatarFallback(emp.name); }}
                onClick={() => onSelectEmployee(emp.id)}
                style={{ cursor: 'pointer' }}
                title="Åpne person"
              />
              <div className="cv-card-info">
                <strong>{emp.name}</strong>
                <span>{emp.title}{emp.department ? ` · ${emp.department}` : ''}</span>
                <span className="cv-tags">
                  <span className="cv-tag board-tag">{BOARDS.find(b => b.id === emp.board)?.label}</span>
                  <span className="cv-tag pos-tag">{positionLabel(emp.gridPosition)}</span>
                </span>
              </div>
              <div className="cv-card-actions">
                <span className="cv-count">{emp.comments.length} kommentar{emp.comments.length !== 1 ? 'er' : ''}</span>
                <button
                  className="btn-secondary"
                  onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
                >
                  {expandedId === emp.id ? 'Lukk' : '+ Legg til'}
                </button>
              </div>
            </div>

            {emp.comments.length > 0 && (
              <div className="cv-comments">
                {emp.comments.map(c => (
                  <div key={c.id} className="comment">
                    <div className="comment-header">
                      <strong>{c.author}</strong>
                      <span className="comment-date">{c.createdAt}</span>
                      <button className="btn-delete-comment" onClick={() => onDeleteComment(emp.id, c.id)}>✕</button>
                    </div>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {expandedId === emp.id && (
              <div className="cv-add-comment">
                <input
                  placeholder="Ditt navn (valgfritt)"
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                />
                <textarea
                  ref={textareaRef}
                  placeholder="Skriv en kommentar…"
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  rows={3}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn-secondary" onClick={() => { setExpandedId(null); setNewText(''); setNewAuthor(''); }}>Avbryt</button>
                  <button className="btn-primary" onClick={() => handleAdd(emp)} disabled={!newText.trim()}>Lagre</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
