import { useState, useCallback } from 'react';
import type { TourType } from '../types/tour';
import type { StudyDoc, StudySection, StudyAttachment } from '../types/study';
import { supabase, BUCKET } from '../lib/supabase';

const STORAGE_KEY = 'valentina_study';

type StudyStore = Partial<Record<TourType, StudyDoc>>;

function load(): StudyStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(docs: StudyStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

function emptyDoc(tourType: TourType): StudyDoc {
  return { tourType, sections: [], attachments: [], updatedAt: new Date().toISOString() };
}

export function useStudy() {
  const [docs, setDocs] = useState<StudyStore>(load);

  const upsertSection = useCallback((tourType: TourType, section: StudySection) => {
    setDocs(prev => {
      const existing = prev[tourType] ?? emptyDoc(tourType);
      const hasSection = existing.sections.some(s => s.id === section.id);
      const next: StudyDoc = {
        ...existing,
        sections: hasSection
          ? existing.sections.map(s => s.id === section.id ? section : s)
          : [...existing.sections, section],
        updatedAt: new Date().toISOString(),
      };
      const updated = { ...prev, [tourType]: next };
      save(updated);
      return updated;
    });
  }, []);

  const deleteSection = useCallback((tourType: TourType, sectionId: string) => {
    setDocs(prev => {
      const existing = prev[tourType];
      if (!existing) return prev;
      const next: StudyDoc = {
        ...existing,
        sections: existing.sections.filter(s => s.id !== sectionId),
        updatedAt: new Date().toISOString(),
      };
      const updated = { ...prev, [tourType]: next };
      save(updated);
      return updated;
    });
  }, []);

  const addSection = useCallback((tourType: TourType, title: string) => {
    const section: StudySection = { id: crypto.randomUUID(), title, content: '' };
    setDocs(prev => {
      const existing = prev[tourType] ?? emptyDoc(tourType);
      const next: StudyDoc = {
        ...existing,
        sections: [...existing.sections, section],
        updatedAt: new Date().toISOString(),
      };
      const updated = { ...prev, [tourType]: next };
      save(updated);
      return updated;
    });
    return section.id;
  }, []);

  const uploadAttachment = useCallback(async (tourType: TourType, file: File): Promise<StudyAttachment | null> => {
    const id = crypto.randomUUID();
    const ext = file.name.split('.').pop() ?? '';
    const path = `${tourType}/${id}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.error('Upload error:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const attachment: StudyAttachment = {
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: urlData.publicUrl,
      path,
      addedAt: new Date().toISOString(),
    };

    setDocs(prev => {
      const existing = prev[tourType] ?? emptyDoc(tourType);
      const next: StudyDoc = {
        ...existing,
        attachments: [...existing.attachments, attachment],
        updatedAt: new Date().toISOString(),
      };
      const updated = { ...prev, [tourType]: next };
      save(updated);
      return updated;
    });

    return attachment;
  }, []);

  const deleteAttachment = useCallback(async (tourType: TourType, attachmentId: string) => {
    setDocs(prev => {
      const existing = prev[tourType];
      if (!existing) return prev;

      const attachment = existing.attachments.find(a => a.id === attachmentId);
      if (attachment?.path) {
        // Delete from Supabase Storage (fire-and-forget)
        supabase.storage.from(BUCKET).remove([attachment.path]).catch(console.error);
      }

      const next: StudyDoc = {
        ...existing,
        attachments: existing.attachments.filter(a => a.id !== attachmentId),
        updatedAt: new Date().toISOString(),
      };
      const updated = { ...prev, [tourType]: next };
      save(updated);
      return updated;
    });
  }, []);

  return { docs, upsertSection, deleteSection, addSection, uploadAttachment, deleteAttachment };
}
