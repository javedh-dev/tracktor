export type ApiResponse<T = any> = {
  data?: T;
  success: boolean;
  errors?: Error[];
  message?: string;
};
