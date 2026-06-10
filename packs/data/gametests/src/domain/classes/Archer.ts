import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Archer implements CharacterClass {
	readonly id = 'archer';
	readonly difficulty = ClassDifficulty.Decent;
	readonly perks: readonly string[] = [
		'less_bow_slowdown',
		'no_projectile_divergence',
	];
}
