"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { attemptKey, clearAttempts, useAttempts, useIsHydrated } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingRows } from "@/components/page-shell";

export type ChapterLink = { id: string; title: string; href: string };

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
	return (
		<div className="rounded-xl border border-border bg-card p-5">
			<p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
				{label}
			</p>
			<p className="font-heading mt-2 text-3xl font-semibold tracking-tight text-foreground">
				{value}
			</p>
			{hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
		</div>
	);
}

export function ProgressDashboard({ chapters }: { chapters: ChapterLink[] }) {
	const attempts = useAttempts();
	const hydrated = useIsHydrated();

	// localStorage is unreadable on the server, so a placeholder stands in until
	// hydration rather than leaving the page blank.
	if (!hydrated) {
		return (
			<LoadingRows
				rows={4}
				label="Reading your history"
			/>
		);
	}

	if (attempts.length === 0) {
		return (
			<EmptyState
				icon={TrendingUp}
				title="No attempts recorded"
				description="Scores, weak topics and time since last review land here after you have taken a quiz or two."
			/>
		);
	}

	const total = attempts.length;
	const correct = attempts.filter((a) => a.correct).length;
	const accuracy = Math.round((correct / total) * 100);
	const distinct = new Set(attempts.map(attemptKey)).size;
	const last = attempts[attempts.length - 1];

	const byChapter = new Map<string, { total: number; correct: number; at: string }>();

	for (const attempt of attempts) {
		const row = byChapter.get(attempt.chapterId) ?? { total: 0, correct: 0, at: attempt.at };
		row.total += 1;
		row.correct += attempt.correct ? 1 : 0;
		row.at = attempt.at > row.at ? attempt.at : row.at;
		byChapter.set(attempt.chapterId, row);
	}

	const rows = chapters
		.filter((chapter) => byChapter.has(chapter.id))
		.map((chapter) => {
			const row = byChapter.get(chapter.id)!;
			return {
				...chapter,
				...row,
				accuracy: Math.round((row.correct / row.total) * 100),
			};
		})
		.sort((a, b) => a.accuracy - b.accuracy);

	return (
		<div className="space-y-10">
			<div className="grid gap-4 sm:grid-cols-3">
				<Stat
					label="Answered"
					value={String(total)}
					hint={`${distinct} distinct questions`}
				/>
				<Stat
					label="Accuracy"
					value={`${accuracy}%`}
					hint={`${correct} of ${total} correct`}
				/>
				<Stat
					label="Last seen"
					value={new Date(last.at).toLocaleDateString()}
					hint={new Date(last.at).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				/>
			</div>

			<section aria-labelledby="by-chapter">
				<h2
					id="by-chapter"
					className="font-heading mb-4 text-sm font-medium tracking-tight text-muted-foreground"
				>
					Weakest first
				</h2>
				<ul className="space-y-2">
					{rows.map((row) => (
						<li key={row.id}>
							<Link
								href={row.href}
								className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
							>
								<span className="flex-1">
									<span className="block text-sm font-medium text-foreground">
										{row.title}
									</span>
									<span className="mt-1 block font-mono text-xs text-muted-foreground">
										{row.correct}/{row.total}
									</span>
								</span>
								<span
									className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"
									role="img"
									aria-label={`${row.accuracy} percent correct`}
								>
									<span
										className="block h-full rounded-full bg-primary"
										style={{ width: `${row.accuracy}%` }}
									/>
								</span>
								<span className="w-10 text-right font-mono text-xs text-muted-foreground">
									{row.accuracy}%
								</span>
							</Link>
						</li>
					))}
				</ul>
			</section>

			<div>
				<Button
					variant="outline"
					size="sm"
					onClick={clearAttempts}
				>
					Clear history
				</Button>
				<p className="mt-2 text-xs text-muted-foreground">
					History is stored in this browser only, so it does not follow you to another
					device.
				</p>
			</div>
		</div>
	);
}
