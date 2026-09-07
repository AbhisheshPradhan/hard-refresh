"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { learnHref, practiceHref } from "@/lib/nav";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const focus = "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

export type SidebarNote = { slug: string; title: string; order: number };
export type SidebarChapter = { slug: string; title: string; notes: SidebarNote[] };
export type SidebarSubject = { slug: string; title: string };

/**
 * The content tree, always visible while reading.
 *
 * This is what a horizontal bar could never do: from any note you can see the
 * chapter you are in, its siblings, and every other chapter — so moving around
 * never costs you your place.
 */
export function LibrarySidebar({
	subject,
	subjects,
	chapters,
}: {
	subject: SidebarSubject;
	subjects: SidebarSubject[];
	chapters: SidebarChapter[];
}) {
	const pathname = usePathname();

	return (
		<div className="flex h-full flex-col gap-6">
			{subjects.length > 1 ? (
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button
								variant="outline"
								size="sm"
								aria-label={`Subject: ${subject.title}. Change subject`}
								className="w-full justify-between"
							/>
						}
					>
						{subject.title}
						<ChevronDown aria-hidden="true" />
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						{subjects.map((s) => (
							<DropdownMenuItem
								key={s.slug}
								render={<Link href={learnHref(s.slug)} />}
							>
								{s.title}
							</DropdownMenuItem>
						))}
						<DropdownMenuItem render={<Link href="/learn" />}>
							All subjects
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<Link
					href={learnHref(subject.slug)}
					className={cn(
						"rounded-md text-sm font-semibold tracking-tight text-foreground",
						focus
					)}
				>
					{subject.title}
				</Link>
			)}

			<nav
				aria-label={`${subject.title} contents`}
				className="min-h-0 flex-1 overflow-y-auto pb-8"
			>
				<ul className="space-y-6">
					{chapters.map((chapter) => (
						<li key={chapter.slug}>
							<Link
								href={learnHref(subject.slug, chapter.slug)}
								className={cn(
									"mb-2 block rounded-sm text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground",
									focus
								)}
							>
								{chapter.title}
							</Link>

							<ul className="space-y-px border-l border-border">
								{chapter.notes.map((note) => {
									const href = learnHref(subject.slug, chapter.slug, note.slug);
									const active = pathname === href;

									return (
										<li key={note.slug}>
											<Link
												href={href}
												aria-current={active ? "page" : undefined}
												className={cn(
													"-ml-px flex cursor-pointer items-baseline gap-2 border-l py-1 pl-3 text-sm transition-colors",
													focus,
													active
														? "border-primary font-medium text-foreground"
														: "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
												)}
											>
												<span className="font-mono text-[0.6875rem] opacity-60">
													{String(note.order).padStart(2, "0")}
												</span>
												<span>{note.title}</span>
											</Link>
										</li>
									);
								})}
							</ul>
						</li>
					))}
				</ul>

				<Link
					href={practiceHref(subject.slug)}
					className={cn(
						"mt-8 flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
						focus
					)}
				>
					Practise {subject.title}
					<ArrowRight
						className="size-3.5"
						aria-hidden="true"
					/>
				</Link>
			</nav>
		</div>
	);
}
