
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Handle dependencies
 */
function requireTypeScript() {
	try {
		return require('typescript');
	} catch {
		console.log('[emit_domain] installing dependencies (typescript)...');
		execSync('npm install --no-audit --no-fund --loglevel=error', { cwd: __dirname, stdio: 'inherit' });
		return require('typescript');
	}
}

const ts = requireTypeScript();


//#region PATHS

const DATA_DIR = path.resolve('data');
const DOMAIN_DIR = path.join(DATA_DIR, 'gametests', 'src', 'domain');
const MAIN_TS = path.join(DATA_DIR, 'gametests', 'src', 'main.ts');
const META_TS = path.join(DATA_DIR, 'gametests', 'src', 'Meta.ts');
const ABILITY_TS = path.join(DOMAIN_DIR, 'Ability.ts');
const OUT_DIR = path.join(DATA_DIR, 'jsonte');
const GLOBAL_VARS = path.resolve('RP', 'ui', '_global_variables.json');


//#region AST HELPERS

/** Parses a `.ts` file into a TypeScript source file AST. */
function parseSource(file) {
	const text = fs.readFileSync(file, 'utf8');
	return ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
}

/** Finds the first exported class declaration in a source file. */
function findClass(source) {
	let found;
	source.forEachChild((node) => {
		if (!found && ts.isClassDeclaration(node)) found = node;
	});
	return found;
}

/** Returns the initializer of the named property, or undefined. */
function propInitializer(klass, name) {
	for (const member of klass.members) {
		if (ts.isPropertyDeclaration(member) && member.name && member.name.getText() === name) {
			return member.initializer;
		}
	}
	return undefined;
}

/** Reads a string-literal property (id, difficulty). */
function readString(klass, name) {
	const init = propInitializer(klass, name);
	if (init && ts.isStringLiteral(init)) return init.text;
	return undefined;
}

/** Reads a string-array property (powers, perks, controls). */
function readStringArray(klass, name) {
	const init = propInitializer(klass, name);
	if (init && ts.isArrayLiteralExpression(init)) {
		return init.elements.filter(ts.isStringLiteral).map((e) => e.text);
	}
	return [];
}

/** Parses the enum declarations in `Ability.ts` into an `EnumName.Member` -> value map. */
function buildEnumMap() {
	const map = {};
	if (!fs.existsSync(ABILITY_TS)) return map;
	parseSource(ABILITY_TS).forEachChild((node) => {
		if (!ts.isEnumDeclaration(node)) return;
		const enumName = node.name.text;
		for (const member of node.members) {
			if (member.initializer && ts.isStringLiteral(member.initializer)) {
				map[`${enumName}.${member.name.getText()}`] = member.initializer.text;
			}
		}
	});
	return map;
}

/** Reads `difficulty`, resolving an enum member (e.g. `OriginDifficulty.Easy`) to its value. */
function readDifficulty(klass, enumMap) {
	const init = propInitializer(klass, 'difficulty');
	if (!init) return undefined;
	if (ts.isStringLiteral(init)) return init.text;
	if (ts.isPropertyAccessExpression(init)) return enumMap[init.getText()];
	return undefined;
}

/** Reads a trait's powers-list icon: a `readonly icon = '..'` field, else `active = { icon: '..' }`. */
function readIcon(klass) {
	const direct = readString(klass, 'icon');
	if (direct) return direct;
	const active = propInitializer(klass, 'active');
	if (active && ts.isObjectLiteralExpression(active)) {
		for (const prop of active.properties) {
			if (ts.isPropertyAssignment(prop) && prop.name.getText() === 'icon' && ts.isStringLiteral(prop.initializer)) {
				return prop.initializer.text;
			}
		}
	}
	return undefined;
}

/** Scans every power/perk file and maps trait id -> powers-list icon index. */
function buildIconMap() {
	const map = {};
	for (const sub of ['powers', 'perks']) {
		const dir = path.join(DOMAIN_DIR, sub);
		if (!fs.existsSync(dir)) continue;
		for (const file of fs.readdirSync(dir)) {
			if (!file.endsWith('.ts')) continue;
			const klass = findClass(parseSource(path.join(dir, file)));
			if (!klass) continue;
			const id = readString(klass, 'id');
			const icon = id ? readIcon(klass) : undefined;
			if (id && icon) map[id] = icon;
		}
	}
	return map;
}


//#region EXTRACTION

/** Reads the ordered class file names imported by main.ts for the given kind folder. */
function importOrder(kindFolder) {
	const text = fs.readFileSync(MAIN_TS, 'utf8');
	const re = new RegExp(`import\\s+'\\./domain/${kindFolder}/(\\w+)'`, 'g');
	const order = [];
	let m;
	while ((m = re.exec(text)) !== null) order.push(m[1]);
	return order;
}

