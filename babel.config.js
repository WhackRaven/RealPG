module.exports = function (api) {
  api.cache(true);
  const isWeb = process.env.EXPO_PLATFORM === 'web';
  return {
    presets: ['babel-preset-expo'],
    plugins: isWeb ? [] : [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './'
        }
      }],
      'react-native-reanimated/plugin'
    ]
  };
};
