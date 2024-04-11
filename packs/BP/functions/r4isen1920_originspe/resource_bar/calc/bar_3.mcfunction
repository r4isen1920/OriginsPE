
scoreboard players operation @s cd3y = @s cd3
scoreboard players operation @s cd3fromz = @s cd3from
scoreboard players operation @s cd3toz = @s cd3to
scoreboard players operation @s cd3durationz = @s cd3duration

scoreboard players operation @s cd3y %= "#10" var
scoreboard players operation @s cd3fromz %= "#10" var
scoreboard players operation @s cd3toz %= "#10" var
scoreboard players operation @s cd3durationz %= "#10" var


scoreboard players operation @s cd3x = @s cd3
scoreboard players operation @s cd3fromy = @s cd3from
scoreboard players operation @s cd3toy = @s cd3to
scoreboard players operation @s cd3durationy = @s cd3duration

scoreboard players operation @s cd3x %= "#100" var
scoreboard players operation @s cd3fromy %= "#100" var
scoreboard players operation @s cd3toy %= "#100" var
scoreboard players operation @s cd3durationy %= "#100" var


scoreboard players operation @s cd3fromx = @s cd3from
scoreboard players operation @s cd3tox = @s cd3to
scoreboard players operation @s cd3durationx = @s cd3duration

scoreboard players operation @s cd3fromx %= "#1000" var
scoreboard players operation @s cd3tox %= "#1000" var
scoreboard players operation @s cd3durationx %= "#1000" var

scoreboard players operation @s cd3fromx -= @s cd3fromy
scoreboard players operation @s cd3tox -= @s cd3toy
scoreboard players operation @s cd3durationx -= @s cd3durationy

scoreboard players operation @s cd3fromx /= "#100" var
scoreboard players operation @s cd3tox /= "#100" var
scoreboard players operation @s cd3durationx /= "#100" var


scoreboard players operation @s cd3x -= @s cd3y
scoreboard players operation @s cd3fromy -= @s cd3fromz
scoreboard players operation @s cd3toy -= @s cd3toz
scoreboard players operation @s cd3durationy -= @s cd3durationz

scoreboard players operation @s cd3x /= "#10" var
scoreboard players operation @s cd3fromy /= "#10" var
scoreboard players operation @s cd3toy /= "#10" var
scoreboard players operation @s cd3durationy /= "#10" var


execute unless score @s cd3 matches 0.. run function r4isen1920_originspe/resource_bar/init/bar_3
