import TogarashiCombatantConfig from "./combatantConfig.js";

export default class TogarashiCombatTracker extends CombatTracker {
    // get template() {
    //     "systems/togarashi/templates/combat/combat-tracker.html";
    // }

    _onConfigureCombatant(li) {
        const combatant = this.viewed.combatants.get(li.data("combatant-id"));
        new TogarashiCombatantConfig(combatant, {
            top: Math.min(li[0].offsetTop, window.innerHeight - 350),
            left: window.innerWidth - 720,
            width: 400
        }).render(true);
    }
}
