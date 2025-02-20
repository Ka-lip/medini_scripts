# Sum up RBD availability
## Procedure
Step 1. Get your RBDs ready in a package.
![multiple RBDs](screenshot1.png)

Step 2. Execute the script on a pacakge that has multiple RBDs
![excute the script on a package that has multiple RBDs](screenshot2.png)

Step 3. The checklist that has unavailability will be generated.
![the checklist will be generated](screenshot3.png)
> **Note**: The items circled by red frames will be generated automatically by the script you executed. The checklist and its cell of related artifacts.\
The highlight part (The unavailability and PFD) is computed by the script written in profiles, meaning that they are not related to the script you executed.

## Note
1. RBDs without a cutset will be ignored, since no information of unavailability.
1. If a RBD has more than one cutset, the script will be interrupted, since the script doesn't know which cutset users want to use. 
1. Two profiles defined in checklist should be setup if you want to use the script in your own project.

## Profile settings
Profiles:`Miscellanous`->`Checklist Task/Requirement`

single_unavailability (Derived property, OCL):
`self.artifacts.oclAsType(rbd::RBDAnalysisModel).unavailability`

aggregate_unavailability (Derived property, OCL):
`1 - (self.artifacts.oclAsType(rbd::RBDAnalysisModel).unavailability->iterate(elem : Real; acc : Real = 1 | acc * (1-elem)))`

single_pfd (Derived property, OCL):
`self.artifacts.oclAsType(rbd::RBDAnalysisModel).averageUnavailability`

aggregate_pfd (Derived property, OCL):
`1 - (self.artifacts.oclAsType(rbd::RBDAnalysisModel).averageUnavailability ->iterate(elem : Real; acc : Real = 1 | acc * (1-elem)))`

![Profiles](screenshot4.png)