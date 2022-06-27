import TogarashiItem from "../objects/TogarashiItem.js";

export default class TogarashiCharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 1000,
            height: 650,
            template: `systems/togarashi/templates/character/character-sheet.html`,
            // tabs: [{
			// 	navSelector: ".sheet-tabs",
			// 	contentSelector: ".sheet-body",
			// 	initial: "powers"
			// }],
            classes: [ "togarashi", "sheet", "character" ]
        });
    }

    itemContextMenu = [
        {
            name: game.i18n.localize("togarashi.equip"),
            icon: '<i class="fas fa-child"></i>',
            condition: element => !element.hasClass("selected") && (element.data("item-type") == "weapon" || element.data("item-type") == "armor"),
            callback: element => {
                const item = this.actor.items.get(element.data("item-id"));
                
                if (item.data.type == "weapon") {
                    this.actor.update({ "data.equippedItems.weapon": item.data._id });
                } else if (item.data.type == "armor") {
                    this.actor.update({ "data.equippedItems.armor": item.data._id });
                }
            }
        },
        {
            name: game.i18n.localize("togarashi.unequip"),
            icon: '<i class="fas fa-child"></i>',
            condition: element => element.hasClass("selected") && (element.data("item-type") == "weapon" || element.data("item-type") == "armor"),
            callback: element => {
                const item = this.actor.items.get(element.data("item-id"));
                
                if (item.data.type == "weapon") {
                    this.actor.update({ "data.equippedItems.weapon": "" });
                } else if (item.data.type == "armor") {
                    this.actor.update({ "data.equippedItems.armor": "" });
                }
            }
        },
        {
            name: game.i18n.localize("togarashi.see"),
            icon: '<i class="fas fa-edit"></i>',
            callback: element => {
                const item = this.actor.items.get(element.data("item-id"));
                item.sheet.render(true);
            }
        },
        {
            name: game.i18n.localize("togarashi.delete"),
            icon: '<i class="fas fa-trash"></i>',
            callback: element => {
                const baseData = super.getData().data.data;
                const equipedWeaponId = baseData.equippedItems.weapon;
                const equippedArmorId = baseData.equippedItems.armor;

                if (equipedWeaponId == element.data("item-id")) {
                    this.actor.update({ "data.equippedItems.weapon": "" });
                } else if (equippedArmorId == element.data("item-id")) {
                    this.actor.update({ "data.equippedItems.armor": "" });
                }
                
                this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
            }
        }
    ];

    modifiersContextMenu = [
        {
            name: game.i18n.localize("togarashi.delete"),
            icon: '<i class="fas fa-trash"></i>',
            callback: element => {
                const id = element.data("change-index");
                const array = element.data("change-array");
                const currentList = this.getData().data[array];
                currentList.splice(id, 1);
                this.actor.update({ [`data.${array}`]: currentList });
            }
        }
    ];

    get template() {
        return `systems/togarashi/templates/character/character-sheet.html`;
    }

    getData() {
        const baseData = super.getData();

        baseData.actor.update({
            "data.dailyAura.max": baseData.actor.getMaxDailyAura()
        });

        let sheetData = {
            isGM: game.user.isGM,
            owner: this.actor.isOwner,
            editable: this.isEditable,
            actor: baseData.actor,
            data: baseData.actor.data.data,
            config: CONFIG.togarashi,
            items: baseData.items,
            guard: baseData.actor.characterStatsCalc(baseData.actor.data),
            weapons: baseData.items.filter(item => item.type == "weapon").map(TogarashiItem.itemStatsCalcFromObj),
            armors: baseData.items.filter(item => item.type == "armor").map(TogarashiItem.itemStatsCalcFromObj),
            genericItems: baseData.items.filter(item => item.type == "generic").map(TogarashiItem.itemStatsCalcFromObj),
            weightStats: {
                curr: baseData.items.map(TogarashiItem.itemStatsCalcFromObj).reduce((a, b) => a + b.weight, 0),
                max: 5 * baseData.actor.getFullStat("force")
            }
        };

        return sheetData;
    }

    activateListeners(html) {
        super.activateListeners(html);

        if (this.isEditable) {
            new ContextMenu(html, ".item-card", this.itemContextMenu);
            new ContextMenu(html, ".modifiers-card", this.modifiersContextMenu);
            
            html.find(".add-mastery-button").click(this._onMasteryAdd.bind(this));
            html.find(".add-status-mod-button").click(this._onStatusModifierAdd.bind(this));

            html.find(".change-array-obj").change(ev => this._onEditArrayObject(ev));
            html.find(".change-obj").change(ev => this._onEditObject(ev));
        }
    }

    _onMasteryAdd(event) {
        event.preventDefault();
        this.actor.addMastery({ status: "health", weapon: "dagger", modifier: 0 });
        // const currentMasteryList = this.getData().data.masteries;
        // currentMasteryList.push({ status: "health", weapon: "dagger", modifier: 0 });
        // this.actor.update({ "data.masteries": currentMasteryList });
    }

    _onStatusModifierAdd(event) {
        event.preventDefault();
        this.actor.addStatusEffect({ status: "health", modifierType: "whileActive", modifier: 0, turns: 3 });
        // const currentStatusModList = this.getData().data.statusModifiers;
        // currentStatusModList.push({ status: "health", modifierType: "whileActive", modifier: 0, turns: 3 });
        // this.actor.update({ "data.statusModifiers": currentStatusModList });
    }

    // Helpers
    async _onEditObject(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const field = element.dataset.field;
        const value = element.dataset.dtype == "Number" ? Number(element.value) : element.value;
        this.actor.update({ [field]: value });
    }

    async _onEditArrayObject(event) {
        event.preventDefault(); 
    
        const element = event.currentTarget;
        const listRow = element.closest("tr");
    
        const index = listRow.dataset.changeIndex;
        const array = listRow.dataset.changeArray;
    
        const field = element.dataset.field;
        let value = element.value;
        if(element.dataset.dtype == "Number") value = Number(value);

        let currentArray = this.getData().data[array];
        currentArray[index] = mergeObject(currentArray[index], { [field]: value });
        this.actor.update({ [`data.${array}`]: currentArray });
    }
}
