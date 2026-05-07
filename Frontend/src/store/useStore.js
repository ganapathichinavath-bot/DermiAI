import { create } from 'zustand'
import { persist } from 'zustand/middleware'


const useStore = create(
  persist(
    (set) => ({
      token: null,
      user: null, // Will store { id, email, display_name, photo_url }
      selectedImage: null,
      activeScan: null,
      processingError: null,
      processingStep: 0,

      setSession: ({ token, user }) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
      setSelectedImage: (selectedImage) => set({ selectedImage }),
      clearSelectedImage: () => set({ selectedImage: null }),
      setActiveScan: (activeScan) => set({ activeScan }),
      clearActiveScan: () => set({ activeScan: null }),
      setProcessingError: (processingError) => set({ processingError }),
      setProcessingStep: (processingStep) => set({ processingStep }),
      resetProcessingState: () => set({ processingError: null, processingStep: 0 }),
      logout: () =>
        set({
          token: null,
          user: null,
          activeScan: null,
          processingError: null,
          processingStep: 0,
          selectedImage: null,
        }),
    }),
    {
      name: 'dermai-app',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeScan: state.activeScan,
      }),
    },
  ),
)

export default useStore
