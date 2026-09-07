import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { cache } from "react";
import matter from "gray-matter";

import type {
	Chapter,
	InterviewItem,
	NoteId,
	NoteMeta,
	QuizItem,
	Subject,
} from "@/lib/content-types";
import { subjectGroups } from "@/lib/content-types";

/**
 * Everything here is server-only and runs at build time. Notes are read from disk
 * for their frontmatter; the MDX bodies are compiled by @next/mdx and imported
 * separately (see load-note.ts).
 *
 * Layout:
 *   content/<subject>/_subject.json
 *   content/<subject>/quiz.json
 *   content/<subject>/interview.json
 *   content/<subject>/<chapter>/_chapter.json
 *   content/<subject>/<chapter>/<note>.mdx
 */

const CONTENT_DIR = join(process.cwd(), "content");

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, "utf8")) as T;
}

function listDirs(path: string) {
	if (!existsSync(path)) {
		return [];
	}

	return readdirSync(path, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => entry.name);
}

function titleCase(slug: string) {
	return slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function groupRank(group: string) {
	const i = (subjectGroups as readonly string[]).indexOf(group);
	// Unknown groups sort after the known ones rather than being dropped.
	return i === -1 ? subjectGroups.length : i;
}

export const getSubjects = cache((): Subject[] => {
	const subjects = listDirs(CONTENT_DIR).map((slug) => {
		const metaPath = join(CONTENT_DIR, slug, "_subject.json");

		// A subject dropped in without metadata still renders, so new content can
		// be inspected before its _subject.json is written. The validation script
		// is what flags it as incomplete.
		const meta = existsSync(metaPath)
			? readJson<Partial<Subject>>(metaPath)
			: ({} as Partial<Subject>);

		const chapters = listDirs(join(CONTENT_DIR, slug));
		const noteCount = chapters.reduce((total, chapter) => {
			return (
				total +
				readdirSync(join(CONTENT_DIR, slug, chapter)).filter((f) => f.endsWith(".mdx"))
					.length
			);
		}, 0);

		return {
			slug,
			title: meta.title ?? titleCase(slug),
			summary: meta.summary ?? "",
			group: meta.group ?? "Other",
			order: meta.order ?? 99,
			chapterCount: chapters.length,
			noteCount,
		} satisfies Subject;
	});

	return subjects.sort((a, b) => {
		const byGroup = groupRank(a.group) - groupRank(b.group);
		if (byGroup !== 0) {
			return byGroup;
		}
		const byOrder = a.order - b.order;
		return byOrder !== 0 ? byOrder : a.title.localeCompare(b.title);
	});
});

export const getSubject = cache((slug: string): Subject | undefined => {
	return getSubjects().find((subject) => subject.slug === slug);
});

/** Subjects bucketed by group, in group order, for the library index. */
export const getSubjectsByGroup = cache((): Array<{ group: string; subjects: Subject[] }> => {
	const buckets = new Map<string, Subject[]>();

	for (const subject of getSubjects()) {
		const list = buckets.get(subject.group) ?? [];
		list.push(subject);
		buckets.set(subject.group, list);
	}

	return [...buckets.entries()].map(([group, subjects]) => ({ group, subjects }));
});

export const getChapters = cache((subject: string): Chapter[] => {
	const subjectDir = join(CONTENT_DIR, subject);

	return listDirs(subjectDir)
		.filter((slug) => existsSync(join(subjectDir, slug, "_chapter.json")))
		.map((slug) => {
			const meta = readJson<{ title: string; summary: string; order: number }>(
				join(subjectDir, slug, "_chapter.json")
			);

			return {
				id: `${subject}/${slug}`,
				subject,
				slug,
				title: meta.title,
				summary: meta.summary,
				order: meta.order,
			};
		})
		.sort((a, b) => a.order - b.order);
});

export const getNotes = cache((subject: string): NoteMeta[] => {
	const subjectDir = join(CONTENT_DIR, subject);

	const notes = listDirs(subjectDir).flatMap((chapterSlug) => {
		const chapterDir = join(subjectDir, chapterSlug);

		return (
			readdirSync(chapterDir)
				// `_`-prefixed files are fragments (see _part.mdx), not notes.
				.filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
				.map((file) => {
					const slug = file.replace(/\.mdx$/, "");
					const raw = readFileSync(join(chapterDir, file), "utf8");
					const { data, content } = matter(raw);
					const wordCount = content.split(/\s+/).filter(Boolean).length;

					return {
						id: `${subject}/${chapterSlug}/${slug}`,
						subject,
						chapterId: `${subject}/${chapterSlug}`,
						chapterSlug,
						slug,
						title: String(data.title ?? slug),
						summary: String(data.summary ?? ""),
						order: Number(data.order ?? 0),
						prerequisites: (data.prerequisites ?? []) as NoteId[],
						tags: (data.tags ?? []) as string[],
						updated: String(data.updated ?? ""),
						wordCount,
						readingMinutes: Math.max(1, Math.round(wordCount / 240)),
					} satisfies NoteMeta;
				})
		);
	});

	return notes.sort((a, b) => a.order - b.order);
});

/** Every note across every subject. Used for cross-subject id resolution. */
export const getAllNotes = cache((): NoteMeta[] => {
	return getSubjects().flatMap((subject) => getNotes(subject.slug));
});

export const getNote = cache((id: NoteId): NoteMeta | undefined => {
	const subject = id.split("/")[0];
	return getNotes(subject).find((note) => note.id === id);
});

export const getNotesByChapter = cache((chapterId: string): NoteMeta[] => {
	const subject = chapterId.split("/")[0];
	return getNotes(subject).filter((note) => note.chapterId === chapterId);
});

function readItems<T>(subject: string, file: string): T[] {
	const path = join(CONTENT_DIR, subject, file);
	// A subject can have notes before it has practice items.
	return existsSync(path) ? readJson<T[]>(path) : [];
}

export const getQuizItems = cache((subject?: string): QuizItem[] => {
	if (subject) {
		return readItems<QuizItem>(subject, "quiz.json");
	}

	return getSubjects().flatMap((s) => readItems<QuizItem>(s.slug, "quiz.json"));
});

export const getInterviewItems = cache((subject?: string): InterviewItem[] => {
	if (subject) {
		return readItems<InterviewItem>(subject, "interview.json");
	}

	return getSubjects().flatMap((s) => readItems<InterviewItem>(s.slug, "interview.json"));
});

export const getQuizForNote = cache((noteId: NoteId): QuizItem[] => {
	return getQuizItems(noteId.split("/")[0]).filter((item) => item.noteId === noteId);
});

export const getInterviewForNote = cache((noteId: NoteId): InterviewItem[] => {
	return getInterviewItems(noteId.split("/")[0]).filter((item) => item.noteId === noteId);
});

export const getQuizForChapter = cache((chapterId: string): QuizItem[] => {
	return getQuizItems(chapterId.split("/")[0]).filter((item) => item.chapterId === chapterId);
});

export const getInterviewForChapter = cache((chapterId: string): InterviewItem[] => {
	return getInterviewItems(chapterId.split("/")[0]).filter(
		(item) => item.chapterId === chapterId
	);
});

/**
 * Notes that reference this one, derived by inverting `related`. Adjacency (an
 * item's own note) is excluded so a note does not list itself. Scans every
 * subject, so a JavaScript note can surface the React notes that depend on it.
 */
export const getBacklinks = cache((noteId: NoteId): NoteMeta[] => {
	const ids = new Set<NoteId>();

	for (const item of [...getQuizItems(), ...getInterviewItems()]) {
		if (item.noteId === noteId) {
			continue;
		}

		if (item.related.includes(noteId)) {
			ids.add(item.noteId);
		}
	}

	const byId = new Map(getAllNotes().map((note) => [note.id, note]));

	return [...ids]
		.map((id) => byId.get(id))
		.filter((note): note is NoteMeta => Boolean(note))
		.sort((a, b) => a.order - b.order);
});
