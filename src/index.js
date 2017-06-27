export const palette = new Map();

export const setColorPalette = (colors) => {
  colors.forEach(({name, color}) => palette.set(name, color));
};

export const draw = ({element, data, config: {colors, ...config}}) => {

  return new Promise(function (resolve, reject) {
    if (!config.type) return reject(new Error('No chart type specified'));

    import(`./charts/${config.type}.js`)
      .then(function (chart) {
        resolve(chart.default(
          element,
          // Substitute color indicators
          config.coloring ?
            data.map(d => ({
              ...d,
              [config.coloring]: palette.get(d[config.coloring]) || d[config.coloring]
            })) :
            data,

          {
            ...config,

            // Substitute colors[]
            colors: palette.size && colors ?
              colors.map(color => palette.get(color) || color) :
              colors,
          }
        ));
      })
      .catch(error => {
        reject(error)
      })
  })

};

export default draw;
