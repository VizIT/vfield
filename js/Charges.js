"use strict";

/**
 *  Copyright 2013-2014 Vizit Solutions
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

window.vizit               = window.vizit               || {};
window.vizit.electricfield = window.vizit.electricfield || {};

(function (ns)
 {
   /**
    * Represents a single charge in a set of charges
    * A charge has position and a charge in stat-Columbs.
    *
    * @param {Double} [fieldLineDensity] The ratio of field lines to charge.
    * @param {Double} [nfieldLines]      Min number of field lines to generate. With fieldLineDensity
    *                                    = 0, the number of field lines are fixed. Useful for showing
    *                                    explicit vectors, which indicate field strength by changing
    *                                    the magnitude of the vectors.
    * @param {string} [name]             A unique identifier for this element of the
    *                                    visualization.
    *
    * @class
    */
   ns.Charge = function (x_, y_, z_, charge_, fieldLineDensity_, nfieldLines_, name_)
   {
       var charge;
       /** Whether this has been modified since the last render. */
       var modified;
       var name;
       /** Min number of field lines to generate. */
       var nfieldLines;
       var position;
       var fieldLineDensity;
       var r2;

       this.setCharge          = function (charge_)
       {
	 charge   = charge_;
	 modified = true;
       }

       this.getCharge          = function ()
       {
	 return charge;
       }

       this.setPosition        = function (position)
       {
	 position = position;
	 modified = true;
       }

       this.getPosition        = function ()
       {
	 return position;
       }

       this.setNfieldLines     = function (n)
       {
	 nfieldLines = n;
	 modified    = true;
       }

       this.getNfieldLines     = function ()
       {
	 return nfieldLines;
       }

       this.setModified        = function (modified_)
       {
	 modified = modified_;
       }

       this.isModified         = function ()
       {
	 return modified;
       }

       this.setName            = function (name_)
       {
	 name = name_;
       }

       this.getName            = function ()
       {
	 return name;
       }

       this.getField           = function (x, y, z)
       {
	 var deltaX;
	 var deltaY;
	 var deltaZ;

	 // Magnitude of the field vector
	 var f;
	 // The field vector
	 var field   = new Array(0, 0, 0);
	 var r;
	 //var r2;

	 deltaX      = x - position[0];
	 deltaY      = y - position[1];
	 deltaZ      = z - position[2];

	 r2          = deltaX*deltaX + deltaY*deltaY + deltaZ*deltaZ;
	 if (r2 <= 0)
	 {
	   return field;
	 }
	 r           = Math.sqrt(r2);
	 f           = charge/r2;
	 // Similar triangles allows easy distribution of the field into vector components.
	 field[0]    = f * deltaX / r;
	 field[1]    = f * deltaY / r;
	 field[2]    = f * deltaZ / r;

	 return field;
       }

       /**
	* Compute the start points for field lines due to the presence of this charge.
	* 
	* @param {Integer} pho The densiy of field lines per unit charge.
	*/
       this.getFieldSeedPointsI = function (fieldLineDensity)
       {
	 var increment;
	 var nlines;
	 var offset;
	 var phi;
	 var r;
	 var seedPoints;
	 var sgn;
	 var y;

	 increment  = 2.39996323 //Math.PI * (3- Math.sqrt(5))
	 seedPoints = new Array();
	 sgn        = charge > 0 ? 1 : charge < 0 ? -1 : 0;
	 nlines     = Math.round(fieldLineDensity * charge * sgn);
	 offset     = 2/nlines;


	 for (var i = 0; i< nlines; i++)
	 {
	   y   = i * offset - 1 + (offset / 2);
	   r   = Math.sqrt(1 - y*y);
	   phi = i * increment;
	   seedPoints.push(new Array(Math.cos(phi)*r + position[0],
				     y               + position[1],
				     Math.sin(phi)*r + position[2],
				     sgn));
	 }
	 return seedPoints;
       }

       /**
	* Compute the start points for field lines due to the presence of this charge.
	* 
	* @param {Double} phi0   The angle about the z axis for the first start point.
	* @param {Double} radius The distance from the center for the start points.
	*/
       this.getStartPoints = function (phi0, radius)
       {
	 var nlines;
	 var phi;
	 var r;
	 var s;
	 var seedPoints;
	 var sgn;
	 var y;

	 sgn        = charge > 0 ? 1 : charge < 0 ? -1 : 0;
	 nlines     = Math.round(fieldLineDensity * charge * sgn) - 1 + nfieldLines;
	 s          = 3.6 / Math.sqrt(nlines);
	 phi        = typeof phi0   === 'undefined' ? Math.PI / 2 : phi0;
	 radius     = typeof radius === 'undefined' ? 1           : radius;
	 seedPoints = new Array();

	 if (nlines > 0)
	 {
	   // seedPoints.push(new Array(0, -radius, 0, sgn));
	   for (var i=1; i<nlines; i++)
	   {
	     y   = -1.0 + 2.0 * i / (nlines);
	     r   = Math.sqrt(1.0 - y*y);
	     phi = phi + s / r;
	     seedPoints.push(new Array(Math.cos(phi)*r*radius + position[0],
				       y*radius               + position[1],
				       Math.sin(phi)*r*radius + position[2],
				       sgn));
	   }
	   //seedPoints.push(new Array(0, radius, 0, sgn));
	 }

	 return seedPoints;
       }

       this.shouldStop      = function (sgn, x, y, z)
       {
	 var minR2;

	 minR2  = 4;

	 // If we are tracing a field line forward to a positive charge
	 // or backwards to a negative charge, skip the computation.
	 // This corresponds to tracing a field line from a negative charge
	 // to a negative charge, or from a positive charge to a positive
	 // charge - where the field line should not terminate.

	 return sgn * charge < 0.0 && r2 < minR2;
       }

       charge           = charge_;
       modified         = true;
       name             = name_;
       position         = new Array(x_, y_, z_);
       fieldLineDensity = typeof fieldLineDensity_ === 'undefined' ? 0 : fieldLineDensity_;
       nfieldLines      = typeof nfieldLines_      === 'undefined' ? 0 : nfieldLines_;
   }

   /**
    * A collection of charges, both point charges and charge distributions.
    */
   ns.Charges = function ()
   {
       var charges;
       var distributions;
       var ncharges;
       var ndistributions;

       /**
	* Add a charge to the configuration of charges represented by
	* this object. Defined here so we can use it in the constructor.
	*/
       this.addCharge = function (charge)
       {
	 ncharges = charges.push(charge);
	 return this;
       }

       // If any charges are passed into the constructor, add them immediatly
       // to the set.
       for (var i=0; i<arguments.length; i++)
       {
	 this.addCharge(arguments[i]);
       }

       this.getNcharges = function ()
       {
	 return ncharges;
       }

       this.getCharges = function ()
       {
	 return charges;
       }

       this.addDistribution = function (distribution)
       {
	 ndistributions = distributions.push(distribution);
	 return this;
       }

       this.getNdistributions = function ()
       {
	 return ndistributions;
       }

       this.getDistributions  = function ()
       {
	 return distributions;
       }

       this.chargesModified   = function ()
       {
	 var modified;

	 modified = false;

	 for (i=0; i<ncharges && !modified; i++)
	 {
	   modified = modified || charges[i].isModified();
	 }

	 return modified;
       }

       this.distributionsModified = function ()
       {
	 var modified;

	 modified = false;

	 for (i=0; i<ndistributions && !modified; i++)
	 {
	   modified = modified || distributions[i].isModified();
	 }

	 return modified;
       }

       this.isModified            = function ()
       {
	 return this.chargesModified() || this.distributionsModified();
       }

       this.setModified         = function (modified)
       {
	 for (i=0; i<ncharges; i++)
	 {
	   charges[i].setModified(modified);
	 }

	 for (i=0; i<ndistributions; i++)
	 {
	   distributions[i].setModified(modified);
	 }
       }

       /**
	* Get start points using, for now, preset values of phi0 and r
	*/
       this.getStartPoints = function (phi0, r0)
       {
	 var i;
	 var phi    = phi0;
	 var dphi   = 1.57079632679/(ncharges+1);
	 var points = new Array();
	 var charge;

	 for(i=0; i<ncharges; i++)
	 {
	   charge = charges[i];
	   points = points.concat(charge.getStartPoints(phi, r0));
	   phi   += dphi;
	 }

	 for (i=0; i<ndistributions; i++)
	 {
	   points = points.concat(distributions[i].getStartPoints());
	 }

	 return points;
       }

       /**
	* Comnpute the field at x, y, z resulting from our charge
	* configuration.
	*/
       this.getField = function (x, y, z)
       {
	 var charge;
	 // Field from the current charge
	 var currentField;
	 // The field vector
	 var field          = new Array(0, 0, 0);

	 for(var i=0; i<ncharges; i++)
	 {
	   charge         = charges[i];

	   currentField   = charge.getField(x, y, z);
	   field[0]      += currentField[0];
	   field[1]      += currentField[1];
	   field[2]      += currentField[2];
	 }

	 for (i=0; i<ndistributions; i++)
	 {
	   currentField   = distributions[i].getField(x, y, z);
	   field[0]      += currentField[0];
	   field[1]      += currentField[1];
	   field[2]      += currentField[2];
	 }

	 return field;
       }

       /**
	* Determine if tracing a field line should stop.
	*
	* @param {double} sgn
	*
	* @param {double} x
	*
	* @param {double} y
	*
	* @param {double} z
	*
	*/
       this.shouldStop    = function (sgn, x, y, z)
       {
	 var charge;
	 var should;

	 should = false;

	 for(var i=0; i<ncharges & !should; i++)
	 {
	   charge = charges[i];
	   should = charge.shouldStop(sgn, x, y, z);
	 }
	 return should;
       }

       ncharges      = 0;
       charges       = new Array();
       distributions = new Array();
   }
}(window.vizit.electricfield));
