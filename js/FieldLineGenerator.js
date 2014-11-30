"use strict";

/*
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

// Define the global namespaces iff not already defined.
window.vizit               = window.vizit               || {};
window.vizit.electricfield = window.vizit.electricfield || {};

(function (ns)
 {
   /**
    * Compute a field line from a given starting point for a configuration
    * of point charges and charge distributions. The expectation is that
    * the object will be reused to compute field lines for multiple start
    * points, which will be immediatly loaded as VBOs onto the GPU.
    *
    * @param {Charges} charges       A collection of point charges and charge
    *                                distributions.
    *
    * @param {double}  maxPoints     The maximum number of steps, of lendth ds, taken
    *                                along a field line.
    *
    * @param {double}  ds            Step size for tracing field lines.
    *
    * @parma {double}  arrowHeadSize Lines for the directional arrows are
    *                                drawn with this length.
    *
    * @param {double}  arrowSpacing  ds increments by this much between
    *                                directional arrows.
    *
    */
   ns.FieldLineGenerator = function (charges_, maxPoints_, ds_, arrowHeadSize_, arrowSpacing_)
   {
       // Lines that make up the arrow are drawn with this length.
       var arrowHeadSize;
       // The sum of ds along the path increments by this much between arrows.
       var arrowSpacing;
       // Each point represents a distance ds along the field line.
       var ds;
       // The charge configuration we are drawing the field lines for.
       var charges;
       // Container for generated field line and direction indicators.
       var fieldLine;
       // The maximum number of points along the line to trace.
       var maxPoints;

       this.setCharges   = function (charges_)
       {
	 charges = charges_;
	 return this;
       };

       this.getCharges   = function ()
       {
	 return charges;
       };

       this.getArrows    = function ()
       {
	 return arrows;
       };

       this.setMaxPoints = function (maxPoints_)
       {
	 if (maxPoints_ > maxpoints)
	 {
	   fieldLine     = new vizit.electricfield.FieldLine(maxPoints);
	 }
	 maxPoints = maxPoints_;
	 return this;
       };

       this.getMaxPoints = function ()
       {
	 return maxPoints;
       };

       this.setArrowHeadSize    = function (size)
       {
	 arrowHeadSize = size;
	 return this;
       };

       this.getArrowHeadSize    = function ()
       {
	 return arrowHeadSize;
       };

       this.setArrowSpacing = function (spacing)
       {
	 arrowSpacing = spacing;
	 return this;
       };

       this.getArrowSpacing = function ()
       {
	 return arrowSpacing;
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
	* Generate two lines as an arrow head along the field line indicating the
	* direction of the electric field.
	*/
       this.drawArrow          = function (x0, y0, z0, field, f, arrowHeadSize, fieldLine)
       {
	 var asx;
	 var asy;
	 var asz;
	 var exnorm;
	 var eynorm;
	 var eznorm;
	 // A vector normal to the Electric field.
	 var nx;
	 var ny;
	 var nz;
	 var resize;
	 var x1;
	 var y1;
	 var z1;
	 var x2;
	 var y2;
	 var z2;

	 exnorm = field[0]/f;
	 eynorm = field[1]/f;
	 eznorm = field[2]/f;

	 if (eznorm !== 0)
	 {
	   // Start with nx, ny = 1, then E dot n = 0 gives
	   nx     = 1;
	   ny     = 1;
	   nz     = -(field[0]+field[1])/field[2];
	 }
	 else if (eynorm !== 0)
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
	 resize = arrowHeadSize/Math.sqrt(nx*nx + ny*ny + nz*nz);

	 nx     = nx*resize;
	 ny     = ny*resize;
	 nz     = nz*resize;

	 asx    = arrowHeadSize*exnorm;
	 asy    = arrowHeadSize*eynorm;
	 asz    = arrowHeadSize*eznorm;

	 x1     = x0 - asx + nx;
	 y1     = y0 - asy + ny;
	 z1     = z0 - asz + nz;

	 x2     = x0 - asx - nx;
	 y2     = y0 - asy - ny;
	 z2     = z0 - asz - nz;

	 fieldLine.pushArrow(x1, y1, z1, x0, y0, z0, x2, y2, z2);
       };

     /**
      * Trace a field line starting at the given x, y, z coordinates.
      * Each step of length ds has components (Ex/E*ds, Ey/E*ds, Ez/E*ds).
      * points is usually a Float32Array of size 3*maxPoints. Trace along
      * or against the field according to sgn.
      *
      * @parma {double} sgn  Whether to trace the line along (+1.0) or
      *                      in opposition to (-1.0) the electric field.
      */
     this.generate = function (x0, y0, z0, sgn)
     {
       // The distance traversed along the field line since the last arrow was drawn.
       var deltaS;
       var f;
       var field;
       var i;
       // The vector function thinks we are at a sink and should stop tracing a field line.
       var shouldStop;
       var x;
       var y;
       var z;

       deltaS     = 0;
       shouldStop = false;
       x          = x0;
       y          = y0;
       z          = z0;
       fieldLine.reset();

       for(i=0; i<maxPoints && !shouldStop; i++)
       {
	 fieldLine.pushPoint(x, y, z);
	 field = charges.getField(x, y, z);
	 f     = Math.sqrt(field[0] * field[0] + field[1] * field[1] + field[2] * field[2]);

	 if (f === 0)
	 {
	   // No field here - no possible field line
	   break;
	 }

	 x      += sgn * field[0]/f * ds;
	 y      += sgn * field[1]/f * ds;
	 z      += sgn * field[2]/f * ds;

	 deltaS += ds;

	 if (deltaS > arrowSpacing)
	 {
	   deltaS = 0;
	   this.drawArrow(x, y, z, field, f, arrowHeadSize, fieldLine);
	 }

	 shouldStop = charges.shouldStop(sgn, x, y, z);
       }
       return fieldLine;
     };

     arrowHeadSize = arrowHeadSize_;
     arrowSpacing  = arrowSpacing_;
     charges       = charges_;
     ds            = ds_;
     maxPoints     = maxPoints_;
     fieldLine     = new vizit.electricfield.FieldLine(maxPoints);
   };
 }(window.vizit.electricfield));
