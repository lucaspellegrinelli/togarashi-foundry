export const executeDamageFromAttack = async (casterId, targetId, attackInfo, damageInfo, applyEffects) => {
    const caster = game.actors.get(casterId);
    const target = game.actors.get(targetId);

    if (applyEffects) {
        target.applyDamage(damageInfo.totalDamage);
        target.applyWeaponDamage(damageInfo.defenseWeaponResistDamage);
        target.applyArmorDamage(damageInfo.defenseArmorResistDamage);
        caster.applyWeaponDamage(damageInfo.attackWeaponResistDamage);
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
