
import { arachnid } from './origins/arachnid'
import { elf } from './origins/elf'

import { archer } from './classes/archer'

export const ORIGIN_REGISTRY: Record<string, any> = {
	elf, arachnid	
}

export const CLASS_REGISTRY: Record<string, any> = {
	archer
}
