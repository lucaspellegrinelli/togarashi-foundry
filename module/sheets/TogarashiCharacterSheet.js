import { itemStatsCalc } from "../core/itemTotalStatsCalc.js";
import { characterStatsCalc } from "../core/characterTotalStatsCalc.js";

export default class TogarashiCharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 840,
            height: 450,
            template: `systems/togarashi/templates/sheets/character-sheet.html`,
            classes: [ "togarashi", "sheet", "character" ]
        });
    }

    get template() {
        return `systems/togarashi/templates/sheets/character-sheet.html`;
    }

    getData() {
        const baseData = super.getData();

        let sheetData = {
            owner: this.actor.isOwner,
            editable: this.isEditable,
            actor: baseData.actor,
            data: baseData.actor.data.data,
            config: CONFIG.togarashi,
            items: baseData.items,
            guard: characterStatsCalc(baseData.actor.data),
            weapons: baseData.items.filter(item => item.type == "weapon").map(itemStatsCalc),
            armors: baseData.items.filter(item => item.type == "armor").map(itemStatsCalc),
            genericItems: baseData.items.filter(item => item.type == "generic").map(itemStatsCalc),
            weightStats: {
                curr: baseData.items.map(itemStatsCalc).reduce((a, b) => a + b, 0),
                max: 5 * (baseData.actor.data.data.force.base + baseData.actor.data.data.force.modifier)
            }
        };

        return sheetData;
    }
}
