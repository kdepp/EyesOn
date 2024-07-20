module.exports = {
  root: true,
  parser: "vue-eslint-parser",
  parserOptions: {
    project: "./tsconfig.json",
    parser: "@typescript-eslint/parser",
    extraFileExtensions: [".vue"]
  },
  plugins: [
    "@typescript-eslint",
    "prettier"
  ],
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/recommended',
    "plugin:prettier/recommended",
  ],
  rules: {
    "prettier/prettier": "warn",
    'comma-dangle': ['error', 'never'],
    'semi': 'off',
    'no-multi-spaces': 'off',
    'indent': 'off',
    'key-spacing': 'off',
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
      "vars": "all",
      "args": "none",
      "ignoreRestSiblings": false
    }],
    'standard/no-callback-literal': 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-inferrable-types': 0
  }
}
