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
 * Render field lines described by a combination of lines and line strips. Will
 * track VBOs for the lines, load the line rendering vector and fragment shaders,
 * and map the Float32Arrays describing the vertices to the shaders. Used, for
 * example, in field line rendering.
 *
 * @param {GLUtility} GLUtility_ A wrapper around the WebGLRenderingContext, gl.
 *
 * @constructor
 */
function FieldLineRenderer(glUtility_)
{
  /** WebGLRenderingContext */
  var gl;
  var glUtility;
  /** WebGL GLint handle on the modelViewMatrix uniform */
  var modelViewMatrixHandle;
  var positionHandle;
  var program;
  /** WebGL GLint handle on the projectionMatrix uniform */
  var projectionMatrixHandle;

  this.createProgram  = function(gl)
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
                         + "  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
                         + "}";

    // For now use a constant color for the field lines. Later consider color derived from field strength.
    fragmentShaderSource = "precision mediump float;"
                           + ""
                           + "void main()"
                           + "{"
                           + "  gl_FragColor = vec4(0.8,0.3,0.3,1.0);"
                           + "}";

    // Compile and link the shader program
    program                = glUtility.createProgram(vertexShaderSource, fragmentShaderSource);

    modelViewMatrixHandle  = glUtility.getUniformLocation(program, "modelViewMatrix");
    positionHandle         = glUtility.getAttribLocation(program,  "position");
    projectionMatrixHandle = glUtility.getUniformLocation(program, "projectionMatrix");

    return program;
  }

  this.renderLines = function(projectionMatrix, modelViewMatrix, color, fieldLineVBOs)
  {
    var fieldLineVBO;
    var nlines;

    nlines = fieldLineVBOs.length;
    // Make this the currently active program
    gl.useProgram(program);
    gl.lineWidth(1);

    // TODO These only need be set when they change
    gl.uniformMatrix4fv(modelViewMatrixHandle,       false, modelViewMatrix);
    gl.uniformMatrix4fv(projectionMatrixHandle,      false, projectionMatrix);

    for(var i=0; i<nlines; i++)
    {
      // Bind the buffer to the positon attribute
      glUtility.bindBuffer(fieldLineVBOs[i].fieldLineBufferHandle, 'position', program, 3, gl.FLOAT, 12, 0);
      gl.drawArrays(gl.LINE_STRIP, 0, fieldLineVBOs[i].npoints);
      glUtility.bindBuffer(fieldLineVBOs[i].fieldDirectionBufferHandle, 'position', program, 3, gl.FLOAT, 12, 0);
      gl.drawArrays(gl.LINES, 0, fieldLineVBOs[i].narrows);
    }
  }

  glUtility            = glUtility_;
  gl                   = glUtility.getGLContext();
  program              = this.createProgram();
}