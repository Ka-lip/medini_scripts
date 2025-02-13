/*
This profile should be added to Diagnostic Coverage -> DC Worksheet.
*/

load (".lib/pmhf_10_calc_utils_separate.js");

var result = "";
var variants = [];


if( self.user_t_lifetime && self.user_t_lifetime!=''&& !isNaN(self.user_t_lifetime) &&
    self.user_t_service && self.user_t_service!=''&& !isNaN(self.user_t_service)
   )
{
	if(self.variants.isEmpty()){
		variants[0] = null;
	}
	else {
		variants = self.variants.toArray();
	}
	variants.forEach(function (v) {
		var vName = v!=undefined ? v.identifier + ":\t"  :"";

		if(!self.safetyGoal.isEmpty())
		{
			self.safetyGoal.toArray().forEach(function (g) {
				result += "" + vName  + g.identifier + ":\t" + computePMHF_10_separate(self, g, v).join(' FIT\n') + 'FIT\n';
			});
		}
		else 
		{
			result += "" + "(no safety goal associated)" + ":\t" +  computePMHF_10_separate(self, g, v).join(' FIT\n') + 'FIT\n' ;
		}
			});
}
else
{
	result = "You need to give a correct numeric value for T lifetime and T service in order to appoximate the PMHF!";
}
result;