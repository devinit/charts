module.exports = {
    extends: ['airbnb-base' , 'plugin:flowtype/recommended'],
    "plugins": [
        "flowtype", "import",
    ],
    env: {
        browser: true,
        jest: true,
        node: true
      },
    rules: {
        'no-shadow': 0,
        'arrow-body-style': 0,
        'object-curly-newline': 0,
        'arrow-parens': 0,
        'global-require': 0,
        'object-curly-spacing': 0,
        'no-unused-expressions': 0,
        'no-confusing-arrow': 0,
        'consistent-return': 0,
        'no-constant-condition': 0,
        'no-restricted-properties': 0,
        'import/no-dynamic-require': 0,
        'import/no-extraneous-dependencies': 0,
        'import/extensions': 0,
        'import/no-array-index-key': 0,
        'import/prefer-default-export': 0,
        'react/require-default-props': 0,
        'comma-dangle': 0,
        'no-underscore-dangle': 0,
        'no-unused-vars': 2,
        'no-param-reassign': 0,
        'no-plusplus': 0,
        'function-paren-newline': 0,
        'no-multi-assign':0,
        'one-var': 0,
        'prefer-destructuring': 0,
    }
};