import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Renders the markdown subset used by quiz explanations and interview model
 * answers: fenced code blocks, inline code, bold, and paragraphs. Those strings
 * live in JSON rather than in .mdx files, so they never reach the MDX compiler.
 *
 * Deliberately not a general markdown renderer. If the content grows headings,
 * tables or links, compile it properly instead of extending this.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	// Alternates between plain text, `code` and **bold**.
	const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let key = 0;

	while ((match = pattern.exec(text)) !== null) {
		if (match.index > lastIndex) {
			nodes.push(text.slice(lastIndex, match.index));
		}

		if (match[1]) {
			nodes.push(
				<code
					key={`${keyPrefix}-c${key++}`}
					className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
				>
					{match[1].slice(1, -1)}
				</code>
			);
		} else if (match[2]) {
			nodes.push(
				<strong
					key={`${keyPrefix}-b${key++}`}
					className="font-semibold text-foreground"
				>
					{match[2].slice(2, -2)}
				</strong>
			);
		}

		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
}

function renderProse(text: string, keyPrefix: string): ReactNode[] {
	// Blank-ish lines separate paragraphs. The conversion left lines of stray
	// whitespace behind, so treat whitespace-only lines as blank.
	const normalized = text
		.split("\n")
		.map((line) => (line.trim() === "" ? "" : line))
		.join("\n");

	return normalized
		.split(/\n{2,}/)
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block, i) => (
			<p
				key={`${keyPrefix}-p${i}`}
				className="mb-3 leading-7 last:mb-0"
			>
				{renderInline(block, `${keyPrefix}-p${i}`)}
			</p>
		));
}

export function Markdown({ children, className }: { children: string; className?: string }) {
	const nodes: ReactNode[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	let block = 0;
	// Constructed per call: a module-level /g regex carries lastIndex between calls.
	const fence = /```(\w*)\n([\s\S]*?)```/g;

	while ((match = fence.exec(children)) !== null) {
		if (match.index > lastIndex) {
			nodes.push(...renderProse(children.slice(lastIndex, match.index), `t${block}`));
		}

		nodes.push(
			<pre
				key={`code-${block++}`}
				className="mb-3 overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-[0.8125rem] leading-6 last:mb-0"
			>
				<code>{match[2].replace(/\n$/, "")}</code>
			</pre>
		);

		lastIndex = match.index + match[0].length;
	}

	if (lastIndex < children.length) {
		nodes.push(...renderProse(children.slice(lastIndex), `t${block}`));
	}

	return <div className={cn("text-sm text-foreground/90", className)}>{nodes}</div>;
}
