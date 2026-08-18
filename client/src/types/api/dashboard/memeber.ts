export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: string;
  joinedAt: string;
}

export interface MemberUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface WorkspaceMemberWithUser extends WorkspaceMember {
  user: MemberUser;
}
