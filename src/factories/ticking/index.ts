import * as Plottable from 'plottable';

export interface Tier {
  formatter: Plottable.Formatters.Formatter
  interval: Plottable.TimeInterval;
  step: number;
}
export const configureTimeAxisTicking = (axis, ticking = 'years', tickingStep = 1) => {
  const tiers: Tier[] = [];

  if (ticking === 'years') {
    tiers.push({
      formatter: Plottable.Formatters.time('%Y'),
      interval: Plottable.TimeInterval.year,
      step: tickingStep,
    });
  }

  if (ticking === 'months') {
    tiers.push({
      formatter: Plottable.Formatters.time('%B'),
      interval: Plottable.TimeInterval.month,
      step: tickingStep,
    });
  }

  if (ticking === 'days') {
    tiers.push({
      formatter: Plottable.Formatters.time('%d'),
      interval: Plottable.TimeInterval.day,
      step: tickingStep,
    });
  }

  if (ticking === 'hours') {
    tiers.push({
      formatter: Plottable.Formatters.time('%H:%M'),
      interval: Plottable.TimeInterval.hour,
      step: tickingStep,
    });
  }

  axis.axisConfigurations([tiers]);
};

export const configureAxisTicking = (axis, ticking) => {
  axis.addClass(`axis-tick-${ticking}`);
  axis.tickLabelMaxLines && axis.tickLabelMaxLines(1);
};

export const configureGridTicking = (grid, ticking) => {
  grid.addClass(`gridlines-tick-${ticking}`);
};
