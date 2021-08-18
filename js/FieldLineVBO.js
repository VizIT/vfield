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

// Define the global namespaces iff not already defined.
window.vizit               = window.vizit               || {};
window.vizit.electricfield = window.vizit.electricfield || {};

(function (ns)
 {
   /**
    * Container for the line and direction indicators for a field line.
    * NOTE: Consider combining these into a single VBO.
    */
   ns.FieldLineVBO = function (glUtility, fieldLine)
   {
     this.disable = function ()
     {
       this.enabled = false;
     };

     this.isEnabled = function ()
     {
       return this.enabled;
     };

     /**
      * Load vector data onto GPU memory, recycling the existing VBO.
      * TODO: Can bufferSubData be used to reload field lines?
      * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData
      */
     this.reload = function (glUtility, fieldLine)
     {
       glUtility.loadData(this.fieldLineBufferHandle, fieldLine.getPoints());
       this.npoints                    = fieldLine.getNpoints();

       const arrows                    = fieldLine.getArrows();
       glUtility.loadData(this.fieldDirectionBufferHandle, arrows.vertices);
       glUtility.loadIndices(this.fieldDirectionIndices, arrows.indices);
       this.narrows                    = arrows.narrows;
       this.enabled                    = true;
     };

     this.fieldLineBufferHandle      = glUtility.createBuffer(fieldLine.getPoints());
     this.npoints                    = fieldLine.getNpoints();

     const arrows                    = fieldLine.getArrows();
     this.fieldDirectionBufferHandle = glUtility.createBuffer(arrows.vertices);
     this.narrows                    = arrows.narrows;
     this.fieldDirectionIndices      = glUtility.createIndexBuffer(arrows.indices);
     this.enabled                    = true;
   };
 }(window.vizit.electricfield));
