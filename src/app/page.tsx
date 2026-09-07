import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getSubjectsByGroup } from "@/lib/content";
import { learnHref } from "@/lib/nav";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	const groups = getSubjectsByGroup();
	const first = groups[0]?.subjects[0];

	return (
		<main className="mx-auto w-full max-w-5xl flex-1 px-4">
			<section className="py-20 sm:py-28">
				<p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
					Ctrl + Shift + R, for the things you read once
				</p>
				<h1 className="font-heading max-w-2xl text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
					You read it. You understood it. Two weeks later it was gone.
				</h1>
				<p className="mt-5 max-w-xl text-base text-muted-foreground">
					hardrefresh is where you dump what you are learning, turn it into questions, and
					find out later whether any of it actually stuck. No feed, no streaks, no one
					else to perform for.
				</p>
				<div className="mt-8 flex flex-wrap items-center gap-3">
					<Button
						size="lg"
						className="h-10 px-4"
						render={<Link href={first ? learnHref(first.slug) : "/learn"} />}
					>
						{first ? `Start ${first.title}` : "Open the library"}
						<ArrowRight aria-hidden="true" />
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="h-10 px-4"
						render={<Link href="/review" />}
					>
						What is due
					</Button>
				</div>
			</section>

			{groups.length > 0 ? (
				<section
					aria-labelledby="subjects-heading"
					className="border-t border-border py-14"
				>
					<h2
						id="subjects-heading"
						className="font-heading text-sm font-medium tracking-tight text-muted-foreground"
					>
						What is in here
					</h2>

					<div className="mt-6 space-y-8">
						{groups.map(({ group, subjects }) => (
							<div key={group}>
								<h3 className="mb-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
									{group}
								</h3>
								<ul className="grid gap-4 sm:grid-cols-2">
									{subjects.map((subject) => (
										<li key={subject.slug}>
											<Link
												href={`/learn/${subject.slug}`}
												className="group flex h-full cursor-pointer flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
											>
												<span className="text-sm font-medium text-foreground">
													{subject.title}
												</span>
												<span className="mt-2 text-sm text-muted-foreground">
													{subject.summary}
												</span>
												<span className="mt-3 font-mono text-xs text-muted-foreground">
													{subject.chapterCount} chapters ·{" "}
													{subject.noteCount} notes
												</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</section>
			) : null}
		</main>
	);
}
