import { describe, it, expect, afterEach } from "bun:test";

import * as fs from "fs";
import * as path from "path";
import { transcodeVideo } from "src/transcode";

describe("Transcoded Videos", () => {
	const inputPath = "src/tests/input.mp4";
	const id = "test-123";
	fs.mkdirSync(path.join(import.meta.dir, "test-tmp-dir/", id));
	const tmpDir = path.join(import.meta.dir, "test-tmp-dir/");
	const resolutions = ["480sq", "720sq", "1080sq", "480ws", "720ws", "1080ws"];

	afterEach(() => {
		// Cleanup: remove generated files after each test
		fs.rmSync(tmpDir + id, { recursive: true, force: true });
	});

	it("should generate expected mp4 files", async () => {
		const expectedOutputPaths = resolutions.map(
			(resolution) => `${tmpDir}${id}/sign-${id}-${resolution}.mp4`,
		);

		console.time("🎥 transcodeVideo");
		const outputPaths = await transcodeVideo(inputPath, id, tmpDir);
		console.timeEnd("🎥 transcodeVideo");
		expect(outputPaths).toEqual(expectedOutputPaths);

		// Check if files actually exist
		for (const outputPath of expectedOutputPaths) {
			expect(fs.existsSync(outputPath)).toBe(true);
		}
	});

	// Add more tests as needed
});
