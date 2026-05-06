import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function createGuestRecord(scan) {
  return {
    ...scan,
    id: scan.id ?? `guest-${crypto.randomUUID()}`,
    created_at: scan.created_at ?? new Date().toISOString(),
  }
}

const useStore = create(
  persist(
    (set) => ({
      token: null,
      user: null, // Will store { id, email, display_name, photo_url }
      selectedImage: null,
      activeScan: null,
      guestHistory: [],
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
      addGuestScan: (scan) =>
        set((state) => ({
          guestHistory: [createGuestRecord(scan), ...state.guestHistory].slice(0, 20),
        })),
      removeGuestScan: (id) =>
        set((state) => ({
          guestHistory: state.guestHistory.filter((s) => s.id !== id),
        })),
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
        guestHistory: state.guestHistory,
        activeScan: state.activeScan,
      }),
    },
  ),
)

export default useStore
