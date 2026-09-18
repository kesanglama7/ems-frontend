export interface Result<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description: string | null;
  isOfficeClosed: boolean;
}
