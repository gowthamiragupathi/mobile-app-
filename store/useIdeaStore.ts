import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface IdeaMetrics {
  market: number; // 0 - 100
  innovation: number; // 0 - 100
  feasibility: number; // 0 - 100
}

export interface Idea {
  id: string;
  name: string;
  tagline: string;
  description: string;
  rating: number; // 0 - 100
  votes: number;
  verdict: string;
  metrics: IdeaMetrics;
  createdAt: number;
}

export interface ToastMessage {
  visible: boolean;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface IdeaStore {
  ideas: Idea[];
  votedIds: string[];
  isDarkMode: boolean;
  hasHydrated: boolean;
  toast: ToastMessage | null;
  setHasHydrated: (val: boolean) => void;
  toggleTheme: () => void;
  setDarkMode: (val: boolean) => void;
  addIdea: (data: {
    name: string;
    tagline: string;
    description: string;
    rating: number;
    verdict?: string;
    metrics?: IdeaMetrics;
  }) => Idea;
  upvoteIdea: (id: string) => boolean;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;
  resetToDefaults: () => void;
}

export const SAMPLE_IDEAS: Idea[] = [
  {
    id: 'seed-1',
    name: 'DevPulse AI',
    tagline: 'Autonomous microservice observability & self-healing telemetry',
    description:
      'DevPulse monitors distributed containerized services in real-time, leverages local LLMs to detect regressions before customer impact, and automatically executes canary rollbacks with instant incident postmortems.',
    rating: 96,
    votes: 84,
    verdict: 'Unicorn potential 🦄',
    metrics: { market: 98, innovation: 95, feasibility: 92 },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'seed-2',
    name: 'OmniFlow',
    tagline: 'Autonomous AI agents orchestrating end-to-end B2B revenue pipelines',
    description:
      'Replaces disjointed CRM tools with goal-oriented agentic teams that research prospects, craft personalized outreach, schedule live demos, and draft customer agreements without manual intervention.',
    rating: 91,
    votes: 62,
    verdict: 'Shark Tank ready 🦈',
    metrics: { market: 94, innovation: 90, feasibility: 88 },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'seed-3',
    name: 'NeuroFocus',
    tagline: 'Non-invasive EEG headband + dynamic binaural audio for hyperfocus',
    description:
      'A sleek wearable sensing prefrontal cortex activity to continuously modulate custom ambient soundscapes, eliminating micro-distractions and keeping knowledge workers in sustained 90-minute flow blocks.',
    rating: 87,
    votes: 49,
    verdict: 'Growth Machine 🚀',
    metrics: { market: 85, innovation: 94, feasibility: 82 },
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: 'seed-4',
    name: 'GreenLedger',
    tagline: 'Verifiable carbon tokenization & IoT supply-chain audit protocol',
    description:
      'Pairs industrial IoT flow meters with zero-knowledge cryptographic proofs to verify carbon reduction at the source, preventing double-counting and creating certified institutional credits.',
    rating: 81,
    votes: 38,
    verdict: 'Defensible Moat 💡',
    metrics: { market: 88, innovation: 84, feasibility: 76 },
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: 'seed-5',
    name: 'SynthHealth',
    tagline: 'Digital twin metabolic simulation using continuous biomarker feeds',
    description:
      'Ingests continuous glucose data, lipid panels, and sleep analytics to construct a real-time digital twin of the patient, predicting insulin responses and nutrient deficiencies 4 hours before meals.',
    rating: 74,
    votes: 27,
    verdict: 'Needs more coffee ☕',
    metrics: { market: 78, innovation: 82, feasibility: 68 },
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
];


export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set, get) => ({
      ideas: SAMPLE_IDEAS,
      votedIds: [],
      isDarkMode: false, // Default to Light theme
      hasHydrated: false,
      toast: null,

      setHasHydrated: (val: boolean) => set({ hasHydrated: val }),

      toggleTheme: () => {
        set((state) => ({ isDarkMode: !Boolean(state.isDarkMode) }));
      },

      setDarkMode: (val: boolean) => {
        set({ isDarkMode: val });
      },

      addIdea: ({ name, tagline, description, rating, verdict, metrics }) => {
        const defaultVerdict =
          verdict ||
          (rating >= 90
            ? 'Unicorn potential 🦄'
            : rating >= 80
            ? 'Shark Tank ready 🦈'
            : rating >= 70
            ? 'Growth Machine 🚀'
            : rating >= 60
            ? 'Defensible Moat 💡'
            : 'Needs more coffee ☕');

        const defaultMetrics = metrics || {
          market: Math.min(100, Math.max(40, rating + Math.floor(Math.random() * 8) - 4)),
          innovation: Math.min(100, Math.max(40, rating + Math.floor(Math.random() * 10) - 5)),
          feasibility: Math.min(100, Math.max(40, rating + Math.floor(Math.random() * 6) - 3)),
        };

        const newIdea: Idea = {
          id: 'idea-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          name: name.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          rating,
          votes: 0,
          verdict: defaultVerdict,
          metrics: defaultMetrics,
          createdAt: Date.now(),
        };

        set((state) => ({
          ideas: [newIdea, ...state.ideas],
        }));

        return newIdea;
      },

      upvoteIdea: (id: string) => {
        const { votedIds, ideas } = get();
        if (votedIds.includes(id)) {
          return false;
        }

        set({
          votedIds: [...votedIds, id],
          ideas: ideas.map((idea) =>
            idea.id === id ? { ...idea, votes: idea.votes + 1 } : idea
          ),
        });

        return true;
      },

      showToast: (message: string, type: 'success' | 'info' | 'error' = 'success') => {
        set({ toast: { visible: true, message, type } });
      },

      hideToast: () => {
        set({ toast: null });
      },

      resetToDefaults: () => {
        set({ ideas: SAMPLE_IDEAS, votedIds: [] });
      },
    }),
    {
      name: 'ideaforge-storage-v3',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ideas: state.ideas,
        votedIds: state.votedIds,
        isDarkMode: state.isDarkMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...(persistedState || {}),
        ideas:
          Array.isArray(persistedState?.ideas) && persistedState.ideas.length > 0
            ? persistedState.ideas.map((item: any, idx: number) => ({
                ...SAMPLE_IDEAS[idx % SAMPLE_IDEAS.length],
                ...item,
                verdict:
                  item.verdict ||
                  (item.rating >= 90
                    ? 'Unicorn potential 🦄'
                    : item.rating >= 80
                    ? 'Shark Tank ready 🦈'
                    : item.rating >= 70
                    ? 'Growth Machine 🚀'
                    : 'Defensible Moat 💡'),
                metrics: item.metrics || {
                  market: Math.min(100, Math.max(50, (item.rating || 75) + 3)),
                  innovation: Math.min(100, Math.max(50, (item.rating || 75) - 2)),
                  feasibility: Math.min(100, Math.max(50, (item.rating || 75) + 1)),
                },
              }))
            : SAMPLE_IDEAS,
        votedIds: Array.isArray(persistedState?.votedIds) ? persistedState.votedIds : [],
        isDarkMode:
          typeof persistedState?.isDarkMode === 'boolean'
            ? persistedState.isDarkMode
            : false,
      }),
    }
  )
);
