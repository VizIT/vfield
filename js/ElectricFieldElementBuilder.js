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
   ns.ElectricFieldElementBuilder = function (framework_, renderer_)
   {
     var errorMessage;
     var framework;
     var renderer;
     var warningMessage;
     // Extent of the scene, used to compute default scale, arrowSpacing and arrowHeadSize.
     var xMin, xMax;
     var yMin, yMax;
     var zMin, zMax;

     this.buildELement = function (config, charges)
     {
       var builder;
       var chargedCylinderRE;
       var chargedLineRE;
       var chargedPlaneRE;
       var chargedSphereRE;
       var elementsConfig;
       var gaussianCylinderRE;
       var gaussianSphereRE;
       var startPointsConfig;
       // Name of properties on the config object.
       var property;
       var type;

       chargedCylinderRE    = /\s*charged\s*cylinder\s*/i;
       chargedLineRE        = /\s*charged\s*line\s*/i;
       chargedPlaneRE       = /\s*charged\s*plane\s*/i;
       chargedSphereRE      = /\s*charged\s*sphere\s*/i;
       gaussianCylinderRE   = /\s*gaussian\s*cylinder\s*/i;
       gaussianSphereRE     = /\s*gaussian\s*sphere\s*/i;

       for(var property in config)
       {
         if (property.toLowerCase() === "type")
         {
           type = config[property];
         }
       }

       if (type.toLowerCase() === "charge")
       {
         builder = new vizit.builder.ChargesBuilder();
         charges = builder.build(config, charges, framework);
       }
       else if (type.match(chargedCylinderRE)
                || type.match(chargedLineRE)
                || type.match(chargedPlaneRE)
                || type.match(chargedSphereRE))
       {
         builder = new vizit.builder.DistributionBuilder();
         charges = builder.build(config, charges, framework);
       }
       else if (type.match(gaussianCylinderRE)
                || type.match(gaussianSphereRE))
       {
         builder = new vizit.builder.SurfaceBuilder();
         renderer = builder.build(config, renderer, framework);
       }

       return charges;
     };

    /**
      * Build one or more elements of an electric field visualization
      * as the config is a single element or an array.
      */
     this.build = function (config)
     {
       var charges;
       var nelements;

       charges = new vizit.electricfield.Charges();

       if (!!config)
       {
         if (Array.isArray(config))
         {
           nelements = config.length;
           for (var i=0; i<nelements; ++i)
           {
             this.buildELement(config[i], charges);
           }
         }
         else
         {
           this.buildELement(config, charges);
         }
       }
       return charges;
     };


     errorMessage   = "";
     framework      = framework_;
     renderer       = renderer_;
     xMin           = Number.POSITIVE_INFINITY;
     xMax           = Number.NEGATIVE_INFINITY;
     yMin           = Number.POSITIVE_INFINITY;
     yMax           = Number.NEGATIVE_INFINITY;
     zMin           = Number.POSITIVE_INFINITY;
     zMax           = Number.NEGATIVE_INFINITY;
     warningMessage = "";
   };
 }(window.vizit.builder));
