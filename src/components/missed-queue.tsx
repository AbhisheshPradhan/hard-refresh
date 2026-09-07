"use client";

import Link from "next/link";
import { History, RotateCcw } from "lucide-react";

import { attemptKey, getMissedKeys, useAttempts, useIsHydrated } from "@/lib/progress";
import { EmptyState, LoadingRows } from "@/components/page-shell";

export type ChapterLink = { id: string; title: string; href: string };

/**
 * Reads localStorage, so it renders nothing until after hydration. That avoids a
 * mismatch and means the server-rendered page never claims a queue the browser
 * might not have.
 */
export function MissedQueue({ chapters }: { chapters: ChapterLink[] }) {
	const attempts = useAttempts();
	const hydrated = useIsHydrated();

	if (!hydrated) {
		return (
			<LoadingRows
				rows={3}
				label="Reading your history"
			/>
		);
	}

	const missed = getMissedKeys(attempts);

	if (missed.size === 0) {
		return (
			<EmptyState
				icon={History}
				title="Nothing due"
				description="Take a quiz first. Anything you answer wrong is queued here, across every subject, until you get it right."
			/>
		);
	}

	const byChapter = new Map<string, number>();

	for (const attempt of attempts) {
		if (missed.has(attemptKey(attempt))) {
			byChapter.set(attempt.chapterId, (byChapter.get(attempt.chapterId) ?? 0) + 1);
		}
	}

	const rows = chapters
		.filter((chapter) => byChapter.has(chapter.id))
		.map((chapter) => ({ ...chapter, count: byChapter.get(chapter.id) ?? 0 }))
		.sort((a, b) => b.count - a.count);

	return (
		<section aria-labelledby="missed-heading">
			<h2
				id="missed-heading"
				className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground"
			>
				<RotateCcw
					className="size-4 text-primary"
					aria-hidden="true"
				/>
				Due again
			</h2>
			<p className="mb-5 text-sm text-muted-foreground">
				{missed.size} question{missed.size === 1 ? "" : "s"} you last answered wrong.
				Weakest chapters first.
			</p>

			<ul className="space-y-2">
				{rows.map((row) => (
					<li key={row.id}>
						<Link
							href={row.href}
							className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
						>
							<span className="text-sm font-medium text-foreground">{row.title}</span>
							<span className="rounded-full border border-primary/50 bg-primary/10 px-2.5 py-0.5 font-mono text-xs text-primary">
								{row.count}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
