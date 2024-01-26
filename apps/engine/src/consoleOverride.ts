export const CONSOLE_OVERRIDE = `
console.debug = (data, ...args) => {
    __INTUITA__console__('debug', data, ...args);
};

console.error = (data, ...args) => {
    __INTUITA__console__('error', data, ...args);
};

console.log = (data, ...args) => {
    __INTUITA__console__('log', data, ...args);
};

console.info = (data, ...args) => {
    __INTUITA__console__('info', data, ...args);
};

console.trace = (data, ...args) => {
    __INTUITA__console__('trace', data, ...args);
};

console.warn = (data, ...args) => {
    __INTUITA__console__('warn', data, ...args);
};
`;
