"use strict";

const shout2 = 'HELLO WORLD 2';
console.log(shout2);
// VENDOR JS
(function test2() {
  var alertShout2 = function(){
    console.log('VENDOR FILE 2 EXISTS');
  };
  return alertShout2;
}());
