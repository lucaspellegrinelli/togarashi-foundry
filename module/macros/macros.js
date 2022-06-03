import { waitListener } from "../utils/htmlUtilities.js";
import { guarda_calc } from "../core/togarashiRolls.js";
import { calculateDamage } from "../core/togarashiDamageCalc.js";
import { createAreaOfEffect } from "../utils/uiEffects.js";
import TogarashiAttackDialogForm from "../forms/TogarashiAttackDialogForm.js";

export const customizableAttack = async () => {
    const casterInfo = getCasterInfo();
    if (!casterInfo.targetActor) return;

    let lowerRange = casterInfo.targetActor.getFullStat("lowerRange");
    let upperRange = casterInfo.targetActor.getFullStat("upperRange");

    const playerWeapon = casterInfo.targetActor.getEquippedWeapon();
    if (playerWeapon) {
        lowerRange += playerWeapon.lowerRange;
        upperRange += playerWeapon.upperRange;
    }

    createAreaOfEffect(casterInfo.targetToken.center, lowerRange, "#00ff00");

    if (lowerRange != upperRange)
        createAreaOfEffect(casterInfo.targetToken.center, upperRange, "#ffff00");

    game.user.updateTokenTargets();
    const targetInfo = await waitForTargetSelection(casterInfo.targetActor, () => canExitTrigger);
    if (!targetInfo.targetActor) return;

    const options = await openAttackDialogBox(
        casterInfo.targetActor.data.name,
        targetInfo.targetActor.data.name,
        casterInfo.targetActor
    );

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

const waitForTargetSelection = async (prevSelectedActor) => {
    let canExitTrigger = false;
    new Promise(async () => {
        const element = document.querySelector("html");
        await new Promise(r => setTimeout(r, 100));
        await waitListener(element, "click");
        canExitTrigger = true;
    }).then();

    let info = getTargetedActorToken();

    while (!info.targetActor || info.targetActor.data._id == prevSelectedActor.data._id) {
        await new Promise(r => setTimeout(r, 100));
        if (canExitTrigger) break;
        info = getTargetedActorToken();
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

const getTargetedActorToken = () => {
    const targetToken = Array.from(game.user.targets)[0];
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

export const openAttackDialogBox = async (actorName, targetName, actor) => {
    return new Promise(resolve => {
        new TogarashiAttackDialogForm(actorName, targetName, actor, resolve).render(true);
    });
};
