# Description
In this directory, useful derived profiles are documented.

# Show safety goals in FMEA
OCL
`self.element.oclAsType(sysml::SysMLPart).mediniGetTracedElements(safetygoals::SafetyRequirement).oclAsType(safetygoals::SafetyRequirement).contributedGoals`
![outcome](./img/sgfmea1.png)

Profiling -> FMEA Worksheets -> Component Function (derived FMEA and SWA only)
![setting](./img/sgfmea2.png)