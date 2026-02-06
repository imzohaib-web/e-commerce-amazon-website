import { formatCurrency } from "../scripts/utils/money.js";

//testing using automated testing
//Basic test case
console.log('test suite : format currency')//name group of test
console.log('converts cents in dollars')
if(formatCurrency(2095) === '20.95'){
    console.log('passed')
}else{
    console.log('failed')
}

//edge test case 
console.log('works with 0');
if(formatCurrency(0) === '0.00'){
    console.log('passed')
}else{
    console.log('failed')
}

console.log('rounds up to the nearest cent')
if(formatCurrency(2000.5) === '20.01'){
    console.log('passed')
}else{
    console.log('failed')
}