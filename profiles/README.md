# Description
In this directory, useful derived profiles are documented.

# FMEA serial number
![FMEA serial number screenshot](./img/fmea_serial_number.png)
[profile](./FMEA_serial_number/profile.js)

# PMHF separate
The native sample project for PMHF approximation doesn't provide FIT of each pattern. This project provides this.
![](./img/pmhf_separate.png)
[src](./PMHF_separate)

# Show safety goals in FMEA
OCL
`self.element.oclAsType(sysml::SysMLPart).mediniGetTracedElements(safetygoals::SafetyRequirement).oclAsType(safetygoals::SafetyRequirement).contributedGoals`
![outcome](./img/sgfmea1.png)

Profiling -> FMEA Worksheets -> Component Function (derived FMEA and SWA only)
![setting](./img/sgfmea2.png)