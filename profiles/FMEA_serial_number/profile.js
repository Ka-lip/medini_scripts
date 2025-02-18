/* 
The profile is under FMEA Worksheets -> Component/Function (derived FMEA and SWA only)
The name of this profile is required to be "user_seq" by default. Using other names requires modification of following scripts.
*/
if (self.parent){
  self.parent.user_seq.toString() + "." + (self.parent.children.indexOf(self) + 1).toString();}
else{
  (self.worksheet.topLevelComponents.indexOf(self)+1).toString();}