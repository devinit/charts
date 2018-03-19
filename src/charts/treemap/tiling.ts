import {
  treemapBinary,
  treemapDice,
  treemapResquarify,
  treemapSlice,
  treemapSliceDice,
  treemapSquarify,
} from 'd3';

/**
 * @typedef {Object} Tiling
 * @property {'binary'|'dice'|'slice'|'sliceDice'|'squarify'|'resquarify'} tile=squarify - Tiling Method
 * @property {number} ratio - Squarify Ratio
 */

const tilingMethods = {
  binary: treemapBinary,
  dice: treemapDice,
  slice: treemapSlice,
  sliceDice: treemapSliceDice,
  squarify: treemapSquarify,
  resquarify: treemapResquarify,
};

const tile = (config = {}) => {
  const { method = 'resquarify', ratio = 0.5} = config;

  if (/(squarify|resquarify)/.test(method)) {
    return tilingMethods[method].ratio(ratio);
  }

  return tilingMethods[method];
};

export default tile;
