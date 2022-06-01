import { openDialogBox } from "../utils/dialogBox.js";
import { togarashi } from "../config.js";

export const customizableAttack = () => {
    const info = getInfo();
    
    if (info.actorsTargeted.length == 0) {
        ui.notifications.error("Nenhum token selecionado");
        return;
    }

    const title = "Ataque Customizável";
    const template = "systems/togarashi/templates/dialogboxes/customizable-attack.html";
    const dialogExtraData = {
        config: togarashi,
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

    openDialogBox(title, template, dialogExtraData).then(result => {
        if (!result.cancelled) {
            console.log(result);
        }
    });
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
