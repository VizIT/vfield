"use strict";

/*
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
  /** The vector field */
  var f;
  var generator;
  /** A wrapper around the WebGL context, gl. */
  var glUtility;
  var indexedBuffers;
  /** The maximum number of vectors to be drawn per field line. */
  var maxVectors;
  /** Actually draws the vector field */
  var renderer;
  // Model-View matrix for use in all programs.
  var modelViewMatrix;
  var projectionMatrix;
  var scale;
  var startPoints;


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
    renderer.drawIndexedLines(projectionMatrix, modelViewMatrix, color, indexedBuffers);
  }

  this.start               = function()
  {
    var indexedBuffer;
    var indexedVertices;

    indexedBuffer          = new Object();
    renderer               = new LineRenderer(glUtility);
    // Introduce variables and defaults for maxVectors and arrowSize.
    generator              = new  VectorFieldGenerator(f, startPoints, maxVectors, arrowSize, arrowScale, scale);
    // TODO IndexedBuffer here?
    indexedVertices        = generator.generateField();

    indexedBuffer.vertices = glUtility.createBuffer(indexedVertices.vertices);
    indexedBuffer.indices  = glUtility.createIndexBuffer(indexedVertices.indices);
    indexedBuffer.nindices = indexedVertices.nindices;

    indexedBuffers[0]      = indexedBuffer;

    this.render();
  }
  
  arrowScale     = 0.5;
  arrowSize      = 0.3;
  f              = f_;
  indexedBuffers = new Array();
  /* Default color */
  color          = new Float32Array([0.8, 0.3, 0.3, 1]);
  maxVectors     = 3;
  scale          = scale_;
  startPoints    = new Array();
}
