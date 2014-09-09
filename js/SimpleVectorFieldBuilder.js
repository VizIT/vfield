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
    * Build a simple vector field, that is drawing vectors along field lines.
    * The vector field can be supplied explicitly, or by specifying electric
    * charges. If electric charges are specified, elcetric field vectors are
    * drawn.
    *
    * @class
    */
   ns.SimpleVectorFieldBuilder = function(framework_)
   {
     var errorMessage;
     var framework;
     var warningMessage;

     this.build = function(config)
     {
       var bindingsConfig;
       var builder;
       var chargeDistributionRE;
       var charges, pointChargeConfig, distributedChargeConfig;
       // An optional vector valued function.
       var field;
       var renderer;
       var startPointsConfig;
       // Name of properties on the config object.
       var property;

       chargeDistributionRE = /\s*charge\s*distribution\s*/i;
       charges = new Charges();

       for(var property in config)
       {
         if (property.toLowerCase() === "charges")
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

       if (charges.getNcharges() + charges.getNdistributions() > 0)
       {
         field = charges;
       }

       // SimpleVectorField(f, scale)
       renderer = new SimpleVectorField(field, 1.0);
       renderer.setMaxVectors(30);

       return renderer;
     }

     errorMessage   = "";
     framework      = framework_;
     warningMessage = "";
   }
 }(window.vizit.builder));

