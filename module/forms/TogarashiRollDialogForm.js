import { togarashi } from "../config.js";

export default class TogarashiRollDialogForm extends FormApplication {
    constructor(actorName = "actor", actor = undefined, callback = undefined) {
        super();

        this.actor = actor;
        this.actorName = actorName;
        this.callback = callback;

        this.data = {
            numberDice: 1,
            difficulty: 6,
            modifier: 0,
        };
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            // height: 480,
            width: 720,
            popOut: true,
            template: "systems/togarashi/templates/dialogboxes/customize-roll.html",
            resizable: true,
            classes: ["togarashi", "sheet", "dialog"],
            tabs: [{
                navSelector: ".sheet-tabs",
                contentSelector: ".sheet-body",
                initial: "modifiers"
            }]
        });
    }

    getData() {
        return {
            config: togarashi,
            ...this
        }
    }

    activateListeners(html) {
        if (this.isEditable) {
            html.find(".change-obj").change(ev => this._onEditObject(ev));
            html.find("#use").click(this._onClickUse.bind(this));
            html.find("#cancel").click(this._onClickCancel.bind(this));
        }
    }

    _onClickUse(event) {
        event.preventDefault();
        this.callback(this.data);
        this.close();
    }

    _onClickCancel(event) {
        event.preventDefault();
        this.callback({ cancelled: true });
        this.close();
    }

    async _updateObject(event, formData) {
        Object.keys(formData).forEach(varname => this[varname] = formData[varname]);
        this.render();
    }

    async _onEditObject(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const field = element.dataset.field;

        let value = element.value;
        if (element.dataset.dtype == "Number") {
            value = Number(element.value);
        } else if (element.dataset.dtype == "Boolean") {
            value = element.checked;
        }

        this.data = mergeObject(this.data, { [field]: value });
        await this._updateObject(null, this.data);
    }
}
