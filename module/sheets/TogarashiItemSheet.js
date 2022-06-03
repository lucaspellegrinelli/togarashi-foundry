import { weaponStats } from "../data/weaponStats.js";

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

    // activateListeners(html) {
    //     if (this.isEditable) {
    //         html.find("#weapon-type").change(ev => this._onEditWeaponType(ev));
    //     }
    // }

    // _onEditWeaponType(event) {
    //     event.preventDefault();
    //     const baseData = super.getData().data.data;
    //     this.item.update({ "data.damageType": weaponStats[baseData.type].damageType });
    //     this.item.update({ "data.secondaryDamageType": weaponStats[baseData.type].secondaryDamageType });
    // }
}
