"use strict";

/**
 *  Copyright 2014 Vizit Solutions
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

window.vizit             = window.vizit             || {};
window.vizit.vectorfield = window.vizit.vectorfield || {};

(function (ns)
 {
   /**
    * A skeleton providing base functionality for a vector function with an assignable
    * function.
    *
    * @param {string} args     The input arguments to the function body. Usually x, y, z. Eventually
    *                          support r, theta, phi.
    * @param {string} body     The body of the function, must return a three dimensional array.
    *
    * @class
    */
   ns.VectorFunction = function (args, body)
   {
     var modified;
     var name;

     this.setModified        = function (modified_)
     {
       modified = modified_;
     };

     this.isModified         = function ()
     {
       return modified;
     };

     this.setName            = function (name_)
     {
       name = name_;
     };

     this.getName            = function ()
     {
       return name;
     };

     this.shouldStop      = function (sgn, x, y, z)
     {
       var minR2;

       minR2  = 4;

       // If we are tracing a field line forward to a positive charge
       // or backwards to a negative charge, skip the computation.
       // This corresponds to tracing a field line from a negative charge
       // to a negative charge, or from a positive charge to a positive
       // charge - where the field line should not terminate.

       return sgn * Q < 0.0 && r2 < minR2;
     };

     this.getField = new Function(args, body);
     modified      = true;
   };
}(window.vizit.vectorfield));
