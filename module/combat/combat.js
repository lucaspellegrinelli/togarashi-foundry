export default class TogarashiCombat extends Combat {
    // _sortCombatants(a, b) {
    //     const dataA = a.actor.data.data;
    //     const dataB = b.actor.data.data;
    // }

    // _prepareCombatant(c, scene, players, settings={}) {
    //     let combatant = super._prepareCombatant(c, scene, players, settings);
    //     return combatant;
    // }

    // async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt) {
    //     await super.rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt);
    //     return this.update({ turn: 0 });
    // }

    // async startCombat() {
    //     await this.setupTurns();
    //     return super.startCombat();
    // }

    async nextRound() {
        // console.log(this.combatants);
        return this.update({ round: this.round + 1, turn: 0 });
    }

    async nextTurn() {
        this.combatant.actor.tickStatusMods();
        super.nextTurn();
    }
}
