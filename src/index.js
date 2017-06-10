import "./index.less"

export const draw = ({element, data, config}) => {

  return new Promise(function (resolve, reject) {
    if (!config.type) return reject(new Error('No chart type specified'));

    import(`./charts/${config.type}.js`)
      .then(function (chart) {

        const selection = chart.default(element, data, config);

        resolve(selection);
      })
      .catch(error => {
        reject(error)
      })
  })

};

export default draw;
