
const fs = require('fs');
const path = require('path');


//#region PATHS

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Source markdown lives in the Regolith data folder (never exported to the pack).
const SOURCE_MD = path.join(REPO_ROOT, 'packs', 'data', 'patch_notes.md');
const TMP_MD = path.resolve('data', 'patch_notes.md');

// Generated JSON UI, written to both the working copy (exported) and the repo (committed).
const UI_REL = path.join('ui', 'r4isen1920', 'originspe', 'patch_notes.ui.json');
const SOURCE_OUT = path.join(REPO_ROOT, 'packs', 'RP', UI_REL);
const TMP_OUT = path.resolve('RP', UI_REL);

const NAMESPACE = 'origin_patch_notes';
const SCROLL_CONTENT = 'patch_notes_scroll_content';


//#region MARKDOWN

/** Classifies a single markdown line into a UI node, or null when it is skipped. */
function parseLine(rawLine) {
	const line = rawLine.replace(/\s+$/, '');
	if (line.trim() === '') return { kind: 'spacer' };

	if (line.startsWith('## ')) return { kind: 'sub_header', text: line.slice(3).trim() };
	if (line.startsWith('# ')) return { kind: 'header', text: line.slice(2).trim() };

	const bullet = line.replace(/^\s+/, '');
	if (bullet.startsWith('- ') || bullet.startsWith('* ')) {
		return { kind: 'bullet', text: bullet.slice(2).trim() };
	}

	return { kind: 'body', text: line.trim() };
}

/** Parses the whole markdown document into an ordered list of UI nodes. */
function parseMarkdown(text) {
	return text.split(/\r?\n/).map(parseLine).filter(Boolean);
}


//#region UI EMIT

/** Maps a parsed node to its label template and display text. */
function nodeToControl(node, index) {
	const templates = {
		header: 'patch_notes_label_header',
		sub_header: 'patch_notes_label_sub_header',
		body: 'patch_notes_label_body',
		bullet: 'patch_notes_label_body',
		spacer: 'patch_notes_label_body',
	};

	const template = templates[node.kind];
	// A blank line renders as a single space so the stack still reserves height.
	const text = node.kind === 'spacer' ? ' ' : node.kind === 'bullet' ? `  - ${node.text}` : node.text;

	return { [`${node.kind}_${index}@${template}`]: { text } };
}

/** Builds the full JSON UI document from the parsed nodes. */
function buildDocument(nodes) {
	return {
		namespace: NAMESPACE,

		'patch_notes_label@origin_common.text_label': {
			size: ['default', 'default'],
			max_size: ['100%', 'default'],
			localize: false,
		},
		'patch_notes_label_header@patch_notes_label': { font_scale_factor: 1.6 },
		'patch_notes_label_sub_header@patch_notes_label': { font_scale_factor: 1.2 },
		'patch_notes_label_body@patch_notes_label': { font_scale_factor: 0.8 },

		[`${SCROLL_CONTENT}@origin_common.verti_stack`]: {
			size: ['100%', '100%c'],
			controls: nodes.map(nodeToControl),
		},
	};
}


//#region MAIN

function main() {
	const sourcePath = fs.existsSync(TMP_MD) ? TMP_MD : SOURCE_MD;
	if (!fs.existsSync(sourcePath)) throw new Error(`[patch_notes] source markdown not found: ${sourcePath}`);

	const nodes = parseMarkdown(fs.readFileSync(sourcePath, 'utf8'));
	const header = '{\n\t/* Auto-generated from packs/data/patch_notes.md by filters/patch_notes | do not edit by hand */\n';
	const body = JSON.stringify(buildDocument(nodes), null, '\t').replace(/^{\n/, '');
	const output = `${header}\n${body}\n`;

	// Always update the committed source; only touch the working copy under a Regolith run.
	fs.mkdirSync(path.dirname(SOURCE_OUT), { recursive: true });
	fs.writeFileSync(SOURCE_OUT, output);
	if (fs.existsSync(path.dirname(TMP_OUT))) fs.writeFileSync(TMP_OUT, output);

	console.log(`[patch_notes] emitted ${nodes.length} patch note lines`);
}

main();
