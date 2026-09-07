import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
	getChapters,
	getInterviewItems,
	getNotesByChapter,
	getQuizItems,
	getSubject,
	getSubjects,
} from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { learnHref, practiceHref } from "@/lib/nav";

export function generateStaticParams() {
	return getSubjects().map((subject) => ({ subject: subject.slug }));
}

export async function generateMetadata({
	params,
}: PageProps<"/learn/[subject]">): Promise<Metadata> {
	const { subject: slug } = await params;
	const subject = getSubject(slug);

	return subject ? { title: subject.title, description: subject.summary } : {};
}

export default async function SubjectPage({ params }: PageProps<"/learn/[subject]">) {
	const { subject: slug } = await params;
	const subject = getSubject(slug);

	if (!subject) {
		notFound();
	}

	/*
	 * Chapters only. The sidebar already lists every note, and each chapter page
	 * lists its own — repeating them here made the same 28 cards appear in three
	 * places. This page answers "what is this, how long is it, where do I start".
	 */
	const chapters = getChapters(slug).map((chapter) => {
		const notes = getNotesByChapter(chapter.id);

		return {
			...chapter,
			noteCount: notes.length,
			minutes: notes.reduce((total, note) => total + note.readingMinutes, 0),
			firstNote: notes[0],
		};
	});

	const firstNote = chapters.find((chapter) => chapter.firstNote)?.firstNote;
	const totalMinutes = chapters.reduce((total, chapter) => total + chapter.minutes, 0);
	const quizCount = getQuizItems(slug).length;
	const interviewCount = getInterviewItems(slug).length;

	return (
		<PageShell
			title={subject.title}
			blurb={subject.summary}
			width="inset"
		>
			<nav
				aria-label="Breadcrumb"
				className="-mt-4 mb-6"
			>
				<Link
					href="/learn"
					className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-sm text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					<ArrowLeft
						className="size-3.5"
						aria-hidden="true"
					/>
					All subjects
				</Link>
			</nav>

			<p className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
				<span>{chapters.length} chapters</span>
				<span>{subject.noteCount} notes</span>
				<span>
					{Math.round(totalMinutes / 60)}h {totalMinutes % 60}m reading
				</span>
				<span>{quizCount} quiz</span>
				<span>{interviewCount} interview</span>
			</p>

			{/* Reading is the point of this page, so it gets the solid button. */}
			<div className="mb-12 flex flex-wrap gap-3">
				{firstNote ? (
					<Button
						size="lg"
						className="h-10 px-4"
						render={
							<Link href={learnHref(slug, firstNote.chapterSlug, firstNote.slug)} />
						}
					>
						Start reading
						<ArrowRight aria-hidden="true" />
					</Button>
				) : null}
				{quizCount + interviewCount > 0 ? (
					<Button
						size="lg"
						variant="outline"
						className="h-10 px-4"
						render={<Link href={practiceHref(slug)} />}
					>
						Practise instead
					</Button>
				) : null}
			</div>

			<h2 className="font-heading mb-4 text-sm font-medium tracking-tight text-muted-foreground">
				Chapters
			</h2>

			<ol className="space-y-2">
				{chapters.map((chapter) => (
					<li key={chapter.id}>
						<Link
							href={learnHref(slug, chapter.slug)}
							className="flex cursor-pointer items-baseline gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
						>
							<span className="font-mono text-xs text-muted-foreground">
								{String(chapter.order).padStart(2, "0")}
							</span>
							<span className="flex-1">
								<span className="block text-sm font-medium text-foreground">
									{chapter.title}
								</span>
								<span className="mt-1 block text-sm text-muted-foreground">
									{chapter.summary}
								</span>
							</span>
							<span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
								{chapter.noteCount} notes · {chapter.minutes} min
							</span>
						</Link>
					</li>
				))}
			</ol>
		</PageShell>
	);
}
