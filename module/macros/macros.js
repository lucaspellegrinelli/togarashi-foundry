import { openDialogBox } from "../utils/dialogBox.js";
import { togarashi } from "../config.js";
import { guarda_calc } from "../core/togarashiRolls.js";
import { calculateDamage } from "../core/togarashiDamageCalc.js";
import { waitListener } from "../utils/htmlUtilities.js";
import { createAreaOfEffect } from "../utils/uiEffects.js";

export const customizableAttack = async () => {
    const casterInfo = getCasterInfo();
    if (!casterInfo.targetActor) return;

    createAreaOfEffect(casterInfo.targetToken.center, 1);

    const targetInfo = await waitForTargetSelection(casterInfo.targetActor);

    const title = game.i18n.localize("togarashi.attackDialogBox.title");
    const template = "systems/togarashi/templates/dialogboxes/customizable-attack.html";
    const dialogExtraData = {
        config: togarashi,
        actorName: casterInfo.targetActor.data.name,
        targetName: targetInfo.targetActor.data.name,
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
        const target = targetInfo.targetActor;
        const { guardLow, guardHigh } = target.characterStatsCalc();
        const diceCount = casterInfo.targetActor.getFullStat("dexterity");
        let damage = casterInfo.targetActor.getFullStat("force", options.useWeaponStats) + options.damage;
        let modifier = casterInfo.targetActor.getFullStat("accuracy", options.useWeaponStats) + options.accuracy;
        let critical = casterInfo.targetActor.getFullStat("critical", options.useWeaponStats) + options.critical;
        let damageTypes = [];
        
        if (options.useWeaponStats) {
            const equippedWeapon = casterInfo.targetActor.getEquippedWeapon();
            if (equippedWeapon) {
                const weaponStats = equippedWeapon.itemStatsCalc();
                damage += weaponStats.damage;
                modifier += weaponStats.accuracy;
                critical += weaponStats.critical;
                damageTypes = equippedWeapon.getDamageTypes();
            }
        }

        // Calculate successes in each guard
        const attackInfo = await guarda_calc(casterInfo.targetActor, diceCount, guardLow, guardHigh, modifier, critical);
        
        // Calculate damage
        const defenseEquippedArmor = target.getEquippedArmor();
        const damageInfo = calculateDamage({
            upperSucesses: attackInfo.upper,
            lowerSuccesses: attackInfo.lower,
            damageTypes: damageTypes,
            damagePerSuccess: damage,
            defenseForce: target.getFullStat("force"),
            auraShield: 0, // target.isUsingAuraShield ? aura shield : 0
            defenseWeaponBlock: 0, // target.isUsingWeaponBlock ? weapon
            armorDefenseBlock: defenseEquippedArmor ? defenseEquippedArmor.block : 0,
            otherDefenseBlock: target.getFullStat("block")
        });

        const template = "systems/togarashi/templates/chat/attack-info.html";
        const chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: casterInfo.targetActor }),
            content: await renderTemplate(template, {
                attackInfo: attackInfo,
                damageInfo: damageInfo,
                isGM: game.user.isGM
            })
        };

        ChatMessage.create(chatData);
    }
};

const waitForTargetSelection = async prevSelectedActor => {
    let info = getSelectedActorToken();
    while (info.targetActor.data._id == prevSelectedActor.data._id) {
        await waitListener(document.querySelector("html"), "click");
        info = getSelectedActorToken();
    }

    return info;
};

const getSelectedActorToken = () => {
    const speaker = ChatMessage.implementation.getSpeaker();
    const targetToken = canvas.tokens.get(speaker.token);
    return {
        targetToken: targetToken,
        targetActor: targetToken?.actor
    }
};

const getUserListOfActorsTokens = () => {
    const userId = game.user.id;
    const userSceneId = game.user.viewedScene;
    const userScene = game.scenes.get(userSceneId);
    const userSceneTokens = Array.from(userScene.data.tokens.values());
    const userTokens = userSceneTokens.filter(t => t.actor.data.permission[userId] > 0);
    const userActors = userTokens.map(t => t.actor);
    return { userTokens, userActors };
};

const getCasterInfo = () => {
    const { userTokens, userActors } = getUserListOfActorsTokens();

    if (userActors.length == 0) {
        ui.notifications.error(game.i18n.localize("togarashi.attackDialogBox.noActorError"));
        return { };
    } else if (userActors.length == 1) {
        return {
            targetToken: userTokens[0],
            targetActor: userActors[0]
        }
    } else {
        const { targetToken, targetActor } = getSelectedActorToken();
        if (targetToken) {
            return { targetToken, targetActor }
        } else {
            ui.notifications.error(game.i18n.localize("togarashi.attackDialogBox.multipleActorNoSelectedError"));
            return { };
        }
    }
};
