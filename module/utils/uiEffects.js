import { waitListener } from "./htmlUtilities.js";

export const createAreaOfEffect = async (position, range, color="#00ff00") => {
    const data = {
        t: "circle",
        user: game.user.id,
        distance: range,
        direction: 0,
        x: position.x,
        y: position.y,
        buttonMode: true,
        fillColor: color,
        //texture: "assets/textures/smoke_texture.webp"
    }
    
    const template = await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [data]);
    const element = document.querySelector("html");
    await waitListener(element, "click");
    await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", [template[0].id]);
};
