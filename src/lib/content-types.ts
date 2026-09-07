export type NoteId = string;

export type ChapterId = string;

/**
 * Display order for subject groups. Groups are free strings in `_subject.json`;
 * this array decides how they are ordered and which ones are known. Anything not
 * listed sorts last under its own heading.
 */
export const subjectGroups = ["Languages", "Frameworks", "Computer science"] as const;

export type SubjectGroup = (typeof subjectGroups)[number] | string;

export interface Subject {
	slug: string;
	title: string;
	summary: string;
	group: SubjectGroup;
	/** Order within the group. */
	order: number;
	noteCount: number;
	chapterCount: number;
}

export interface Chapter {
	id: ChapterId;
	subject: string;
	slug: string;
	title: string;
	summary: string;
	order: number;
}

export interface NoteMeta {
	id: NoteId;
	subject: string;
	chapterId: ChapterId;
	chapterSlug: string;
	slug: string;
	title: string;
	summary: string;
	/** Global 1..28, not per chapter. Monotonic, so it sorts correctly either way. */
	order: number;
	prerequisites: NoteId[];
	tags: string[];
	updated: string;
	/** Rough reading time in minutes, derived from the body at load time. */
	readingMinutes: number;
	wordCount: number;
}

export interface QuizItem {
	id: string;
	chapterId: ChapterId;
	noteId: NoteId;
	question: string;
	options: string[];
	correctIndex: number;
	/** MDX-ish; may contain fenced code. */
	explanation: string;
	related: NoteId[];
}

export type InterviewKind = "diagnose" | "explain" | "rapid";

export interface InterviewItem {
	id: string;
	chapterId: ChapterId;
	noteId: NoteId;
	kind: InterviewKind;
	question: string;
	codeContext: string | null;
	modelAnswer: string;
	related: NoteId[];
}

export const interviewKindLabels: Record<InterviewKind, string> = {
	diagnose: "Diagnose",
	explain: "Explain",
	rapid: "Rapid",
};
