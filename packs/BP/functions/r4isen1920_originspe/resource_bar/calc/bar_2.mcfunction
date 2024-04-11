
scoreboard players operation @s cd2y = @s cd2
scoreboard players operation @s cd2fromz = @s cd2from
scoreboard players operation @s cd2toz = @s cd2to
scoreboard players operation @s cd2durationz = @s cd2duration

scoreboard players operation @s cd2y %= "#10" var
scoreboard players operation @s cd2fromz %= "#10" var
scoreboard players operation @s cd2toz %= "#10" var
scoreboard players operation @s cd2durationz %= "#10" var


scoreboard players operation @s cd2x = @s cd2
scoreboard players operation @s cd2fromy = @s cd2from
scoreboard players operation @s cd2toy = @s cd2to
scoreboard players operation @s cd2durationy = @s cd2duration

scoreboard players operation @s cd2x %= "#100" var
scoreboard players operation @s cd2fromy %= "#100" var
scoreboard players operation @s cd2toy %= "#100" var
scoreboard players operation @s cd2durationy %= "#100" var


scoreboard players operation @s cd2fromx = @s cd2from
scoreboard players operation @s cd2tox = @s cd2to
scoreboard players operation @s cd2durationx = @s cd2duration

scoreboard players operation @s cd2fromx %= "#1000" var
scoreboard players operation @s cd2tox %= "#1000" var
scoreboard players operation @s cd2durationx %= "#1000" var

scoreboard players operation @s cd2fromx -= @s cd2fromy
scoreboard players operation @s cd2tox -= @s cd2toy
scoreboard players operation @s cd2durationx -= @s cd2durationy

scoreboard players operation @s cd2fromx /= "#100" var
scoreboard players operation @s cd2tox /= "#100" var
scoreboard players operation @s cd2durationx /= "#100" var


scoreboard players operation @s cd2x -= @s cd2y
scoreboard players operation @s cd2fromy -= @s cd2fromz
scoreboard players operation @s cd2toy -= @s cd2toz
scoreboard players operation @s cd2durationy -= @s cd2durationz

scoreboard players operation @s cd2x /= "#10" var
scoreboard players operation @s cd2fromy /= "#10" var
scoreboard players operation @s cd2toy /= "#10" var
scoreboard players operation @s cd2durationy /= "#10" var


execute unless score @s cd2 matches 0.. run function r4isen1920_originspe/resource_bar/init/bar_2
