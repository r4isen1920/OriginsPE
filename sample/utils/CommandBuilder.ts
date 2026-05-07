import { Logger } from '@bedrock-oss/bedrock-boost';
import { Block, Entity, Player, system, world, ScriptEventCommandMessageAfterEvent, ItemUseBeforeEvent } from '@minecraft/server';
import {
    ActionFormData,
    ActionFormResponse,
    MessageFormData,
    ModalFormData,
} from '@minecraft/server-ui';



/**
 * A modular command builder for creating custom commands that can be invoked later on at anytime.
 * Handles command registration, argument parsing, and UI generation for players.
 */
export class CommandBuilder<T> {
    private static readonly commands: Command<any>[] = [];
    private static readonly log = Logger.getLogger('CommandBuilder');
    private static readonly uiCooldowns = new Map<string, number>();

    static {
        world.beforeEvents.itemUse.subscribe(this.onItemUse.bind(this));
        system.afterEvents.scriptEventReceive.subscribe(this.onScriptEvent.bind(this));
    }

    private readonly args: CommandArg<any>[] = [];
    private readonly acceptedSources: CommandSource[] = [];
    private _order = 0;
    private _condition?: (sources: { player?: Player; entity?: Entity; block?: Block }) => boolean;
    private _description = '';

    constructor(private readonly id: string) { }


    //#region Builder

    public forPlayer() {
        this.acceptedSources.push(CommandSource.Player); return this;
    }

    public forEntity() {
        this.acceptedSources.push(CommandSource.Entity); return this;
    }

    public forBlock() {
        this.acceptedSources.push(CommandSource.Block); return this;
    }

    public order(order: number) {
        this._order = order; return this;
    }

    public condition(condition: (sources: { player?: Player; entity?: Entity; block?: Block }) => boolean) {
        this._condition = condition; return this;
    }

    public description(description: string) {
        this._description = description; return this;
    }

    public withNumber(name: string, required = false, opts?: CommandArgOpts<number>) {
        this.args.push({
            name,
            parser: (args, i) => CommandBuilder.parseNumberArg(name, args, i),
            required,
            type: ArgumentType.Number,
            ...opts
        });
        return this;
    }

    public withColor(name: string, required = false, opts?: CommandArgOpts<string>) {
        this.args.push({
            name,
            parser: (args, i) => CommandBuilder.parseColorArg(name, args, i),
            required,
            type: ArgumentType.Color,
            ...opts
        });
        return this;
    }

    public withString(name: string, required = false, opts?: CommandArgOpts<string>) {
        this.args.push({
            name,
            parser: (args, i) => CommandBuilder.parseStringArg(name, args, i),
            required,
            type: ArgumentType.String,
            ...opts
        });
        return this;
    }

    public withEnum<E>(name: string, values: Map<string, E>, required = false, opts?: CommandArgOpts<E>) {
        this.args.push({
            name,
            parser: (args, i) => CommandBuilder.parseEnumArg(name, values, args, i),
            required,
            type: ArgumentType.Enum,
            values,
            ...opts
        });
        return this;
    }

    public withFlag(name: string, opts?: CommandArgOpts<boolean>) {
        this.args.push({
            name,
            parser: (args, i) => CommandBuilder.parseFlagArg(name, args, i),
            required: false,
            type: ArgumentType.Boolean,
            defaultValue: opts?.defaultValue ?? false,
            ...opts
        });
        return this;
    }

    public register(callback: (command: CommandEvent<T>) => void) {
        CommandBuilder.commands.push({
            callback,
            args: this.args,
            id: this.id,
            acceptedSources: this.acceptedSources,
            description: this._description,
            order: this._order,
            condition: this._condition,
        });
    }



    //#region Handlers

