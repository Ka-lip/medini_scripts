// $EXPERIMENTAL$ $STRICT_MODE
load(".lib/factory.js");
//load(".lib/DfaChecklistitem.js");
function main() {
        var template = finder.findByType(Metamodel.checklist.Checklist).and("name", "ZZ").first();

        //var template = finder.findByType(Metamodel.checklist.Checklist).and("name", "[Scripting] Tasklist: DFA  & Cutset").first();
        var context = {};
        if (template) {
            context['template'] = template;
        }
       
        var list = Factory.createElement(finder.getScope(), Metamodel.checklist.Checklist, context);
//    var targetChecklist = Factory.createElement(selection[0], Metamodel.checklist.Checklist);
};


main();
