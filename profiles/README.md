# Description
In this directory, useful derived profiles are documented.

# Check HAZOP's empty
![Check HAZOP's empty](./img/check_hazop_empty.png)  
[src](./check_HAZOP_empty)  
This customization allows users to check whether HAZOP entries have empty cells which has not been evaluated yet. If the entries have at least one empty cell which has not been evaluated, the color shows red, otherwise green. The dynamic constraint (i.e. validation rule) is also implemented.  
Note that the JavaScript file in the folder `.hooks` is optional. With it the color column will be updated automatically, but without it you can trigger the update by pressing `F5`.  
Check the above link for more details.  

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
