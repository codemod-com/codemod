import { runServer } from './runServer.js';
import { parseEnvironment } from './schema.js';

let callback: (() => void) | undefined;

const handleProcessExit = (code: 0 | 1) => {
	callback?.();

	setTimeout(() => {
		process.exit(code);
	}, 1000).unref();
};

process.on('uncaughtException', (error) => {
	console.error(error);

	process.exit(1);
});
process.on('unhandledRejection', (reason) => {
	console.error(reason);

	handleProcessExit(1);
});
process.on('SIGTERM', (signal) => {
	console.log(signal);

	handleProcessExit(0);
});
process.on('SIGINT', (signal) => {
	console.log(signal);

	handleProcessExit(0);
});

const environment = parseEnvironment(process.env);

runServer(environment).then((close) => {
	callback = close;
});
