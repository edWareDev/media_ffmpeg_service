export const startServer = ({ app, port, logger = console }) => new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
        logger.info(`API REST escuchando en puerto ${port}.`);
        resolve(server);
    });

    server.on('error', (error) => {
        let errorMessage;

        switch (error.code) {
            case 'EADDRINUSE':
                errorMessage = `El puerto ${port} está ocupado.`;
                break;
            case 'EACCES':
                errorMessage = `No se tienen permisos para usar el puerto ${port}.`;
                break;
            default:
                errorMessage = `Error al iniciar el servidor: ${error.message}`;
        }

        logger.error(errorMessage);
        reject(error);
    });
});
