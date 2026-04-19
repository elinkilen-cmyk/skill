import { useState, useRef } from 'react';
import type { Employee } from './types';
import { BOARDS } from './data';

interface Props {
  onClose: () => void;
  onAdd: (employee: Omit<Employee, 'id' | 'comments' | 'gridPosition'>) => void;
  defaultBoard?: Employee['board'];
}

export default function AddEmployeeModal({ onClose, onAdd, defaultBoard = 'konsulent' }: Props) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [board, setBoard] = useState<Employee['board']>(defaultBoard);
  const [photoUrl, setPhotoUrl] = useState('');
  const [preview, setPreview] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoUrl(result);
      setPreview(result);
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      title: title.trim(),
      department: department.trim(),
      board,
      photoUrl: photoUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(name.trim())}`,
    });
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-small">
        <div className="modal-header">
          <h2>Legg til person</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="form">
          <div className="photo-picker">
            <div className="photo-preview" onClick={() => fileRef.current?.click()}>
              {preview
                ? <img src={preview} alt="Forhåndsvisning" />
                : <span className="photo-placeholder">📷<br /><small>Klikk for bilde</small></span>
              }
            </div>
            <div className="photo-actions">
              <button className="btn-pick" onClick={() => fileRef.current?.click()}>Velg bilde fra PC</button>
              {preview && <button className="btn-secondary" onClick={() => { setPhotoUrl(''); setPreview(''); }}>Fjern</button>}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>
          </div>

          <label>Navn *</label>
          <input placeholder="Fullt navn" value={name} onChange={(e) => setName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />

          <label>Stilling</label>
          <input placeholder="F.eks. Senior Konsulent" value={title} onChange={(e) => setTitle(e.target.value)} />

          <label>Avdeling</label>
          <input placeholder="F.eks. Strategi" value={department} onChange={(e) => setDepartment(e.target.value)} />

          <label>Board</label>
          <select value={board} onChange={(e) => setBoard(e.target.value as Employee['board'])} className="form-select">
            {BOARDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>

          <button className="btn-primary" onClick={handleSubmit} disabled={!name.trim()}>Legg til</button>
        </div>
      </div>
    </div>
  );
}
