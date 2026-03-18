export interface IApiResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
  error?: string | string[] | any;
}

export class ApiResponseWrapper {
  static success<T>(message: string, data?: T): IApiResponse<T> {
    return {
      status: "success",
      message,
      data,
    };
  }

  static error(message: string, error?: string | string[] | any): IApiResponse {
    return {
      status: "error",
      message,
      error,
    };
  }

  static paginated<T>(
    message: string,
    data: T[],
    total: number,
    page: number,
    limit: number
  ): IApiResponse<{ items: T[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    return {
      status: "success",
      message,
      data: {
        items: data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
}
