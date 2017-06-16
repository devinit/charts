export const configureAxisTicking = (axis, ticking) => {

  if (ticking === 'all') {
    axis.addClass('axis-tick-all')
  }

  if (ticking === 'even') {
    axis.addClass('axis-tick-even')
  }

  if (ticking === 'odd') {
    axis.addClass('axis-tick-odd')
  }

  if (ticking === 'sparse') {
    axis.tickLabelMaxLines(1);
    axis.addClass('axis-tick-sparse')
  }
};

export const configureGridTicking = (grid, ticking) => {
  if (ticking === 'all') {
    grid.addClass('gridlines-tick-all')
  }

  if (ticking === 'even') {
    grid.addClass('gridlines-tick-even')
  }

  if (ticking === 'odd') {
    grid.addClass('gridlines-tick-odd')
  }

  if (ticking === 'sparse') {
    grid.addClass('gridlines-tick-sparse')
  }
};