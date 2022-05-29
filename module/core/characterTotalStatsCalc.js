export const characterStatsCalc = charData => {
    const experience = charData.data.experience;
    const resistence = charData.data.resistence.base + charData.data.resistence.modifier;
    const dexterity = charData.data.dexterity.base + charData.data.dexterity.modifier;

    return {
        guardLow: resistence + experience,
        guardHigh: resistence + dexterity + experience
    }
};
