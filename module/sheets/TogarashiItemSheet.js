import { weaponStats } from "../weaponStats.js";
import { materialStats } from "../materialStats.js";

export default class TogarashiItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 530,
            height: 340,
            template: `systems/togarashi/templates/sheets/weapon-sheet.html`,
            classes: [ "togarashi", "sheet", "item" ]
        });
    }

    get template() {
        return `systems/togarashi/templates/sheets/${this.item.data.type}-sheet.html`;
    }

    getData() {
        const baseData = super.getData();

        const weaponType = baseData.item.data.data.type;
        const weaponTypeAttributes = weaponStats[weaponType];
        baseData.item.data.data.damageType = weaponTypeAttributes.damageType;
        baseData.item.data.data.secondaryDamageType = weaponTypeAttributes.secondaryDamageType;

        let sheetData = {
            owner: this.item.isOwner,
            editable: this.isEditable,
            item: baseData.item,
            data: mergeObject(baseData.item.data.data, this.calculateTrueStats()),
            config: CONFIG.togarashi
        };

        return sheetData;
    }

    calculateTrueStats(baseWeaponDurability=100) {
        const baseData = super.getData();

        const weaponType = baseData.item.data.data.type;
        const material = baseData.item.data.data.material;

        const weaponTypeBonuses = weaponStats[weaponType];
        const materialBonuses = materialStats[material];

        const damage = baseData.item.data.data.damage;
        const weight = baseData.item.data.data.weight;
        const accuracy = baseData.item.data.data.accuracy;
        const critical = baseData.item.data.data.critical;
        const durability = baseData.item.data.data.durability;
        const block = baseData.item.data.data.block;

        return {
            trueDamage: damage + weaponTypeBonuses.damage + materialBonuses.damage,
            trueWeight: weight + weaponTypeBonuses.weight + materialBonuses.weight,
            trueAccuracy: accuracy + weaponTypeBonuses.accuracy + materialBonuses.accuracy,
            trueCritical: critical + weaponTypeBonuses.critical + materialBonuses.critical,
            trueDurability: durability + materialBonuses.critical + baseWeaponDurability,
            trueBlock: block + materialBonuses.critical,
        };
    }
}
