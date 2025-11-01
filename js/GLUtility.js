/*
 * Copyright 2013-2023 Vizit Solutions
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

window.vizit         = window.vizit         || {};
window.vizit.utility = window.vizit.utility || {};

(ns => {
  /**
   * General wrapper around the WebGLRenderingContext to include a number
   * of common functions.
   *
   * @param {HTMLCanvasElement} drawingSurface_ An HTML canvas into which we will render.
   *
   * @constructor
   */
  ns.GLUtility = function (drawingSurface_)
  {
    let drawingSurface;
    /** {WebGLRenderingContext} The WebGL rendering context. */
    let gl;

    /**
     * Get a 3d context, webgl or experimental-webgl. The context presents a
     * javascript API that is used to draw into it. The webgl context API is
     * very similar to OpenGL for Embedded Systems, or OpenGL ES.
     */
    this.getGLContext      = () => {

      // Only fetch a gl context if we haven't already
      if(!gl)
      {
        // The antialiased true option gives smoother lines, sometimes.
        gl             = drawingSurface.getContext("webgl",{antialias: true});
        if (gl)
        {
          // Enable depth testing
          gl.enable(gl.DEPTH_TEST);
          // Draw a pixel if its depth less than the current one.
          // Less depth means closer to the view point. This value
          // keeps field lines from being drawn over the charges.
          gl.depthFunc(gl.LESS);
        }
      }

      return gl;
    };

    this.clearColor        = (r, g, b, a) => {
      gl.clearColor(r, g, b, a);
    };

    this.clear             = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
    };

    /**
     * Create and compile a vertex or fragment shader as given by the shader type.
     */
    this.compileShader     = (shaderSource, shaderType) => {
      const shader = gl.createShader(shaderType);
      gl.shaderSource(shader, shaderSource);
      gl.compileShader(shader);

      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!success)
      {
        throw `Shader compile failed with:${gl.getShaderInfoLog(shader)}`;
      }

      return shader;
    };


    /**
     * Create a program from the shader sources
     *
     * @param {string} vertexShaderSource GLSL source for the vertex shader
     * @param {string} fragmentShaderSource GLSL source for the fragment shader
     * @param {string[]} [feedbackVaryings] Optional list of varyings to be captured - must be paired with a webgl2 context
     *
     * @returns {WebGLProgram} The compiled webgl program
     */
    this.createProgram     = function (vertexShaderSource, fragmentShaderSource, feedbackVaryings)
    {
      const program        = gl.createProgram();

      // This will compile the shader into code for your specific graphics card.
      const vertexShader   = this.compileShader(vertexShaderSource, gl.VERTEX_SHADER);
      const fragmentShader = this.compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

      // The program consists of our shaders
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);

      if (feedbackVaryings)
      {
        gl.transformFeedbackVaryings(program, feedbackVaryings, gl.SEPARATE_ATTRIBS);
      }

      // Create a runnable program for our graphics hardware.
      // Allocates and assigns memory for attributes and uniforms (explained later)
      // Shaders are checked for consistency.
      gl.linkProgram(program);

      return program;
    };

    /**
     * Load data into an existing buffer - for animation
     */
    this.loadData         = (vertexBuffer, floatArray) => {
      // Binding an object in Open GL creates it, and makes it the target of subsequent manipulations.
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      // loads the current buffer, the vertexBuffer found above, with the vertex data.
      // The gl bufer is strongly typed with 32 bit floating point data.
      gl.bufferData(gl.ARRAY_BUFFER, floatArray, gl.STATIC_DRAW);
    };

    /**
     * Generate a buffer from a Float32Array
     */
    this.createBuffer      = function (floatArray)
    {
      // This is a handle to what will be a buffer
      const vertexBuffer = gl.createBuffer();
      this.loadData(vertexBuffer, floatArray);
      return vertexBuffer;
    };

    /**
     * Load data into a a buffer for drawing
     * @param {WebGLBuffer} indexBuffer A buffer to bind and load with data.
     * @param {Uint16Array} indices Data copied into the indexBuffer
     * @see @link{https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL|Creating 3D objects using WebGL}
     */
    this.loadIndices = (indexBuffer, indices) => {
      // Binding an object in Open GL creates it, and makes it the target of subsequent manipulations.
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      // loads the current buffer, the indexBuffer above, with the index data.
      // The gl buffer is strongly typed with 16 bit integer data.
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    /**
     * Generate a buffer for a vertex array index from a Uint16Array
     * @param {Uint16Array} indices The indices of entries into the data buffer
     */
    this.createIndexBuffer = function (indices)
    {
      // This is a handle to what will be a buffer
      const indexBuffer = gl.createBuffer();
      this.loadIndices(indexBuffer, indices);
      return indexBuffer;
    };

    /**
     * Lookup a shader attribute location by name on the given program.
     *
     * @param {WebGLProgram} program   The WebGL program, compiled shaders, containing the attribute.
     *
     * @param {String}       name      The name of the attribute in the given program.
     *
     * @returns WebGLHandlesContextLoss The handle for the named attribute.
     */
    this.getAttribLocation = (program, name) => {
      let attributeLocation;

      attributeLocation    = gl.getAttribLocation(program, name);
      if(attributeLocation === -1)
      {
        alert(`Can not find attribute ${name}.`);
      }

      return attributeLocation;
    };

    /**
     * Bind a buffer to a vertex shader attribute,
     *
     * @param vertexBuffer {WebGLBuffer}       A buffer containing data to be applied to the attribute.
     * @param attribute    {GLuint}            A handle to the attribute in the given program.
     * @param program      {WebGLProgram}      The WebGL program that will consume the data.
     * @param size         {Integer}           There are size elements from the buffer in each attribute.
     * @param type         {GLenum (DataType)} The type of each element in the buffer.
     * @param stride       {Integer}           There are stride bytes separating the beginning of each element.
     *                                         Note that zero stride indicates also indicates values are adjacent.
     * @param offset       {integer}           Data begins offset bytes into the array.
     */
    this.bindBuffer        = (vertexBuffer, attribute, size, type, stride, offset) => {
      // Binding an object in Open GL makes it the target of subsequent operations.
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

      // enable that attribute (location) to receive data from an array
      // The vertexBuffer, defined above, is used because it is the currently bound buffer.
      gl.enableVertexAttribArray(attribute);

      // Each element in the vector contains 3 floating point entries, they should not be normalized,
      // there are no array entries between attribute values, and the first element is at position
      //  0 in the array.
      gl.vertexAttribPointer(attribute, size, type, false, stride, offset);
    };

    /**
     * Load an image from the givern source. Once the image is loaded, generate a texture.
     * textureIndex is the index of the texture, we user gl.TEXTURE0 + textureIndex as the
     * currently active texture to bind.
     */
    this.loadTexture       = function (src, textureIndex, callback)
    {
      const texture  = gl.createTexture();
      const image    = new Image();
      image.onload = () => {
        this.onTextureLoaded(image, texture, textureIndex, callback);
      };
      image.src    = src;

      return texture;
    };

    /**
     * Once the image is loaded bind it to a texture and set options
     */
    this.onTextureLoaded   =  (image, texture, textureIndex, callback) => {
      gl.activeTexture(gl.TEXTURE0 + textureIndex);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
      callback();
    };

    /**
     * Bind a texture to a sampler
     */
    this.bindTexture       = (program, texture, textureIndex, uniformSampler) => {
      gl.activeTexture(gl.TEXTURE0+textureIndex);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniformSampler, textureIndex);
    };

    this.generateModelViewMatrix = t => new Float32Array([1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      t, 0, 0, 1]);

    this.generatePerspectiveMatrix = (x_scale, y_scale, z_near, z_far) => new   Float32Array([z_near/x_scale,      0.0,                         0.0,                             0.0,
      0.0,       z_near/y_scale,                  0.0,                             0.0,
      0.0,             0.0,         -(z_far+z_near)/(z_far-z_near),               -1.0,
      0.0,             0.0,         -2*z_far*z_near/(z_far-z_near),                0.0]);

    this.generateOrthographicMatrix = (x_scale, y_scale, z_near, z_far) => new   Float32Array([1/x_scale,       0.0,                     0.0,                       0.0,
      0.0,          1/y_scale,                  0.0,                       0.0,
      0.0,             0.0,               -2/(z_far-z_near),               0.0,
      0.0,             0.0,          -(z_far+z_near)/(z_far-z_near),       1.0]);


    /**
     * Lookup a shader uniform location by name on the given program.
     *
     * @param {WebGLProgram} program   The WebGL program, compiled shaders, containing the attribute.
     *
     * @param {String}       uniform   The name of the uniform in the given program.
     *
     * @returns WebGLHandlesContextLoss
     */
    this.getUniformLocation    = (program, name) => {
      let reference;

      reference = gl.getUniformLocation(program, name);
      if(reference === -1)
      {
        alert(`Can not find uniform${name}.`);
      }
      return reference;
    };

    /**
     * Lookup a uniform by name and load three floating point variables.
     * @deprecated Cache the uniform handle, and invoke gl.uniform3f directly.
     */
    this.loadUniform3f = (gl, program, uniform, x, y, z) => {
      const reference = gl.getUniformLocation(program, uniform);
      if(reference === -1)
      {
        alert(`Can not find uniform${uniform}.`);
        return;
      }
      gl.uniform3f(reference, x, y, z);
    };

    /**
     * Lookup a uniform by name and load four floating point variables.
     * @deprecated Cache the uniform handle, and invoke gl.uniform4f directly.
     */
    this.loadUniform4f = (program, uniform, r, b, g, a) => {
      const reference = gl.getUniformLocation(program, uniform);
      if(reference === -1)
      {
        alert(`Can not find uniform${uniform}.`);
        return;
      }
      gl.uniform4f(reference, r, b, g, a);
    };

    /**
     * Lookup a uniform by name and load a 3x3 floating point matrix.
     * @deprecated Cache the uniform handle, and invoke gl.uniformMatrix3fv directly.
     */
    this.loadUniformMatrix3fv = (program, uniform, matrix) => {
      const reference = gl.getUniformLocation(program, uniform);
      if(reference === -1)
      {
        alert(`Can not find uniform${uniform}.`);
        return;
      }

      // Load the matrix into the shader
      gl.uniformMatrix3fv(reference, false, matrix);
    };

    /**
     * Lookup a uniform by name and load a 4x4 floating point matrix.
     * @deprecated Cache the uniform handle, and invoke gl.uniformMatrix4fv directly.
     */
    this.loadUniformMatrix4fv = (program, uniform, matrix) => {
      const reference = gl.getUniformLocation(program, uniform);
      if(reference === -1)
      {
        alert(`Can not find uniform${uniform}.`);
        return;
      }

      // Load the matrix into the shader
      gl.uniformMatrix4fv(reference, false, matrix);
    };

    /**
     * Generate a matrix for a rotation about the X axis by phi
     * and about the Y axis by theta.
     * For OpenGL the matrix is in column major order.
     */
    this.getXYRotationMatrix = (phi, theta) => {
      const cosPhi   = Math.cos(phi);
      const cosTheta = Math.cos(theta);
      const sinPhi   = Math.sin(phi);
      const sinTheta = Math.sin(theta);

      return new Array( cosTheta,       sinPhi*sinTheta   -cosPhi*sinTheta,   0,
          0,                cosPhi,            sinPhi,   0,
          sinTheta,      -cosTheta*sinPhi,   cosPhi*cosTheta,   0,
          0,                     0,                 0,   1);
    };

    /**
     * Take an existing transformation matrix, and apply an additional rotation
     * about the X axis by phi and about the Y axis by theta. This should be
     * especially fast if M is a Float32Array.
     */
    this.rotateBy= (M, phi, theta) => {
      // Hold current matrix values while we manipulate them.
      let h1, h2, h3;
      const cp   = Math.cos(phi);
      const ct   = Math.cos(theta);
      const sp   = Math.sin(phi);
      const st   = Math.sin(theta);
      const spst = sp*st;
      const ctsp = ct*sp;
      const cpst = cp*st;
      const cpct = cp*ct;

      h1    =  M[0];
      h2    =  M[1];
      h3    =  M[2];
      M[0]  =  h1*ct   + h3*st;
      M[1]  =  h1*spst + h2*cp - h3*ctsp;
      M[2]  = -h1*cpst + h2*sp + h3*cpct;
      //M[3] = M[3];

      h1    =  M[4];
      h2    =  M[5];
      h3    =  M[6];
      M[4]  =  h1*ct   + h3*st;
      M[5]  =  h1*spst + h2*cp - h3*ctsp;
      M[6]  = -h1*cpst + h2*sp + h3*cpct;
      // M[7]  = M[7];

      h1    =  M[8];
      h2    =  M[9];
      h3    =  M[10];
      M[8]  =  h1*ct   + h3*st;
      M[9]  =  h1*spst + h2*cp - h3*ctsp;
      M[10] = -h1*cpst + h2*sp + h3*cpct;
      //M[11] = M[11];

      h1    =  M[12];
      h2    =  M[13];
      h3    =  M[14];
      M[12] =  h1*ct   + h3*st;
      M[13] =  h1*spst + h2*cp - h3*ctsp;
      M[14] = -h1*cpst + h2*sp + h3*cpct;
      // M[15] = M[15];
    };

    /*
     * Extract the upper 3x3 rectangular rotation matrix from a 4x4 homogeneous
     * transformation matrix. Both mat4 and mat3 are expected to be column major
     * Float32 arrays as used to represent WebGL matrices.
     */
    this.extractRotationPart = (mat4, mat3) => {
      // The first three elements of the mat3 are the same as the mat4
      mat3.set(mat4.subarray(0,3));
      mat3.set(mat4.subarray(4,7),  3);
      mat3.set(mat4.subarray(8,11), 6);

      return mat3;
    };

    drawingSurface = drawingSurface_;
    gl             = this.getGLContext();
  };
})(window.vizit.utility);
