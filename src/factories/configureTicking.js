import Plottable from 'plottable';

export const configureTimeAxisTicking = (axis, ticking = 'years', tickingStep = 1) => {
  const tiers = [];

  if (ticking === 'years') {
    tiers.push({
      formatter: new Plottable.Formatters.time('%Y'),
      interval: Plottable.TimeInterval.year,
      step: tickingStep,
    });
  }

  if (ticking === 'months') {
    tiers.push({
      formatter: new Plottable.Formatters.time('%B'),
      interval: Plottable.TimeInterval.month,
      step: tickingStep,
    });
  }

  if (ticking === 'days') {
    tiers.push({
      formatter: new Plottable.Formatters.time('%d'),
      interval: Plottable.TimeInterval.day,
      step: tickingStep,
    });
  }

  if (ticking === 'hours') {
    tiers.push({
      formatter: new Plottable.Formatters.time('%H:%M'),
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
