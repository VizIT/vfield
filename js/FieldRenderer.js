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

window.vizit       = window.vizit       || {};
window.vizit.field = window.vizit.field || {};

(function (ns)
 {
   /**
    * Common functionality for the various representations of a vector field.
    *
    * @param {HTMLCanvasElement} drawingSurface_ An HTML canvas onto which
    *                                            we render the model.
    *
    * @class
    */
   ns.FieldRenderer = function (drawingSurface_)
   {
     /* Global variables within this field renderer. */
     /** HTML Canvas element we render on */
     var drawingSurface;
     /** Mappings from names to elements of the visualization. */
     var elementNames;
     /** Event handler for standard mouse and touch events */
     var eventHandler;
     /** [Vx, Vy, Vz] = f(x, y, z) */
     var f;
     var glUtility;
     /** Do not rerender in response to an event until after we are initialized. */
     var initialized;
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
     /** Start points for tracing field lines. */
     var startPoints;

     this.getContext          = function ()
     {
       return glUtility.getGLContext();
     };

     this.setRenderer         = function (renderer_)
     {
       renderer = renderer_;
       renderer.setGlUtility(glUtility);
       renderer.setModelViewMatrix(modelViewMatrix);
       renderer.setProjectionMatrix(projectionMatrix);
     };

     this.setModelViewMatrix = function (modelViewMatrix_)
     {
       modelViewMatrix = modelViewMatrix_;
       renderer.setModelViewMatrix(modelViewMatrix);
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
       renderer.setProjectionMatrix(projectionMatrix);
       this.render();
     };

     this.zoomBy = function (delta)
     {
       this.setScale(scale+delta);
     };

     this.setElementName     = function (element, name)
     {
       elementNames[name] = element;
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
     drawingSurface.addEventListener("mousewheel", eventHandler.handleMouseWheel.bind(eventHandler), false);
     drawingSurface.addEventListener("mousedown",  eventHandler.handleMouseDown.bind(eventHandler),  false);
     document.addEventListener("mouseup",          eventHandler.handleMouseUp.bind(eventHandler),    false);
     document.addEventListener("mousemove",        eventHandler.handleMouseMove.bind(eventHandler),  false);
     drawingSurface.addEventListener("touchstart", eventHandler.handleTouchStart.bind(eventHandler), false);
     drawingSurface.addEventListener("touchmove",  eventHandler.handleTouchMove.bind(eventHandler),  false);
     drawingSurface.addEventListener("touchend",   eventHandler.handleTouchEnd.bind(eventHandler),   false);
   };
 }(window.vizit.field));
