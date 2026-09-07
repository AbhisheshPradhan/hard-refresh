import Link from "next/link";

import type { Subject } from "@/lib/content-types";
import { learnHref } from "@/lib/nav";

const crumbLink =
	"cursor-pointer rounded-sm hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/**
 * Learn / Subject / … — the trail above a subject-scoped page. On desktop the
 * sidebar already says where you are, so this mainly earns its place below the
 * lg breakpoint, where the sidebar is hidden.
 */
export function SubjectCrumb({
	subject,
	current,
	chapter,
}: {
	subject: Pick<Subject, "slug" | "title">;
	/** Label for the page you are on. Omitted on the subject root. */
	current?: string;
	/** An intermediate chapter link, for pages nested under one. */
	chapter?: { title: string; href: string };
}) {
	return (
		<nav
			aria-label="Breadcrumb"
			className="-mt-4 mb-6 text-sm text-muted-foreground"
		>
			<Link
				href="/learn"
				className={crumbLink}
			>
				Learn
			</Link>

			<span aria-hidden="true"> / </span>
			<Link
				href={learnHref(subject.slug)}
				className={crumbLink}
			>
				{subject.title}
			</Link>

			{chapter ? (
				<>
					<span aria-hidden="true"> / </span>
					<Link
						href={chapter.href}
						className={crumbLink}
					>
						{chapter.title}
					</Link>
				</>
			) : null}

			{current ? (
				<>
					<span aria-hidden="true"> / </span>
					<span className="text-foreground">{current}</span>
				</>
			) : null}
		</nav>
	);
}
