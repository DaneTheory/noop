"use strict";

const shout1 = 'HELLO WORLD 1';
console.log(shout1);
// VENDOR JS
(function test1() {
  var alertShout1 = function(){
    console.log('VENDOR 1 FILE EXISTS');
  };
  return alertShout1;
}());
