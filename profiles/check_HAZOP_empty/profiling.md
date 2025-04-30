# Where to setup
Project setting -> Profiling -> Guideword Analysis -> Entry

# Schema
## name: user_reviewed_blank  
property: string property  
predefined values: add all your guidewords. For example, if you use guideword template `IEC 61882 (Edition 2.0 2016-03)`, then you need `NO OR NOT`, `MORE`, `LESS`, `AS WELL AS`, `PART OF`, `REVERSE`, `OTHER THAN`, `EARLY`, `LATE`, and `PERIODIC`.  

## name: user_blank_guidewords  
property: derived property  
language: OCL  
script: 
```OCL
(self.mediniGetOpposites('entries').oclAsType(hazop::HazopAnalysisModel).guidewords->asSet()  
  - self.guidewordToFailures.key->asSet()  
).name
```

## name: user_blank_check  
property: derived property  
language: OCL  
script:
```OCL
if 
  (self.mediniGetOpposites('entries').oclAsType(hazop::HazopAnalysisModel).guidewords->asSet()
    - self.guidewordToFailures.key->asSet()
  ).name->asSet()
    = self.user_reviewed_blank->asSet()
then 
  '[@#00FF00]'
else
  '[@#FF0000]'
endif
```
