/**
 * Copyright 2013-2021 Vizit Solutions
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

"use strict";

// Define the global namespace root iff not already defined.
window.vizit         = window.vizit         || {};
window.vizit.builder = window.vizit.builder || {};

(function (ns)
 {
   /**
    * Build an electric field and accompanying visualization according to the
    * values passed in the configuration object.
    *
    * @param {vizit.field.Stage} stage_ General support for WebGL scenes.
    * @param {vizit.electricfield.ElectricField} renderer_ Specific functionality to render electric fields
    *
    * @class
    */
   ns.ElectricFieldElementBuilder = function (stage_, renderer_)
   {
     var errorMessage;
     var stage;
     var renderer;
     var warningMessage;

     this.buildELement = function (config, charges)
     {
       var builder;
       var type;

       const chargeRE             = /\s*charges?\s*$/i;
       const chargedCylinderRE    = /\s*charged\s*cylinder\s*/i;
       const chargedLineRE        = /\s*charged\s*line\s*/i;
       const chargedPlaneRE       = /\s*charged\s*plane\s*/i;
       const chargedSphereRE      = /\s*charged\s*sphere\s*/i;
       const gaussianCylinderRE   = /\s*gaussian\s*cylinder\s*/i;
       const gaussianSphereRE     = /\s*gaussian\s*sphere\s*/i;

       for(var property in config)
       {
         if (property.toLowerCase() === "type")
         {
           type = config[property];
           break;
         }
       }

       if (type.match(chargeRE))
       {
         builder = new vizit.builder.ChargesBuilder();
         charges = builder.build(config, charges, stage);
       }
       else if (type.match(chargedCylinderRE)
                || type.match(chargedLineRE)
                || type.match(chargedPlaneRE)
                || type.match(chargedSphereRE))
       {
         builder = new vizit.builder.DistributionBuilder();
         charges = builder.build(config, charges, stage);
       }
       else if (type.match(gaussianCylinderRE)
                || type.match(gaussianSphereRE))
       {
         builder = new vizit.builder.SurfaceBuilder();
         renderer = builder.build(config, renderer, stage);
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
     stage      = stage_;
     renderer       = renderer_;
     warningMessage = "";
   };
 }(window.vizit.builder));
