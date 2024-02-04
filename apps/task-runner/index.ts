import { prisma } from "@dactylo/db";
import cron from "node-cron";

const updateVideosTrendingScore = async () => {
	const videos = await prisma.video.findMany({
		select: {
			votes: true,
			id: true,
			voteCount: true,
			uploadDate: true,
		},
	});
	function calculateTrendingScore({
		voteCount,
		uploadDate,
	}: { voteCount: number; uploadDate: Date }) {
		const uploadSecondsAgo = (Date.now() - uploadDate.getTime()) / 3600000;
		return uploadSecondsAgo ** 1.5 / voteCount;
	}
	//set trending score
	for (const video of videos) {
		const trendingScore = calculateTrendingScore({
			voteCount: video.voteCount,
			uploadDate: video.uploadDate,
		});
		await prisma.video.update({
			where: {
				id: video.id,
			},
			data: {
				trendingScore,
			},
		});
	}
	console.log("Done!");
	console.log(`Updated trending score for ${videos.length} videos!`);
};

// Run every minute, for testing
// cron.schedule("* * * * *", updateVideosTrendingScore);
// Run every 30 minutes in production
cron.schedule("*/30 * * * *", updateVideosTrendingScore);
