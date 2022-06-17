export const encodeObject = (object, key="togarashi") => encodeString(key, JSON.stringify(object));
export const decodeObject = (data, key="togarashi") => JSON.parse(decodeString(key, data));

const encodeString = (key, data) => btoa(xor_iteration(key, data));
const decodeString = (key, data) => xor_iteration(key, atob(data));

const keyCharAt = (key, i) => key.charCodeAt(Math.floor(i % key.length))

const xor_iteration = (key, data) => {
    return data.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ keyCharAt(key, i))).join("");
}
