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

// Define the global namespace root iff not already defined.
window.vizit         = window.vizit         || {};
window.vizit.builder = window.vizit.builder || {};

(function (ns)
 {
   /**
    * Build one or more surface from a configuration.
    *
    * @class
    */
   ns.SurfaceBuilder = function ()
   {
     var errorMessage;
     var xMin, xMax;
     var yMin, yMax;
     var zMin, zMax;
     var warningMessage;

     this.getXMin = function ()
     {
       return xMin;
     };

     this.getXMax = function ()
     {
       return xMax;
     };
      
     this.getYMin = function ()
     {
       return yMin;
     };

     this.getYMax = function ()
     {
       return yMax;
     };
      
     this.getZMin = function ()
     {
       return zMin;
     };

     this.getZMax = function ()
     {
       return zMax;
     };

     this.gaussianCylinderBuilder = function (config)
     {
       var gaussianCylinder;
       /** The name of this element */
       var name;
       var property;
       /** The coordinates of the center of the cylinder */
       var x, y, z;
       /** Its height. */
       var h;
       /** The radius. */
       var r;
       /** The angle of rotation about the y axis. */
       var phi;
       /** The angle of rotation about the z axis. */
       var theta;

       for (property in config)
       {
         if (property.toLowerCase() === "x")
         {
           x = config[property];
         }
         else if (property.toLowerCase() === "y")
         {
           y = config[property];
         }
         else if (property.toLowerCase() === "z")
         {
           z = config[property];
         }
         else if (property.toLowerCase() === "h")
         {
           h = config[property];
         }
         else if (property.toLowerCase() === "r")
         {
           r = config[property];
         }
         else if (property.toLowerCase() === "phi")
         {
           phi = config[property];
         }
         else if (property.toLowerCase() === "theta")
         {
           theta = config[property];
         }
         else if (property.toLowerCase() === "name")
         {
           name = config[property];
         }
       }

       xMin = Math.min(xMin, x-r, x+r);
       xMax = Math.max(xMax, x-r, x+r);

       yMin = Math.min(yMin, y-r, y-r);
       yMax = Math.max(yMax, y-r, y+r);

       zMin = Math.min(zMin, z-h, z+h);
       zMax = Math.max(zMax, z-h, z+h);

       gaussianCylinder = new vizit.electricfield.GaussianCylinder(x, y, z,
                                                                   h, r,
                                                                   phi, theta,
                                                                   name);

       return gaussianCylinder;
     };


     this.gaussianSphereBuilder = function (config)
     {
       var gaussianSphere;
       var name;
       var property;
       /** The coordinates of the center of the sphere. */
       var x, y, z;
       /** The radius of the sphere. */
       var r;

       for (property in config)
       {
         if (property.toLowerCase() === "x")
         {
           x = config[property];
         }
         else if (property.toLowerCase() === "y")
         {
           y = config[property];
         }
         else if (property.toLowerCase() === "z")
         {
           z = config[property];
         }
         else if (property.toLowerCase() === "r")
         {
           r = config[property];
         }
         else if (property.toLowerCase() === "name")
         {
           name = config[property];
         }
       }
       xMin = Math.min(xMin, x-r, x+r);
       xMax = Math.max(xMax, x-r, x+r);

       yMin = Math.min(yMin, y-r, y-r);
       yMax = Math.max(yMax, y-r, y+r);

       zMin = Math.min(zMin, z-r, z+r);
       zMax = Math.max(zMax, z-r, z+r);

       gaussianSphere = new vizit.electricfield.GaussianSphere(x, y, z, r, name);

       return gaussianSphere;
     };

     /**
      * Build a single surface. Peek at the surface type and dispatch
      * the config to the appropriate builder.
      */
     this.surfaceBuilder       = function (config)
     {
       var gaussianCylinderRE;
       var gaussianSphereRE;
       var property;
       var surface;
       var type;

       gaussianCylinderRE = /\s*gaussian\s*cylinder\s*/i;
       gaussianSphereRE   = /\s*gaussian\s*sphere\s*/i;

       for (property in config)
       {
         if(property.toLowerCase() === "type")
         {
           type = config[property];
           break;
         }
       }

       if (type.match(gaussianCylinderRE))
       {
         surface = this.gaussianCylinderBuilder(config);
       }
       else if (type.match(gaussianSphereRE))
       {
         surface = this.gaussianSphereBuilder(config);
       }

       return surface;
     };

     /**
      * Build one or more surfaces according to whether the config is an
      * array or a single object. The renderer must have an addGaussianSurface
      * method.
      *
      * @param   {object|Array} Configuraction object fo a single surface or
      *                         array of surfaces.
      */
     this.build      = function (config, renderer, framework)
     {
       var surface;
       var nsurfaces;

       if (!!config)
       {
         if (Array.isArray(config))
         {
           nsurfaces = config.length;
           for (var i=0; i<nsurfaces; ++i)
           {
             surface = this.surfaceBuilder(config[i], framework);
             // Only add surface if surfaceBuilder was successful
             if (!!surface)
             {
               renderer.addGaussianSurface(surface);
               name = surface.getName();
               if (name)
               {
                 framework.setElementName(surface, name);
               }
             }
           }
         }
         else
         {
           surface = this.surfaceBuilder(config);
           // Only add surface if surfaceBuilder was successful
           if (!!surface)
           {
             renderer.addGaussianSurface(surface);
             name = surface.getName();
             if (name)
             {
               // TODO Error handling if name already defined.
               framework.setElementName(surface, name);
             }
           }
         }
       }
       return renderer;
     };
   };
 }(window.vizit.builder));
