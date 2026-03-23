import { useState, useRef, useEffect } from 'react';
import type { TourType } from '../../types/tour';
import type { StudySection } from '../../types/study';
import { TOUR_TYPES } from '../../constants/tours';
import { useStudy } from '../../hooks/useStudy';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

const MAX_FILE_SIZE_MB = 50;

function fileIcon(type: string) {
  if (type.startsWith('image/')) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
  );
  if (type === 'application/pdf') return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StudyView() {
  const { docs, upsertSection, deleteSection, addSection, uploadAttachment, deleteAttachment } = useStudy();
  const [selected, setSelected] = useState<TourType>('chiado');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tab, setTab] = useState<'notes' | 'attachments'>('notes');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const doc = docs[selected];
  const sections = doc?.sections ?? [];
  const attachments = doc?.attachments ?? [];

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
    setTab('notes');
  }

  function handleDeleteSection(sectionId: string) {
    if (window.confirm('Eliminar esta secção?')) {
      deleteSection(selected, sectionId);
      if (editingId === sectionId) setEditingId(null);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadError(`"${file.name}" excede ${MAX_FILE_SIZE_MB}MB.`);
        continue;
      }
      const result = await uploadAttachment(selected, file);
      if (!result) {
        setUploadError(`Erro ao carregar "${file.name}". Tenta novamente.`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleDeleteAttachment(id: string) {
    if (window.confirm('Eliminar este anexo?')) {
      await deleteAttachment(selected, id);
    }
  }

  const cfg = TOUR_TYPES[selected];

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 min-h-[calc(100dvh-180px)]">
      {/* Tour type selector */}
      <div className="md:w-48 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
        {(Object.entries(TOUR_TYPES) as [TourType, typeof TOUR_TYPES[TourType]][]).map(([key, c]) => {
          const hasContent = (docs[key]?.sections.length ?? 0) > 0 || (docs[key]?.attachments.length ?? 0) > 0;
          return (
            <button
              key={key}
              onClick={() => { setSelected(key); setEditingId(null); }}
              className={`flex items-center gap-2 md:gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all shrink-0 md:shrink min-h-[44px] ${
                selected === key
                  ? 'text-white font-medium shadow-card'
                  : 'text-[#6b6b6b] dark:text-[#888] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-ink dark:hover:text-[#e8e5e0] bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/[0.08]'
              }`}
              style={selected === key ? { backgroundColor: c.color } : {}}
            >
              <span className="text-base shrink-0">{c.emoji}</span>
              <div className="hidden md:flex flex-col leading-tight">
                <span>{c.label}</span>
                {hasContent && (
                  <span className={`text-[10px] mt-0.5 ${selected === key ? 'opacity-70' : 'text-[#999] dark:text-[#666]'}`}>
                    {(docs[key]?.sections.length ?? 0) > 0 && `${docs[key]!.sections.length} notas`}
                    {(docs[key]?.attachments.length ?? 0) > 0 && ` · ${docs[key]!.attachments.length} anex.`}
                  </span>
                )}
              </div>
              <span className="md:hidden text-xs font-medium">{c.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main editor */}
      <div className="flex-1 min-w-0">
        {/* Tour header */}
        <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: cfg.color + '20' }}>
            {cfg.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-ink dark:text-[#e8e5e0]">{cfg.label}</h3>
            {doc?.updatedAt && (
              <p className="text-[11px] text-[#6b6b6b] dark:text-[#888]">
                Atualizado {format(new Date(doc.updatedAt), "d MMM yyyy 'às' HH:mm", { locale: pt })}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setTab('notes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${tab === 'notes' ? 'bg-primary text-white' : 'bg-black/[0.05] dark:bg-white/[0.06] text-[#6b6b6b] dark:text-[#888]'}`}
            >
              Notas {sections.length > 0 && `(${sections.length})`}
            </button>
            <button
              onClick={() => setTab('attachments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${tab === 'attachments' ? 'bg-primary text-white' : 'bg-black/[0.05] dark:bg-white/[0.06] text-[#6b6b6b] dark:text-[#888]'}`}
            >
              Anexos {attachments.length > 0 && `(${attachments.length})`}
            </button>
          </div>
        </div>

        {/* NOTAS TAB */}
        {tab === 'notes' && (
          <div className="flex flex-col gap-3">
            {sections.length === 0 && !addingSection && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-sm text-[#6b6b6b] dark:text-[#888] mb-4">Ainda não há notas para este tour.</p>
                <button onClick={() => setAddingSection(true)} className="px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-[#0025a0] transition-colors cursor-pointer min-h-[44px]">
                  + Adicionar secção
                </button>
              </div>
            )}

            {sections.map(section => (
              <div key={section.id} className="border border-black/[0.08] dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-card">
                <div className="flex items-center gap-2 px-4 py-3 bg-surface dark:bg-[#1a1a1a] border-b border-black/[0.06] dark:border-white/[0.06]">
                  {editingId === section.id ? (
                    <input
                      defaultValue={section.title}
                      onBlur={e => handleSectionTitle(section, e.target.value)}
                      className="flex-1 text-sm font-semibold text-ink dark:text-[#e8e5e0] bg-transparent focus:outline-none"
                    />
                  ) : (
                    <span className="flex-1 text-sm font-semibold text-ink dark:text-[#e8e5e0] cursor-pointer" onClick={() => setEditingId(editingId === section.id ? null : section.id)}>
                      {section.title}
                    </span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingId(editingId === section.id ? null : section.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/[0.08] dark:hover:bg-white/[0.08] text-[#6b6b6b] dark:text-[#888] transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {editingId === section.id
                          ? <><polyline points="18 15 12 9 6 15"/></>
                          : <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>
                        }
                      </svg>
                    </button>
                    <button onClick={() => handleDeleteSection(section.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#6b6b6b] dark:text-[#888] hover:text-red-500 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
                <div className="px-4 py-3 bg-white dark:bg-[#111]">
                  {editingId === section.id ? (
                    <textarea
                      ref={textareaRef}
                      defaultValue={section.content}
                      onBlur={e => handleSectionContent(section, e.target.value)}
                      onChange={e => autoResize(e.target)}
                      placeholder="Escreve as tuas notas aqui..."
                      className="w-full text-sm text-ink dark:text-[#e8e5e0] leading-relaxed focus:outline-none resize-none bg-transparent min-h-[80px]"
                    />
                  ) : (
                    <div className="text-sm text-ink dark:text-[#e8e5e0] leading-relaxed whitespace-pre-wrap cursor-pointer min-h-[40px]" onClick={() => setEditingId(section.id)}>
                      {section.content || <span className="text-[#aaa] dark:text-[#555] italic">Clica para adicionar notas...</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {addingSection ? (
              <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 bg-white dark:bg-[#111] shadow-card">
                <input
                  autoFocus
                  value={newSectionTitle}
                  onChange={e => setNewSectionTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') setAddingSection(false); }}
                  placeholder="Título (ex: História, Pontos de interesse, Dicas...)"
                  className="w-full text-sm text-ink dark:text-[#e8e5e0] bg-transparent focus:outline-none mb-3 border-b border-black/[0.1] dark:border-white/[0.1] pb-2"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddSection} disabled={!newSectionTitle.trim()} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-[#0025a0] transition-colors disabled:opacity-40 min-h-[40px]">Criar</button>
                  <button onClick={() => { setAddingSection(false); setNewSectionTitle(''); }} className="px-4 py-2 border border-black/[0.12] dark:border-white/[0.12] text-sm text-[#6b6b6b] dark:text-[#888] rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors min-h-[40px]">Cancelar</button>
                </div>
              </div>
            ) : sections.length > 0 && (
              <button onClick={() => setAddingSection(true)} className="w-full py-3 border border-dashed border-black/[0.15] dark:border-white/[0.15] rounded-2xl text-sm text-[#6b6b6b] dark:text-[#888] hover:text-ink dark:hover:text-[#e8e5e0] hover:border-black/[0.3] dark:hover:border-white/[0.3] transition-colors min-h-[48px]">
                + Adicionar secção
              </button>
            )}
          </div>
        )}

        {/* ANEXOS TAB */}
        {tab === 'attachments' && (
          <div className="flex flex-col gap-3">
            {/* Upload zone */}
            <div
              className="border-2 border-dashed border-black/[0.12] dark:border-white/[0.12] rounded-2xl p-6 text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (fileInputRef.current && !uploading) {
                  const dt = e.dataTransfer;
                  const event = { target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleFileChange(event);
                }
              }}
            >
              <div className="text-3xl mb-2">📎</div>
              {uploading ? (
                <p className="text-sm font-medium text-primary animate-pulse">A carregar para a nuvem...</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-ink dark:text-[#e8e5e0] mb-1">Arrasta ficheiros ou clica para adicionar</p>
                  <p className="text-xs text-[#6b6b6b] dark:text-[#888]">PDF, imagens, Word, Excel — máx. {MAX_FILE_SIZE_MB}MB por ficheiro</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="*/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {uploadError && (
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-center justify-between">
                <span>{uploadError}</span>
                <button onClick={() => setUploadError(null)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
              </div>
            )}

            {attachments.length === 0 ? (
              <p className="text-center text-sm text-[#6b6b6b] dark:text-[#888] py-6">Nenhum anexo ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {attachments.map(att => (
                  <div key={att.id} className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/[0.08] rounded-xl shadow-card">
                    <div className="w-9 h-9 rounded-lg bg-surface dark:bg-[#1a1a1a] flex items-center justify-center text-[#6b6b6b] dark:text-[#888] shrink-0">
                      {fileIcon(att.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink dark:text-[#e8e5e0] truncate">{att.name}</p>
                      <p className="text-[11px] text-[#6b6b6b] dark:text-[#888]">
                        {formatBytes(att.size)} · {format(new Date(att.addedAt), 'd MMM yyyy', { locale: pt })}
                      </p>
                    </div>
                    {att.type.startsWith('image/') && (
                      <img src={att.url} alt={att.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex gap-1 shrink-0">
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-[#6b6b6b] dark:text-[#888] hover:text-ink dark:hover:text-[#e8e5e0] transition-colors"
                        title="Abrir"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(att.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[#6b6b6b] dark:text-[#888] hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
