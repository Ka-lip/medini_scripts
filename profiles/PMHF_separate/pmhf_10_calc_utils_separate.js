/*
This JavaScript file should be put in .lib folder with pmhf10_calc_utils.js.
The ancestor project, PMHF Approximation Project, can be downloaded on https://medini.ansys.com/ Sample Projects
*/
load('.lib/pmhf_10_calc_utils.js');
//Compute the PMHF using the patterns 1-4 from ISO 26262-10, section 8.3.2.4
function computePMHF_10_separate(worksheet, goal, variant) {
	var lambda_spf_rs = (goal!=undefined || variant != undefined) ? worksheet.getTotalSpfFailureRate(goal,variant): worksheet.totalSpfFailureRate;	
	var lambda_if_dpf = ZERO;
	var lambda_if_dpf_detected = ZERO;	
	var lambda_sm_dpf = ZERO;
	var lambda_sm_dpf_detected = ZERO;
	var lambda_if_dpf_latent = ZERO;
	var lambda_sm_dpf_latent = ZERO;

	worksheet.components.toArray().forEach(function (c) {
		if(worksheet.hidePorts && c.element.prototype == Metamodel.sysml.SysMLPortUsage)
		{
			//skip  ports if hide-ports option is active
		}
		else
		{	
			if((	worksheet.analysisDepth == -1 && (c.children.isEmpty() || !containsType(c.element.the_owned_elements, Metamodel.sysml.SysMLPart))		
																									// Metrics at Level leave incl. ports of leave elements
					|| 	worksheet.analysisDepth == 0  && !worksheet.restrictAnalysisDepth 			// Metrics at Level all
					||	worksheet.restrictAnalysisDepth && ((worksheet.analysisDepth == c.nestingLevel +1) || (c.element.prototype == Metamodel.sysml.SysMLPortUsage && worksheet.analysisDepth == c.nestingLevel))
			)	
																									// Metrics at Level x incl. ports of components at that level
			&&
			(c.safetyRelated || !c.safetyRelatedFor.isEmpty() && c.safetyRelatedFor.contains(goal)) //Only when completely safety related or safety related for concerned goal 
			&&
			(c.applicableFor.isEmpty() || c.applicableFor.contains(variant))						//Only when for all variants or for the variant of concern
			)
			{
				var dpf_detected = getDPF_detected_ofComponent(c, goal,variant);
				var dpf = getDPFofComponent(c, goal,variant).add(dpf_detected, PRECISION); 

				if (c.pmhf_type == "SM") {
					lambda_sm_dpf = lambda_sm_dpf.add(dpf);
					lambda_sm_dpf_detected = lambda_sm_dpf_detected.add(dpf_detected, PRECISION);
				}
				else  
				{																					//PMHF type == IF or not set
					lambda_if_dpf = lambda_if_dpf.add(dpf, PRECISION);
					lambda_if_dpf_detected = lambda_if_dpf_detected.add(dpf_detected, PRECISION);
				}

			}
		}
	});
	lambda_if_dpf_latent = lambda_if_dpf.subtract(lambda_if_dpf_detected, PRECISION);
	lambda_sm_dpf_latent = lambda_sm_dpf.subtract(lambda_sm_dpf_detected, PRECISION);

	var T_lifetime = asBD(worksheet.user_t_lifetime);
	var T_service = asBD(worksheet.user_t_service);

	return ['lamda of SPF + lambda of RF: ' + lambda_spf_rs.floatValue(), 
	    'Pattern 1: ' + 0.5 * lambda_sm_dpf_latent.floatValue() * lambda_if_dpf.floatValue() * T_lifetime / toFIT,
	    'Pattern 2: ' + lambda_sm_dpf_detected.floatValue() * lambda_if_dpf.floatValue() * T_service / toFIT,
	    'Pattern 3: ' + 0.5 * lambda_if_dpf_latent.floatValue() * lambda_sm_dpf.floatValue() * T_lifetime / toFIT,
	    'Pattern 4: ' + lambda_if_dpf_detected.floatValue() * lambda_sm_dpf.floatValue() * T_service / toFIT];
}