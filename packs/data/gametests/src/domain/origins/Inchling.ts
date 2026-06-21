import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


/** Inchling origin these creatures are as nimble as their size. */
@RegisterOrigin
export class Inchling implements Origin {
	readonly id = 'inchling';
	readonly difficulty = OriginDifficulty.Medium;
	readonly powers: readonly string[] = [
		'nimble', 
		'hyper_active',
		'small_apetite',
		'bite_sized',
		'poisonous',
	];
}
