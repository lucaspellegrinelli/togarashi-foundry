import { auraStats } from "../data/auraStats.js";

export default class TogarashiActor extends Actor {
    characterStatsCalc() {
        const experience = this.data.data.experience;
        const resistence = this.data.data.resistence.base + this.data.data.resistence.modifier;
        const dexterity = this.data.data.dexterity.base + this.data.data.dexterity.modifier;
    
        return {
            guardLow: resistence + experience,
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
        permanentMods.forEach(mod => {
            if (typeof this.data.data[mod.status] == "object") {
                const currentStat = this.data.data[mod.status].base;
                this.actor.update({ [`data.${mod.status}.base`]: currentStat + mod.modifier });
            } else {
                const currentStat = this.data.data[mod.status];
                this.actor.update({ [`data.${mod.status}`]: currentStat + mod.modifier });
            }
        });
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

    getAuraShieldBlock() {
        if (!this.auraShieldBlock)
            this.auraShieldBlock = 0;

        return this.auraShieldBlock;
    }

    setAuraShieldUsage(usage, fullBody, orangeAura) {
        if (usage) {
            const auraKey = orangeAura ? "orange" : "normal";
            const rankKey = this.data.data.auras[auraKey];

            if (rankKey != "none") {
                const typeKey = fullBody ? "fullBody" : "normal";
                this.auraShieldBlock = auraStats[auraKey][rankKey][typeKey];
            } else {
                const localizationStr = game.i18n.localize(`togarashi.auraTypes.${auraKey}`);
                ui.notifications.error(`Você não tem a aura ${localizationStr} para utilizar esse escudo de aura`);
                this.auraShieldBlock = 0;
            }
        } else {
            this.auraShieldBlock = 0;
        }
    }

    isUsingWeaponBlock() {
        if (!this.weaponBlockUsage)
            this.weaponBlockUsage = false;

        return this.weaponBlockUsage;
    }

    setWeaponBlockUsage(usage) {
        this.weaponBlockUsage = usage;
    }
}
