import Plottable from 'plottable';

export const createTitle = ({ title = null, titleAlignment = 'left' }) => {
  if (!title) return null;

  return new Plottable.Components.TitleLabel(title, 0).xAlignment(titleAlignment).yAlignment('top');
};
