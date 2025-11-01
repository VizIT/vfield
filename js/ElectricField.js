/*
 * Copyright 2013-2021 Vizit Solutions
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
    * Representation of charges and their associated field lines. Given a set of charges
    * draw the field lines along with directional arrows from the given start points.
    *
    * @param {vizit.field.Stage} stage
    * @class
    */
   ns.ElectricField = function(stage)
   {
     var chargeBuffer;
     /** The charges generate the field. */
     var charges;
     var color;
     var ds;
     var fieldLineVBOs;
     // Probably not have multiple Gaussian surfaces, but allow the rendering
     // method to take arrays of surfaces.
     var gaussianSurfaces;
     /** The max number of points while tracing out a field line. */
     var maxPoints;
     /** The maximum number of vectors to be drawn per field line. */
     var maxVectors;
     var normalMatrix;
     var explicitStartPoints;
     // Has this renderer started - do not render in response to events if not.
     var started;

     /**
      * Set the approximate screen width for field lines
      * @param {number} width Floating point representing the electric field line width
      *
      * @returns {vizit.electricfield.ElectricField}
      */
     this.setLineWidth      = function (width)
     {
       fieldLineRenderer.setLineWidth(width);
       return this;
     };

     this.getLineWidth    = function ()
     {
       return fieldLineRenderer.getLineWidth();
     };

     this.setArrowSpacing       = function (spacing)
     {
       fieldLineGenerator.setArrowSpacing(spacing);
       return this;
     };

     this.getArrowSpacing       = function ()
     {
       return fieldLineGenerator.getArrowSpacing();
     };

     // TODO rename to setArrowLength
     this.setArrowHeadSize      = function (size)
     {
       fieldLineGenerator.setArrowLength(size);
       return this;
     };

     this.getArrowHeadSize    = function ()
     {
       return fieldLineGenerator.getArrowLength();
     };

     this.setArrowWidth      = function (width)
     {
       fieldLineRenderer.setArrowWidth(width);
       return this;
     };

     this.getArrowWidth    = function ()
     {
       return fieldLineRenderer.getArrowWidth();
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
       chargeGenerator.setCharges(charges);
       fieldLineGenerator.setCharges(charges);
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
       started = true;
       this.render();
     };

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

     /** A wrapper around the WebGL context, gl. */
     const glUtility          = stage.getGlUtility();
     glUtility.clearColor(0.0, 0.0, 0.0, 0.0);
     // Model-View matrix for use in all programs.
     let modelViewMatrix      = stage.getModelViewMatrix();
     let projectionMatrix     = stage.getProjectionMartix();
     // Register to listen for changes to these matrices
     stage.registerRenderer(this);

     const chargeGenerator    = new vizit.electricfield.ChargeGenerator();
     /** Given a charge configuration, generates field lines. */
     const fieldLineGenerator = new vizit.electricfield.FieldLineGenerator(maxPoints, ds);
     /** Draw the generated field lines */
     const fieldLineRenderer  = new vizit.electricfield.FieldLineRenderer(glUtility);
     // Vector field, f, and scale factor.
     /*const vectorRenderer = new vizit.vectorfield.SimpleVectorField(stage, f)
         .setArrowSize(4.0)
         .setArrowHeadSize(8.0)
         .setArrowHeadWidth(8.0)
         .setMaxVectors(10)
         .addStartPoints(f.getStartPoints(0, 2.0));*/
     const chargeRenderer     = new vizit.electricfield.ChargeRenderer(glUtility);
     const surfaceRenderer    = new vizit.electricfield.SurfaceRenderer(glUtility);
   };
 }(window.vizit.electricfield));
