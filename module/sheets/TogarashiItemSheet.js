export default class TogarashiItemSheet extends ItemSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 530,
            height: 340,
            classes: [ "togarashi", "sheet", "item" ]
        });
    }

    get template() {
        return `systems/togarashi/templates/sheets/${this.item.data.type}-sheet.html`;
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.togarashi;
        return data;
    }
}
