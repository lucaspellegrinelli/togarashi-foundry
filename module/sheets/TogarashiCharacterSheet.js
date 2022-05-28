export default class TogarashiCharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 530,
            height: 340,
            classes: [ "togarashi", "sheet", "character" ]
        });
    }

    get template() {
        return `systems/togarashi/templates/sheets/character-sheet.html`;
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.togarashi;
        data.weapons = data.items.filter(({ type }) => type == "weapon");
        return data;
    }
}
