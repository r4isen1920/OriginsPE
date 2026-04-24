
import { arachnid } from './origins/arachnid'
import { avian } from './origins/avian'
import { bee } from './origins/bee'
import { blazeborn } from './origins/blazeborn'
import { diviner } from './origins/diviner'
import { elf } from './origins/elf'
import { elytrian } from './origins/elytrian'
import { enderian } from './origins/enderian'
import { feline } from './origins/feline'
import { human } from './origins/human'
import { inchling } from './origins/inchling'
import { kitsune } from './origins/kitsune'

import { archer } from './classes/archer'

export const ORIGIN_REGISTRY: Record<string, any> = {
	elf, arachnid, avian, bee, blazeborn, diviner, elytrian, enderian, feline, human, inchling, kitsune
}

export const CLASS_REGISTRY: Record<string, any> = {
	archer
}
