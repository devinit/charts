export default function ({plot, legend = null, transform = null}) {

  const addData = (data = null) => {
    if (data) {

      // TODO: Efficiently update legend
      if (legend) {

        const domain = data.series.map(d => d.label);
        const range = data.series.map(d => d.color);
        legend.domain(domain).range(range);
      }

      plot.datasets(transform ? transform(data) : data);
    }
  };

  return {

    addData,

  }

}