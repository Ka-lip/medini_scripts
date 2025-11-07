// This script demonstartes how to reverse the order of EMF objects.
// Usage: right-click on a function, execute the script, and the malfunctions of the function will be reversed.
//
//
var order = selection[0].failures.toArray();
order.reverse(); // this reverses the original order
// order.sort((a, b) => a.id < b.id ? 1 : -1 ) // this orders in descending order of id
// order.sort((a, b) => a.id > b.id ? 1 : -1 ); // this orders in ascending order of id
selection[0].failures = java.util.Arrays.asList(order);
