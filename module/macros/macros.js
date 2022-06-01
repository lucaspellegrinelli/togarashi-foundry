import { openDialogBox } from "../utils/dialogBox.js";
import { togarashi } from "../config.js";
import { guarda_calc } from "../core/togarashiRolls.js";

export const customizableAttack = async () => {
    const info = getInfo();
    
    if (!info.userActor) {
        ui.notifications.error(game.i18n.localize("togarashi.attackDialogBox.noActorError"));
        return;
    }

    if (info.actorsTargeted.length == 0) {
        ui.notifications.error(game.i18n.localize("togarashi.attackDialogBox.noTargetError"));
        return;
    }

    const title = game.i18n.localize("togarashi.attackDialogBox.title");
    const template = "systems/togarashi/templates/dialogboxes/customizable-attack.html";
    const dialogExtraData = {
        config: togarashi,
        actorName: info.userActor.data.name,
        targetNames: info.actorsTargeted.map(a => a.data.name).join(", "),
        damageType: "none",
        secondaryDamageType: "none",
        accuracy: 0,
        damage: 0,
        critical: 0,
        useWeaponStats: false,
        applyEffects: false,
        advantageType: "none"
    };

    const options = await openDialogBox(title, template, dialogExtraData);

    if (!options.cancelled) {
        info.actorsTargeted.forEach(async target => {
            const { guardLow, guardHigh } = target.characterStatsCalc();
            const diceCount = info.userActor.getFullStat("dexterity");
            let modifier = info.userActor.getFullStat("accuracy", options.useWeaponStats) + options.accuracy;
            let critical = info.userActor.getFullStat("critical", options.useWeaponStats) + options.critical;
            
            if (options.useWeaponStats) {
                const equippedWeapon = info.userActor.getEquippedWeapon();
                if (equippedWeapon) {
                    const weaponStats = equippedWeapon.itemStatsCalc();
                    modifier += weaponStats.accuracy;
                    critical += weaponStats.critical;
                }
            }

            const attackInfo = await guarda_calc(info.userActor, diceCount, guardLow, guardHigh, modifier, critical);
        });
    }
};

const getInfo = () => {
    const userId = game.user.id;
    const userSceneId = game.user.viewedScene;
    const userScene = game.scenes.get(userSceneId);
    const userSceneTokens = Array.from(userScene.data.tokens.values());
    const userSceneActors = userSceneTokens.map(t => t.actor);
    const actorsTargeted = Array.from(game.user.targets).map(t => t?.actor);
    const userActor = userSceneActors.find(a => a.data.permission[userId] > 0);

    return {
        userId, userSceneId, userScene, userSceneTokens, userSceneActors,
        actorsTargeted, userActor
    }
};
