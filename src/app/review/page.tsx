import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { getChapters, getSubjects } from "@/lib/content";
import { topNav } from "@/lib/nav";
import { MissedQueue, type ChapterLink } from "@/components/missed-queue";

const nav = topNav.find((item) => item.href === "/review")!;

export const metadata: Metadata = {
	title: "Review",
	description: nav.blurb,
};

/**
 * Deliberately cross-subject. Spaced repetition does not respect subject
 * boundaries: if you missed five React questions and three CSS ones, the queue
 * is all eight. Per-subject practice lives at /practice/<subject> instead.
 */
export default function ReviewPage() {
	const chapters: ChapterLink[] = getSubjects().flatMap((subject) =>
		getChapters(subject.slug).map((chapter) => ({
			id: chapter.id,
			title: `${subject.title} · ${chapter.title}`,
			href: `/practice/${subject.slug}/quiz/${chapter.slug}`,
		}))
	);

	return (
		<PageShell
			title={nav.label}
			blurb={nav.blurb}
		>
			<MissedQueue chapters={chapters} />
		</PageShell>
	);
}
