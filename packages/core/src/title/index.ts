import * as Plottable from 'plottable';

export interface CreateTitleArgs {
  title?: string;
  titleAlignment?: Plottable.XAlignment;
}
export const createTitle =
  ({ title, titleAlignment = 'left' }: CreateTitleArgs): Plottable.Components.TitleLabel | undefined => {
  if (!title) return undefined;

  return new Plottable.Components.TitleLabel(title, 0).xAlignment(titleAlignment).yAlignment('top');
};
