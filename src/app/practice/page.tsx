import type { Metadata } from "next";
import Link from "next/link";
import { ListChecks } from "lucide-react";

import { EmptyState, PageShell } from "@/components/page-shell";
import { getInterviewItems, getQuizItems, getSubjectsByGroup } from "@/lib/content";
import { practiceHref, topNav } from "@/lib/nav";

const nav = topNav.find((item) => item.href === "/practice")!;

export const metadata: Metadata = {
	title: "Practice",
	description: nav.blurb,
};

export default function PracticePage() {
	const groups = getSubjectsByGroup()
		.map(({ group, subjects }) => ({
			group,
			subjects: subjects.filter(
				(s) => getQuizItems(s.slug).length + getInterviewItems(s.slug).length > 0
			),
		}))
		.filter(({ subjects }) => subjects.length > 0);

	if (groups.length === 0) {
		return (
			<PageShell
				title={nav.label}
				blurb={nav.blurb}
			>
				<EmptyState
					icon={ListChecks}
					title="Nothing to practise yet"
					description="Questions are attached to notes, so this fills up once there is content in the library."
				/>
			</PageShell>
		);
	}

	return (
		<PageShell
			title={nav.label}
			blurb={nav.blurb}
		>
			{/*
			 * Curated cross-subject tracks (intern, junior, mid, senior) will sit
			 * above this, once questions carry a level tag. They belong here rather
			 * than under a subject because they deliberately span several.
			 */}
			<div className="space-y-10">
				{groups.map(({ group, subjects }) => (
					<section
						key={group}
						aria-labelledby={`practice-${group.replace(/\s+/g, "-")}`}
					>
						<h2
							id={`practice-${group.replace(/\s+/g, "-")}`}
							className="mb-4 font-mono text-xs tracking-wide text-muted-foreground uppercase"
						>
							{group}
						</h2>

						<ul className="grid gap-3 sm:grid-cols-2">
							{subjects.map((subject) => (
								<li key={subject.slug}>
									<Link
										href={practiceHref(subject.slug)}
										className="flex h-full cursor-pointer flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
									>
										<span className="text-sm font-medium text-foreground">
											{subject.title}
										</span>
										<span className="mt-1.5 text-sm text-muted-foreground">
											{subject.summary}
										</span>
										<span className="mt-3 font-mono text-xs text-muted-foreground">
											{getQuizItems(subject.slug).length} quiz ·{" "}
											{getInterviewItems(subject.slug).length} interview
										</span>
									</Link>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</PageShell>
	);
}
