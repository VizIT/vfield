/**
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

window.vizit               = window.vizit               || {};
window.vizit.electricfield = window.vizit.electricfield || {};

(function (ns)
 {
   /**
    * Render points in a given color. Tracks VBO for the point positions and colors.
    * Load the point rendering vector and fragment shaders, and map the Float32Arrays
    * describing the points to the shaders. Used, for example, to render point charges.
    *
    * @param {GLUtility}     glUtility_ A wrapper around the WebGLRenderingContext, gl.
    *
    * @class
    */
   ns.ChargeRenderer = function (glUtility_)
   {
     /** WebGLRenderingContext */
     var gl;
     var glUtility;
     var program;

     this.createProgram  = function ()
     {
       const vertexShaderSource    = "precision highp float;"
			                       + "attribute vec3  position;"
			                       + "attribute vec4  color;"
                                   + "attribute float size;"
                                   + ""
			                       + "uniform   mat4  modelViewMatrix;"
			                       + "uniform   mat4  projectionMatrix;"
			                       + ""
                                   + "varying vec4 vColor;"
                                   + ""
			                       + "void main()"
			                       + "{"
			                       + "    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1);"
			                       + "    gl_PointSize = size;"
			                       + "    vColor       = color;"
			                       + "}";


       // We are actually rendering a square point, however
       // We trim pixels further than a given distance from the center, yielding a circle
       // We shade and light each point as it it were on a sphere, giving a bit of a 3D illusion
       const fragmentShaderSource  = "precision lowp float;"
			                       + "varying vec4 vColor;"
			                       + ""
                                   + "uniform   vec3 ambientLighting;"
                                   + "uniform   vec3 directionalLighting;"
                                   + ""
			                       + " void main()"
			                       + " {"
                                   // position relative to the center of the circle
                                   // gl_PointCoord is in st space, where s in [0,1] and t in [0,1]
                                   + "   vec2  position  = gl_PointCoord - vec2(0.5,0.5);"
                                   + "   if ( length(position) > 0.5 )"
                                   + "     discard;"
                                   // The equation of the sphere in this coordinate system is
                                   // (x-0.5)^2 + (y-.05)^2 + z^2 = (0.5)^2
                                   + "   float z         = sqrt(0.5*0.5 - position.x*position.x - position.y*position.y);"
                                   + "   vec3  normal    = normalize(vec3(position, z));"
                                   + "   float specular  = dot(normal, directionalLighting);"
                                   + "   specular        = specular  <= 0.0 ? 0.0 : pow(specular , 15.0);"
                                   + "   gl_FragColor    = vec4(vColor.rgb * ambientLighting + vColor.rgb*specular, vColor.a);"
			                       + " }";


       // Compile and link the shader program
       const program                   = glUtility.createProgram(vertexShaderSource, fragmentShaderSource);

       const colorHandle               = glUtility.getAttribLocation(program,  "color");
       const positionHandle            = glUtility.getAttribLocation(program,  "position");
       const sizeHandle                = glUtility.getAttribLocation(program,  "size");

       const ambientLightingHandle     = glUtility.getUniformLocation(program, "ambientLighting");
       const directionalLightingHandle = glUtility.getUniformLocation(program, "directionalLighting");
       /** WebGL GLint handle on the modelViewMatrix uniform */
       const modelViewMatrixHandle     = glUtility.getUniformLocation(program, "modelViewMatrix");
       /** WebGL GLint handle on the projectionMatrix uniform */
       const projectionMatrixHandle    = glUtility.getUniformLocation(program, "projectionMatrix");

       return {
           program:                   program,

           colorHandle:               colorHandle,
           positionHandle:            positionHandle,
           sizeHandle:                sizeHandle,

           ambientLightingHandle:     ambientLightingHandle,
           directionalLightingHandle: directionalLightingHandle,
           modelViewMatrixHandle:     modelViewMatrixHandle,
           projectionMatrixHandle:    projectionMatrixHandle
       };
     };

     this.render       = function (projectionMatrix, modelViewMatrix, chargeBuffer, charges)
     {
       const ncharges = charges.getNcharges();

       if (ncharges > 0)
       {
           // Make this the currently active program
           gl.useProgram(program.program);

           // TODO These only need be set when they change
           gl.uniformMatrix4fv(program.modelViewMatrixHandle, false, modelViewMatrix);
           gl.uniformMatrix4fv(program.projectionMatrixHandle, false, projectionMatrix);

           gl.uniform3f(program.ambientLightingHandle,     0.8, 0.8, 0.8);
           // The fragment shader works in texture coordinates where the point is centered at 0.5, 0.5.
           const x0 = 0.5;
           const y0 = 0.5;
           gl.uniform3f(program.directionalLightingHandle, x0 + 0.15, y0 + 0.05, 0.8);

           // Binding an object in Open GL makes it the target of subsequent operations.
           gl.bindBuffer(gl.ARRAY_BUFFER, chargeBuffer);

           // Enable the attribute to take array input
           gl.enableVertexAttribArray(program.colorHandle);
           gl.enableVertexAttribArray(program.positionHandle);
           gl.enableVertexAttribArray(program.sizeHandle);

           // Charge buffer positions to the position attribute
           // Stride of 20 because there is an extra float for the charge, four bytes for color
           gl.vertexAttribPointer(program.positionHandle, 3, gl.FLOAT, false, 20, 0);

           // First size entry is after the first position, 12 bytes into the array, all should be the same
           gl.vertexAttribPointer(program.sizeHandle, 1, gl.FLOAT, false, 20, 12);

           // Each color is four normalized, unsigned bytes
           gl.vertexAttribPointer(program.colorHandle, 4, gl.UNSIGNED_BYTE, true, 20, 16);

           gl.drawArrays(gl.POINTS, 0, ncharges);
       }
     };

     glUtility     = glUtility_;
     gl            = glUtility.getGLContext();
     program       = this.createProgram();
   };
}(window.vizit.electricfield));
