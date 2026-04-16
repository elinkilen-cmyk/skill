import { useState } from 'react';
import type { Employee } from './types';

interface Props {
  onClose: () => void;
  onAdd: (employee: Omit<Employee, 'id' | 'comments' | 'gridPosition'>) => void;
}

export default function AddEmployeeModal({ onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  function handleSubmit() {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      title: title.trim(),
      department: department.trim(),
      photoUrl: photoUrl.trim() || `https://i.pravatar.cc/150?u=${encodeURIComponent(name.trim())}`,
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
          <label>Navn *</label>
          <input
            placeholder="Fullt navn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <label>Stilling</label>
          <input
            placeholder="F.eks. Senior Konsulent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label>Avdeling</label>
          <input
            placeholder="F.eks. Strategi"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <label>Bilde-URL (valgfritt)</label>
          <input
            placeholder="https://…"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
          <button className="btn-primary" onClick={handleSubmit} disabled={!name.trim()}>
            Legg til
          </button>
        </div>
      </div>
    </div>
  );
}
