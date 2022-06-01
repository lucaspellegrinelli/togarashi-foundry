export default class TogarashiActor extends Actor {
    characterStatsCalc(charData) {
        const experience = charData.data.experience;
        const resistence = charData.data.resistence.base + charData.data.resistence.modifier;
        const dexterity = charData.data.dexterity.base + charData.data.dexterity.modifier;
    
        return {
            guardLow: resistence + experience,
            guardHigh: resistence + dexterity + experience
        }
    };

    getApplyableMasteries() {
        const masteries = this.data.data.masteries;
        const equipedWeaponId = this.data.data.equippedItems.weapon;

        if (equipedWeaponId == "") return [];

        const equipedWeaponItem = this.items.get(equipedWeaponId);
        const equipedWeaponType = equipedWeaponItem.data.data.type;

        return masteries.filter(mastery => mastery.weapon == equipedWeaponType);
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

    getFullForce() {
        const base = this.data.data.force.base;
        const modifier = this.data.data.force.modifier;
        const masteryModifiers = this.getApplyableMasteries().filter(m => m.status == "force");
        const statModifiers = this.getStatusModWhileActive().filter(sm => sm.status == "force");

        const masteryModSum = masteryModifiers.reduce((cumm, curr) => cumm + curr.modifier, 0);
        const statModSum = statModifiers.reduce((cumm, curr) => cumm + curr.modifier, 0);

        return base + modifier + masteryModSum + statModSum;
    }
}
