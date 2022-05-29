export default class TogarashiCharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 840,
            height: 340,
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
            weapons: baseData.items.filter(({ type }) => type == "weapon")
        };

        return sheetData;
    }
}
