import { create } from "zustand";

export type SpaceEditDraft = {
  id: string;
  name: string;
  description: string;
};

export type SpaceDeleteTarget = {
  id: string;
  name: string;
};

export type ProjectEditDraft = {
  id: string;
  spaceId: string;
  name: string;
  description: string;
};

export type ProjectDeleteTarget = {
  id: string;
  spaceId: string;
  name: string;
};

type UIState = {
  activeSpaceId: string | null;
  activeProjectId: string | null;
  activeEnvironmentId: string | null;

  isCreateSpaceOpen: boolean;
  isEditSpaceOpen: boolean;
  spaceEditDraft: SpaceEditDraft | null;
  isDeleteSpaceOpen: boolean;
  spaceDeleteTarget: SpaceDeleteTarget | null;

  isCreateProjectOpen: boolean;
  isEditProjectOpen: boolean;
  projectEditDraft: ProjectEditDraft | null;
  isDeleteProjectOpen: boolean;
  projectDeleteTarget: ProjectDeleteTarget | null;

  isCreateEnvOpen: boolean;
  isPasteEnvOpen: boolean;
  isInviteMemberOpen: boolean;
  isAssignMemberOpen: boolean;
  isSpaceSettingsOpen: boolean;

  setActiveSpace: (id: string | null) => void;
  setActiveProject: (id: string | null) => void;
  setActiveEnvironment: (id: string | null) => void;

  openCreateSpace: () => void;
  closeCreateSpace: () => void;
  openEditSpace: (draft: SpaceEditDraft) => void;
  closeEditSpace: () => void;
  openDeleteSpaceConfirm: (target: SpaceDeleteTarget) => void;
  closeDeleteSpaceConfirm: () => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openEditProject: (draft: ProjectEditDraft) => void;
  closeEditProject: () => void;
  openDeleteProjectConfirm: (target: ProjectDeleteTarget) => void;
  closeDeleteProjectConfirm: () => void;
  openCreateEnv: () => void;
  closeCreateEnv: () => void;
  openPasteEnv: () => void;
  closePasteEnv: () => void;
  openInviteMember: () => void;
  closeInviteMember: () => void;
  openAssignMember: () => void;
  closeAssignMember: () => void;
  openSpaceSettings: () => void;
  closeSpaceSettings: () => void;
  closeAllModals: () => void;
};

const initialModals = {
  isCreateSpaceOpen: false,
  isEditSpaceOpen: false,
  spaceEditDraft: null as SpaceEditDraft | null,
  isDeleteSpaceOpen: false,
  spaceDeleteTarget: null as SpaceDeleteTarget | null,
  isCreateProjectOpen: false,
  isEditProjectOpen: false,
  projectEditDraft: null as ProjectEditDraft | null,
  isDeleteProjectOpen: false,
  projectDeleteTarget: null as ProjectDeleteTarget | null,

  isCreateEnvOpen: false,
  isPasteEnvOpen: false,
  isInviteMemberOpen: false,
  isAssignMemberOpen: false,
  isSpaceSettingsOpen: false,
} as const;

export const useUIStore = create<UIState>((set) => ({
  activeSpaceId: null,
  activeProjectId: null,
  activeEnvironmentId: null,

  ...initialModals,

  setActiveSpace: (id) => set({ activeSpaceId: id }),
  setActiveProject: (id) => set({ activeProjectId: id }),
  setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),

  openCreateSpace: () => set({ isCreateSpaceOpen: true }),
  closeCreateSpace: () => set({ isCreateSpaceOpen: false }),
  openEditSpace: (draft) =>
    set({
      isEditSpaceOpen: true,
      spaceEditDraft: draft,
    }),
  closeEditSpace: () =>
    set({ isEditSpaceOpen: false, spaceEditDraft: null }),
  openDeleteSpaceConfirm: (target) =>
    set({
      isDeleteSpaceOpen: true,
      spaceDeleteTarget: target,
    }),
  closeDeleteSpaceConfirm: () =>
    set({ isDeleteSpaceOpen: false, spaceDeleteTarget: null }),
  openCreateProject: () => set({ isCreateProjectOpen: true }),
  closeCreateProject: () => set({ isCreateProjectOpen: false }),
  openEditProject: (draft) =>
    set({ isEditProjectOpen: true, projectEditDraft: draft }),
  closeEditProject: () =>
    set({ isEditProjectOpen: false, projectEditDraft: null }),
  openDeleteProjectConfirm: (target) =>
    set({ isDeleteProjectOpen: true, projectDeleteTarget: target }),
  closeDeleteProjectConfirm: () =>
    set({ isDeleteProjectOpen: false, projectDeleteTarget: null }),
  openCreateEnv: () => set({ isCreateEnvOpen: true }),
  closeCreateEnv: () => set({ isCreateEnvOpen: false }),
  openPasteEnv: () => set({ isPasteEnvOpen: true }),
  closePasteEnv: () => set({ isPasteEnvOpen: false }),
  openInviteMember: () => set({ isInviteMemberOpen: true }),
  closeInviteMember: () => set({ isInviteMemberOpen: false }),
  openAssignMember: () => set({ isAssignMemberOpen: true }),
  closeAssignMember: () => set({ isAssignMemberOpen: false }),
  openSpaceSettings: () => set({ isSpaceSettingsOpen: true }),
  closeSpaceSettings: () => set({ isSpaceSettingsOpen: false }),

  closeAllModals: () => set({ ...initialModals }),
}));
