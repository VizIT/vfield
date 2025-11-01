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

window.vizit = window.vizit || {};
window.vizit.vectorfield = window.vizit.vectorfield || {};

(function (ns) {
    /**
     * Javascript object to render simple lines. Will track VBOs for the lines, load the line drawing
     * vector and fragment shaders, and map the Float32Arrays describing the vertices to the shaders.
     * Used, for example, in the vector field rendering.
     *
     * @param {GLUtility} glUtility_ A wrapper around the WebGLRenderingContext, gl.
     *
     * @constructor
     */
    ns.LineRenderer = function (glUtility_) {

        this.createProgram = function () {

            const vertexShaderSource
                               = "attribute vec3  current;"
                               + "attribute vec3  other;"
                               + "attribute float normalOffset;"
                               + "attribute float parallelOffset;"
                               + ""
                               + "uniform   vec2  resolution;"
                               + "uniform   mat4  modelViewMatrix;"
                               + "uniform   mat4  projectionMatrix;"
                               + ""
                               + "varying   vec2  vParallelOffset;"
                               + "void main()"
                               + "{"
                               + "  mat4 projModelView    = projectionMatrix * modelViewMatrix;"
                               + ""
                               + "  vec4 currentProjected = projModelView * vec4(current, 1.0);"
                               + "  vec4 otherProjected   = projModelView * vec4(other, 1.0);"
                               + ""
                               + "  vec2 currentScreen       = currentProjected.xy / currentProjected.w;"
                               //+ "  currentScreen.x         *= aspect;"
                               + "  vec2 otherScreen        = otherProjected.xy / otherProjected.w;"
                               //+ "  otherScreen.x          *= aspect;"
                               + ""
                               + "  vec2 dir              = otherScreen - currentScreen;"
                               + "  vec2 normal           = (dir == vec2(0.0, 0.0) ? vec2(0.0, 0.0) : normalize(vec2(-dir.y, dir.x)));"
                               + ""
                               + "  float originalLength  = distance(current, other);"
                               + "  float screenLength    = length(dir);" // TODO: Can we really get rid of this?
                               + ""
                               + "  vec4 offset = vec4(normal*normalOffset, 0.0, 0.0);" // Adjustments perpendicular to the arrow
                               + "  offset     += screenLength == 0.0 ? vec4(0.0, 0.0, 0.0, 0.0)"
                               + "                                    : vec4(dir * parallelOffset / screenLength, 0.0, 0.0);" // Adjustments along the arrow
                               + "  offset.xy            /= resolution * currentProjected.w;"
                               + ""
                               //+ "  vParallelOffset = dir * parallelOffset / screenLength / resolution;"
                               + "  vParallelOffset = resolution;"
                               + "  gl_Position = currentProjected + offset;"
                               //+ "  gl_Position = currentProjected + offset;"
                               + "}";

            // For now use a constant color for all lines. Later consider color derived from field strength.
            const fragmentShaderSource
                = "precision mediump float;"
                + "uniform   vec4 color;"
                + ""
                + "void main()"
                + "{"
                + "    gl_FragColor = color;"
                + "}";

            // Compile and link the shader program
            const program                = glUtility.createProgram(vertexShaderSource, fragmentShaderSource, ["gl_Position", "vParallelOffset"]);

            // Fetch handles for the attributes and uniforms - reuse on each rendering.
            /** WebGL GLint handle on the base of the arrow */
            const currentHandle          = glUtility.getAttribLocation(program, "current");
            const otherHandle            = glUtility.getAttribLocation(program, "other");
            const normalOffsetHandle     = glUtility.getAttribLocation(program, "normalOffset");
            const parallelOffsetHandle   = glUtility.getAttribLocation(program, "parallelOffset");

            const resolutionHandle       = glUtility.getUniformLocation(program, "resolution");
            /** WebGL GLint handle on the color attribute */
            const colorHandle            = glUtility.getUniformLocation(program, "color");
            /** WebGL GLint handle on the modelViewMatrix uniform */
            const modelViewMatrixHandle  = glUtility.getUniformLocation(program, "modelViewMatrix");
            /** WebGL GLint handle on the projectionMatrix uniform */
            const projectionMatrixHandle = glUtility.getUniformLocation(program, "projectionMatrix");

            return {
                program:                program,
                currentHandle:          currentHandle,
                otherHandle:            otherHandle,
                normalOffsetHandle:     normalOffsetHandle,
                parallelOffsetHandle:   parallelOffsetHandle,
                resolutionHandle:       resolutionHandle,
                colorHandle:            colorHandle,
                modelViewMatrixHandle:  modelViewMatrixHandle,
                projectionMatrixHandle: projectionMatrixHandle
            }
        };

        /**
         * Draw lines from a set of indexed buffers.
         *
         * @param projectionMatrix {Float32Array}             16 element projection matrix from view to screen space.
         * @param modelViewMatrix  {Float32Array}             16 element model view matrix positions the lines into view space.
         * @param color            {Float32Array}             The four color components, (r, g, b, a) for line drawing.
         * @param indexedBuffers   {Object}                   Contains two WebGLBuffers, one the vertices, the other
         *                                                    the indices. Also contains the number of indices.
         */
        this.drawIndexedLines = function (projectionMatrix, modelViewMatrix, color, indexedBuffers) {
            var indexedBuffer;
            var nbuffers;
            const resolution        = new Float32Array(2);
            resolution[0]           = gl.drawingBufferWidth;
            resolution[1]           = gl.drawingBufferHeight;
            const floatsPerLocation = ns.LineRenderer.FLOATS_PER_LOCATION;
            const floatsPerOffset   = ns.LineRenderer.FLOATS_PER_OFFSET;
            /** Each vertex has the tip, the base, and the displacements. */
            const stride            = ns.LineRenderer.FLOATS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT;


            gl.useProgram(program.program);

            gl.uniform4fv(program.colorHandle, color);
            gl.uniformMatrix4fv(program.modelViewMatrixHandle,  false, modelViewMatrix);
            gl.uniformMatrix4fv(program.projectionMatrixHandle, false, projectionMatrix);
            gl.uniform2fv(program.resolutionHandle, resolution);

            // Allocate space for the buffer, one vec4 position per indexed position
            const FEEDBACK_RESULT_BYTE_COUNT = 8*4*Float32Array.BYTES_PER_ELEMENT;


            // Create a TransformFeedback object
            const transformFeedback = gl.createTransformFeedback();
            // Make it the active TRANSFORM_FEEDBACK
            gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);

            // Output buffer for vec4 data
            const resultBuffer = gl.createBuffer();
            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, resultBuffer);
            gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, FEEDBACK_RESULT_BYTE_COUNT, gl.STATIC_DRAW);
            // Make resultBuffer the active TRANSFORM_FEEDBACK_BUFFER #0
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, resultBuffer);

            // Output buffer for float data
            const transform1Buffer = gl.createBuffer();
            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, transform1Buffer);
            gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, 2*8*Float32Array.BYTES_PER_ELEMENT, gl.STATIC_DRAW);
            // Make resultBuffer the active TRANSFORM_FEEDBACK_BUFFER #0
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, transform1Buffer);

            nbuffers = indexedBuffers.length;

            for (var i = 0; i < nbuffers; i++) {
                indexedBuffer = indexedBuffers[i];

                gl.beginTransformFeedback(gl.POINTS);

                // Bind the buffer to the position attribute
                glUtility.bindBuffer(indexedBuffer.vertices, program.currentHandle,        floatsPerLocation, gl.FLOAT, stride, 0);
                glUtility.bindBuffer(indexedBuffer.vertices, program.otherHandle,          floatsPerLocation, gl.FLOAT, stride, floatsPerLocation*Float32Array.BYTES_PER_ELEMENT);
                glUtility.bindBuffer(indexedBuffer.vertices, program.normalOffsetHandle,   floatsPerOffset,   gl.FLOAT, stride, 2*floatsPerLocation*Float32Array.BYTES_PER_ELEMENT);
                glUtility.bindBuffer(indexedBuffer.vertices, program.parallelOffsetHandle, floatsPerOffset,   gl.FLOAT, stride, 2*floatsPerLocation*Float32Array.BYTES_PER_ELEMENT + floatsPerOffset*Float32Array.BYTES_PER_ELEMENT);

                // for test with transform feedback only
                gl.drawArrays(gl.POINTS, 0, 8);

                //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexedBuffer.indices);
                //gl.drawElements(gl.LINE_STRIP, indexedBuffer.nindices, gl.UNSIGNED_SHORT, 0);

                // Deactivate the transform feedback, so we can read the buffer contents back.
                gl.endTransformFeedback();

                // Read back vec4 data
                gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, resultBuffer);
                const feedback = new Float32Array(4*8);
                gl.getBufferSubData(
                    gl.TRANSFORM_FEEDBACK_BUFFER,
                    0,
                    feedback,
                    0
                );

                for (let j=0; j<8; j++) {
                    console.log(` Vertex ${j} : [${feedback[4*j]}, ${feedback[4*j+1]}, ${feedback[4*j+2]}, ${feedback[4*j+3]}]\n`)
                }

                // Read back vec4 data
                gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, transform1Buffer);
                const floatResults = new Float32Array(2*8);
                gl.getBufferSubData(
                    gl.TRANSFORM_FEEDBACK_BUFFER,
                    0,
                    floatResults,
                    0
                );
                for (let j=0; j<8; j++) {
                    console.log(` ParallelOffset ${j}: [${floatResults[2*j]}, ${floatResults[2*j+1]}] \n`)
                }
            }
        };

        const glUtility = glUtility_;
        /** WebGLRenderingContext */
        const gl        = glUtility.getGLContext();
        const program   = this.createProgram();
    };
    // We include x,y,z but not w for each location
    ns.LineRenderer.FLOATS_PER_LOCATION  = 3;
    /** We have the base and the tip for each arrow. */
    ns.LineRenderer.LOCATIONS_PER_VERTEX = 2;
    ns.LineRenderer.FLOATS_PER_OFFSET    = 1;
    ns.LineRenderer.OFFSETS_PER_VERTEX   = 2;
    /** Each vertex has base, the tip, and the offsets. */
    ns.LineRenderer.FLOATS_PER_VERTEX    = ns.LineRenderer.LOCATIONS_PER_VERTEX*ns.LineRenderer.FLOATS_PER_LOCATION
                                           + ns.LineRenderer.OFFSETS_PER_VERTEX*ns.LineRenderer.FLOATS_PER_OFFSET;
    ns.LineRenderer.VERTICES_PER_SEGMENT = 4;
    ns.LineRenderer.FLOATS_PER_SEGMENT   = ns.LineRenderer.VERTICES_PER_SEGMENT*(ns.LineRenderer.FLOATS_PER_VERTEX);

    ns.LineRenderer.VERTICES_PER_ARROW   = 8;

}(window.vizit.vectorfield));
