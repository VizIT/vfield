"use strict";

/**
 *  Copyright 2013-2014 Vizit Solutions
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

window.vizit         = window.vizit         || {};
window.vizit.utility = window.vizit.utility || {};

(function (ns)
 {
   /**
    * Ensure that the passed argument is a number. If a string, then
    * parse a a float. This is important as JS is perfectly operating
    * on strings as if they are numbers, but WebGL is not. WebGL
    * requires that numeric values be numbers.
    */
   ns.ensureNumber = function(value)
   {
     var number;

     if (typeof value === "number")
     {
       number = value;
     }
     else
     {
       number = parseFloat(value);
     }

     return number;
   };
 }(window.vizit.utility));