#!/usr/bin/env node
/**
 * Checks content/ before it reaches the build.
 *
 *   npm run validate
 *
 * The React export was verified clean by hand before handover. Nothing enforced
 * that, and nothing would enforce it for the next subject, so this does.
 *
 * Exits 1 on any error. Warnings do not fail.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const CONTENT = join(process.cwd(), "content");
const KNOWN_GROUPS = ["Languages", "Frameworks", "Computer science"];

// Subjects and chapters live under /learn and /practice rather than at the URL
// root, so no content slug can shadow a route any more and nothing is reserved.
// Kept as an empty list so the check is easy to reinstate if routes move again.
const RESERVED_TOP_LEVEL = [];
const RESERVED_IN_SUBJECT = [];

const errors = [];
const warnings = [];

const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

const dirs = (p) =>
	existsSync(p)
		? readdirSync(p, { withFileTypes: true })
				.filter((e) => e.isDirectory())
				.map((e) => e.name)
		: [];

const readJson = (p) => {
	try {
		return JSON.parse(readFileSync(p, "utf8"));
	} catch (e) {
		err(p, `invalid JSON — ${e.message}`);
		return null;
	}
};

if (!existsSync(CONTENT)) {
	console.error("No content/ directory.");
	process.exit(1);
}

const noteIds = new Set();
const chapterIds = new Set();
const subjects = dirs(CONTENT);

if (subjects.length === 0) {
	err("content/", "no subjects found");
}

for (const subject of subjects) {
	const subjectDir = join(CONTENT, subject);
	const where = `content/${subject}`;

	if (RESERVED_TOP_LEVEL.includes(subject)) {
		err(where, `"${subject}" is a reserved route and would be unreachable as a subject`);
	}

	// --- subject metadata ---
	const subjectMetaPath = join(subjectDir, "_subject.json");
	if (!existsSync(subjectMetaPath)) {
		err(where, "missing _subject.json (title, summary, group, order)");
	} else {
		const meta = readJson(subjectMetaPath);
		if (meta) {
			for (const field of ["title", "summary", "group", "order"]) {
				if (meta[field] === undefined || meta[field] === "") {
					err(`${where}/_subject.json`, `missing "${field}"`);
				}
			}
			if (meta.group && !KNOWN_GROUPS.includes(meta.group)) {
				warn(
					`${where}/_subject.json`,
					`group "${meta.group}" is not one of ${KNOWN_GROUPS.join(", ")} — it will sort last`
				);
			}
		}
	}

	// --- chapters and notes ---
	const chapters = dirs(subjectDir);
	if (chapters.length === 0) {
		err(where, "no chapters");
	}

	for (const chapter of chapters) {
		const chapterDir = join(subjectDir, chapter);
		const cWhere = `${where}/${chapter}`;
		chapterIds.add(`${subject}/${chapter}`);

		if (RESERVED_IN_SUBJECT.includes(chapter)) {
			err(cWhere, `"${chapter}" is a reserved route segment and would be shadowed`);
		}

		const chapterMetaPath = join(chapterDir, "_chapter.json");
		if (!existsSync(chapterMetaPath)) {
			err(cWhere, "missing _chapter.json");
		} else {
			const meta = readJson(chapterMetaPath);
			if (meta) {
				for (const field of ["title", "summary", "order"]) {
					if (meta[field] === undefined || meta[field] === "") {
						err(`${cWhere}/_chapter.json`, `missing "${field}"`);
					}
				}
			}
		}

		const notes = readdirSync(chapterDir).filter(
			(f) => f.endsWith(".mdx") && !f.startsWith("_")
		);
		if (notes.length === 0) {
			warn(cWhere, "no .mdx notes");
		}

		for (const file of notes) {
			const nWhere = `${cWhere}/${file}`;
			const id = `${subject}/${chapter}/${file.replace(/\.mdx$/, "")}`;

			if (noteIds.has(id)) {
				err(nWhere, `duplicate note id "${id}"`);
			}
			noteIds.add(id);

			let data;
			try {
				({ data } = matter(readFileSync(join(chapterDir, file), "utf8")));
			} catch (e) {
				err(nWhere, `unreadable frontmatter — ${e.message}`);
				continue;
			}

			for (const field of ["title", "summary", "order"]) {
				if (data[field] === undefined || data[field] === "") {
					err(nWhere, `frontmatter missing "${field}"`);
				}
			}
			if (data.tags !== undefined && !Array.isArray(data.tags)) {
				err(nWhere, `"tags" must be an array`);
			}
			if (data.prerequisites !== undefined && !Array.isArray(data.prerequisites)) {
				err(nWhere, `"prerequisites" must be an array`);
			}
		}
	}
}

// --- second pass: cross-references, now that every note id is known ---
for (const subject of subjects) {
	const subjectDir = join(CONTENT, subject);

	for (const chapter of dirs(subjectDir)) {
		const chapterDir = join(subjectDir, chapter);

		for (const file of readdirSync(chapterDir).filter(
			(f) => f.endsWith(".mdx") && !f.startsWith("_")
		)) {
			const nWhere = `content/${subject}/${chapter}/${file}`;
			const { data } = matter(readFileSync(join(chapterDir, file), "utf8"));

			for (const prereq of data.prerequisites ?? []) {
				if (!noteIds.has(prereq)) {
					err(nWhere, `prerequisite "${prereq}" does not resolve to a note`);
				}
			}
		}
	}

	// --- practice items ---
	for (const [file, kind] of [
		["quiz.json", "quiz"],
		["interview.json", "interview"],
	]) {
		const path = join(subjectDir, file);
		if (!existsSync(path) || !statSync(path).isFile()) {
			warn(`content/${subject}`, `no ${file}`);
			continue;
		}

		const items = readJson(path);
		if (!Array.isArray(items)) {
			err(`content/${subject}/${file}`, "expected a top-level array");
			continue;
		}

		const seen = new Set();

		for (const item of items) {
			const iWhere = `content/${subject}/${file} [${item.id ?? "?"}]`;

			// Ids only need to be unique within a subject; the app keys history on
			// subject + id. Duplicates inside one file would still collide.
			if (seen.has(item.id)) {
				err(iWhere, `duplicate item id "${item.id}"`);
			}
			seen.add(item.id);

			if (!chapterIds.has(item.chapterId)) {
				err(iWhere, `chapterId "${item.chapterId}" does not resolve`);
			}
			if (!noteIds.has(item.noteId)) {
				err(iWhere, `noteId "${item.noteId}" does not resolve`);
			}
			if (!item.chapterId?.startsWith(`${subject}/`)) {
				err(iWhere, `chapterId "${item.chapterId}" is not in subject "${subject}"`);
			}

			for (const rel of item.related ?? []) {
				if (!noteIds.has(rel)) {
					err(iWhere, `related "${rel}" does not resolve`);
				}
			}

			if (kind === "quiz") {
				if (!Array.isArray(item.options) || item.options.length < 2) {
					err(iWhere, "needs at least 2 options");
				} else if (
					!Number.isInteger(item.correctIndex) ||
					item.correctIndex < 0 ||
					item.correctIndex >= item.options.length
				) {
					err(iWhere, `correctIndex ${item.correctIndex} is out of range`);
				}
				if (!item.explanation) {
					warn(iWhere, "no explanation");
				}
			} else {
				if (!["diagnose", "explain", "rapid"].includes(item.kind)) {
					err(iWhere, `kind "${item.kind}" is not diagnose | explain | rapid`);
				}
				if (item.kind === "diagnose" && !item.codeContext) {
					warn(iWhere, "diagnose item has no codeContext");
				}
				if (!item.modelAnswer) {
					err(iWhere, "no modelAnswer");
				}
			}
		}
	}
}

for (const w of warnings) {
	console.log(`warn  ${w}`);
}
for (const e of errors) {
	console.error(`ERROR ${e}`);
}

console.log(
	`\n${subjects.length} subject(s), ${chapterIds.size} chapters, ${noteIds.size} notes — ` +
		`${errors.length} error(s), ${warnings.length} warning(s).`
);

process.exit(errors.length > 0 ? 1 : 0);
