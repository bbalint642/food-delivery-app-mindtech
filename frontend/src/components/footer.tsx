"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-provider";

const subscribe = () => () => {};
const getYear = () => new Date().getFullYear();
const getServerYear = () => null;

/**
 * Rendered once in the root layout, so every page shows the same footer.
 * The year is read in the browser: it is time-dependent and must not be
 * frozen into the prerendered HTML.
 */
export function Footer() {
	const year = useSyncExternalStore(subscribe, getYear, getServerYear);
	const { status, logout } = useAuth();

	return (
		<footer className="mx-auto w-full max-w-6xl *:px-4 *:sm:px-6">
			<div className="flex flex-col gap-6 py-6">
				<div className="flex items-center justify-between">
					<Brand />
					<Button asChild size="icon" variant="ghost">
						<a
							aria-label="LinkedIn"
							href="https://www.linkedin.com/in/balint-balazs01/"
							rel="noreferrer"
							target="_blank"
						>
							<svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
								<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
							</svg>
						</a>
					</Button>
				</div>

				<nav>
					<ul className="flex flex-wrap gap-4 font-medium text-muted-foreground text-sm md:gap-6">
						<li>
							<Link className="hover:text-foreground" href="/restaurants">
								Éttermek
							</Link>
						</li>
						{status === "authenticated" && (
							<li>
								<button className="hover:text-foreground" onClick={logout} type="button">
									Kijelentkezés
								</button>
							</li>
						)}
						{status === "unauthenticated" && (
							<li>
								<Link className="hover:text-foreground" href="/login">
									Bejelentkezés
								</Link>
							</li>
						)}
					</ul>
				</nav>
			</div>

			<div className="flex items-center justify-between gap-4 border-t py-4 text-muted-foreground text-sm">
				<p>&copy; {year ?? ""} Mini Food</p>
				<p>Made by Bálint Balázs</p>
			</div>
		</footer>
	);
}
