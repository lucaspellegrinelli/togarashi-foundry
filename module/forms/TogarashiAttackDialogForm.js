import { togarashi } from "../config.js";

export default class TogarashiAttackDialogForm extends FormApplication {
    constructor(actorName="actor", targetName="target", actor=undefined, callback=undefined) {
        super();

        this.actor = actor;
        this.weapon = actor?.getEquippedWeapon();

        this.actorName = actorName;
        this.targetName = targetName;

        this.callback = callback;
        
        this.data = {
            accuracy: 0,
            damage: 0,
            critical: 0,
            damageType: "none",
            secondaryDamageType: "none",
            advantageType: "none",
            applyEffects: true
        };

        this.editableData = {
            damageType: "none",
            secondaryDamageType: "none",
            accuracy: 0,
            damage: 0,
            critical: 0,
            advantageType: "none",
            useWeaponStats: true,
            useCharacterStats: true,
            applyEffects: true
        };

        this.processFinalStats();
      }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            // height: 480,
            width: 720,
            popOut: true,
            template: "systems/togarashi/templates/dialogboxes/customizable-attack.html",
            resizable: true,
            classes: [ "togarashi", "sheet", "dialog" ],
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
            html.find("#attack").click(this._onClickAttack.bind(this));
            html.find("#cancel").click(this._onClickCancel.bind(this));
        }
    }

    _onClickAttack(event) {
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

        this.editableData = mergeObject(this.editableData, { [field]: value });
        await this._updateObject(null, this.editableData);
        this.processFinalStats();
    }

    processFinalStats() {
        this.data.accuracy = this.editableData.accuracy;
        this.data.damage = this.editableData.damage;
        this.data.critical = this.editableData.critical;
        this.data.damageType = this.editableData.damageType;
        this.data.secondaryDamageType = this.editableData.secondaryDamageType;
        this.data.advantageType = this.editableData.advantageType;

        if (this.weapon && this.editableData.useWeaponStats) {
            this.data.accuracy += this.weapon.accuracy;
            this.data.damage += this.weapon.damage;
            this.data.critical += this.weapon.critical;
            this.data.damageType = this.weapon.damageType;
            this.data.secondaryDamageType = this.weapon.secondaryDamageType;
        }

        if (this.actor && this.editableData.useCharacterStats) {
            const actorForce = this.actor.getFullStat("force");
            // this.data.accuracy += this.actor.data.data.accuracy;
            this.data.accuracy += this.actor.getFullStat("accuracy");
            this.data.damage += this.actor.data.data.damage + actorForce;
        }
    }
}
