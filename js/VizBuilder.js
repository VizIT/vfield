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
       var bindingsConfig;
       var builder;
       var drawingSurface, drawingSurfaceID;
       /** Case insensitive match of "electric field" with or without spaces. */
       var electricFieldRE;
       var framework;
       var property;
       var renderer;
       var scale;
       /** Case insnesitive match of "simple vector field" with or without spaces. */
       var simpleVectorFieldRE;
       var type;

       electricFieldRE     = /\s*electric\s*field\s*/i;
       simpleVectorFieldRE = /\s*simple\s*vector\s*field\s*/i;

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
         else if (property.toLowerCase() ==="bindings")
         {
           bindingsConfig = config[property];
         }
       }

       if(typeof type === "undefined")
       {
         alert("Missing type for visualization configuration.");
       }
       else if (drawingSurfaceID === "undefined")
       {
         alert("No canvas specified, please provide the id of a canvas.");
       }
       else
       {
         drawingSurface = document.getElementById(drawingSurfaceID);
         
         if (drawingSurface)
         {
           framework = new vizit.field.FieldRenderer(drawingSurface);

           if (type.match(electricFieldRE))
           {
             builder  = new vizit.builder.ElectricFieldBuilder(framework);
             renderer = builder.build(config);
           }
           else if (type.match(simpleVectorFieldRE))
           {
             builder  = new vizit.builder.SimpleVectorFieldBuilder(framework);
             renderer = builder.build(config);
           }
           else
           {
             alert("Unrecognized visualization type: " + type + ".");
           }

           if (renderer)
           {
             if (bindingsConfig)
             {
               // This builder will lookup elements of the visualization by name
               // from the framework.
               builder = new vizit.builder.BindingBuilder();
               builder.build(bindingsConfig, framework)
             }

             framework.setRenderer(renderer);

             if (typeof scale !== "undefined")
             {
               framework.setScale(scale);
             }

             framework.start();
	   }
         }
         else
         {
           alert("Can not find canvas with id=\"" + drawingSurfaceID + "\".");
         }
       }
     }

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
     }

     errorMessage       = "";
     warningMessage     = "";
   }
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
