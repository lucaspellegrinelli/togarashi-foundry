import { togarashi } from "../config.js";

export default class TogarashiAttackDialogForm extends FormApplication {
    constructor(actorName="actor", actor=undefined, callback=undefined) {
        super();

        this.actor = actor;
        this.actorName = actorName;
        this.callback = callback;
        
        this.data = {
            auraShieldAura: "normal",
            auraShieldType: "specific"
        };
      }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            // height: 480,
            width: 720,
            popOut: true,
            template: "systems/togarashi/templates/dialogboxes/customize-aura-shield.html",
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
            // html.find(".change-obj").change(ev => this._onEditObject(ev));
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
}
