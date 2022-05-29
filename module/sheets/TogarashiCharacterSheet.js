import { itemStatsCalc } from "../core/itemTotalStatsCalc.js";

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
            data: mergeObject(baseData.actor.data.data, this.getExtraStats()),
            config: CONFIG.togarashi,
            items: baseData.items,
            weapons: baseData.items.filter(item => item.type == "weapon").map(itemStatsCalc),
            armors: baseData.items.filter(item => item.type == "armor").map(itemStatsCalc),
            genericItems: baseData.items.filter(item => item.type == "generic").map(itemStatsCalc)
        };

        console.log(sheetData);

        return sheetData;
    }

    getExtraStats() {
        const baseData = super.getData();

        const experience = baseData.actor.data.data.experience;
        const resistence = baseData.actor.data.data.resistence.base + baseData.actor.data.data.resistence.modifier;
        const dexterity = baseData.actor.data.data.dexterity.base + baseData.actor.data.data.dexterity.modifier;

        return {
            guardLow: resistence + experience,
            guardHigh: resistence + dexterity + experience
        }
    }
}
