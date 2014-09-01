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
    * Build a visualization from a configuration class - most likely
    * an object literal.
    * TODO Break up into smaller classes?
    *
    * @class
    */
   ns.VizBuilder = function()
   {
     var errorMessage;
     var warningMessage;

     /**
      * Build an event handler that bings an element of the visualization
      * the changes in a value from an external source.
      */
     this.bindingBuilder       = function(config, framework)
     {
       var binding;
       /** The element of the visualization named as the target. */
       var element;
       /** The external variable used to make the update. */
       var from;
       /** The function, if any, that transforms the from variable to the set variable. */
       var mapping;
       /** The name of the method to make the update on the target. */
       var methodName;
       var property;
       /** The name of the variable on the object to be updated. */
       var set;
       /** The name of the object to be updated. */
       var target;
       /** The method on the target to set the variable. */
       var updater;

       for (property in config)
       {
         if (property.toLowerCase() === "target")
         {
           target = config[property];
         }
         else if (property.toLowerCase() === "set")
         {
           set = config[property];
         }
         else if (property.toLowerCase() === "from")
         {
           from = config[property];
         }
         else if (property.toLowerCase() === "mapping")
         {
           mapping = config[property];
         }
       }

       if (!from)
       {
         from = set;
       }

       methodName = "set" + set.charAt(0).toUpperCase();
       if (set.length > 1)
       {
         methodName += set.slice(1)
       }

       element = framework.getElementByName(target);
       updater = element[methodName];

       if (mapping)
       {
         binding = new MappingEventHandler(updater, from, mapping, framework);
       }
       else
       {
         binding = new DirectEventHandler(updater, framework);
       }
       // By convention in the lesson framework changes in var are named varChanged.
       document.addEventListener(from + "Changed", binding.handleUpdate.bind(binding),   false);
     }

     this.bindingsBuilder      = function(config, framework)
     {
       var binding;
       var nbindings;

       if (!!config)
       {
         if (Array.isArray(config))
         {
           nbindings = config.length;
           for (var i=0; i<nbindings; ++i)
           {
             binding = this.bindingBuilder(config, framework);
           }
         }
         else
         {
           binding = this.bindingBuilder(config, framework);
         }
       }
     }

     this.electricFieldBuilder = function(config)
     {
       var bindingsConfig;
       var builder;
       var chargeDistributionRE;
       var drawingSurface, drawingSurfaceID;
       var charges, pointChargeConfig, distributedChargeConfig;
       var framework;
       var renderer;
       var surfaceConfig;
       var startPointsConfig;
       // Name and value of the properties on the config object.
       var property, value;

       chargeDistributionRE = /\s*charge\s*distribution\s*/i;
       charges = new Charges();

       for(var property in config)
       {
         if(property.toLowerCase() === "canvas")
         {
           drawingSurfaceID = config[property];
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

       // If a canvas ID is defined
       if (!!drawingSurfaceID)
       {
         drawingSurface = document.getElementById(drawingSurfaceID);

         if (!!drawingSurface)
         {
           framework = new FieldRenderer(drawingSurface);
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
           renderer.setArrowSize(3.0);
           renderer.setArrowSpacing(30.0);

           if (surfaceConfig)
           {
             builder = new vizit.builder.SurfaceBuilder();
             renderer = builder.build(surfaceConfig, renderer, framework);
           }

           if (bindingsConfig)
           {
             this.bindingsBuilder(bindingsConfig, framework)
           }

           framework.setRenderer(renderer);
           framework.setScale(120.0);

           framework.start();
         }
         else
         {
           alert("Can not find canvas with id=\"" + config.canvas + "\".");
         }
       }
       else
       {
         alert("No canvas specified for " + config.type + " visualization.");
       }
     }

     this.simpleVectorFieldBuilder = function(config)
     {
       var drawingSurface, drawingSurfaceID;
       var charges, pointChargeConfig, distributedChargeConfig;
       // An optional vector valued function.
       var field;
       var renderer;
       var startPointsConfig;
       // Name and value of the properties on the config object.
       var property, value;

       console.log("Simple Vector Field matched " + config.type);
     }

     /**
      * Process a single visualization configuration. Peek at the type of config,
      * and pass it on for processing as appropriate to its type.
      *
      * @param config An object with a type attribute naming the
      *               type of visualization being configured.
      */
     this.processConfig = function(config)
     {
       var electricFieldRE;
       /** Case insnesitive match of "simple vector field" with or without spaces. */
       var simpleVectorFieldRE;
       var type;

       electricFieldRE     = /\s*electric\s*field\s*/i;
       simpleVectorFieldRE = /\s*simple\s*vector\s*field\s*/i;

       /** Case insensitive match of "electric field" with or without spaces. */
       type = config.type;

       if(!type)
       {
         alert("Missing type for visualization configuration.");
       }
       else
       {
         if (type.match(electricFieldRE))
         {
           this.electricFieldBuilder(config);
         }
         else if (type.match(simpleVectorFieldRE))
         {
           this.simpleVectorFieldBuilder(config);
         }
         else
         {
           alert("Unrecognized visualization type: " + type + ".");
         }
       }
     }

     this.process = function(config)
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

  if (VISUALIZATION_CONFIG)
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
