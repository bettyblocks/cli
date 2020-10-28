module.exports = {
  // WARNING: Do not change this section
  target: 'node',
  entry: './src/index.js',
  mode: 'production',
  output: {
    filename: 'custom.js',
    libraryTarget: 'var',
    library: 'custom',
  },
  // END SECTION
};
