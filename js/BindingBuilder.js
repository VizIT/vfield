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
    * Bind elements of the visualization to to events. Each events sets a variable on
    * the named target according to the change in some other variable.
    *
    * @class
    */
   ns.BindingBuilder = function ()
   {
     var errorMessage;
     var warningMessage;

     /**
      * Build an event handler that bings an element of the visualization
      * the changes in a value from an external source.
      */
     this.bindingBuilder       = function (config, framework)
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

     /**
      * Build one or more bindings as the config is a single object or an array
      * of objects.
      */
     this.build      = function (config, framework)
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

     errorMessage       = "";
     warningMessage     = "";
   }
 }(window.vizit.builder));
