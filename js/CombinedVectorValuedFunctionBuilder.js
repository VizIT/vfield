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
    * Build a vector valued function [f_x, f_y, f_z] = f.getField(x, y, z).
    * Allow for the combination of multiple functions into a single function.
    *
    * @class
    */
   ns.CombinedVectorValuedFunctionBuilder = function (framework_)
   {
     var errorMessage;
     var framework;
     var warningMessage;

     this.buildFunction = function (config)
     {
       // The arguments (input) the the vector function;
       var args;
       // The body of the vector function. It is expected to return a three element vector.
       var body;
       // The function built by this config object.
       var f;
       // Other internal properties of the function object. Setters and getters will be generated.
       // They can be used in the body, and also bound to events.
       var properties;
       // Name of properties on the config object.
       var property;
       // The stop tracing a file line condition
       var stop;
       // The type of function being defined, expected to be "function";
       var type;


       for(property in config)
       {
         if (property.toLowerCase() === "args")
         {
           args = config[property];
         }
         else if (property.toLowerCase() === "body")
         {
           body = config[property]
         }
         else if (property.toLowerCase() ==="name")
         {
           name = config[property];
         }
         else if (property.toLowerCase() ==="properties")
         {
           properties = config[property];
         }
         else if (property.toLowerCase() ==="stop")
         {
           stop = config[property];
         }
         else if (property.toLowerCase() ==="type")
         {
           type = config[property];
         }
       }

       f = new vizit.vectorfield.VectorFunction(agrs, body);

       return f;
     }

     this.build = function (config)
     {
       var f;
       var functions;
       var name;
       var nfunctions;

       if (!!config)
       {
         functions = new vizit.vectorfield.CombinedVectorFunctions();
         if (Array.isArray(config))
         {
           nfunctions = config.length;
           for (var i=0; i<nfunctions; ++i)
           {
             f = this.buildFunction(config[i]);
             // Only add the charge if chargeBuilder returns a non null result.
             if (!!f)
             {
               functions.addFunction(f);
               name = f.getName();
               if (name)
               {
                 framework.setElementName(f, name)
               }
             }
           }
         }
         else
         {
           f = this.buildFunction(config);
           // Only add the charge if chargeBuilder returns a non null result.
           if (!!f)
           {
             functions.addFunction(f);
             name = f.getName();
             if (name)
             {
               framework.setElementName(f, name)
             }
           }
         }
       }
       return functions;
     }

     errorMessage   = "";
     framework      = framework_;
     warningMessage = "";
   }
 }(window.vizit.builder));

