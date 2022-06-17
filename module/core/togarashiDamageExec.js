import { calculateDamage } from "../core/togarashiDamageCalc.js";

export const executeDamageFromAttack = async (config) => {
    const attackInfo = config.attackInfo;
    const damageTypes = config.damageTypes;
    const damage = config.damage;
    const target = config.target;
    const defenseEquippedWeapon = config.defenseEquippedWeapon;
    const defenseEquippedArmor = config.defenseEquippedArmor;
    const applyEffects = config.applyEffects;
    const casterInfo = config.casterInfo;

    const damageInfo = calculateDamage({
        upperSucesses: attackInfo.upper,
        lowerSuccesses: attackInfo.lower,
        damageTypes: damageTypes,
        damagePerSuccess: damage,
        defenseForce: target.getFullStat("force"),
        auraShield: target.getAuraShieldBlock(),
        defenseWeaponBlock: (defenseEquippedWeapon && target.isUsingWeaponBlock()) ? defenseEquippedWeapon.block : 0,
        armorDefenseBlock: defenseEquippedArmor ? defenseEquippedArmor.block : 0,
        otherDefenseBlock: target.getFullStat("block")
    });

    if (applyEffects) {
        target.applyDamage(damageInfo.totalDamage);
        target.applyWeaponDamage(damageInfo.defenseWeaponResistDamage);
        target.applyArmorDamage(damageInfo.defenseArmorResistDamage);
        casterInfo.targetActor.applyWeaponDamage(damageInfo.attackWeaponResistDamage);
    }

    const template = "systems/togarashi/templates/chat/attack-info.html";
    const allGMIds = Array.from(game.users).filter(user => user.isGM).map(user => user.data._id);

    await ChatMessage.create({
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: casterInfo.targetActor }),
        whisper: allGMIds,
        content: await renderTemplate(template, {
            attackInfo: attackInfo,
            damageInfo: damageInfo,
            isGM: game.user.isGM
        })
    });
};
