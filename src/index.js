import createElement from "svg-create-element";
import Utility from './utilities'

/**
 *
 * @param element
 * @param data
 * @param config
 */
export const draw = ({element, data, config}) => {

  return new Promise(function (resolve, reject) {
    import(`./charts/${config.type}.js`)
      .then(function (chart) {

        const svg = createElement('svg');

        //
        // TODO(Priority-Medium): Use `element` to optimise svg dimensions to fit for responsiveness.
        //
        // How the calculations work:
        //
        // - If element element has a fixed width and height,
        //   then that'll be used.
        // - If element element is a block element (display: block in css),
        //   and config has aspect, then width of the block and aspect
        //   are used to calculate height
        //
        //

        element.appendChild(svg);

        // Plottable 2 requires an svg element
        // const selection = chart.default(svg, data, config);
        //
        // Plottable 3 takes a div instead
        const selection = chart.default(element, data, config);

        // TODO(Priority-Medium): Find a better way to clean up plottable mess
        //
        //
        // Some things can only be 'fixed' with d3. The plottable charts used
        // for multinational profiles already make use of a utility class. We've
        // added the very same utility class here to be used temporarily until
        // we find a better way to clean up
        // To reuse clean up functions, a chart can a export a function named
        // `cleanUp`. It will be invoked with a utility instance
        //
        // Unfortunately, this means we'll be using the same version of plottable
        // as datahub-angular
        if (typeof chart.cleanUp == 'function') {
          chart.cleanUp(new Utility({chart: selection}))
        }
      })
  })

};
