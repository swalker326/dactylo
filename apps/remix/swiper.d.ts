import React from "react";

import type { SwiperSlideProps, SwiperProps } from "swiper/react";

declare module "react" {
	interface CSSProperties {
		"--swiper-navigation-color"?: string;
		"--swiper-pagination-color"?: string;
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"swiper-container": React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement> &
					SwiperProps & {
						navigation?: boolean;
						pagination?: boolean;
						style?: React.CSSProperties;
					},
				HTMLElement
			>;
			"swiper-slide": React.DetailedHTMLProps<
				React.HTMLAttributes<HTMLElement> & SwiperSlideProps,
				HTMLElement
			>;
		}
	}
}
