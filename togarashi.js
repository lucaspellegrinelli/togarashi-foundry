import { togarashi } from "./module/config.js";
import TogarashiItemSheet from "./module/sheets/TogarashiItemSheet.js";
import TogarashiCharacterSheet from "./module/sheets/TogarashiCharacterSheet.js";
import TogarashiCombat from "./module/combat/combat.js";
import TogarashiCombatTracker from "./module/combat/combatTracker.js";
import TogarashiCombatant from "./module/combat/combatant.js";
import TogarashiCombatantConfig from "./module/combat/combatantConfig.js";
import TogarashiItem from "./module/objects/TogarashiItem.js";
import TogarashiActor from "./module/objects/TogarashiActor.js";

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
    game.settings.register("togarashi", "showTaskCheckOptions", {
        config: true,
        scope: "client",
        name: "SETTINGS.testSetting.name",
        hint: "SETTINGS.testSetting.label",
        type: String,
        default: "test"
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
    
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("togarashi", TogarashiItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("togarashi", TogarashiCharacterSheet, { makeDefault: true });

    preloadHandlebarsTemplates();
    registerSystemSettings();
});
