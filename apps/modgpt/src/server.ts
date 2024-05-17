import { initApp } from './init';
import { protectedRoutes, publicRoutes } from './routes';

export let runServer = async () =>
	await initApp([publicRoutes, protectedRoutes]);
