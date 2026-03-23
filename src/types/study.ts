import type { TourType } from './tour';

export interface StudyAttachment {
  id: string;
  name: string;
  type: string;       // MIME type
  size: number;       // bytes
  data: string;       // base64
  addedAt: string;
}

export interface StudySection {
  id: string;
  title: string;
  content: string;
}

export interface StudyDoc {
  tourType: TourType;
  sections: StudySection[];
  attachments: StudyAttachment[];
  updatedAt: string;
}
