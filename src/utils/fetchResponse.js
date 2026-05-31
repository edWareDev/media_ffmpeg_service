export const fetchResponse = (res, { statusCode, message, data, errorCode }) => {
    const body = {
        ok: statusCode >= 200 && statusCode < 300,
        message
    };

    if (data !== undefined) body.data = data;
    if (errorCode !== undefined) body.errorCode = errorCode;

    return res.status(statusCode).json(body);
};
