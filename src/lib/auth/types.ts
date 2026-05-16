/** JWT + session payloads */
export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: string;
};
