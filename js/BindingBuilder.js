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

"use strict";

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
      * 
      * @param {Object} target A JS object that has a setVar method, where Var is named
      *                        in the config set field.
      * @param {Object} config A JS object whose attributes describe one or more bindings.
      * @param {ElectricField | SimpleVectorField}
      *                 framework A JS container of the field definitions, with
      *                 which elements are registered by name.
      */
     this.bindingBuilder       = function (target, config, framework)
     {
       var binding;
       /** The external variable used to make the update. */
       var from;
       /** The function, if any, that transforms the from variable to the set variable. */
       var mapping;
       /** The name of the method to make the update on the target. */
       var methodName;
       var property;
       /** The name of the variable on the object to be updated. */
       var set;
       /** The method on the target to set the variable. */
       var updater;

       for (property in config)
       {
         if (property.toLowerCase() === "set")
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
         methodName += set.slice(1);
       }

       updater = target[methodName];
       if (updater) {
         updater = updater.bind(target);

         if (mapping) {
           binding = new window.vizit.lesson.MappingEventHandler(updater, from, mapping, framework);
         } else {
           binding = new window.vizit.lesson.DirectEventHandler(updater, framework);
         }
         // By convention in the lesson framework changes in var are named varChanged.
         document.addEventListener(from + "Changed", binding.handleUpdate.bind(binding), false);
       } else {
         console.warn(`No method ${methodName} found to bind ${set}.`)
       }
     };

     /**
      * Build one or more bindings as the config is a single object or an array
      * of objects.
      *
      * @param {Object} target A JS object that has a setVar method, where Var is named
      *                        in the config set field.
      * @param {Object} config A JS object whose attributes describe one or more bindings.
      * @param {ElectricField | SimpleVectorField}
      *                 framework A JS container of the field defenitions, with
      *                 which elements are registered by name.
      */
     this.bind       = function (target, config, framework)
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
             binding = this.bindingBuilder(target, config[i], framework);
           }
         }
         else
         {
           binding = this.bindingBuilder(target, config, framework);
         }
       }
     };

     errorMessage       = "";
     warningMessage     = "";
   };

   // Create an instance for use as a prototype to other builders
   ns.bindingBuilder = new ns.BindingBuilder();
 }(window.vizit.builder));
