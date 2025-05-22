
scoreboard players set "banr" index 0
scoreboard players set "banc" index 0

scoreboard players operation "banr" index += "ban_human" index
scoreboard players operation "banr" index += "ban_avian" index
scoreboard players operation "banr" index += "ban_arachnid" index
scoreboard players operation "banr" index += "ban_elytrian" index
scoreboard players operation "banr" index += "ban_shulk" index
scoreboard players operation "banr" index += "ban_feline" index
scoreboard players operation "banr" index += "ban_enderian" index
scoreboard players operation "banr" index += "ban_merling" index
scoreboard players operation "banr" index += "ban_blazeborn" index
scoreboard players operation "banr" index += "ban_phantom" index
scoreboard players operation "banr" index += "ban_kitsune" index
scoreboard players operation "banr" index += "ban_slimecican" index
scoreboard players operation "banr" index += "ban_inchling" index
scoreboard players operation "banr" index += "ban_bee" index
scoreboard players operation "banr" index += "ban_piglin" index
scoreboard players operation "banr" index += "ban_starborne" index
scoreboard players operation "banr" index += "ban_elf" index
scoreboard players operation "banr" index += "ban_voidwalker" index
scoreboard players operation "banr" index += "ban_diviner" index
scoreboard players operation "banr" index += "ban_mole" index

scoreboard players operation "banc" index += "ban_nitwit" index
scoreboard players operation "banc" index += "ban_archer" index
scoreboard players operation "banc" index += "ban_beastmaster" index
scoreboard players operation "banc" index += "ban_blacksmith" index
scoreboard players operation "banc" index += "ban_cleric" index
scoreboard players operation "banc" index += "ban_cook" index
scoreboard players operation "banc" index += "ban_explorer" index
scoreboard players operation "banc" index += "ban_farmer" index
scoreboard players operation "banc" index += "ban_lumberjack" index
scoreboard players operation "banc" index += "ban_merchant" index
scoreboard players operation "banc" index += "ban_miner" index
scoreboard players operation "banc" index += "ban_rancher" index
scoreboard players operation "banc" index += "ban_rogue" index
scoreboard players operation "banc" index += "ban_warrior" index
scoreboard players operation "banc" index += "ban_diviner" index
scoreboard players operation "banc" index += "ban_mole" index

execute if score "banr" index matches 20.. run scoreboard players set "ban_human" index 0
execute if score "banc" index matches 13.. run scoreboard players set "ban_nitwit" index 0
execute if score "banr" index matches 20.. run scoreboard players set "ban_human" index 19
execute if score "banc" index matches 13.. run scoreboard players set "ban_nitwit" index 12

execute if score "banr" index matches 21.. run scoreboard players set "banc" index 20
execute if score "banc" index matches 14.. run scoreboard players set "banr" index 13
execute if score "banr" index matches ..-1 run scoreboard players set "banc" index 0
execute if score "banc" index matches ..-1 run scoreboard players set "banr" index 0
