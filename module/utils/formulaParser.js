export const resolveFormula = (formula, variables) => {
    const handles = {
        "floor": "Math.floor",
        "round": "Math.round",
        "max": "Math.max",
        "min": "Math.min",
        "ceil": "Math.ceil",
        "log": "Math.log",
        "log2": "Math.log2",
        "log10": "Math.log10",
        "abs": "Math.abs",
        "sqrt": "Math.sqrt",
        "pow": "Math.pow"
    };

    Object.keys(variables).forEach(variable => {
        formula = formula.replaceAll(variable, variables[variable]);
    });

    Object.keys(handles).forEach(handle => {
        formula = formula.replaceAll(handle, handles[handle]);
    });

    return eval(formula);
}
