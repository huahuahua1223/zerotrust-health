import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  // Mobile menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Claim form wizard
  claimFormStep: number;
  setClaimFormStep: (step: number) => void;
  resetClaimForm: () => void;

  // Transaction state
  pendingTxHash: `0x${string}` | null;
  setPendingTxHash: (hash: `0x${string}` | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Mobile menu
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

      // Claim form wizard
      claimFormStep: 0,
      setClaimFormStep: (step) => set({ claimFormStep: step }),
      resetClaimForm: () => set({ claimFormStep: 0 }),

      // Transaction state
      pendingTxHash: null,
      setPendingTxHash: (hash) => set({ pendingTxHash: hash }),
    }),
    {
      name: "zk-insurance-ui",
      partialize: (state) => ({
        // Only persist certain states
      }),
    }
  )
);

// Claim form data store
interface ClaimFormData {
  selectedPolicyId: bigint | null;
  diseaseType: number;
  claimAmount: string;
  documentHash: string;
  uploadedFiles: File[];
  zkProof: {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
  } | null;
  publicInputs: string[];
}

interface ClaimFormStore extends ClaimFormData {
  setSelectedPolicy: (policyId: bigint | null) => void;
  setDiseaseType: (type: number) => void;
  setClaimAmount: (amount: string) => void;
  setDocumentHash: (hash: string) => void;
  addUploadedFile: (file: File) => void;
  removeUploadedFile: (index: number) => void;
  setZKProof: (proof: ClaimFormData["zkProof"], inputs: string[]) => void;
  reset: () => void;
}

const initialClaimFormState: ClaimFormData = {
  selectedPolicyId: null,
  diseaseType: 0,
  claimAmount: "",
  documentHash: "",
  uploadedFiles: [],
  zkProof: null,
  publicInputs: [],
};

export const useClaimFormStore = create<ClaimFormStore>()((set) => ({
  ...initialClaimFormState,

  setSelectedPolicy: (policyId) => set({ selectedPolicyId: policyId }),
  setDiseaseType: (type) => set({ diseaseType: type }),
  setClaimAmount: (amount) => set({ claimAmount: amount }),
  setDocumentHash: (hash) => set({ documentHash: hash }),
  addUploadedFile: (file) =>
    set((state) => ({ uploadedFiles: [...state.uploadedFiles, file] })),
  removeUploadedFile: (index) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.filter((_, i) => i !== index),
    })),
  setZKProof: (proof, inputs) => set({ zkProof: proof, publicInputs: inputs }),
  reset: () => set(initialClaimFormState),
}));
