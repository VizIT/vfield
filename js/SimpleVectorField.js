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

window.vizit             = window.vizit             || {};
window.vizit.vectorfield = window.vizit.vectorfield || {};

(function (ns)
 {
   /**
    * Wrapper for a simple vector field, rendered in the simplest way possible.
    *
    * @param {VectorFunction} f_         A vector function. It must impliment getField(x, y, z)
    * @param {Double}         arrowSize_ The length of the vector is scaled b y this factor before
    *                                    drawing to the screen. It represents the comparative scale
    *                                    of the vector field to physical coordinates as drawn on
    *                                    the screen.
    *
    * @class
    */
   ns.SimpleVectorField = function (f_, arrowSize_)
   {
     /** General size parameter for the arrowheads. */
     var arrowHeadSize;
     /** How the normal to the arrow shaft scales with the length of the vector. */
     var arrowHeadWidth;
     var color;
     var explicitStartPoints;
     /** The vector field */
     var f;
     var generator;
     /** A wrapper around the WebGL context, gl. */
     var glUtility;
     var indexedBuffers;
     /** The maximum number of vectors to be drawn per field line. */
     var maxVectors;
     var modelViewMatrix;
     /** Actually draws the vector field */
     var renderer;
     // Model-View matrix for use in all programs.
     var projectionMatrix;
     var arrowSize;
     // Has this renderer started - do not render in response to events if not.
     var started;

     this.setArrowHeadWidth   = function (width)
     {
       arrowHeadWidth = width;
       return this;
     };

     this.getArrowHeadWidth   = function ()
     {
       return arrowHeadWidth;
     };

     this.setArrowHeadSize    = function (size)
     {
       arrowHeadSize = size;
       return this;
     };

     this.getArrowHeadSize    = function ()
     {
       return arrowHeadSize;
     };

     this.setColor            = function (color_)
     {
       color = color_;
       return this;
     };

     this.getColor            = function ()
     {
       return color;
     };

     this.setGlUtility        = function (glUtility_)
     {
       glUtility = glUtility_;
       return this;
     };

     this.getGlUtility        = function ()
     {
       return glUtility;
     };

     this.setMaxVectors       = function (max)
     {
       maxVectors = max;
       return this;
     };

     this.getMaxVectors       = function ()
     {
       return maxVectors;
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

     this.addStartPoints = function (startPoints_)
     {
       explicitStartPoints = explicitStartPoints.concat(startPoints_);
       return this;
     };

     this.getStartPoints = function ()
     {
       return explicitStartPoints;
     };

     this.setupVectorField    = function ()
     {
       var candidates;
       var indexedBuffer;
       var indexedVertices;
       var startPoints;

       // Include start points defined implicitly in vector function, if any.
       if (typeof f.getStartPoints === "function")
       {
         candidates  = f.getStartPoints(0, 2.0);
         if (typeof candidates !== "undefined")
         {
           startPoints = explicitStartPoints.concat(candidates);
         }
         else
         {
           startPoints = explicitStartPoints;
         }
       }
       else
       {
         startPoints = explicitStartPoints;
       }

       generator.setStartPoints(startPoints);

       indexedBuffer          = new Object();

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
       var indexedBuffer;
       var indexedVertices;

       renderer       = new vizit.vectorfield.LineRenderer(glUtility);
       // Introduce variables and defaults for maxVectors and arrowHeadSize.
       generator      = new vizit.vectorfield.VectorFieldGenerator(f, maxVectors, arrowHeadSize,
                                                                   arrowHeadWidth, arrowSize);

       started        = true;

       this.render();
     };

     arrowHeadWidth      = 0.5;
     arrowHeadSize       = 0.3;
     f                   = f_;
     indexedBuffers      = new Array();
     /* Default color */
     color               = new Float32Array([0.8, 0.3, 0.3, 1]);
     maxVectors          = 5;
     arrowSize           = typeof arrowSize_ === "undefined" ? 1.0 : arrowSize_;
     explicitStartPoints = new Array();
     started             = false;
   };
}(window.vizit.vectorfield));
