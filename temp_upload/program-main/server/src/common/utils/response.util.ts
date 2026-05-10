import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export class ResponseUtils {
  /**
   * 成功响应
   */
  static success<T>(data?: T, msg: string = 'success'): ApiResponse<T> {
    return {
      code: HttpStatus.OK,
      msg,
      data: data ?? null,
    };
  }

  /**
   * 分页响应
   */
  static page<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
  ): ApiResponse<{
    list: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return {
      code: HttpStatus.OK,
      msg: 'success',
      data: {
        list,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 错误响应
   */
  static error(
    msg: string,
    code: number = HttpStatus.BAD_REQUEST,
  ): ApiResponse {
    return {
      code,
      msg,
      data: null,
    };
  }
}
