const closeHttpServer = (server) => new Promise((resolve, reject) => {
    if (!server) {
        resolve();
        return;
    }

    server.close((error) => {
        if (error) {
            reject(error);
            return;
        }

        resolve();
    });
});

export const createStopServerHandler = ({
    getResources,
    logger = console,
    timeoutMs = 30000,
    exit = process.exit
}) => {
    let isShuttingDown = false;

    return async (signal, exitCode = 0) => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        logger.info(`Cerrando servicio por ${signal}.`);

        const stopTimeout = setTimeout(() => {
            logger.error('No se pudo cerrar el servicio dentro del tiempo esperado.');
            exit(1);
        }, timeoutMs);
        stopTimeout.unref();

        const {
            server,
            workers = [],
            queues = [],
            clients = [],
            databases = []
        } = getResources();

        try {
            await closeHttpServer(server);
            await Promise.all(workers.map((worker) => worker?.close?.()));
            await Promise.all(queues.map((queue) => queue?.close?.()));
            await Promise.all(clients.map((client) => client?.quit?.() || client?.close?.()));
            await Promise.all(databases.map((database) => database?.()));
            clearTimeout(stopTimeout);
            logger.info('Servicio cerrado correctamente.');
            exit(exitCode);
        } catch (error) {
            clearTimeout(stopTimeout);
            logger.error('Error durante el cierre del servicio.', error.message);
            exit(1);
        }
    };
};
