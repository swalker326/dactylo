import { useState, useEffect } from "react";

const CircularProgress = ({
	duration,
	onEnd,
}: {
	duration: number;
	onEnd: () => void;
}) => {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		// Calculate the time interval for each progress step
		const intervalTime = duration / 100;

		// Set an interval to update the progress
		const interval = setInterval(() => {
			setProgress((oldProgress) => {
				if (oldProgress === 100) {
					clearInterval(interval);
					if (onEnd) onEnd();
					return 100;
				}
				return Math.min(oldProgress + 1, 100);
			});
		}, intervalTime);

		// Clear interval on unmount
		return () => clearInterval(interval);
	}, [duration, onEnd]);

	// Calculate the stroke dash array values for the SVG circle
	const radius = 30; // Radius of the circle
	const circumference = 2 * Math.PI * radius;
	const strokeDashArray = `${
		(circumference * progress) / 100
	} ${circumference}`;

	return (
		<div className="relative">
			<svg width="66" height="66">
				<circle
					className="stroke-blue-100"
					stroke="white"
					fill="none"
					strokeWidth="6"
					cx="33"
					cy="33"
					r="30"
					// strokeDasharray={strokeDashArray}
					transform="rotate(-90, 33, 33)"
				/>
			</svg>
			<svg width="66" height="66" className="absolute top-0">
				<circle
					className="stroke-red-500"
					fill="none"
					strokeWidth="6"
					cx="33"
					cy="33"
					r={radius}
					strokeDasharray={strokeDashArray}
					transform="rotate(-90, 33, 33)"
				/>
			</svg>
		</div>
	);
};

export default CircularProgress;
