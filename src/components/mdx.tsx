import type { ReactNode } from "react";
import { Hammer, Info, Lightbulb, PencilRuler } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Wraps a raw inline <svg> from the workbook. The SVGs use currentColor and carry
 * their own role="img" and aria-label, so nothing here re-labels them. They have no
 * intrinsic size, so they fill the width; below the viewBox width they scroll rather
 * than shrinking into illegibility.
 */
export function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
	return (
		<figure className="my-8">
			<div className="overflow-x-auto rounded-xl border border-border bg-card p-4">
				<div className="min-w-[560px] text-foreground [&_svg]:h-auto [&_svg]:w-full">
					{children}
				</div>
			</div>
			{caption ? (
				<figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
			) : null}
		</figure>
	);
}

const calloutKinds = {
	predict: {
		label: "Predict",
		icon: Lightbulb,
		className: "border-primary/50 bg-primary/5",
	},
	brief: {
		label: "Brief",
		icon: PencilRuler,
		className: "border-border bg-muted/50",
	},
	build: {
		label: "Build",
		icon: Hammer,
		className: "border-primary/50 bg-primary/5",
	},
	note: {
		label: "Note",
		icon: Info,
		className: "border-border bg-muted/50",
	},
} as const;

export type CalloutKind = keyof typeof calloutKinds;

export function Callout({
	kind = "predict",
	children,
}: {
	kind?: CalloutKind;
	children: ReactNode;
}) {
	const { label, icon: Icon, className } = calloutKinds[kind] ?? calloutKinds.predict;

	return (
		<aside className={cn("my-8 rounded-xl border p-5", className)}>
			<p className="mb-3 flex items-center gap-2 font-mono text-xs tracking-wide text-muted-foreground uppercase">
				<Icon
					className="size-3.5"
					aria-hidden="true"
				/>
				{label}
			</p>
			<div className="space-y-3 text-sm [&>*:last-child]:mb-0">{children}</div>
		</aside>
	);
}

/**
 * Element overrides shared by every rendered note. Kept here rather than in
 * mdx-components.tsx so the pieces can also be used outside MDX.
 */
export const mdxElements = {
	h2: (props: React.ComponentProps<"h2">) => (
		<h2
			className="font-heading mt-12 mb-3 scroll-mt-20 text-xl font-semibold tracking-tight text-foreground"
			{...props}
		/>
	),
	h3: (props: React.ComponentProps<"h3">) => (
		<h3
			className="font-heading mt-8 mb-2 scroll-mt-20 text-base font-semibold tracking-tight text-foreground"
			{...props}
		/>
	),
	p: (props: React.ComponentProps<"p">) => (
		<p
			className="mb-4 leading-7 text-foreground/90"
			{...props}
		/>
	),
	ul: (props: React.ComponentProps<"ul">) => (
		<ul
			className="mb-4 list-disc space-y-1.5 pl-5 leading-7 text-foreground/90 marker:text-muted-foreground"
			{...props}
		/>
	),
	ol: (props: React.ComponentProps<"ol">) => (
		<ol
			className="mb-4 list-decimal space-y-1.5 pl-5 leading-7 text-foreground/90 marker:text-muted-foreground"
			{...props}
		/>
	),
	a: (props: React.ComponentProps<"a">) => (
		<a
			className="text-primary underline underline-offset-4 hover:no-underline"
			{...props}
		/>
	),
	strong: (props: React.ComponentProps<"strong">) => (
		<strong
			className="font-semibold text-foreground"
			{...props}
		/>
	),
	hr: (props: React.ComponentProps<"hr">) => (
		<hr
			className="my-10 border-border"
			{...props}
		/>
	),
	blockquote: (props: React.ComponentProps<"blockquote">) => (
		<blockquote
			className="mb-4 border-l-2 border-primary/50 pl-4 text-muted-foreground italic"
			{...props}
		/>
	),
	// Fenced blocks arrive as <pre><code>. Long lines scroll rather than wrap.
	pre: (props: React.ComponentProps<"pre">) => (
		<pre
			className="mb-4 overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 font-mono text-[0.8125rem] leading-6"
			{...props}
		/>
	),
	code: ({ className, ...props }: React.ComponentProps<"code">) => {
		const isBlock = typeof className === "string" && className.startsWith("language-");

		if (isBlock) {
			return (
				<code
					className={className}
					{...props}
				/>
			);
		}

		return (
			<code
				className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
				{...props}
			/>
		);
	},
	table: (props: React.ComponentProps<"table">) => (
		<div className="mb-6 overflow-x-auto rounded-xl border border-border">
			<table
				className="w-full border-collapse text-left text-sm [&_tr:last-child_td]:border-0"
				{...props}
			/>
		</div>
	),
	th: (props: React.ComponentProps<"th">) => (
		<th
			className="border-b border-border bg-muted/50 px-4 py-2.5 font-medium text-foreground"
			{...props}
		/>
	),
	td: (props: React.ComponentProps<"td">) => (
		<td
			className="border-b border-border px-4 py-2.5 align-top text-foreground/90"
			{...props}
		/>
	),
	Figure,
	Callout,
};
