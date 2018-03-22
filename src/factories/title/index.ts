import * as Plottable from 'plottable';

export interface CreateTitleArgs {
  title?: string;
  titleAlignment: Plottable.XAlignment;
}
export const createTitle = ({ title, titleAlignment = 'left' }: CreateTitleArgs) => {
  if (!title) return null;

  return new Plottable.Components.TitleLabel(title, 0).xAlignment(titleAlignment).yAlignment('top');
};
