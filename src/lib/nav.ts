import {
	BookOpen,
	History,
	ListChecks,
	MessagesSquare,
	TrendingUp,
	type LucideIcon,
} from "lucide-react";

export type NavItem = {
	href: string;
	label: string;
	icon: LucideIcon;
	blurb: string;
};

/**
 * Top level splits by intent, not by content type.
 *
 * The subject → chapter → note tree is a hierarchy, and a horizontal bar cannot
 * express one; the sidebar inside Learn does that instead. Splitting by intent
 * also gives curated cross-subject tracks somewhere to live (under Practice)
 * rather than forcing them beneath a single subject, which they span.
 */
export const topNav: NavItem[] = [
	{
		href: "/learn",
		label: "Learn",
		icon: BookOpen,
		blurb: "Everything you have dumped in here, sorted into subjects and chapters.",
	},
	{
		href: "/practice",
		label: "Practice",
		icon: ListChecks,
		blurb: "Test yourself: by subject now, by role once questions are tagged by level.",
	},
	{
		href: "/review",
		label: "Review",
		icon: History,
		blurb: "Everything you got wrong, across every subject, queued up again.",
	},
	{
		href: "/progress",
		label: "Progress",
		icon: TrendingUp,
		blurb: "Scores over time, weak topics, and how long since you last touched each one.",
	},
];

/**
 * The two practice formats. "Quiz" is scored multiple choice; "Interview" is
 * open-ended and self-assessed — which is what the content calls it. The old
 * Quizzes/Questions pair named the same thing twice and told you nothing.
 */
export type PracticeMode = {
	segment: "quiz" | "interview";
	label: string;
	icon: LucideIcon;
	blurb: string;
};

export const practiceModes: PracticeMode[] = [
	{
		segment: "quiz",
		label: "Quiz",
		icon: ListChecks,
		blurb: "Multiple choice, scored, one question at a time.",
	},
	{
		segment: "interview",
		label: "Interview",
		icon: MessagesSquare,
		blurb: "Open questions to answer out loud before you reveal.",
	},
];

export const learnHref = (subject?: string, chapter?: string, note?: string) =>
	["/learn", subject, chapter, note].filter(Boolean).join("/");

export const practiceHref = (subject?: string, mode?: PracticeMode["segment"], chapter?: string) =>
	["/practice", subject, mode, chapter].filter(Boolean).join("/");
