import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Spider-like origin granting webbing and wall-climb. */
@RegisterOrigin
export class Arachnid implements Origin {
	readonly id = 'arachnid';
	readonly powers: readonly string[] = [
		'webbing',
		'master_of_webs',
		'climbing',
		'carnivore',
		'fragile',
	];
}
