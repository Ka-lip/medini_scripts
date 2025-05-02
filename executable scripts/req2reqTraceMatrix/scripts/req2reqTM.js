// $EXPERIMENTAL$ $STRICT_MODE$ $ENHANCED_CONTAINMENT_ACCESS$ $ENHANCED_JAVA_ACCESS$
load(".lib/factory.js");
load(".lib/trashbin.js");
load(".lib/ui.js");

var kindString = "REQ2REQ";
function Req(req) {
  this.getReq = function () {
    return req;
  };
  this.getContributesTo = function () {
    return req.contributesTo.toArray();
  };
  this.setTrace = function (target, kind) {
    if (!kind) {
      kind = kindString;
    }
    var trace = Factory.createRelation(
      req,
      target,
      Metamodel.traceability.Trace
    );
    trace.type = kind;
    return trace;
  };
  this.getSubReqs = function (type) {
    // if shallow search only, no argument. otherwise deep search
    if (!type) {
      return req.subRequirements.toArray();
    }
    function iter(req, reqs) {
      if (!reqs) {
        reqs = [];
      }
      console.log(req.name);
      reqs.push(req);
      var subReqs = req.subRequirements.toArray();
      for (var i = 0; i < subReqs.length; i++) {
        var nextReq = subReqs[i];
        iter(nextReq, reqs);
      }
      return reqs;
    }
    return iter(this.getReq(), []);
  };
  this.getTraces = function (metamodel, kind) {
    if (!metamodel) {
      metamodel = Metamodel.Any;
    }
    if (!kind) {
      kind = kindString;
    }
    return req.mediniGetTracedElements(metamodel,kindString).toArray();
  };
  this.removeTraces = function () {
    var tracesToRemove = this.getTraces();
    for (var i = 0; i < tracesToRemove.length; i++) {
      Trashbin.deleteRelation(
        req,
        tracesToRemove[i],
        Metamodel.traceability.Trace
      );
    }
  };
}

function ReqModel(reqMod) {
  this.getReqMod = function () {
    return reqMod;
  };
  this.getReqs = function (type) {
    var rs = reqMod.requirements.toArray();
    if (!type) {
      return rs;
    }
    var subr;
    var subrs = [];
    for (var i = 0; i < rs.length; i++) {
      subr = new Req(rs[i]);
      subrs = subrs.concat(subr.getSubReqs("deep"));
    }
    return subrs;
  };
}

function main(scope) {
  if (!scope) {
    scope = selection;
  }
  var action = selectOption(
    "Setup or Clean up?",
    "Select SETUP if you want to setup for a trace matrix; select CLEAN UP if you want to remove traces created by this script.",
    ["SETUP", "CLEAN UP"]
  );
  var k_scope, rm, reqs, req, contributesToReqs;
  for (var k = 0; k < scope.length; k++) {
    k_scope = scope[k];
    if ((!scope) instanceof Metamodel.safetygoals.SafetyRequirementsModel) {
      continue;
    }
    rm = new ReqModel(k_scope);
    reqs = rm.getReqs("deep");
    for (var i = 0; i < reqs.length; i++) {
      req = new Req(reqs[i]);
      req.removeTraces();
    }
    if (action == 1) {
      continue;
    }
    for (var i = 0; i < reqs.length; i++) {
      req = new Req(reqs[i]);
      contributesToReqs = req.getContributesTo();
      for (var j = 0; j < contributesToReqs.length; j++) {
        req.setTrace(contributesToReqs[j]);
      }
    }
  }
}

main();
