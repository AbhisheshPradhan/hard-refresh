import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import {
	getChapters,
	getInterviewForChapter,
	getNotesByChapter,
	getQuizForChapter,
	getSubject,
	getSubjects,
} from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { loadPartIntro } from "@/lib/load-note";
import { SubjectCrumb } from "@/components/subject-crumb";
import { Button } from "@/components/ui/button";
import { learnHref, practiceHref, practiceModes } from "@/lib/nav";

export function generateStaticParams() {
	return getSubjects().flatMap(({ slug }) =>
		getChapters(slug).map((chapter) => ({ subject: slug, chapter: chapter.slug }))
	);
}

export async function generateMetadata({
	params,
}: PageProps<"/learn/[subject]/[chapter]">): Promise<Metadata> {
	const { subject, chapter: slug } = await params;
	const chapter = getChapters(subject).find((c) => c.slug === slug);

	return chapter ? { title: chapter.title, description: chapter.summary } : {};
}

export default async function ChapterPage({ params }: PageProps<"/learn/[subject]/[chapter]">) {
	const { subject, chapter: slug } = await params;
	const parentSubject = getSubject(subject);
	const chapter = getChapters(subject).find((c) => c.slug === slug);

	if (!chapter || !parentSubject) {
		notFound();
	}

	const notes = getNotesByChapter(chapter.id);
	const PartIntro = await loadPartIntro(subject, slug);
	const minutes = notes.reduce((total, note) => total + note.readingMinutes, 0);
	const counts = {
		quiz: getQuizForChapter(chapter.id).length,
		interview: getInterviewForChapter(chapter.id).length,
	};

	return (
		<PageShell
			title={chapter.title}
			blurb={chapter.summary}
			width="inset"
		>
			<SubjectCrumb
				subject={parentSubject}
				current={chapter.title}
			/>

			<p className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
				<span>{notes.length} notes</span>
				<span>{minutes} min reading</span>
				{counts.quiz > 0 ? <span>{counts.quiz} quiz</span> : null}
				{counts.interview > 0 ? <span>{counts.interview} interview</span> : null}
			</p>

			{/* Reading is this page's purpose, so it gets the solid button. */}
			<div className="mb-10 flex flex-wrap gap-3">
				{notes[0] ? (
					<Button
						size="lg"
						className="h-10 px-4"
						render={<Link href={learnHref(subject, slug, notes[0].slug)} />}
					>
						Start this chapter
						<ArrowRight aria-hidden="true" />
					</Button>
				) : null}

				{practiceModes.map((mode) =>
					counts[mode.segment] > 0 ? (
						<Button
							key={mode.segment}
							size="lg"
							variant="outline"
							className="h-10 px-4"
							render={<Link href={practiceHref(subject, mode.segment, slug)} />}
						>
							<mode.icon aria-hidden="true" />
							{mode.label}
							<span className="font-mono text-xs opacity-70">
								{counts[mode.segment]}
							</span>
						</Button>
					) : null
				)}
			</div>

			{PartIntro ? (
				<div className="mb-12 border-b border-border pb-4">
					<PartIntro />
				</div>
			) : null}

			{/*
			 * Shown at every width. The sidebar is navigation — compact, title only,
			 * for jumping. This is orientation: what each note covers and how long
			 * it takes. Hiding it above lg left the page visibly empty.
			 */}
			<div>
				<h2 className="font-heading mb-4 text-sm font-medium tracking-tight text-muted-foreground">
					Notes in this chapter
				</h2>
				<ol className="space-y-2">
					{notes.map((note) => (
						<li key={note.id}>
							<Link
								href={learnHref(subject, slug, note.slug)}
								className="flex cursor-pointer items-baseline gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
							>
								<span className="font-mono text-xs text-muted-foreground">
									{String(note.order).padStart(2, "0")}
								</span>
								<span className="flex-1">
									<span className="block text-sm font-medium text-foreground">
										{note.title}
									</span>
									<span className="mt-1 block text-sm text-muted-foreground">
										{note.summary}
									</span>
								</span>
								<span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
									{note.readingMinutes} min
								</span>
							</Link>
						</li>
					))}
				</ol>
			</div>
		</PageShell>
	);
}
