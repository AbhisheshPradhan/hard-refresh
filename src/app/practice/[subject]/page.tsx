import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
	getChapters,
	getInterviewForChapter,
	getQuizForChapter,
	getSubject,
	getSubjects,
} from "@/lib/content";
import { PageShell } from "@/components/page-shell";
import { learnHref, practiceHref, practiceModes } from "@/lib/nav";

export function generateStaticParams() {
	return getSubjects().map((subject) => ({ subject: subject.slug }));
}

export async function generateMetadata({
	params,
}: PageProps<"/practice/[subject]">): Promise<Metadata> {
	const { subject: slug } = await params;
	const subject = getSubject(slug);

	return subject
		? { title: `Practise ${subject.title}`, description: `Quiz and interview questions.` }
		: {};
}

export default async function SubjectPracticePage({ params }: PageProps<"/practice/[subject]">) {
	const { subject: slug } = await params;
	const subject = getSubject(slug);

	if (!subject) {
		notFound();
	}

	const chapters = getChapters(slug);

	return (
		<PageShell
			title={`Practise ${subject.title}`}
			blurb="Pick a chapter, or read the notes first and answer each one as you finish it."
		>
			<nav
				aria-label="Breadcrumb"
				className="-mt-4 mb-8 text-sm text-muted-foreground"
			>
				<Link
					href="/practice"
					className="cursor-pointer rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
				>
					Practice
				</Link>
				<span aria-hidden="true"> / </span>
				<span className="text-foreground">{subject.title}</span>
			</nav>

			<ul className="space-y-3">
				{chapters.map((chapter) => {
					const counts = {
						quiz: getQuizForChapter(chapter.id).length,
						interview: getInterviewForChapter(chapter.id).length,
					};

					if (counts.quiz + counts.interview === 0) {
						return null;
					}

					return (
						<li
							key={chapter.id}
							className="rounded-xl border border-border bg-card p-5"
						>
							<div className="mb-4">
								<h2 className="text-sm font-medium text-foreground">
									<Link
										href={learnHref(slug, chapter.slug)}
										className="cursor-pointer rounded-sm hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
									>
										{chapter.title}
									</Link>
								</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									{chapter.summary}
								</p>
							</div>

							{/* Both formats offered side by side, and named for what they are. */}
							<div className="flex flex-wrap gap-2">
								{practiceModes.map((mode) => {
									const count = counts[mode.segment];

									if (count === 0) {
										return null;
									}

									return (
										<Link
											key={mode.segment}
											href={practiceHref(slug, mode.segment, chapter.slug)}
											className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
										>
											<mode.icon
												className="size-4"
												aria-hidden="true"
											/>
											{mode.label}
											<span className="font-mono text-xs opacity-70">
												{count}
											</span>
										</Link>
									);
								})}
							</div>
						</li>
					);
				})}
			</ul>
		</PageShell>
	);
}
