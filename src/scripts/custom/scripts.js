"use strict";

const scripts1 = 'Scripts 1 File Exists yay';
console.log(scripts1);
// VENDOR JS
(function scriptTest1() {
  var scriptsShout1 = function(){
    console.log('SHOUT SCRITPS FILE 1 EXISTS');
  };
  return scriptsShout1;
}());
