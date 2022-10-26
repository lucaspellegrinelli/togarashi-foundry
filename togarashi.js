import { togarashi } from "./module/config.js";
import TogarashiItemSheet from "./module/sheets/TogarashiItemSheet.js";
import TogarashiCharacterSheet from "./module/sheets/TogarashiCharacterSheet.js";
import TogarashiCombat from "./module/combat/combat.js";
import TogarashiCombatTracker from "./module/combat/combatTracker.js";
import TogarashiCombatant from "./module/combat/combatant.js";
import TogarashiCombatantConfig from "./module/combat/combatantConfig.js";
import TogarashiItem from "./module/objects/TogarashiItem.js";
import TogarashiActor from "./module/objects/TogarashiActor.js";
import TogarashiHotbar from "./module/components/TogarashiHotbar.js";
import TogarashiToken from "./module/components/TogarashiToken.js";
import TogarashiFormulaEditor from "./module/forms/TogarashiFormulaEditor.js";
import TogarashiWeaponBaseStatEditor from "./module/forms/TogarashiWeaponBaseStatEditor.js";
import TogarashiAuraCostEditor from "./module/forms/TogarashiAuraCostEditor.js";
import * as Macros from "./module/macros/macros.js";

import { executeDamageFromAttack, setAuraShieldUsage, setWeaponBlockUsage } from "./module/core/togarashiDamageExec.js";
import { encodeObject } from "./module/utils/crypto.js";

async function preloadHandlebarsTemplates() {
    const templatePaths = [
        "systems/togarashi/templates/character/partials/aura-list.html",
        "systems/togarashi/templates/character/partials/char-info.html",
        "systems/togarashi/templates/character/partials/stats-table.html",
        "systems/togarashi/templates/character/partials/items-table.html",
        "systems/togarashi/templates/character/partials/modifiers-table.html"
    ];

    return loadTemplates(templatePaths);
};

function registerSystemSettings() {
    game.settings.registerMenu("togarashi", TogarashiFormulaEditor.SETTING, {
        name: "SETTINGS.formulaEditor.name",
        label: "SETTINGS.formulaEditor.label",
        hint: "SETTINGS.formulaEditor.hint",
        icon: "fas fa-calculator",
        type: TogarashiFormulaEditor,
        restricted: true
    });

    game.settings.register("togarashi", TogarashiFormulaEditor.SETTING, {
        name: "SETTINGS.formulaEditor.name",
        hint: "SETTINGS.formulaEditor.hint",
        scope: "world",
        type: Object,
        config: false,
        default: encodeObject({
            upperGuardDamageCalc: "@{dano-suc} * @{suc-cima}",
            lowerGuardDamageCalc: "floor(@{dano-suc} * @{suc-baixo} * 0.5)",
            totalDamageCalc: "@{dano-cima} + @{dano-baixo}",
            defenseWeaponResistDamageCalc: "floor(@{dano-bloqueado-arma} * @{suc-cima} + @{dano-bloqueado-arma} * @{suc-baixo} * 0.5)",
            attackWeaponResistDamageCalc: "floor(@{orig-dano-suc} * 0.5)",
            defenseArmorResistDamageCalc: "floor(@{dano-bloqueado-armadura} * @{suc-cima} + @{dano-bloqueado-armadura} * @{suc-baixo} * 0.5)",
            dailyAuraCalc: "(@{energia-natural} + @{controle}) * 20"
        })
    });

    game.settings.registerMenu("togarashi", TogarashiWeaponBaseStatEditor.SETTING, {
        name: "SETTINGS.weaponBaseStats.name",
        label: "SETTINGS.weaponBaseStats.label",
        hint: "SETTINGS.weaponBaseStats.hint",
        icon: "fas fa-calculator",
        type: TogarashiWeaponBaseStatEditor,
        restricted: true
    });

    game.settings.register("togarashi",TogarashiWeaponBaseStatEditor.SETTING, {
        name: "SETTINGS.weaponBaseStats.name",
        hint: "SETTINGS.weaponBaseStats.hint",
        scope: "world",
        type: Object,
        config: false,
        default: encodeObject({
            
        })
    });

    game.settings.registerMenu("togarashi", TogarashiAuraCostEditor.SETTING, {
        name: "SETTINGS.auraCostEditor.name",
        label: "SETTINGS.auraCostEditor.label",
        hint: "SETTINGS.auraCostEditor.hint",
        icon: "fas fa-calculator",
        type: TogarashiAuraCostEditor,
        restricted: true
    });

    game.settings.register("togarashi",TogarashiAuraCostEditor.SETTING, {
        name: "SETTINGS.auraCostEditor.name",
        hint: "SETTINGS.auraCostEditor.hint",
        scope: "world",
        type: Object,
        config: false,
        default: encodeObject({
            
        })
    });
}

//Easter Egg
Hooks.once("init", () => {
    console.log("Togarashi | Initializing Togarashi Game System");

    CONFIG.togarashi = togarashi;
    
    CONFIG.Item.documentClass = TogarashiItem;
    CONFIG.Actor.documentClass = TogarashiActor;
    CONFIG.Combat.documentClass = TogarashiCombat;
    CONFIG.Combatant.documentClass = TogarashiCombatant;
    CONFIG.Combatant.sheetClass = TogarashiCombatantConfig;
    
    CONFIG.ui.combat = TogarashiCombatTracker;
    CONFIG.ui.hotbar = TogarashiHotbar;

    CONFIG.Token.objectClass = TogarashiToken;
    
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("togarashi", TogarashiItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("togarashi", TogarashiCharacterSheet, { makeDefault: true });

    preloadHandlebarsTemplates();
    registerSystemSettings();
    
    game.togarashi = {
        macros: Macros
    }
});

Hooks.once("ready", () => {
    const tokenConfigurations = {
        displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
        actorLink: true,
        bar1: {
            attribute: "health"
        },
        displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER,
        brightSight: 100,
        dimSIght: 100,
        vision: true
    };
    
    game.settings.set("core", DefaultTokenConfig.SETTING, tokenConfigurations).then(() => {
        console.log("Togarashi | Initialized default token configurations")
    });
});

Hooks.once("socketlib.ready", () => {
	togarashi.socket = socketlib.registerSystem("togarashi");
	togarashi.socket.register("executeDamageFromAttack", executeDamageFromAttack);
    togarashi.socket.register("setWeaponBlockUsage", setWeaponBlockUsage);
    togarashi.socket.register("setAuraShieldUsage", setAuraShieldUsage);
});
