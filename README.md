[<img align="center" alt="OriginsPE" src="./title_high_res.png">](#)

[<img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg">](https://opensource.org/licenses/MIT) [<img alt="License: MIT" src="https://cf.way2muchnoise.eu/full_917648_downloads.svg">](https://www.curseforge.com/minecraft-bedrock/addons/originspe-be-add-on-1-2) [<img alt="License: MIT" src="https://cf.way2muchnoise.eu/versions/For%20Minecraft%20Bedrock_917648_all.svg">](https://www.curseforge.com/minecraft-bedrock/addons/originspe-be-add-on-1-2)

OriginsPE is a Minecraft Bedrock Add-On that allows you to select an Origin at the start of the game. Each Origin has their own unique abilities, advantages, and disadvanatages. Moreoever, you can also be able to pick your Class. Classes, on the other hand, may complement whatever Origin of your choosing. Or just be a Human, a regular playthrough of Minecraft as is.

**This repository is intended for developers and modders, if you'd like to download the Add-On, please visit the [CurseForge](https://www.curseforge.com/minecraft-bedrock/addons/originspe-be-add-on-1-2) / [MCPEDL](https://mcpedl.com/originspe-be-add-on-1-2/) page, or check the [releases page](https://github.com/r4isen1920/OriginsPE/releases) to download the pack directly.**

If you want to contribute to the development of this Add-On, please refer to the information below:

## Prerequisites

- [regolith](https://github.com/Bedrock-OSS/regolith/releases) (follow the [installation guide](https://regolith-docs.readthedocs.io/en/latest/introduction/installation/)).
- [Node.js](https://nodejs.org/en/download/)
- [Python](https://www.python.org/downloads/)
- [Visual Studio Code](https://code.visualstudio.com/) or any IDE you want
    - [regolith extension](https://marketplace.visualstudio.com/items?itemName=BedrockOSS.regolith)

## Initial setup

1. Clone the repository and open it in your preferred IDE.
2. Run `regolith install-all` once to download filter dependencies.

## File naming convention

Please follow the standard naming convention below for readability and cleanliness:

| File name         | Description                         |
| ----------------- | ----------------------------------- |
| `*.b.json`        | Block definition                    |
| `*.se.json`       | Server entity (BP/entity)           |
| `*.ce.json`       | Client entity (RP/entity)           |
| `*.i.json`        | Item definition                     |
| `*.r.json`        | Recipe                              |
| `*.rp_ac.json`    | Resource Pack animation controllers |
| `*.bp_ac.json`    | Behavior Pack animation controllers |
| `*.rp_a.json`     | Resource Pack animations            |
| `*.bp_a.json`     | Behavior Pack animations            |
| `*.geo.json`      | Geometry file                       |
| `*.particle.json` | Particle definition file            |
| `*.rc.json`       | Render controller                   |
| `*.ui.json`       | JSON UI file                        |
