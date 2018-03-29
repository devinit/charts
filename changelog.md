# ChangeLog

Migration to typescript changes to keep track of
_______________________________

- In src/factories/animator/scale.ts ``easeCircleInOut`` was previously taking in 3 params now its taking in 2
- new Plottable.Formatters.time('%Y') changed to Plottable.Formatters.time('%Y') in  charts/src/factories/ticking/index.ts
- document.body.style = {} cant be assigned per typechecker but it was assigned in charts/src/factories/time/anchor.ts