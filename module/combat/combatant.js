export default class TogarashiCombatant extends Combatant {
    _getInitiativeFormula(combatant) {
        // const combatantData = combatant.actor.data.data;
        return `2d10`;
    }
}
