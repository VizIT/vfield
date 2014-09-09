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
    * Build one or more point charges as defined on a configuration object.
    *
    * @class
    */
   ns.ChargesBuilder = function()
   {
     var errorMessage;
     var fieldLineDensityRE;
     var xMin, xMax;
     var yMin, yMax;
     var zMin, zMax;
     var warningMessage;

     this.getXMin = function()
     {
       return xMin;
     }

     this.getXMax = function()
     {
       return xMax;
     }
      
     this.getYMin = function()
     {
       return yMin;
     }

     this.getYMax = function()
     {
       return yMax;
     }
      
     this.getZMin = function()
     {
       return zMin;
     }

     this.getZMax = function()
     {
       return zMax;
     }
      
     /**
      * Build a single point charge from the charges section of the config object.
      *
      * @param {object} config The portion of a visualization configuration
      *                        defining a single point charge.
      */
     this.chargeBuilder = function(config)
     {
       var charge;
       /** Error message why the error flag was set. */
       var message;
       /** The name of this element */
       var name;
       // Magnitude of the charge
       var q;
       // Position of the charge
       var x, y, z;
       // number of field lines per unit charge, or the number of field lines.
       var rho, nlines;
       // Name and value of the properties on the config object.
       var property, value;

       // We know in what follows that this is a string.
       message = "";

       // Reasonable becaue this is a small object with few properties.
       for(var property in config)
       {
         if(property.toLowerCase() === "q")
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
         else if (property.toLowerCase() === "rho")
         {
           rho = config[property];
         }
         else if (property.toLowerCase() === "nlines")
         {
           nlines = config[property];
         }
         else if (property.toLowerCase() === "name")
         {
           name = config[property];
         }
       }

       if (typeof q === "undefined")
       {
         message = "No charge (Q) on electric charge.";
       }

       if (typeof x === "undefined")
       {
         if (message.length > 0)
         {
           message += "\n";
         }
         message += "x coordinate is not defined in charge configuration.";
       }

       if (typeof y === "undefined")
       {
         if (message.length > 0)
         {
           message += "\n";
         }
         message += "y coordinate is not defined in charge configuration.";
       }

       if (typeof z === "undefined")
       {
         if (message.length > 0)
         {
           message += "\n";
         }
         message += "z coordinate is not defined in charge configuration.";
       }

       if (message.length == 0)
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

         charge = new Charge(q, x, y, z, rho, name);
       }

       return charge;
     }

     /**
      * Process one or more charges provided in a visualization configuration into
      * a Charges collection
      *
      * @param   {object|Array} Configuraction object fo a single charge or array of charges,
      *                         each of which specifices a charge, Q, position (x,y,z) and
      *                         optionally rho, the ratio of field lines to charge, or lines,
      *                         the count of field lines.
      *
      * @returns {Charges}
      */
     this.build = function(config, charges, framework)
     {
       var charge;
       var name;
       var ncharges;

       if (!!config)
       {
         if (Array.isArray(config))
         {
           ncharges = config.length;
           for (var i=0; i<ncharges; ++i)
           {
             charge = this.chargeBuilder(config[i]);
             // Only add the charge if chargeBuilder returns a non null result.
             if (!!charge)
             {
               charges.addCharge(charge);
               name = charge.getName();
               if (name)
               {
                 framework.setElementName(charge, name)
               }
             }
           }
         }
         else
         {
           charge = this.chargeBuilder(config);
           // Only add the charge if chargeBuilder returns a non null result.
           if (!!charge)
           {
             charges.addCharge(charge);
             name = charge.getName();
             if (name)
             {
               framework.setElementName(charge, name)
             }
           }
         }
       }
       return charges;
     }
     errorMessage   = "";
     xMin           = Number.POSITIVE_INFINITY;
     xMax           = Number.NEGATIVE_INFINITY;
     yMin           = Number.POSITIVE_INFINITY;
     yMax           = Number.NEGATIVE_INFINITY;
     zMin           = Number.POSITIVE_INFINITY;
     zMax           = Number.NEGATIVE_INFINITY;
     warningMessage = "";
   }
 }(window.vizit.builder));
