import type { MDXComponents } from "mdx/types";

import { mdxElements } from "@/components/mdx";

const components: MDXComponents = mdxElements;

// Next 16 calls this with no arguments.
export function useMDXComponents(): MDXComponents {
	return components;
}
