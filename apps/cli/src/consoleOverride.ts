export const CONSOLE_OVERRIDE = `
console.debug = (data, ...args) => {
    __CODEMODCOM__console__('debug', data, ...args);
};

console.error = (data, ...args) => {
    __CODEMODCOM__console__('error', data, ...args);
};

console.log = (data, ...args) => {
    __CODEMODCOM__console__('log', data, ...args);
};

console.info = (data, ...args) => {
    __CODEMODCOM__console__('info', data, ...args);
};

console.trace = (data, ...args) => {
    __CODEMODCOM__console__('trace', data, ...args);
};

console.warn = (data, ...args) => {
    __CODEMODCOM__console__('warn', data, ...args);
};
`;
