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
    * Build one or more point charges as defined on a configuration object.
    *
    * @class
    */
   ns.ChargesBuilder = function ()
   {
     var errorMessage;
     var xMin, xMax;
     var yMin, yMax;
     var zMin, zMax;
     var warningMessage;

     this.getXMin = function ()
     {
       return xMin;
     };

     this.getXMax = function ()
     {
       return xMax;
     };
      
     this.getYMin = function ()
     {
       return yMin;
     };

     this.getYMax = function ()
     {
       return yMax;
     };
      
     this.getZMin = function ()
     {
       return zMin;
     };

     this.getZMax = function ()
     {
       return zMax;
     };
      
     /**
      * Build a single point charge from the charges section of the config object.
      *
      * @param {object} config The portion of a visualization configuration
      *                        defining a single point charge.
      * @param {Stage} stage to place interactive graphics
      */
     this.chargeBuilder = function (config, stage)
     {
       /** Config for binding the charge to external variable changes. */
       var binding;
       /** The charge built from the config. */
       var charge;
       /** Error message why the error flag was set. */
       var message;
       /** The name of this element */
       var name;
       // Position of the charge
       var x, y, z;
       // number of field lines per unit charge, or the number of field lines.
       var fieldLineDensity, nfieldLines;
       // Name of the properties on the config object.
       var property;
       // Magnitude of the charge
       var q;

       // We know in what follows that this is a string.
       message            = "";

       const fieldLineDensityRE = /\s*field\s*line\s*density\s*/i;

       // Reasonable becaue this is a small object with few properties.
       for(property in config)
       {
         if(property.toLowerCase() === "charge")
         {
           q = config[property];
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
         else if (property.match(fieldLineDensityRE))
         {
           fieldLineDensity = config[property];
         }
         else if (property.toLowerCase() === "nfieldlines")
         {
           nfieldLines = config[property];
         }
         else if (property.toLowerCase() === "bind")
         {
           binding = config[property];
         }
         else if (property.toLowerCase() === "name")
         {
           name = config[property];
         }
       }

       if (typeof q === "undefined")
       {
         message += "No charge specified for point charge.\n";
       }

       if (typeof x === "undefined")
       {
         if (message.length > 0)
         {
           message += "\n";
         }
         message += "x coordinate is not defined in charge configuration.\n";
       }

       if (typeof y === "undefined")
       {
         if (message.length > 0)
         {
           message += "\n";
         }
         message += "y coordinate is not defined in charge configuration.\n";
       }

       if (typeof z === "undefined")
       {
         if (message.length > 0)
         {
           message += "\n";
         }
         message += "z coordinate is not defined in charge configuration.\n";
       }

       if (message.length === 0)
       {
         if (x < xMin)
         {
           xMin = x;
         }
         if (x > xMax)
         {
           xMax = x;
         }

         if (y < yMin)
         {
           yMin = y;
         }
         if (y > yMax)
         {
           yMax = y;
         }

         if (z < zMin)
         {
           zMin = z;
         }
         if (z > zMax)
         {
           zMax = z;
         }

         charge = new vizit.electricfield.Charge(x, y, z, q, fieldLineDensity, nfieldLines, name);

         if (typeof binding !== "undefined")
         {
           this.bind(charge, binding, stage);
         }
       }

       return {
         charge: charge,
         message: message
       };
     };

     /**
      * Process one or more charges provided in a visualization configuration into
      * a Charges collection
      *
      * @param   {object|Array} Configuration object for a single charge or array of charges,
      *                         each of which specifies a charge, Q, position (x,y,z) and
      *                         optionally rho, the ratio of field lines to charge, or lines,
      *                         the count of field lines.
      *
      * @returns {Charges}
      */
     this.build = function (config, charges, stage)
     {
       var name;
       var ncharges;

       if (!!config)
       {
         if (Array.isArray(config))
         {
           ncharges = config.length;
           for (var i=0; i<ncharges; ++i)
           {
             const built = this.chargeBuilder(config[i], stage);
             const charge = built.charge;
             if (built.message)
             {
               console.log(built.message);
             }
             // Only add the charge if chargeBuilder returns a non null result.
             if (!!charge)
             {
               charges.addCharge(charge);
               name = charge.getName();
               if (name)
               {
                 stage.setElementName(charge, name);
               }
             }
           }
         }
         else
         {
           const built = this.chargeBuilder(config, stage);
           const charge = built.charge;
           if (built.message)
           {
             console.log(built.message);
           }
           // Only add the charge if chargeBuilder returns a non null result.
           if (!!charge)
           {
             charges.addCharge(charge);
             name = charge.getName();
             if (name)
             {
               stage.setElementName(charge, name);
             }
           }
         }
       }
       return charges;
     };
     errorMessage   = "";
     xMin           = Number.POSITIVE_INFINITY;
     xMax           = Number.NEGATIVE_INFINITY;
     yMin           = Number.POSITIVE_INFINITY;
     yMax           = Number.NEGATIVE_INFINITY;
     zMin           = Number.POSITIVE_INFINITY;
     zMax           = Number.NEGATIVE_INFINITY;
     warningMessage = "";
   };

   ns.ChargesBuilder.prototype = ns.bindingBuilder;
 }(window.vizit.builder));
