
scoreboard players set @a[tag="race_human"] index 1
scoreboard players set "c_human" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_human" index += @a[tag="race_human"] index
scoreboard players reset @a[tag="race_human"] index
scoreboard players set @a[tag="race_avian"] index 1
scoreboard players set "c_avian" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_avian" index += @a[tag="race_avian"] index
scoreboard players reset @a[tag="race_avian"] index
scoreboard players set @a[tag="race_arachnid"] index 1
scoreboard players set "c_arachnid" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_arachnid" index += @a[tag="race_arachnid"] index
scoreboard players reset @a[tag="race_arachnid"] index
scoreboard players set @a[tag="race_elytrian"] index 1
scoreboard players set "c_elytrian" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_elytrian" index += @a[tag="race_elytrian"] index
scoreboard players reset @a[tag="race_elytrian"] index
scoreboard players set @a[tag="race_shulk"] index 1
scoreboard players set "c_shulk" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_shulk" index += @a[tag="race_shulk"] index
scoreboard players reset @a[tag="race_shulk"] index
scoreboard players set @a[tag="race_feline"] index 1
scoreboard players set "c_feline" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_feline" index += @a[tag="race_feline"] index
scoreboard players reset @a[tag="race_feline"] index
scoreboard players set @a[tag="race_enderian"] index 1
scoreboard players set "c_enderian" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_enderian" index += @a[tag="race_enderian"] index
scoreboard players reset @a[tag="race_enderian"] index
scoreboard players set @a[tag="race_merling"] index 1
scoreboard players set "c_merling" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_merling" index += @a[tag="race_merling"] index
scoreboard players reset @a[tag="race_merling"] index
scoreboard players set @a[tag="race_blazeborn"] index 1
scoreboard players set "c_blazeborn" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_blazeborn" index += @a[tag="race_blazeborn"] index
scoreboard players reset @a[tag="race_blazeborn"] index
scoreboard players set @a[tag="race_phantom"] index 1
scoreboard players set "c_phantom" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_phantom" index += @a[tag="race_phantom"] index
scoreboard players reset @a[tag="race_phantom"] index
scoreboard players set @a[tag="race_kitsune"] index 1
scoreboard players set "c_kitsune" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_kitsune" index += @a[tag="race_kitsune"] index
scoreboard players reset @a[tag="race_kitsune"] index
scoreboard players set @a[tag="race_slimecican"] index 1
scoreboard players set "c_slimecican" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_slimecican" index += @a[tag="race_slimecican"] index
scoreboard players reset @a[tag="race_slimecican"] index
scoreboard players set @a[tag="race_inchling"] index 1
scoreboard players set "c_inchling" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_inchling" index += @a[tag="race_inchling"] index
scoreboard players reset @a[tag="race_inchling"] index
scoreboard players set @a[tag="race_bee"] index 1
scoreboard players set "c_bee" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_bee" index += @a[tag="race_bee"] index
scoreboard players reset @a[tag="race_bee"] index
scoreboard players set @a[tag="race_piglin"] index 1
scoreboard players set "c_piglin" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_piglin" index += @a[tag="race_piglin"] index
scoreboard players reset @a[tag="race_piglin"] index
scoreboard players set @a[tag="race_starborne"] index 1
scoreboard players set "c_starborne" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_starborne" index += @a[tag="race_starborne"] index
scoreboard players reset @a[tag="race_starborne"] index
scoreboard players set "c_elf" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_elf" index += @a[tag="race_elf"] index
scoreboard players reset @a[tag="race_elf"] index
scoreboard players set "c_voidwalker" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_voidwalker" index += @a[tag="race_voidwalker"] index
scoreboard players reset @a[tag="race_voidwalker"] index
scoreboard players set "c_diviner" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_diviner" index += @a[tag="race_diviner"] index
scoreboard players reset @a[tag="race_diviner"] index
scoreboard players set "c_mole" index 0
execute if score "toggle_unique" index matches 1 run scoreboard players operation "c_mole" index += @a[tag="race_mole"] index
scoreboard players reset @a[tag="race_mole"] index


scoreboard players set "c_all" index 0
scoreboard players set "c_temp" index 1

execute if score "c_human" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_avian" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_arachnid" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_elytrian" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_shulk" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_feline" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_enderian" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_merling" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_blazeborn" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_phantom" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_kitsune" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_slimecican" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_inchling" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_bee" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_piglin" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_starborne" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_elf" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_voidwalker" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_diviner" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index
execute if score "c_mole" index matches 1.. run scoreboard players operation "c_all" index += "c_temp" index

scoreboard players reset "c_temp"
