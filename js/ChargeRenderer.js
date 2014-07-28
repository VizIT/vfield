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
 * Render flux lines described by a combination of lines and line strips. Will
 * track VBOs for the lines, load the line rendering vector and fragment shaders,
 * and map the Float32Arrays describing the vertices to the shaders. Used, for
 * example, in field line rendering.
 *
 * @param {GLUtility}     GLUtility_ A wrapper around the WebGLRenderingContext, gl.
 *
 * @param {latchCallback} callback   Invoked when each texture resource is loaded.
 *
 * @constructor
 */
function ChargeRenderer(glUtility_, callback, home)
{
  var chargeHandle;
  /** WebGLRenderingContext */
  var gl;
  var glUtility;
  /** WebGL GLint handle on the modelViewMatrix uniform */
  var modelViewMatrixHandle;
  var negativeChargeHandle;
  var negativeChargeIndex;
  var negativeChargeTexture;
  var positionHandle;
  var positiveChargeHandle;
  var positiveChargeIndex;
  var positiveChargeTexture;
  var program;
  /** WebGL GLint handle on the projectionMatrix uniform */
  var projectionMatrixHandle;

  this.createProgram  = function(gl)
  {
    var fragmentShaderSource;
    var program;
    var vertexShaderSource;

    vertexShaderSource    = "precision highp float;"
                            + "attribute vec3  position;"
                            + "attribute float charge;"
                            + "varying   float vCharge;"
                            + "uniform   mat4  modelViewMatrix;"
                            + "uniform   mat4  projectionMatrix;"
                            + ""
                            + "void main()"
                            + "{"
                            + "    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1);"
                            + "    gl_PointSize = 16.0;"
                            + "    vCharge      = charge;"
                            + "}";

    // TODO Look for a non texture way to handle this
    fragmentShaderSource  =   "precision lowp float;"
                            + "varying float     vCharge;"
                            + "uniform sampler2D positiveChargeSampler;"
                            + "uniform sampler2D negativeChargeSampler;"
                            + ""
                            + "vec4   textureColor;"
                            + ""
                            + " void main()"
                            + " {"
                            + "   if (vCharge > 0.0)"
                            + "   {"
                            + "       textureColor = texture2D(positiveChargeSampler, gl_PointCoord);"
                            + "   }"
                            + "   else"
                            + "   {"
                            + "       textureColor = texture2D(negativeChargeSampler, gl_PointCoord);"
                            + "   }"
                            + ""
                            + "   if (textureColor.a > 0.5)"
                            + "   {"
                            + "       gl_FragColor = textureColor;"
                            + "   }"
                            + "   else"
                            + "   {"
                            + "       discard;"
                            + "   }"
                            + " }";


    // Compile and link the shader program
    program                = glUtility.createProgram(vertexShaderSource, fragmentShaderSource);

    chargeHandle           = glUtility.getAttribLocation(program,  "charge");
    modelViewMatrixHandle  = glUtility.getUniformLocation(program, "modelViewMatrix");
    negativeChargeHandle   = glUtility.getUniformLocation(program, "negativeChargeSampler");
    positionHandle         = glUtility.getAttribLocation(program,  "position");
    positiveChargeHandle   = glUtility.getUniformLocation(program, "positiveChargeSampler");
    projectionMatrixHandle = glUtility.getUniformLocation(program, "projectionMatrix");

    return program;
  }

  /**
   * Replace these with computed gradients.
   */
  this.loadTextures = function(home, callback)
  {
    // The texture number
    negativeChargeIndex   = 0;
    negativeChargeTexture = glUtility.loadTexture(home + "images/negativeCharge.png", negativeChargeIndex, callback);
    positiveChargeIndex   = 1;
    positiveChargeTexture = glUtility.loadTexture(home + "images/positiveCharge.png", positiveChargeIndex, callback);
  }

  // XXX Change bind texture to take a pre existing handle
  this.bindTextures = function()
  {
    glUtility.bindTexture(program, positiveChargeTexture, positiveChargeIndex, positiveChargeHandle);
    glUtility.bindTexture(program, negativeChargeTexture, negativeChargeIndex, negativeChargeHandle);
  }

  this.render       = function(projectionMatrix, modelViewMatrix, chargeBuffer, charges)
  {
    // Make this the currently active program
    gl.useProgram(program);

    // TODO These only need be set when they change
    gl.uniformMatrix4fv(modelViewMatrixHandle,  false, modelViewMatrix);
    gl.uniformMatrix4fv(projectionMatrixHandle, false, projectionMatrix);

    // Charge buffer positions to the position attribute
    // Stride of 16 because there is an extra float for the charge
    glUtility.bindBuffer(chargeBuffer, positionHandle, 3, gl.FLOAT, 16, 0);
    // First Q is after the first position, 12 bytes into the array.
    glUtility.bindBuffer(chargeBuffer, chargeHandle, 1, gl.FLOAT, 16, 12);

    gl.drawArrays(gl.POINTS, 0, charges.getNcharges());
  }

  glUtility = glUtility_;
  gl        = glUtility.getGLContext();
  program   = this.createProgram();
  this.loadTextures(home, callback);
}
