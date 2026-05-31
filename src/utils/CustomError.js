export class CustomError extends Error {
    constructor(message, httpErrorCode, errorCode) {
        super(message);
        this.name = 'CustomError';
        this.httpErrorCode = httpErrorCode;
        this.errorCode = errorCode;
    }

    toJSON() {
        return {
            message: this.message,
            httpErrorCode: this.httpErrorCode,
            errorCode: this.errorCode
        };
    }
}
