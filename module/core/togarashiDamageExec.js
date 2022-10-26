export const executeDamageFromAttack = async (casterId, targetId, attackInfo, damageInfo, damageTypes, applyEffects) => {
    // const caster = game.actors.get(casterId);
    // const target = game.actors.get(targetId);
    const caster = canvas.tokens.get(casterId).actor;
    const target = canvas.tokens.get(targetId).actor;

    if (applyEffects) {
        target.applyDamage(damageInfo.totalDamage);
        target.applyWeaponDamage(damageInfo.defenseWeaponResistDamage);
        target.applyArmorDamage(damageInfo.defenseArmorResistDamage);
        caster.applyWeaponDamage(damageInfo.attackWeaponResistDamage);

        if (damageTypes.includes("cut") && attackInfo.lower + attackInfo.upper >= 4) {
            target.applyBleeding();
        }

        target.setWeaponBlockUsage(false);
        target.setAuraShieldUsage(false, false, false);
    }

    const template = "systems/togarashi/templates/chat/attack-info.html";
    const allGMIds = Array.from(game.users).filter(user => user.isGM).map(user => user.data._id);

    await ChatMessage.create({
        user: allGMIds[0],
        speaker: ChatMessage.getSpeaker({ actor: caster }),
        whisper: allGMIds,
        content: await renderTemplate(template, {
            attackInfo: attackInfo,
            damageInfo: damageInfo,
            isGM: game.user.isGM
        })
    });
};

export const setWeaponBlockUsage = async (casterId, usage) => {
    const caster = canvas.tokens.get(casterId).actor;
    caster.setWeaponBlockUsage(usage);
};

export const setAuraShieldUsage = async (casterId, usage, fullBody, orangeAura) => {
    const caster = canvas.tokens.get(casterId).actor;
    caster.setAuraShieldUsage(usage, fullBody, orangeAura);
}
