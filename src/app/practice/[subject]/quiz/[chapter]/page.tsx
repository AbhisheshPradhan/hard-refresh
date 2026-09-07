import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getChapters, getSubject, getNotes, getQuizForChapter, getSubjects } from "@/lib/content";
import { QuizRunner } from "@/components/quiz-runner";

export function generateStaticParams() {
	return getSubjects().flatMap(({ slug }) =>
		getChapters(slug)
			.filter((chapter) => getQuizForChapter(chapter.id).length > 0)
			.map((chapter) => ({ subject: slug, chapter: chapter.slug }))
	);
}

export async function generateMetadata({
	params,
}: PageProps<"/practice/[subject]/quiz/[chapter]">): Promise<Metadata> {
	const { subject, chapter: slug } = await params;
	const chapter = getChapters(subject).find((c) => c.slug === slug);

	if (!chapter) {
		return {};
	}

	return {
		title: `${chapter.title} quiz`,
		description: `Multiple-choice questions on ${chapter.title.toLowerCase()}.`,
	};
}

export default async function ChapterQuizPage({
	params,
}: PageProps<"/practice/[subject]/quiz/[chapter]">) {
	const { subject, chapter: slug } = await params;
	const chapter = getChapters(subject).find((c) => c.slug === slug);
	const parentSubject = getSubject(subject);

	if (!chapter) {
		notFound();
	}

	const items = getQuizForChapter(chapter.id);

	if (items.length === 0) {
		notFound();
	}

	// The runner is a client component, so it gets plain serialisable link data
	// rather than the full note records.
	const noteLinks = getNotes(subject).map((note) => ({
		id: note.id,
		title: note.title,
		href: `/learn/${note.subject}/${note.chapterSlug}/${note.slug}`,
	}));

	return (
		<main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
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
				<Link
					href={`/learn/${subject}/${slug}`}
					className="cursor-pointer rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					{chapter.title}
				</Link>
			</nav>

			<h1 className="font-heading mb-8 text-2xl font-semibold tracking-tight text-foreground">
				{chapter.title}
			</h1>

			<QuizRunner
				items={items}
				noteLinks={noteLinks}
			/>
		</main>
	);
}
