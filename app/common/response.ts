export type ApiResponse = {
  data?: any;
  success: boolean;
  errors?: Error[];
  message?: string;
};
