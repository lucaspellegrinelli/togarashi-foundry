export const openDialogBox = async (title, template) => {
    const html = await renderTemplate(template, {});
    return new Promise(resolve => {
        const data = {
            title: title,
            content: html,
            buttons: {
                normal: {
                    label: game.i18n.localize("togarashi.dialogBox.normal"),
                    callback: html => resolve(processFormResponse(html[0].querySelector("form")))
                },
                cancel: {
                    label: game.i18n.localize("togarashi.dialogBox.cancel"),
                    callback: () => resolve({ cancelled: true })
                }
            },
            default: "normal",
            close: () => resolve({ cancelled: true })
        };

        new Dialog(data, null).render(true);
    });
};

const processFormResponse = form => {
    const formEntries = new FormData(form).entries();
    const formData = Object.assign(...Array.from(formEntries, ([name, value]) => ({[name]: value})));
    return formData;
};
