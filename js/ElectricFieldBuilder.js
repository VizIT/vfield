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

(function (ns)
 {
   /**
    * Build an electric field and accompanying visualization according to the
    * values in the passed configuration object.
    *
    * @class
    */
   ns.ElectricFieldBuilder = function (framework_)
   {
     var errorMessage;
     var framework;
     // Extent of the scene, used to compute default scale, arrowSpacing and arrowHeadSize.
     var xMin, xMax;
     var yMin, yMax;
     var zMin, zMax;
     var warningMessage;

     this.build = function (config)
     {
       var arrowHeadSize;
       var arrowSpacing;
       var builder;
       var charges;
       var elementsConfig;
       var maxVectors;
       // Name of properties on the config object.
       var property;
       var renderer;
       var startPointsConfig;

       for(property in config)
       {
         if (property.toLowerCase() === "arrowheadsize")
         {
           arrowHeadSize = config[property];
         }
         else if (property.toLowerCase() === "arrowspacing")
         {
           arrowSpacing = config[property];
         }
         else if (property.toLowerCase() === "maxvectors")
         {
           maxVectors = config[property];
         }
         else if (property.toLowerCase() === "elements")
         {
           elementsConfig = config[property];
         }
       }

       renderer = new ElectricField();

       if(typeof maxVectors !== "undefined")
       {
         renderer.setMaxVectors(maxVectors);
       }
       if (typeof arrowHeadSize !== "undefined")
       {
         renderer.setArrowHeadSize(arrowHeadSize);
       }
       if (typeof arrowSpacing !== "undefined")
       {
         renderer.setArrowSpacing(arrowSpacing);
       }

       // Potentially can modify framework, charges and renderer.
       builder = new vizit.builder.ElectricFieldElementBuilder(framework, renderer);
       charges = builder.build(elementsConfig, charges);
       if (!!charges)
       {
         renderer.setCharges(charges);
       }
       return renderer;
     }

     errorMessage   = "";
     framework      = framework_;
     xMin           = Number.POSITIVE_INFINITY;
     xMax           = Number.NEGATIVE_INFINITY;
     yMin           = Number.POSITIVE_INFINITY;
     yMax           = Number.NEGATIVE_INFINITY;
     zMin           = Number.POSITIVE_INFINITY;
     zMax           = Number.NEGATIVE_INFINITY;
     warningMessage = "";
   }
 }(window.vizit.builder));
