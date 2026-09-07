import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

import {
	getAllNotes,
	getBacklinks,
	getChapters,
	getInterviewForNote,
	getNote,
	getNotes,
	getQuizForNote,
	getSubject,
} from "@/lib/content";
import { loadNoteBody } from "@/lib/load-note";
import { QuizRunner } from "@/components/quiz-runner";
import { InterviewBrowser } from "@/components/interview-browser";

export function generateStaticParams() {
	return getAllNotes().map((note) => ({
		subject: note.subject,
		chapter: note.chapterSlug,
		note: note.slug,
	}));
}

export async function generateMetadata({
	params,
}: PageProps<"/learn/[subject]/[chapter]/[note]">): Promise<Metadata> {
	const { subject, chapter, note: slug } = await params;
	const note = getNote(`${subject}/${chapter}/${slug}`);

	if (!note) {
		return {};
	}

	return {
		title: note.title,
		description: note.summary,
	};
}

export default async function NotePage({ params }: PageProps<"/learn/[subject]/[chapter]/[note]">) {
	const { subject, chapter, note: slug } = await params;
	const id = `${subject}/${chapter}/${slug}`;
	const note = getNote(id);

	if (!note) {
		notFound();
	}

	const Body = await loadNoteBody(subject, chapter, slug);

	if (!Body) {
		notFound();
	}

	const parentSubject = getSubject(subject);
	const parentChapter = getChapters(subject).find((c) => c.id === note.chapterId);
	const ordered = getNotes(subject);
	const index = ordered.findIndex((n) => n.id === id);
	const previous = index > 0 ? ordered[index - 1] : undefined;
	const next = index < ordered.length - 1 ? ordered[index + 1] : undefined;

	const quiz = getQuizForNote(id);
	const interview = getInterviewForNote(id);
	const backlinks = getBacklinks(id);
	const prerequisites = note.prerequisites
		.map((prereqId) => getNote(prereqId))
		.filter((prereq) => Boolean(prereq));

	return (
		<main className="w-full max-w-3xl flex-1 py-10">
			<nav
				aria-label="Breadcrumb"
				className="mb-6 text-sm text-muted-foreground"
			>
				<Link
					href="/learn"
					className="cursor-pointer rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					Learn
				</Link>
				<span aria-hidden="true"> / </span>
				<Link
					href={`/learn/${subject}`}
					className="cursor-pointer rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					{parentSubject?.title ?? subject}
				</Link>
				<span aria-hidden="true"> / </span>
				<Link
					href={`/learn/${subject}/${chapter}`}
					className="cursor-pointer rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					{parentChapter?.title ?? chapter}
				</Link>
			</nav>

			<header className="mb-8 border-b border-border pb-8">
				<h1 className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground">
					{note.title}
				</h1>
				<p className="mt-3 text-base text-muted-foreground">{note.summary}</p>
				<p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground">
					<span className="inline-flex items-center gap-1.5">
						<Clock
							className="size-3.5"
							aria-hidden="true"
						/>
						{note.readingMinutes} min read
					</span>
					<span>{note.wordCount.toLocaleString()} words</span>
					{quiz.length + interview.length > 0 ? (
						<a
							href="#practice"
							className="cursor-pointer underline decoration-dotted underline-offset-4 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
						>
							{quiz.length} quiz · {interview.length} questions
						</a>
					) : null}
				</p>

				{prerequisites.length > 0 ? (
					<div className="mt-5 rounded-xl border border-border bg-muted/50 p-4">
						<p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
							Read first
						</p>
						<ul className="space-y-1 text-sm">
							{prerequisites.map((prereq) => (
								<li key={prereq!.id}>
									<Link
										href={`/learn/${prereq!.subject}/${prereq!.chapterSlug}/${prereq!.slug}`}
										className="cursor-pointer text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
									>
										{prereq!.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</header>

			<article>
				<Body />
			</article>

			{quiz.length > 0 || interview.length > 0 ? (
				<section
					id="practice"
					aria-labelledby="practice-heading"
					className="mt-14 scroll-mt-20 border-t border-border pt-8"
				>
					<h2
						id="practice-heading"
						className="font-heading text-xl font-semibold tracking-tight text-foreground"
					>
						Now test it
					</h2>
					<p className="mt-2 mb-6 text-sm text-muted-foreground">
						Questions from this note only. Answer before you move on, while it is still
						fresh.
					</p>

					{quiz.length > 0 ? (
						// noteLinks is empty on purpose: every question here comes from the
						// note you are already reading, so a "Read: …" link would point at
						// this page.
						<QuizRunner
							items={quiz}
							noteLinks={[]}
						/>
					) : null}

					{interview.length > 0 ? (
						<div className="mt-12">
							<h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
								Talk it through
							</h3>
							<p className="mt-1 mb-5 text-sm text-muted-foreground">
								{interview.length} open questions. Answer out loud before you
								reveal.
							</p>
							<InterviewBrowser
								items={interview}
								noteLinks={[]}
								showFilters={false}
							/>
						</div>
					) : null}

					<p className="mt-10 text-sm text-muted-foreground">
						Want wider practice?{" "}
						<Link
							href={`/practice/${subject}/quiz/${chapter}`}
							className="cursor-pointer text-primary underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
						>
							Take the whole {parentChapter?.title ?? "chapter"} quiz
						</Link>
						.
					</p>
				</section>
			) : null}

			{backlinks.length > 0 ? (
				<section
					aria-labelledby="referenced-heading"
					className="mt-10"
				>
					<h2
						id="referenced-heading"
						className="font-heading mb-3 text-sm font-medium tracking-tight text-muted-foreground"
					>
						Referenced by
					</h2>
					<ul className="grid gap-2 sm:grid-cols-2">
						{backlinks.map((link) => (
							<li key={link.id}>
								<Link
									href={`/learn/${link.subject}/${link.chapterSlug}/${link.slug}`}
									className="flex cursor-pointer flex-col rounded-lg border border-border p-3 transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
								>
									<span className="text-sm font-medium text-foreground">
										{link.title}
									</span>
									<span className="mt-0.5 text-xs text-muted-foreground">
										{link.summary}
									</span>
								</Link>
							</li>
						))}
					</ul>
				</section>
			) : null}

			<nav
				aria-label="Note navigation"
				className="mt-12 grid grid-cols-2 gap-3 border-t border-border pt-6"
			>
				{previous ? (
					<Link
						href={`/learn/${previous.subject}/${previous.chapterSlug}/${previous.slug}`}
						className="flex h-full cursor-pointer flex-col justify-center rounded-xl border border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<ArrowLeft
								className="size-3.5"
								aria-hidden="true"
							/>
							Previous
						</span>
						<span className="mt-1 text-sm font-medium text-foreground">
							{previous.title}
						</span>
					</Link>
				) : (
					<span aria-hidden="true" />
				)}
				{next ? (
					<Link
						href={`/learn/${next.subject}/${next.chapterSlug}/${next.slug}`}
						className="col-start-2 flex h-full cursor-pointer flex-col items-end justify-center rounded-xl border border-border p-4 text-right transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						<span className="flex items-center gap-1.5 text-xs text-muted-foreground">
							Next
							<ArrowRight
								className="size-3.5"
								aria-hidden="true"
							/>
						</span>
						<span className="mt-1 text-sm font-medium text-foreground">
							{next.title}
						</span>
					</Link>
				) : (
					<span aria-hidden="true" />
				)}
			</nav>
		</main>
	);
}
