const fs = require('fs');

const destination = 'dist/di-charts.schema.json';

exports.publish = data => {
  const definitions = data()
    .get()
    .filter(doc => !doc.undocumented && doc.kind === 'typedef' && doc.name)
    .reduce((all, doc) => {
      const {
        name, access, type, properties
      } = doc;

      return Object.assign(all, {
        [name]: {
          access,
          name,
          type: type.names.join(),
          properties: properties.map(property => {
            const {
              name, type: { names }, description, defaultvalue
            } = property;

            const literals = names.filter(n => n.match(/'.+'/)).map(n => n.match(/'(.+)'/)[1]);
            const nonLiterals = names.filter(n => !n.match(/'.+'/));

            return {
              name,
              type: literals.length ? undefined : nonLiterals[0],
              options: literals.length > 1 ? literals : undefined,
              value: literals.length === 1 ? literals[0] : undefined,
              default: defaultvalue,
              description,
            };
          }),
        },
      });
    }, {});

  const normalised = Object.keys(definitions)
    .filter(k => definitions[k].access === 'public')
    .map(k => definitions[k])
    .map(({
      name, description, type, properties
    }) => {
      const parent = definitions[type];
      let allProperties = properties;

      if (parent) {
        const matchAlreadySet = `(${properties.map(p => p.name).join('|')})`;
        allProperties = allProperties
          .concat(parent.properties.filter(p => !p.name.match(matchAlreadySet)));
      }

      return {
        name,
        description,
        properties: allProperties.map(({
          name, type, value, options, description, defaultValue
        }) => {
          const parent = definitions[type];

          if (parent) {
            return {
              name,
              key: `config.${name}`,
              properties: parent.properties.map(p =>
                Object.assign(p, { key: `config.${name}.${p.name}` })),
              description,
              defaultValue,
            };
          }

          return {
            name,
            key: `config.${name}`,
            type,
            description,
            value,
            options,
            defaultValue,
          };
        }),
      };
    });

  fs.writeFileSync(destination, JSON.stringify(normalised, null, 2));
};
