export const mock = {
  id: 546,
  slug: "ember-5-fpe-computed",
  shortDescription:
    "# Fpe Computed\n\n## Description\n\n## Example\n\n### Before:\n\n```jsx\nimport EmberObject from '@ember/object';\n\nlet Person = EmberObject.extend({\n\tinit() {\n\t\tthis._super(...arguments);\n\n\t\tthis.firstName = 'Betty';\n\t\tthis.lastName = 'Jones';\n\t},\n\n\tfullName: function () {\n\t\treturn `${this.firstName} ${this.lastName}`;\n\t}.property('firstName', 'lastName'),\n});\n\nlet client = Person.create();\n\nclient.get('fullName'); // 'Betty Jones'\n\nclient.set('lastName', 'Fuller');\nclient.get('fullName'); // 'Betty Fuller'\n```\n\n### After:\n\n```tsx\nimport EmberObject, { computed } from '@ember/object';\n\nlet Person = EmberObject.extend({\n\tinit() {\n\t\tthis._super(...arguments);\n\n\t\tthis.firstName = 'Betty';\n\t\tthis.lastName = 'Jones';\n\t},\n\n\tfullName: computed('firstName', 'lastName', function () {\n\t\treturn `${this.firstName} ${this.lastName}`;\n\t}),\n});\n\nlet client = Person.create();\n\nclient.get('fullName'); // 'Betty Jones'\n\nclient.set('lastName', 'Fuller');\nclient.get('fullName'); // 'Betty Fuller'\n```\n",
  useCaseCategory: "migration",
  tags: [],
  engine: "jscodeshift",
  applicability: {
    from: [
      ["ember", ">=", "3.11.0"],
      ["ember", "<", "5.0.0"],
    ],
  },
  arguments: [],
  name: "ember/5/fpe-computed",
  featured: false,
  verified: true,
  private: false,
  author: "codemod.com",
  amountOfUses: 0,
  totalTimeSaved: 0,
  openedPrs: 0,
  labels: [],
  createdAt: "2024-03-27T12:25:07.019Z",
  updatedAt: "2024-03-27T12:25:07.019Z",
  versions: [
    {
      id: 546,
      version: "1.0.0",
      shortDescription:
        "# Fpe Computed\n\n## Description\n\n## Example\n\n### Before:\n\n```jsx\nimport EmberObject from '@ember/object';\n\nlet Person = EmberObject.extend({\n\tinit() {\n\t\tthis._super(...arguments);\n\n\t\tthis.firstName = 'Betty';\n\t\tthis.lastName = 'Jones';\n\t},\n\n\tfullName: function () {\n\t\treturn `${this.firstName} ${this.lastName}`;\n\t}.property('firstName', 'lastName'),\n});\n\nlet client = Person.create();\n\nclient.get('fullName'); // 'Betty Jones'\n\nclient.set('lastName', 'Fuller');\nclient.get('fullName'); // 'Betty Fuller'\n```\n\n### After:\n\n```tsx\nimport EmberObject, { computed } from '@ember/object';\n\nlet Person = EmberObject.extend({\n\tinit() {\n\t\tthis._super(...arguments);\n\n\t\tthis.firstName = 'Betty';\n\t\tthis.lastName = 'Jones';\n\t},\n\n\tfullName: computed('firstName', 'lastName', function () {\n\t\treturn `${this.firstName} ${this.lastName}`;\n\t}),\n});\n\nlet client = Person.create();\n\nclient.get('fullName'); // 'Betty Jones'\n\nclient.set('lastName', 'Fuller');\nclient.get('fullName'); // 'Betty Fuller'\n```\n",
      engine: "jscodeshift",
      applicability: {
        from: [
          ["ember", ">=", "3.11.0"],
          ["ember", "<", "5.0.0"],
        ],
      },
      arguments: [],
      vsCodeLink:
        "vscode://codemod.codemod-vscode-extension/showCodemod?chd=jisEa59u6ByQ-XI9pMkBa_GsvCw",
      codemodStudioExampleLink: undefined,
      testProjectCommand: undefined,
      sourceRepo:
        "https://github.com/ember-codemods/ember-3x-codemods/tree/master/transforms/fpe-computed",
      amountOfUses: 0,
      totalTimeSaved: 0,
      openedPrs: 0,
      bucketLink:
        "https://codemod-public-v2.s3.us-west-1.amazonaws.com/codemod-registry/jisEa59u6ByQ-XI9pMkBa_GsvCw/1.0.0/codemod.tar.gz",
      useCaseCategory: "migration",
      tags: [],
      codemodId: 546,
      createdAt: "2024-03-27T12:25:07.019Z",
      updatedAt: "2024-03-27T12:25:07.019Z",
    },
  ],
};
