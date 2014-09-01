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
    * Build charge distributions as described in the configuration object.
    *
    * @class
    */
   ns.DistributionBuilder = function()
   {
     var chargeDensityRE;
     var fieldLineDensityRE;
     var errorMessage;
     var warningMessage;
      
     /**
      * Pull out elements from a charged plane configuration and
      * construct the corresponding charged plane.
      *
      * @param {object} config Has type "charged plane", with charge density
      *                 chargeDensity, field line density fieldLineDensity, and bounding box
      *                 {(x1, y1, z1), (x2, y2, z2), (x3, y3, z3), (x4, y4, z4)}.
      */
     this.chargedPlaneBuilder      = function(config)
     {
       var chargedPlane;
       var property;
       var chargeDensity;
       var fieldLineDensity;
       /** The name of this element */
       var name;
       var x0, y0, z0;
       var x1, y1, z1;
       var x2, y2, z2;
       var x3, y3, z3;

       for (property in config)
       {
         if (property.match(chargeDensityRE))
         {
           chargeDensity = config[property];
         }
         else if (property.match(fieldLineDensityRE))
         {
           fieldLineDensity = config[property];
         }
         else if (property.toLowerCase() === "x0")
         {
           x0 = config[property];
         }
         else if (property.toLowerCase() === "y0")
         {
           y0 = config[property];
         }
         else if (property.toLowerCase() === "z0")
         {
           z0 = config[property];
         }
         else if (property.toLowerCase() === "x1")
         {
           x1 = config[property];
         }
         else if (property.toLowerCase() === "y1")
         {
           y1 = config[property];
         }
         else if (property.toLowerCase() === "z1")
         {
           z1 = config[property];
         }
         else if (property.toLowerCase() === "x2")
         {
           x2 = config[property];
         }
         else if (property.toLowerCase() === "y2")
         {
           y2 = config[property];
         }
         else if (property.toLowerCase() === "z2")
         {
           z2 = config[property];
         }
         else if (property.toLowerCase() === "x3")
         {
           x3 = config[property];
         }
         else if (property.toLowerCase() === "y3")
         {
           y3 = config[property];
         }
         else if (property.toLowerCase() === "z3")
         {
           z3 = config[property];
         }
         else if (property.toLowerCase() === "name")
         {
           name = config[property];
         }
       }

       chargedPlane = new ChargedPlane(chargeDensity,
                                       fieldLineDensity,
                                       x0, y0, z0,
                                       x1, y1, z1,
                                       x2, y2, z2,
                                       x3, y3, z3,
                                       name);

       return chargedPlane;
     }

     /**
      * Pull out the elements from a charged clylinder configuration object, and
      * construct the corresponding charged cylinder.
      *
      * @param {object} config has the type "charged cylinder" with charge density
      *                 chargeDensity, field line density fieldLineDensity, inner redius r0, and outer
      *                 radius r1. The section of the cylinder between (x0, y0, z0)
      *                 and (x1, y1, z1) is drawn.
      */
     this.chargedCylinderBuilder   = function(config)
     {
       var chargedCylinder;
       var property;
       // Charge density and field lines per unit charge.
       var chargeDensity, fieldLineDensity;
       /** The name of this element */
       var name;
       // Center point of one end of the rendered section of an infinite cylinder.
       var x0, y0, z0;
       // The other end of the rendered section of the cylinder.
       var x1, y1, z1;
       // Inner and outer radii of the cylinder.
       var r0, r1;

       for (property in config)
       {
         if (property.match(chargeDensityRE))
         {
           chargeDensity = config[property];
         }
         else if (property.match(fieldLineDensityRE))
         {
           fieldLineDensity = config[property];
         }
         else if (property.toLowerCase() === "x0")
         {
           x0 = config[property];
         }
         else if (property.toLowerCase() === "y0")
         {
           y0 = config[property];
         }
         else if (property.toLowerCase() === "z0")
         {
           z0 = config[property];
         }
         else if (property.toLowerCase() === "x1")
         {
           x1 = config[property];
         }
         else if (property.toLowerCase() === "y1")
         {
           y1 = config[property];
         }
         else if (property.toLowerCase() === "z1")
         {
           z1 = config[property];
         }
         else if (property.toLowerCase() === "r0")
         {
           r0 = config[property];
         }
         else if (property.toLowerCase() === "r1")
         {
           r1 = config[property];
         }
         else if (property.toLowerCase() === "name")
         {
           name = config[property];
         }
       }

       chargedCylinder = new ChargedCylinder(x0, y0, z0,
                                             x1, y1, z1,
                                             r0, r1,
                                             chargeDensity,
                                             fieldLineDensity,
                                             name);

       return chargedCylinder;
     }

     this.chargedLineBuilder       = function(config)
     {
       var chargedLine;
       var property;
       var chargeDensity, fieldLineDensity;
       /** The name of this element */
       var name;
       // Center point of one end of the rendered section of an infinite cylinder.
       var x0, y0, z0;
       // The other end of the rendered section of the cylinder.
       var x1, y1, z1;

       for (property in config)
       {
         if (property.match(chargeDensityRE))
         {
           chargeDensity = config[property];
         }
         else if (property.match(fieldLineDensityRE))
         {
           fieldLineDensity = config[property];
         }
         else if (property.toLowerCase() === "x0")
         {
           x0 = config[property];
         }
         else if (property.toLowerCase() === "y0")
         {
           y0 = config[property];
         }
         else if (property.toLowerCase() === "z0")
         {
           z0 = config[property];
         }
         else if (property.toLowerCase() === "x1")
         {
           x1 = config[property];
         }
         else if (property.toLowerCase() === "y1")
         {
           y1 = config[property];
         }
         else if (property.toLowerCase() === "z1")
         {
           z1 = config[property];
         }
         else if (property.toLowerCase() === "name")
         {
           name = config[property];
         }
       }

       chargedLine = new ChargedLine(x0, y0, z0,
                                     x1, y1, z1,
                                     chargeDensity,
                                     fieldLineDensity,
                                     name);

       return chargedLine;
     }

     this.chargedSphereBuilder      = function(config)
     {
       var chargedSphere;
       var charge;
       var fieldLineDensity;
       /** The name of this element */
       var name;
       // The center of the sphere.
       var x, y, z;
       // The inner and outer radius.
       var a, b;

       for (property in config)
       {
         if (property.toLowerCase() === "charge")
         {
           charge = config[property];
         }
         else if (property.match(fieldLineDensityRE))
         {
           fieldLineDensity = config[property];
         }
         else if (property.toLowerCase() === "x")
         {
           x = config[property];
         }
         else if (property.toLowerCase() === "y")
         {
           y = config[property];
         }
         else if (property.toLowerCase() === "z")
         {
           z = config[property];
         }
         else if (property.toLowerCase() === "a")
         {
           a = config[property];
         }
         else if (property.toLowerCase() === "b")
         {
           b = config[property];
         }
         else if (property.toLowerCase() === "name")
         {
           name = config[property];
         }
       }

       chargedSphere = new ChargedSphere(charge,
                                         fieldLineDensity,
                                         x, y, z,
                                         a, b,
                                         name);

       return chargedSphere;
     }

     /**
      * Peek at the type of charge distribution, and dispatch the
      * config to the appropriate builder.
      */
     this.chargeDistributionBuilder = function(config)
     {
       var chargedCylinderRE;
       var chargedLineRE;
       var chargedPlaneRE;
       var chargedSphereRE;
       var distribution;
       var property;
       var type;

       chargedCylinderRE = /\s*charged\s*cylinder\s*/i;
       chargedLineRE     = /\s*charged\s*line\s*/i;
       chargedPlaneRE    = /\s*charged\s*plane\s*/i;
       chargedSphereRE   = /\s*charged\s*sphere\s*/i;

       for (property in config)
       {
         if(property.toLowerCase() === "type")
         {
           type = config[property];
           break;
         }
       }

       if (type.match(chargedPlaneRE))
       {
         distribution = this.chargedPlaneBuilder(config);
       }
       else if (type.match(chargedCylinderRE))
       {
         distribution = this.chargedCylinderBuilder(config);
       }
       else if (type.match(chargedLineRE))
       {
         distribution = this.chargedLineBuilder(config);
       }
       else if (type.match(chargedSphereRE))
       {
         distribution = this.chargedSphereBuilder(config);
       }

       return distribution;
     }

     /**
      * Build one or more charge distributions as defined in a
      * charge distribution attribute.
      * TODO: Repeated pattern, make use a pluggable strategy?
      */
     this.build = function(config, charges, framework)
     {
       var distribution;
       var name;
       var ndistributions;

       if (!!config)
       {
         if (Array.isArray(config))
         {
           ndistributions = config.length;
           for (var i=0; i<ndistributions; ++i)
           {
             distribution = this.chargeDistributionBuilder(config[i]);
             // Only add the charge if chargeBuilder returns a non null result.
             if (!!distribution)
             {
               charges.addDistribution(distribution);
               name = distribution.getName();
               if (name)
               {
                 framework.setElementName(distribution, name)
               }
             }
           }
         }
         else
         {
           distribution = this.chargeDistributionBuilder(config);
           // Only add the charge if chargeBuilder returns a non null result.
           if (!!distribution)
           {
             charges.addDistribution(distribution);
             name = distribution.getName();
             if (name)
             {
               framework.setElementName(distribution, name)
             }
           }
         }
       }
       return charges;
     }

     // Common RE's acros multiple methods.
     chargeDensityRE    = /\s*charge\s*density\s*/i;
     fieldLineDensityRE = /\s*field\s*line\s*density\s*/i;
   }
 }(window.vizit.builder));

