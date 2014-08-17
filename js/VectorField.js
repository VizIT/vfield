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
 * Compute a displayable vector field from a vector valued function f.
 * Generates sets of vectors along field lines for the vector field f
 * with one field line starting at each of the start points.
 *
 * @param f           A vector valued function. Must implement a getField(x,y,z)
 *                    method.
 * @param startPoints A set of start points (x,y,z,sgn) from which field lines are traced.
 * @param maxVectors  The maximum number of arrows to draw. Each arrow requires
 *                    6 verticies and 10 indices. Or 6*3 + 10 = 28 floating point
 *                    numbers.
 * @param arrowSize   Scales the length of the lines that make up the arrow head.
 * @param arrowScale  Scales how far the arrow heads fan out from the arrow shaft.
 * @param scale       Scale factor between the electric field and physical coordinates.
 */
function VectorFieldGenerator(f_, startPoints_, maxVectors_, arrowSize_, arrowScale_, scale_)
{
  /** A scale factor for how fast the arrowhead spreads out as E grows. */
  var arrowScale;
  /** Lines that make up the arrow head are drawn with this length. */
  var arrowSize;
  // Each point represents a distance ds along the field line traced
  // to generate the vectors
  var ds;
  var f;
  var maxVectors;
  var nvectors;
  /** Scale factor between the electric field and physical coordinates. */
  var scale;
  var startPoints;

  this.setMaxVectors = function(maxVectors_)
  {
    maxVectors = maxVectors_;
    return this;
  }

  this.getMaxVectors = function()
  {
    return maxVectors;
  }

  this.setArrowSize    = function(size)
  {
    arrowSize = size;
    return this;
  }

  this.getArrowSize    = function()
  {
    return arrowSize;
  }

  this.setVectorSpacing = function(spacing)
  {
    vectorSpacing = spacing;
    return this;
  }

  this.getVectorSpacing = function()
  {
    return vectorSpacing;
  }

  this.setDs           = function(ds_)
  {
    ds = ds_;
    return this;
  }

  this.getDs           = function()
  {
    return ds;
  }

  /*
   * Generate a vector with four lines as an arrow head along the field line
   * indicating the direction of the vector field.
   *
   * @param x0, y0, z0 The location at which the field is evaluated,
   *                   also the base of the vector.
   *
   * @param field      The x, y, z components of the vector field at x0, y0, z0.
   *
   * @param f          The magnatude of the field at this point.
   * 
   * @param arrowSize  A scale factor for the arrow head.
   */
  this.generateVector      = function(x0, y0, z0, field, f, arrowSize, arrowScale, narrows, scale, indexedVertices)
  {
    /** The component of the arrow head along the vector. */
    var asx, asy, asz;
    /** Index into the indices array */
    var indexIndex;
    /** The index of the tip of the vector. This is a point on all the lines. */
    var nexusIndex;
    // Two vectors normal to the vector field and normal to each other
    // Used to build the head of the vector.
    var n2x, n2y, n2z;
    var nx,  ny, nz;
    var resize;
    /** Index into the vertices array. */
    var vertexIndex;
    var x1, y1, z1;
    var x2, y2, z2;
    var x3, y3, z3;
    var x4, y4, z4;
    var x5, y5, z5;

    x1         = x0 + field[0]*scale;
    y1         = y0 + field[1]*scale;
    z1         = z0 + field[2]*scale;

    if (field[2] != 0)
    {
      // Start with nx, ny = 1, then E dot n = 0 gives
      nx     = 1;
      ny     = 1;
      nz     = -(field[0]+field[1])/field[2];
    }
    else if (field[1] != 0)
    {
      // Start with nx, nz = 1, then E dot n = 0 gives
      nx     = 1;
      ny     = -(field[0]+field[2])/field[1];
      nz     = 1;
    }
    else
    {
      // Start with ny, nz = 1, then E dot n = 0 gives
      nx     = -(field[1]+field[2])/field[0];
      ny     = 1;
      nz     = 1;
    }

    // Normalize and multipley by the arrow size
    resize = arrowScale*arrowSize*f*scale/Math.sqrt(nx*nx + ny*ny + nz*nz);

    nx     = nx*resize;
    ny     = ny*resize;
    nz     = nz*resize;

    asx    = arrowSize*field[0]*scale;
    asy    = arrowSize*field[1]*scale;
    asz    = arrowSize*field[2]*scale;

    n2x    = -2*asy*nz + 2*asz*ny;
    n2y    =  2*asx*nz - 2*asz*nx;
    n2z    = -2*asx*ny + 2*asy*nx;

    resize = arrowScale*arrowSize*f*scale/Math.sqrt(n2x*n2x + n2y*n2y + n2z*n2z);

    n2x    = n2x*resize;
    n2y    = n2y*resize;
    n2z    = n2z*resize;

    x2     = x1 - asx + nx;
    y2     = y1 - asy + ny;
    z2     = z1 - asz + nz;

    x3     = x1 - asx - nx;
    y3     = y1 - asy - ny;
    z3     = z1 - asz - nz;

    x4     = x1 - asx + n2x;
    y4     = y1 - asy + n2y;
    z4     = z1 - asz + n2z;

    x5     = x1 - asx - n2x;
    y5     = y1 - asy - n2y;
    z5     = z1 - asz - n2z;

    // The tip of the vector
    nexusIndex              = narrows*6+1;

    // NOTE this is in the innermost loop of an event handler - be careful of performance.
    // The base of the vector
    indexedVertices.pushVertex(x0);
    indexedVertices.pushVertex(y0);
    indexedVertices.pushVertex(z0);
    indexedVertices.pushIndex(narrows*6);
    // The head of the vector
    indexedVertices.pushVertex(x1);
    indexedVertices.pushVertex(y1);
    indexedVertices.pushVertex(z1);
    indexedVertices.pushIndex(nexusIndex);
    // Two pair of lines for the arrow head
    indexedVertices.pushVertex(x2);
    indexedVertices.pushVertex(y2);
    indexedVertices.pushVertex(z2);
    indexedVertices.pushIndex(narrows*6+2);
    indexedVertices.pushIndex(nexusIndex);
    indexedVertices.pushVertex(x3);
    indexedVertices.pushVertex(y3);
    indexedVertices.pushVertex(z3);
    indexedVertices.pushIndex(narrows*6+3);
    indexedVertices.pushIndex(nexusIndex);
    indexedVertices.pushVertex(x4);
    indexedVertices.pushVertex(y4);
    indexedVertices.pushVertex(z4);
    indexedVertices.pushIndex(narrows*6+4);
    indexedVertices.pushIndex(nexusIndex);
    indexedVertices.pushVertex(x5);
    indexedVertices.pushVertex(y5);
    indexedVertices.pushVertex(z5);
    indexedVertices.pushIndex(narrows*6+5);
    indexedVertices.pushIndex(nexusIndex);
  }

  /**
   * Trace a field line starting at the given x, y, z coordinates, generating
   * vectors along the field line.
   * Each step of length ds has components ((fx/f)*ds, (fy/f)*ds, (fz/f)*ds).
   * Vertices is usually a Float32Array of size 3*6*maxVectors.
   *
   * @param f             A vector valued function. Must implement a getField(x,y,z)
   *                      method.
   * @param x0, y0, z0    Start following the field line from these coordinates.
   * @param sign          Positive if we follow along the field direction, negative if
   *                      we run contrary to it.
   * @param maxVectors    The maximum number of arrows to draw. Each arrow requires
   *                      6 verticies and 10 indices. Or 6*3 + 10 = 28 floating point
   *                      numbers.
   * @param priorVectors  The number of vectors generated on prior passes through trace.
   *
   * @param {float} scale Scale factor between the electric field and physical coordinates.
   *
   * @param {IndexedVertices} An object holding a vertex list and index list.
   */
  this.trace = function(f, x0, y0, z0, sign, maxVectors, priorVectors, scale, indexedVertices)
  {
    // The distance traversed along the field line.
    var S;
    var fMagnitude;
    var field;
    var i;
    // Location along the field line where we will draw the next vector.
    var nextVector;
    var nvectors;
    // The vector function thinks we are at a sink and should stop tracing a field line.
    var shouldStop;
    var x, y, z;

    S          = 0;
    nextVector = 0;
    nvectors   = 0;
    x          = x0;
    y          = y0;
    z          = z0;
    shouldStop = false;

    while (nvectors < maxVectors && !shouldStop)
    {
      field            = f.getField(x, y, z);
      fMagnitude       = Math.sqrt(field[0] * field[0] + field[1] * field[1] + field[2] * field[2]);
      if (fMagnitude == 0)
      {
        // No field here - no possible field line
        break;
      }

      if (S >= nextVector)
      {
        this.generateVector(x, y, z, field, fMagnitude, arrowSize, arrowScale, priorVectors + nvectors, scale, indexedVertices);
        nextVector = S + Math.max(fMagnitude * 1.2 * scale, 1);
        nvectors++;
      }

      x += sign * field[0]/fMagnitude * ds;
      y += sign * field[1]/fMagnitude * ds;
      z += sign * field[2]/fMagnitude * ds;
      S += ds;
      shouldStop = f.shouldStop(sign, x, y, z);
      
      // console.log("S: " + S + " Next: " + nextVector + " fx: " + field[0] + " fy: " + field[1] + " fz: " + field[2] + " stop: " + shouldStop);
    }
    return nvectors;
  }

  this.generateField = function()
  {
    var i;
    var indexedVertices;
    var nstartPoints;
    var startPoint;

    nstartPoints = startPoints.length;
    nvectors     = 0;

    indexedVertices = new IndexedVertices(6*maxVectors*nstartPoints, 10*maxVectors*nstartPoints);

    for(i=0; i<nstartPoints; i++)
    {
      startPoint    = startPoints[i];
      startPoint[4] = nvectors;
      // Compute the vectors from this field line, and load them into indexedVertices
      nvectors += this.trace(f, startPoint[0], startPoint[1], startPoint[2], startPoint[3], maxVectors, nvectors, scale, indexedVertices);
    }

    return indexedVertices;
  }

  arrowScale  = arrowScale_;
  arrowSize   = arrowSize_;
  ds          = .33;
  f           = f_;
  maxVectors  = maxVectors_;
  scale       = scale_;
  startPoints = startPoints_;
}



