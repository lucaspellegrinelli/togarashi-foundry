export const guarda_calc = async (n_dice, lower, upper, modifier, crit, dice_sides=10) => {
    const rolls = await roll_n_dice(n_dice, dice_sides);
    return await guarda_calc_eval(rolls, lower, upper, modifier, crit, dice_sides);
}

export const togarashi_roll = async (n_dice, difficulty, dice_sides=10, crit_sides=1, modifier=0) => {
    const rolls = await roll_n_dice(n_dice, dice_sides);
    return await togarashi_roll_eval(rolls, difficulty, dice_sides, crit_sides, modifier);
}

export const roll_n_dice = async (n, dice_sides) => {
    if (n == 0) {
        return [];
    } else {
        const roll_formula = `${n}d${dice_sides}`;
        const roll_result = await new Roll(roll_formula).roll({ async: true });
        return roll_result.terms[0].results.map(({ result }) => result);
    }
};

const count_in_rolls = (roll, test) => {
    let count = 0;
    roll.forEach(r => { if (test(r)) count++; });
    return count;
}

const count_crit_err = (roll) => {
    return count_in_rolls(roll, x => x == 1)
}

const count_crit = (roll, dice_sides, crit_sides) => {
    return count_in_rolls(roll, x => x >= (dice_sides - crit_sides + 1))
}

const count_max = (roll, dice_sides) => {
    return count_in_rolls(roll, x => x == dice_sides)
}

const count_suc = (roll, diff, modifier) => {
    return count_in_rolls(roll, x => ((x != 1) && ((x + modifier) >= diff)))
}

export const guarda_calc_eval = async(rolls, lower, upper, modifier, crit, dice_sides=10) => {
    let ones = count_crit_err(rolls);

    // Calculating dices after discounting 1s
    rolls.sort((a, b) => a - b);
    for (let i = 0; i < ones; i++) {
        for (let j = 0; j < rolls.length; j++) {
            if (rolls[j] != 1 && (rolls[j] + modifier) >= lower) {
                rolls.splice(j, 1);
                break;
            }
        }
    }

    // Rerolling crits
    let n_reroll = count_crit(rolls, 10, crit);
    let all_rerolls = [];
    while (n_reroll > 0) {
        const rerolls = await roll_n_dice(n_reroll, 10);
        rolls = rolls.concat(rerolls);
        all_rerolls = all_rerolls.concat(rerolls);
        n_reroll = count_max(rerolls, 10);
    }
    
    // Calculating number of successes in each guard
    let lower_success = 0;
    let upper_success = 0;
    rolls.forEach(n => {
        if (n > 1) {
            if (n + modifier >= upper) upper_success++;
            else if (n + modifier >= lower) lower_success++;
        }
    });

    return {
        upper: upper_success,
        lower: lower_success,
        rerolls: all_rerolls
    }
}

export const togarashi_roll_eval = async (rolls, difficulty, dice_sides=10, crit_sides=1, modifier=0) => {
    let ones = count_crit_err(rolls);
    let crit = count_crit(rolls, dice_sides, crit_sides);
    let suc = count_suc(rolls, difficulty, modifier);
    let maxs = crit_sides == 0 ? 0 : count_max(rolls, dice_sides);
    let non_max_suc = suc - maxs;
    let del_max = Math.max(0, ones - non_max_suc);
    let n_reroll = maxs - del_max;

    // Rerolling dice
    let all_rerolls = [];
    while (n_reroll > 0) {
        const rerolls = await roll_n_dice(n_reroll, dice_sides);
        all_rerolls = all_rerolls.concat(rerolls);
        crit += count_crit(rerolls, dice_sides, crit_sides);
        suc += count_suc(rerolls, difficulty, modifier);
        n_reroll = count_max(rerolls, dice_sides);
    }

    return {
        sucesses: suc - ones,
        crit: crit,
        rolls: rolls,
        rerolls: all_rerolls
    }
}
