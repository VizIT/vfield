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
 * Render surfaces described by assemblies of triangles. Will track VBOs for the
 * surfaces, load the surface rendering vector and fragment shaders, and map the
 * Float32Arrays describing the vertices to the shaders. Used, for example, in
 * the vector field rendering.
 *
 * @param {GLUtility} GLUtility_ A wrapper around the WebGLRenderingContext, gl.
 *
 * @constructor
 */
function SurfaceRenderer(glUtility_)
{
  var ambientLightingHandle;  
  var directionalLightingHandle;
  var directionalColorHandle;   
  /** WebGLRenderingContext */
  var gl;
  var globalModelViewMatrixHandle;
  var glUtility;
  /** WebGL GLint handle on the modelViewMatrix uniform */
  var modelViewMatrixHandle;
  var normalHandle;
  var normalMatrixHandle; 
  var positionHandle;
  var program;
  /** WebGL GLint handle on the projectionMatrix uniform */
  var projectionMatrixHandle;
  var surfaceColorHandle;

  this.createProgram  = function (gl)
  {
    var fragmentShaderSource;
    var program;
    var vertexShaderSource;

    // This vertex shader has a lot of inputs.
    // normal,  an attribute giving the outward pointing normal to the surface
    // position an attribute giving the position of this vertex.
    // ambientLighting universal non-directional lighting
    // directionalLighting a vector indicating the direction for directional lighting.
    //                     Directional lighting helps bring out the shape of surfaces
    // directionalColor the color for the directional lighting
    vertexShaderSource = "attribute vec3 normal;"
                       + "attribute vec3 position;"
                       + ""
                       + "uniform   vec3 ambientLighting;"
                       + "uniform   vec3 directionalLighting;"
                       + "uniform   vec3 directionalColor;"
                       + "uniform   mat4 modelViewMatrix;"
                       + "uniform   mat4 globalModelViewMatrix;"
                       + "uniform   mat3 normalMatrix;"
                       + "uniform   mat4 projectionMatrix;"
                       + ""
                       + "varying   vec3 lighting;"
                       + ""
                       + "void main(void)"
                       + "{"
                       + "  gl_Position = projectionMatrix * globalModelViewMatrix * modelViewMatrix * vec4(position, 1.0);"
                       + ""
                       + "  vec3  transformedNormal         = normalMatrix * normal;"
                       + "  float directionalLightWeighting = max(dot(transformedNormal, directionalLighting), 0.0);"
                       + "  lighting                        = ambientLighting + directionalColor * directionalLightWeighting;"
                       + "}";


    fragmentShaderSource = "precision mediump float;"
                         + ""
                         + "uniform vec4 surfaceColor;"
                         + "varying vec3 lighting;"
                         + ""
                         + "void main(void)"
                         + "{"
                         + "  gl_FragColor = vec4(surfaceColor.rgb * lighting, surfaceColor.a);"
                         + "}";

    // Compile and link the shader program
    program                     = glUtility.createProgram(vertexShaderSource, fragmentShaderSource);

    ambientLightingHandle       = glUtility.getUniformLocation(program, "ambientLighting");
    directionalLightingHandle   = glUtility.getUniformLocation(program, "directionalLighting");
    directionalColorHandle      = glUtility.getUniformLocation(program, "directionalColor");
    modelViewMatrixHandle       = glUtility.getUniformLocation(program, "modelViewMatrix");
    globalModelViewMatrixHandle = glUtility.getUniformLocation(program, "globalModelViewMatrix");
    normalHandle                = glUtility.getAttribLocation(program,  "normal");
    normalMatrixHandle          = glUtility.getUniformLocation(program, "normalMatrix");
    positionHandle              = glUtility.getAttribLocation(program,  "position");
    projectionMatrixHandle      = glUtility.getUniformLocation(program, "projectionMatrix");
    surfaceColorHandle          = glUtility.getUniformLocation(program, "surfaceColor");

    return program;
  }

  this.getAmbientLightingHandle = function ()
  {
    return ambientLightingHandle;
  }

  this.getDirectionalLightingHandle = function ()
  {
    return directionalLightingHandle;
  }

  this.getDirectionalColorHandle = function ()
  {
    return directionalColorHandle;
  }

  this.getModelViewMatrixHandle = function ()
  {
    return modelViewMatrixHandle;
  }

  this.getGlobalModelViewMatrixHandle = function ()
  {
    return globalModelViewMatrixHandle;
  }

  this.getNormalHandle = function ()
  {
    return normalHandle;
  }

  this.getNormalMatrixHandle = function ()
  {
    return normalMatrixHandle;
  }

  this.getPositionHandle = function ()
  {
    return positionHandle;
  }

  this.getProjectionMatrixHandle = function ()
  {
    return projectionMatrixHandle;
  }

  this.getSurfaceColorHandle     = function ()
  {
    return surfaceColorHandle;
  }

  // TODO Consider adding drawSurfaces, where surface=>surfaces, an array of surfaces.
  // TODO Consider including enable gl.BLEND code
  this.render      = function (projectionMatrix, globalModelViewMatrix,
                              normalMatrix,     surfaces)
  {
    var nsurfaces;
    nsurfaces = surfaces.length;

    if (nsurfaces > 0)
    {
      // Make this the currently active program
      gl.useProgram(program);

      gl.uniformMatrix4fv(globalModelViewMatrixHandle, false, globalModelViewMatrix);
      gl.uniformMatrix3fv(normalMatrixHandle,          false, normalMatrix);
      gl.uniformMatrix4fv(projectionMatrixHandle,      false, projectionMatrix);

      gl.uniform3f(ambientLightingHandle,     0.3, 0.3, 0.3);
      gl.uniform3f(directionalLightingHandle, 1.0, 1.0, 1.0);
      gl.uniform3f(directionalColorHandle,    0.4, 0.4, 0.4);

      for (var i=0; i<nsurfaces; i++)
      {
        // Each surface renders itself differently.
        surfaces[i].render(glUtility, this);
      }
    }
  }

  glUtility = glUtility_;
  gl        = glUtility.getGLContext();
  program   = this.createProgram();
}