"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import type { InterviewItem, InterviewKind } from "@/lib/content-types";
import { interviewKindLabels } from "@/lib/content-types";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/markdown";

type NoteLink = { id: string; title: string; href: string };

const kindHints: Record<InterviewKind, string> = {
	diagnose: "Read the code, then say what is wrong and how you would fix it.",
	explain: "Answer in prose, as you would to a colleague.",
	rapid: "Under a minute. Say it out loud rather than writing it.",
};

function InterviewCard({ item, note }: { item: InterviewItem; note?: NoteLink }) {
	const [open, setOpen] = useState(false);
	const panelId = `answer-${item.id.replace(".", "-")}`;

	return (
		<li className="rounded-xl border border-border bg-card p-5">
			<div className="mb-3 flex flex-wrap items-center gap-2">
				<span className="rounded-full border border-primary/50 bg-primary/10 px-2.5 py-0.5 font-mono text-[0.6875rem] tracking-wide text-primary uppercase">
					{interviewKindLabels[item.kind]}
				</span>
				<span className="font-mono text-xs text-muted-foreground">{item.id}</span>
			</div>

			<p className="text-sm font-medium text-foreground">{item.question}</p>
			<p className="mt-1.5 text-xs text-muted-foreground">{kindHints[item.kind]}</p>

			{item.codeContext ? (
				<pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-[0.8125rem] leading-6">
					<code>{item.codeContext}</code>
				</pre>
			) : null}

			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				aria-controls={panelId}
				className="mt-4 flex cursor-pointer items-center gap-1.5 rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
			>
				<ChevronDown
					className={cn("size-4 transition-transform", open && "rotate-180")}
					aria-hidden="true"
				/>
				{open ? "Hide answer" : "Show answer"}
			</button>

			<div
				id={panelId}
				hidden={!open}
				className="mt-4 border-t border-border pt-4"
			>
				<Markdown>{item.modelAnswer}</Markdown>

				{note ? (
					<p className="mt-4 text-sm">
						<Link
							href={note.href}
							className="cursor-pointer text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
						>
							Read: {note.title}
						</Link>
					</p>
				) : null}
			</div>
		</li>
	);
}

export function InterviewBrowser({
	items,
	noteLinks,
	showFilters = true,
}: {
	items: InterviewItem[];
	noteLinks: NoteLink[];
	/** Off for a single note's handful of questions, where filters are noise. */
	showFilters?: boolean;
}) {
	const [kind, setKind] = useState<InterviewKind | "all">("all");

	const noteById = useMemo(() => {
		return new Map(noteLinks.map((note) => [note.id, note]));
	}, [noteLinks]);

	const counts = useMemo(() => {
		return items.reduce<Record<string, number>>((acc, item) => {
			acc[item.kind] = (acc[item.kind] ?? 0) + 1;
			return acc;
		}, {});
	}, [items]);

	const visible = kind === "all" ? items : items.filter((item) => item.kind === kind);

	const filters: Array<{ value: InterviewKind | "all"; label: string; count: number }> = [
		{ value: "all", label: "All", count: items.length },
		...(Object.keys(interviewKindLabels) as InterviewKind[])
			.filter((k) => (counts[k] ?? 0) > 0)
			.map((k) => ({
				value: k,
				label: interviewKindLabels[k],
				count: counts[k] ?? 0,
			})),
	];

	return (
		<div>
			<div
				role="group"
				aria-label="Filter by question type"
				hidden={!showFilters}
				className="mb-6 flex flex-wrap gap-2"
			>
				{filters.map((filter) => {
					const active = kind === filter.value;

					return (
						<button
							key={filter.value}
							type="button"
							onClick={() => setKind(filter.value)}
							aria-pressed={active}
							className={cn(
								"flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
								active
									? "border-primary/50 bg-primary/10 text-primary"
									: "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
							)}
						>
							{filter.label}
							<span className="font-mono text-xs opacity-70">{filter.count}</span>
						</button>
					);
				})}
			</div>

			<ul className="space-y-4">
				{visible.map((item) => (
					<InterviewCard
						key={item.id}
						item={item}
						note={noteById.get(item.noteId)}
					/>
				))}
			</ul>
		</div>
	);
}
