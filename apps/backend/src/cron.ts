import { CronJob } from 'cron';
import { prisma } from './db/prisma';
import { PostHogService } from './services/PostHogService';
import { environment } from './util';

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

let syncDatabaseWithPosthogDataCron = new CronJob(
	'0 * * * *', // cronTime - every hour
	async () => {
		let posthogService = new PostHogService(
			environment.POSTHOG_API_KEY ?? '',
			environment.POSTHOG_PROJECT_ID ?? '',
		);

		let codemodTotalRuns = await posthogService.getCodemodTotalRuns();

		for (let { slug, runs } of codemodTotalRuns) {
			console.log({ slug, runs });

			let codemod = await prisma.codemod.findFirst({
				where: { slug },
			});

			if (codemod) {
				await prisma.codemod.update({
					where: { id: codemod.id },
					data: { totalRuns: runs },
				});
			}
		}
	}, // onTick
	null, // onComplete
	false, // start
);

export let startCronJobs = () => {
	cleanupLoginIntentsCron.start();
	syncDatabaseWithPosthogDataCron.start();
};
