export const openDialogBox = async (title, template, data={}) => {
    const html = await renderTemplate(template, data);
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

        const dialog = new Dialog(data, {
            tabs: [{
				navSelector: ".tabs",
				contentSelector: ".tabs-body",
				initial: "powers"
			}]
        }).render(true);
    });
};

const processFormResponse = form => {
    const formEntries = new FormData(form).entries();
    const formData = Object.assign(...Array.from(formEntries, ([name, value]) => ({[name]: value})));

    Array.from(form.getElementsByTagName("input")).forEach(inputDOM => {
        const name = inputDOM.attributes["name"].value;
        const type = inputDOM.attributes["type"].value;

        if (type == "number") {
            formData[name] = parseInt(inputDOM.attributes["value"].value);
        } else if (type == "text") {
            formData[name] = inputDOM.attributes["value"].value;
        } else if (type == "checkbox") {
            formData[name] = inputDOM.checked;
        }
    });

    return formData;
};
