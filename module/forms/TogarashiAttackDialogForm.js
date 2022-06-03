import { togarashi } from "../config.js";

export default class TogarashiAttackDialogForm extends FormApplication {
    constructor(actorName="actor", targetName="target") {
        super();
        
        this.data = {
            actorName: actorName,
            targetName: targetName,
            damageType: "none",
            secondaryDamageType: "none",
            accuracy: 0,
            damage: 0,
            critical: 0,
            useWeaponStats: false,
            applyEffects: false,
            advantageType: "none",
            changeDamageType: false
        };
      }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            height: 720,
            width: 800,
            popOut: true,
            template: "systems/togarashi/templates/dialogboxes/customizable-attack.html",
            resizable: true
        });
    }

    getData() {
        return {
            config: togarashi,
            data: this.data,
            ...this
        }
    }

    activateListeners(html) {
        if (this.isEditable) {
            html.find(".change-obj").change(ev => this._onEditObject(ev));
        }
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
