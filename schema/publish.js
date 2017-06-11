const fs = require('fs');
const pkg = require('../package.json');
const destination = `dist/di-charts-${pkg.version}.schema.json`;

exports.publish = function (data, opts) {

  const definitions = data()
    .get()
    .filter(doc => !doc.undocumented)
    .filter(doc => doc.kind === 'typedef')
    .filter(doc => doc.name)
    .reduce((all, doc) => {
      let {name, access, type, properties} = doc;

      return Object.assign(all, {
        [name]: {
          access,
          type: type.names.join(),
          properties: properties.map(({name, type: {names}, description}) => {

            const literals = names.filter(n => n.match(/'.+'/)).map(n => n.match(/'(.+)'/)[1]);
            const nonLiterals = names.filter(n => !n.match(/'.+'/));

            return {
              name,
              type: literals.length ? undefined : nonLiterals[0],
              options: literals.length > 1 ? literals : undefined,
              value: literals.length === 1 ? literals[0] : undefined,
              description
            }

          }),
        }
      })
    }, {});

  const normalised = Object.keys(definitions)
    .filter(k => definitions[k].access === 'public')
    .map(k => Object.assign(definitions[k], {name: k}))
    .map(({name, description, type, properties, value, options}) => {
      const parent = definitions[type];
      let allProperties = properties;

      if (parent) {
        const matchAlreadySet = `(${properties.map(p => p.name).join('|')})`;
        allProperties = allProperties.concat(parent.properties.filter(p => !p.name.match(matchAlreadySet)))
      }

      allProperties = allProperties.map(({name, type, value, options, description}) => {
        const parent = definitions[type];
        if (parent) {
          return {
            name,
            value,
            options,
            key: `config.${name}`,
            properties: parent.properties.map(p => Object.assign(p, {key: `config.${name}.${p.name}`})),
            description
          }
        }

        return {name, key: `config.${name}`, type, description, value, options}
      });

      return {
        name,
        description,
        properties: allProperties
      };
    });

  fs.writeFileSync(destination, JSON.stringify(normalised, null, 2));

};
