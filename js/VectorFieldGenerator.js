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

window.vizit             = window.vizit             || {};
window.vizit.vectorfield = window.vizit.vectorfield || {};

(function (ns)
 {
   /**
    * Compute a displayable vector field from a vector valued function f.
    * Generates sets of vectors along field lines for the vector field f
    * with one field line starting at each of the start points.
    *
    * @param {VectorFunction} f_      A vector valued function. Must implement an
    *                                 [fx, fy, fz] = getField(x,y,z) method.
    */
   ns.VectorFieldGenerator = function (f_)
   {
     let nvectors;

     /**
      * Set or replace the function generating the vectors we render.
      *
      * @param {VectorFunction} f_      A vector valued function. Must implement an
      *                                 [fx, fy, fz] = getField(x,y,z) method.
      * @returns {vizit.vectorfield.VectorFieldGenerator}
      */
     this.setVectorFunction = function(f_)
     {
       f = f_;
       f.setModified(true)
       return this;
     }

     this.getVectorFunction = function()
     {
       return f;
     }


     /**
      * @param startPoints A set of start points (x,y,z,sgn) from which field lines are traced.
      *
      * @returns {vizit.vectorfield.VectorFieldGenerator}
      */
     this.setStartPoints = function (points)
     {
       startPoints = points;
       return this;
     };

     this.addStartPoints = function (points)
     {
       startPoints.push(...points);
       return this;
     }

     this.getStartPoints = function ()
     {
       return startPoints;
     };

     /**
      * * @param {number} max   The maximum number of arrows to draw. Each arrow requires
      *                         8 vertices and 12 indices. Or 8*(2*3+2) + 12 = 76 floating
      *                         point numbers.
      *
      * @returns {vizit.vectorfield.VectorFieldGenerator}
      */
     this.setMaxVectors = function (max)
     {
       maxVectors = max;
       return this;
     };

     this.getMaxVectors = function ()
     {
       return maxVectors;
     };

     /**
      * Set the width of the arrow shaft.
      *
      * @param {number} width The width of the arrow shaft in pixels.
      *
      * @returns {vizit.vectorfield.VectorFieldGenerator}
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

     /**
      * Set the scale for the vectors as drawn to the screen.
      *
      * @param {number} size      Scale factor between the electric field and physical coordinates.
      *
      * @returns {vizit.vectorfield.VectorFieldGenerator}
      */
     this.setArrowSize = function (size)
     {
       arrowSize = size;
       return this;
     };

     this.getArrowSize = function ()
     {
       return arrowSize;
     };

     /**
      * @param {number} size  Base to tip size of the arrowhead in pixels.
      *
      * @returns {vizit.vectorfield.VectorFieldGenerator}
      */
     this.setArrowHeadSize = function (size)
     {
       arrowHeadSize = size;
       return this;
     };

     this.getArrowHeadSize = function ()
     {
       return arrowHeadSize;
     };

     /**
      * Set how far the arrow heads fan out from the arrow shaft.
      *
      * @param {number} width How far the arrow heads fan out from the arrow shaft in pixels.
      *
      * @returns {vizit.vectorfield.VectorFieldGenerator}
      */
     this.setArrowHeadWidth = function(width)
     {
       arrowHeadWidth = width;
       return this;
     }

     this.getArrowHeadWidth = function()
     {
       return arrowHeadWidth;
     }

     this.setVectorSpacing = function (spacing)
     {
       vectorSpacing = spacing;
       return this;
     };

     this.getVectorSpacing = function ()
     {
       return vectorSpacing;
     };

     this.setDs           = function (ds_)
     {
       ds = ds_;
       return this;
     };

     this.getDs           = function ()
     {
       return ds;
     };

     /**
      * Push the data for a vertex onto the Float32Array.
      *
      * @param {vizit.utility.IndexedVertices} indexedVertices The vertex data and the indices.
      * @param {Object} base           The x, y, and z coordinates of the base of the arrow.
      * @param {Object} tip            The x, y, and z coordinates of the tip of the arrow.
      * @param {number} normalOffset   The offset normal to the base-tip line for this vertex.
      * @param {number} parallelOffset The offset along the base-tip line for this vertex.
      */
     this.pushVertex = function(indexedVertices, base, tip, normalOffset, parallelOffset)
     {
       // The base of the arrow
       indexedVertices.push(base.x);
       indexedVertices.push(base.y);
       indexedVertices.push(base.z);

       // The tip of the arrow
       indexedVertices.push(tip.x);
       indexedVertices.push(tip.y);
       indexedVertices.push(tip.z);

       // Normal and parallel offsets control the positioning of this vertex relative to the base-tip line.
       indexedVertices.push(normalOffset);
       indexedVertices.push(parallelOffset);
     }

     /**
      * Generate a vector with four lines as an arrow head along the field line
      * indicating the direction of the vector field.
      *
      * @param {number}   x0           X coordinate where the field is evaluated, also the base of the vector.
      * @param {number}   y0           Y coordinate where the field is evaluated, also the base of the vector.
      * @param {number}   z0           Z coordinate where the field is evaluated, also the base of the vector.
      *
      * @param {number[]} field        The x, y, z components of the vector field at x0, y0, z0.
      *
      * @param {number} f              The magnitude of the field at this point.
      *
      * @param {number} lineWidth      The width of the arrow shaft in pixels.
      * 
      * @param {number} arrowHeadSize  A scale factor for the arrow head.
      * @param {number} arrowHeadWidth The barb to barb width of the arrow head.
      * @param {number} arrowSize      arrowSize*field strength is the base to tip length of the arrow.
      * @param {number} narrows        The number of arrows drawn so far.
      *
      * @param {vizit.utility.IndexedVertices} indexedVertices
      */
     this.generateVector      = function (x0, y0, z0,
                                          field, f, lineWidth,
                                          arrowHeadSize,arrowHeadWidth, arrowSize,
                                          narrows, indexedVertices)
     {
       const base = {};
       base.x = x0;
       base.y = y0;
       base.z = z0;

       const tip = {};
       tip.x = x0 + field[0]*arrowSize;
       tip.y = y0 + field[1]*arrowSize;
       tip.z = z0 + field[2]*arrowSize;

       // Arrow shaft vertices
       // Vertex 0
       this.pushVertex(indexedVertices, base, tip,  lineWidth, 0.0);
       // Vertex 1
       this.pushVertex(indexedVertices, base, tip, -lineWidth, 0.0);
       // Vertex 2 shifted ~arrowHeadSize back from the tip
       this.pushVertex(indexedVertices, tip,  base, -lineWidth, arrowHeadSize);
       // Vertex 3 shifted ~arrowHeadSize back from the tip
       this.pushVertex(indexedVertices, tip,  base,  lineWidth, arrowHeadSize);

       // Arrow head vertices
       // Vertex 4 The first barb
       this.pushVertex(indexedVertices, tip, base,  arrowHeadWidth, arrowHeadSize*1.33);
       // Vertex 5 The base of the arrowhead
       this.pushVertex(indexedVertices, tip, base,  0.0,               arrowHeadSize);
       // Vertex 6 The tip of the arrow and of the vector.
       this.pushVertex(indexedVertices, tip,  base,  0.0,               0.0);
       // Vertex 7 The other barb
       this.pushVertex(indexedVertices, tip, base, -arrowHeadWidth, arrowHeadSize*1.33);

       let baseIndex = 8*narrows;

       // Upper triangle of shaft rectangle
       indexedVertices.pushIndex(baseIndex);
       indexedVertices.pushIndex(baseIndex+1);
       indexedVertices.pushIndex(baseIndex+2);

       // Lower triangle of shaft rectangle
       indexedVertices.pushIndex(baseIndex+2);
       indexedVertices.pushIndex(baseIndex+1);
       indexedVertices.pushIndex(baseIndex+3);

       // Upper triangle for arrow head
       indexedVertices.pushIndex(baseIndex+4);
       indexedVertices.pushIndex(baseIndex+5);
       indexedVertices.pushIndex(baseIndex+6);

       // Lower triangle for arrow head
       indexedVertices.pushIndex(baseIndex+6);
       indexedVertices.pushIndex(baseIndex+5);
       indexedVertices.pushIndex(baseIndex+7);
     };

     /**
      * Trace a field line starting at the given x, y, z coordinates, generating
      * vectors along the field line.
      * Each step of length ds has components ((fx/f)*ds, (fy/f)*ds, (fz/f)*ds).
      * Vertices is usually a Float32Array of size 3*6*maxVectors.
      *
      * @param f                           A vector valued function. Must implement a getField(x,y,z)
      *                                    method.
      * @param x0, y0, z0                  Start following the field line from these coordinates.
      * @param sign                        Positive if we follow along the field direction, negative if
      *                                    we run contrary to it.
      * @param maxVectors                  The maximum number of arrows to draw. Each arrow requires
      *                                    6 verticies and 10 indices. Or 6*3 + 10 = 28 floating point
      *                                    numbers.
      * @param priorVectors                The number of vectors generated on prior passes through trace.
      *
      * @param {float}           arrowSize Size factor between the electric field and physical coordinates.
      *
      * @param {IndexedVertices} indexedVertices An object holding a vertex list and index list.
      */
     this.trace = function (f, x0, y0, z0, sign, maxVectors, priorVectors, arrowSize, indexedVertices)
     {
       // The distance traversed along the field line.
       var S;
       var fMagnitude;
       var field;
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
         if (fMagnitude === 0)
         {
           // No field here - no possible field line
           break;
         }

         if (S >= nextVector)
         {
           this.generateVector(x,                       y,                       z,
                               field,                   fMagnitude,              lineWidth,
                               arrowHeadSize,           arrowHeadWidth,          arrowSize,
                               priorVectors + nvectors, indexedVertices);
           nextVector = S + Math.max(fMagnitude * vectorSpacing * arrowSize, 1);
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
     };

     this.generateField = function ()
     {
       var i;
       var indexedVertices;
       var nstartPoints;
       var startPoint;

       nstartPoints = startPoints.length;
       nvectors     = 0;

       indexedVertices = new vizit.utility.IndexedVertices(
           vizit.vectorfield.LineRenderer.VERTICES_PER_ARROW*vizit.vectorfield.LineRenderer.FLOATS_PER_VERTEX*maxVectors*nstartPoints,
           12*maxVectors*nstartPoints
       );

       for(i=0; i<nstartPoints; i++)
       {
         startPoint    = startPoints[i];
         startPoint[4] = nvectors;
         // Compute the vectors from this field line, and load them into indexedVertices
         nvectors += this.trace(f,          startPoint[0], startPoint[1], startPoint[2],   startPoint[3],
                                maxVectors, nvectors,      arrowSize,     indexedVertices);
       }

       return indexedVertices;
     };

     /** Barb to barb width for arrow heads. */
     let arrowHeadWidth = ns.VectorFieldGenerator.DEFAULT_ARROW_HEAD_WIDTH;
     /** The base to tip size for the arrow heads. */
     let arrowHeadSize  = ns.VectorFieldGenerator.DEFAULT_ARROW_HEAD_SIZE;
     /** The width of the arrow shaft. */
     let lineWidth      = ns.VectorFieldGenerator.DEFAULT_LINE_WIDTH;
     /** Scale factor between the electric field and physical coordinates. */
     let arrowSize      = ns.VectorFieldGenerator.DEFAULT_ARROW_SIZE;
     let startPoints    = new Array();
     /** Each point represents a distance ds along the field line traced to generate the vectors */
     let ds             = ns.VectorFieldGenerator.DEFAULT_DS;
     let f              = f_;
     /** The maximum number of vectors to be drawn per field line. */
     let maxVectors     = ns.VectorFieldGenerator.DEFAULT_MAX_VECTORS;
     let vectorSpacing  = ns.VectorFieldGenerator.DEFAULT_VECTOR_SPACING;
   };

   ns.VectorFieldGenerator.DEFAULT_ARROW_HEAD_WIDTH = 10.0;
   ns.VectorFieldGenerator.DEFAULT_ARROW_HEAD_SIZE  = 10.0;
   ns.VectorFieldGenerator.DEFAULT_ARROW_SIZE       = 4.0;
   ns.VectorFieldGenerator.DEFAULT_LINE_WIDTH       = 2.0;
   ns.VectorFieldGenerator.DEFAULT_DS               = 0.33;
   ns.VectorFieldGenerator.DEFAULT_MAX_VECTORS      = 5;
   ns.VectorFieldGenerator.DEFAULT_VECTOR_SPACING   = 1.2;

}(window.vizit.vectorfield));


