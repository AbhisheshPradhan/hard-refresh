import type { ComponentType } from "react";

/**
 * Compiles to a Turbopack context module over content/**\/*.mdx, so every note is
 * bundled at build time and the route can stay static. The relative path is
 * resolved from this file, which is why the import lives here rather than in a
 * route whose depth can change.
 */
export async function loadNoteBody(
	subject: string,
	chapter: string,
	note: string
): Promise<ComponentType | null> {
	try {
		const mod = await import(`../../content/${subject}/${chapter}/${note}.mdx`);
		return mod.default as ComponentType;
	} catch {
		return null;
	}
}

/**
 * The part introduction that opens each chapter in the workbook — its lede,
 * diagram and Build exercise. Not a note: it has no frontmatter and no route of
 * its own, and it renders at the top of the chapter page.
 */
export async function loadPartIntro(
	subject: string,
	chapter: string
): Promise<ComponentType | null> {
	return loadNoteBody(subject, chapter, "_part");
}
