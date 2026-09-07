import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { getChapters, getSubjects } from "@/lib/content";
import { topNav } from "@/lib/nav";
import { ProgressDashboard, type ChapterLink } from "@/components/progress-dashboard";

const nav = topNav.find((item) => item.href === "/progress")!;

export const metadata: Metadata = {
	title: "Progress",
	description: nav.blurb,
};

export default function ProgressPage() {
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
			<ProgressDashboard chapters={chapters} />
		</PageShell>
	);
}
