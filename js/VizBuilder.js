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
    * Build a visualization from a configuration class - most likely
    * an object literal.
    *
    * @class
    */
   ns.VizBuilder = function ()
   {
     var errorMessage;
     var warningMessage;

     /**
      * Process a single visualization configuration. Peek at the type of config,
      * and pass it on for processing as appropriate to its type.
      *
      * @param config An object with a type attribute naming the
      *               type of visualization being configured.
      */
     this.processConfig = function (config)
     {
       var builder;
       var drawingSurface, drawingSurfaceID;
       var name;
       var renderer;
       var scale;
       var startPoints;
       var type;

       /** Case insensitive match of "electric field" with or without spaces. */
       const electricFieldRE     = /\s*electric\s*field\s*/i;
       /** Case insensitive match of "simple vector field" with or without spaces. */
       const simpleVectorFieldRE = /\s*simple\s*vector\s*field\s*/i;
       /** Case insensitive match of "start points" with or without spaces. */
       const startPointsRE       = /\s*start\s*points\s*/i;

       for(var property in config)
       {
         if(property.toLowerCase() === "canvas")
         {
           drawingSurfaceID = config[property];
         }
         else if (property.toLowerCase() === "scale")
         {
           scale = config[property];
         }
         else if (property.toLowerCase() === "type")
         {
           type = config[property];
         }
         else if (property.toLowerCase() === "name")
         {
           name = config[property];
         }
         else if (property.match(startPointsRE))
         {
           startPoints = config[property];
         }
       }

       if(typeof type === "undefined")
       {
         alert("Missing type for visualization configuration.");
       }
       else if (typeof drawingSurfaceID === "undefined")
       {
         alert("No canvas specified, please provide the id of a canvas.");
       }
       else
       {
         drawingSurface = document.getElementById(drawingSurfaceID);
         
         if (drawingSurface)
         {
           const stage = new vizit.field.Stage(drawingSurface);

           if (type.match(electricFieldRE))
           {
             builder  = new vizit.builder.ElectricFieldBuilder(stage);
             renderer = builder.build(config);
           }
           else if (type.match(simpleVectorFieldRE))
           {
             builder  = new vizit.builder.SimpleVectorFieldBuilder(stage);
             renderer = builder.build(config);
           }
           else
           {
             alert("Unrecognized visualization type: " + type + ".");
           }

           if (renderer)
           {
             if (typeof scale !== "undefined")
             {
               stage.setScale(scale);
             }
             if (typeof name !== "undefined")
             {
               vizit.visualizations.register(name, stage);
             }
             if (typeof startPoints !== "undefined")
             {
               renderer.addStartPoints(startPoints);
             }

             stage.start();
	       }
         }
         else
         {
           alert("Can not find canvas with id=\"" + drawingSurfaceID + "\".");
         }
       }
     };

     this.process = function (config)
     {
       var nvisualizations;

       if (config)
       {
         if (Array.isArray(config))
         {
           nvisualizations = config.length;
           for(var i=0; i<nvisualizations; ++i)
           {
             this.processConfig(config[i]);
           }
         }
         else
         {
           this.processConfig(config);
         }
       }
     };

     errorMessage       = "";
     warningMessage     = "";
   };
 }(window.vizit.builder));


/**
 * Invoked on DOM Content Loaded, configs Vfield according to
 * VISUALIZATION_CONFIG if it exists.
 */
function VIZ_CONFIG_IF_EXISTS(event)
{
  var VIZ_CONFIG_PROCESSOR;

  if (typeof VISUALIZATION_CONFIG !== 'undefined')
  {
    VIZ_CONFIG_PROCESSOR = new vizit.builder.VizBuilder();
    VIZ_CONFIG_PROCESSOR.process(VISUALIZATION_CONFIG);
  }
}

// These are possible states after DOMContentLoaded.
if (document.readyState === "interactive" || document.readyState === "complete")
{
  VIZ_CONFIG_IF_EXISTS();
}
else
{
  document.addEventListener("DOMContentLoaded", VIZ_CONFIG_IF_EXISTS);
}
