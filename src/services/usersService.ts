export interface AppUser {
  id: string;
  name: string;
  avatarUrl: string;
}

const AVATAR_PLACEHOLDER =
  'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original';

export const USERS: AppUser[] = [
  { id: 'u1', name: 'Fulano', avatarUrl: AVATAR_PLACEHOLDER },
  { id: 'u2', name: 'Sicrana', avatarUrl: AVATAR_PLACEHOLDER },
  { id: 'u3', name: 'João da Silva', avatarUrl: AVATAR_PLACEHOLDER },
  { id: 'u4', name: 'Maria', avatarUrl: AVATAR_PLACEHOLDER },
  { id: 'voce', name: 'Você', avatarUrl: AVATAR_PLACEHOLDER },
];

export function getUserById(id: string): AppUser | undefined {
  return USERS.find((u) => u.id === id);
}
