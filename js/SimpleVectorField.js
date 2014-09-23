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
 * Wrapper for a simple vector field, rendered in the simplest way possible.
 *
 * @param f_              A vector function. It must impliment getField(x, y, z)
 * @param scale_ {Double} The length of the vector is scaled b y this factor before
 *                        drawing to the screen. It represents the comparative scale
 *                        of the electric forle to physical coordinates as drawn on
 *                        the screen.
 *
 * @constructor
 */
function SimpleVectorField(f_, scale_)
{
  /** How the normal to the arrow shaft scales with the length of the vector. */
  var arrowScale;
  /** General size parameter for the arrowheads. */
  var arrowSize;
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
  var scale;
  // Has this renderer started - do not render in response to events if not.
  var started;

  this.setArrowScale       = function(scale)
  {
    arrowScale = scale;
    return this;
  }

  this.getArrowScale       = function()
  {
    return arrowScale;
  }

  this.setArrowSize        = function(size)
  {
    arrowSize = size;
    return this;
  }

  this.getArrowSize        = function()
  {
    return arrowSize;
  }

  this.setColor            = function(color_)
  {
    color = color_;
    return this;
  }

  this.getColor            = function()
  {
    return color;
  }

  this.setGlUtility        = function(glUtility_)
  {
    glUtility = glUtility_;
    return this;
  }

  this.getGlUtility        = function()
  {
    return glUtility;
  }

  this.setMaxVectors       = function(max)
  {
    maxVectors = max;
    return this;
  }

  this.getMaxVectors       = function()
  {
    return maxVectors;
  }

  this.setModelViewMatrix  = function(modelViewMatrix_)
  {
    modelViewMatrix = modelViewMatrix_;
    return this;
  }

  this.getModelViewMatrix  = function()
  {
    return modelViewMatrix;
  }

  this.setProjectionMatrix = function(projectionMatrix_)
  {
    projectionMatrix = projectionMatrix_;
    return this;
  }

  this.addStartPoints = function(startPoints_)
  {
    explicitStartPoints = explicitStartPoints.concat(startPoints_)
    return this;
  }

  this.getStartPoints = function()
  {
    return explicitStartPoints;
  }

  this.setupVectorField    = function()
  {
    var indexedBuffer;
    var indexedVertices;
    var startPoints;

    // Include start points defined implicitly in vector function, if any.
    if (typeof f.getStartPoints === "function")
    {
      startPoints = explicitStartPoints.concat(f.getStartPoints(0, 2.0));
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
  }

  this.render              = function()
  {
    if (started)
    {
      renderer.drawIndexedLines(projectionMatrix, modelViewMatrix, color, indexedBuffers);
    }
  }

  this.start               = function()
  {
    var indexedBuffer;
    var indexedVertices;

    renderer       = new LineRenderer(glUtility);
    // Introduce variables and defaults for maxVectors and arrowSize.
    generator      = new VectorFieldGenerator(f, maxVectors, arrowSize, arrowScale, scale);

    indexedBuffers = this.setupVectorField();
    started        = true;

    this.render();
  }
  
  arrowScale          = 0.5;
  arrowSize           = 0.3;
  f                   = f_;
  indexedBuffers      = new Array();
  /* Default color */
  color               = new Float32Array([0.8, 0.3, 0.3, 1]);
  maxVectors          = 5;
  scale               = scale_;
  explicitStartPoints = new Array();
  started             = false;
}
