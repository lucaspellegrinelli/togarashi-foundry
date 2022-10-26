import { auraStats } from "../data/auraStats.js";
import { resolveFormula } from "../utils/formulaParser.js";

import TogarashiFormulaEditor from "../forms/TogarashiFormulaEditor.js";

export default class TogarashiActor extends Actor {
    characterStatsCalc() {
        const experience = this.data.data.experience;
        // const resistence = this.data.data.resistence.base + this.data.data.resistence.modifier;
        // const dexterity = this.data.data.dexterity.base + this.data.data.dexterity.modifier;
        const resistence = this.getFullStat("resistence");
        const dexterity = this.getFullStat("dexterity");

        return {
            guardLow: dexterity + experience,
            guardHigh: resistence + dexterity + experience
        }
    };

    getApplyableMasteries() {
        const masteries = this.data.data.masteries;
        const equipedWeapon = this.getEquippedWeapon();
        if (!equipedWeapon) return [];
        return masteries.filter(mastery => mastery.weapon == equipedWeapon.type);
    }

    getStatusModWhileActive() {
        const statModifiers = this.data.data.statusModifiers;
        return statModifiers.filter(sm => sm.modifierType == "whileActive");
    }

    getPermanentStatusMods() {
        const statModifiers = this.data.data.statusModifiers;
        return statModifiers.filter(sm => sm.modifierType == "permanent");
    };

    tickStatusMods() {
        const permanentMods = this.getPermanentStatusMods();
        const actor = this;
        const actorData = this.data.data;

        permanentMods.forEach(mod => {
            if (typeof actorData[mod.status] == "object") {
                const currentStat = actorData[mod.status].base;
                actor.update({ [`data.${mod.status}.base`]: currentStat + mod.modifier });
            } else {
                const currentStat = actorData[mod.status];
                actor.update({ [`data.${mod.status}`]: currentStat + mod.modifier });
            }
        });
        
        const newStatsMods = this.data.data.statusModifiers.map(mod => ({ ...mod, turns: mod.turns - 1 })).filter(mod => mod.turns > 0);
        this.update({ ["data.statusModifiers"]: newStatsMods });
    }

    getActorStatsFormulas() {
        return {
            "@{forca}": this.data.data.force.base,
            "@{destreza}": this.data.data.dexterity.base,
            "@{resistencia}": this.data.data.resistence.base,
            "@{inteligencia}": this.data.data.intelligence.base,
            "@{foco}": this.data.data.focus.base,
            "@{intuicao}": this.data.data.intuition.base,
            "@{energia-natural}": this.data.data.naturalEnergy.base,
            "@{abertura}": this.data.data.opening.base,
            "@{controle}": this.data.data.control.base
        }
    }

    getMaxDailyAura() {
        const dailyAuraFormula = TogarashiFormulaEditor.getFormula("dailyAuraCalc");
        return resolveFormula(dailyAuraFormula, this.getActorStatsFormulas());
    }

    getFullStat(statname, useMasteries=true) {
        let base = 0;
        let modifier = 0;

        if (this.data.data[statname]?.base !== undefined) {
            base = this.data.data[statname].base;
            modifier = this.data.data[statname].modifier;
        } else {
            base = this.data.data[statname];
        }

        const masteryModifiers = useMasteries ? this.getApplyableMasteries().filter(m => m.status == statname) : [];
        const statModifiers = this.getStatusModWhileActive().filter(sm => sm.status == statname);

        const masteryModSum = masteryModifiers.reduce((cumm, curr) => cumm + curr.modifier, 0);
        const statModSum = statModifiers.reduce((cumm, curr) => cumm + curr.modifier, 0);

        return base + modifier + masteryModSum + statModSum;
    }

    getEquippedWeapon() {
        const equipedWeaponId = this.data.data.equippedItems.weapon;
        if (equipedWeaponId == "") return undefined;
        const equipedWeaponItem = this.items.get(equipedWeaponId);
        return {
            name: equipedWeaponItem.data.name,
            ...equipedWeaponItem.data.data,
            ...equipedWeaponItem.itemStatsCalc()
        };
    }

    getEquippedArmor() {
        const equipedArmorId = this.data.data.equippedItems.armor;
        if (equipedArmorId == "") return undefined;
        const equipedArmorItem = this.items.get(equipedArmorId);
        return {
            name: equipedArmorItem.data.name,
            ...equipedArmorItem.data.data,
            ...equipedArmorItem.itemStatsCalc()
        };
    }

    applyDamage(damage) {
        const currentHealth = this.data.data.health.value;
        this.update({ "data.health.value": currentHealth - damage });
    }

    applyWeaponDamage(damage) {
        const equipedWeaponId = this.data.data.equippedItems.weapon;
        if (equipedWeaponId == "") return undefined;
        const equipedWeaponItem = this.items.get(equipedWeaponId);
        equipedWeaponItem.update({ "data.wear": equipedWeaponItem.data.data.wear + damage });
    }

    applyArmorDamage(damage) {
        const equipedArmorId = this.data.data.equippedItems.armor;
        if (equipedArmorId == "") return undefined;
        const equipedArmorItem = this.items.get(equipedArmorId);
        equipedArmorItem.update({ "data.wear": equipedArmorItem.data.data.wear + damage });
    }

    applyBleeding() {
        this.addStatusEffect({
            status: "health",
            modifierType: "permanent",
            modifier: -5,
            turns: 99
        });
    }

    addStatusEffect(statusEffect) {
        const currentStatusModList = this.data.data.statusModifiers;
        currentStatusModList.push(statusEffect);
        this.update({ "data.statusModifiers": currentStatusModList });
    }

    addMastery(mastery) {
        const currentMasteryList = this.data.data.masteries;
        currentMasteryList.push(mastery);
        this.update({ "data.masteries": currentMasteryList });
    }

    getAuraShieldBlock() {
        if (!this.data.data.auraShieldBlock)
            this.update({ "data.auraShieldBlock": 0 });
        return this.data.data.auraShieldBlock;
    }

    setAuraShieldUsage(usage, fullBody, orangeAura) {
        if (usage) {
            const auraKey = orangeAura ? "orange" : "normal";
            const rankKey = this.data.data.auras[auraKey];

            if (rankKey != "none") {
                const typeKey = fullBody ? "fullBody" : "normal";
                this.update({ "data.auraShieldBlock": auraStats[auraKey][rankKey][typeKey] });
            } else {
                const localizationStr = game.i18n.localize(`togarashi.auraTypes.${auraKey}`);
                ui.notifications.error(`Você não tem a aura ${localizationStr} para utilizar esse escudo de aura`);
                this.update({ "data.auraShieldBlock": 0 });
            }
        } else {
            this.update({ "data.auraShieldBlock": 0 });
        }
    }

    isUsingWeaponBlock() {
        if (!this.data.data.isUsingWeaponBlock)
            this.update({ "data.isUsingWeaponBlock": false });
        return this.data.data.isUsingWeaponBlock;
    }

    setWeaponBlockUsage(usage) {
        this.update({ "data.isUsingWeaponBlock": usage });
    }
}
