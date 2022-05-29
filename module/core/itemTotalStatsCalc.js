import { weaponStats } from "../data/weaponStats.js";
import { materialStats } from "../data/materialStats.js";
import { armorStats } from "../data/armorStats.js";

export const itemStatsCalc = (itemData, baseWeaponDurability=100) => {
    let result = { };
    if (itemData.type == "weapon")
        result = weaponStatsCalc(itemData, baseWeaponDurability);
    else if (itemData.type == "armor")
        result = armorStatsCalc(itemData);
    else if (itemData.type == "generic")
        result = genericItemStatsCalc(itemData);

    result.name = itemData.name;
    result._id = itemData._id;
    return result;
};

export const weaponStatsCalc = (itemData, baseWeaponDurability=100) => {
    const material = itemData.data.material;
    const materialBonuses = materialStats[material];

    const weaponType = itemData.data.type;
    const weaponTypeBonuses = weaponStats[weaponType];

    const modDamage = itemData.data.damage || 0;
    const modWeight = itemData.data.weight || 0;
    const modAccuracy = itemData.data.accuracy || 0;
    const modCritical = itemData.data.critical || 0;
    const modDurability = itemData.data.durability || 0;
    const modBlock = itemData.data.block || 0;

    return {
        damage: modDamage + weaponTypeBonuses.damage + materialBonuses.damage,
        weight: modWeight + weaponTypeBonuses.weight + materialBonuses.weight,
        accuracy: modAccuracy + weaponTypeBonuses.accuracy + materialBonuses.accuracy,
        critical: modCritical + weaponTypeBonuses.critical + materialBonuses.critical,
        durability: modDurability + materialBonuses.durability + baseWeaponDurability,
        block: modBlock + materialBonuses.block
    };
};

export const armorStatsCalc = itemData => {
    const material = itemData.data.material;
    const armorType = itemData.data.type;
    const armorTypeBonuses = armorStats[material][armorType];

    const modWeight = itemData.data.weight || 0;
    const modBlock = itemData.data.block || 0;

    return {
        weight: modWeight + armorTypeBonuses.weight,
        block: modBlock + armorTypeBonuses.block,
    }
};

export const genericItemStatsCalc = itemData => {
    return {
        weight: itemData.data.weight || 0
    }
};
