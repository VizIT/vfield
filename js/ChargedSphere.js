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
 * A potentially hollow Charged sphere centered at (x,y,z) with
 * inner radius a and outer radius b. a may be zero indicating
 * a solid sphere.
 *
 * @constructor	
 * @param {number} Q_                The total charge contained in this distribution.
 * @param {number} fieldLineDensity_ The density of field lines in lines per unit charge.
 * @param {number} x_                The x coordinate of the center of the sphere.
 * @param {number} y_                The y coordinate of the center of the sphere.
 * @param {number} z_                The z coordinate of the center of the sphere.
 * @param {number} a_                The inner radius of the distribution. 0 for a solid sphere.
 * @param {number} b_                The outer radius of the distribution.
 */
function ChargedSphere(Q_, fieldLineDensity_, x_, y_, z_, a_, b_)
{
  var a;
  var a2;
  var a3;
  var b;
  var b3;
  var modelViewMatrix;
  var nindices;
  var pi;
  var Q;
  var fieldLineDensity;
  var vertexRegistry;
  var x0;
  var y0;
  var z0;

  nindices  = 0;
  pi        = 3.14159265359;

  a      = a_;
  a2     = a*a;
  a3     = a2*a;
  b      = b_;
  b3     = b*b*b;
  Q      = Q_;
  fieldLineDensity    = fieldLineDensity_;
  x0     = x_;
  y0     = y_;
  z0     = z_;

  this.setA               = function(a_)
  {
    a      = a_;
    a2     = a*a;
    a3     = a2*a;
  }

  this.getA               = function()
  {
    return a;
  }

  this.setB               = function(b_)
  {
    b      = b_;
    b3     = b*b*b;
  }

  this.getB               = function()
  {
    return b;
  }

  this.setNindices        = function(n)
  {
    nindices = n;
  }

  this.setVertexRegistry   = function(registry)
  {
    vertexRegistry = registry;
  }

  this.getVertexRegistry   = function()
  {
    return vertexRegistry;
  }

  /**
   * Compute the start points for field lines due to the presence of this charge.
   * 
   * TODO: make the start point distribution vary with r as the charge.
   * TODO: use a better distribution - this spiral is not so good to illustrate physics.
   */
  this.getStartPoints = function()
  {
    var nlines;
    var phi;
    var r;
    var s;
    var seedPoints;
    var sgn;
    var y;

    sgn        = Q > 0.0 ? 1.0 : Q < 0.0 ? -1.0 : 0.0;
    nlines     = Math.round(fieldLineDensity * Q * sgn);
    s          = 3.6 / Math.sqrt(nlines);
    phi        = 0; // Or inject variablility with: Math.random() * Math.PI / 2;
    radius     = a + 0.2*(b-a);
    seedPoints = new Array();

    for (var i=1; i<nlines; i++)
    {
      y   = -1.0 + 2.0 * i / (nlines);
      r   = Math.sqrt(1.0 - y*y);
      phi = phi + s / r;
      seedPoints.push(new Array(Math.cos(phi)*r*radius + x0,
                                y*radius               + y0,
                                Math.sin(phi)*r*radius + z0,
                                sgn));
    }

    return seedPoints;
  }

  /**
   * Compute the electric field at any point (x,y,x) due to this
   * charge distribution.
   */
  this.getField           = function(x, y, z)
  {
      var deltaX;
      var deltaY;
      var deltaZ;

      // Magnitude of the field vector
      var f;
      // The field vector
      var field   = new Array(0, 0, 0);
      var r;
      var r2;

      deltaX      = x - x0;
      deltaY      = y - y0;
      deltaZ      = z - z0;

      r2          = deltaX*deltaX + deltaY*deltaY + deltaZ*deltaZ;
      if (r2 <= a2)
      {
        return field;
      }
      r           = Math.sqrt(r2);
      if (r >=a && r<b)
      {
        // We are in the interior of the charge distribution.
        f         = Q * (r-(a3/r2))/(b3-a3); // = (4*pi/3)*(r-(a3/r2)) * chargeDensity;
      }
      else
      {
        // Outside the charge distribution the field is as a point charge
        f         = Q/r2; // = (4*pi/3)*(b3-a3) * chargeDensity /r2;
      }

      // Similar triangles allows easy distribution of the field into vector components.
      field[0]    = f * deltaX / r;
      field[1]    = f * deltaY / r;
      field[2]    = f * deltaZ / r;

      return field;
  }

  this.getModelView       = function(scale)
  {
    if (typeof scale === "undefined")
    {
      scale = 1.0;
    }
    if (modelViewMatrix == null)
    {
      modelViewMatrix     = new Float32Array(16);
      modelViewMatrix[0]  = scale;
      modelViewMatrix[1]  = 0.0;
      modelViewMatrix[2]  = 0.0;
      modelViewMatrix[3]  = 0.0;
      modelViewMatrix[4]  = 0.0;
      modelViewMatrix[5]  = scale;
      modelViewMatrix[6]  = 0.0;
      modelViewMatrix[7]  = 0.0;
      modelViewMatrix[8]  = 0.0;
      modelViewMatrix[9]  = 0.0;
      modelViewMatrix[10] = scale;
      modelViewMatrix[11] = 0.0;
      modelViewMatrix[12] = x0;
      modelViewMatrix[13] = y0;
      modelViewMatrix[14] = z0;
      modelViewMatrix[15] = 1.0;
    }
    else
    {
      modelViewMatrix[0]  = scale;
      modelViewMatrix[5]  = scale;
      modelViewMatrix[10] = scale;
    }
    return modelViewMatrix;
  }

  this.drawFullSurface      = function(glUtility,           surfaceProgram,       surfaceGeometryBuffer,
                                       surfaceNormalBuffer, surfaceIndicesBuffer, nindices)
  {
    var gl;

    gl = glUtility.getGLContext();
    glUtility.bindBuffer(surfaceGeometryBuffer, surfaceProgram.getPositionHandle(), 3, gl.FLOAT, 0, 0);
    glUtility.bindBuffer(surfaceNormalBuffer,   surfaceProgram.getNormalHandle(),   3, gl.FLOAT, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, surfaceIndicesBuffer);

    gl.drawElements(gl.TRIANGLES, nindices, gl.UNSIGNED_SHORT, 0);
  }

  this.render             = function(glUtility, surfaceProgram)
  {
    var intrinsicRadius;
    var gl;
    var r;
    var scale;
    var vertices;

    gl              = glUtility.getGLContext();

    // This is the actual sized used in the default spherical geometry.
    intrinsicRadius = this.getIntrinsicRadius();
    vertices        = this.getVertexBuffers(glUtility);

    // RGBA positive (blue) or negative (red) charge
    if (Q > 0)
    {
      gl.uniform4f(surfaceProgram.getSurfaceColorHandle(), 0.05, 0.05, 0.80, 0.20);
    }
    else if (Q < 0)
    {
      gl.uniform4f(surfaceProgram.getSurfaceColorHandle(), 0.80, 0.05, 0.05, 0.20);
    }
    else
    {
      gl.uniform4f(surfaceProgram.getSurfaceColorHandle(), 0.50, 0.50, 0.50, 0.20);
    }

    nindices = this.getNindices();

    gl.cullFace(gl.FRONT);
    for (r=b; r>=a; r--)
    {
      scale =r/intrinsicRadius;
      gl.uniformMatrix4fv(surfaceProgram.getModelViewMatrixHandle(), false, this.getModelView(scale));
      this.drawFullSurface(glUtility,        surfaceProgram,   vertices.vertices,
                           vertices.normals, vertices.indices, nindices);
    }
    
    gl.cullFace(gl.BACK);
    for(r=a; r<=b; r++)
    {
      scale =r/intrinsicRadius;
      this.drawFullSurface(glUtility,        surfaceProgram,   vertices.vertices,
                           vertices.normals, vertices.indices, nindices);
      gl.uniformMatrix4fv(surfaceProgram.getModelViewMatrixHandle(), false, this.getModelView(scale));
    }
    
  }
}

/**
 * ChargedSphere extends the GeometryEngine.Sphere class.
 */
ChargedSphere.prototype = new GeometryEngine.Sphere();

