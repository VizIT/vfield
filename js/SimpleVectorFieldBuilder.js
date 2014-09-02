"use strict";

/**
 * Copyright 2013-2014 Vizit Solutions
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

// Define the global namespace root iff not already defined.
window.vizit         = window.vizit         || {};
window.vizit.builder = window.vizit.builder || {};

(function(ns)
 {
   /**
    * Build a visualization from a configuration class - most likely
    * an object literal.
    *
    * @class
    */
   ns.SimpleVectorFieldBuilder = function()
   {
     var errorMessage;
     var warningMessage;

     this.build = function(config)
     {
       var drawingSurface, drawingSurfaceID;
       var charges, pointChargeConfig, distributedChargeConfig;
       // An optional vector valued function.
       var field;
       var renderer;
       var startPointsConfig;
       // Name and value of the properties on the config object.
       var property, value;

       console.log("Simple Vector Field matched " + config.type);
     }

     errorMessage       = "";
     warningMessage     = "";
   }
 }(window.vizit.builder));

