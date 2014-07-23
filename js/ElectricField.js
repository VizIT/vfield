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
 * @param charges_        Set of point and distributed charges. It must impliment
 *                        getField(x, y, z).
 *
 * @constructor
 */
function ElectricField(charges_)
{
  /** General size parameter for the arrowheads. */
  var arrowSize;
  /** The sum of ds along the path increments by this much between arrows. */
  var arrowSpacing;
  /** The charges generate the field. */
  var charges;
  var color;
  var ds;
  var fluxLineVBOs;
  var generator;
  /** A wrapper around the WebGL context, gl. */
  var glUtility;
  /** The max number of points while tracing out a field line. */
  var maxPoints;
  /** The maximum number of vectors to be drawn per field line. */
  var maxVectors;
  /** Actually draws the vector field */
  var renderer;
  // Model-View matrix for use in all programs.
  var modelViewMatrix;
  var projectionMatrix;
  var startPoints;
  // Has this renderer started - do not render in response to events if not.
  var started;

  this.setArrowScale       = function(scale)
  {
    arrowScale = scale;
  }

  this.getArrowScale       = function()
  {
    return arrowScale;
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
      renderer.renderLines(projectionMatrix, modelViewMatrix, color, fluxLineVBOs);
    }
  }

  /**
   * Setup and render a set of flux lines. Each flux line is computed, then set as a VBO
   * on the GPU, minimizing the client side JS storage.
   */
  this.start               = function()
  {
    var fluxLine;
    var nstartPoints;
    var point;

    renderer               = new FluxLineRenderer(glUtility);
    // Introduce variables and defaults for maxVectors and arrowSize.
    generator              = new FluxLineGenerator(charges, maxPoints, ds, arrowSize, arrowSpacing);

    nstartPoints           = startPoints.length;
    for (var i=nstartPoints-1; i>=0; --i)
    {
      point    = startPoints[i];
      fluxLine = generator.generate(point[0], point[1], point[2], point[3]);
      fluxLineVBOs.push(new FluxLineVBO(glUtility, fluxLine));
    }
    started                = true;

    this.render();
  }
  
  arrowSize      = 0.3;
  arrowSpacing   = 1.2;
  charges        = charges_;
  fluxLineVBOs   = new Array();
  /* Default color */
  color          = new Float32Array([0.8, 0.3, 0.3, 1]);
  ds             = 0.3;
  maxPoints      = 5000;
  maxVectors     = 5;
  startPoints    = new Array();
  started        = false;
}
