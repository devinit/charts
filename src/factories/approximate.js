const THOUSAND = 1e3;
const MILLION = 1e6;
const BILLION = 1e9;
const TRILLION = 1e12;

const format = number => (+number.toFixed(1)).toString();

const approximate = (number) => {

  const absolute = Math.abs(number);

  if (absolute < THOUSAND) {
    return format(number)
  }

  if (absolute < MILLION) {
    return `${format(number / THOUSAND)}k`
  }

  if (absolute < BILLION) {
    return `${format(number / MILLION)}m`
  }

  if (number < TRILLION) {
    return `${format(number / BILLION)}bn`
  }

  return `${format(number / TRILLION)}tr`
};

export default approximate
