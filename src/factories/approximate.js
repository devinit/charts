const THOUSAND = 1e3;
const MILLION = 1e6;
const BILLION = 1e9;
const TRILLION = 1e12;

const format = number => (+number.toFixed(1)).toString();

const approximate = (number) => {

  const absolute = Math.abs(number);
  const polarity = number < 0 ? '-' : '';

  if (absolute < THOUSAND) {
    return polarity + format(number)
  }

  if (absolute < MILLION) {
    return `${polarity + format(number / THOUSAND)}k`
  }

  if (absolute < BILLION) {
    return `${polarity}${format(number / MILLION)}m`
  }

  if (number < TRILLION) {
    return `${polarity}${format(number / BILLION)}bn`
  }

  return `${polarity}${format(number / TRILLION)}tr`
};

export default approximate
