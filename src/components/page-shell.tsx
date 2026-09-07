import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function PageShell({
	title,
	blurb,
	children,
	/**
	 * "inset" drops the centring and padding, for pages already inside the Learn
	 * layout's container. Without it the two containers fight and the content
	 * sits off-centre beside the sidebar.
	 */
	width = "page",
}: {
	title: string;
	blurb: string;
	children: ReactNode;
	width?: "page" | "inset";
}) {
	return (
		<main className={cn("w-full flex-1 py-10", width === "page" && "mx-auto max-w-5xl px-4")}>
			<div className="mb-8 max-w-2xl">
				<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
					{title}
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">{blurb}</p>
			</div>
			{children}
		</main>
	);
}

export function EmptyState({
	icon: Icon,
	title,
	description,
}: {
	icon: LucideIcon;
	title: string;
	description: string;
}) {
	return (
		<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
			<div className="mb-4 flex size-10 items-center justify-center rounded-full bg-muted">
				<Icon
					className="size-5 text-muted-foreground"
					aria-hidden="true"
				/>
			</div>
			<p className="text-sm font-medium text-foreground">{title}</p>
			<p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
		</div>
	);
}

/**
 * Placeholder for content that can only be known after hydration (anything read
 * from localStorage). Rendering nothing instead leaves the page blank on the
 * server — and permanently blank if the client bundle never runs.
 */
export function LoadingRows({ rows = 3, label }: { rows?: number; label: string }) {
	return (
		<div>
			<p
				className="sr-only"
				role="status"
			>
				{label}
			</p>
			<div
				aria-hidden="true"
				className="space-y-2"
			>
				{Array.from({ length: rows }).map((_, i) => (
					<div
						key={i}
						className="h-16 animate-pulse rounded-xl border border-border bg-muted/40 motion-reduce:animate-none"
					/>
				))}
			</div>
		</div>
	);
}
