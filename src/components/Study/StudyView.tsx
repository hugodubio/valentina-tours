import { useState, useRef, useEffect } from 'react';
import type { TourType } from '../../types/tour';
import type { StudySection } from '../../types/study';
import { TOUR_TYPES } from '../../constants/tours';
import { useStudy } from '../../hooks/useStudy';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function StudyView() {
  const { docs, upsertSection, deleteSection, addSection } = useStudy();
  const [selected, setSelected] = useState<TourType>('chiado');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const doc = docs[selected];
  const sections = doc?.sections ?? [];

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      autoResize(textareaRef.current);
    }
  }, [editingId]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function handleSectionContent(section: StudySection, content: string) {
    upsertSection(selected, { ...section, content });
  }

  function handleSectionTitle(section: StudySection, title: string) {
    upsertSection(selected, { ...section, title });
  }

  function handleAddSection() {
    if (!newSectionTitle.trim()) return;
    const id = addSection(selected, newSectionTitle.trim());
    setNewSectionTitle('');
    setAddingSection(false);
    setEditingId(id);
  }

  function handleDelete(sectionId: string) {
    if (window.confirm('Eliminar esta secção?')) {
      deleteSection(selected, sectionId);
      if (editingId === sectionId) setEditingId(null);
    }
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-160px)]">
      {/* Tour type list */}
      <div className="w-48 shrink-0 flex flex-col gap-1">
        {(Object.entries(TOUR_TYPES) as [TourType, typeof TOUR_TYPES[TourType]][]).map(([key, cfg]) => {
          const hasDocs = (docs[key]?.sections.length ?? 0) > 0;
          return (
            <button
              key={key}
              onClick={() => { setSelected(key); setEditingId(null); }}
              className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm text-left transition-all ${
                selected === key
                  ? 'text-white font-medium shadow-card'
                  : 'text-[#6b6b6b] hover:bg-[rgba(26,24,20,0.05)] hover:text-ink bg-white border border-[rgba(26,24,20,0.08)]'
              }`}
              style={selected === key ? { backgroundColor: cfg.color } : {}}
            >
              <span className="text-base">{cfg.emoji}</span>
              <div className="flex flex-col leading-tight">
                <span>{cfg.label}</span>
                {hasDocs && docs[key] && (
                  <span className={`text-[10px] mt-0.5 ${selected === key ? 'opacity-70' : 'text-[#999]'}`}>
                    {docs[key]!.sections.length} secç{docs[key]!.sections.length === 1 ? 'ão' : 'ões'}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div className="flex-1">
        {/* Tour header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[rgba(26,24,20,0.08)]">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: TOUR_TYPES[selected].color + '18' }}
          >
            {TOUR_TYPES[selected].emoji}
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink">{TOUR_TYPES[selected].label}</h3>
            {doc?.updatedAt && (
              <p className="text-[11px] text-[#6b6b6b]">
                Atualizado {format(new Date(doc.updatedAt), "d MMM yyyy 'às' HH:mm", { locale: pt })}
              </p>
            )}
          </div>
        </div>

        {/* Sections */}
        {sections.length === 0 && !addingSection && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-sm text-[#6b6b6b] mb-4">Ainda não há notas para este tour.</p>
            <button
              onClick={() => setAddingSection(true)}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-[#0025a0] transition-colors"
            >
              + Adicionar secção
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {sections.map(section => (
            <div
              key={section.id}
              className="border border-[rgba(26,24,20,0.08)] rounded-2xl overflow-hidden shadow-card"
            >
              {/* Section header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-[rgba(26,24,20,0.06)]">
                {editingId === section.id ? (
                  <input
                    defaultValue={section.title}
                    onBlur={e => handleSectionTitle(section, e.target.value)}
                    className="flex-1 text-sm font-semibold text-ink bg-transparent focus:outline-none"
                  />
                ) : (
                  <span
                    className="flex-1 text-sm font-semibold text-ink cursor-pointer"
                    onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                  >
                    {section.title}
                  </span>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(26,24,20,0.08)] text-[#6b6b6b] text-xs transition-colors"
                    title={editingId === section.id ? 'Recolher' : 'Editar'}
                  >
                    {editingId === section.id ? '▴' : '✏️'}
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 text-[#6b6b6b] text-xs transition-colors"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Section content */}
              <div className="px-4 py-3">
                {editingId === section.id ? (
                  <textarea
                    ref={textareaRef}
                    defaultValue={section.content}
                    onBlur={e => handleSectionContent(section, e.target.value)}
                    onChange={e => autoResize(e.target)}
                    placeholder="Escreve as tuas notas aqui..."
                    className="w-full text-sm text-ink leading-relaxed focus:outline-none resize-none bg-transparent min-h-[100px]"
                  />
                ) : (
                  <div
                    className="text-sm text-ink leading-relaxed whitespace-pre-wrap cursor-pointer min-h-[40px]"
                    onClick={() => setEditingId(section.id)}
                  >
                    {section.content
                      ? section.content
                      : <span className="text-[#aaa] italic">Clica para adicionar notas...</span>
                    }
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add section */}
          {addingSection ? (
            <div className="border border-[rgba(26,24,20,0.08)] rounded-2xl p-4 shadow-card">
              <input
                autoFocus
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') setAddingSection(false); }}
                placeholder="Título da secção (ex: História, Pontos de interesse...)"
                className="w-full text-sm text-ink bg-transparent focus:outline-none mb-3 border-b border-[rgba(26,24,20,0.1)] pb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddSection}
                  disabled={!newSectionTitle.trim()}
                  className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-[#0025a0] transition-colors disabled:opacity-40"
                >
                  Criar
                </button>
                <button
                  onClick={() => { setAddingSection(false); setNewSectionTitle(''); }}
                  className="px-4 py-1.5 border border-[rgba(26,24,20,0.15)] text-sm text-[#6b6b6b] rounded-lg hover:bg-[rgba(26,24,20,0.04)] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            sections.length > 0 && (
              <button
                onClick={() => setAddingSection(true)}
                className="w-full py-3 border border-dashed border-[rgba(26,24,20,0.15)] rounded-2xl text-sm text-[#6b6b6b] hover:text-ink hover:border-[rgba(26,24,20,0.3)] transition-colors"
              >
                + Adicionar secção
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
