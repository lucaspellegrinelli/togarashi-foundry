export default class TogarashiItemSheet extends ItemSheet {
    get template() {
        return `systems/togarashi/templates/sheets/${this.item.data.type}-sheet.html`;
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.togarashi;
        return data;
    }
};
