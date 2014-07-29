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

/**
 * Representation of charges and their associated field lines. Given a set of charges
 * draw the field lines along with directional arrows from the given start points.
 *
 * @param {Charges} charges_        Set of point and distributed charges. It must
 *                                  impliment getField(x, y, z).
 *
 * @param {string}  [home_ = .]     A string giving the path to the efield
 *                                  home directory if not the directory the
 *                                  page is loaded from.
 *
 * @constructor
 */
function ElectricField(charges_, home_)
{
  /** General size parameter for the arrowheads. */
  var arrowSize;
  /** The sum of ds along the path increments by this much between arrows. */
  var arrowSpacing;
  var chargeBuffer;
  var chargeRenderer;
  /** The charges generate the field. */
  var charges;
  var color;
  var ds;
  var fieldLineVBOs;
  var generator;
  /** A wrapper around the WebGL context, gl. */
  var glUtility;
  /** Home directory for resource loading. */
  var home;
  /** Wait for the setup to finish before rendering the first frame. */
  var latch;
  /** The max number of points while tracing out a field line. */
  var maxPoints;
  /** The maximum number of vectors to be drawn per field line. */
  var maxVectors;
  var normalMatrix;
  /** Actually draws the electric field */
  var fieldLineRenderer;
  // Model-View matrix for use in all programs.
  var modelViewMatrix;
  var projectionMatrix;
  var startPoints;
  // Has this renderer started - do not render in response to events if not.
  var started;
  var surfaceRenderer;

  this.setArrowSpacing       = function(spacing)
  {
    arrowSpacing = spacing;
  }

  this.getArrowSpacing       = function()
  {
    return arrowSpacing;
  }

  this.setArrowSize        = function(size)
  {
    arrowSize = size;
  }

  this.getArrowSize        = function()
  {
    return arrowSize;
  }

  this.setColor            = function(color_)
  {
    color = color_;
  }

  this.getColor            = function()
  {
    return color;
  }

  this.setGlUtility        = function(glUtility_)
  {
    glUtility = glUtility_;
  }

  this.getGlUtility        = function()
  {
    return glUtility;
  }

  this.setMaxVectors       = function(max)
  {
    maxVectors = max;
  }

  this.getMaxVectors       = function()
  {
    return maxVectors;
  }

  this.setModelViewMatrix  = function(modelViewMatrix_)
  {
    modelViewMatrix = modelViewMatrix_;
    // This straight copy of the modelView matrix into the normalMatrix
    // is only valid when we are restricted to translations and rotations.
    // Scale can be handled by renormalizing - the introduction of shearing
    // or non-uniform scaling would require the use of (M^-1)^T.
    // See gl-matrix's mat3.normalFromMat4
    normalMatrix    = glUtility.extractRotationPart(modelViewMatrix, normalMatrix);
  }

  this.getModelViewMatrix  = function()
  {
    return modelViewMatrix;
  }

  this.setProjectionMatrix = function(projectionMatrix_)
  {
    projectionMatrix = projectionMatrix_;
  }

  this.addStartPoints = function(startPoints_)
  {
    startPoints = startPoints.concat(startPoints_)
  }

  this.getStartPoints = function()
  {
    return startPoints;
  }

  this.render              = function()
  {
    if (started)
    {
      glUtility.clear();
      fieldLineRenderer.render(projectionMatrix, modelViewMatrix, color, fieldLineVBOs);
      chargeRenderer.render(projectionMatrix, modelViewMatrix, chargeBuffer, charges);
      surfaceRenderer.render(projectionMatrix, modelViewMatrix, normalMatrix, charges.getDistributions());
    }
  }

  this.setupCharges        = function(charges)
  {
    var generator;
    var chargesArray;

    generator    = new ChargeGenerator(charges);
    chargesArray = generator.generate();
    chargeBuffer = glUtility.createBuffer(chargesArray);
  }

  /**
   * Setup and render a set of field lines. Each field line is computed, then set as a VBO
   * on the GPU, minimizing the client side JS storage.
   */
  this.setupFieldLines     = function()
  {
    var fieldLine;
    var generator;
    var nstartPoints;
    var point;

    nstartPoints = startPoints.length;
    if (nstartPoints > 0)
    {
      // Introduce variables and defaults for maxVectors and arrowSize.
      generator    = new FieldLineGenerator(charges, maxPoints, ds, arrowSize, arrowSpacing);

      for (var i=nstartPoints-1; i>=0; --i)
      {
        point     = startPoints[i];
        fieldLine = generator.generate(point[0], point[1], point[2], point[3]);
        fieldLineVBOs.push(new FieldLineVBO(glUtility, fieldLine));
      }
    }
  }

  this.started             = function()
  {
    started           = true;
    this.render();
  }

  this.start               = function()
  {
    glUtility.clearColor(0.0, 0.0, 0.0, 0.0);
    fieldLineRenderer = new FieldLineRenderer(glUtility);
    this.setupFieldLines(charges, maxPoints, ds, arrowSize, arrowSpacing);
    chargeRenderer    = new ChargeRenderer(glUtility, latch.countDown, home);
    this.setupCharges(charges);
    surfaceRenderer   = new SurfaceRenderer(glUtility);
    latch.countDown();
  }
  
  arrowSize      = 0.3;
  arrowSpacing   = 1.2;
  charges        = charges_;
  fieldLineVBOs  = new Array();
  /* Default color */
  color          = new Float32Array([0.8, 0.3, 0.3, 1]);
  ds             = 0.3;
  // Use ./ if home_ is undefined
  home           = typeof home_ == 'undefined' ? "./" : home_;
  // Wait for two textures to load, and this renderer to be started.
  latch          = new CountdownLatch(3, this.started.bind(this));
  maxPoints      = 1000;
  maxVectors     = 5;
  normalMatrix   = new Float32Array([1, 0, 0,
                                     0, 1, 0,
                                     0, 0, 1]);
  startPoints    = new Array();
  started        = false;
}
