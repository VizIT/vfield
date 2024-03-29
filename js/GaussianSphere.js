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

"use strict";

window.vizit               = window.vizit               || {};
window.vizit.electricfield = window.vizit.electricfield || {};

(function (ns)
 {
   /**
    * Represent a Gaussian sphere. This is a Gaussian surface, it will be drawn but will
    * have no effect on the field. The sphere of radius r is centered at (x, y, z).
    *
    * @param {string} [name]            A unique identifier for this element of the
    *                                   visualization.
    *
    * @class
    */
   ns.GaussianSphere = function (x_, y_, z_, r_, name_)
   {
     var color;
     /** Whether we should render this surface. */
     var enabled;
     var modelViewMatrix;
     var name;
     var radius;
     var x0;
     var y0;
     var z0;

     this.setColor            = function (color_)
     {
       color = color_;
     };

     this.getColor            = function ()
     {
       return color;
     };
     
     this.setEnabled = function(enabled_)
     {
         enabled = vizit.utility.toBoolean(enabled_);
     };
     
     this.isEnabled = function()
     {
         return enabled;
     };

     this.setX               = function (x_)
     {
       x0 = x_;
       return this;
     };

     this.getX               = function ()
     {
       return x0;
     };

     this.setY               = function (y_)
     {
       y0 = y_;
       return this;
     };

     this.getY               = function ()
     {
       return y0;
     };

     this.setZ               = function (z_)
     {
       z0 = z_;
       return this;
     };

     this.getZ               = function ()
     {
       return z0;
     };

     this.setR               = function (r_)
     {
       radius = r_;
       return this;
     };

     this.getR               = function ()
     {
       return radius;
     };

     this.setName            = function (name_)
     {
       name = name_;
     };

     this.getName            = function ()
     {
       return name;
     };

     this.getModelView       = function (scale)
     {
       if (typeof scale === "undefined")
       {
         scale = 1.0;
       }
       if (typeof modelViewMatrix === "undefined")
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
     };

     this.drawFullSurface      = function (glUtility,           program,              surfaceGeometryBuffer,
                                           surfaceNormalBuffer, surfaceIndicesBuffer, nindices)
     {
       var gl;

       gl       = glUtility.getGLContext();
       glUtility.bindBuffer(surfaceGeometryBuffer, program.getPositionHandle(), 3, gl.FLOAT, 0, 0);
       glUtility.bindBuffer(surfaceNormalBuffer,   program.getNormalHandle(),   3, gl.FLOAT, 0, 0);

       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, surfaceIndicesBuffer);
       gl.drawElements(gl.TRIANGLES, nindices, gl.UNSIGNED_SHORT, 0);
     };

     /**
      * Render this gaussian sphere
      *
      * @param {vizit.utility.GLUtility} glUtility General utility and container for the WebGL context
      * @param {vizit.electricfield.SurfaceRenderer} surfaceRenderer Class for rendering a general surface,
      *                                                              of which this is one case.
      */
     this.render      = function (glUtility, surfaceRenderer)
     {
       if (enabled)
       {
         var gl;
         var intrinsicRadius;
         var vertices;

         gl              = glUtility.getGLContext();
         intrinsicRadius = this.getIntrinsicRadius();
         vertices        = this.getVertexBuffers(glUtility);

         gl.uniformMatrix4fv(surfaceRenderer.getModelViewMatrixHandle(), false, this.getModelView(radius/intrinsicRadius));

         gl.uniform4f(surfaceRenderer.getSurfaceColorHandle(), color.getRed(),
                      color.getGreen(),                color.getBlue(), color.getAlpha());

         gl.cullFace(gl.FRONT);
         this.drawFullSurface(glUtility,        surfaceRenderer,            vertices.vertices, vertices.normals,
                              vertices.indices, this.getNindices());

         gl.cullFace(gl.BACK);
         this.drawFullSurface(glUtility,        surfaceRenderer,            vertices.vertices, vertices.normals,
                              vertices.indices, this.getNindices());
       }
     };

     // Gaussian (neutral) surfaces are grey
     color   = new vizit.utility.Color(0.5, 0.5, 0.5, 0.50);
     enabled = true;
     name    = name_;
     radius  = r_;
     x0      = x_;
     y0      = y_;
     z0      = z_;
   };

   /**
    * gaussianSphere extends the GeometryEngine.sphere class.
    */
   ns.GaussianSphere.prototype = new vizit.geometry.Sphere();

}(window.vizit.electricfield));
