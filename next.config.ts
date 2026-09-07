import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	pageExtensions: ["ts", "tsx", "md", "mdx"],
};

const withMDX = createMDX({
	options: {
		// Turbopack requires plugins as strings, not imported functions.
		remarkPlugins: ["remark-gfm", "remark-frontmatter"],
		rehypePlugins: [],
	},
});

export default withMDX(nextConfig);
