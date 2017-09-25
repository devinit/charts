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
 * @property {number} squarifyRatio - Squarify Ratio
 */

const tilingMethods = {
  binary: treemapBinary,
  dice: treemapDice,
  slice: treemapSlice,
  sliceDice: treemapSliceDice,
  squarify: treemapSquarify,
  resquarify: treemapResquarify,
};

const tile = ({method = 'squarify', squarifyRatio = 0.5}) => {
  if (method === 'squarify') {
    return tilingMethods[method].ratio(squarifyRatio);
  }

  return tilingMethods[method];
};

export default tile;
