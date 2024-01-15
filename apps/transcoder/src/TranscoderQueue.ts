export type TranscodingJobArgs = {
	file: Blob;
	filename: string;
	id: string;
	tempDir: string;
};

type TranscodingJob = (args: TranscodingJobArgs) => Promise<
	| {
			message: string;
			id: string;
			files: string[];
			error?: undefined;
	  }
	| {
			message: string;
			error: string;
			id?: undefined;
			files?: undefined;
	  }
>;

export class EncoderWorker {
	constructor(private queue: EncoderQueue) {
		this.startProcessing();
	}

	private async startProcessing() {
		while (true) {
			if (!this.queue.isEmpty()) {
				console.log("Processing job...");
				const queueItem = this.queue.next();
				if (queueItem) {
					try {
						await queueItem.job(queueItem.args);
					} catch (error) {
						console.error("Error processing job:", error);
						// Handle error appropriately
					}
				}
			} else {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}
	}
}

export class EncoderQueue {
	private queue: Array<{ job: TranscodingJob; args: TranscodingJobArgs }> = [];

	public add(job: TranscodingJob, args: TranscodingJobArgs): void {
		this.queue.push({ job, args });
	}

	public next(): { job: TranscodingJob; args: TranscodingJobArgs } | null {
		return this.queue.shift() || null;
	}

	public isEmpty(): boolean {
		return this.queue.length === 0;
	}
}
