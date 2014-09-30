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
    * The vector field can be supplied explicitly, or by specifying electric
    * charges. If electric charges are specified, elcetric field vectors are
    * drawn. At this time do not allow mixture of these types of vector field
    * defenition. This will simply determine which of these options is in play
    * and invoke the appropriate builder.
    *
    * @class
    */
   ns.VectorValuedFunctionBuilder = function (framework_)
   {
     var errorMessage;
     var framework;
     var warningMessage;

     /**
      * Scan the function definitions to determine if these are explicit
      * functions or charges.
      */
     this.build = function (config, renderer)
     {
       var testConfig;
       var builder;

       if (!!config)
       {
         if (Array.isArray(config))
         {
           testConfig = config[0];
         }
         else
         {
           testConfig = config;
         }

         if (typeof testConfig !== "undefined")
         {
           // TODO merge these with some functions being renderable
           if (testConfig.type.toLowerCase() === "function")
           {
             builder = new vizit.builder.CombinedVectorValuedFunctionBuilder(framework)
           }
           else
           {
             builder = new vizit.builder.ElectricFieldElementBuilder(framework, renderer);
           }
         }
       }
       return builder.build(config);
     }

     errorMessage   = "";
     framework      = framework_;
     warningMessage = "";
   }
 }(window.vizit.builder));

