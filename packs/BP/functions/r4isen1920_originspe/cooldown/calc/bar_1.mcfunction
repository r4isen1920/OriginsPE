
scoreboard players operation @s cd1y = @s cd1
scoreboard players operation @s cd1fromz = @s cd1from
scoreboard players operation @s cd1toz = @s cd1to
scoreboard players operation @s cd1durationz = @s cd1duration

scoreboard players operation @s cd1y %= "#10" var
scoreboard players operation @s cd1fromz %= "#10" var
scoreboard players operation @s cd1toz %= "#10" var
scoreboard players operation @s cd1durationz %= "#10" var


scoreboard players operation @s cd1x = @s cd1
scoreboard players operation @s cd1fromy = @s cd1from
scoreboard players operation @s cd1toy = @s cd1to
scoreboard players operation @s cd1durationy = @s cd1duration

scoreboard players operation @s cd1x %= "#100" var
scoreboard players operation @s cd1fromy %= "#100" var
scoreboard players operation @s cd1toy %= "#100" var
scoreboard players operation @s cd1durationy %= "#100" var


scoreboard players operation @s cd1fromx = @s cd1from
scoreboard players operation @s cd1tox = @s cd1to
scoreboard players operation @s cd1durationx = @s cd1duration

scoreboard players operation @s cd1fromx %= "#1000" var
scoreboard players operation @s cd1tox %= "#1000" var
scoreboard players operation @s cd1durationx %= "#1000" var

scoreboard players operation @s cd1fromx -= @s cd1fromy
scoreboard players operation @s cd1tox -= @s cd1toy
scoreboard players operation @s cd1durationx -= @s cd1durationy

scoreboard players operation @s cd1fromx /= "#100" var
scoreboard players operation @s cd1tox /= "#100" var
scoreboard players operation @s cd1durationx /= "#100" var


scoreboard players operation @s cd1x -= @s cd1y
scoreboard players operation @s cd1fromy -= @s cd1fromz
scoreboard players operation @s cd1toy -= @s cd1toz
scoreboard players operation @s cd1durationy -= @s cd1durationz

scoreboard players operation @s cd1x /= "#10" var
scoreboard players operation @s cd1fromy /= "#10" var
scoreboard players operation @s cd1toy /= "#10" var
scoreboard players operation @s cd1durationy /= "#10" var


execute unless score @s cd1 matches 0.. run function cooldown/init/bar_1
