/*
 * Copyright 2013 VizIT Solutions
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
 * General wrapper around the WebGLRenderingContext to include a number
 * of common functions.
 *
 * @param {HTMLCanvasElement} drawingSurface_ An HTML canvas into which we will render. 
 *
 * @constructor
 */
function GLUtility(drawingSurface_)
{
  var drawingSurface;
  /** {WebGLRenderingContext} The WebGL rendering context. */
  var gl;

  /**
   * Get a 3d context, webgl or experimental-webgl. The context presents a
   * javascript API that is used to draw into it. The webgl context API is
   * very similar to OpenGL for Embedded Systems, or OpenGL ES.
   */
  this.getGLContext      = function()
  {

    // Only fetch a gl context if we haven't already
    if(!gl)
    {
      // The antialiased true option gives smoother lines, sometimes.
      gl             = drawingSurface.getContext("webgl",{antialias: true})
                       || drawingSurface.getContext('experimental-webgl',{antialias: true});
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
  }

  this.clearColor        = function(r, g, b, a)
  {
    gl.clearColor(r, g, b, a);
  }

  this.clear             = function()
  {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /**
   * Create and compile a vertex or fragment shader as given by the shader type.
   */
  this.compileShader     = function (shaderSource, shaderType)
  {
      var shader = gl.createShader(shaderType);
      gl.shaderSource(shader, shaderSource);
      gl.compileShader(shader);

      var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!success)
      {
          throw "Shader compile failed with:" + gl.getShaderInfoLog(shader);
      }

      return shader;
  }


  /**
   * Create a program from the shader sources
   */
  this.createProgram     = function(vertexShaderSource, fragmentShaderSource)
  {
      var fragmentShader;
      var program;
      var vertexShader;

      program        = gl.createProgram();

      // This will compile the shader into code for your specific graphics card.
      vertexShader   = this.compileShader(vertexShaderSource, gl.VERTEX_SHADER);
      fragmentShader = this.compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

      // The program consists of our shaders
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);

      // Create a runnable program for our graphics hardware.
      // Allocates and assigns memory for attributes and uniforms (explained later)
      // Shaders are checked for consistency.
      gl.linkProgram(program);

      return program;
  }


  /**
   * Generate a buffer from a Float32Array
   */
  this.createBuffer      = function(floatArray)
  {
      // This is a handle to what will be a buffer
      var vertexBuffer = gl.createBuffer();
      // Binding an object in Open GL creates it, and makes it the target of subsequent manipulations.
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      // loads the current buffer, the vertexBuffer found above, with the vertex data.
      // The gl bufer is strongly typed with 32 bit floating point data.
      gl.bufferData(gl.ARRAY_BUFFER, floatArray, gl.STATIC_DRAW);

      return vertexBuffer;
  }

  /**
   * Generate a buffer for a vertex array index from a Uint16Array
   */
  this.createIndexBuffer = function(UintArray)
  {
      // This is a handle to what will be a buffer
      var indexBuffer = gl.createBuffer();
      // Binding an object in Open GL creates it, and makes it the target of subsequent manipulations.
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      // loads the current buffer, the vertexBuffer found above, with the vertex data.
      // The gl bufer is strongly types with 16 bit integer data.
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, UintArray, gl.STATIC_DRAW);

      return indexBuffer;
  }

  /**
   * Lookup a shader attribute location by name on the given program.
   *
   * @param {WebGLProgram} program   The WebGL program, compiled shaders, containing the attribute.
   *
   * @param {String}       name      The name of the attribute in the given program.
   *
   * @returns WebGLHandlesContextLoss The handle for the named attribute.
   */
  this.getAttribLocation = function(program, name)
  {
    var attributeLocation;

    attributeLocation    = gl.getAttribLocation(program, name);
    if(attributeLocation == -1)
    {
      alert('Can not find uniform' + attribute + '.');
    }

    return attributeLocation;
  }

  /**
   * Bind a buffer to a vertex shader attribute,
   *
   * @param vertexBuffer {WebGLBuffer}             A buffer containing data to be applied to the attribute.
   * @param attribute    {WebGLHandlesContextLoss} A handle to the attribute in the given program.
   * @param program      {WebGLProgram}            The WebGL program that will consume the data.
   * @param size         {Integer}                 There are size elements from the buffer in each attribute.
   * @param type         {GLenum (DataType)}       The type of each element in the buffer.
   * @param stride       {Integer}                 There are stride bytes separating the beginning of each element.
   *                                               Note that zero stride indicates also indicates values are adjacent.
   * @param offset       {integer}                 Data begins offset bytes into the array.
   */
  this.bindBuffer        = function(vertexBuffer, attribute, program, size, type, stride, offset)
  {
      // Binding an object in Open GL makes it the target of subsequent operations.
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

      // enable that attribute (location) to receive data from an array
      // The vertexBuffer, defined above, is used because it is the currently bound buffer.
      gl.enableVertexAttribArray(attribute);

      // Each element in the vector contains 3 floating point entries, they should not be normalized,
      // there are no array entries between attribute values, and the first element is at position
      //  0 in the array.
      gl.vertexAttribPointer(attribute, size, type, false, stride, offset);
  }

  /**
   * Load an image from the givern source. Once the image is loaded, generate a texture.
   * textureIndex is the index of the texture, we user gl.TEXTURE0 + textureIndex as the
   * currently active texture to bind.
   */
  this.loadTexture       = function(src, textureIndex, callback)
  {
      var texture  = gl.createTexture();
      var image    = new Image();
      image.onload = function()
                     {
                       this.onTextureLoaded(image, texture, textureIndex, callback);
                     }.bind(this);
      image.src    = src;
      return texture;
  }

  /**
   * Once the image is loaded bind it to a texture and set options
   */
  this.onTextureLoaded   =  function(image, texture, textureIndex, callback)
  {
      gl.activeTexture(gl.TEXTURE0 + textureIndex);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
      gl.generateMipmap(gl.TEXTURE_2D);
      callback();
  }

  /**
   * Bind a texture to a sampler
   */
  this.bindTexture       = function(program, texture, textureIndex, uniformSampler)
  {
      gl.activeTexture(gl.TEXTURE0+textureIndex);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uniformSampler, textureIndex);
  }

  this.generateModelViewMatrix = function (t)
  {
      return new Float32Array([1, 0, 0, 0,
                               0, 1, 0, 0,
                               0, 0, 1, 0,
                               t, 0, 0, 1]);
  }

  this.generatePerspectiveMatrix = function(x_scale, y_scale, z_near, z_far)
  {
    return new   Float32Array([z_near/x_scale,      0.0,                         0.0,                             0.0,
                               0.0,       z_near/y_scale,                  0.0,                             0.0,
                               0.0,             0.0,         -(z_far+z_near)/(z_far-z_near),               -1.0,
                               0.0,             0.0,         -2*z_far*z_near/(z_far-z_near),                0.0]);
  }

  this.generateOrthographicMatrix = function(x_scale, y_scale, z_near, z_far)
  {
    return new   Float32Array([1/x_scale,       0.0,                     0.0,                       0.0,
                               0.0,          1/y_scale,                  0.0,                       0.0,
                               0.0,             0.0,               -2/(z_far-z_near),               0.0,
                               0.0,             0.0,          -(z_far+z_near)/(z_far-z_near),       1.0]);
  }


  /**
   * Lookup a shader uniform location by name on the given program.
   *
   * @param {WebGLProgram} program   The WebGL program, compiled shaders, containing the attribute.
   *
   * @param {String}       uniform   The name of the uniform in the given program.
   *
   * @returns WebGLHandlesContextLoss
   */
  this.getUniformLocation    = function(program, name)
  {
    var reference;

    reference = gl.getUniformLocation(program, name);
    if(reference == -1)
    {
      alert('Can not find uniform' + name + '.');
    }
    return reference;
  }

  /**
   * Lookup a uniform by name and load three floating point variables.
   * @deprecated Cache the uniform handle, and invoke gl.uniform3f directly.
   */
  this.loadUniform3f = function(gl, program, uniform, x, y, z)
  {
    var reference = gl.getUniformLocation(program, uniform);
    if(reference == -1)
    {
      alert('Can not find uniform' + uniform + '.');
      return;
    }
    gl.uniform3f(reference, x, y, z);
  }

  /**
   * Lookup a uniform by name and load four floating point variables.
   * @deprecated Cache the uniform handle, and invoke gl.uniform4f directly.
   */
  this.loadUniform4f = function(program, uniform, r, b, g, a)
  {
    var reference = gl.getUniformLocation(program, uniform);
    if(reference == -1)
    {
      alert('Can not find uniform' + uniform + '.');
      return;
    }
    gl.uniform4f(reference, r, b, g, a);
  }

  /**
   * Lookup a uniform by name and load a 3x3 floating point matrix.
   * @deprecated Cache the uniform handle, and invoke gl.uniformMatrix3fv directly.
   */
  this.loadUniformMatrix3fv = function (program, uniform, matrix)
  {
    var reference = gl.getUniformLocation(program, uniform);
    if(reference == -1)
    {
        alert('Can not find uniform' + uniform + '.');
        return;
    }

    // Load the matrix into the shader
    gl.uniformMatrix3fv(reference, false, matrix);
  }

  /**
   * Lookup a uniform by name and load a 4x4 floating point matrix.
   * @deprecated Cache the uniform handle, and invoke gl.uniformMatrix4fv directly.
   */
  this.loadUniformMatrix4fv = function (program, uniform, matrix)
  {
    var reference = gl.getUniformLocation(program, uniform);
    if(reference == -1)
    {
      alert('Can not find uniform' + uniform + '.');
      return;
    }

    // Load the matrix into the shader
    gl.uniformMatrix4fv(reference, false, matrix);
  }

  /**
   * Generate a matrix for a rotation about the X axis by phi
   * and about the Y axis by theta.
   * For OpenGL the matrix is in column major order.
   */
  this.getXYRotationMatrix = function (phi, theta)
  {
      var cosPhi   = Math.cos(phi);
      var cosTheta = Math.cos(theta);
      var sinPhi   = Math.sin(phi);
      var sinTheta = Math.sin(theta);

      var matrix   = new Array( cosTheta,       sinPhi*sinTheta   -cosPhi*sinTheta,   0,
                                   0,                cosPhi,            sinPhi,        0,
                                sinTheta,      -cosTheta*sinPhi,   cosPhi*cosTheta,   0,
                                   0,                  0,                0,           1);
  }

  /**
   * Take an existing transformation matrix, and apply an additional rotation
   * about the X axis by phi and about the Y axis by theta. This should be
   * especially fast if M is a Float32Array.
   */
  this.rotateBy= function (M, phi, theta)
  {
      // Hold current matrix values while we manipulate them.
      var h1, h2, h3;
      var cp   = Math.cos(phi);
      var ct   = Math.cos(theta);
      var sp   = Math.sin(phi);
      var st   = Math.sin(theta);
      var spst = sp*st;
      var ctsp = ct*sp;
      var cpst = cp*st;
      var cpct = cp*ct;

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
  }

  /*
   * Extract the upper 3x3 rectangular rotation matrix from a 4x4 homogeneous
   * transformation matrix. Both mat4 and mat3 are expected to be column major
   * Float32 arrays as used to represent WebGL matrices.
   */
 this.extractRotationPart = function(mat4, mat3)
 {
     // The first three elements of the mat3 are the same as the mat4
     mat3.set(mat4.subarray(0,3));
     mat3.set(mat4.subarray(4,7),  3);
     mat3.set(mat4.subarray(8,11), 6);

     return mat3;
 }

 drawingSurface = drawingSurface_;
 gl             = this.getGLContext();
}
