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
    * Build an electric field and accompanying visualization according to the
    * values in the passed configuration object.
    *
    * @class
    */
   ns.ElectricFieldBuilder = function(framework_)
   {
     var errorMessage;
     var framework;
     // Extent of the scene, used to compute default scale, arrowSpace and arrowSize.
     var xMin, xMax;
     var yMin, yMax;
     var zMin, zMax;
     var warningMessage;

     this.build = function(config)
     {
       var arrowSize;
       var arrowSpacing;
       var bindingsConfig;
       var builder;
       var chargeDistributionRE;
       var charges, pointChargeConfig, distributedChargeConfig;
       var renderer;
       var surfaceConfig;
       var startPointsConfig;
       // Name of properties on the config object.
       var property;

       chargeDistributionRE = /\s*charge\s*distribution\s*/i;
       charges = new Charges();

       for(var property in config)
       {
         if (property.toLowerCase() === "arrowsize")
         {
           arrowSize = config[property];
         }
         else if (property.toLowerCase() === "arrowspacing")
         {
           arrowSpacing = config[property];
         }
         else if (property.toLowerCase() === "charges")
         {
           pointChargeConfig = config[property];
         }
         else if (property.toLowerCase() === "chargedistributions")
         {
           distributedChargeConfig = config[property]
         }
         else if (property.toLowerCase() ==="surfaces")
         {
           surfaceConfig = config[property];
         }
         else if (property.toLowerCase() ==="bindings")
         {
           bindingsConfig = config[property];
         }
       }

       if (pointChargeConfig)
       {
         builder = new vizit.builder.ChargesBuilder();
         charges = builder.build(pointChargeConfig, charges, framework);
       }
        
       if(distributedChargeConfig)
       {
         builder = new vizit.builder.DistributionBuilder();
         charges = builder.build(distributedChargeConfig, charges, framework);
       }
       renderer = new ElectricField(charges);
       renderer.setMaxVectors(30);
       if (typeof arrowSize !== "undefined")
       {
         renderer.setArrowSize(arrowSize);
       }
       if (typeof arrowSpacing !== "undefined")
       {
         renderer.setArrowSpacing(arrowSpacing);
       }

       if (surfaceConfig)
       {
         builder = new vizit.builder.SurfaceBuilder();
         renderer = builder.build(surfaceConfig, renderer, framework);
       }

       if (bindingsConfig)
       {
         builder = new window.vizit.builder.BindingBuilder();
         builder.build(bindingsConfig, framework)
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
