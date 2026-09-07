import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { EmptyState, PageShell } from "@/components/page-shell";
import { getSubjectsByGroup } from "@/lib/content";
import { topNav } from "@/lib/nav";

const nav = topNav.find((item) => item.href === "/learn")!;

export const metadata: Metadata = {
	title: "Learn",
	description: nav.blurb,
};

export default function LearnPage() {
	const groups = getSubjectsByGroup();

	if (groups.length === 0) {
		return (
			<PageShell
				title={nav.label}
				blurb={nav.blurb}
			>
				<EmptyState
					icon={BookOpen}
					title="No content yet"
					description="Hand over your notes and they will show up here, split into topics you can open and read."
				/>
			</PageShell>
		);
	}

	return (
		<PageShell
			title={nav.label}
			blurb={nav.blurb}
		>
			<div className="space-y-12">
				{groups.map(({ group, subjects }) => (
					<section
						key={group}
						aria-labelledby={`group-${group.replace(/\s+/g, "-")}`}
					>
						<h2
							id={`group-${group.replace(/\s+/g, "-")}`}
							className="mb-4 font-mono text-xs tracking-wide text-muted-foreground uppercase"
						>
							{group}
						</h2>

						<ul className="grid gap-3 sm:grid-cols-2">
							{subjects.map((subject) => (
								<li key={subject.slug}>
									<Link
										href={`/learn/${subject.slug}`}
										className="flex h-full cursor-pointer flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
									>
										<span className="text-sm font-medium text-foreground">
											{subject.title}
										</span>
										{subject.summary ? (
											<span className="mt-1.5 text-sm text-muted-foreground">
												{subject.summary}
											</span>
										) : null}
										<span className="mt-3 font-mono text-xs text-muted-foreground">
											{subject.chapterCount} chapters · {subject.noteCount}{" "}
											notes
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
