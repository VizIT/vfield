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

window.vizit         = window.vizit         || {};
window.vizit.utility = window.vizit.utility || {};

(function (ns)
 {
   /**
    * Prototype for charged line and charged cylinder. Render an arbitrary cylinderical
    * charge with arbitrary inner and outer radai. For a charged line the inner radius will
    * be zero, and the outer radius will be small. This will not compute the field.
    * This is really a hollow tube now as for the charge distributions we don't draw
    * the end caps as they would block off the end of a hollow cylinder.
    *
    * @class
    */
   ns.Cylinder = function ()
   {
     /** Working copy of the MV matrix, used to incorporate scale w/o altering the original. */
     var modelViewWorking;
     /** Color object with red, green, blue, and alpha. */
     var color;

     this.setColor            = function (color_)
     {
       color = color_;
     }

     this.getColor            = function ()
     {
       return color;
     }

     /**
      * Generate a model view matrix to place the standard unit cylinder model 
      * into the scene.
      * TODO: Need better approach for the nested cylinders used to draw solids.
      *
      * @param {Double} tx     The x position of the center of the cylinder.
      * @param {Double} ty     The y position of the center of the cylinder.
      * @param {Double} tz     The z position of the center of the cylinder.
      * @param {Double} height The height of the cylinder.
      * @param {Double} r      The radius of the cylinder.
      * @param {Double} phi    The angle of rotation about the y axis.
      * @param {Double} theta  The angle of rotation about the z axis.
      */
     this.getCylinderModelView       = function (tx, ty, tz, height, r, phi, theta)
     {
       var cphi;
       var ctheta;
       var modelViewMatrix;
       var sphi;
       var stheta;

       stheta              = Math.sin(theta);
       ctheta              = Math.cos(theta);
       sphi                = Math.sin(phi);
       cphi                = Math.cos(phi);

       modelViewMatrix     = new Float32Array(16);
       // Column 1:
       modelViewMatrix[0]  = r*cphi*ctheta;
       modelViewMatrix[1]  = r*ctheta*sphi;
       modelViewMatrix[2]  = -r*stheta;
       modelViewMatrix[3]  = 0.0;
       // Column 2:
       modelViewMatrix[4]  = -r*sphi;
       modelViewMatrix[5]  = r*cphi;
       modelViewMatrix[6]  = 0.0;
       modelViewMatrix[7]  = 0.0;
       // Column 3:
       modelViewMatrix[8]  = height*cphi*stheta;
       modelViewMatrix[9]  = height*sphi*stheta;
       modelViewMatrix[10] = height*ctheta;
       modelViewMatrix[11] = 0.0;
       // Column 4:
       modelViewMatrix[12] = tx;
       modelViewMatrix[13] = ty;
       modelViewMatrix[14] = tz;
       modelViewMatrix[15] = 1.0;

       return modelViewMatrix;
     }

     /**
      * Transform a set of points by the same ModelView matrix as used by the cylinder.
      * Great for transforming automatically generated field start points.
      */
     this.transformPoints       = function (modelView, h, r, points)
     {
       var npoints;
       var i;
       var point;
       var x;
       var y;
       var z;

       // Most of the fields we just copy, those with r dependancies
       // are multipleied by the scale factor.
       modelViewWorking[0]  = modelView[0]  * r;
       modelViewWorking[1]  = modelView[1]  * r;
       modelViewWorking[2]  = modelView[2]  * r;
       modelViewWorking[3]  = modelView[3];
       modelViewWorking[4]  = modelView[4]  * r;
       modelViewWorking[5]  = modelView[5]  * r;
       modelViewWorking[6]  = modelView[6]  * r;
       modelViewWorking[7]  = modelView[7];
       modelViewWorking[8]  = modelView[8]  * h;
       modelViewWorking[9]  = modelView[9]  * h;
       modelViewWorking[10] = modelView[10] * h;
       modelViewWorking[11] = modelView[11];
       modelViewWorking[12] = modelView[12];
       modelViewWorking[13] = modelView[13];
       modelViewWorking[14] = modelView[14];
       modelViewWorking[15] = modelView[15];

       for (i=0, npoints=points.length; i<npoints; i++)
       {
	 point    = points[i];
	 x        = point[0];
	 y        = point[1];
	 z        = point[2];

	 point[0] = modelViewWorking[0]*x + modelViewWorking[4]*y + modelViewWorking[8]*z  + modelViewWorking[12];
	 point[1] = modelViewWorking[1]*x + modelViewWorking[5]*y + modelViewWorking[9]*z  + modelViewWorking[13];
	 point[2] = modelViewWorking[2]*x + modelViewWorking[6]*y + modelViewWorking[10]*z + modelViewWorking[14];
       }

       return points;
     }

     this.setupBuffers          = function (glUtility,           surfaceProgram,       surfaceGeometryBuffer,
					   surfaceNormalBuffer, surfaceIndicesBuffer)
     {
       var gl;

       gl = glUtility.getGLContext();
       glUtility.bindBuffer(surfaceGeometryBuffer, surfaceProgram.getPositionHandle(), 3, gl.FLOAT, 0, 0);
       glUtility.bindBuffer(surfaceNormalBuffer,   surfaceProgram.getNormalHandle(),   3, gl.FLOAT, 0, 0);
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, surfaceIndicesBuffer);
     }

     this.drawCap               = function (gl, nindices, offset)
     {
       gl.drawElements(gl.TRIANGLE_FAN, nindices, gl.UNSIGNED_SHORT, offset*2);
     }

     this.drawSide              = function (gl, nindices, offset)
     {
       gl.drawElements(gl.TRIANGLE_STRIP, nindices, gl.UNSIGNED_SHORT, offset*2);

     }

     this.drawCylinder          = function (glUtility, surfaceProgram, modelView,
					   nsegments, drawCaps)
     {
       var gl;

       gl = glUtility.getGLContext();

       gl.uniformMatrix4fv(surfaceProgram.getModelViewMatrixHandle(), false, modelView);

       if (drawCaps)
       {
	 // This draws the top cap
	 this.drawCap(gl, nsegments+2, 0);
       }

       // This draws the side, connecting the caps
       this.drawSide(gl, 2*nsegments+2, nsegments+2);

       if (drawCaps)
       {
	 // This draws the bottom cap
	 this.drawCap(gl, nsegments+2, 3*nsegments+4);
       }
     }

     /**
      * Render a full cylinder as an assemblage of parts, including rearward and forward facing halves,
      * multiple radii, and optionally end caps.
      */
     this.fullRender                = function (glUtility, surfaceProgram, modelView, h, r0, r1, drawCaps)
     {
       var gl;
       var i;
       var nindices;
       var nsegments;
       var r;
       var rBase;
       var scale;
       var vertices;

       gl        = glUtility.getGLContext();
       rBase     = this.getBaseRadius();
       vertices  = this.getVertexBuffers(glUtility);

       gl.uniform4f(surfaceProgram.getSurfaceColorHandle(), color.getRed(),
		    color.getGreen(),                       color.getBlue(), color.getAlpha());

       // For an n segmented cylinder, nindices=4n+6
       nindices  = this.getNindices();
       nsegments = (nindices-6)/4;

       this.setupBuffers(glUtility,        surfaceProgram,   vertices.vertices,
			 vertices.normals, vertices.indices);

       // These components are independant of scale, just copy once.
       modelViewWorking[3]  = modelView[3];
       modelViewWorking[7]  = modelView[7];
       modelViewWorking[8]  = modelView[8]  * h;
       modelViewWorking[9]  = modelView[9]  * h;
       modelViewWorking[10] = modelView[10] * h;
       modelViewWorking[11] = modelView[11];
       modelViewWorking[12] = modelView[12];
       modelViewWorking[13] = modelView[13];
       modelViewWorking[14] = modelView[14];
       modelViewWorking[15] = modelView[15];

       gl.cullFace(gl.FRONT);
       for (r=r1; r>=r0; r--)
       {
	 scale = r/rBase;
	 modelViewWorking[0]  = modelView[0] * scale;
	 modelViewWorking[1]  = modelView[1] * scale;
	 modelViewWorking[2]  = modelView[2] * scale;

	 modelViewWorking[4]  = modelView[4] * scale;
	 modelViewWorking[5]  = modelView[5] * scale;
	 modelViewWorking[6]  = modelView[6] * scale;

	 this.drawCylinder(glUtility, surfaceProgram, modelViewWorking, nsegments, drawCaps);
       }

       gl.cullFace(gl.BACK);
       for (r=r0; r<=r1; r++)
       {
	 scale = r/rBase;
	 modelViewWorking[0]  = modelView[0] * scale;
	 modelViewWorking[1]  = modelView[1] * scale;
	 modelViewWorking[2]  = modelView[2] * scale;

	 modelViewWorking[4]  = modelView[4] * scale;
	 modelViewWorking[5]  = modelView[5] * scale;
	 modelViewWorking[6]  = modelView[6] * scale;

	 this.drawCylinder(glUtility, surfaceProgram, modelViewWorking, nsegments, drawCaps);
       }
     }

     /**
      * Translates a cylinder to be centered at the origin.
      */
     this.translateBounds = function (cylinder, x0, y0, z0, x1, y1, z1)
     {

       var tx, ty, tz;

       tx = (x0 + x1) / 2;
       ty = (y0 + y1) / 2;
       tz = (z0 + z1) / 2;

       x0  -= tx;
       y0  -= ty;
       z0  -= tz;
       x1  -= tx;
       y1  -= ty;
       z1  -= tz;

       cylinder.setTx(tx)
	       .setTy(ty)
	       .setTz(tz)
	       .setX0(x0)
	       .setY0(y0)
	       .setZ0(z0)
	       .setX1(x1)
	       .setY1(y1)
	       .setZ1(z1);
     }

     this.sign             = function (x)
     {
       return x < 0 ? -1 : 1;
     }

     /**
      * Find phi, the rotation about the z-axis.
      */
     this.zAxisRotation        = function (cylinder, x0, y0, x1, y1)
     {
       var deltax;
       var deltay;
       var phi;
       var sgn;

       deltay = y1 - y0;
       deltax = x1 - x0;
       phi    = Math.atan2(deltay,deltax);

       sgn = this.sign(x1);
       x0  = -sgn*Math.sqrt(x0*x0 + y0*y0);
       y0  = 0;
       x1  = -x0;
       y1  = 0;

       cylinder.setX0(x0)
	       .setY0(y0)
	       .setX1(x1)
	       .setY1(y1)
	       .setPhi(phi);
     }

     /**
      * Find and undo theta, the rotation about the y axis for a cylinder
      * centered at the origin;
      */
     this.yAxisRotation    = function (cylinder, x0, y0, z0, x1, y1, z1)
     {
       var r;
       var sgn;
       var theta;

       r     = Math.sqrt(x0*x0 + y0*y0 + z0*z0);
       theta = Math.acos(z1/r);
       sgn   = this.sign(z1);

       z0    = -sgn*r;
       z1    =  sgn*r;
       x0    =  0;
       x1    =  0;

       cylinder.setZ0(z0)
	       .setZ1(z1)
	       .setX0(x0)
	       .setX1(x1)
	       .setTheta(theta);
     }

     /**
      * Height scale - we already have the radius.
      */
     this.scale            = function (cylinder, z0, z1)
     {
	 var height;
	 var sgn;

	 sgn    = this.sign(z1);
	 height = z1-z0;
	 cylinder.setZ0(-sgn*0.5)
		 .setZ1( sgn*0.5)
		 .setHeight(height);
     }

     // populated in the rendering method
     modelViewWorking = new Float32Array(16);
   }

   /**
    * Cylinder extends the GeometryEngine.cylinder class.
    */
   ns.Cylinder.prototype = new vizit.geometry.Cylinder();

}(window.vizit.utility));