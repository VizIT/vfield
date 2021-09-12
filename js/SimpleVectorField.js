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

window.vizit             = window.vizit             || {};
window.vizit.vectorfield = window.vizit.vectorfield || {};

(function (ns)
 {
   /**
    * Wrapper for a simple vector field, rendered in the simplest way possible.
    *
    * @param {vizit.field.Stage} stage_
    * @param {VectorFunction}    f_         A vector function. It must implement
    *                                       [fx, fy, fz] = getField(x, y, z).
    *
    * @class
    */
   ns.SimpleVectorField = function (stage_, f_)
   {
     this.setLineWidth        = function(width)
     {
       generator.setLineWidth(width);
       return this;
     };

     this.getLineWidth        = function()
     {
       generator.getLineWidth();
     };

     this.setArrowHeadWidth   = function(width)
     {
       generator.setArrowHeadWidth(width);
       return this;
     };

     this.getArrowHeadWidth   = function ()
     {
       return generator.getArrowHeadWidth();
     };

     this.setArrowHeadSize    = function (size)
     {
       generator.setArrowHeadSize(size);
       return this;
     };

     this.getArrowHeadSize    = function ()
     {
       return generator.getArrowHeadSize();
     };

     /**
      * @param {number}            arrowSize_ The length of the vector is scaled by this factor before
      *                                       drawing to the screen. It represents the comparative scale
      *                                       of the vector field to physical coordinates as drawn on
      *                                       the screen.
      */
     this.setArrowSize = function(size)
     {
       generator.setArrowSize(size);
       return this;
     }

     this.getArrowSize = function()
     {
       return generator.getArrowSize();
     }

     this.setColor            = function (color_)
     {
       color = color_;
       return this;
     };

     this.getColor            = function ()
     {
       return color;
     };

     this.getGlUtility        = function ()
     {
       return glUtility;
     };

     this.setMaxVectors       = function (max)
     {
       generator.setMaxVectors(max);
       return this;
     };

     this.getMaxVectors       = function ()
     {
       return generator.getMaxVectors();
     };

     this.setModelViewMatrix  = function (modelViewMatrix_)
     {
       modelViewMatrix = modelViewMatrix_;
       return this;
     };

     this.getModelViewMatrix  = function ()
     {
       return modelViewMatrix;
     };

     this.setProjectionMatrix = function (projectionMatrix_)
     {
       projectionMatrix = projectionMatrix_;
       return this;
     };

     this.setStartPoints = function(points)
     {
       generator.setStartPoints(points);
       return this;
     }

     this.addStartPoints = function (points)
     {
       generator.addStartPoints(points);
       return this;
     };

     this.getStartPoints = function ()
     {
       return generator.getStartPoints();
     };

     this.setupVectorField    = function ()
     {

       let indexedBuffer;
       let indexedBuffers = [];
       let indexedVertices;

       indexedBuffer          = new Object();

       // Include start points defined implicitly in vector function, if any.
       if (typeof f.getStartPoints === "function")
       {
         const candidates  = f.getStartPoints(0, 2.0);
         if (typeof candidates !== "undefined" && candidates.length > 0)
         {
           generator.addStartPoints(candidates);
         }
       }

       // TODO IndexedBuffer here?
       indexedVertices        = generator.generateField();

       indexedBuffer.vertices = glUtility.createBuffer(indexedVertices.getVertices());
       indexedBuffer.indices  = glUtility.createIndexBuffer(indexedVertices.getIndices());
       indexedBuffer.nindices = indexedVertices.getNindices();

       indexedBuffers[0]      = indexedBuffer;

       return indexedBuffers;
     };

     this.render              = function ()
     {
       if (started)
       {
         if (f.isModified())
         {
           indexedBuffers = this.setupVectorField();
         }

         glUtility.clear();
         renderer.drawIndexedLines(projectionMatrix, modelViewMatrix, color, indexedBuffers);
         f.setModified(false);
       }
     };

     this.start               = function ()
     {
       started        = true;
       this.render();
     };


     /* Default color */
     let color               = new Float32Array([0.8, 0.3, 0.3, 1]);

     /** Has this renderer started - do not render in response to events if not. */
     let started             = false;

     /** The vector field */
     const f                 = f_;
     const stage             = stage_;
     let   indexedBuffers;
     /** A wrapper around the WebGL context, gl. */
     const glUtility         = stage.getGlUtility();
     /** Puts field line vertices in indexedBuffers */
     const generator         = new vizit.vectorfield.VectorFieldGenerator(f);
     /** Actually draws the vector field */
     const renderer          = new vizit.vectorfield.LineRenderer(glUtility);
     glUtility.clearColor(0.0, 0.0, 0.0, 0.0);
     // Model-View matrix for use in all programs.
     let modelViewMatrix     = stage.getModelViewMatrix();
     let projectionMatrix    = stage.getProjectionMartix();
     // Register to listen for changes to these matrices
     stage.registerRenderer(this);
   };
}(window.vizit.vectorfield));
