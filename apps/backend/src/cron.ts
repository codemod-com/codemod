import { CronJob } from 'cron';
import { prisma } from './db/prisma';

let cleanupLoginIntentsCron = new CronJob(
	'* * * * *', // cronTime
	async () => {
		let twoMinutesAgo = new Date();
		twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);

		await prisma.userLoginIntent.deleteMany({
			where: {
				createdAt: {
					lte: twoMinutesAgo,
				},
			},
		});
	}, // onTick
	null, // onComplete
	false, // start
);

export let startCronJobs = () => {
	cleanupLoginIntentsCron.start();
};
