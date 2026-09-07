"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, RotateCcw, X } from "lucide-react";

import type { QuizItem } from "@/lib/content-types";
import { recordAttempts, type Attempt } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";

type NoteLink = { id: string; title: string; href: string };

export function QuizRunner({ items, noteLinks }: { items: QuizItem[]; noteLinks: NoteLink[] }) {
	const [index, setIndex] = useState(0);
	const [picked, setPicked] = useState<number | null>(null);
	const [results, setResults] = useState<boolean[]>([]);
	const [done, setDone] = useState(false);

	const noteById = useMemo(() => {
		return new Map(noteLinks.map((note) => [note.id, note]));
	}, [noteLinks]);

	const item = items[index];
	const answered = picked !== null;
	const isCorrect = picked === item?.correctIndex;
	const correctCount = results.filter(Boolean).length;

	const pick = (option: number) => {
		if (answered) {
			return;
		}

		setPicked(option);
		setResults((prev) => [...prev, option === item.correctIndex]);

		recordAttempts([
			{
				itemId: item.id,
				noteId: item.noteId,
				chapterId: item.chapterId,
				subject: item.chapterId.split("/")[0],
				correct: option === item.correctIndex,
				at: new Date().toISOString(),
			} satisfies Attempt,
		]);
	};

	const advance = () => {
		if (index === items.length - 1) {
			setDone(true);
			return;
		}

		setIndex((i) => i + 1);
		setPicked(null);
	};

	const restart = () => {
		setIndex(0);
		setPicked(null);
		setResults([]);
		setDone(false);
	};

	if (items.length === 0) {
		return null;
	}

	if (done) {
		const pct = Math.round((correctCount / items.length) * 100);

		return (
			<div className="rounded-xl border border-border bg-card p-8 text-center">
				<p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
					Score
				</p>
				<p className="font-heading mt-2 text-4xl font-semibold tracking-tight text-foreground">
					{correctCount}/{items.length}
				</p>
				<p className="mt-1 text-sm text-muted-foreground">{pct}% correct</p>
				<div className="mt-6 flex flex-wrap justify-center gap-3">
					<Button
						size="lg"
						className="h-10 px-4"
						onClick={restart}
					>
						<RotateCcw aria-hidden="true" />
						Take it again
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="h-10 px-4"
						render={<Link href="/progress" />}
					>
						See progress
					</Button>
				</div>
			</div>
		);
	}

	const sourceNote = noteById.get(item.noteId);

	return (
		<div>
			<div className="mb-6 flex items-center justify-between gap-4">
				<p className="font-mono text-xs text-muted-foreground">
					{index + 1} / {items.length}
				</p>
				<div
					className="h-1 flex-1 overflow-hidden rounded-full bg-muted"
					role="progressbar"
					aria-valuenow={index + 1}
					aria-valuemin={1}
					aria-valuemax={items.length}
					aria-label="Quiz progress"
				>
					<div
						className="h-full bg-primary transition-all"
						style={{ width: `${((index + 1) / items.length) * 100}%` }}
					/>
				</div>
				<p className="font-mono text-xs text-muted-foreground">{correctCount} correct</p>
			</div>

			<h2 className="font-heading text-lg font-semibold tracking-tight text-balance text-foreground">
				{item.question}
			</h2>

			<ul className="mt-5 space-y-2">
				{item.options.map((option, i) => {
					const isAnswer = i === item.correctIndex;
					const isPicked = i === picked;

					return (
						<li key={i}>
							<button
								type="button"
								onClick={() => pick(i)}
								disabled={answered}
								aria-label={`Option ${i + 1}: ${option}`}
								className={cn(
									"flex w-full items-start gap-3 rounded-lg border p-3.5 text-left text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
									!answered &&
										"cursor-pointer border-border hover:border-primary/50 hover:bg-muted/50",
									answered && "cursor-default",
									answered &&
										isAnswer &&
										"border-success/50 bg-success/10 text-success",
									answered &&
										isPicked &&
										!isAnswer &&
										"border-destructive/50 bg-destructive/10 text-destructive",
									answered &&
										!isAnswer &&
										!isPicked &&
										"border-border text-muted-foreground"
								)}
							>
								<span className="mt-0.5 shrink-0">
									{answered && isAnswer ? (
										<Check
											className="size-4"
											aria-hidden="true"
										/>
									) : answered && isPicked ? (
										<X
											className="size-4"
											aria-hidden="true"
										/>
									) : (
										<span
											className="block size-4 rounded-full border border-current opacity-40"
											aria-hidden="true"
										/>
									)}
								</span>
								<span>{option}</span>
							</button>
						</li>
					);
				})}
			</ul>

			<div
				aria-live="polite"
				className="mt-5"
			>
				{answered ? (
					<div className="rounded-xl border border-border bg-muted/40 p-5">
						<p
							className={cn(
								"mb-3 flex items-center gap-2 font-mono text-xs tracking-wide uppercase",
								isCorrect ? "text-success" : "text-destructive"
							)}
						>
							{isCorrect ? (
								<Check
									className="size-3.5"
									aria-hidden="true"
								/>
							) : (
								<X
									className="size-3.5"
									aria-hidden="true"
								/>
							)}
							{isCorrect ? "Correct" : "Not quite"}
						</p>

						<Markdown>{item.explanation}</Markdown>

						{sourceNote ? (
							<p className="mt-4 text-sm">
								<Link
									href={sourceNote.href}
									className="cursor-pointer text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
								>
									Read: {sourceNote.title}
								</Link>
							</p>
						) : null}

						<div className="mt-5">
							<Button
								size="lg"
								className="h-10 px-4"
								onClick={advance}
							>
								{index === items.length - 1 ? "See score" : "Next question"}
							</Button>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
