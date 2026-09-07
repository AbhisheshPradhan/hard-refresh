import { notFound } from "next/navigation";

import { getChapters, getNotesByChapter, getSubject, getSubjects } from "@/lib/content";
import { LibrarySidebar } from "@/components/library-sidebar";

/**
 * Wraps every Learn route for a subject, so the content tree stays on screen
 * while reading. Data is read here rather than per page: the sidebar is
 * identical across the subject, chapter and note routes below it.
 */
export default async function LearnSubjectLayout({
	children,
	params,
}: LayoutProps<"/learn/[subject]">) {
	const { subject: slug } = await params;
	const subject = getSubject(slug);

	if (!subject) {
		notFound();
	}

	const chapters = getChapters(slug).map((chapter) => ({
		slug: chapter.slug,
		title: chapter.title,
		notes: getNotesByChapter(chapter.id).map((note) => ({
			slug: note.slug,
			title: note.title,
			order: note.order,
		})),
	}));

	const subjects = getSubjects().map(({ slug: s, title }) => ({ slug: s, title }));

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 gap-10 px-4">
			{/* Sticky under the 3.5rem header, with its own scroll. */}
			<aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 py-8 lg:block">
				<LibrarySidebar
					subject={{ slug: subject.slug, title: subject.title }}
					subjects={subjects}
					chapters={chapters}
				/>
			</aside>

			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}
