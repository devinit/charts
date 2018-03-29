import {Formatters, TimeInterval} from 'plottable';

export interface Tier {
  formatter: Formatters.Formatter;
  interval: TimeInterval;
  step: number;
}

export const configureTimeAxisTicking = (axis, ticking: string = 'years', tickingStep: number = 1) => {
  const tiers: Tier[] = [];

  if (ticking === 'years') {
    tiers.push({
      formatter: Formatters.time('%Y'),
      interval: TimeInterval.year,
      step: tickingStep,
    });
  }

  if (ticking === 'months') {
    tiers.push({
      formatter: Formatters.time('%B'),
      interval: TimeInterval.month,
      step: tickingStep,
    });
  }

  if (ticking === 'days') {
    tiers.push({
      formatter: Formatters.time('%d'),
      interval: TimeInterval.day,
      step: tickingStep,
    });
  }

  if (ticking === 'hours') {
    tiers.push({
      formatter: Formatters.time('%H:%M'),
      interval: TimeInterval.hour,
      step: tickingStep,
    });
  }

  axis.axisConfigurations([tiers]);
};

export const configureAxisTicking = (axis, ticking) => {
  axis.addClass(`axis-tick-${ticking}`);
  if (axis.tickLabelMaxLines) axis.tickLabelMaxLines(1);
};

export const configureGridTicking = (grid, ticking) => {
  grid.addClass(`gridlines-tick-${ticking}`);
};
