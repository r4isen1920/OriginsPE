import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


/** Spider-like origin granting webbing and wall-climb. */
@RegisterOrigin
export class Arachnid implements Origin {
	readonly id = 'arachnid';
	readonly difficulty = OriginDifficulty.Easy;
	readonly powers: readonly string[] = [
		'webbing',
		'master_of_webs',
		'climbing',
		'carnivore',
		'fragile',
	];
}
