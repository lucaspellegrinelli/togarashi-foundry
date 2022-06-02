import { openDialogBox } from "../utils/dialogBox.js";
import { togarashi } from "../config.js";
import { guarda_calc } from "../core/togarashiRolls.js";
import { calculateDamage } from "../core/togarashiDamageCalc.js";

export const rangedAttack = async () => {
    const info = getInfo();
    const speaker = ChatMessage.implementation.getSpeaker();
    console.log(speaker);
    const token = canvas.tokens.get(speaker.token);
    const data = {
        t: "circle",
        user: game.user.id,
        distance: 2,
        direction: 0,
        x: token.center.x,
        y: token.center.y,
        buttonMode: true,
        fillColor: "green",
        //texture: 'assets/textures/smoke_texture.webp'
    }
    
    const template = await canvas.scene.createEmbeddedDocuments('MeasuredTemplate', [data]);
    var element = document.querySelector("html");
    console.log(template);
    await waitListener(element,"click");
    await canvas.scene.deleteEmbeddedDocuments('MeasuredTemplate', [template[0].id])
}

function waitListener(element, listenerName) {
    return new Promise(function (resolve, reject) {
        var listener = event => {
            element.removeEventListener(listenerName, listener);
            resolve(event);
        };
        element.addEventListener(listenerName, listener);
    });
}

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
            let damage = info.userActor.getFullStat("force", options.useWeaponStats) + options.damage;
            let modifier = info.userActor.getFullStat("accuracy", options.useWeaponStats) + options.accuracy;
            let critical = info.userActor.getFullStat("critical", options.useWeaponStats) + options.critical;
            let damageTypes = [];
            
            if (options.useWeaponStats) {
                const equippedWeapon = info.userActor.getEquippedWeapon();
                if (equippedWeapon) {
                    const weaponStats = equippedWeapon.itemStatsCalc();
                    damage += weaponStats.damage;
                    modifier += weaponStats.accuracy;
                    critical += weaponStats.critical;
                    damageTypes = equippedWeapon.getDamageTypes();
                }
            }

            // Calculate successes in each guard
            const attackInfo = await guarda_calc(info.userActor, diceCount, guardLow, guardHigh, modifier, critical);
            
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
                speaker: ChatMessage.getSpeaker({ actor: info.userActor }),
                content: await renderTemplate(template, {
                    attackInfo: attackInfo,
                    damageInfo: damageInfo,
                    isGM: game.user.isGM
                })
            };

            ChatMessage.create(chatData);
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
