interface ErrorResponse {
    statusCode: number;
    message: string;
}

interface SuccessResponse {
    statusCode: number;
    message: string;
    token: string;
    data: object;
}

export { ErrorResponse, SuccessResponse }