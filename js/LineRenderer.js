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
 * Javascript object to render simple lines. Will track VBOs for the lines, load the line drawing
 * vector and fragment shaders, and map the Float32Arrays describing the vertices to the shaders.
 * Used, for example, in the vector field rendering.
 *
 * @param {GLUtility} GLUtility_ A wrapper around the WebGLRenderingContext, gl.
 *
 * @constructor
 */
function LineRenderer(glUtility_)
{
  /** WebGL GLint handle on the color attribute */
  var colorHandle;
  /** WebGLRenderingContext */
  var gl;
  var glUtility;
  /** WebGL GLint handle on the position attribute */
  var positionHandle;
  var program;
  /** WebGL GLint handle on the modelViewMatrix uniform */
  var modelViewMatrixHandle;
  /** WebGL GLint handle on the projectionMatrix uniform */
  var projectionMatrixHandle;

  this.createProgram      = function()
  {
    var fragmentShaderSource;
    var program;
    var vertexShaderSource;

    vertexShaderSource   = "attribute vec3 position;"
                           + "uniform   mat4 modelViewMatrix;"
                           + "uniform   mat4 projectionMatrix;"
                           + ""
                           + "void main()"
                           + "{"
                           + "    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);"
                           + "}";

    // For now use a constant color for all lines. Later consider color derived from field strength.
    fragmentShaderSource = "precision mediump float;"
                           + "uniform   vec4 color;"
                           + ""
                           + "void main()"
                           + "{"
                           + "    gl_FragColor = color;"
                           + "}";

    // Compile and link the shader program
    program                = glUtility.createProgram(vertexShaderSource, fragmentShaderSource);

    // Fetch handles for the attributes and uniforms - reuse on each rendering.
    colorHandle            = glUtility.getUniformLocation(program, "color");
    positionHandle         = glUtility.getAttribLocation(program,  "position");
    modelViewMatrixHandle  = glUtility.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixHandle = glUtility.getUniformLocation(program, "projectionMatrix");

    return program;
  }

  /**
   * Draw lines from a set of indexed buffers.
   *
   * @param projectionMatrix {Float32Array(16)}         Projection from view to screen space.
   *
   * @param modelViewMatrix  {Float32Array(16)}         Positions the lines into view space.
   *
   * @param color            {Float32Array(4): r,g,b,a} The color with which the lines will be drawn.
   *
   * @param indexedBuffers   {Object}                   Contains two WebGLBuffers, one the verticies, the other
   *                                                    the indices. Also contains the number of indices.
   *
   */
  this.drawIndexedLines   = function(projectionMatrix, modelViewMatrix, color, indexedBuffers)
  {
    var indexedBuffer;
    var nbuffers;

    gl.useProgram(program);
    gl.lineWidth(1);

    gl.uniform4fv(colorHandle, color);
    gl.uniformMatrix4fv(modelViewMatrixHandle,  false, modelViewMatrix);
    gl.uniformMatrix4fv(projectionMatrixHandle, false, projectionMatrix);

    nbuffers = indexedBuffers.length;

    for(var i=0; i<nbuffers; i++)
    {
      indexedBuffer = indexedBuffers[i];
      // Bind the buffer to the positon attribute
      glUtility.bindBuffer(indexedBuffer.vertices, positionHandle,  program, 3, gl.FLOAT, 12, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexedBuffer.indices);
      gl.drawElements(gl.LINES, indexedBuffer.nindices, gl.UNSIGNED_SHORT, 0);
    }
  }

  glUtility = glUtility_;
  gl        = glUtility.getGLContext();
  program   = this.createProgram();
}
