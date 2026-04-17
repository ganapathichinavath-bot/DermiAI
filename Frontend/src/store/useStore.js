import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      selectedImage: null,
      activeScan: null,
      guestHistory: [],
      processingError: null,
      processingStep: 0,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setSelectedImage: (selectedImage) => set({ selectedImage }),
      clearSelectedImage: () => set({ selectedImage: null }),
      setActiveScan: (activeScan) => set({ activeScan }),
      setProcessingError: (processingError) => set({ processingError }),
      setProcessingStep: (processingStep) => set({ processingStep }),
      clearProcessingState: () => set({ processingError: null, processingStep: 0 }),
      addGuestScan: (scan) =>
        set((state) => ({
          guestHistory: [scan, ...state.guestHistory].slice(0, 20),
        })),
      logout: () =>
        set({
          token: null,
          user: null,
          activeScan: null,
          guestHistory: get().guestHistory,
        }),
    }),
    {
      name: 'dermai-app',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeScan: state.activeScan,
        guestHistory: state.guestHistory,
      }),
    },
  ),
)

export default useStore
