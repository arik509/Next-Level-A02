import type { Response } from "express";

interface TResponseData<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

const sendResponse = <T>(
  res: Response,
  responseData: TResponseData<T>,
): Response => {
  const responseBody = {
    success: responseData.success,
    message: responseData.message,
    ...(responseData.data !== undefined && {
      data: responseData.data,
    }),
  };

  return res
    .status(responseData.statusCode)
    .json(responseBody);
};

export default sendResponse;