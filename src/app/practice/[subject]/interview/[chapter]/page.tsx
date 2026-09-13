import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
	getChapters,
	getSubject,
	getInterviewForChapter,
	getNotes,
	getSubjects,
} from "@/lib/content";
import { InterviewBrowser } from "@/components/interview-browser";

export function generateStaticParams() {
	return getSubjects().flatMap(({ slug }) =>
		getChapters(slug)
			.filter((chapter) => getInterviewForChapter(chapter.id).length > 0)
			.map((chapter) => ({ subject: slug, chapter: chapter.slug }))
	);
}

export async function generateMetadata({
	params,
}: PageProps<"/practice/[subject]/interview/[chapter]">): Promise<Metadata> {
	const { subject, chapter: slug } = await params;
	const chapter = getChapters(subject).find((c) => c.slug === slug);

	if (!chapter) {
		return {};
	}

	return {
		title: `${chapter.title} questions`,
		description: `Open-ended interview questions on ${chapter.title.toLowerCase()}.`,
	};
}

export default async function ChapterReviewPage({
	params,
}: PageProps<"/practice/[subject]/interview/[chapter]">) {
	const { subject, chapter: slug } = await params;
	const chapter = getChapters(subject).find((c) => c.slug === slug);
	const parentSubject = getSubject(subject);

	if (!chapter) {
		notFound();
	}

	const items = getInterviewForChapter(chapter.id);

	if (items.length === 0) {
		notFound();
	}

	const noteLinks = getNotes(subject).map((note) => ({
		id: note.id,
		title: note.title,
		href: `/learn/${note.subject}/${note.chapterSlug}/${note.slug}`,
	}));

	return (
		<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
			{/* Same container as every other page, so the left edge never moves.
			    The column inside is capped at a comfortable reading measure. */}
			<div className="max-w-3xl">
				<nav
					aria-label="Breadcrumb"
					className="mb-6 text-sm text-muted-foreground"
				>
					<Link
						href="/practice"
						className="cursor-pointer rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						Practice
					</Link>
					<span aria-hidden="true"> / </span>
					<Link
						href={`/practice/${subject}`}
						className="cursor-pointer rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						{parentSubject?.title ?? subject}
					</Link>
					<span aria-hidden="true"> / </span>
					{/* The chapter you are practising, not a link out to Learn — a crumb
				    should walk back up this section, not sideways into another. */}
					<span className="text-foreground">{chapter.title}</span>
				</nav>

				<h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
					{chapter.title}
				</h1>
				<p className="mt-2 mb-8 text-sm text-muted-foreground">
					{items.length} questions. Answer before you reveal, or it does not count.
				</p>

				<InterviewBrowser
					items={items}
					noteLinks={noteLinks}
				/>
			</div>
		</main>
	);
}
