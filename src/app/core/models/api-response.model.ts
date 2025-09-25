export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors: string[] | null;
}

export interface PagedResult<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  items: T[];
}
