module.exports = {
  entry: './src/index.js',
  mode: 'production',
  output: {
    filename: 'custom.js',
    libraryTarget: 'var',
    library: 'custom'
  },
};
