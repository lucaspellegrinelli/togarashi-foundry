import { decodeObject, encodeObject } from "../utils/crypto.js";

export default class TogarashiFormulaEditor extends FormApplication {
    constructor(...args) {
        super(...args);
        this.updatedData = {};
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            // height: 480,
            width: 720,
            popOut: true,
            template: "systems/togarashi/templates/dialogboxes/formula-editor.html",
            resizable: true,
            classes: [ "togarashi", "sheet", "dialog" ],
            tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "modifiers"
			}]
        });
    }

    static SETTING = "formulaEditor";

    static getFormula(name) {
        const formulas = decodeObject(game.settings.get("togarashi", TogarashiFormulaEditor.SETTING));
        return formulas[name];
    }

    getData() {
        const savedData = decodeObject(game.settings.get("togarashi", TogarashiFormulaEditor.SETTING));

        return {
            data: mergeObject(savedData, this.updatedData)
        }
    }

    activateListeners(html) {
        if (this.isEditable) {
            html.find(".change-obj").change(ev => this._onEditObject(ev));
            html.find("#apply").click(this._onClickApply.bind(this));
            html.find("#cancel").click(this._onClickCancel.bind(this));
        }
    }

    _onClickApply(event) {
        event.preventDefault();
        const prevData = decodeObject(game.settings.get("togarashi", TogarashiFormulaEditor.SETTING));
        const newData = encodeObject(mergeObject(prevData, this.updatedData));
        game.settings.set("togarashi", TogarashiFormulaEditor.SETTING, newData);
        this.close();
    }

    _onClickCancel(event) {
        event.preventDefault();
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

        this.updatedData = mergeObject(this.updatedData, { [field]: value });
        await this._updateObject(null, this.updatedData);
    }
};
