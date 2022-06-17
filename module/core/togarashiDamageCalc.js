import { resolveFormula } from "../utils/formulaParser.js";
import TogarashiFormulaEditor from "../forms/TogarashiFormulaEditor.js";

export const calculateDamage = (config) => {
    const formulaNames = [
        "upperGuardDamageCalc",
        "lowerGuardDamageCalc",
        "totalDamageCalc",
        "defenseWeaponResistDamageCalc",
        "attackWeaponResistDamageCalc",
        "defenseArmorResistDamageCalc"
    ]

    const formulas = formulaNames.reduce((map, name) => ({ ...map, [name]: TogarashiFormulaEditor.getFormula(name) }), {});

    let upperSuccesses = config.upperSucesses;
    let lowerSuccesses = config.lowerSuccesses;
    let damageTypes = config.damageTypes;
    let damagePerSuccess = config.damagePerSuccess;
    const origDamagePerSuccess = config.damagePerSuccess;
    let defenseForce = config.defenseForce;
    let auraShield = config.auraShield;
    let defenseWeaponBlock = config.defenseWeaponBlock;
    let armorDefenseBlock = config.armorDefenseBlock;
    let otherDefenseBlock = config.otherDefenseBlock;

    let extraVariables = {};
    const variableList = () => ({
        ...extraVariables,
        "@{suc-cima}": upperSuccesses,
        "@{suc-baixo}": lowerSuccesses,
        "@{orig-dano-suc}": origDamagePerSuccess,
        "@{dano-suc}": damagePerSuccess,
        "@{def-forca}": defenseForce
    });

    // Definindo as variáveis que vao tomar conta de quanto de dano será dado
    // à arma e armadura do defensor.
    let defenseWeaponResistDamage = 0;
    let defenseArmorResistDamage = 0;

    // Se a arma possuí dano perfurante, diminua pela metade o block da armadura
    if(damageTypes.includes("piercing")){
        armorDefenseBlock = Math.round(armorDefenseBlock / 2);
        auraShield = Math.round(auraShield / 2);
    }

    // Se o defensor usou "Bloquear", tire a quantidade de block da arma do
    // dano por sucesso e tire resistência da arma utilizada
    if (defenseWeaponBlock > 0) {
        const blockedDamage = Math.min(damagePerSuccess, defenseWeaponBlock); // Quanto de dano foi bloqueado pela arma
        damagePerSuccess -= blockedDamage;
        extraVariables["@{dano-bloqueado-arma}"] = blockedDamage;
        defenseWeaponResistDamage = resolveFormula(formulas["defenseWeaponResistDamageCalc"], variableList());
    }

    // Se o defensor usou alguma ténica que dá block para ele, tire essa quantidade
    // de block do dano por sucesso do ataque.
    if (otherDefenseBlock > 0) {
        const blockedDamage = Math.min(damagePerSuccess, otherDefenseBlock);
        damagePerSuccess -= blockedDamage;
    }

    // Se o defensor está usando uma armadura, tire a quantidade de block da armadrua do
    // dano por sucesso e tire resistência da armadura utilizada
    if (armorDefenseBlock > 0) {
        const blockedDamage = Math.min(damagePerSuccess, armorDefenseBlock);
        damagePerSuccess -= blockedDamage;
        extraVariables["@{dano-bloqueado-armadura}"] = blockedDamage;
        defenseArmorResistDamage = resolveFormula(formulas["defenseArmorResistDamageCalc"], variableList());
    }

    // Calcula o dano em cada uma das guardas
    const upperGuardDamage = resolveFormula(formulas["upperGuardDamageCalc"], variableList());
    extraVariables["@{dano-cima}"] = upperGuardDamage;
    const lowerGuardDamage = resolveFormula(formulas["lowerGuardDamageCalc"], variableList());
    extraVariables["@{dano-baixo}"] = lowerGuardDamage;

    // Calcula o dano total causado ao oponente
    let totalDamage = resolveFormula(formulas["totalDamageCalc"], variableList());
    extraVariables["@{dano-total}"] = totalDamage;

    // Se o defensor usou "Escudo de Aura", tire a quantidade de block da arma do
    // dano por sucesso e tire resistência da arma utilizada
    if (auraShield > 0) {
        const blockedDamage = Math.min(totalDamage, auraShield);
        totalDamage -= blockedDamage;
    }

    // Calcula o dano que será causado à arma do atacante
    const attackWeaponResistDamage = resolveFormula(formulas["attackWeaponResistDamageCalc"], variableList());

    // Se a arma possuí dano de impacto, dobre a quantidade de dano causado à armadura
    if (damageTypes.includes("impact")) {
        defenseArmorResistDamage *= 2;
    }

    // Retorne as informações calculadas
    return {
        upperGuardDamage, lowerGuardDamage, totalDamage, defenseWeaponResistDamage,
        attackWeaponResistDamage, defenseArmorResistDamage
    }    
};
