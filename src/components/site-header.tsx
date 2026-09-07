"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, RefreshCw } from "lucide-react";

import { topNav } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const focus = "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none";

/**
 * Four destinations, split by what you are doing. Hierarchy is the sidebar's job
 * (see library-sidebar), so nothing here needs to change as content grows.
 */
export function SiteHeader() {
	const pathname = usePathname();
	const [open, setOpen] = useState(false);

	const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
			<div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
				<Link
					href="/"
					className={cn(
						"flex shrink-0 items-center gap-2 rounded-md text-sm font-semibold tracking-tight",
						focus
					)}
				>
					<RefreshCw
						className="size-4 text-primary"
						aria-hidden="true"
					/>
					hardrefresh
				</Link>

				<nav
					aria-label="Main"
					className="hidden items-center gap-1 md:flex"
				>
					{topNav.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							aria-current={isActive(item.href) ? "page" : undefined}
							className={cn(
								"cursor-pointer rounded-md px-3 py-1.5 text-sm transition-colors",
								focus,
								isActive(item.href)
									? "bg-muted font-medium text-foreground"
									: "text-muted-foreground hover:text-foreground"
							)}
						>
							{item.label}
						</Link>
					))}
				</nav>

				<Sheet
					open={open}
					onOpenChange={setOpen}
				>
					<SheetTrigger
						render={
							<Button
								variant="ghost"
								size="icon"
								aria-label="Open menu"
								className="ml-auto md:hidden"
							/>
						}
					>
						<Menu aria-hidden="true" />
					</SheetTrigger>
					<SheetContent side="right">
						<SheetHeader>
							<SheetTitle>Menu</SheetTitle>
						</SheetHeader>
						<nav
							aria-label="Main"
							className="flex flex-col gap-1 px-4 pb-6"
						>
							{topNav.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setOpen(false)}
									aria-current={isActive(item.href) ? "page" : undefined}
									className={cn(
										"flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
										focus,
										isActive(item.href)
											? "bg-muted font-medium text-foreground"
											: "text-muted-foreground hover:bg-muted hover:text-foreground"
									)}
								>
									<item.icon
										className="size-4"
										aria-hidden="true"
									/>
									{item.label}
								</Link>
							))}
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
