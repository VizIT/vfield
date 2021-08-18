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
    * Build a simple vector field, that is drawing vectors along field lines.
    * The vector field can be supplied explicitly, or by specifying electric
    * charges. If electric charges are specified, elcetric field vectors are
    * drawn.
    *
    * @class
    */
   ns.SimpleVectorFieldBuilder = function (stage_)
   {
     var errorMessage;
     var stage;
     var warningMessage;

     this.build = function (config)
     {
       var arrowHeadSize;
       var arrowHeadWidth;
       var arrowSize;
       var builder;
       var maxVectors;
       // An optional vector valued function.
       var vectorValuedFunction, vectorValuedFunctionConfig;
       // Name of properties on the config object.
       var property;
       // Wrapper around the shader program that renders the vector field to the screen.
       var renderer;

       for(property in config)
       {
         if (property.toLowerCase() === "arrowheadsize")
         {
           arrowHeadSize = config[property];
         }
         if (property.toLowerCase() === "arrowheadwidth")
         {
           arrowHeadWidth = config[property];
         }
         else if (property.toLowerCase() === "arrowsize")
         {
           arrowSize = config[property];
         }
         else if (property.toLowerCase() === "maxvectors")
         {
           maxVectors = config[property];
         }
         // For now, our vector valued function is configured as f.
         if (property.toLowerCase() === "f")
         {
           vectorValuedFunctionConfig = config[property];
         }
       }

       if (vectorValuedFunctionConfig)
       {
         builder              = new vizit.builder.VectorValuedFunctionBuilder(stage);
         vectorValuedFunction = builder.build(vectorValuedFunctionConfig);
       }
        
       renderer = new vizit.vectorfield.SimpleVectorField(stage, vectorValuedFunction);

       if(typeof maxVectors !== "undefined")
       {
         renderer.setMaxVectors(maxVectors);
       }
       if (typeof arrowSize !== "undefined")
       {
         renderer.setArrowSize(arrowSize)
       }
       if (typeof arrowHeadSize !== "undefined")
       {
         renderer.setArrowHeadSize(arrowHeadSize);
       }
       if (typeof arrowHeadWidth !== "undefined")
       {
         renderer.setArrowHeadWidth(arrowHeadWidth);
       }

       return renderer;
     };

     errorMessage   = "";
     stage      = stage_;
     warningMessage = "";
   };
 }(window.vizit.builder));

