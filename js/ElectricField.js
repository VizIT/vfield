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

// Define the global namespaces iff not already defined.
window.vizit               = window.vizit               || {};
window.vizit.electricfield = window.vizit.electricfield || {};

(function (ns)
 {
   /**
    * Representation of charges and their associated field lines. Given a set of charges
    * draw the field lines along with directional arrows from the given start points.
    * @class
    */
   ns.ElectricField = function()
   {
     /** General size parameter for the arrowheads. */
     var arrowHeadSize;
     /** The sum of ds along the path increments by this much between arrows. */
     var arrowSpacing;
     var chargeBuffer;
     var chargeGenerator;
     var chargeRenderer;
     /** The charges generate the field. */
     var charges;
     var color;
     var ds;
     var fieldLineVBOs;
     // Probably not have multiple Gaussian surfaces, but allow the rendering
     // method to take arrays of surfaces.
     var gaussianSurfaces;
     /** A wrapper around the WebGL context, gl. */
     var glUtility;
     /** The max number of points while tracing out a field line. */
     var maxPoints;
     /** The maximum number of vectors to be drawn per field line. */
     var maxVectors;
     var normalMatrix;
     /** Given a charge configuration, draws field lines. */
     var fieldLineGenerator;
     /** Actually draws the electric field */
     var fieldLineRenderer;
     // Model-View matrix for use in all programs.
     var modelViewMatrix;
     var projectionMatrix;
     var explicitStartPoints;
     // Has this renderer started - do not render in response to events if not.
     var started;
     var surfaceRenderer;

     this.setArrowSpacing       = function (spacing)
     {
       arrowSpacing = spacing;
       if (typeof fieldLineGenerator !== "undefined")
       {
         fieldLineGenerator.setArrowSpacing(spacing);
       }
       return this;
     };

     this.getArrowSpacing       = function ()
     {
       return arrowSpacing;
     };

     this.setArrowHeadSize      = function (size)
     {
       arrowHeadSize = size;
       if (typeof fieldLineGenerator !== "undefined")
       {
         fieldLineGenerator.setArrowHeadSize(size);
       }
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

     /**
      * @param {Charges} charges_ Set of point and distributed charges. It must
      *                           impliment getField(x, y, z).
      */
     this.setCharges          = function (charges_)
     {
       charges = charges_;
       return this;
     };

     this.getCharges          = function ()
     {
       return charges;
     };

     this.addGaussianSurface  = function (surface)
     {
       gaussianSurfaces.push(surface);
       return this;
     };

     /**
      * Return the set of gaussian surfaces for this electric field model.
      * Usually 0 or 1 surfaces.
      */
     this.getGaussianSurfaces = function ()
     {
       return gaussianSurfaces;
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
       // This straight copy of the modelView matrix into the normalMatrix
       // is only valid when we are restricted to translations and rotations.
       // Scale can be handled by renormalizing - the introduction of shearing
       // or non-uniform scaling would require the use of (M^-1)^T.
       // See gl-matrix's mat3.normalFromMat4
       normalMatrix    = glUtility.extractRotationPart(modelViewMatrix, normalMatrix);
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

     this.addStartPoint  = function (x_, y_, z_, sgn_)
     {
       explicitStartPoints.push(new Array(x_, y_, z_, sgn_));
       return this;
     };

     this.addStartPoints = function (startPoints)
     {
       explicitStartPoints = explicitStartPoints.concat(startPoints);
     };

     this.getStartPoints = function ()
     {
       return explicitStartPoints;
     };

     this.render              = function ()
     {
       if (started)
       {
         var gl;

         gl = glUtility.getGLContext();

         if (charges.chargesModified())
         {
           this.setupCharges();
           this.setupFieldLines();
         }
         else if (charges.distributionsModified())
         {
           this.setupFieldLines();
         }

         glUtility.clear();
         chargeRenderer.render(projectionMatrix, modelViewMatrix, chargeBuffer, charges);
         fieldLineRenderer.render(projectionMatrix, modelViewMatrix, color, fieldLineVBOs);

         // Charge distributions and Gaussian surfaces have transparent elements.
         gl.enable(gl.BLEND);
         gl.enable(gl.CULL_FACE);
         gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
         surfaceRenderer.render(projectionMatrix, modelViewMatrix, normalMatrix, charges.getDistributions());
         // Gaussian surfaces may cross charge distributions, draw them regardless of existing charges.
         gl.disable(gl.DEPTH_TEST);
         surfaceRenderer.render(projectionMatrix, modelViewMatrix, normalMatrix, gaussianSurfaces);
         gl.enable(gl.DEPTH_TEST);
         gl.disable(gl.BLEND);
         gl.disable(gl.CULL_FACE);

         charges.setModified(false);
       }
     };

     this.setupCharges        = function (charges)
     {
       var chargesArray;
       var gl;

       if (!chargeBuffer)
       {
         gl = glUtility.getGLContext();
         chargeBuffer = gl.createBuffer();
       }
       chargesArray = chargeGenerator.generate();
       glUtility.loadData(chargeBuffer, chargesArray);
     };

     /**
      * Setup and render a set of field lines. Each field line is computed, then set as a VBO
      * on the GPU, minimizing the client side JS storage.
      */
     this.setupFieldLines     = function ()
     {
       var fieldLine;
       var i;
       var nstartPoints;
       var nVBOs;
       var point;
       var startPoints;
       var tmp;

       startPoints  = new Array();
       // Get start points defined implicitly by fieldLineDensity in charges.
       startPoints  = startPoints.concat(charges.getStartPoints(0, 5.0));
       // Add any explicitly defined start points.
       startPoints  = startPoints.concat(explicitStartPoints);

       nstartPoints = startPoints.length;
       nVBOs        = fieldLineVBOs.length;
       tmp          = Math.min(nstartPoints, nVBOs);

       for (i=0; i<tmp; ++i)
       {
         point     = startPoints[i];
         fieldLine = fieldLineGenerator.generate(point[0], point[1], point[2], point[3]);
         fieldLineVBOs[i].reload(glUtility, fieldLine);
       }

       for (; i<nVBOs; ++i)
       {
         fieldLineVBOs[i].disable();
       }

       for (; i<nstartPoints; ++i)
       {
         point     = startPoints[i];
         fieldLine = fieldLineGenerator.generate(point[0], point[1], point[2], point[3]);
         fieldLineVBOs.push(new vizit.electricfield.FieldLineVBO(glUtility, fieldLine));
       }
     };

     this.start               = function ()
     {
       glUtility.clearColor(0.0, 0.0, 0.0, 0.0);
       fieldLineRenderer  = new vizit.electricfield.FieldLineRenderer(glUtility);
       chargeGenerator    = new vizit.electricfield.ChargeGenerator(charges);
       fieldLineGenerator = new vizit.electricfield.FieldLineGenerator(charges, maxPoints, ds,
                                                                       arrowHeadSize, arrowSpacing);
       this.setupFieldLines(charges, maxPoints, ds, arrowHeadSize, arrowSpacing);
       chargeRenderer     = new vizit.electricfield.ChargeRenderer(glUtility);
       this.setupCharges(charges);
       surfaceRenderer    = new vizit.electricfield.SurfaceRenderer(glUtility);

       started           = true;
       this.render();
     };
  
     arrowHeadSize       = 0.3;
     arrowSpacing        = 1.2;
     /* Default color */
     color               = new Float32Array([0.8, 0.3, 0.3, 1]);
     ds                  = 0.6;
     fieldLineVBOs       = new Array();
     gaussianSurfaces    = new Array();
     maxPoints           = 3000;
     maxVectors          = 5;
     normalMatrix        = new Float32Array([1, 0, 0,
                                             0, 1, 0, 
                                             0, 0, 1]);
     explicitStartPoints = new Array();
     started             = false;
   };
 }(window.vizit.electricfield));
