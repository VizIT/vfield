/*
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

// Define the global namespaces iff not already defined.
window.vizit               = window.vizit               || {};
window.vizit.electricfield = window.vizit.electricfield || {};

(function (ns)
 {
   /**
    * Render field lines described by a combination of triangles and triangle strips.
    * tracks VBOs for the lines, load the line rendering vector and fragment shaders,
    * and map the Float32Arrays describing the vertices to the shaders. Used, for
    * example, in electric field line rendering.
    *
    * This version uses <a href =
    * "https://developer.download.nvidia.com/SDK/9.5/Samples/DEMOS/OpenGL/src/cg_VolumeLine/docs/VolumeLine.pdf">Volumetric
    * Lines</a>. That is rather than using GL_LINES, we will render each line segment as a rectangle.
    * This provides much greater control over the width and appearance of the line.
    *
    * @param {GLUtility} GLUtility_ A wrapper around the WebGLRenderingContext, gl.
    *
    * @constructor
    */
   ns.FieldLineRenderer = function (glUtility_)
   {
     let lineWidth  = ns.FieldLineRenderer.DEFAULT_LINE_WIDTH;
     let arrowWidth = ns.FieldLineRenderer.DEFAULT_ARROW_WIDTH;

     /**
      * Set the approximate screen width for field lines
      * @param {number} width Floating point representing the electric field line width
      *
      *  @returns {vizit.electricfield.FieldLineRenderer}
      */
     this.setLineWidth = function(width)
     {
       lineWidth = width;
       return this;
     }

     this.getLineWidth = function()
     {
       return lineWidth;
     }

     this.setArrowWidth = function(width)
     {
       arrowWidth = width;
       return this;
     }

     this.getArrowWidth = function()
     {
       return arrowWidth;
     }

     /**
      * Build a wide line using rectangles. Each line segment from a to b is drawn as a rectangle
      * with corners at a ± halfWidth and b ± halfWidth in screen space.
      *
      * @param {GLUtility} glUtility A wrapper around the WebGLRenderingContext, gl.
      * @returns {WebGLProgram}
      */
     this.createProgram  = function (glUtility)
     {
       const vertexShaderSource   = "attribute vec3  current;"
                                  + "attribute vec3  other;"
                                  + "attribute float direction;"
                                  + ""
                                  + "uniform   float aspect;"
                                  + "uniform   float halfWidth;"
                                  + "uniform   mat4  modelViewMatrix;"
                                  + "uniform   mat4  projectionMatrix;"
                                  + ""
                                  + "void main()"
                                  + "{"
                                  + "  mat4 projModelView    = projectionMatrix * modelViewMatrix;"
                                  + ""
                                  + "  vec4 currentProjected = projModelView * vec4(current, 1.0);"
                                  + "  vec4 otherProjected   = projModelView * vec4(other, 1.0);"
                                  + ""
                                  + "  vec2 currentScreen    = currentProjected.xy / currentProjected.w;"
                                  + "  currentScreen.x      *= aspect;"
                                  + "  vec2 otherScreen      = otherProjected.xy / otherProjected.w;"
                                  + "  otherScreen.x        *= aspect;"
                                  + ""
                                  + "  vec2 dir              = normalize(currentScreen - otherScreen);"
                                  + "  vec2 normal           = vec2(-dir.y, dir.x);"
                                  + "  normal               *= halfWidth;"
                                  + "  normal.x             /= aspect;"
                                  + ""
                                  + "  vec4 offset = vec4(normal * direction, 0.0, 0.0);"
                                  + ""
                                  + "  gl_Position = currentProjected + offset;"
                                  + "}";

       // For now use a constant color for the field lines. Later consider color derived from field strength.
       const fragmentShaderSource = "precision mediump float;"
                                    + ""
                                    + "void main()"
                                    + "{"
                                    + "  gl_FragColor = vec4(0.8,0.3,0.3,1.0);"
                                    + "}";

       // Compile and link the shader program
       const program                = glUtility.createProgram(vertexShaderSource, fragmentShaderSource);

       const currentHandle          = glUtility.getAttribLocation(program,  "current");
       const directionHandle        = glUtility.getAttribLocation(program,  "direction");
       const otherHandle            = glUtility.getAttribLocation(program,  "other");

       const aspectHandle           = glUtility.getUniformLocation(program, "aspect");
       const halfWidthHandle        = glUtility.getUniformLocation(program, "halfWidth");
       const modelViewMatrixHandle  = glUtility.getUniformLocation(program, "modelViewMatrix");
       const projectionMatrixHandle = glUtility.getUniformLocation(program, "projectionMatrix");

       return {
         program:                program,

         currentHandle:          currentHandle,
         directionHandle:        directionHandle,
         otherHandle:            otherHandle,

         aspectHandle:           aspectHandle,
         halfWidthHandle:        halfWidthHandle,
         modelViewMatrixHandle:  modelViewMatrixHandle,
         projectionMatrixHandle: projectionMatrixHandle
       };
     };

     /**
      * Build an arrow directed along a line from base to tip. Each arrow is a pair of triangles, extruded in screen space
      * with corners at a ± halfWidth and b ± halfWidth in screen space.
      *
      * @param {GLUtility} glUtility A wrapper around the WebGLRenderingContext, gl.
      * @returns {WebGLProgram}
      */
     this.createArrowProgram  = function (glUtility)
     {
       const vertexShaderSource   = "attribute vec3  current;"
                                  + "attribute vec3  tip;"
                                  // Displacement direction for the arrow barbs
                                  // Zero for tip and base
                                  + "attribute float direction;"
                                  + ""
                                  + "uniform   float aspect;"
                                  + "uniform   float halfWidth;"
                                  + "uniform   mat4  modelViewMatrix;"
                                  + "uniform   mat4  projectionMatrix;"
                                  + ""
                                  + "void main()"
                                  + "{"
                                  + "  mat4 projModelView    = projectionMatrix * modelViewMatrix;"
                                  + ""
                                  + "  vec4 currentProjected = projModelView * vec4(current, 1.0);"
                                  + "  vec4 tipProjected   =   projModelView * vec4(tip, 1.0);"
                                  + ""
                                  + "  vec2 currentScreen    = currentProjected.xy / currentProjected.w;"
                                  + "  currentScreen.x      *= aspect;"
                                  + "  vec2 tipScreen        = tipProjected.xy / tipProjected.w;"
                                  + "  tipScreen.x          *= aspect;"
                                  + ""
                                  + "  vec2 dir              = currentScreen - tipScreen;"
                                  + "  vec2 normal           = (dir == vec2(0.0, 0.0) ? vec2(0.0, 0.0) : normalize(vec2(-dir.y, dir.x)));"
                                  + "  normal               *= halfWidth;"
                                  + "  normal.x             /= aspect;"
                                  + ""
                                  + "  vec4 offset = (direction == 0.0 ?"
                                  + "                             vec4(0.0, 0.0, 0.0, 0.0) : " // No direction => no displacement
                                  + "                             vec4((normal * direction / currentProjected.w) + dir/3.0, 0.0, 0.0));"  // Displace the arrow barbs away from the line and backwards
                                  + ""
                                  + "  gl_Position = currentProjected + offset;"
                                  + "}";

       // For now use a constant color for the field lines. Later consider color derived from field strength.
       const fragmentShaderSource = "precision mediump float;"
                                  + ""
                                  + "void main()"
                                  + "{"
                                  + "  gl_FragColor = vec4(0.8,0.3,0.3,1.0);"
                                  + "}";

       // Compile and link the shader program
       const program                = glUtility.createProgram(vertexShaderSource, fragmentShaderSource);

       const currentHandle          = glUtility.getAttribLocation(program,  "current");
       const directionHandle        = glUtility.getAttribLocation(program,  "direction");
       const tipHandle              = glUtility.getAttribLocation(program,  "tip");

       const aspectHandle           = glUtility.getUniformLocation(program, "aspect");
       const halfWidthHandle        = glUtility.getUniformLocation(program, "halfWidth");
       const modelViewMatrixHandle  = glUtility.getUniformLocation(program, "modelViewMatrix");
       const projectionMatrixHandle = glUtility.getUniformLocation(program, "projectionMatrix");

       return {
         program:                program,

         currentHandle:          currentHandle,
         directionHandle:        directionHandle,
         tipHandle:              tipHandle,

         aspectHandle:           aspectHandle,
         halfWidthHandle:        halfWidthHandle,
         /** WebGL GLint handle on the modelViewMatrix uniform */
         modelViewMatrixHandle:  modelViewMatrixHandle,
         projectionMatrixHandle: projectionMatrixHandle
       };
     };

     /**
      * Each field line buffer drives the rendering of instances of a rectangle to generate
      * to appearance of a line.
      *
      * @param projectionMatrix
      * @param modelViewMatrix
      * @param color
      * @param fieldLineVBOs
      */
     this.render = function (projectionMatrix, modelViewMatrix, color, fieldLineVBOs)
     {
       let fieldLineVBO;
       const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
       const floatsPerLocation = vizit.electricfield.FieldLine.FLOATS_PER_LOCATION;

       const nlines = fieldLineVBOs.length;
       /** Each vertex has the current location, the other location, and the displacement direction. */
       const locationStride =  vizit.electricfield.FieldLine.FLOATS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT;

       if (nlines > 0)
       {
         // This program draws the field lines
         gl.useProgram(lineProgram.program);

         // TODO These only need be set when they change
         gl.uniformMatrix4fv(lineProgram.modelViewMatrixHandle,       false, modelViewMatrix);
         gl.uniformMatrix4fv(lineProgram.projectionMatrixHandle,      false, projectionMatrix);
         gl.uniform1f(lineProgram.aspectHandle,    aspect);
         gl.uniform1f(lineProgram.halfWidthHandle, lineWidth/gl.drawingBufferHeight);

         for(var i=0; i<nlines; i++)
         {
           fieldLineVBO = fieldLineVBOs[i];
           if (!fieldLineVBO.isEnabled())
           {
             break;
           }
           // Draw the line as a set of short line segments between successive points on the field line
           glUtility.bindBuffer(fieldLineVBO.fieldLineBufferHandle,      lineProgram.currentHandle,   floatsPerLocation, gl.FLOAT, locationStride, 0);
           glUtility.bindBuffer(fieldLineVBO.fieldLineBufferHandle,      lineProgram.otherHandle,     floatsPerLocation, gl.FLOAT, locationStride, floatsPerLocation*Float32Array.BYTES_PER_ELEMENT);
           glUtility.bindBuffer(fieldLineVBO.fieldLineBufferHandle,      lineProgram.directionHandle, 1,                 gl.FLOAT, locationStride, 2*floatsPerLocation*Float32Array.BYTES_PER_ELEMENT);
           gl.drawArrays(gl.TRIANGLE_STRIP, 0, (fieldLineVBO.npoints-1)*4);
         }

         // This program draws the directional arrows along the field lines
         gl.useProgram(arrowProgram.program);

         gl.enableVertexAttribArray(arrowProgram.tipHandle);
         gl.enableVertexAttribArray(arrowProgram.directionHandle);

         // TODO These only need be set when they change
         gl.uniformMatrix4fv(arrowProgram.modelViewMatrixHandle,       false, modelViewMatrix);
         gl.uniformMatrix4fv(arrowProgram.projectionMatrixHandle,      false, projectionMatrix);

         gl.uniform1f(arrowProgram.aspectHandle,    aspect);
         gl.uniform1f(arrowProgram.halfWidthHandle, (arrowWidth/2.0)/gl.drawingBufferHeight);


         for(var j=0; j<nlines; j++)
         {
           fieldLineVBO = fieldLineVBOs[j];
           if (!fieldLineVBO.isEnabled())
           {
             break;
           }

           // Draw directional arrows as pairs of triangles
           glUtility.bindBuffer(fieldLineVBO.fieldDirectionBufferHandle, arrowProgram.currentHandle,   floatsPerLocation, gl.FLOAT, locationStride, 0);
           glUtility.bindBuffer(fieldLineVBO.fieldDirectionBufferHandle, arrowProgram.tipHandle,       floatsPerLocation, gl.FLOAT, locationStride, floatsPerLocation*Float32Array.BYTES_PER_ELEMENT);
           glUtility.bindBuffer(fieldLineVBO.fieldDirectionBufferHandle, arrowProgram.directionHandle, 1,                 gl.FLOAT, locationStride, 2*floatsPerLocation*Float32Array.BYTES_PER_ELEMENT);

           // The index buffer enumerates which vertices to draw and in what order
           gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fieldLineVBO.fieldDirectionIndices);
           // Draw the triangles !
           gl.drawElements(
               gl.TRIANGLES,                                      // We are drawing individual triangles
               fieldLineVBO.narrows * 3 * 2,                // Total number of vertices we draw
               gl.UNSIGNED_SHORT,                                 // Default WebGL only supports 16 bit unsigned ints
               0                                            // offset - start at the beginning of the index buffer
           );
         }
       }
     };

     const glUtility            = glUtility_;
     /** WebGLRenderingContext */
     const gl                   = glUtility.getGLContext();
     const lineProgram          = this.createProgram(glUtility);
     const arrowProgram         = this.createArrowProgram(glUtility);
   };

   /** The default width for field lines */
   ns.FieldLineRenderer.DEFAULT_LINE_WIDTH = 3.0;
   ns.FieldLineRenderer.DEFAULT_ARROW_WIDTH = 5.0 * ns.FieldLineRenderer.DEFAULT_LINE_WIDTH;
 }(window.vizit.electricfield));
