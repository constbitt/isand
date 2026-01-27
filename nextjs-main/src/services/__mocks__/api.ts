import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface JournalInfo {
  journal_isand_id: number;
  journal_name: string;
  avatar?: string;
}

interface ConferenceInfo {
  conf_isand_id: number;
  conf_name: string;
  avatar?: string;
}

interface Author {
  id: number;
  name: string;
}

interface Publication {
  id: number;
  title: string;
}

const mockJournalData: JournalInfo[] = [{
  journal_isand_id: 1,
  journal_name: 'Test Journal',
  avatar: 'test-avatar.jpg'
}];

const mockAuthors: Author[] = [
  { id: 1, name: 'Author 1' },
  { id: 2, name: 'Author 2' },
];

const mockPublications: Publication[] = [
  { id: 1, title: 'Publication 1' },
  { id: 2, title: 'Publication 2' },
];

const mockConferenceData: ConferenceInfo[] = [{
  conf_isand_id: 1,
  conf_name: 'Test Conference',
  avatar: 'test-conf-avatar.jpg'
}];

export const api = createApi({
  reducerPath: 'serverApiV2_5',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    getJournalInfo: builder.query<JournalInfo[], number>({
      queryFn: () => ({ data: mockJournalData })
    }),
    getJournalAuthors: builder.query<Author[], number>({
      queryFn: () => ({ data: mockAuthors })
    }),
    getJournalPublications: builder.query<Publication[], number>({
      queryFn: () => ({ data: mockPublications })
    }),
    getConferenceInfo: builder.query<ConferenceInfo[], number>({
      queryFn: () => ({ data: mockConferenceData })
    }),
    getConferenceAuthors: builder.query<Author[], number>({
      queryFn: () => ({ data: mockAuthors })
    }),
    getConferencePublications: builder.query<Publication[], number>({
      queryFn: () => ({ data: mockPublications })
    }),
  }),
}); 