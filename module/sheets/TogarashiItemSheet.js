import { weaponStats } from "../data/weaponStats.js";
import { materialStats } from "../data/materialStats.js";
import { armorStats } from "../data/armorStats.js";

export default class TogarashiItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 530,
            height: 340,
            template: `systems/togarashi/templates/sheets/items/weapon-sheet.html`,
            classes: [ "togarashi", "sheet", "item" ]
        });
    }

    get template() {
        return `systems/togarashi/templates/sheets/items/${this.item.data.type}-sheet.html`;
    }

    isWeapon() {
        return this.item.data.type == "weapon";
    }

    isArmor() {
        return this.item.data.type == "armor";
    }

    isGeneric() {
        return this.item.data.type == "generic";
    }

    getData() {
        const baseData = super.getData();

        if (this.isWeapon()) {
            const weaponType = baseData.item.data.data.type;
            const weaponTypeAttributes = weaponStats[weaponType];
            baseData.item.data.data.damageType = weaponTypeAttributes.damageType;
            baseData.item.data.data.secondaryDamageType = weaponTypeAttributes.secondaryDamageType;
        }

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
        if (this.isGeneric()) {
            return { }
        }

        const baseData = super.getData();

        const material = baseData.item.data.data.material;
        const materialBonuses = materialStats[material];

        const damage = baseData.item.data.data.damage;
        const weight = baseData.item.data.data.weight;
        const accuracy = baseData.item.data.data.accuracy;
        const critical = baseData.item.data.data.critical;
        const durability = baseData.item.data.data.durability;
        const block = baseData.item.data.data.block;
        
        if (this.isWeapon()) {
            const weaponType = baseData.item.data.data.type;
            const weaponTypeBonuses = weaponStats[weaponType];

            return {
                trueDamage: damage + weaponTypeBonuses.damage + materialBonuses.damage,
                trueWeight: weight + weaponTypeBonuses.weight + materialBonuses.weight,
                trueAccuracy: accuracy + weaponTypeBonuses.accuracy + materialBonuses.accuracy,
                trueCritical: critical + weaponTypeBonuses.critical + materialBonuses.critical,
                trueDurability: durability + materialBonuses.durability + baseWeaponDurability,
                trueBlock: block + materialBonuses.block,
            };
        } else if(this.isArmor()) {
            const armorType = baseData.item.data.data.type;
            const armorTypeBonuses = armorStats[material][armorType];

            return {
                trueWeight: weight + armorTypeBonuses.weight,
                trueBlock: block + armorTypeBonuses.block,
            }
        }

        return { }
    }
}
