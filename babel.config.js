module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }],
      '@babel/preset-typescript',
    ],
    env: {
      test: {
        presets: [
          ['@babel/preset-env', { 
            targets: { node: 'current' },
            loose: true 
          }],
          '@babel/preset-react',
          '@babel/preset-typescript',
        ],
        plugins: [
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-transform-private-property-in-object', { loose: true }]
        ]
      },
    },
  };
};
