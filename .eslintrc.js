module.exports = {
  'env': {
    'browser': true,
    'es6': true
  },

  'extends': 'eslint:recommended',
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 2019,
    'sourceType': 'module',
    'ecmaFeatures': {
      'impliedStrict': true
    }
  },
  'rules': {
    "no-console": "off",

    'indent': [ 0, 2 ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      0,
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  }
};
