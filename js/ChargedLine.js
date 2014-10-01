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
    * A segment of an infinite charged line. Represented as a line from
    * (x0, y0, z0) to (x1, y1, z1) with linear charge density chargeDensity.
    * The number of field lines drawn is fieldLineDensity*chargeDensity*length.
    *
    * @param {Double}x0_                The x coordinate one end cap of the cylinder.
    * @param {Double}y0_                The y coordinate one end cap of the cylinder.
    * @param {Double}z0_                The z coordinate one end cap of the cylinder.
    * @param {Double}x1_                The x coordinate for the other end cap of the cylinder.
    * @param {Double}y1_                The y coordinate for the other end cap of the cylinder.
    * @param {Double}z1_                The z coordinate for the other end cap of the cylinder.
    * @param {Double}[chargeDensity]    The linear charge density on the line.
    * @param {Double}[fieldLineDensity] The proportionality between field lines and charge.
    * @param {Double}[nfieldLines]      Min number of field lines to generate. With fieldLineDensity
    *                                   = 0, the number of field lines are fixed. Useful for showing
    *                                   explicit vectors, which indicate field strength by changing
    *                                   the magnitude of the vectors.
    * @param {string}[name]             A unique identifier for this element of the
    *                                   visualization.
    *
    * @class
    */
   ns.ChargedLine = function (x0_, y0_, z0_, x1_, y1_, z1_,
                              chargeDensity_, fieldLineDensity_, nfieldLines_, name_)
   {
     var chargeDensity;
     /** Container for r,g,b,a color values. */
     var color;
     /** The density of field line per unit charge. */
     var fieldLineDensity;
     var height;
     /** Transforms the base cylinder to the r=r1 cylinder. */
     var modelViewMatrix;
     /** Whether this has been modified since the last render. */
     var modified;
     var name;
     /** Min number of field lines to generate. */
     var nfieldLines;
     /** Rotation angles around the y and z axes */
     var phi, theta;
     /** The inner and outer radius of the cylinder. */
     var r0, r1;
     /**
      * Translation of the rectangle from the origin.
      * tx: Translation in the x direction
      * ty: Translation in the y direction
      * tz: Translation in the z direction
      */
     var tx, ty, tz;
     /** The coordinates of an end cap of the cylinder. */
     var x0, y0, z0;
     /** The coordinates of the other end cap of the cylinder. */
     var x1, y1, z1;
     /** (x1,y1,z1) - (x0, y0, z0) used to find the normal */
     var x10, y10, z10;
     /** |(x1,y1,z1) - (x0, y0, z0)| used to find the normal */
     var mag10;


     this.setHeight           = function (height_)
     {
       height   = height_;
       modified = true;
     }

     this.getHeight           = function ()
     {
       return height;
     }

     this.setTx               = function (t)
     {
       tx       = t;
       modified = true;
       return this;
     }

     this.getTx               = function ()
     {
       return tx;
     }

     this.setTy               = function (t)
     {
       ty = t;
       return this;
     }

     this.getTy               = function ()
     {
       return ty;
     }

     this.setTz               = function (t)
     {
       tz       = t;
       modified = true;
       return this;
     }

     this.getTz               = function ()
     {
       return tz;
     }

     this.setX0               = function (x_)
     {
       x0       = x_;
       modified = true;
       return this;
     }

     this.getX0               = function ()
     {
       return x0;
     }

     this.setY0               = function (y_)
     {
       y0       = y_;
       modified = true;
       return this;
     }

     this.getY0               = function ()
     {
       return y0;
     }

     this.setZ0               = function (z_)
     {
       z0       = z_;
       modified = true;
       return this;
     }

     this.getZ0               = function ()
     {
       return z0;
     }

     this.setX1               = function (x_)
     {
       x1       = x_;
       modified = true;
       return this;
     }

     this.getX1               = function ()
     {
       return x1;
     }

     this.setY1               = function (y_)
     {
       y1       = y_;
       modified = true;
       return this;
     }

     this.getY1               = function ()
     {
       return y1;
     }

     this.setZ1               = function (z_)
     {
       z1       = z_;
       modified = true;
       return this;
     }

     this.getZ1               = function ()
     {
       return z1;
     }

     this.setR0               = function (r_)
     {
       r0       = r_;
       modified = true;
       return this;
     }

     this.getR0               = function ()
     {
       return r0;
     }

     this.setR1               = function (r_)
     {
       r1       = r_;
       modified = true;
       return this;
     }

     this.getR1               = function ()
     {
       return r1;
     }

     this.setPhi              = function (phi_)
     {
       phi      = phi_;
       modified = true;
       return this;
     }

     this.getPhi              = function ()
     {
       return phi;
     }

     this.setTheta            = function (theta_)
     {
       theta    = theta_;
       modified = true;
       return this;
     }

     this.getTheta           = function ()
     {
       return theta;
     }

     this.setNfieldLines     = function (n)
     {
       nfieldLines = n;
       modified    = true;
       return this;
     }

     this.getNfieldLines     = function ()
     {
       return nfieldLines;
     }

     this.setModified        = function (modified_)
     {
       modified = modified_;
       return this;
     }

     this.isModified         = function ()
     {
       return modified;
     }

     this.setName            = function (name_)
     {
       name = name_;
       return this;
     }

     this.getName            = function ()
     {
       return name;
     }

     /**
      * Create a set of start points along the base line charge, then transform them
      * with the model view to get the true location in the scene.
      */
     this.getStartPoints     = function ()
     {
       /** The separation between sets of field lines. */
       var ds;
       var npoints;
       var s;
       var sgn;
       /** sin(Pi/4) */
       var sinpi4;
       var startPoints;

       sinpi4      = 0.707106781;
       startPoints = new Array();

       if (fieldLineDensity + nfieldLines !== 0)
       {
	 sgn         = this.sign(chargeDensity);

	 npoints     = Math.max(2, Math.round(Math.abs(chargeDensity*fieldLineDensity*height)))
		      + nfieldLines;
	 s           = -0.5;
	 ds          = 1/(npoints-1);

	 for (var i=0; i<npoints; i++)
	 {
	   startPoints.push(new Array(    1.0,     0.0, s, sgn));
	   startPoints.push(new Array(   -1.0,     0.0, s, sgn));
	   startPoints.push(new Array(    0.0,     1.0, s, sgn));
	   startPoints.push(new Array(    0.0,    -1.0, s, sgn));
	   startPoints.push(new Array( sinpi4,  sinpi4, s, sgn));
	   startPoints.push(new Array( sinpi4, -sinpi4, s, sgn));
	   startPoints.push(new Array(-sinpi4, -sinpi4, s, sgn));
	   startPoints.push(new Array(-sinpi4,  sinpi4, s, sgn));
	   s += ds;
	 }
       }

       return this.transformPoints(modelViewMatrix,             height/this.getBaseHeight(),
				   (r0+1)/this.getBaseRadius(), startPoints);
     }

     /**
      * Get a normal to P0P1 through P2; Effeciency is important as this
      * computes the field repeatedly, for example at every point along
      * a field line.
      */
     this.getNormal          = function (x2, y2, z2)
     {
       // The normal from the line to P2
       var n;
       // u = (P0-P2) dot (P1-P0)/ |P1-P0|**2 From P3 = P0 + u(P1 - P0),
       // and P2P3 is a line perpendicular to P0P1 through P2.
       var u;
       // Point on P0P1 nearest to P2.
       var x3, y3, z3;
       // Components in the (x0, y0, z0) - (x2, y2, z2) vector
       var x02, y02, z02;

       n = {};

       x02 = x0 - x2;
       y02 = y0 - y2;
       z02 = z0 - z2;

       u = -(x02*x10 + y02*y10 + z02*z10)/(mag10*mag10);
       x3  = x0 + u*(x10);
       y3  = y0 + u*(y10);
       z3  = z0 + u*(z10);

       n.x = x2 - x3;
       n.y = y2 - y3;
       n.z = z2 - z3;

       return n;
     }

     this.getField            = function (x, y, z)
     {
       var f, fmag;
       var n, nmag;

       n    = this.getNormal(x,y,z);
       nmag = Math.sqrt(n.x*n.x + n.y*n.y + n.z*n.z);

       f    = new Array(3);
       fmag = 2*chargeDensity/nmag;

       f[0] = fmag * n.x/nmag;
       f[1] = fmag * n.y/nmag;
       f[2] = fmag * n.z/nmag;

       return f;
     }

     this.render                 = function (glUtility, surfaceProgram)
     {
       this.fullRender(glUtility, surfaceProgram, modelViewMatrix, height, r0, r1, false);
     }

     chargeDensity = typeof chargeDensity_ === 'undefined' ? 0 : chargeDensity_;

     if (chargeDensity > 0)
     {
       color = new Color(0.05, 0.05, 0.8, 0.80);
     }
     else if (chargeDensity < 0)
     {
       color = new Color(0.8, 0.05, 0.05, 0.80);
     }
     else
     {
       // Neutral surfaces are grey
       color = new Color(0.5, 0.5, 0.5, 0.80);
     }

     this.setColor(color);

     modified         = true;
     name             = name_;
     fieldLineDensity = typeof fieldLineDensity_ === 'undefined' ? 0 : fieldLineDensity_;
     nfieldLines      = typeof nfieldLines_      === 'undefined' ? 0 : nfieldLines_;
     // Stock radius for a charged line.
     r0               = 0;
     r1               = 3;
     x0               = x0_;
     y0               = y0_;
     z0               = z0_;
     x1               = x1_;
     y1               = y1_;
     z1               = z1_;

     this.translateBounds(this, x0, y0, z0, x1, y1, z1);
     this.zAxisRotation(this, x0, y0, x1, y1);
     this.yAxisRotation(this, x0, y0, z0, x1, y1, z1);
     this.scale(this, z0, z1);

     // Restore these after the transformation is done.
     x0               = x0_;
     y0               = y0_;
     z0               = z0_;
     x1               = x1_;
     y1               = y1_;
     z1               = z1_;

     modelViewMatrix  = this.getCylinderModelView(tx, ty, tz, this.getBaseHeight(), this.getBaseRadius(), phi, theta);
     x10              = x1-x0;
     y10              = y1-y0;
     z10              = z1-z0;
     mag10            = Math.sqrt(x10*x10 + y10*y10 + z10*z10);
   }

   /**
    * chargedLine extends cylinder.
    */
   ns.ChargedLine.prototype = new Cylinder();

}(window.vizit.electricfield));
