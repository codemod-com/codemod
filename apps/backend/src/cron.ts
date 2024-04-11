import { CronJob } from "cron";
import { prisma } from "./db/prisma";

new CronJob(
	"* * * * *", // cronTime
	async () => {
		const twoMinutesAgo = new Date();
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
	true, // start
);
