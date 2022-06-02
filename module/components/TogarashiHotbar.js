export default class TogarashiHotbar extends Hotbar {
    _getEntryContextOptions() {
        const options = [
            {
                name: "MACRO.Remove",
                icon: '<i class="fas fa-times"></i>',
                condition: li => !!li.data("macro-id"),
                callback: li => game.user.assignHotbarMacro(null, Number(li.data("slot")))
            },
            {
                name: "MACRO.Delete",
                icon: '<i class="fas fa-trash"></i>',
                condition: li => {
                    const macro = game.macros.get(li.data("macro-id"));
                    return macro ? macro.isOwner : false;
                },
                callback: li => {
                    const macro = game.macros.get(li.data("macro-id"));
                    return Dialog.confirm({
                        title: `${game.i18n.localize("MACRO.Delete")} ${macro.name}`,
                        content: `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.localize("MACRO.DeleteWarning")}</p>`,
                        yes: macro.delete.bind(macro)
                    });
                }
            },
        ];

        if (game.user.isGM) {
            options.push({
                name: "MACRO.Edit",
                icon: '<i class="fas fa-edit"></i>',
                condition: li => {
                    const macro = game.macros.get(li.data("macro-id"));
                    return macro ? macro.isOwner : false;
                },
                callback: li => {
                    const macro = game.macros.get(li.data("macro-id"));
                    macro.sheet.render(true);
                }
            })
        }

        return options;
    }

    async _onClickMacro(event) {
        event.preventDefault();
        const li = event.currentTarget;

        // Case 1 - create a new Macro
        if (li.classList.contains("inactive")) {
            if (game.user.isGM) {
                const macro = await Macro.create({ name: "New Macro", type: "chat", scope: "global" });
                await game.user.assignHotbarMacro(macro, Number(li.dataset.slot));
                macro.sheet.render(true);
            }
        }

        // Case 2 - trigger a Macro
        else {
            const macro = game.macros.get(li.dataset.macroId);
            return macro.execute();
        }
    }
}
