export default (scales, ...domains) => {
  scales.forEach((scale, index) => {
    const domain = domains[index] || [];

    const [min, max] = domain;

    scale.domainMin(min);
    scale.domainMax(max);
  });
};