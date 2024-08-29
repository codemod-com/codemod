const options = {
  interpolation: {
    escapeValue: false,
  },
};

i18n.init({
  lng: 'en',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  normalize: (type, value) => {
    switch (type) {
      case 'translation':
        return value.toUpperCase(); // Custom normalization for translations
      default:
        return value;
    }
  },
  options,
});