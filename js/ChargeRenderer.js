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
     var colorHandle;
     /** WebGLRenderingContext */
     var gl;
     var glUtility;
     /** WebGL GLint handle on the modelViewMatrix uniform */
     var modelViewMatrixHandle;
     var positionHandle;
     var program;
     /** WebGL GLint handle on the projectionMatrix uniform */
     var projectionMatrixHandle;
     var sizeHandle;

     this.createProgram  = function ()
     {
       var fragmentShaderSource;
       var program;
       var vertexShaderSource;

       vertexShaderSource    = "precision highp float;"
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

       // TODO Continue to improve with lighting & highlights
       fragmentShaderSource  = "precision lowp float;"
			                 + "varying vec4 vColor;"
			                 + ""
			                 + " void main()"
			                 + " {"
			                 + "   float dist = distance( vec2(0.5,0.5), gl_PointCoord );"
                             + "   if ( dist > 0.5 )"
                             + "     discard;"
                             + "   gl_FragColor = vColor;"
			                 + " }";


       // Compile and link the shader program
       program                = glUtility.createProgram(vertexShaderSource, fragmentShaderSource);

       colorHandle            = glUtility.getAttribLocation(program,  "color");
       modelViewMatrixHandle  = glUtility.getUniformLocation(program, "modelViewMatrix");
       positionHandle         = glUtility.getAttribLocation(program,  "position");
       projectionMatrixHandle = glUtility.getUniformLocation(program, "projectionMatrix");
       sizeHandle             = glUtility.getAttribLocation(program,  "size");

       // Enable the attribute to take array input (see render)
 //      gl.enableVertexAttribArray(colorHandle);
//       gl.enableVertexAttribArray(positionHandle);
//       gl.enableVertexAttribArray(sizeHandle);

       return program;
     };

     this.render       = function (projectionMatrix, modelViewMatrix, chargeBuffer, charges)
     {
       const ncharges = charges.getNcharges();

       if (ncharges > 0)
       {
           // Make this the currently active program
           gl.useProgram(program);

           // TODO These only need be set when they change
           gl.uniformMatrix4fv(modelViewMatrixHandle, false, modelViewMatrix);
           gl.uniformMatrix4fv(projectionMatrixHandle, false, projectionMatrix);

           // Binding an object in Open GL makes it the target of subsequent operations.
           gl.bindBuffer(gl.ARRAY_BUFFER, chargeBuffer);

           // Enable the attribute to take array input
           gl.enableVertexAttribArray(colorHandle);
           gl.enableVertexAttribArray(positionHandle);
           gl.enableVertexAttribArray(sizeHandle);

           // Charge buffer positions to the position attribute
           // Stride of 20 because there is an extra float for the charge, four bytes for color
           gl.vertexAttribPointer(positionHandle, 3, gl.FLOAT, false, 20, 0);

           // First size entry is after the first position, 12 bytes into the array, all should be the same
           gl.vertexAttribPointer(sizeHandle, 1, gl.FLOAT, false, 20, 12);

           // Each color is four normalized, unsigned bytes
           gl.vertexAttribPointer(colorHandle, 4, gl.UNSIGNED_BYTE, true, 20, 16);

           gl.drawArrays(gl.POINTS, 0, ncharges);
       }
     };

     glUtility     = glUtility_;
     gl            = glUtility.getGLContext();
     program       = this.createProgram();
   };
}(window.vizit.electricfield));
