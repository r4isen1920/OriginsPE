# OriginsPE

OriginsPE (Portable Edition) is a Minecraft: Bedrock Edition Add-On that allows you to select an Origin at the start of the game. Each Origin has their own unique abilities, advantages, and disadvanatages. Moreoever, you can also be able to pick your Class. Classes, on the other hand, may complement whatever Origin of your choosing. Or just be a Human, a regular playthrough of Minecraft as is.

This repository is intended for developers and modders, if you'd like to download the Add-On, please visit the CurseForge / MCPEDL page.

## Setting up the development environment

1. Download and install necessary programs:
   - [Regolith](https://github.com/Bedrock-OSS/regolith/releases) - [Regolith documentation](https://bedrock-oss.github.io/regolith/guide/installing)
   - [NodeJS](https://nodejs.org/en/download/)
   - [Python](https://www.python.org/downloads/)
   - A text editor of your choice (preferrably [VSCode](https://code.visualstudio.com/))
2. Execute `regolith install-all` in the root directory of the project
3. Execute `regolith run` in the root directory of the project to build the project

## Creating custom Origins and Classes

- You need to learn a bit of JavaScript / TypeScript
- Check the [Scripts API documentation](https://jaylydev.github.io/scriptapi-docs/latest/index.html) for your reference
- The base logic for the abilities are found at `packs/data/gametests/src/data` 
  - New files that are added within this directory are automatically imported

## Building

Execute `regolith run` in the root directory of the project to build the project. It is recommended to build the project.

## Updates
This branch fixes an issue where normal tools wouldn't show up in quick craft recipes. Also fixes an issue where tools made by the blacksmith class would never wear out or break.
