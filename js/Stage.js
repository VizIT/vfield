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

window.vizit       = window.vizit       || {};
window.vizit.field = window.vizit.field || {};

(function (ns)
 {
   /**
    * Common functionality for the various representations of a vector field. Or indeed,
    * arbitrary WebGL based interactions.
    *
    * @param {HTMLElement} drawingSurface_ An HTML canvas onto which
    *                                            we render the model.
    *
    * @class
    */
   ns.Stage = function (drawingSurface_)
   {
     /* Global variables within this field renderer. */
     /** HTML Canvas element we render on */
     var drawingSurface;
     /** Mappings from names to elements of the visualization. */
     var elementNames;
     /** Event handler for standard mouse and touch events */
     var eventHandler;
     var glUtility;
     /** Model-View matrix for use in all programs. */
     var modelViewMatrix;
     /** The specific program that controls the OpenGL. */
     var normalMatrix;
     var projectionMatrix;
     /** Track if we are rendering a frame. */
     var renderer;
     var rendering;
     /** Scale sets the bounds used in the projection matrix. */
     var scale;

     this.getContext          = function ()
     {
       return glUtility.getGLContext();
     };

     /**
      * Register a listener for projection and model view matrix changes.
      * @param {object} renderer_ Expected to have setModelViewMatrix and setProjectionMatrix methods
      */
     this.registerRenderer         = function (renderer_)
     {
       renderer = renderer_;
       return this;
     };

     this.getRenderer        = function()
     {
       return renderer;
     };

     this.setModelViewMatrix = function (modelViewMatrix_)
     {
       modelViewMatrix = modelViewMatrix_;
       renderer.setModelViewMatrix(modelViewMatrix);
       return this;
     };

     this.getModelViewMatrix = function ()
     {
       return modelViewMatrix;
     };

     this.requestRender      = function ()
     {
       if (!rendering)
       {
         rendering = true;
         requestAnimationFrame(this.render);
       }
     };

     this.render             = function ()
     {
       renderer.render();
       rendering = false;
     };

     this.start              = function ()
     {
       renderer.start();
     };

     this.setScale           = function (scale_)
     {
       scale = scale_;
       if (scale < 1)
       {
         scale = 1;
       }
       // We project a scale x scale x scale cube into normalized device space.
       projectionMatrix     = glUtility.generateOrthographicMatrix(scale, scale, -scale, scale);
       if (renderer)
       {
         renderer.setProjectionMatrix(projectionMatrix);
         this.render();
       }
       return this;
     };

     this.getProjectionMartix = function()
     {
       return projectionMatrix;
     }

     this.zoomBy = function (delta)
     {
       this.setScale(scale+delta);
       return this;
     };

     this.setElementName     = function (element, name)
     {
       elementNames[name] = element;
       return this;
     };

     this.getElementByName   = function (name)
     {
       var element;

       if (elementNames.hasOwnProperty(name))
       {
           element=elementNames[name];
       }

       return element;
     };

     this.getGlUtility = function()
     {
       return glUtility;
     }

     drawingSurface   = drawingSurface_;
     elementNames     = new Object();
     glUtility        = new vizit.utility.GLUtility(drawingSurface);
     scale            = 5;

     // Initially an identity matrix, modified by movementEventHandler.
     modelViewMatrix  = new Float32Array([1, 0, 0, 0,
                                          0, 1, 0, 0,
                                          0, 0, 1, 0,
                                          0, 0, 0, 1]);

     normalMatrix     = new Float32Array([1, 0, 0,
                                          0, 1, 0,
                                          0, 0, 1]);

     projectionMatrix = glUtility.generateOrthographicMatrix(scale, scale, -scale, scale);

     // motionEventHandler(target_, utility_, mouseScale_, pinchScale_)
     eventHandler     = new vizit.utility.MotionEventHandler(this, glUtility, 75, 4);
     drawingSurface.addEventListener("mousewheel",     eventHandler.handleMouseWheel.bind(eventHandler), false);
     drawingSurface.addEventListener("DOMMouseScroll", eventHandler.handleMouseWheel.bind(eventHandler), false);
     drawingSurface.addEventListener("mousedown",      eventHandler.handleMouseDown.bind(eventHandler),  false);
     document.addEventListener("mouseup",              eventHandler.handleMouseUp.bind(eventHandler),    false);
     document.addEventListener("mousemove",            eventHandler.handleMouseMove.bind(eventHandler),  false);
     drawingSurface.addEventListener("touchstart",     eventHandler.handleTouchStart.bind(eventHandler), false);
     drawingSurface.addEventListener("touchmove",      eventHandler.handleTouchMove.bind(eventHandler),  false);
     drawingSurface.addEventListener("touchend",       eventHandler.handleTouchEnd.bind(eventHandler),   false);
   };
 }(window.vizit.field));
