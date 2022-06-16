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
import * as Macros from "./module/macros/macros.js";

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
    game.settings.register("togarashi", "upperGuardDamageCalc", {
        config: true,
        scope: "client",
        name: "SETTINGS.upperGuardDamageCalc.name",
        hint: "SETTINGS.upperGuardDamageCalc.label",
        type: String,
        default: "@{dano-suc} * @{suc-cima}"
    });

    game.settings.register("togarashi", "lowerGuardDamageCalc", {
        config: true,
        scope: "client",
        name: "SETTINGS.lowerGuardDamageCalc.name",
        hint: "SETTINGS.lowerGuardDamageCalc.label",
        type: String,
        default: "floor(@{dano-suc} * @{suc-baixo} * 0.5)"
    });

    game.settings.register("togarashi", "totalDamageCalc", {
        config: true,
        scope: "client",
        name: "SETTINGS.totalDamageCalc.name",
        hint: "SETTINGS.totalDamageCalc.label",
        type: String,
        default: "@{dano-cima} + @{dano-baixo}"
    });

    game.settings.register("togarashi", "defenseWeaponResistDamageCalc", {
        config: true,
        scope: "client",
        name: "SETTINGS.defenseWeaponResistDamageCalc.name",
        hint: "SETTINGS.defenseWeaponResistDamageCalc.label",
        type: String,
        default: "floor(@{dano-bloqueado-arma} * @{suc-cima} + @{dano-bloqueado-arma} * @{suc-baixo} * 0.5)"
    });

    game.settings.register("togarashi", "attackWeaponResistDamageCalc", {
        config: true,
        scope: "client",
        name: "SETTINGS.attackWeaponResistDamageCalc.name",
        hint: "SETTINGS.attackWeaponResistDamageCalc.label",
        type: String,
        default: "floor(@{orig-dano-suc} * 0.5)"
    });

    game.settings.register("togarashi", "defenseArmorResistDamageCalc", {
        config: true,
        scope: "client",
        name: "SETTINGS.defenseArmorResistDamageCalc.name",
        hint: "SETTINGS.defenseArmorResistDamageCalc.label",
        type: String,
        default: "floor(@{dano-bloqueado-armadura} * @{suc-cima} + @{dano-bloqueado-armadura} * @{suc-baixo} * 0.5)"
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
