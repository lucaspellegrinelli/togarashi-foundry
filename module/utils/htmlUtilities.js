export const waitListener = (element, listenerName) => {
    return new Promise(resolve => {
        const listener = event => {
            element.removeEventListener(listenerName, listener);
            resolve(event);
        };
        element.addEventListener(listenerName, listener);
    });
};
