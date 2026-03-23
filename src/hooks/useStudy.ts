import { useState, useCallback } from 'react';
import type { TourType } from '../types/tour';
import type { StudyDoc, StudySection } from '../types/study';

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

function save(docs: Record<string, StudyDoc>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function useStudy() {
  const [docs, setDocs] = useState<StudyStore>(load);

  const upsertSection = useCallback((tourType: TourType, section: StudySection) => {
    setDocs(prev => {
      const existing = prev[tourType];
      const sections = existing
        ? existing.sections.map(s => s.id === section.id ? section : s)
        : [section];
      const hasSection = existing?.sections.some(s => s.id === section.id);
      const next: StudyDoc = {
        tourType,
        sections: hasSection ? sections : [...(existing?.sections ?? []), section],
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
    const section: StudySection = {
      id: crypto.randomUUID(),
      title,
      content: '',
    };
    setDocs(prev => {
      const existing = prev[tourType];
      const next: StudyDoc = {
        tourType,
        sections: [...(existing?.sections ?? []), section],
        updatedAt: new Date().toISOString(),
      };
      const updated = { ...prev, [tourType]: next };
      save(updated);
      return updated;
    });
    return section.id;
  }, []);

  return { docs, upsertSection, deleteSection, addSection };
}
