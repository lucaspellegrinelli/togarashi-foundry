export const executeDamageFromAttack = async (casterId, targetId, damageInfo) => {
    const caster = game.actors.get(casterId);
    const target = game.actors.get(targetId);

    target.applyDamage(damageInfo.totalDamage);
    target.applyWeaponDamage(damageInfo.defenseWeaponResistDamage);
    target.applyArmorDamage(damageInfo.defenseArmorResistDamage);
    caster.applyWeaponDamage(damageInfo.attackWeaponResistDamage);
};
