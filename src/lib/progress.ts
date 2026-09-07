"use client";

import { useSyncExternalStore } from "react";

/**
 * Attempt history lives in localStorage. There is no auth and no server-side
 * write path (Vercel's runtime filesystem is read-only), so this is per browser
 * and does not sync across devices. Every access is guarded: private windows and
 * blocked site data can make the accessor itself throw.
 *
 * Exposed as an external store rather than read in an effect, so components stay
 * correct through hydration without a setState-on-mount cascade.
 */

const KEY = "hardrefresh:attempts";
const EVENT = "hardrefresh:attempts-changed";
const LIMIT = 500;

export interface Attempt {
	/** Quiz item id, e.g. "9.4". */
	itemId: string;
	noteId: string;
	chapterId: string;
	subject: string;
	correct: boolean;
	/** ISO timestamp. */
	at: string;
}

const EMPTY: Attempt[] = [];

// getSnapshot must return a referentially stable value or useSyncExternalStore
// re-renders forever, so the parse is cached against the raw string.
let cachedRaw: string | null = null;
let cachedValue: Attempt[] = EMPTY;

function readRaw(): Attempt[] {
	try {
		const raw = localStorage.getItem(KEY);

		if (raw !== cachedRaw) {
			cachedRaw = raw;

			if (!raw) {
				cachedValue = EMPTY;
			} else {
				const parsed = JSON.parse(raw);
				cachedValue = Array.isArray(parsed) ? (parsed as Attempt[]) : EMPTY;
			}
		}

		return cachedValue;
	} catch {
		return EMPTY;
	}
}

function subscribe(onChange: () => void) {
	window.addEventListener("storage", onChange);
	window.addEventListener(EVENT, onChange);

	return () => {
		window.removeEventListener("storage", onChange);
		window.removeEventListener(EVENT, onChange);
	};
}

function getServerSnapshot(): Attempt[] {
	return EMPTY;
}

/** The stored attempts, kept in step across tabs and components. */
export function useAttempts(): Attempt[] {
	return useSyncExternalStore(subscribe, readRaw, getServerSnapshot);
}

/**
 * False during server render and the hydration pass, true afterwards. Lets a
 * component hold back localStorage-derived UI instead of flashing an empty state.
 */
export function useIsHydrated(): boolean {
	return useSyncExternalStore(
		() => () => {},
		() => true,
		() => false
	);
}

export function readAttempts(): Attempt[] {
	return readRaw();
}

export function recordAttempts(attempts: Attempt[]) {
	if (attempts.length === 0) {
		return;
	}

	try {
		const next = [...readRaw(), ...attempts].slice(-LIMIT);
		localStorage.setItem(KEY, JSON.stringify(next));
		window.dispatchEvent(new Event(EVENT));
	} catch {
		// Nothing to do: progress is a convenience, not a requirement.
	}
}

export function clearAttempts() {
	try {
		localStorage.removeItem(KEY);
		window.dispatchEvent(new Event(EVENT));
	} catch {
		// ignored
	}
}

/**
 * Identity of one practice item across the whole vault.
 *
 * Item ids are only unique within a subject: they are chapter number plus index,
 * so React "9.4" and CSS "9.4" are different questions with the same id. Keying
 * history on the bare id would silently merge the two.
 */
export function attemptKey(attempt: Pick<Attempt, "subject" | "itemId">): string {
	return `${attempt.subject}:${attempt.itemId}`;
}

/** Keys most recently answered wrong and not since answered right. */
export function getMissedKeys(attempts: Attempt[]): Set<string> {
	const latest = new Map<string, boolean>();

	for (const attempt of attempts) {
		latest.set(attemptKey(attempt), attempt.correct);
	}

	return new Set([...latest.entries()].filter(([, correct]) => !correct).map(([key]) => key));
}
