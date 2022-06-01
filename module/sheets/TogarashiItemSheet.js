export default class TogarashiItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 530,
            height: 530,
            classes: [ "togarashi", "sheet", "item" ]
        });
    }

    get template() {
        return `systems/togarashi/templates/items/${this.item.data.type}-sheet.html`;
    }

    getData() {
        const baseData = super.getData();

        console.log(this.item);

        let sheetData = {
            owner: this.item.isOwner,
            editable: this.isEditable,
            item: baseData.item,
            data: baseData.item.data.data,
            finalStats: this.item.itemStatsCalc(baseData.item.data),
            config: CONFIG.togarashi
        };

        return sheetData;
    }
}
