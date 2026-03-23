import type { TourType } from './tour';

export interface StudySection {
  id: string;
  title: string;
  content: string;
}

export interface StudyDoc {
  tourType: TourType;
  sections: StudySection[];
  updatedAt: string;
}