    private static async onItemUse(event: ItemUseBeforeEvent) {
        if (event.source.typeId !== 'minecraft:player') return;
        const player = event.source as Player;
        if (event.itemStack.typeId !== 'minecraft:stick' || !player.isSneaking) return;
        
        const lastTick = this.uiCooldowns.get(player.id) ?? -Infinity;
        if (system.currentTick - lastTick < 5) return;

        event.cancel = true;
        this.uiCooldowns.set(player.id, system.currentTick);
        await null; // Wait for next tick to show UI
        this.showUi(player);
    }

    private static onScriptEvent(event: ScriptEventCommandMessageAfterEvent) {
        if (!event.id.startsWith('mindustry:')) return;
        const cmdId = event.id.substring(10); // Remove prefix
        const cmd = this.commands.find(c => c.id === cmdId);
        if (!cmd) return;

        // Simple tokenizer that respects quotes
        const tokens = (event.message.match(/[^\s"]+|"([^"]*)"/g) || []).map(s => s.replace(/^"|"$/g, ''));
        const data: any = {};
        
        // Apply defaults
        for (const arg of cmd.args) {
            if (arg.defaultValue !== undefined) data[arg.name] = arg.defaultValue;
        }

        // Parse arguments
        for (let i = 0; i < tokens.length; i++) {
            for (const arg of cmd.args) {
                const val = arg.parser(tokens, i);
                if (val !== undefined) {
                    data[arg.name] = val;
                    // If parser consumed a value token (next index), rely on parser matching logic
                    // Standard format "--arg value" consumes 2 tokens unless boolean
                    // Our crude iteration here assumes argument parsing logic is robust or non-overlapping
                    break; 
                }
            }
        }

        try {
            cmd.callback({
                data,
                sourceEntity: event.sourceEntity,
                sourceBlock: event.sourceBlock
            });
        } catch (e) {
            this.log.error(`Error executing command ${cmdId}: ${e}`);
        }
    }

    private static showUi(player: Player) {
        const filtered = this.commands
            .filter((c) => c.acceptedSources.length === 0 || !c.acceptedSources.includes(CommandSource.Block))
            .filter((c) => {
                if (!c.condition) return true;
                return c.condition({ player });
            })
            .sort((a, b) => b.order - a.order || a.id.localeCompare(b.id));

        const main = new ActionFormData().title('Dev UI');
        for (const cmd of filtered) main.button(cmd.id);

        main.show(player).then((resp: ActionFormResponse) => {
            if (resp.selection === undefined) return;
            this.runOrPrompt(filtered[resp.selection], player);
        });
    }

    private static runOrPrompt(cmd: Command<any>, player: Player) {
        if (cmd.args.length === 0) {
            new MessageFormData()
                .title(cmd.id)
                .body(cmd.description || 'Execute command?')
                .button1('Execute')
                .button2('Cancel')
                .show(player).then((resp) => {
                    if (resp.selection === 0) player.runCommand(`scriptevent mindustry:${cmd.id}`);
                });
            return;
        }
        
        const modal = new ModalFormData().title(cmd.id).submitButton('Execute');
        if (cmd.description) { modal.label(cmd.description); modal.divider(); }

        for (const arg of cmd.args) {
            const label = arg.displayName || arg.name;
            if (arg.type === ArgumentType.Boolean) {
                modal.toggle(label, { tooltip: arg.description, defaultValue: arg.defaultValue as boolean });
            } else if (arg.type === ArgumentType.Enum) {
                const v = Array.from(arg.values!);
                const options = v.map(val => val[0]);
                let idx = v.findIndex(val => val[1] === arg.defaultValue);
                if (!arg.required) { options.unshift('§7<select option>§r'); idx++; }
                modal.dropdown(label, options, { tooltip: arg.description, defaultValueIndex: Math.max(0, idx) });
            } else {
                modal.textField(label, '', { tooltip: arg.description, defaultValue: arg.defaultValue ? String(arg.defaultValue) : '' });
            }
        }

        modal.show(player).then((resp) => {
            if (resp.canceled || !resp.formValues) return;
            let cmdLine = `scriptevent mindustry:${cmd.id} `;
            let i = cmd.description ? 2 : 0;
            
            for (const arg of cmd.args) {
                const v = resp.formValues[i];
                if (arg.type === ArgumentType.Boolean) {
                     cmdLine += `--${arg.name} ${!!v ? 'true' : 'false'} `;
                } else if (v !== undefined && v !== null && v !== '') {
                    if (arg.type === ArgumentType.Enum) {
                        let idx = v as number;
                        if (!arg.required) { if (idx === 0) { i++; continue; } idx--; }
                        const argV = Array.from(arg.values!.values())[idx];
                        if (argV !== undefined) cmdLine += `--${arg.name} ${argV} `;
                    } else {
                        cmdLine += `--${arg.name} "${String(v).replace(/"/g, '\\"')}" `;
                    }
                }
                i++;
            }
            player.runCommand(cmdLine.trim());
        });
    }



    //#region Parsers

    private static parseNumberArg(name: string, args: string[], index: number) {
        if (!this.tokenMatches(name, args[index])) return undefined;
        if (args.length <= index + 1) { this.log.error(`Argument ${name} requires a number`); return; }
        const value = parseFloat(args[index + 1]);
        if (Number.isNaN(value)) { this.log.error(`Argument ${name} requires a valid number`); return; }
        return value;
    }

    private static parseColorArg(name: string, args: string[], index: number) {
        if (!this.tokenMatches(name, args[index])) return undefined;
        if (args.length <= index + 1) { this.log.error(`Argument ${name} requires a color`); return; }
        return this.parseColor(args[index + 1]);
    }

    private static parseStringArg(name: string, args: string[], index: number) {
        if (!this.tokenMatches(name, args[index])) return undefined;
        if (args.length <= index + 1) { this.log.error(`Argument ${name} requires a value`); return; }
        return args[index + 1];
    }

    private static parseEnumArg<E>(name: string, values: Map<string, E>, args: string[], index: number) {
        if (!this.tokenMatches(name, args[index])) return undefined;
        if (args.length <= index + 1) { this.log.error(`Argument ${name} requires a value`); return; }
        const key = args[index + 1];
        if (!values.has(key)) {
             for (const [_k, v] of values.entries()) if (String(v) === key) return v;
             return undefined;
        }
        return values.get(key);
    }

    private static parseFlagArg(name: string, args: string[], index: number) {
        if (!this.tokenMatches(name, args[index])) return undefined;
        return true;
    }

    private static tokenMatches(name: string, token: string) {
        return token && token.replace(/^(--?)/, '') === name;
    }

    private static parseColor(color: string) {
        try {
            if (color.startsWith('#')) return parseInt(color.slice(1), 16);
            if (color.startsWith('0x')) return parseInt(color.slice(2), 16);
            return parseInt(color);
        } catch { return undefined; }
    }
    
}



//#region Types

export interface Command<T> {
    callback: (command: T) => void;
    args: CommandArg<any>[];
    id: string;
    acceptedSources: CommandSource[];
    description: string;
    order: number;
    condition?: (sources: { player?: Player; entity?: Entity; block?: Block }) => boolean;
}

export interface CommandEvent<T> {
    data: T;
    sourceEntity?: Entity;
    sourceBlock?: Block;
}

interface CommandArg<T> extends CommandArgOpts<T> {
    name: string;
    type: ArgumentType;
    parser: (args: string[], index: number) => T | undefined;
    required: boolean;
    values?: Map<string, T>;
}

interface CommandArgOpts<T> {
    alias?: string;
    defaultValue?: T;
    displayName?: string;
    description?: string;
}

export enum CommandSource {
    Player,
    Entity,
    Block,
}

export enum ArgumentType {
    Boolean,
    Number,
    Color,
    String,
    Enum,
}
