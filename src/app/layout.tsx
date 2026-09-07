import type { Metadata } from "next";
import { DM_Mono, DM_Sans } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const dmSans = DM_Sans({
	variable: "--font-dm-sans",
	subsets: ["latin"],
});

const dmMono = DM_Mono({
	variable: "--font-dm-mono",
	weight: ["400", "500"],
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		default: "hardrefresh",
		template: "%s · hardrefresh",
	},
	description:
		"Dump what you are learning, turn it into questions, and find out later whether any of it stuck.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${dmSans.variable} ${dmMono.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col">
				<SiteHeader />
				{children}
			</body>
		</html>
	);
}