/** Builds an emitted being entry from a parsed domain class. */
function buildEntry(kind, klass, iconMap, enumMap) {
	const id = readString(klass, 'id');
	if (!id) throw new Error(`[emit_domain] missing id in ${kind} class`);

	const difficulty = readDifficulty(klass, enumMap) ?? 'human';
	const traitIds = readStringArray(klass, kind === 'race' ? 'powers' : 'perks');

	// Icons live on each power/perk (single source of truth); "none" is the sentinel
	// the powers UI container treats as "no icon".
	const abilities = traitIds.map((tid) => ({ id: tid, icon: iconMap[tid] ?? 'none' }));

	const traits = traitsRef(kind, id, abilities.length);

	return { id, difficulty, navigable: true, traits, abilities };
}

/** Resolves the powers.ui control reference for a being. */
function traitsRef(kind, id, abilityCount) {
	if (abilityCount === 0) return 'origin_powers.none';
	if (kind === 'race') return `origin_powers.${id}`;
	return `origin_powers.c_${id}`;
}

/** Builds the `random` sentinel prepended to each list (not navigable). */
function randomEntry(kind) {
	return kind === 'race'
		? { id: 'random', difficulty: 'random_race', navigable: false, traits: 'origin_powers.r_random', abilities: [] }
		: { id: 'random', difficulty: 'random_class', navigable: false, traits: 'origin_powers.c_random', abilities: [] };
}

/** Parses every domain class of a kind, in main.ts import order. */
function collect(kind, iconMap, enumMap) {
	const folder = kind === 'race' ? 'origins' : 'classes';
	const order = importOrder(folder);
	const entries = [randomEntry(kind)];
	for (const name of order) {
		const file = path.join(DOMAIN_DIR, folder, `${name}.ts`);
		if (!fs.existsSync(file)) throw new Error(`[emit_domain] domain file not found: ${file}`);
		const klass = findClass(parseSource(file));
		if (!klass) throw new Error(`[emit_domain] no class found in ${file}`);
		entries.push(buildEntry(kind, klass, iconMap, enumMap));
	}
	return entries;
}


//#region UI VERSION

/** Reads the `github.commit` and `github.tag` fields from the generated `Meta.ts`. */
function readMeta() {
	if (!fs.existsSync(META_TS)) throw new Error(`[emit_domain] Meta.ts not found: ${META_TS}`);
	const text = fs.readFileSync(META_TS, 'utf8');
	const commit = text.match(/commit:\s*"([^"]+)"/)?.[1];
	const tag = text.match(/tag:\s*"([^"]+)"/)?.[1];
	if (!commit || !tag) throw new Error('[emit_domain] could not read commit/tag from Meta.ts');
	return { commit, tag };
}

/** Patches the version/commit UI globals in `_global_variables.json` from `Meta.ts`. */
function emitUiVersion() {
	if (!fs.existsSync(GLOBAL_VARS)) throw new Error(`[emit_domain] UI globals not found: ${GLOBAL_VARS}`);
	const { commit, tag } = readMeta();
	const shortCommit = commit.slice(0, 7);

	let text = fs.readFileSync(GLOBAL_VARS, 'utf8');
	text = text.replace(/("\$r4ui_pack_version"\s*:\s*)"[^"]*"/, `$1"${tag}"`);
	text = text.replace(/("\$r4ui_pack_commit"\s*:\s*)"[^"]*"/, `$1"${shortCommit}"`);
	fs.writeFileSync(GLOBAL_VARS, text);

	console.log(`[emit_domain] emitted UI version ${tag} (build ${shortCommit})`);
}


//#region MAIN

function main() {
	if (!fs.existsSync(DOMAIN_DIR)) throw new Error(`[emit_domain] domain dir not found: ${DOMAIN_DIR}`);
	fs.mkdirSync(OUT_DIR, { recursive: true });

	const iconMap = buildIconMap();
	const enumMap = buildEnumMap();
	const origins = collect('race', iconMap, enumMap);
	const classes = collect('class', iconMap, enumMap);

	fs.writeFileSync(path.join(OUT_DIR, 'origins.json'), JSON.stringify({ origins }, null, 2) + '\n');
	fs.writeFileSync(path.join(OUT_DIR, 'classes.json'), JSON.stringify({ classes }, null, 2) + '\n');

	console.log(`[emit_domain] emitted ${origins.length} origins, ${classes.length} classes`);

	emitUiVersion();
}

main();
